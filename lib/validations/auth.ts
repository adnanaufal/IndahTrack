import { z } from "zod"

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email wajib diisi ya!")
    .email("Format email kamu belum sesuai nih."),
  password: z
    .string()
    .min(1, "Password gak boleh kosong ya!")
    .min(6, "Password minimal 6 karakter."),
})

export const registerSchema = z.object({
  fullName: z
    .string()
    .min(1, "Nama lengkap wajib diisi ya!")
    .min(2, "Nama minimal 2 karakter."),
  email: z
    .string()
    .min(1, "Email wajib diisi ya!")
    .email("Format email kamu belum sesuai nih."),
  password: z
    .string()
    .min(1, "Password wajib diisi ya!")
    .min(6, "Password minimal 6 karakter ya biar aman."),
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
