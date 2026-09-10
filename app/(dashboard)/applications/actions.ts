"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { applicationSchema, type ApplicationFormInput } from "@/lib/validations/application"

export interface ApplicationWithDetails {
  id: string
  user_id: string
  company_id: string
  position: string
  location: string | null
  employment_type: string | null
  source: string | null
  job_url: string | null
  salary_min: number | null
  salary_max: number | null
  salary_currency: string | null
  application_date: string
  current_stage_id: string
  status: "Active" | "Offer" | "Accepted" | "Rejected" | "Withdrawn" | "Ghosted" | "Completed"
  notes: string | null
  created_at: string
  updated_at: string
  company: {
    id: string
    name: string
    logo_url: string | null
    location: string | null
  }
  stage: {
    id: string
    name: string
    slug: string
    stage_type: "active" | "closed_won" | "closed_lost"
    position: number
  }
}

export interface ApplicationEventItem {
  id: string
  application_id: string
  stage_id: string
  event_date: string
  notes: string | null
  metadata: Record<string, unknown> | null
  created_at: string
  stage: {
    id: string
    name: string
    slug: string
    stage_type: "active" | "closed_won" | "closed_lost"
    position: number
  }
}

export interface InterviewItem {
  id: string
  application_id: string
  interview_type: string | null
  scheduled_at: string
  meeting_url: string | null
  interviewer: string | null
  notes: string | null
  created_at: string
}

export interface FollowUpSummaryItem {
  id: string
  title: string
  description: string | null
  due_at: string | null
  status: "Pending" | "Completed" | "Cancelled"
}

export interface ApplicationDetailData extends ApplicationWithDetails {
  events: ApplicationEventItem[]
  interviews: InterviewItem[]
  follow_ups: FollowUpSummaryItem[]
}

export interface CompanyOption {
  id: string
  name: string
  location?: string | null
}

export interface StageOption {
  id: string
  name: string
  slug: string
  stage_type: "active" | "closed_won" | "closed_lost"
  position: number
}

// 1. Get all applications for the logged in user
export async function getApplicationsAction(): Promise<{
  success: boolean
  data?: ApplicationWithDetails[]
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

    const { data, error } = await supabase
      .from("applications")
      .select(`
        *,
        company:companies(id, name, logo_url, location),
        stage:pipeline_stages(id, name, slug, stage_type, position)
      `)
      .eq("user_id", user.id)
      .order("application_date", { ascending: false })

    if (error) {
      return { success: false, error: error.message }
    }

    return {
      success: true,
      data: (data as unknown as ApplicationWithDetails[]) || [],
    }
  } catch (err) {
    return {
      success: false,
      error: "Terjadi kesalahan saat mengambil daftar lamaran.",
    }
  }
}

// 2. Get single application detail with timeline events & interviews
export async function getApplicationDetailAction(id: string): Promise<{
  success: boolean
  data?: ApplicationDetailData
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

    // Fetch application
    const { data: appData, error: appError } = await supabase
      .from("applications")
      .select(`
        *,
        company:companies(id, name, logo_url, location),
        stage:pipeline_stages(id, name, slug, stage_type, position)
      `)
      .eq("id", id)
      .eq("user_id", user.id)
      .single()

    if (appError || !appData) {
      return { success: false, error: "Lamaran tidak ditemukan." }
    }

    // Fetch timeline events
    const { data: eventsData, error: eventsError } = await supabase
      .from("application_events")
      .select(`
        *,
        stage:pipeline_stages(id, name, slug, stage_type, position)
      `)
      .eq("application_id", id)
      .order("event_date", { ascending: false })

    if (eventsError) {
      return { success: false, error: eventsError.message }
    }

    // Fetch interviews
    const { data: interviewsData } = await supabase
      .from("interviews")
      .select("*")
      .eq("application_id", id)
      .order("scheduled_at", { ascending: false })

    // Fetch follow-ups
    const { data: followUpsData } = await supabase
      .from("follow_ups")
      .select("id, title, description, due_at, status")
      .eq("application_id", id)
      .order("due_at", { ascending: true })

    return {
      success: true,
      data: {
        ...(appData as unknown as ApplicationWithDetails),
        events: (eventsData as unknown as ApplicationEventItem[]) || [],
        interviews: (interviewsData as unknown as InterviewItem[]) || [],
        follow_ups: (followUpsData as unknown as FollowUpSummaryItem[]) || [],
      },
    }
  } catch (err) {
    return {
      success: false,
      error: "Gagal memuat detail lamaran.",
    }
  }
}

// 3. Get list of companies for search autocomplete
export async function getCompaniesAction(): Promise<{
  success: boolean
  data?: CompanyOption[]
  error?: string
}> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("companies")
      .select("id, name, location")
      .order("name", { ascending: true })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data: data || [] }
  } catch (err) {
    return { success: false, error: "Gagal mengambil daftar perusahaan." }
  }
}

// 4. Create a new company on the fly or get existing
export async function createCompanyAction(name: string, location?: string): Promise<{
  success: boolean
  data?: CompanyOption
  error?: string
}> {
  try {
    const trimmed = name.trim()
    if (!trimmed) {
      return { success: false, error: "Nama perusahaan tidak boleh kosong." }
    }

    const normalized = trimmed.toLowerCase()
    const supabase = await createClient()

    const { data: existing } = await supabase
      .from("companies")
      .select("id, name, location")
      .eq("normalized_name", normalized)
      .maybeSingle()

    if (existing) {
      return { success: true, data: existing }
    }

    const { data: created, error } = await supabase
      .from("companies")
      .insert({
        name: trimmed,
        normalized_name: normalized,
        location: location || null,
      })
      .select("id, name, location")
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data: created }
  } catch (err) {
    return { success: false, error: "Gagal menambahkan perusahaan baru." }
  }
}

// 5. Get available pipeline stages
export async function getPipelineStagesAction(): Promise<{
  success: boolean
  data?: StageOption[]
  error?: string
}> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("pipeline_stages")
      .select("id, name, slug, stage_type, position")
      .eq("is_active", true)
      .order("position", { ascending: true })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data: data || [] }
  } catch (err) {
    return { success: false, error: "Gagal mengambil tahapan pipeline." }
  }
}

// 6. Create new application
export async function createApplicationAction(input: ApplicationFormInput): Promise<{
  success: boolean
  data?: { id: string }
  error?: string
}> {
  try {
    const parseResult = applicationSchema.safeParse(input)
    if (!parseResult.success) {
      return {
        success: false,
        error: parseResult.error.issues[0]?.message || "Data input kamu belum valid.",
      }
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "Kamu harus login terlebih dahulu ya." }
    }

    const payload = parseResult.data

    const { data, error } = await supabase
      .from("applications")
      .insert({
        user_id: user.id,
        company_id: payload.companyId,
        position: payload.position,
        application_date: payload.applicationDate,
        current_stage_id: payload.currentStageId,
        location: payload.location || null,
        employment_type: payload.employmentType || null,
        source: payload.source || null,
        job_url: payload.jobUrl || null,
        salary_min: payload.salaryMin,
        salary_max: payload.salaryMax,
        salary_currency: payload.salaryCurrency || "IDR",
        status: payload.status || "Active",
        notes: payload.notes || null,
      })
      .select("id")
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath("/applications")
    revalidatePath("/dashboard")
    revalidatePath("/pipeline")
    revalidatePath("/insights")

    return { success: true, data: { id: data.id } }
  } catch (err) {
    return {
      success: false,
      error: "Terjadi kesalahan saat menyimpan lamaran baru.",
    }
  }
}

// 7. Update existing application
export async function updateApplicationAction(
  id: string,
  input: ApplicationFormInput
): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const parseResult = applicationSchema.safeParse(input)
    if (!parseResult.success) {
      return {
        success: false,
        error: parseResult.error.issues[0]?.message || "Data input kamu belum valid.",
      }
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "Kamu harus login terlebih dahulu ya." }
    }

    const payload = parseResult.data

    const { error } = await supabase
      .from("applications")
      .update({
        company_id: payload.companyId,
        position: payload.position,
        application_date: payload.applicationDate,
        current_stage_id: payload.currentStageId,
        location: payload.location || null,
        employment_type: payload.employmentType || null,
        source: payload.source || null,
        job_url: payload.jobUrl || null,
        salary_min: payload.salaryMin,
        salary_max: payload.salaryMax,
        salary_currency: payload.salaryCurrency || "IDR",
        status: payload.status,
        notes: payload.notes || null,
      })
      .eq("id", id)
      .eq("user_id", user.id)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath("/applications")
    revalidatePath("/dashboard")
    revalidatePath("/pipeline")
    revalidatePath("/insights")

    return { success: true }
  } catch (err) {
    return {
      success: false,
      error: "Terjadi kesalahan saat mengupdate data lamaran.",
    }
  }
}

// 8. Delete application
export async function deleteApplicationAction(id: string): Promise<{
  success: boolean
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

    const { error } = await supabase
      .from("applications")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath("/applications")
    revalidatePath("/dashboard")
    revalidatePath("/pipeline")
    revalidatePath("/insights")

    return { success: true }
  } catch (err) {
    return {
      success: false,
      error: "Terjadi kesalahan saat menghapus lamaran.",
    }
  }
}

// 9. Update Stage & Append Timeline Event (Critical Sprint 5 Logic)
export interface UpdateStageInput {
  applicationId: string
  newStageId: string
  eventDate?: string
  notes?: string
  interview?: {
    scheduledAt: string
    interviewType?: string
    meetingUrl?: string
    interviewer?: string
    notes?: string
  }
}

export async function updateStageAction(input: UpdateStageInput): Promise<{
  success: boolean
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

    // 1. Verify application ownership
    const { data: appData, error: appError } = await supabase
      .from("applications")
      .select("id, current_stage_id, status")
      .eq("id", input.applicationId)
      .eq("user_id", user.id)
      .single()

    if (appError || !appData) {
      return { success: false, error: "Lamaran tidak ditemukan." }
    }

    // 2. Fetch new stage info
    const { data: newStage, error: stageError } = await supabase
      .from("pipeline_stages")
      .select("id, name, slug, stage_type")
      .eq("id", input.newStageId)
      .single()

    if (stageError || !newStage) {
      return { success: false, error: "Tahapan baru tidak valid." }
    }

    // 3. Compute status update based on stage slug
    let updatedStatus = appData.status
    if (newStage.slug === "rejected") {
      updatedStatus = "Rejected"
    } else if (newStage.slug === "withdrawn") {
      updatedStatus = "Withdrawn"
    } else if (newStage.slug === "ghosted") {
      updatedStatus = "Ghosted"
    } else if (newStage.slug === "offer") {
      updatedStatus = "Offer"
    } else if (newStage.slug === "accepted") {
      updatedStatus = "Accepted"
    } else if (newStage.slug === "completed" || newStage.slug === "onboarding") {
      updatedStatus = "Completed"
    } else if (newStage.stage_type === "active") {
      updatedStatus = "Active"
    }

    // 4. Update application's current_stage_id and status
    const { error: updateError } = await supabase
      .from("applications")
      .update({
        current_stage_id: newStage.id,
        status: updatedStatus,
      })
      .eq("id", input.applicationId)
      .eq("user_id", user.id)

    if (updateError) {
      return { success: false, error: updateError.message }
    }

    // 5. Append new timeline event (never overwrite previous history!)
    const eventDate = input.eventDate
      ? new Date(input.eventDate).toISOString()
      : new Date().toISOString()

    const eventNotes =
      input.notes?.trim() ||
      `Berpindah ke tahap ${newStage.name}`

    const metadata: Record<string, unknown> = {
      from_stage_id: appData.current_stage_id,
      to_stage_id: newStage.id,
      stage_slug: newStage.slug,
    }

    if (input.interview) {
      metadata.has_interview = true
      metadata.interview_type = input.interview.interviewType
      metadata.meeting_url = input.interview.meetingUrl
      metadata.interviewer = input.interview.interviewer
    }

    const { error: eventError } = await supabase
      .from("application_events")
      .insert({
        application_id: input.applicationId,
        stage_id: newStage.id,
        event_date: eventDate,
        notes: eventNotes,
        metadata,
      })

    if (eventError) {
      return { success: false, error: eventError.message }
    }

    // 6. Optional: create interview record
    if (input.interview && input.interview.scheduledAt) {
      await supabase.from("interviews").insert({
        application_id: input.applicationId,
        scheduled_at: new Date(input.interview.scheduledAt).toISOString(),
        interview_type: input.interview.interviewType || "video",
        meeting_url: input.interview.meetingUrl || null,
        interviewer: input.interview.interviewer || null,
        notes: input.interview.notes || null,
      })
    }

    revalidatePath("/applications")
    revalidatePath(`/applications/${input.applicationId}`)
    revalidatePath("/dashboard")
    revalidatePath("/pipeline")
    revalidatePath("/insights")

    return { success: true }
  } catch (err) {
    return {
      success: false,
      error: "Terjadi kesalahan saat memindahkan tahapan lamaran.",
    }
  }
}
