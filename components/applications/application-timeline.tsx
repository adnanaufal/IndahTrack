"use client"

import * as React from "react"
import {
  Calendar,
  CheckCircle2,
  Clock,
  Heart,
  Sparkles,
  Video,
  ExternalLink,
  MessageSquare,
  AlertCircle,
  Award,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { ApplicationEventItem } from "@/app/(dashboard)/applications/actions"

interface ApplicationTimelineProps {
  events: ApplicationEventItem[]
  status: string
}

export function ApplicationTimeline({ events, status }: ApplicationTimelineProps) {
  const getBadgeVariant = (stageSlug?: string) => {
    switch (stageSlug) {
      case "offer":
      case "accepted":
      case "completed":
        return "success"
      case "hr-interview":
      case "user-interview":
      case "final-interview":
        return "pink"
      case "screening":
      case "applied":
        return "mocha"
      case "assessment":
        return "warning"
      case "rejected":
      case "ghosted":
      case "withdrawn":
        return "destructive"
      default:
        return "outline"
    }
  }

  const isClosedLost =
    status === "Rejected" || status === "Ghosted" || status === "Withdrawn"
  const isWon = status === "Offer" || status === "Accepted" || status === "Completed"

  return (
    <div className="space-y-4">
      {/* Encouragement Banner if Closed Lost */}
      {isClosedLost && (
        <div className="p-3.5 rounded-xl border border-rose-500/20 bg-rose-500/5 text-xs text-rose-600 dark:text-rose-400 space-y-1">
          <div className="flex items-center gap-1.5 font-semibold">
            <Heart className="h-4 w-4 fill-rose-500 text-rose-500" />
            <span>Belum jodoh gak apa-apa ya!</span>
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Satu pintu tertutup, pintu yang jauh lebih baik sedang dipersiapkan untuk kamu. Evaluasi prosesnya, dan terus melangkah ya!
          </p>
        </div>
      )}

      {/* Celebration Banner if Won / Offering */}
      {isWon && (
        <div className="p-3.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-xs text-emerald-600 dark:text-emerald-400 space-y-1">
          <div className="flex items-center gap-1.5 font-semibold">
            <Award className="h-4 w-4 text-emerald-500" />
            <span>Selamat ya! Offering resmi sudah kamu raih!</span>
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Perjuangan dan persiapan kamu terbukti membuahkan hasil. Bangga banget sama pencapaian kamu!
          </p>
        </div>
      )}

      {/* Vertical Timeline List */}
      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border/70">
        {events.map((evt, idx) => {
          const dateFormatted = new Date(evt.event_date).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })

          const metadata = evt.metadata as Record<string, unknown> | null
          const hasInterview = metadata?.has_interview as boolean | undefined
          const meetingUrl = metadata?.meeting_url as string | undefined

          return (
            <div key={evt.id} className="relative group">
              {/* Timeline Bullet Node */}
              <div className="absolute -left-6 top-1.5 h-3 w-3 rounded-full border-2 border-background bg-primary ring-2 ring-border/80 group-hover:scale-110 transition-transform" />

              <div className="space-y-1.5">
                {/* Header: Stage Badge + Date */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <Badge variant={getBadgeVariant(evt.stage?.slug)} className="text-xs font-semibold">
                    {evt.stage?.name || "Tahapan"}
                  </Badge>
                  <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {dateFormatted}
                  </span>
                </div>

                {/* Notes */}
                {evt.notes && (
                  <div className="p-2.5 rounded-lg bg-muted/40 border border-border/50 text-xs text-foreground leading-relaxed">
                    {evt.notes}
                  </div>
                )}

                {/* Interview Info attached to this event */}
                {hasInterview && meetingUrl && (
                  <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20 text-xs flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-purple-600 dark:text-purple-400 font-medium">
                      <Video className="h-3.5 w-3.5" />
                      <span>Link Interview Online</span>
                    </div>
                    <a
                      href={meetingUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-semibold text-primary underline flex items-center gap-1 hover:opacity-80"
                    >
                      <span>Join Meeting</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                )}
              </div>
            </div>
          )
        })}

        {events.length === 0 && (
          <p className="text-xs text-muted-foreground italic">
            Belum ada riwayat timeline.
          </p>
        )}
      </div>
    </div>
  )
}
