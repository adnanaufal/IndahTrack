"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  Building2,
  Calendar,
  ExternalLink,
  MapPin,
  DollarSign,
  Briefcase,
  Edit2,
  Trash2,
  Sparkles,
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
  getCompaniesAction,
  getPipelineStagesAction,
  type ApplicationDetailData,
  type CompanyOption,
  type StageOption,
} from "../actions"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ApplicationTimeline } from "@/components/applications/application-timeline"
import { UpdateStageDialog } from "@/components/applications/update-stage-dialog"
import { EditApplicationDialog } from "@/components/applications/edit-application-dialog"
import { DeleteApplicationDialog } from "@/components/applications/delete-application-dialog"
import { AddFollowUpDialog } from "@/components/follow-ups/add-followup-dialog"
import { AddInterviewDialog } from "@/components/follow-ups/add-interview-dialog"

export default function ApplicationDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string

  const [data, setData] = React.useState<ApplicationDetailData | null>(null)
  const [companies, setCompanies] = React.useState<CompanyOption[]>([])
  const [stages, setStages] = React.useState<StageOption[]>([])
  const [loading, setLoading] = React.useState(true)

  // Dialogs
  const [isUpdateStageOpen, setIsUpdateStageOpen] = React.useState(false)
  const [isEditOpen, setIsEditOpen] = React.useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false)
  const [isAddFollowUpOpen, setIsAddFollowUpOpen] = React.useState(false)
  const [isAddInterviewOpen, setIsAddInterviewOpen] = React.useState(false)

  const loadData = React.useCallback(async () => {
    if (!id) return
    try {
      setLoading(true)
      const [detailRes, compsRes, stagesRes] = await Promise.all([
        getApplicationDetailAction(id),
        getCompaniesAction(),
        getPipelineStagesAction(),
      ])

      if (detailRes.success && detailRes.data) {
        setData(detailRes.data)
      } else {
        toast.error(detailRes.error || "Lamaran tidak ditemukan.")
      }

      if (compsRes.success && compsRes.data) {
        setCompanies(compsRes.data)
      }
      if (stagesRes.success && stagesRes.data) {
        setStages(stagesRes.data)
      }
    } catch (err) {
      toast.error("Terjadi kesalahan jaringan saat memuat data lamaran.")
    } finally {
      setLoading(false)
    }
  }, [id])

  React.useEffect(() => {
    loadData()
  }, [loadData])

  const handleDeleted = () => {
    toast.success("Lamaran berhasil dihapus.")
    router.push("/applications")
  }

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

  if (loading) {
    return (
      <div className="p-16 flex flex-col items-center justify-center space-y-3 bg-card rounded-2xl border border-border/80 shadow-xs">
        <Loader2 className="h-7 w-7 animate-spin text-primary" />
        <p className="text-xs text-muted-foreground">Memuat detail lamaran kamu...</p>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="space-y-4 text-center py-16">
        <h2 className="text-lg font-bold text-foreground">Data Lamaran Tidak Ditemukan</h2>
        <p className="text-xs text-muted-foreground">
          Lamaran mungkin sudah dihapus atau kamu tidak memiliki akses.
        </p>
        <Link href="/applications">
          <Button variant="outline" size="sm" className="gap-2 text-xs">
            <ArrowLeft className="h-4 w-4" />
            <span>Kembali ke Daftar Lamaran</span>
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Back Navigation & Page Actions */}
      <div className="flex items-center justify-between">
        <Link
          href="/applications"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Kembali ke Daftar Lamaran</span>
        </Link>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => setIsUpdateStageOpen(true)}
            size="sm"
            className="gap-1.5 text-xs font-semibold shadow-xs"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Pindah Tahapan</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditOpen(true)}
            className="gap-1 text-xs"
          >
            <Edit2 className="h-3.5 w-3.5 text-muted-foreground" />
            <span>Edit</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsDeleteOpen(true)}
            className="gap-1 text-xs text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Hapus</span>
          </Button>
        </div>
      </div>

      {/* Main Header Card */}
      <Card className="p-6 border-border/80 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="h-14 w-14 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-black text-xl shrink-0 shadow-xs">
              {data.company?.name ? data.company.name[0].toUpperCase() : "J"}
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
                {data.position}
              </h1>
              <div className="text-sm text-muted-foreground flex flex-wrap items-center gap-2 mt-1">
                <span className="font-semibold text-foreground">{data.company?.name}</span>
                {data.location && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-muted-foreground/80" />
                      {data.location}
                    </span>
                  </>
                )}
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground/80" />
                  Di-apply {data.application_date}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="purple" className="text-xs font-bold px-3 py-1">
              {data.stage?.name || "Applied"}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {data.status === "Active" ? "Sedang Aktif" : data.status === "Rejected" ? "Belum Jodoh" : data.status}
            </Badge>
          </div>
        </div>

        {/* Metadata Badges */}
        <div className="flex flex-wrap items-center gap-2.5 mt-5 pt-4 border-t border-border/60">
          <Badge variant="outline" className="text-xs font-medium">
            <Briefcase className="h-3 w-3 mr-1 text-muted-foreground" />
            {data.employment_type || "Full-time"}
          </Badge>

          {data.source && (
            <Badge variant="outline" className="text-xs font-medium">
              Sumber: {data.source}
            </Badge>
          )}

          {salaryDisplay && (
            <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 ml-auto">
              <DollarSign className="h-4 w-4" />
              <span>{salaryDisplay}</span>
            </div>
          )}
        </div>
      </Card>

      {/* Two-column Layout: Left details, Right timeline & interviews */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Info & Notes */}
        <div className="space-y-6 lg:col-span-1">
          {/* Job Link */}
          {data.job_url && (
            <Card className="p-4 border-border/80 shadow-xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                Tautan Lowongan
              </h3>
              <a
                href={data.job_url}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-primary font-medium flex items-center justify-between p-2.5 rounded-xl bg-primary/5 hover:bg-primary/10 transition-colors border border-primary/10"
              >
                <span className="truncate mr-2">Buka Website Lowongan</span>
                <ExternalLink className="h-3.5 w-3.5 shrink-0" />
              </a>
            </Card>
          )}

          {/* Notes */}
          <Card className="p-4 border-border/80 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
              Catatan & Refleksi
            </h3>
            {data.notes ? (
              <p className="text-xs text-foreground leading-relaxed whitespace-pre-wrap bg-muted/20 p-3 rounded-xl border border-border/60">
                {data.notes}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground italic">
                Belum ada catatan untuk lamaran ini. Klik edit untuk menambahkan kesan atau kisi-kisi.
              </p>
            )}
          </Card>

          {/* Tindakan Berikutnya & Jadwal (Next Action & Schedule) */}
          <Card className="p-4 border-border/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                <CalendarCheck className="h-3.5 w-3.5 text-primary" />
                <span>Tindakan & Jadwal</span>
              </h3>
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
              <p className="text-xs text-muted-foreground italic">
                Belum ada agenda follow-up atau interview berikutnya.
              </p>
            ) : (
              <div className="space-y-2">
                {/* Interviews */}
                {data.interviews?.map((item) => (
                  <div
                    key={item.id}
                    className="p-2.5 rounded-xl bg-primary/5 border border-primary/20 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between font-semibold text-foreground">
                      <span className="capitalize">{item.interview_type || "Interview"}</span>
                      <span className="text-[11px] text-muted-foreground">
                        {new Date(item.scheduled_at).toLocaleString("id-ID", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </span>
                    </div>
                    {item.interviewer && (
                      <p className="text-[11px] text-muted-foreground">
                        Interviewer: <span className="font-medium text-foreground">{item.interviewer}</span>
                      </p>
                    )}
                    {item.meeting_url && (
                      <a
                        href={item.meeting_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] text-primary font-medium hover:underline pt-0.5"
                      >
                        <span>Link Meeting</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                ))}

                {/* Follow-ups */}
                {data.follow_ups?.filter((f) => f.status === "Pending").map((item) => (
                  <div
                    key={item.id}
                    className="p-2.5 rounded-xl bg-muted/20 border border-border/70 text-xs flex items-center justify-between"
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
          </Card>
        </div>

        {/* Right Column: Interactive Append-Only Timeline */}
        <div className="lg:col-span-2">
          <Card className="p-6 border-border/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border/60">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <h2 className="text-sm sm:text-base font-bold text-foreground">
                  Perjalanan Seleksi (Recruitment Timeline)
                </h2>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsUpdateStageOpen(true)}
                className="h-8 gap-1.5 text-xs text-primary border-primary/30 hover:bg-primary/5 font-semibold"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Update Tahapan</span>
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">
              Setiap tahapan seleksi yang kamu lalui tercatat rapi di bawah ini sebagai riwayat perjalanan karirmu.
            </p>

            <ApplicationTimeline events={data.events} status={data.status} />
          </Card>
        </div>
      </div>

      {/* Sub-Dialogs */}
      <UpdateStageDialog
        open={isUpdateStageOpen}
        onOpenChange={setIsUpdateStageOpen}
        application={data}
        stages={stages}
        onSuccess={loadData}
      />

      <EditApplicationDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        application={data}
        companies={companies}
        stages={stages}
        onSuccess={loadData}
      />

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
        onSuccess={loadData}
      />

      {/* Sub-Dialog: Add Interview */}
      <AddInterviewDialog
        open={isAddInterviewOpen}
        onOpenChange={setIsAddInterviewOpen}
        applicationId={data?.id || ""}
        companyName={data?.company?.name}
        position={data?.position}
        onSuccess={loadData}
      />
    </div>
  )
}
