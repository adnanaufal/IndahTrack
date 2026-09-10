"use server"

import { createClient } from "@/lib/supabase/server"
import { type ApplicationWithDetails } from "../applications/actions"

export interface DashboardStatsData {
  userName: string
  kpi: {
    totalApplications: number
    activeApplications: number
    interviewsCount: number
    offersCount: number
    rejectedCount: number
    acceptedCount: number
  }
  trendData: {
    date: string
    label: string
    count: number
  }[]
  statusDistribution: {
    name: string
    value: number
    color: string
  }[]
  funnel: {
    stage: string
    count: number
    conversionRate: number
    color: string
  }[]
  recentApplications: ApplicationWithDetails[]
  followupAgenda: {
    id: string
    companyName: string
    position: string
    type: "interview" | "stale_followup"
    scheduledAt?: string
    meetingUrl?: string
    notes?: string
    daysInactive?: number
    label: string
    urgency: "urgent" | "today" | "upcoming"
  }[]
}

export async function getDashboardStatsAction(): Promise<{
  success: boolean
  data?: DashboardStatsData
  error?: string
}> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "Kamu harus login terlebih dahulu ya." }
    }

    // 1. Fetch user profile for personal greeting
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .maybeSingle()

    const userName = profile?.full_name || "Indah"

    // 2. Fetch all user applications with company and stage
    const { data: appsData, error: appsError } = await supabase
      .from("applications")
      .select(`
        *,
        company:companies(id, name, logo_url, location),
        stage:pipeline_stages(id, name, slug, stage_type, position)
      `)
      .eq("user_id", user.id)
      .order("application_date", { ascending: false })

    if (appsError) {
      return { success: false, error: appsError.message }
    }

    const applications = (appsData as unknown as ApplicationWithDetails[]) || []
    const appIds = applications.map((a) => a.id)

    // 3. Fetch all application events to inspect historical progression
    let events: { application_id: string; stage: { slug: string; position: number } }[] = []
    if (appIds.length > 0) {
      const { data: eventsData } = await supabase
        .from("application_events")
        .select(`
          application_id,
          stage:pipeline_stages(slug, position)
        `)
        .in("application_id", appIds)

      if (eventsData) {
        events = eventsData as unknown as typeof events
      }
    }

    // 4. Fetch scheduled interviews
    let interviewsList: {
      id: string
      application_id: string
      scheduled_at: string
      meeting_url: string | null
      interviewer: string | null
      notes: string | null
    }[] = []
    if (appIds.length > 0) {
      const { data: interviewsData } = await supabase
        .from("interviews")
        .select("*")
        .in("application_id", appIds)
        .order("scheduled_at", { ascending: true })

      if (interviewsData) {
        interviewsList = interviewsData
      }
    }

    // 5. Fetch pending follow-ups
    let followUpsList: {
      id: string
      application_id: string
      title: string
      due_at: string | null
    }[] = []
    const { data: followUpsData } = await supabase
      .from("follow_ups")
      .select("id, application_id, title, due_at")
      .eq("user_id", user.id)
      .eq("status", "Pending")
      .order("due_at", { ascending: true, nullsFirst: false })

    if (followUpsData) {
      followUpsList = followUpsData
    }

    // -------------------------------------------------------------
    // KPI CALCULATIONS (Consistent Sprint 7 Business Logic)
    // -------------------------------------------------------------
    const totalApplications = applications.length
    const activeApplications = applications.filter((a) => a.status === "Active").length

    // Interview: ever reached HR Interview, User Interview, or Final Interview
    const interviewSlugs = ["hr-interview", "user-interview", "final-interview"]
    const appIdsWithInterview = new Set<string>()

    events.forEach((ev) => {
      if (ev.stage && interviewSlugs.includes(ev.stage.slug)) {
        appIdsWithInterview.add(ev.application_id)
      }
    })

    // Also check current stage
    applications.forEach((a) => {
      if (a.stage && interviewSlugs.includes(a.stage.slug)) {
        appIdsWithInterview.add(a.id)
      }
    })
    const interviewsCount = appIdsWithInterview.size

    // Offer: ever reached Offer
    const appIdsWithOffer = new Set<string>()
    events.forEach((ev) => {
      if (ev.stage && ev.stage.slug === "offer") {
        appIdsWithOffer.add(ev.application_id)
      }
    })
    applications.forEach((a) => {
      if (a.stage && a.stage.slug === "offer") {
        appIdsWithOffer.add(a.id)
      }
      if (a.status === "Offer") {
        appIdsWithOffer.add(a.id)
      }
    })
    const offersCount = appIdsWithOffer.size

    // Rejected: based on current final outcome / status
    const rejectedCount = applications.filter(
      (a) =>
        a.status === "Rejected" ||
        a.status === "Ghosted" ||
        a.status === "Withdrawn" ||
        (a.stage && ["rejected", "ghosted", "withdrawn"].includes(a.stage.slug))
    ).length

    // Accepted: target outcome reached
    const acceptedCount = applications.filter(
      (a) => a.status === "Accepted" || (a.stage && a.stage.slug === "accepted")
    ).length

    // -------------------------------------------------------------
    // TREND DATA (Application activity by date)
    // -------------------------------------------------------------
    const dateCounts: Record<string, number> = {}
    applications.forEach((app) => {
      const d = app.application_date // YYYY-MM-DD
      dateCounts[d] = (dateCounts[d] || 0) + 1
    })

    const sortedDates = Object.keys(dateCounts).sort()
    const trendData = sortedDates.map((date) => {
      const dObj = new Date(date)
      const label = dObj.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
      })
      return {
        date,
        label,
        count: dateCounts[date],
      }
    })

    // -------------------------------------------------------------
    // STATUS DISTRIBUTION
    // -------------------------------------------------------------
    const statusMap = {
      "Sedang Proses": 0,
      "Tahap Interview": 0,
      "Offering Letter": 0,
      "Diterima (Accepted)": 0,
      "Belum Jodoh": 0,
    }

    applications.forEach((a) => {
      if (a.status === "Accepted" || a.stage?.slug === "accepted") {
        statusMap["Diterima (Accepted)"]++
      } else if (a.status === "Offer" || a.stage?.slug === "offer") {
        statusMap["Offering Letter"]++
      } else if (
        a.status === "Rejected" ||
        a.status === "Ghosted" ||
        a.status === "Withdrawn" ||
        ["rejected", "ghosted", "withdrawn"].includes(a.stage?.slug || "")
      ) {
        statusMap["Belum Jodoh"]++
      } else if (
        interviewSlugs.includes(a.stage?.slug || "") ||
        a.stage?.slug === "assessment"
      ) {
        statusMap["Tahap Interview"]++
      } else {
        statusMap["Sedang Proses"]++
      }
    })

    const statusColors: Record<string, string> = {
      "Sedang Proses": "#78350f", // rich warm mocha brown
      "Tahap Interview": "#be185d", // vibrant dusty rose pink
      "Offering Letter": "#d97706", // warm honey amber gold
      "Diterima (Accepted)": "#059669", // emerald victory
      "Belum Jodoh": "#9f1239", // deep ruby berry rose
    }

    const statusDistribution = Object.entries(statusMap)
      .filter(([_, count]) => count > 0)
      .map(([name, value]) => ({
        name,
        value,
        color: statusColors[name] || "#78350f",
      }))

    // -------------------------------------------------------------
    // RECRUITMENT FUNNEL
    // Applied -> Screening -> Interview -> Offer -> Accepted
    // -------------------------------------------------------------
    const screeningCount = new Set<string>()
    events.forEach((ev) => {
      if (ev.stage && (ev.stage.slug === "screening" || ev.stage.position >= 3)) {
        screeningCount.add(ev.application_id)
      }
    })
    applications.forEach((a) => {
      if (a.stage && (a.stage.slug === "screening" || a.stage.position >= 3)) {
        screeningCount.add(a.id)
      }
    })

    const funnelStages = [
      {
        stage: "Lamaran Terkirim (Applied)",
        count: totalApplications,
        color: "#78350f", // rich mocha chocolate
      },
      {
        stage: "Lolos Screening",
        count: screeningCount.size,
        color: "#b45309", // warm caramel amber
      },
      {
        stage: "Panggilan Interview",
        count: interviewsCount,
        color: "#be185d", // vibrant rose pink
      },
      {
        stage: "Offering Letter",
        count: offersCount,
        color: "#d97706", // golden honey
      },
      {
        stage: "Diterima Bekerja",
        count: acceptedCount,
        color: "#059669", // emerald leaf
      },
    ]

    const funnel = funnelStages.map((stg) => {
      const conversionRate =
        totalApplications > 0
          ? Math.round((stg.count / totalApplications) * 1000) / 10
          : 0
      return {
        ...stg,
        conversionRate,
      }
    })

    // -------------------------------------------------------------
    // RECENT APPLICATIONS (5 most recent)
    // -------------------------------------------------------------
    const recentApplications = applications.slice(0, 5)

    // -------------------------------------------------------------
    // FOLLOW-UP & INTERVIEW AGENDA
    // -------------------------------------------------------------
    const followupAgenda: DashboardStatsData["followupAgenda"] = []

    // A. Scheduled Interviews
    const now = new Date()
    interviewsList.forEach((interview) => {
      const app = applications.find((a) => a.id === interview.application_id)
      if (!app) return

      const schedDate = new Date(interview.scheduled_at)
      const diffHours = (schedDate.getTime() - now.getTime()) / (1000 * 60 * 60)

      let urgency: "urgent" | "today" | "upcoming" = "upcoming"
      let label = schedDate.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })

      if (diffHours >= 0 && diffHours <= 24) {
        urgency = "today"
        label = "Hari ini! " + schedDate.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
      } else if (diffHours < 0 && diffHours >= -24) {
        urgency = "urgent"
        label = "Baru Selesai"
      }

      followupAgenda.push({
        id: interview.id,
        companyName: app.company?.name || "Perusahaan",
        position: app.position,
        type: "interview",
        scheduledAt: interview.scheduled_at,
        meetingUrl: interview.meeting_url || undefined,
        notes: interview.notes || undefined,
        label,
        urgency,
      })
    })

    // B. Explicit Follow-up Tasks
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
    const todayEnd = todayStart + 24 * 60 * 60 * 1000

    followUpsList.forEach((item) => {
      const app = applications.find((a) => a.id === item.application_id)
      let urgency: "urgent" | "today" | "upcoming" = "upcoming"
      let label = "Follow-up"

      if (item.due_at) {
        const itemTime = new Date(item.due_at).getTime()
        const dObj = new Date(item.due_at)
        label = dObj.toLocaleDateString("id-ID", { day: "numeric", month: "short" })

        if (itemTime < todayStart) {
          urgency = "urgent"
          label = "Terlewat: " + label
        } else if (itemTime >= todayStart && itemTime < todayEnd) {
          urgency = "today"
          label = "Hari ini!"
        }
      }

      followupAgenda.push({
        id: item.id,
        companyName: app?.company?.name || "Perusahaan",
        position: item.title,
        type: "stale_followup",
        label,
        urgency,
      })
    })

    // C. Stale Applications (> 5 days without updates while active)
    applications.forEach((app) => {
      if (app.status === "Active") {
        const lastUpdated = new Date(app.updated_at || app.application_date)
        const daysDiff = Math.floor(
          (now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24)
        )

        if (daysDiff >= 5) {
          followupAgenda.push({
            id: `stale-${app.id}`,
            companyName: app.company?.name || "Perusahaan",
            position: app.position,
            type: "stale_followup",
            daysInactive: daysDiff,
            label: `${daysDiff} hari tanpa kabar`,
            urgency: daysDiff >= 10 ? "urgent" : "today",
          })
        }
      }
    })

    return {
      success: true,
      data: {
        userName,
        kpi: {
          totalApplications,
          activeApplications,
          interviewsCount,
          offersCount,
          rejectedCount,
          acceptedCount,
        },
        trendData,
        statusDistribution,
        funnel,
        recentApplications,
        followupAgenda: followupAgenda.slice(0, 5),
      },
    }
  } catch (err) {
    return {
      success: false,
      error: "Terjadi kesalahan saat memproses data statistik dashboard.",
    }
  }
}
