"use client"

import * as React from "react"
import { Loader2, Video, Calendar, User, Link as LinkIcon, FileText } from "lucide-react"
import { toast } from "sonner"
import { createInterviewAction } from "@/app/(dashboard)/follow-ups/actions"
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

interface AddInterviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  applicationId: string
  companyName?: string
  position?: string
  onSuccess?: () => void
}

export function AddInterviewDialog({
  open,
  onOpenChange,
  applicationId,
  companyName,
  position,
  onSuccess,
}: AddInterviewDialogProps) {
  const [interviewType, setInterviewType] = React.useState("video")
  const [scheduledAt, setScheduledAt] = React.useState("")
  const [meetingUrl, setMeetingUrl] = React.useState("")
  const [interviewer, setInterviewer] = React.useState("")
  const [notes, setNotes] = React.useState("")
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  React.useEffect(() => {
    if (open) {
      setInterviewType("video")
      // Tomorrow at 10:00 default
      const d = new Date()
      d.setDate(d.getDate() + 1)
      d.setHours(10, 0, 0, 0)
      const pad = (n: number) => n.toString().padStart(2, "0")
      const localIso = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T10:00`
      setScheduledAt(localIso)
      setMeetingUrl("")
      setInterviewer("")
      setNotes("")
    }
  }, [open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!scheduledAt) {
      toast.error("Tentukan tanggal & jam interview terlebih dahulu.")
      return
    }

    try {
      setIsSubmitting(true)
      const res = await createInterviewAction({
        applicationId,
        interviewType,
        scheduledAt,
        meetingUrl,
        interviewer,
        notes,
      })

      if (!res.success) {
        toast.error(res.error || "Gagal mencatat jadwal interview.")
        return
      }

      toast.success("Jadwal interview berhasil dicatat!")
      onOpenChange(false)
      onSuccess?.()
    } catch (err) {
      toast.error("Terjadi kendala jaringan.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Video className="h-4 w-4 text-primary" />
            <span>Jadwalkan Sesi Interview</span>
          </DialogTitle>
          <DialogDescription className="text-xs">
            {position} di {companyName}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {/* Interview Type & Date */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Tipe Interview
              </label>
              <select
                value={interviewType}
                onChange={(e) => setInterviewType(e.target.value)}
                className="w-full h-9 rounded-lg border border-input bg-background px-2.5 text-xs shadow-2xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="video">Video Call (Online)</option>
                <option value="onsite">Onsite (Tatap Muka)</option>
                <option value="phone">Telepon / Phone Screen</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Waktu & Tanggal <span className="text-destructive">*</span>
              </label>
              <Input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                className="text-xs h-9"
                required
              />
            </div>
          </div>

          {/* Meeting URL */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1">
              <LinkIcon className="h-3 w-3 text-muted-foreground" />
              <span>Link Meeting (Google Meet / Zoom)</span>
            </label>
            <Input
              placeholder="https://meet.google.com/..."
              value={meetingUrl}
              onChange={(e) => setMeetingUrl(e.target.value)}
              className="text-xs h-9"
            />
          </div>

          {/* Interviewer */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1">
              <User className="h-3 w-3 text-muted-foreground" />
              <span>Nama Pewawancara / Jabatan (Opsional)</span>
            </label>
            <Input
              placeholder="Contoh: Sarah (Lead HR), Pak Budi (VP Engineering)"
              value={interviewer}
              onChange={(e) => setInterviewer(e.target.value)}
              className="text-xs h-9"
            />
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Kisi-kisi / Hal yang Perlu Disiapkan
            </label>
            <textarea
              placeholder="Siapkan portofolio proyek X, pelajari sistem architecture perusahaan..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full min-h-[70px] rounded-lg border border-input bg-background p-2.5 text-xs shadow-2xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="text-xs"
            >
              Batal
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting}
              className="gap-1.5 text-xs font-semibold shadow-xs"
            >
              {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              <span>Simpan Jadwal Interview</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
