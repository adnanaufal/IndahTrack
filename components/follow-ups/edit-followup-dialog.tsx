"use client"

import * as React from "react"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import {
  updateFollowUpAction,
  type FollowUpItem,
} from "@/app/(dashboard)/follow-ups/actions"
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

interface EditFollowUpDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: FollowUpItem | null
  onSuccess?: () => void
}

export function EditFollowUpDialog({
  open,
  onOpenChange,
  item,
  onSuccess,
}: EditFollowUpDialogProps) {
  const [title, setTitle] = React.useState("")
  const [dueDate, setDueDate] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [status, setStatus] = React.useState<"Pending" | "Completed" | "Cancelled">("Pending")
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  React.useEffect(() => {
    if (item && open) {
      setTitle(item.title)
      setDueDate(item.due_at ? item.due_at.split("T")[0] : "")
      setDescription(item.description || "")
      setStatus(item.status)
    }
  }, [item, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!item) return
    if (!title.trim()) {
      toast.error("Judul follow-up tidak boleh kosong.")
      return
    }

    try {
      setIsSubmitting(true)
      const res = await updateFollowUpAction({
        id: item.id,
        title,
        description,
        dueAt: dueDate ? `${dueDate}T09:00:00` : undefined,
        status,
      })

      if (!res.success) {
        toast.error(res.error || "Gagal memperbarui follow-up.")
        return
      }

      toast.success("Follow-up berhasil diperbarui!")
      onOpenChange(false)
      onSuccess?.()
    } catch (err) {
      toast.error("Terjadi kendala jaringan.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!item) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg">
            Ubah Agenda Follow-up
          </DialogTitle>
          <DialogDescription className="text-xs">
            {item.application?.position} di {item.application?.company?.name}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Tindakan / Tugas <span className="text-destructive">*</span>
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-xs h-9"
              required
            />
          </div>

          {/* Due Date & Status */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Tenggat Waktu
              </label>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="text-xs h-9"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Status
              </label>
              <select
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value as "Pending" | "Completed" | "Cancelled")
                }
                className="w-full h-9 rounded-lg border border-input bg-background px-2.5 text-xs shadow-2xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="Pending">Menunggu (Pending)</option>
                <option value="Completed">Selesai (Completed)</option>
                <option value="Cancelled">Dibatalkan</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Catatan
            </label>
            <textarea
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
              <span>Simpan Perubahan</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
