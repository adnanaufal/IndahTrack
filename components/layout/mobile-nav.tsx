"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Briefcase,
  Plus,
  Kanban,
  BarChart3,
} from "lucide-react"
import { cn } from "@/lib/utils"

export function MobileNav({ className }: { className?: string }) {
  const pathname = usePathname()

  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Jobs", href: "/applications", icon: Briefcase },
    { label: "Add", href: "/applications?new=true", icon: Plus, isAction: true },
    { label: "Pipeline", href: "/pipeline", icon: Kanban },
    { label: "Insights", href: "/insights", icon: BarChart3 },
  ]

  return (
    <div
      className={cn(
        "lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-lg border-t border-border/70 px-2 py-1.5 safe-area-pb",
        className
      )}
    >
      <nav className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive =
            !item.isAction &&
            (pathname === item.href ||
              (item.href !== "/dashboard" && pathname?.startsWith(item.href)))

          if (item.isAction) {
            return (
              <Link
                key={item.label}
                href={item.href}
                className="flex flex-col items-center justify-center -mt-4 group"
              >
                <div className="h-11 w-11 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg border-2 border-background group-hover:scale-105 active:scale-95 transition-all">
                  <Icon className="h-5 w-5 stroke-[2.5]" />
                </div>
                <span className="text-[10px] font-medium text-muted-foreground mt-0.5">
                  {item.label}
                </span>
              </Link>
            )
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center py-1 px-3 rounded-lg text-[10px] font-medium transition-colors relative min-w-[56px]",
                isActive
                  ? "text-foreground font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4 mb-0.5 transition-transform",
                  isActive && "scale-110 text-foreground"
                )}
              />
              <span>{item.label}</span>
              {isActive && (
                <div className="w-1 h-1 rounded-full bg-foreground mt-0.5" />
              )}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
