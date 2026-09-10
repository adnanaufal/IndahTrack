"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { loginSchema, registerSchema, type LoginInput, type RegisterInput } from "@/lib/validations/auth"

export interface AuthActionResult {
  success: boolean
  error?: string
}

export async function loginAction(values: LoginInput): Promise<AuthActionResult> {
  const parseResult = loginSchema.safeParse(values)
  if (!parseResult.success) {
    return {
      success: false,
      error: parseResult.error.issues[0]?.message || "Data input kamu belum valid.",
    }
  }

  const { email, password } = parseResult.data
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    if (error.message.includes("Invalid login credentials")) {
      return {
        success: false,
        error: "Email atau password kamu belum sesuai nih. Coba dicek lagi ya!",
      }
    }
    if (error.message.includes("Email not confirmed")) {
      return {
        success: false,
        error: "Email kamu belum dikonfirmasi di Supabase. Matikan fitur 'Confirm email' di dashboard Supabase atau verifikasi email kamu ya!",
      }
    }
    return {
      success: false,
      error: error.message || "Gagal masuk ke akun. Coba sesaat lagi ya.",
    }
  }

  revalidatePath("/", "layout")
  return { success: true }
}

export async function registerAction(values: RegisterInput): Promise<AuthActionResult> {
  const parseResult = registerSchema.safeParse(values)
  if (!parseResult.success) {
    return {
      success: false,
      error: parseResult.error.issues[0]?.message || "Data input kamu belum valid.",
    }
  }

  const { fullName, email, password } = parseResult.data
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  })

  if (error) {
    if (error.message.includes("User already registered") || error.message.includes("already registered")) {
      return {
        success: false,
        error: "Email ini sudah pernah terdaftar. Kamu bisa langsung login ya!",
      }
    }
    return {
      success: false,
      error: error.message || "Gagal mendaftarkan akun. Coba sesaat lagi ya.",
    }
  }

  revalidatePath("/", "layout")
  return { success: true }
}

export async function logoutAction() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath("/", "layout")
  redirect("/login")
}
