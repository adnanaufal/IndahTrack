"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

export interface FollowUpItem {
  id: string
  application_id: string
  user_id: string
  title: string
  description: string | null
  due_at: string | null
  status: "Pending" | "Completed" | "Cancelled"
  completed_at: string | null
  created_at: string
  updated_at: string
  application?: {
    id: string
    position: string
    company?: {
      id: string
      name: string
    }
    stage?: {
      name: string
      slug: string
    }
  }
}

export interface CreateFollowUpInput {
  applicationId: string
  title: string
  description?: string
  dueAt?: string
}

export interface UpdateFollowUpInput {
  id: string
  title: string
  description?: string
  dueAt?: string
  status?: "Pending" | "Completed" | "Cancelled"
}

export interface CreateInterviewInput {
  applicationId: string
  interviewType?: string
  scheduledAt: string
  meetingUrl?: string
  interviewer?: string
  notes?: string
}

// 1. Get all follow-ups for logged in user
export async function getFollowUpsAction(): Promise<{
  success: boolean
  data?: FollowUpItem[]
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
      .from("follow_ups")
      .select(`
        *,
        application:applications(
          id,
          position,
          company:companies(id, name),
          stage:pipeline_stages(name, slug)
        )
      `)
      .eq("user_id", user.id)
      .order("due_at", { ascending: true, nullsFirst: false })

    if (error) {
      return { success: false, error: error.message }
    }

    return {
      success: true,
      data: (data as unknown as FollowUpItem[]) || [],
    }
  } catch (err) {
    return {
      success: false,
      error: "Terjadi kesalahan saat mengambil daftar tugas follow-up.",
    }
  }
}

// 2. Create new follow-up
export async function createFollowUpAction(
  input: CreateFollowUpInput
): Promise<{ success: boolean; data?: { id: string }; error?: string }> {
  try {
    const trimmedTitle = input.title.trim()
    if (!trimmedTitle) {
      return { success: false, error: "Judul follow-up tidak boleh kosong." }
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "Kamu harus login terlebih dahulu ya." }
    }

    const dueAtIso = input.dueAt ? new Date(input.dueAt).toISOString() : null

    const { data, error } = await supabase
      .from("follow_ups")
      .insert({
        application_id: input.applicationId,
        user_id: user.id,
        title: trimmedTitle,
        description: input.description?.trim() || null,
        due_at: dueAtIso,
        status: "Pending",
      })
      .select("id")
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath("/follow-ups")
    revalidatePath("/dashboard")
    revalidatePath(`/applications/${input.applicationId}`)
    revalidatePath("/applications")

    return { success: true, data: { id: data.id } }
  } catch (err) {
    return {
      success: false,
      error: "Gagal membuat pengingat follow-up.",
    }
  }
}

// 3. Update existing follow-up
export async function updateFollowUpAction(
  input: UpdateFollowUpInput
): Promise<{ success: boolean; error?: string }> {
  try {
    const trimmedTitle = input.title.trim()
    if (!trimmedTitle) {
      return { success: false, error: "Judul follow-up tidak boleh kosong." }
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "Kamu harus login terlebih dahulu ya." }
    }

    const dueAtIso = input.dueAt ? new Date(input.dueAt).toISOString() : null

    const updatePayload: Record<string, unknown> = {
      title: trimmedTitle,
      description: input.description?.trim() || null,
      due_at: dueAtIso,
    }

    if (input.status) {
      updatePayload.status = input.status
      if (input.status === "Completed") {
        updatePayload.completed_at = new Date().toISOString()
      } else if (input.status === "Pending") {
        updatePayload.completed_at = null
      }
    }

    const { error } = await supabase
      .from("follow_ups")
      .update(updatePayload)
      .eq("id", input.id)
      .eq("user_id", user.id)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath("/follow-ups")
    revalidatePath("/dashboard")
    revalidatePath("/applications")

    return { success: true }
  } catch (err) {
    return {
      success: false,
      error: "Gagal memperbarui pengingat follow-up.",
    }
  }
}

// 4. Toggle completion status
export async function toggleFollowUpCompleteAction(
  id: string,
  isCurrentlyCompleted: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "Kamu harus login terlebih dahulu ya." }
    }

    const nextStatus = isCurrentlyCompleted ? "Pending" : "Completed"
    const completedAt = isCurrentlyCompleted ? null : new Date().toISOString()

    const { error } = await supabase
      .from("follow_ups")
      .update({
        status: nextStatus,
        completed_at: completedAt,
      })
      .eq("id", id)
      .eq("user_id", user.id)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath("/follow-ups")
    revalidatePath("/dashboard")
    revalidatePath("/applications")

    return { success: true }
  } catch (err) {
    return {
      success: false,
      error: "Gagal mengubah status follow-up.",
    }
  }
}

// 5. Snooze follow-up (+X days)
export async function snoozeFollowUpAction(
  id: string,
  days: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "Kamu harus login terlebih dahulu ya." }
    }

    // Get current due date
    const { data: item } = await supabase
      .from("follow_ups")
      .select("due_at")
      .eq("id", id)
      .eq("user_id", user.id)
      .single()

    const baseDate = item?.due_at ? new Date(item.due_at) : new Date()
    const newDueDate = new Date(baseDate.getTime() + days * 24 * 60 * 60 * 1000)

    const { error } = await supabase
      .from("follow_ups")
      .update({
        due_at: newDueDate.toISOString(),
        status: "Pending",
      })
      .eq("id", id)
      .eq("user_id", user.id)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath("/follow-ups")
    revalidatePath("/dashboard")
    revalidatePath("/applications")

    return { success: true }
  } catch (err) {
    return {
      success: false,
      error: "Gagal menunda (snooze) follow-up.",
    }
  }
}

// 6. Delete follow-up
export async function deleteFollowUpAction(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "Kamu harus login terlebih dahulu ya." }
    }

    const { error } = await supabase
      .from("follow_ups")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath("/follow-ups")
    revalidatePath("/dashboard")
    revalidatePath("/applications")

    return { success: true }
  } catch (err) {
    return {
      success: false,
      error: "Gagal menghapus tugas follow-up.",
    }
  }
}

// 7. Create interview schedule
export async function createInterviewAction(
  input: CreateInterviewInput
): Promise<{ success: boolean; data?: { id: string }; error?: string }> {
  try {
    if (!input.scheduledAt) {
      return { success: false, error: "Jadwal tanggal interview wajib diisi." }
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "Kamu harus login terlebih dahulu ya." }
    }

    const { data, error } = await supabase
      .from("interviews")
      .insert({
        application_id: input.applicationId,
        interview_type: input.interviewType || "video",
        scheduled_at: new Date(input.scheduledAt).toISOString(),
        meeting_url: input.meetingUrl?.trim() || null,
        interviewer: input.interviewer?.trim() || null,
        notes: input.notes?.trim() || null,
      })
      .select("id")
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath("/follow-ups")
    revalidatePath("/dashboard")
    revalidatePath(`/applications/${input.applicationId}`)
    revalidatePath("/applications")

    return { success: true, data: { id: data.id } }
  } catch (err) {
    return {
      success: false,
      error: "Gagal menyimpan jadwal interview.",
    }
  }
}
