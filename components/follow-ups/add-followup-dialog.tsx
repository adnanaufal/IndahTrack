"use client"

import * as React from "react"
import { Loader2, Plus, Calendar, FileText } from "lucide-react"
import { toast } from "sonner"
import {
  createFollowUpAction,
  type FollowUpItem,
} from "@/app/(dashboard)/follow-ups/actions"
import { type ApplicationWithDetails } from "@/app/(dashboard)/applications/actions"
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

interface AddFollowUpDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  applications: ApplicationWithDetails[]
  defaultApplicationId?: string
  onSuccess?: () => void
}

export function AddFollowUpDialog({
  open,
  onOpenChange,
  applications,
  defaultApplicationId,
  onSuccess,
}: AddFollowUpDialogProps) {
  const [applicationId, setApplicationId] = React.useState("")
  const [title, setTitle] = React.useState("")
  const [dueDate, setDueDate] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  React.useEffect(() => {
    if (open) {
      setApplicationId(defaultApplicationId || (applications[0]?.id ?? ""))
      setTitle("")
      // Default due date: 3 days from now
      const d = new Date()
      d.setDate(d.getDate() + 3)
      setDueDate(d.toISOString().split("T")[0])
      setDescription("")
    }
  }, [open, defaultApplicationId, applications])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!applicationId) {
      toast.error("Pilih lamaran terkait terlebih dahulu.")
      return
    }
    if (!title.trim()) {
      toast.error("Judul follow-up tidak boleh kosong.")
      return
    }

    try {
      setIsSubmitting(true)
      const res = await createFollowUpAction({
        applicationId,
        title,
        description,
        dueAt: dueDate ? `${dueDate}T09:00:00` : undefined,
      })

      if (!res.success) {
        toast.error(res.error || "Gagal membuat pengingat follow-up.")
        return
      }

      toast.success("Pengingat follow-up berhasil dicatat!")
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
            <span>Tambah Agenda Follow-up</span>
          </DialogTitle>
          <DialogDescription className="text-xs">
            Jadwalkan langkah selanjutnya agar proses lamaran kamu tidak terlewat
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {/* Application Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Lamaran Terkait <span className="text-destructive">*</span>
            </label>
            <select
              value={applicationId}
              onChange={(e) => setApplicationId(e.target.value)}
              className="w-full h-9 rounded-lg border border-input bg-background px-3 text-xs shadow-2xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              {applications.map((app) => (
                <option key={app.id} value={app.id}>
                  {app.position} - {app.company?.name}
                </option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Tindakan / Tugas <span className="text-destructive">*</span>
            </label>
            <Input
              placeholder="Contoh: Follow up hasil interview HR via email"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-xs h-9"
              required
            />
          </div>

          {/* Due Date */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Tenggat Waktu (Due Date)
            </label>
            <Input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="text-xs h-9"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Catatan Tambahan (Opsional)
            </label>
            <textarea
              placeholder="Tambahkan detail konteks atau hal penting yang perlu ditanyakan..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
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
              <span>Simpan Agenda</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
