"use client"

import * as React from "react"
import Link from "next/link"
import { Calendar, Video, Clock, ExternalLink, ArrowUpRight, CheckCircle } from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface FollowupAgendaCardProps {
  agenda: {
    id: string
    companyName: string
    position: string
    type: "interview" | "stale_followup"
    scheduledAt?: string
    meetingUrl?: string
    notes?: string
    daysInactive?: number
    label: string
    urgency: "urgent" | "today" | "upcoming"
  }[]
}

export function FollowupAgendaCard({ agenda }: FollowupAgendaCardProps) {
  const getBadgeVariant = (urgency: "urgent" | "today" | "upcoming") => {
    switch (urgency) {
      case "urgent":
        return "destructive"
      case "today":
        return "warning"
      case "upcoming":
      default:
        return "outline"
    }
  }

  return (
    <Card className="border-border/80 shadow-2xs">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm sm:text-base font-bold text-foreground">
              Agenda & Pengingat
            </CardTitle>
          </div>
          <CardDescription className="text-xs mt-0.5">
            Jadwal interview dan lamaran yang perlu kamu follow-up
          </CardDescription>
        </div>

        <Link href="/follow-ups">
          <Button variant="ghost" size="sm" className="text-xs gap-1 h-7">
            <span>Semua Agenda</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Button>
        </Link>
      </CardHeader>

      <CardContent className="space-y-3 pt-2">
        {agenda.length === 0 ? (
          <div className="p-6 text-center border border-dashed border-border/70 rounded-xl bg-card/30 space-y-1.5">
            <CheckCircle className="h-5 w-5 text-emerald-500 mx-auto" />
            <p className="text-xs font-semibold text-foreground">
              Semua Jadwal Rapi Terkendali
            </p>
            <p className="text-[11px] text-muted-foreground">
              Tidak ada interview mendesak atau lamaran yang tertunda follow-up.
            </p>
          </div>
        ) : (
          agenda.map((item) => (
            <div
              key={item.id}
              className="p-3 rounded-xl border border-border/70 bg-muted/20 hover:bg-muted/40 transition-colors space-y-1.5"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  {item.type === "interview" ? (
                    <div className="p-1 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400 shrink-0">
                      <Video className="h-3.5 w-3.5" />
                    </div>
                  ) : (
                    <div className="p-1 rounded bg-amber-900/10 text-amber-900 dark:text-amber-300 shrink-0">
                      <Clock className="h-3.5 w-3.5" />
                    </div>
                  )}
                  <span className="text-xs font-bold text-foreground truncate">
                    {item.companyName}
                  </span>
                </div>

                <Badge
                  variant={getBadgeVariant(item.urgency)}
                  className="text-[10px] py-0 px-1.5 shrink-0"
                >
                  {item.label}
                </Badge>
              </div>

              <div className="text-xs text-muted-foreground flex items-center justify-between">
                <span className="truncate">{item.position}</span>
                {item.meetingUrl && (
                  <a
                    href={item.meetingUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-primary hover:underline flex items-center gap-1 shrink-0 ml-2 font-medium"
                  >
                    <span>Link Meeting</span>
                    <ExternalLink className="h-2.5 w-2.5" />
                  </a>
                )}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
