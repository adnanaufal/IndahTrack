"use client"

import * as React from "react"
import {
  ExternalLink,
  MapPin,
  Sparkles,
  Edit2,
  Trash2,
  DollarSign,
  Calendar,
  ArrowRight,
  Briefcase,
} from "lucide-react"
import { type ApplicationWithDetails } from "@/app/(dashboard)/applications/actions"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface ApplicationCardViewProps {
  applications: ApplicationWithDetails[]
  onSelectApp: (app: ApplicationWithDetails) => void
  onUpdateStage: (app: ApplicationWithDetails) => void
  onEdit: (app: ApplicationWithDetails) => void
  onDelete: (app: ApplicationWithDetails) => void
}

export function ApplicationCardView({
  applications,
  onSelectApp,
  onUpdateStage,
  onEdit,
  onDelete,
}: ApplicationCardViewProps) {
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {applications.map((app) => {
        const salaryStr = formatSalary(app.salary_min, app.salary_max, app.salary_currency)

        return (
          <Card
            key={app.id}
            onClick={() => onSelectApp(app)}
            className="group cursor-pointer hover:border-primary/40 hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden relative"
          >
            <CardContent className="p-4 sm:p-5 space-y-4 flex-1 flex flex-col justify-between">
              {/* Top Row: Company & Stage Badge */}
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="h-10 w-10 rounded-xl bg-primary/5 border border-primary/20 text-primary flex items-center justify-center font-bold text-sm shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors shadow-xs">
                      {app.company?.name ? app.company.name[0].toUpperCase() : "J"}
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-xs text-foreground/80 truncate">
                        {app.company?.name}
                      </div>
                      {app.location && (
                        <div className="text-[11px] text-muted-foreground flex items-center gap-1 truncate">
                          <MapPin className="h-3 w-3 shrink-0" />
                          <span className="truncate">{app.location}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <Badge
                    variant={getBadgeVariant(app.stage?.slug)}
                    className="text-[11px] font-semibold shrink-0"
                  >
                    {app.stage?.name || "Applied"}
                  </Badge>
                </div>

                {/* Position Title */}
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-foreground group-hover:text-primary transition-colors flex items-center gap-1.5">
                    <span className="line-clamp-1">{app.position}</span>
                    {app.job_url && (
                      <a
                        href={app.job_url}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-muted-foreground hover:text-primary shrink-0"
                        title="Buka link lowongan"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </h3>
                </div>

                {/* Pills: Employment Type, Source, Salary */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <Badge variant="outline" className="text-[10px] font-normal py-0 px-2 h-5">
                    {app.employment_type || "Full-time"}
                  </Badge>

                  {app.source && (
                    <Badge variant="outline" className="text-[10px] font-normal py-0 px-2 h-5">
                      via {app.source}
                    </Badge>
                  )}

                  {salaryStr && (
                    <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5 ml-auto">
                      <DollarSign className="h-3 w-3" />
                      {salaryStr}
                    </span>
                  )}
                </div>

                {/* Notes Preview (if available) */}
                {app.notes && (
                  <p className="text-[11px] text-muted-foreground line-clamp-2 bg-muted/30 p-2 rounded-lg border border-border/50">
                    "{app.notes}"
                  </p>
                )}
              </div>

              {/* Bottom Actions & Date */}
              <div
                className="pt-3 border-t border-border/60 flex items-center justify-between text-xs mt-2"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>{app.application_date}</span>
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onUpdateStage(app)}
                    className="h-7 px-2 text-[11px] text-primary hover:text-primary hover:bg-primary/10 font-semibold gap-1"
                    title="Perbarui Tahapan"
                  >
                    <Sparkles className="h-3 w-3" />
                    <span>Update</span>
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => onEdit(app)}
                    className="h-7 w-7 text-muted-foreground hover:text-foreground"
                    title="Edit"
                  >
                    <Edit2 className="h-3 w-3" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => onDelete(app)}
                    className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    title="Hapus"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => onSelectApp(app)}
                    className="h-7 w-7 text-muted-foreground hover:text-primary"
                    title="Buka Detail"
                  >
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
