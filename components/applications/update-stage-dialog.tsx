"use client"

import * as React from "react"
import { Loader2, ArrowRight, Video, Calendar, User, Link as LinkIcon, Sparkles } from "lucide-react"
import { toast } from "sonner"
import {
  updateStageAction,
  type ApplicationWithDetails,
  type StageOption,
} from "@/app/(dashboard)/applications/actions"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface UpdateStageDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  application: ApplicationWithDetails | null
  stages: StageOption[]
  defaultTargetStageId?: string
  onSuccess?: () => void
}

export function UpdateStageDialog({
  open,
  onOpenChange,
  application,
  stages,
  defaultTargetStageId,
  onSuccess,
}: UpdateStageDialogProps) {
  const [selectedStageId, setSelectedStageId] = React.useState("")
  const [eventDate, setEventDate] = React.useState("")
  const [notes, setNotes] = React.useState("")
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  // Interview optional details
  const [includeInterview, setIncludeInterview] = React.useState(false)
  const [interviewDate, setInterviewDate] = React.useState("")
  const [interviewType, setInterviewType] = React.useState("video")
  const [meetingUrl, setMeetingUrl] = React.useState("")
  const [interviewer, setInterviewer] = React.useState("")

  const selectedStage = stages.find((s) => s.id === selectedStageId)
  const isInterviewStage =
    selectedStage?.slug.includes("interview") ||
    selectedStage?.slug === "hr-interview" ||
    selectedStage?.slug === "user-interview" ||
    selectedStage?.slug === "final-interview"

  // Reset/populate form when dialog opens
  React.useEffect(() => {
    if (application) {
      // Pick next stage by position as initial recommendation if possible
      const currentPos = application.stage?.position || 1
      const nextStage =
        stages.find((s) => s.position === currentPos + 1) ||
        stages.find((s) => s.id === application.current_stage_id) ||
        stages[0]

      const initialStageId = defaultTargetStageId || nextStage?.id || application.current_stage_id
      setSelectedStageId(initialStageId)
      setEventDate(new Date().toISOString().split("T")[0])
      setNotes("")
      setIncludeInterview(false)
      setInterviewDate("")
      setMeetingUrl("")
      setInterviewer("")
    }
  }, [application, stages, open, defaultTargetStageId])

  // Automatically enable interview toggle if user picks an interview stage
  React.useEffect(() => {
    if (isInterviewStage) {
      setIncludeInterview(true)
    }
  }, [isInterviewStage])

  if (!application) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedStageId) return

    try {
      setIsSubmitting(true)
      const res = await updateStageAction({
        applicationId: application.id,
        newStageId: selectedStageId,
        eventDate,
        notes,
        interview:
          includeInterview && interviewDate
            ? {
                scheduledAt: interviewDate,
                interviewType,
                meetingUrl,
                interviewer,
                notes,
              }
            : undefined,
      })

      if (!res.success) {
        toast.error(res.error || "Gagal memindahkan tahapan.")
        setIsSubmitting(false)
        return
      }

      toast.success(
        `Tahapan di ${application.company?.name} berhasil dipindahkan ke ${selectedStage?.name}!`
      )
      onOpenChange(false)
      onSuccess?.()
    } catch (err) {
      toast.error("Terjadi kendala jaringan saat memindahkan tahapan.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
            <span>Pindah Tahapan Lamaran</span>
          </DialogTitle>
          <DialogDescription>
            Pindahkan posisi <strong className="text-foreground">{application.position}</strong> di{" "}
            <strong className="text-foreground">{application.company?.name}</strong> ke tahapan berikutnya
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {/* Current vs Next Stage Indicator */}
          <div className="p-3 rounded-xl bg-muted/40 border border-border/70 flex items-center justify-between text-xs">
            <div>
              <span className="text-muted-foreground block text-[10px]">Tahap Sebelumnya</span>
              <span className="font-semibold text-foreground">
                {application.stage?.name || "Applied"}
              </span>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
            <div className="text-right">
              <span className="text-muted-foreground block text-[10px]">Pindah Ke</span>
              <span className="font-semibold text-primary">
                {selectedStage?.name || "Pilih tahap..."}
              </span>
            </div>
          </div>

          {/* New Stage Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Pilih Tahapan Baru <span className="text-destructive">*</span>
            </label>
            <select
              value={selectedStageId}
              onChange={(e) => setSelectedStageId(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs sm:text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              disabled={isSubmitting}
            >
              {stages.map((stg) => (
                <option key={stg.id} value={stg.id}>
                  {stg.name}
                </option>
              ))}
            </select>
          </div>

          {/* Event Date */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Tanggal Kejadian <span className="text-destructive">*</span>
            </label>
            <Input
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className="text-xs sm:text-sm h-9"
              disabled={isSubmitting}
              required
            />
          </div>

          {/* Notes / Reflections */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">
              Catatan / Pesan HR
            </label>
            <textarea
              rows={2}
              placeholder="Contoh: HR info hasil screening lolos, lanjut interview user minggu depan..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-xs sm:text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
              disabled={isSubmitting}
            />
          </div>

          {/* Interview Details (Conditional) */}
          {isInterviewStage && (
            <div className="p-3.5 rounded-xl border border-purple-500/30 bg-purple-500/5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Video className="h-3.5 w-3.5 text-purple-500" />
                  <span>Jadwal & Link Interview</span>
                </span>
                <input
                  type="checkbox"
                  checked={includeInterview}
                  onChange={(e) => setIncludeInterview(e.target.checked)}
                  className="rounded border-border"
                />
              </div>

              {includeInterview && (
                <div className="space-y-2.5 pt-1">
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-muted-foreground">
                      Waktu Interview
                    </label>
                    <Input
                      type="datetime-local"
                      value={interviewDate}
                      onChange={(e) => setInterviewDate(e.target.value)}
                      className="text-xs h-8"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-muted-foreground">
                      Link Meeting (Google Meet / Zoom)
                    </label>
                    <Input
                      type="url"
                      placeholder="https://meet.google.com/..."
                      value={meetingUrl}
                      onChange={(e) => setMeetingUrl(e.target.value)}
                      className="text-xs h-8"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-muted-foreground">
                      Nama Interviewer (Opsional)
                    </label>
                    <Input
                      type="text"
                      placeholder="Contoh: Mas Adit (Engineering Lead)"
                      value={interviewer}
                      onChange={(e) => setInterviewer(e.target.value)}
                      className="text-xs h-8"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button
              type="submit"
              size="sm"
              className="gap-1.5 font-medium"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Update Tahapan</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
