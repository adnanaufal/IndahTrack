"use client"

import * as React from "react"
import { useDraggable } from "@dnd-kit/core"
import {
  ExternalLink,
  MapPin,
  Sparkles,
  DollarSign,
  Calendar,
  GripVertical,
} from "lucide-react"
import { type ApplicationWithDetails } from "@/app/(dashboard)/applications/actions"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface KanbanCardProps {
  application: ApplicationWithDetails
  onClick: (application: ApplicationWithDetails) => void
  onUpdateStage: (application: ApplicationWithDetails) => void
  isOverlay?: boolean
}

export function KanbanCard({
  application,
  onClick,
  onUpdateStage,
  isOverlay = false,
}: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: application.id,
    data: { application },
    disabled: isOverlay,
  })

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined

  const formatSalary = (min: number | null, max: number | null, currency: string | null) => {
    if (!min && !max) return null
    const curr = currency || "IDR"
    const formatter = new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: curr === "IDR" ? "IDR" : curr,
      maximumFractionDigits: 0,
      notation: "compact",
    })
    if (min && max) return `${formatter.format(min)} - ${formatter.format(max)}`
    if (min) return `≥ ${formatter.format(min)}`
    if (max) return `≤ ${formatter.format(max)}`
    return null
  }

  const salaryStr = formatSalary(
    application.salary_min,
    application.salary_max,
    application.salary_currency
  )

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => {
        if (!isDragging && !isOverlay) {
          onClick(application)
        }
      }}
      className={`select-none touch-none ${
        isDragging
          ? "opacity-30 cursor-grabbing"
          : isOverlay
          ? "cursor-grabbing shadow-2xl ring-2 ring-primary rotate-1 scale-102"
          : "cursor-grab active:cursor-grabbing hover:-translate-y-0.5 transition-all duration-150"
      }`}
    >
      <Card className="p-3.5 bg-card/95 border-border/80 hover:border-primary/40 shadow-2xs group relative">
        <div className="space-y-2.5">
          {/* Top Row: Company Info & Grab Indicator */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-bold text-xs shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors shadow-2xs">
                {application.company?.name ? application.company.name[0].toUpperCase() : "J"}
              </div>
              <div className="min-w-0">
                <span className="font-semibold text-xs text-foreground/85 block truncate">
                  {application.company?.name}
                </span>
                {application.location && (
                  <span className="text-[10px] text-muted-foreground flex items-center gap-0.5 truncate">
                    <MapPin className="h-2.5 w-2.5 shrink-0" />
                    {application.location}
                  </span>
                )}
              </div>
            </div>

            <GripVertical className="h-3.5 w-3.5 text-muted-foreground/40 group-hover:text-muted-foreground shrink-0 mt-0.5" />
          </div>

          {/* Position Title */}
          <div>
            <h4 className="font-bold text-xs sm:text-sm text-foreground group-hover:text-primary transition-colors line-clamp-1 flex items-center gap-1.5">
              <span>{application.position}</span>
              {application.job_url && (
                <a
                  href={application.job_url}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-muted-foreground hover:text-primary shrink-0"
                  title="Buka link lowongan"
                >
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </h4>
          </div>

          {/* Tags: Type, Source, Salary */}
          <div className="flex flex-wrap items-center gap-1">
            <Badge variant="outline" className="text-[10px] font-normal py-0 px-1.5 h-4.5 bg-muted/30">
              {application.employment_type || "Full-time"}
            </Badge>

            {application.source && (
              <Badge variant="outline" className="text-[10px] font-normal py-0 px-1.5 h-4.5 bg-muted/30">
                {application.source}
              </Badge>
            )}

            {salaryStr && (
              <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5 ml-auto">
                <DollarSign className="h-2.5 w-2.5" />
                {salaryStr}
              </span>
            )}
          </div>

          {/* Notes preview if any */}
          {application.notes && (
            <p className="text-[10px] text-muted-foreground line-clamp-1 italic bg-muted/20 px-1.5 py-0.5 rounded border border-border/40">
              "{application.notes}"
            </p>
          )}

          {/* Footer: Date & Quick Stage Action */}
          <div className="pt-2 border-t border-border/50 flex items-center justify-between text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1 text-[10px]">
              <Calendar className="h-3 w-3 text-muted-foreground/70" />
              <span>{application.application_date}</span>
            </span>

            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onUpdateStage(application)
              }}
              className="h-6 px-1.5 text-[10px] text-primary hover:text-primary hover:bg-primary/10 font-semibold gap-1"
              title="Perbarui Tahapan"
            >
              <Sparkles className="h-3 w-3" />
              <span>Pindah</span>
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
