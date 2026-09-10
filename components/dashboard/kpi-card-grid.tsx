"use client"

import * as React from "react"
import {
  Briefcase,
  Clock,
  Users,
  Award,
  CheckCircle2,
  XCircle,
} from "lucide-react"
import { Card } from "@/components/ui/card"

interface KPICardGridProps {
  kpi: {
    totalApplications: number
    activeApplications: number
    interviewsCount: number
    offersCount: number
    rejectedCount: number
    acceptedCount: number
  }
}

export function KPICardGrid({ kpi }: KPICardGridProps) {
  const cards = [
    {
      title: "Total Lamaran",
      value: kpi.totalApplications,
      icon: Briefcase,
      color: "text-amber-900 dark:text-amber-300",
      bg: "bg-amber-950/10 dark:bg-amber-900/30",
      borderColor: "hover:border-amber-900/40",
    },
    {
      title: "Sedang Proses",
      value: kpi.activeApplications,
      icon: Clock,
      color: "text-amber-800 dark:text-amber-400",
      bg: "bg-amber-800/10 dark:bg-amber-800/30",
      borderColor: "hover:border-amber-800/40",
    },
    {
      title: "Panggilan Interview",
      value: kpi.interviewsCount,
      icon: Users,
      color: "text-rose-600 dark:text-rose-300",
      bg: "bg-rose-500/10 dark:bg-rose-500/20",
      borderColor: "hover:border-rose-500/40",
    },
    {
      title: "Offering Letter",
      value: kpi.offersCount,
      icon: Award,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-500/10 dark:bg-amber-500/20",
      borderColor: "hover:border-amber-500/40",
    },
    {
      title: "Diterima Bekerja",
      value: kpi.acceptedCount,
      icon: CheckCircle2,
      color: "text-emerald-700 dark:text-emerald-400",
      bg: "bg-emerald-600/10 dark:bg-emerald-600/20",
      borderColor: "hover:border-emerald-600/40",
    },
    {
      title: "Belum Jodoh",
      value: kpi.rejectedCount,
      icon: XCircle,
      color: "text-rose-800 dark:text-rose-400",
      bg: "bg-rose-800/10 dark:bg-rose-800/20",
      borderColor: "hover:border-rose-800/40",
    },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
      {cards.map((item) => {
        const Icon = item.icon
        return (
          <Card
            key={item.title}
            className={`p-4 sm:p-4.5 border-border/80 transition-all shadow-2xs ${item.borderColor}`}
          >
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-semibold text-muted-foreground line-clamp-1">
                {item.title}
              </span>
              <div className={`p-1.5 rounded-lg ${item.bg} shrink-0`}>
                <Icon className={`h-4 w-4 ${item.color}`} />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              {item.value}
            </div>
          </Card>
        )
      })}
    </div>
  )
}
