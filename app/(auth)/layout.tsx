import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { APP_CONFIG } from "@/lib/constants"
import { ThemeToggle } from "@/components/layout/theme-toggle"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-background text-foreground relative selection:bg-primary selection:text-primary-foreground">
      {/* Auth Top Header */}
      <div className="p-6 flex items-center justify-between max-w-5xl mx-auto w-full">
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
          <span className="font-bold text-sm text-foreground">
            {APP_CONFIG.name}
          </span>
        </Link>
        <ThemeToggle />
      </div>

      {/* Centered Auth Card */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-sm">{children}</div>
      </div>

      {/* Auth Footer */}
      <footer className="p-6 text-center text-xs text-muted-foreground">
        &copy; {new Date().getFullYear()} {APP_CONFIG.name}. {APP_CONFIG.tagline}
      </footer>
    </div>
  )
}
