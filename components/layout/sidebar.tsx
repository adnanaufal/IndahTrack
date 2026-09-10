"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Briefcase,
  Kanban,
  CheckSquare,
  BarChart3,
  Settings,
  Plus,
  Compass,
  ChevronRight,
  Heart,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { NAV_SECTIONS, APP_CONFIG } from "@/lib/constants"
import { createClient } from "@/lib/supabase/client"

const ICON_MAP: Record<string, React.ElementType> = {
  LayoutDashboard,
  Briefcase,
  Kanban,
  CheckSquare,
  BarChart3,
  Settings,
}

export function Sidebar({ className }: { className?: string }) {
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
        // Fallback default
      }
    }
    loadUser()
  }, [])

  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col w-72 border-r border-border/70 bg-card/50 backdrop-blur-xl h-screen sticky top-0 z-30 transition-all duration-300",
        className
      )}
    >
      {/* App Brand Header */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-border/60">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="relative h-9 w-9 rounded-full overflow-hidden ring-2 ring-rose-500/40 shadow-xs group-hover:scale-105 transition-transform shrink-0">
            <Image
              src="/indah.png"
              alt="Indah"
              fill
              className="object-cover object-top"
              priority
            />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-[15px] tracking-tight text-foreground flex items-center gap-1.5">
              {APP_CONFIG.name}
            </span>
            <span className="text-xs text-muted-foreground -mt-0.5 truncate max-w-[150px]">
              Job Search Tracker
            </span>
          </div>
        </Link>
      </div>

      {/* Primary Action Button */}
      <div className="p-4 pb-2">
        <Link href="/applications?new=true" className="w-full block">
          <Button
            className="w-full justify-center gap-2 font-semibold shadow-sm hover:shadow transition-all group bg-primary hover:bg-primary/90 text-primary-foreground text-xs sm:text-sm h-10 rounded-xl"
          >
            <Plus className="h-4 w-4 transition-transform group-hover:rotate-90 duration-200" />
            <span>Tambah Lamaran Baru</span>
          </Button>
        </Link>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 px-3.5 py-3 space-y-6 overflow-y-auto">
        {NAV_SECTIONS.map((section) => (
          <div key={section.title} className="space-y-1.5">
            <p className="px-3 text-xs font-semibold tracking-wider text-muted-foreground/70 uppercase">
              {section.title}
            </p>
            <nav className="space-y-1">
              {section.items.map((item) => {
                const Icon = ICON_MAP[item.icon] || Briefcase
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/dashboard" && pathname?.startsWith(item.href))

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group relative",
                      isActive
                        ? "bg-rose-500/10 text-rose-700 dark:text-rose-300 shadow-2xs font-semibold border-l-2 border-rose-600 dark:border-rose-400 pl-3"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        className={cn(
                          "h-[18px] w-[18px] transition-colors",
                          isActive
                            ? "text-rose-600 dark:text-rose-400"
                            : "text-muted-foreground group-hover:text-foreground"
                        )}
                      />
                      <span>{item.title}</span>
                    </div>

                    {isActive && (
                      <div className="w-1.5 h-1.5 rounded-full bg-rose-600 dark:bg-rose-400 animate-pulse" />
                    )}
                  </Link>
                )
              })}
            </nav>
          </div>
        ))}
      </div>

      {/* User Profile Mini Footer */}
      <div className="p-3.5 border-t border-border/60 mt-auto bg-muted/20">
        <Link
          href="/settings"
          className="flex items-center justify-between p-2 rounded-xl hover:bg-muted/80 transition-colors group"
        >
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="relative h-8 w-8 rounded-full overflow-hidden ring-1 ring-rose-500/30 shrink-0">
              <Image
                src="/indah.png"
                alt={userName}
                fill
                className="object-cover object-top"
              />
            </div>
            <div className="flex flex-col truncate">
              <span className="text-sm font-semibold text-foreground truncate flex items-center gap-1">
                {userName}
              </span>
              <span className="text-[11px] text-muted-foreground truncate">
                Ruang Kerja Pribadi
              </span>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </aside>
  )
}
