"use client"

import * as React from "react"
import Image from "next/image"
import { User, LogOut, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { updateProfileAction } from "@/app/(dashboard)/settings/actions"
import { logoutAction } from "@/app/(auth)/actions"

interface ProfileCardProps {
  fullName: string
  firstName: string
  email: string
}

export function ProfileCard({ fullName, firstName, email }: ProfileCardProps) {
  const [isSaving, setIsSaving] = React.useState(false)

  const [isLoggingOut, setIsLoggingOut] = React.useState(false)

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true)
      await logoutAction()
    } catch (err) {
      // Handled by redirect
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      setIsSaving(true)
      const formData = new FormData(e.currentTarget)
      const res = await updateProfileAction(formData)

      if (!res.success) {
        toast.error(res.error || "Gagal memperbarui profil.")
        return
      }

      toast.success("Profil berhasil diperbarui!")
    } catch (err: any) {
      toast.error(err.message || "Terjadi kesalahan.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card className="border-border/80 shadow-2xs">
      <CardHeader>
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-primary" />
          <CardTitle className="text-base font-semibold">Profil {firstName}</CardTitle>
        </div>
        <CardDescription className="text-xs">
          Informasi akun yang terhubung ke database privat {firstName}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-3.5 pb-4 mb-4 border-b border-border/60">
          <div className="relative h-12 w-12 rounded-full overflow-hidden ring-2 ring-rose-500/40 shadow-xs shrink-0">
            <Image
              src="/indah.png"
              alt={fullName}
              fill
              className="object-cover object-top"
              priority
            />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-sm text-foreground">{fullName}</span>
            <span className="text-xs text-muted-foreground">{email}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Nama Lengkap</label>
              <Input
                name="fullName"
                defaultValue={fullName}
                className="text-xs sm:text-sm h-9"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Alamat Email</label>
              <Input
                defaultValue={email}
                disabled
                className="text-xs sm:text-sm h-9 opacity-80"
              />
            </div>
          </div>
          <div className="pt-2 flex items-center justify-between">
            <Button
              type="submit"
              disabled={isSaving}
              size="sm"
              className="text-xs font-medium gap-2"
            >
              {isSaving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              <span>Simpan Perubahan</span>
            </Button>

            {/* Logout Action Button */}
            <Button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              variant="destructive"
              size="sm"
              className="text-xs gap-1.5 font-medium"
            >
              {isLoggingOut ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <LogOut className="h-3.5 w-3.5" />
              )}
              <span>Keluar Akun</span>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
