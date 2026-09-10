"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

export interface ExportApplicationItem {
  company: string
  position: string
  stage: string
  status: string
  application_date: string
  location: string
  employment_type: string
  source: string
  salary: string
  job_url: string
  notes: string
  last_updated: string
}

export async function getApplicationsForExportAction(): Promise<{
  success: boolean
  data?: ExportApplicationItem[]
  error?: string
}> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: "Kamu harus login terlebih dahulu." }
    }

    const { data: apps, error: appsError } = await supabase
      .from("applications")
      .select(`
        id,
        position,
        application_date,
        status,
        location,
        employment_type,
        source,
        job_url,
        notes,
        salary_min,
        salary_max,
        salary_currency,
        updated_at,
        company:companies(name),
        stage:pipeline_stages(name)
      `)
      .eq("user_id", user.id)
      .order("application_date", { ascending: false })

    if (appsError) {
      return { success: false, error: appsError.message }
    }

    const formattedData: ExportApplicationItem[] = (apps || []).map((app: any) => {
      let salaryStr = ""
      if (app.salary_min && app.salary_max) {
        salaryStr = `${app.salary_currency || "IDR"} ${app.salary_min.toLocaleString("id-ID")} - ${app.salary_max.toLocaleString("id-ID")}`
      } else if (app.salary_min) {
        salaryStr = `>= ${app.salary_currency || "IDR"} ${app.salary_min.toLocaleString("id-ID")}`
      } else if (app.salary_max) {
        salaryStr = `<= ${app.salary_currency || "IDR"} ${app.salary_max.toLocaleString("id-ID")}`
      }

      return {
        company: app.company?.name || "",
        position: app.position || "",
        stage: app.stage?.name || "",
        status: app.status || "",
        application_date: app.application_date || "",
        location: app.location || "",
        employment_type: app.employment_type || "",
        source: app.source || "",
        salary: salaryStr,
        job_url: app.job_url || "",
        notes: app.notes || "",
        last_updated: app.updated_at ? new Date(app.updated_at).toLocaleDateString("id-ID") : "",
      }
    })

    return { success: true, data: formattedData }
  } catch (err: any) {
    return { success: false, error: err.message || "Gagal mengambil data lamaran." }
  }
}

export async function updateProfileAction(formData: FormData): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: "Kamu harus login terlebih dahulu." }
    }

    const fullName = (formData.get("fullName") as string)?.trim()
    if (!fullName) {
      return { success: false, error: "Nama lengkap tidak boleh kosong." }
    }

    const { error: updateError } = await supabase.auth.updateUser({
      data: { full_name: fullName },
    })

    if (updateError) {
      return { success: false, error: updateError.message }
    }

    revalidatePath("/settings")
    revalidatePath("/dashboard")
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message || "Gagal memperbarui profil." }
  }
}
