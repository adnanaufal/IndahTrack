import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import {
  Compass,
  ArrowRight,
  Sparkles,
  Briefcase,
  BarChart3,
  Kanban,
  CheckCircle2,
  Clock,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ThemeToggle } from "@/components/layout/theme-toggle"
import { APP_CONFIG } from "@/lib/constants"

export default function LandingPage() {
  const features = [
    {
      icon: Kanban,
      title: "Recruitment Pipeline & Timeline",
      description:
        "Pantau setiap langkah perjalanan kamu, dari Wishlist sampai Offering. Tapi tenang, ada satu hal yang nggak perlu kamu track, karena yang bikin ini selalu ada buat kamu.",
    },
    {
      icon: BarChart3,
      title: "Insights & Statistik Lengkap",
      description:
        "Cari tahu platform mana yang paling sering menghasilkan panggilan interview. Kalau soal siapa yang paling sering mikirin kamu, yang bikin ini jawaban nya.",
    },
    {
      icon: Clock,
      title: "Follow-up & Reminder Pengingat",
      description:
        "Biar kamu nggak lupa follow-up recruiter, siap interview, dan tetap semangat.",
    },
  ]

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground flex flex-col">
      {/* Navbar */}
      <header className="border-b border-border/60 bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative h-9 w-9 rounded-full overflow-hidden ring-2 ring-rose-500/40 shadow-xs group-hover:scale-105 transition-transform shrink-0">
              <Image
                src="/indah.png"
                alt="Indah"
                fill
                className="object-cover object-top"
                priority
              />
            </div>
            <span className="font-bold text-base tracking-tight text-foreground flex items-center gap-1.5">
              {APP_CONFIG.name}
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/login" className="hidden sm:inline-block">
              <Button variant="ghost" size="sm" className="text-xs font-medium">
                Masuk
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm" className="text-xs gap-1.5 font-medium shadow-sm">
                <span>Daftar Sekarang</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative overflow-hidden pt-16 pb-20 sm:pt-24 sm:pb-28 border-b border-border/60">
          {/* Subtle background glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-primary/5 blur-[120px] pointer-events-none rounded-full" />

          <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-6 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border/80 bg-muted/50 text-xs font-medium text-muted-foreground backdrop-blur-sm shadow-xs">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span>Dibuat spesial buat nemenin proses cari kerja kamu</span>
            </div>

            <h1 className="text-[clamp(1.15rem,4.2vw,3.25rem)] font-extrabold tracking-tight text-foreground leading-[1.2]">
              <span className="block whitespace-nowrap">Pantau semua lamaran kerja Indah.</span>
              <span className="block text-muted-foreground mt-1.5 sm:mt-2">
                Biar proses hunting kamu lebih tenang & tertata.
              </span>
            </h1>


            <div className="inline-block p-px rounded-2xl bg-gradient-to-r from-rose-500/30 via-primary/40 to-amber-500/30 shadow-xs">
              <div className="px-5 py-2.5 rounded-[15px] bg-card/90 backdrop-blur-md text-xs sm:text-sm font-medium tracking-wide text-foreground/90">
                ✨ &ldquo;Semoga perjuangan mu hari ini akan terbayar <span className="text-primary font-bold">INDAH</span> di <span className="text-primary font-bold">MASA DEPAN</span>&rdquo;
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link href="/login" className="w-full sm:w-auto">
                <Button size="lg" className="w-full gap-2 text-sm font-medium shadow-md">
                  <span>Login</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/register" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full text-sm font-medium">
                  <span>Signup</span>
                </Button>
              </Link>
            </div>
          </div>


        </section>

        {/* Feature Highlights Grid */}
        <section className="py-16 sm:py-24 max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-12 space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground leading-snug">
              Semua fitur penting buat nemenin langkah karier kamu, sampai nanti kita sama-sama sukses.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {features.map((feat, idx) => {
              const Icon = feat.icon
              return (
                <Card key={idx} className="p-5 sm:p-6 bg-card/60 border-border/80 hover:border-border transition-all">
                  <div className="p-2.5 rounded-lg bg-primary/10 text-primary w-fit mb-4">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold text-base text-foreground mb-1">
                    {feat.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {feat.description}
                  </p>
                </Card>
              )
            })}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/60 py-8 px-4 sm:px-6 bg-muted/20 text-center text-xs text-muted-foreground">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="relative h-6 w-6 rounded-full overflow-hidden ring-1 ring-rose-500/40 shrink-0">
              <Image src="/indah.png" alt="Indah" fill className="object-cover object-top" />
            </div>
            <span className="font-semibold text-foreground">{APP_CONFIG.name}</span>
            <span>•</span>
            <span>{APP_CONFIG.tagline}</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <span>Dibuat khusus untuk teteh cantik yang lagi berjuang.</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
