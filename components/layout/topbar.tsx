"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Compass } from "lucide-react"
import { ThemeToggle } from "./theme-toggle"
import { createClient } from "@/lib/supabase/client"

const TITLE_MAP: Record<string, { title: string; subtitle: string }> = {
  "/dashboard": {
    title: "Dashboard Kamu",
    subtitle: "Rangkuman progress job hunt kamu hari ini. Semangat terus ya!",
  },
  "/applications": {
    title: "Daftar Lamaran",
    subtitle: "Semua lowongan yang sudah kamu kirim biar gak ada yang terlewat",
  },
  "/pipeline": {
    title: "Recruitment Pipeline",
    subtitle: "Lihat posisi tahapan tiap lamaran kamu secara visual",
  },
  "/follow-ups": {
    title: "Follow-ups & Reminder",
    subtitle: "Pengingat jadwal interview & kabar recruiter biar kamu selalu siap",
  },
  "/insights": {
    title: "Insights & Statistik",
    subtitle: "Analisis platform dan peluang yang paling banyak kasih kamu interview",
  },
  "/settings": {
    title: "Pengaturan Akun",
    subtitle: "Kelola profil dan preferensi pencarian kerja kamu",
  },
}

export function Topbar() {
  const pathname = usePathname()
  const [userName, setUserName] = React.useState<string>("Indah")
  const [userInitial, setUserInitial] = React.useState<string>("I")

  React.useEffect(() => {
    async function loadUser() {
      try {
        const supabase = createClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (user) {
          const name =
            user.user_metadata?.full_name ||
            user.email?.split("@")[0] ||
            "Indah"
          setUserName(name)
          setUserInitial(name.charAt(0).toUpperCase())
        }
      } catch (err) {
        // Fallback
      }
    }
    loadUser()
  }, [])

  const firstName = userName.split(" ")[0] || "Indah"

  const titleMap: Record<string, { title: string; subtitle: string }> = {
    "/dashboard": {
      title: `Dashboard ${firstName}`,
      subtitle: `Rangkuman progress job hunt ${firstName} hari ini. Semangat terus ya!`,
    },
    "/applications": {
      title: `Daftar Lamaran`,
      subtitle: `Semua lowongan yang sudah ${firstName} kirim biar gak ada yang terlewat`,
    },
    "/pipeline": {
      title: "Recruitment Pipeline",
      subtitle: `Lihat posisi tahapan tiap lamaran ${firstName} secara visual`,
    },
    "/follow-ups": {
      title: "Follow-ups & Reminder",
      subtitle: `Pengingat jadwal interview & kabar recruiter biar ${firstName} selalu siap`,
    },
    "/insights": {
      title: "Job Search Insights",
      subtitle: `Analisis platform dan peluang yang paling banyak kasih ${firstName} interview`,
    },
    "/settings": {
      title: `Pengaturan Akun ${firstName}`,
      subtitle: `Kelola profil dan preferensi pencarian kerja ${firstName}`,
    },
  }

  const pageInfo = titleMap[pathname] || {
    title: "IndahTrack",
    subtitle: `Teman Setia Job Search ${firstName}`,
  }

  return (
    <header className="h-16 border-b border-border/60 bg-background/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Mobile Brand / Page Title */}
      <div className="flex items-center gap-3">
        <div className="lg:hidden flex items-center gap-2">
          <div className="relative h-8 w-8 rounded-full overflow-hidden ring-2 ring-rose-500/40 shadow-xs shrink-0">
            <Image
              src="/indah.png"
              alt="Indah"
              fill
              className="object-cover object-top"
            />
          </div>
          <span className="font-bold text-sm text-foreground">IndahTrack</span>
        </div>

        <div className="hidden lg:flex flex-col">
          <h1 className="text-base sm:text-lg font-bold text-foreground tracking-tight flex items-center gap-1.5">
            {pageInfo.title}
          </h1>
          <p className="text-xs text-muted-foreground hidden sm:block">
            {pageInfo.subtitle}
          </p>
        </div>
      </div>

      {/* Action Bar / Utility Controls */}
      <div className="flex items-center gap-2.5">
        {/* Theme Switcher */}
        <ThemeToggle />

        {/* User / Profile Link */}
        <Link href="/settings">
          <div
            className="relative h-8 w-8 rounded-full overflow-hidden ring-2 ring-rose-500/40 hover:ring-rose-500/80 transition-all cursor-pointer shadow-2xs shrink-0"
            title={`Profil ${firstName}`}
          >
            <Image
              src="/indah.png"
              alt={firstName}
              fill
              className="object-cover object-top"
            />
          </div>
        </Link>
      </div>
    </header>
  )
}
