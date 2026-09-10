"use server"

import { createClient } from "@/lib/supabase/server"
import { type ApplicationWithDetails } from "../applications/actions"

export interface SourceMetricItem {
  name: string
  applied: number
  interview: number
  offer: number
  rate: number // percentage
  color: string
}

export interface PositionMetricItem {
  position: string
  applied: number
  interview: number
  rate: number
}

export interface InsightRuleItem {
  type: "success" | "opportunity" | "speed"
  title: string
  text: string
}

export interface InsightsStatsData {
  totalApplications: number
  interviewCount: number
  interviewRate: number
  offerCount: number
  offerRate: number
  acceptanceRate: number
  avgTimeToInterviewDays: number | null
  avgTimeToOfferDays: number | null
  sources: SourceMetricItem[]
  positions: PositionMetricItem[]
  evaluations: InsightRuleItem[]
}

export async function getInsightsStatsAction(): Promise<{
  success: boolean
  data?: InsightsStatsData
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

    // 1. Fetch applications
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

    // 2. Fetch application events
    let events: {
      application_id: string
      event_date: string
      stage: { slug: string; position: number }
    }[] = []

    if (appIds.length > 0) {
      const { data: eventsData } = await supabase
        .from("application_events")
        .select(`
          application_id,
          event_date,
          stage:pipeline_stages(slug, position)
        `)
        .in("application_id", appIds)
        .order("event_date", { ascending: true })

      if (eventsData) {
        events = eventsData as unknown as typeof events
      }
    }

    const totalApplications = applications.length

    // Track which apps reached interview and offer
    const interviewSlugs = ["hr-interview", "user-interview", "final-interview"]
    const appsWithInterview = new Set<string>()
    const appsWithOffer = new Set<string>()
    const appsAccepted = new Set<string>()

    // Record first interview event date and offer date per application for time calculation
    const firstInterviewDateMap: Record<string, string> = {}
    const firstOfferDateMap: Record<string, string> = {}

    events.forEach((ev) => {
      if (ev.stage && interviewSlugs.includes(ev.stage.slug)) {
        appsWithInterview.add(ev.application_id)
        if (!firstInterviewDateMap[ev.application_id]) {
          firstInterviewDateMap[ev.application_id] = ev.event_date
        }
      }
      if (ev.stage && ev.stage.slug === "offer") {
        appsWithOffer.add(ev.application_id)
        if (!firstOfferDateMap[ev.application_id]) {
          firstOfferDateMap[ev.application_id] = ev.event_date
        }
      }
    })

    // Also verify current stage/status
    applications.forEach((a) => {
      if (a.stage && interviewSlugs.includes(a.stage.slug)) {
        appsWithInterview.add(a.id)
      }
      if (a.status === "Offer" || a.stage?.slug === "offer") {
        appsWithOffer.add(a.id)
      }
      if (a.status === "Accepted" || a.stage?.slug === "accepted") {
        appsAccepted.add(a.id)
      }
    })

    const interviewCount = appsWithInterview.size
    const offerCount = appsWithOffer.size
    const acceptedCount = appsAccepted.size

    const interviewRate =
      totalApplications > 0
        ? Math.round((interviewCount / totalApplications) * 1000) / 10
        : 0

    const offerRate =
      totalApplications > 0
        ? Math.round((offerCount / totalApplications) * 1000) / 10
        : 0

    const acceptanceRate =
      offerCount > 0
        ? Math.round((acceptedCount / offerCount) * 1000) / 10
        : 0

    // -------------------------------------------------------------
    // AVERAGE TIME TO INTERVIEW & AVERAGE TIME TO OFFER (Days)
    // -------------------------------------------------------------
    const interviewDurations: number[] = []
    const offerDurations: number[] = []

    applications.forEach((app) => {
      const appDate = new Date(app.application_date).getTime()

      if (firstInterviewDateMap[app.id]) {
        const intDate = new Date(firstInterviewDateMap[app.id]).getTime()
        const days = Math.max(0, Math.round((intDate - appDate) / (1000 * 60 * 60 * 24)))
        interviewDurations.push(days)
      }

      if (firstOfferDateMap[app.id]) {
        const offDate = new Date(firstOfferDateMap[app.id]).getTime()
        const days = Math.max(0, Math.round((offDate - appDate) / (1000 * 60 * 60 * 24)))
        offerDurations.push(days)
      }
    })

    const avgTimeToInterviewDays =
      interviewDurations.length > 0
        ? Math.round((interviewDurations.reduce((a, b) => a + b, 0) / interviewDurations.length) * 10) / 10
        : null

    const avgTimeToOfferDays =
      offerDurations.length > 0
        ? Math.round((offerDurations.reduce((a, b) => a + b, 0) / offerDurations.length) * 10) / 10
        : null

    // -------------------------------------------------------------
    // APPLICATIONS BY SOURCE
    // -------------------------------------------------------------
    const sourceMap: Record<string, { applied: number; interview: number; offer: number }> = {}

    applications.forEach((app) => {
      const src = app.source?.trim() || "Lainnya"
      if (!sourceMap[src]) {
        sourceMap[src] = { applied: 0, interview: 0, offer: 0 }
      }
      sourceMap[src].applied++
      if (appsWithInterview.has(app.id)) {
        sourceMap[src].interview++
      }
      if (appsWithOffer.has(app.id)) {
        sourceMap[src].offer++
      }
    })

    const paletteColors = [
      "#be185d", // rich berry rose
      "#9d174d", // deep rose
      "#78350f", // warm amber brown
      "#92400e", // mocha
      "#b45309", // caramel
      "#451a03", // dark espresso
    ]

    const sources: SourceMetricItem[] = Object.entries(sourceMap)
      .map(([name, stat], idx) => ({
        name,
        applied: stat.applied,
        interview: stat.interview,
        offer: stat.offer,
        rate: stat.applied > 0 ? Math.round((stat.interview / stat.applied) * 1000) / 10 : 0,
        color: paletteColors[idx % paletteColors.length],
      }))
      .sort((a, b) => b.applied - a.applied)

    // -------------------------------------------------------------
    // APPLICATIONS BY POSITION / ROLE
    // -------------------------------------------------------------
    const positionMap: Record<string, { applied: number; interview: number }> = {}

    applications.forEach((app) => {
      const pos = app.position.trim()
      if (!positionMap[pos]) {
        positionMap[pos] = { applied: 0, interview: 0 }
      }
      positionMap[pos].applied++
      if (appsWithInterview.has(app.id)) {
        positionMap[pos].interview++
      }
    })

    const positions: PositionMetricItem[] = Object.entries(positionMap)
      .map(([position, stat]) => ({
        position,
        applied: stat.applied,
        interview: stat.interview,
        rate: stat.applied > 0 ? Math.round((stat.interview / stat.applied) * 1000) / 10 : 0,
      }))
      .sort((a, b) => b.applied - a.applied)
      .slice(0, 6)

    // -------------------------------------------------------------
    // RULE-BASED FUNNEL EVALUATIONS (Deterministic, strictly focused on conversion rates)
    // -------------------------------------------------------------
    const evaluations: InsightRuleItem[] = []

    if (totalApplications === 0) {
      evaluations.push({
        type: "opportunity",
        title: "Mulai Petualangan Lamaran",
        text: "Belum ada berkas lamaran yang dicatat. Mulai catat lowongan yang kamu minati untuk mengaktifkan analisis performa konversi!",
      })
    } else {
      // 1. Interview Rate Evaluation
      if (interviewRate >= 30) {
        evaluations.push({
          type: "success",
          title: "Performa Interview Sangat Baik",
          text: `Rasio panggilan interview kamu mencapai ${interviewRate}%, melampaui rata-rata industri umum (10% - 20%). CV dan portofolio kamu sangat menarik minat recruiter!`,
        })
      } else if (interviewRate > 0) {
        evaluations.push({
          type: "opportunity",
          title: "Optimasi Rasio Panggilan Interview",
          text: `Rasio panggilan interview kamu berada di angka ${interviewRate}%. Sesuaikan kata kunci di CV dengan kualifikasi lowongan untuk meningkatkan konversi screening.`,
        })
      } else {
        evaluations.push({
          type: "opportunity",
          title: "Menunggu Panggilan Pertama",
          text: `Dari ${totalApplications} lamaran yang dikirim, belum ada yang masuk tahap interview. Pastikan lowongan yang kamu tuju sesuai dengan profil atau coba perluas sumber referral.`,
        })
      }

      // 2. Offer Rate Evaluation
      if (offerRate >= 10) {
        evaluations.push({
          type: "success",
          title: "Konversi Penawaran Kerja Impresif",
          text: `Tingkat perolehan offer mencapai ${offerRate}% dari seluruh lamaran diajukan. Kesiapan kamu dalam wawancara dan negosiasi terbukti sangat solid.`,
        })
      } else if (offerCount > 0) {
        evaluations.push({
          type: "success",
          title: "Pencapaian Offering Diraih",
          text: `Kamu telah berhasil meraih ${offerCount} penawaran kerja (${offerRate}% konversi). Pertimbangkan kecocokan budaya dan kompensasi sebelum finalisasi.`,
        })
      } else {
        evaluations.push({
          type: "opportunity",
          title: "Fokus Menembus Tahap Akhir",
          text: "Belum ada penawaran resmi (Offer) yang tercatat. Maksimalkan persiapan sesi user interview dan technical assessment untuk mengunci offering letter.",
        })
      }

      // 3. Speed / Cycle Time Evaluation
      if (avgTimeToInterviewDays !== null) {
        evaluations.push({
          type: "speed",
          title: "Kecepatan Respons Recruiter",
          text: `Rata-rata waktu dari pengiriman berkas hingga interview pertama adalah ${avgTimeToInterviewDays} hari. Perusahaan merespons profilmu dengan relatif sigap.`,
        })
      }
    }

    return {
      success: true,
      data: {
        totalApplications,
        interviewCount,
        interviewRate,
        offerCount,
        offerRate,
        acceptanceRate,
        avgTimeToInterviewDays,
        avgTimeToOfferDays,
        sources,
        positions,
        evaluations,
      },
    }
  } catch (err) {
    return {
      success: false,
      error: "Terjadi kesalahan saat memproses data insights analitik.",
    }
  }
}
