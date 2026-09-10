"use client"

import * as React from "react"
import { useDroppable } from "@dnd-kit/core"
import { Plus, Inbox } from "lucide-react"
import {
  type ApplicationWithDetails,
  type StageOption,
} from "@/app/(dashboard)/applications/actions"
import { Button } from "@/components/ui/button"
import { KanbanCard } from "./kanban-card"

interface KanbanColumnProps {
  stage: StageOption
  applications: ApplicationWithDetails[]
  onSelectApp: (application: ApplicationWithDetails) => void
  onUpdateStage: (application: ApplicationWithDetails) => void
  onQuickAdd: (stageId: string) => void
}

export function KanbanColumn({
  stage,
  applications,
  onSelectApp,
  onUpdateStage,
  onQuickAdd,
}: KanbanColumnProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: stage.id,
    data: { stage },
  })

  // Accent border color based on stage slug
  const getStageColor = (slug: string) => {
    switch (slug) {
      case "applied":
        return "border-t-amber-900 dark:border-t-amber-700"
      case "screening":
        return "border-t-amber-800 dark:border-t-amber-600"
      case "hr-interview":
        return "border-t-rose-400 dark:border-t-rose-400"
      case "assessment":
        return "border-t-amber-600 dark:border-t-amber-500"
      case "user-interview":
        return "border-t-rose-500 dark:border-t-rose-400"
      case "final-interview":
        return "border-t-pink-600 dark:border-t-pink-400"
      case "offer":
        return "border-t-emerald-600 dark:border-t-emerald-400"
      case "accepted":
      case "completed":
        return "border-t-emerald-700 dark:border-t-emerald-500"
      case "rejected":
      case "ghosted":
      case "withdrawn":
        return "border-t-rose-800 dark:border-t-rose-600"
      case "wishlist":
      default:
        return "border-t-amber-950/40 dark:border-t-amber-800/50"
    }
  }

  const borderTopClass = getStageColor(stage.slug)

  return (
    <div className="w-[280px] sm:w-[300px] shrink-0 flex flex-col bg-muted/40 rounded-2xl border border-border/70 overflow-hidden shadow-2xs">
      {/* Column Header */}
      <div
        className={`px-3.5 py-3 border-t-4 ${borderTopClass} bg-card/60 flex items-center justify-between border-b border-border/60`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-bold text-xs text-foreground uppercase tracking-wider truncate">
            {stage.name}
          </span>
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-background border border-border/80 text-muted-foreground shrink-0 shadow-2xs">
            {applications.length}
          </span>
        </div>

        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => onQuickAdd(stage.id)}
          className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-muted shrink-0"
          title={`Tambah lamaran baru di tahap ${stage.name}`}
        >
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Droppable Card Container */}
      <div
        ref={setNodeRef}
        className={`p-2.5 space-y-2.5 flex-1 min-h-[380px] max-h-[calc(100vh-280px)] overflow-y-auto transition-colors duration-200 ${
          isOver
            ? "bg-primary/5 ring-2 ring-primary/30 border-dashed border-primary"
            : ""
        }`}
      >
        {applications.length === 0 ? (
          <div className="h-44 rounded-xl border border-dashed border-border/70 flex flex-col items-center justify-center p-4 text-center space-y-2 bg-card/20">
            <Inbox className="h-5 w-5 text-muted-foreground/50" />
            <p className="text-[11px] text-muted-foreground">
              Belum ada lamaran di tahap ini.
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onQuickAdd(stage.id)}
              className="text-[10px] h-6 px-2 text-primary font-medium"
            >
              + Catat di sini
            </Button>
          </div>
        ) : (
          applications.map((app) => (
            <KanbanCard
              key={app.id}
              application={app}
              onClick={onSelectApp}
              onUpdateStage={onUpdateStage}
            />
          ))
        )}
      </div>
    </div>
  )
}
