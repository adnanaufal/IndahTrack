"use client"

import * as React from "react"
import {
  ExternalLink,
  MapPin,
  Sparkles,
  Edit2,
  Trash2,
  ChevronRight,
  DollarSign,
  Calendar,
} from "lucide-react"
import { type ApplicationWithDetails } from "@/app/(dashboard)/applications/actions"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface ApplicationTableViewProps {
  applications: ApplicationWithDetails[]
  onSelectApp: (app: ApplicationWithDetails) => void
  onUpdateStage: (app: ApplicationWithDetails) => void
  onEdit: (app: ApplicationWithDetails) => void
  onDelete: (app: ApplicationWithDetails) => void
}

export function ApplicationTableView({
  applications,
  onSelectApp,
  onUpdateStage,
  onEdit,
  onDelete,
}: ApplicationTableViewProps) {
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
    <Card className="overflow-hidden border-border/80 shadow-xs">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[580px] text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-muted/40 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                <th className="py-3 px-4 sm:px-6">Perusahaan & Posisi</th>
                <th className="py-3 px-4">Tahapan & Status</th>
                <th className="py-3 px-4 hidden md:table-cell">Kompensasi / Tipe</th>
                <th className="py-3 px-4 hidden lg:table-cell">Sumber</th>
                <th className="py-3 px-4 hidden sm:table-cell">Tanggal Apply</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {applications.map((app) => {
                const salaryStr = formatSalary(app.salary_min, app.salary_max, app.salary_currency)
                return (
                  <tr
                    key={app.id}
                    onClick={() => onSelectApp(app)}
                    className="hover:bg-muted/40 transition-colors group cursor-pointer"
                  >
                    {/* Perusahaan & Posisi */}
                    <td className="py-3.5 px-4 sm:px-6">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-primary/5 border border-primary/20 text-primary flex items-center justify-center font-bold text-xs shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors shadow-xs">
                          {app.company?.name ? app.company.name[0].toUpperCase() : "J"}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-foreground group-hover:text-primary transition-colors flex items-center gap-1.5 truncate">
                            <span>{app.position}</span>
                            {app.job_url && (
                              <a
                                href={app.job_url}
                                target="_blank"
                                rel="noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="text-muted-foreground hover:text-primary shrink-0"
                                title="Buka tautan lowongan asli"
                              >
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                            <span className="font-medium text-foreground/80 truncate">
                              {app.company?.name}
                            </span>
                            {app.location && (
                              <>
                                <span>•</span>
                                <span className="flex items-center gap-0.5 truncate">
                                  <MapPin className="h-3 w-3 shrink-0" />
                                  {app.location}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Tahapan & Status */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col gap-1 items-start">
                        <Badge
                          variant={getBadgeVariant(app.stage?.slug)}
                          className="text-[11px] font-semibold"
                        >
                          {app.stage?.name || "Applied"}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground capitalize">
                          {app.status === "Active" ? "Sedang Proses" : app.status === "Rejected" ? "Belum Jodoh" : app.status}
                        </span>
                      </div>
                    </td>

                    {/* Kompensasi / Tipe */}
                    <td className="py-3.5 px-4 hidden md:table-cell">
                      <div className="text-xs space-y-0.5">
                        <div className="font-medium text-foreground">
                          {app.employment_type || "Full-time"}
                        </div>
                        {salaryStr ? (
                          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                            <DollarSign className="h-3 w-3" />
                            {salaryStr}
                          </div>
                        ) : (
                          <div className="text-[11px] text-muted-foreground">-</div>
                        )}
                      </div>
                    </td>

                    {/* Sumber */}
                    <td className="py-3.5 px-4 hidden lg:table-cell">
                      <span className="text-xs text-muted-foreground">
                        {app.source ? `via ${app.source}` : "-"}
                      </span>
                    </td>

                    {/* Tanggal Apply */}
                    <td className="py-3.5 px-4 hidden sm:table-cell text-muted-foreground text-xs">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-muted-foreground/70" />
                        <span>{app.application_date}</span>
                      </div>
                    </td>

                    {/* Action buttons */}
                    <td className="py-3.5 px-4 text-right">
                      <div
                        className="flex items-center justify-end gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onUpdateStage(app)}
                          className="h-8 gap-1 text-xs text-primary hover:text-primary hover:bg-primary/10 font-medium px-2"
                          title="Perbarui Tahapan Seleksi"
                        >
                          <Sparkles className="h-3.5 w-3.5" />
                          <span className="hidden xl:inline">Update Tahap</span>
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => onEdit(app)}
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          title="Edit Lamaran"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => onDelete(app)}
                          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          title="Hapus Lamaran"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => onSelectApp(app)}
                          className="h-8 w-8 text-muted-foreground hover:text-primary"
                          title="Lihat Detail"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
