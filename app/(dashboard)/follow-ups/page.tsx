"use client"

import * as React from "react"
import {
  Plus,
  CheckCircle2,
  Clock,
  AlertCircle,
  Calendar,
  Check,
  Edit2,
  Trash2,
  Loader2,
  ChevronRight,
  RotateCw,
  Bell,
} from "lucide-react"
import { toast } from "sonner"
import {
  getFollowUpsAction,
  toggleFollowUpCompleteAction,
  snoozeFollowUpAction,
  deleteFollowUpAction,
  type FollowUpItem,
} from "./actions"
import {
  getApplicationsAction,
  type ApplicationWithDetails,
} from "../applications/actions"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AddFollowUpDialog } from "@/components/follow-ups/add-followup-dialog"
import { EditFollowUpDialog } from "@/components/follow-ups/edit-followup-dialog"

export default function FollowUpsPage() {
  const [followUps, setFollowUps] = React.useState<FollowUpItem[]>([])
  const [applications, setApplications] = React.useState<ApplicationWithDetails[]>([])
  const [loading, setLoading] = React.useState(true)

  // Dialogs state
  const [isAddOpen, setIsAddOpen] = React.useState(false)
  const [editingItem, setEditingItem] = React.useState<FollowUpItem | null>(null)

  const loadData = React.useCallback(async () => {
    try {
      setLoading(true)
      const [followRes, appsRes] = await Promise.all([
        getFollowUpsAction(),
        getApplicationsAction(),
      ])

      if (followRes.success && followRes.data) {
        setFollowUps(followRes.data)
      }
      if (appsRes.success && appsRes.data) {
        setApplications(appsRes.data)
      }
    } catch (err) {
      toast.error("Gagal memuat daftar agenda follow-up.")
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    loadData()
  }, [loadData])

  const handleToggleComplete = async (item: FollowUpItem) => {
    const nextStatus = item.status === "Completed"
    try {
      const res = await toggleFollowUpCompleteAction(item.id, nextStatus)
      if (res.success) {
        toast.success(
          nextStatus
            ? "Status diubah ke Menunggu (Pending)."
            : "Tugas follow-up selesai diselesaikan!"
        )
        loadData()
      } else {
        toast.error(res.error || "Gagal mengubah status.")
      }
    } catch (err) {
      toast.error("Terjadi kendala jaringan.")
    }
  }

  const handleSnooze = async (id: string, days: number) => {
    try {
      const res = await snoozeFollowUpAction(id, days)
      if (res.success) {
        toast.success(`Tenggat waktu diundur +${days} hari.`)
        loadData()
      } else {
        toast.error(res.error || "Gagal mengundur follow-up.")
      }
    } catch (err) {
      toast.error("Terjadi kendala jaringan.")
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await deleteFollowUpAction(id)
      if (res.success) {
        toast.success("Follow-up berhasil dihapus.")
        loadData()
      } else {
        toast.error(res.error || "Gagal menghapus.")
      }
    } catch (err) {
      toast.error("Terjadi kendala jaringan.")
    }
  }

  // Categorize follow-ups by urgency
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const todayEnd = todayStart + 24 * 60 * 60 * 1000

  const overdueList: FollowUpItem[] = []
  const todayList: FollowUpItem[] = []
  const upcomingList: FollowUpItem[] = []
  const completedList: FollowUpItem[] = []

  followUps.forEach((item) => {
    if (item.status === "Completed") {
      completedList.push(item)
      return
    }

    if (!item.due_at) {
      upcomingList.push(item)
      return
    }

    const itemTime = new Date(item.due_at).getTime()
    if (itemTime < todayStart) {
      overdueList.push(item)
    } else if (itemTime >= todayStart && itemTime < todayEnd) {
      todayList.push(item)
    } else {
      upcomingList.push(item)
    }
  })

  const sections = [
    {
      title: "Terlewat (Overdue)",
      icon: AlertCircle,
      color: "text-rose-500",
      items: overdueList,
      badgeVariant: "destructive" as const,
    },
    {
      title: "Hari Ini (Due Today)",
      icon: Clock,
      color: "text-amber-500",
      items: todayList,
      badgeVariant: "warning" as const,
    },
    {
      title: "Mendatang (Upcoming)",
      icon: Calendar,
      color: "text-primary",
      items: upcomingList,
      badgeVariant: "outline" as const,
    },
    {
      title: "Selesai (Completed)",
      icon: CheckCircle2,
      color: "text-emerald-500",
      items: completedList,
      badgeVariant: "success" as const,
    },
  ]

  const formatDueDate = (dateStr: string | null) => {
    if (!dateStr) return "Kapan saja"
    const d = new Date(dateStr)
    return d.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
    })
  }

  return (
    <div className="space-y-6 sm:space-y-8 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <span>Agenda Follow-up & Tindakan</span>
            <Bell className="h-4 w-4 text-primary" />
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Pantau langkah penting agar komunikasimu dengan recruiter tetap terjaga tepat waktu.
          </p>
        </div>

        <Button
          onClick={() => setIsAddOpen(true)}
          size="sm"
          className="gap-1.5 font-medium shadow-xs"
        >
          <Plus className="h-4 w-4" />
          <span>Tugas Follow-up Baru</span>
        </Button>
      </div>

      {/* Task Sections */}
      {loading ? (
        <div className="p-16 flex flex-col items-center justify-center space-y-3 bg-card rounded-2xl border border-border/80 shadow-2xs">
          <Loader2 className="h-7 w-7 animate-spin text-primary" />
          <p className="text-xs text-muted-foreground">Memuat agenda tindak lanjut...</p>
        </div>
      ) : followUps.length === 0 ? (
        <Card className="p-8 sm:p-12 text-center border-dashed">
          <div className="max-w-md mx-auto space-y-3 flex flex-col items-center justify-center">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-base text-foreground">
              Belum Ada Agenda Follow-up
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Catat rencana pengiriman email terima kasih, follow-up hasil screening, atau jadwal konfirmasi status lamaran kamu.
            </p>
            <Button
              onClick={() => setIsAddOpen(true)}
              size="sm"
              className="gap-1.5 font-medium mt-2"
            >
              <Plus className="h-4 w-4" />
              <span>Tambah Follow-up Pertama</span>
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          {sections.map((sec) => {
            if (sec.items.length === 0) return null
            const Icon = sec.icon
            return (
              <div key={sec.title} className="space-y-3">
                <div className="flex items-center gap-2">
                  <Icon className={`h-4 w-4 ${sec.color}`} />
                  <h3 className="text-xs sm:text-sm font-bold tracking-wider text-muted-foreground uppercase">
                    {sec.title} ({sec.items.length})
                  </h3>
                </div>

                <div className="space-y-2.5">
                  {sec.items.map((item) => {
                    const isDone = item.status === "Completed"
                    return (
                      <Card
                        key={item.id}
                        className={`p-3.5 sm:p-4 border-border/80 hover:border-primary/40 transition-all shadow-2xs ${
                          isDone ? "opacity-60 bg-muted/20" : "bg-card"
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          {/* Left: Complete checkbox + Title & Company info */}
                          <div className="flex items-start gap-3 min-w-0">
                            <button
                              type="button"
                              onClick={() => handleToggleComplete(item)}
                              className={`mt-0.5 sm:mt-0 h-5 w-5 rounded-md border flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                                isDone
                                  ? "bg-primary text-primary-foreground border-primary"
                                  : "border-border hover:border-primary bg-background"
                              }`}
                              title={isDone ? "Tandai belum selesai" : "Tandai selesai"}
                            >
                              {isDone && <Check className="h-3.5 w-3.5" />}
                            </button>

                            <div className="space-y-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-xs sm:text-sm text-foreground">
                                  {item.application?.company?.name || "Perusahaan"}
                                </span>
                                <Badge variant="outline" className="text-[10px] py-0">
                                  {item.application?.position}
                                </Badge>
                                {item.application?.stage?.name && (
                                  <Badge variant="purple" className="text-[10px] py-0 font-medium">
                                    {item.application.stage.name}
                                  </Badge>
                                )}
                              </div>

                              <p
                                className={`text-xs text-foreground/90 font-medium ${
                                  isDone ? "line-through text-muted-foreground" : ""
                                }`}
                              >
                                {item.title}
                              </p>

                              {item.description && (
                                <p className="text-[11px] text-muted-foreground line-clamp-1 italic">
                                  "{item.description}"
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Right: Due Date badge & Action Buttons */}
                          <div className="flex items-center justify-between sm:justify-end gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/50 shrink-0">
                            <Badge variant={sec.badgeVariant} className="text-[11px]">
                              {formatDueDate(item.due_at)}
                            </Badge>

                            {/* Snooze actions if not done */}
                            {!isDone && (
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleSnooze(item.id, 2)}
                                  className="h-7 px-1.5 text-[10px] text-muted-foreground hover:text-foreground font-medium"
                                  title="Mundur 2 hari"
                                >
                                  +2h
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleSnooze(item.id, 7)}
                                  className="h-7 px-1.5 text-[10px] text-muted-foreground hover:text-foreground font-medium"
                                  title="Mundur 7 hari (1 minggu)"
                                >
                                  +7h
                                </Button>
                              </div>
                            )}

                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => setEditingItem(item)}
                              className="h-7 w-7 text-muted-foreground hover:text-foreground"
                              title="Edit tugas"
                            >
                              <Edit2 className="h-3 w-3" />
                            </Button>

                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => handleDelete(item.id)}
                              className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                              title="Hapus tugas"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Add Dialog */}
      <AddFollowUpDialog
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        applications={applications}
        onSuccess={loadData}
      />

      {/* Edit Dialog */}
      <EditFollowUpDialog
        open={!!editingItem}
        onOpenChange={(open) => !open && setEditingItem(null)}
        item={editingItem}
        onSuccess={loadData}
      />
    </div>
  )
}
