"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowRight, Lock, Mail, User, Loader2, AlertCircle } from "lucide-react"
import { registerSchema, type RegisterInput } from "@/lib/validations/auth"
import { registerAction } from "../actions"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function RegisterPage() {
  const router = useRouter()
  const [serverError, setServerError] = React.useState<string | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
    },
  })

  const onSubmit = async (values: RegisterInput) => {
    try {
      setIsLoading(true)
      setServerError(null)

      const res = await registerAction(values)

      if (!res.success) {
        setServerError(res.error || "Gagal membuat akun kamu.")
        setIsLoading(false)
        return
      }

      // Registration success -> redirect to dashboard
      router.push("/dashboard")
      router.refresh()
    } catch (err) {
      setServerError("Terjadi kendala jaringan. Coba sesaat lagi ya!")
      setIsLoading(false)
    }
  }

  return (
    <Card className="border-border/80 shadow-md overflow-hidden">
      <div className="flex flex-col items-center justify-center pt-6 pb-1">
        <div className="relative h-20 w-20 rounded-full overflow-hidden ring-4 ring-rose-500/30 shadow-md">
          <Image
            src="/indah.png"
            alt="Indah"
            fill
            className="object-cover object-top"
            priority
          />
        </div>
        <div className="mt-2.5 inline-flex items-center px-3 py-0.5 rounded-full bg-rose-500/10 text-rose-700 dark:text-rose-300 text-xs font-semibold">
          <span>Teman Job Hunt Indah</span>
        </div>
      </div>

      <CardHeader className="space-y-1 text-center pt-2">
        <CardTitle className="text-xl font-bold tracking-tight">Buat Akun Baru</CardTitle>
        <CardDescription className="text-xs">
          Mulai atur dan pantau semua lamaran kerja dalam satu tempat yang rapi
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
          {serverError && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-start gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{serverError}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">Nama Lengkap</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Indah Permata"
                className="pl-9 text-xs sm:text-sm h-9"
                disabled={isLoading}
                {...register("fullName")}
              />
            </div>
            {errors.fullName && (
              <p className="text-[11px] text-destructive font-medium">
                {errors.fullName.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="email"
                placeholder="indah@email.com"
                className="pl-9 text-xs sm:text-sm h-9"
                disabled={isLoading}
                {...register("email")}
              />
            </div>
            {errors.email && (
              <p className="text-[11px] text-destructive font-medium">
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="password"
                placeholder="Minimal 6 karakter"
                className="pl-9 text-xs sm:text-sm h-9"
                disabled={isLoading}
                {...register("password")}
              />
            </div>
            {errors.password && (
              <p className="text-[11px] text-destructive font-medium">
                {errors.password.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full gap-2 text-xs font-medium h-9 mt-1"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Membuat akun...</span>
              </>
            ) : (
              <>
                <span>Daftar & Mulai Tracking</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </>
            )}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="flex justify-center border-t border-border/50 py-3 mt-1">
        <p className="text-xs text-muted-foreground">
          Sudah punya akun?{" "}
          <Link
            href="/login"
            className="font-medium text-foreground underline underline-offset-4 hover:text-primary transition-colors"
          >
            Masuk sekarang
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}
