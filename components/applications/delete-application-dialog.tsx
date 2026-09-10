"use client"

import * as React from "react"
import { AlertTriangle, Loader2, Trash2 } from "lucide-react"
import { toast } from "sonner"
import {
  deleteApplicationAction,
  type ApplicationWithDetails,
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

interface DeleteApplicationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  application: ApplicationWithDetails | null
  onSuccess?: () => void
}

export function DeleteApplicationDialog({
  open,
  onOpenChange,
  application,
  onSuccess,
}: DeleteApplicationDialogProps) {
  const [isDeleting, setIsDeleting] = React.useState(false)

  if (!application) return null

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      const res = await deleteApplicationAction(application.id)

      if (!res.success) {
        toast.error(res.error || "Gagal menghapus lamaran.")
        setIsDeleting(false)
        return
      }

      toast.success(`Lamaran di ${application.company?.name} berhasil dihapus.`)
      onOpenChange(false)
      onSuccess?.()
    } catch (err) {
      toast.error("Terjadi kendala jaringan saat menghapus lamaran.")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2.5 text-destructive mb-1">
            <div className="p-2 rounded-full bg-destructive/15">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <DialogTitle className="text-base sm:text-lg">
              Hapus Catatan Lamaran?
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs leading-relaxed pt-1">
            Kamu yakin ingin menghapus lamaran posisi{" "}
            <strong className="text-foreground">{application.position}</strong> di{" "}
            <strong className="text-foreground">{application.company?.name}</strong>?
            <br />
            <span className="text-destructive/90 mt-1.5 flex items-center gap-1.5 font-medium">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
              <span>Tindakan ini permanen. Semua riwayat timeline dan catatan terkait lamaran ini akan ikut terhapus.</span>
            </span>
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="mt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Batal
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            className="gap-2 font-medium"
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Menghapus...</span>
              </>
            ) : (
              <>
                <Trash2 className="h-3.5 w-3.5" />
                <span>Hapus Lamaran</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
