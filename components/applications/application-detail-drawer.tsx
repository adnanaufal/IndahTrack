"use client"

import * as React from "react"
import Link from "next/link"
import {
  Building2,
  Calendar,
  ExternalLink,
  MapPin,
  DollarSign,
  Briefcase,
  Edit2,
  Trash2,
  Sparkles,
  ArrowRight,
  Clock,
  Video,
  Loader2,
  Share2,
  CalendarCheck,
  Plus,
} from "lucide-react"
import { toast } from "sonner"
import {
  getApplicationDetailAction,
  type ApplicationDetailData,
  type CompanyOption,
  type StageOption,
} from "@/app/(dashboard)/applications/actions"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ApplicationTimeline } from "./application-timeline"
import { UpdateStageDialog } from "./update-stage-dialog"
import { EditApplicationDialog } from "./edit-application-dialog"
import { DeleteApplicationDialog } from "./delete-application-dialog"
import { AddFollowUpDialog } from "@/components/follow-ups/add-followup-dialog"
import { AddInterviewDialog } from "@/components/follow-ups/add-interview-dialog"

interface ApplicationDetailDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  applicationId: string | null
  companies: CompanyOption[]
  stages: StageOption[]
  onRefresh?: () => void
}

export function ApplicationDetailDrawer({
  open,
  onOpenChange,
  applicationId,
  companies,
  stages,
  onRefresh,
}: ApplicationDetailDrawerProps) {
  const [data, setData] = React.useState<ApplicationDetailData | null>(null)
  const [loading, setLoading] = React.useState(false)

  // Sub-dialogs state
  const [isUpdateStageOpen, setIsUpdateStageOpen] = React.useState(false)
  const [isEditOpen, setIsEditOpen] = React.useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false)
  const [isAddFollowUpOpen, setIsAddFollowUpOpen] = React.useState(false)
  const [isAddInterviewOpen, setIsAddInterviewOpen] = React.useState(false)

  const loadDetail = React.useCallback(async () => {
    if (!applicationId) return
    try {
      setLoading(true)
      const res = await getApplicationDetailAction(applicationId)
      if (res.success && res.data) {
        setData(res.data)
      } else {
        toast.error(res.error || "Gagal memuat detail lamaran.")
      }
    } catch (err) {
      toast.error("Terjadi kendala jaringan.")
    } finally {
      setLoading(false)
    }
  }, [applicationId])

  React.useEffect(() => {
    if (open && applicationId) {
      loadDetail()
    }
  }, [open, applicationId, loadDetail])

  const handleStageUpdated = () => {
    loadDetail()
    onRefresh?.()
  }

  const handleEdited = () => {
    loadDetail()
    onRefresh?.()
  }

  const handleDeleted = () => {
    onOpenChange(false)
    onRefresh?.()
  }

  // Format salary
  const formatSalary = (min: number | null, max: number | null, currency: string | null) => {
    if (!min && !max) return null
    const curr = currency || "IDR"
    const formatter = new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: curr === "IDR" ? "IDR" : curr,
      maximumFractionDigits: 0,
    })
    if (min && max) return `${formatter.format(min)} – ${formatter.format(max)}`
    if (min) return `Mulai ${formatter.format(min)}`
    if (max) return `Hingga ${formatter.format(max)}`
    return null
  }

  const salaryDisplay = data ? formatSalary(data.salary_min, data.salary_max, data.salary_currency) : null

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="space-y-6">
          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center space-y-3 py-20">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <p className="text-xs text-muted-foreground">Memuat detail lamaran...</p>
            </div>
          ) : !data ? (
            <div className="text-center py-12 text-xs text-muted-foreground">
              Data lamaran tidak ditemukan.
            </div>
          ) : (
            <div className="space-y-6">
              {/* Header Title & Company */}
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-xl bg-muted border border-border flex items-center justify-center font-bold text-base text-foreground shrink-0 shadow-xs">
                      {data.company?.name ? data.company.name[0].toUpperCase() : "J"}
                    </div>
                    <div>
                      <h2 className="text-base sm:text-lg font-bold text-foreground leading-tight">
                        {data.position}
                      </h2>
                      <div className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                        <span className="font-semibold text-foreground/90">{data.company?.name}</span>
                        {data.location && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {data.location}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Badges & Tags */}
                <div className="flex flex-wrap items-center gap-2 mt-3 pt-2 border-t border-border/60">
                  <Badge variant="purple" className="text-xs font-semibold">
                    {data.stage?.name || "Applied"}
                  </Badge>
                  <Badge variant="outline" className="text-[11px]">
                    {data.employment_type || "Full-time"}
                  </Badge>
                  {data.source && (
                    <Badge variant="outline" className="text-[11px]">
                      via {data.source}
                    </Badge>
                  )}
                  {salaryDisplay && (
                    <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1 ml-auto">
                      <DollarSign className="h-3.5 w-3.5" />
                      {salaryDisplay}
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons Toolbar */}
              <div className="grid grid-cols-3 gap-2">
                <Button
                  onClick={() => setIsUpdateStageOpen(true)}
                  size="sm"
                  className="col-span-2 gap-1.5 text-xs font-semibold shadow-xs"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Pindah Tahapan</span>
                </Button>
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditOpen(true)}
                    className="flex-1 text-xs px-2"
                    title="Edit detail"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsDeleteOpen(true)}
                    className="flex-1 text-xs px-2 text-destructive hover:bg-destructive/10"
                    title="Hapus lamaran"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              {/* Job URL Link */}
              {data.job_url && (
                <div className="p-3 rounded-xl bg-muted/30 border border-border/70 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground truncate max-w-[240px]">
                    {data.job_url}
                  </span>
                  <a
                    href={data.job_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary font-medium flex items-center gap-1 hover:underline shrink-0 ml-2"
                  >
                    <span>Buka Lowongan</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}

              {/* Notes Card */}
              {data.notes && (
                <div className="space-y-1.5">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Catatan Pribadi
                  </h4>
                  <div className="p-3 rounded-xl bg-muted/20 border border-border/60 text-xs text-foreground whitespace-pre-wrap leading-relaxed">
                    {data.notes}
                  </div>
                </div>
              )}

              {/* Tindakan Berikutnya & Jadwal (Next Action & Schedule) */}
              <div className="space-y-2.5 pt-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                    <CalendarCheck className="h-3.5 w-3.5 text-primary" />
                    <span>Tindakan Berikutnya & Jadwal</span>
                  </h4>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsAddFollowUpOpen(true)}
                      className="h-6 px-1.5 text-[10px] text-primary hover:bg-primary/10 font-semibold gap-0.5"
                    >
                      <Plus className="h-3 w-3" />
                      <span>Follow-up</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsAddInterviewOpen(true)}
                      className="h-6 px-1.5 text-[10px] text-primary hover:bg-primary/10 font-semibold gap-0.5"
                    >
                      <Plus className="h-3 w-3" />
                      <span>Interview</span>
                    </Button>
                  </div>
                </div>

                {(!data.follow_ups || data.follow_ups.length === 0) &&
                (!data.interviews || data.interviews.length === 0) ? (
                  <div className="p-3 rounded-xl border border-dashed border-border/80 bg-muted/20 text-center text-xs text-muted-foreground">
                    Belum ada jadwal follow-up atau interview berikutnya.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {/* Scheduled Interviews */}
                    {data.interviews?.map((item) => (
                      <div
                        key={item.id}
                        className="p-2.5 rounded-xl border border-primary/20 bg-primary/5 text-xs flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="p-1 rounded bg-primary/10 text-primary shrink-0">
                            <Video className="h-3.5 w-3.5" />
                          </div>
                          <div className="min-w-0">
                            <span className="font-bold text-foreground capitalize truncate block">
                              {item.interview_type || "Interview"}
                            </span>
                            <span className="text-[10px] text-muted-foreground block">
                              {new Date(item.scheduled_at).toLocaleString("id-ID", {
                                dateStyle: "medium",
                                timeStyle: "short",
                              })}
                            </span>
                          </div>
                        </div>
                        {item.meeting_url && (
                          <a
                            href={item.meeting_url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[11px] text-primary font-medium hover:underline flex items-center gap-1 shrink-0 ml-2"
                          >
                            <span>Link</span>
                            <ExternalLink className="h-2.5 w-2.5" />
                          </a>
                        )}
                      </div>
                    ))}

                    {/* Pending Follow-ups */}
                    {data.follow_ups?.filter((f) => f.status === "Pending").map((item) => (
                      <div
                        key={item.id}
                        className="p-2.5 rounded-xl border border-border/70 bg-muted/20 text-xs flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="p-1 rounded bg-amber-500/10 text-amber-600 shrink-0">
                            <Clock className="h-3.5 w-3.5" />
                          </div>
                          <span className="font-semibold text-foreground truncate">
                            {item.title}
                          </span>
                        </div>
                        {item.due_at && (
                          <Badge variant="outline" className="text-[10px] py-0 shrink-0 ml-2">
                            {new Date(item.due_at).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                            })}
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Timeline Section */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-primary" />
                    <span>Riwayat Perjalanan (Timeline)</span>
                  </h4>
                  <span className="text-[11px] text-muted-foreground">
                    {data.events.length} Catatan
                  </span>
                </div>

                <ApplicationTimeline events={data.events} status={data.status} />
              </div>

              {/* Direct shareable link */}
              <div className="pt-4 border-t border-border/50 flex justify-between items-center text-xs text-muted-foreground">
                <span>Ingin buka di halaman penuh?</span>
                <Link
                  href={`/applications/${data.id}`}
                  className="text-primary font-medium hover:underline flex items-center gap-1"
                >
                  <span>Buka Halaman Mandiri</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Sub-Dialog: Update Stage */}
      <UpdateStageDialog
        open={isUpdateStageOpen}
        onOpenChange={setIsUpdateStageOpen}
        application={data}
        stages={stages}
        onSuccess={handleStageUpdated}
      />

      {/* Sub-Dialog: Edit Application */}
      <EditApplicationDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        application={data}
        companies={companies}
        stages={stages}
        onSuccess={handleEdited}
      />

      {/* Sub-Dialog: Delete Application */}
      <DeleteApplicationDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        application={data}
        onSuccess={handleDeleted}
      />

      {/* Sub-Dialog: Add Follow-up */}
      <AddFollowUpDialog
        open={isAddFollowUpOpen}
        onOpenChange={setIsAddFollowUpOpen}
        applications={data ? [data] : []}
        defaultApplicationId={data?.id}
        onSuccess={loadDetail}
      />

      {/* Sub-Dialog: Add Interview */}
      <AddInterviewDialog
        open={isAddInterviewOpen}
        onOpenChange={setIsAddInterviewOpen}
        applicationId={data?.id || ""}
        companyName={data?.company?.name}
        position={data?.position}
        onSuccess={loadDetail}
      />
    </>
  )
}
