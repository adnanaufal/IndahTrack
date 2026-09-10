"use client"

import * as React from "react"
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  type ApplicationWithDetails,
  type StageOption,
} from "@/app/(dashboard)/applications/actions"
import { KanbanColumn } from "./kanban-column"
import { KanbanCard } from "./kanban-card"
import { UpdateStageDialog } from "@/components/applications/update-stage-dialog"

interface KanbanBoardProps {
  stages: StageOption[]
  applications: ApplicationWithDetails[]
  onSelectApp: (app: ApplicationWithDetails) => void
  onUpdateStage: (app: ApplicationWithDetails) => void
  onQuickAdd: (stageId: string) => void
  onRefresh: () => void
}

export function KanbanBoard({
  stages,
  applications,
  onSelectApp,
  onUpdateStage,
  onQuickAdd,
  onRefresh,
}: KanbanBoardProps) {
  const [activeApp, setActiveApp] = React.useState<ApplicationWithDetails | null>(null)
  const [moveConfirmation, setMoveConfirmation] = React.useState<{
    application: ApplicationWithDetails
    targetStageId: string
  } | null>(null)

  // Configure sensors: 6px distance to separate click from drag
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 6,
      },
    }),
    useSensor(KeyboardSensor)
  )

  const handleDragStart = (event: DragStartEvent) => {
    const app =
      (event.active.data.current?.application as ApplicationWithDetails) ||
      applications.find((a) => a.id === event.active.id) ||
      null
    setActiveApp(app)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveApp(null)

    if (!over) return

    const targetStageId = over.id as string
    const app =
      (active.data.current?.application as ApplicationWithDetails) ||
      applications.find((a) => a.id === active.id)

    if (app && targetStageId && app.current_stage_id !== targetStageId) {
      // Trigger identical business logic via Move Confirmation modal
      setMoveConfirmation({
        application: app,
        targetStageId,
      })
    }
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-8 pt-1 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
          {stages.map((stage) => {
            const stageApps = applications.filter(
              (app) => app.current_stage_id === stage.id
            )
            return (
              <KanbanColumn
                key={stage.id}
                stage={stage}
                applications={stageApps}
                onSelectApp={onSelectApp}
                onUpdateStage={onUpdateStage}
                onQuickAdd={onQuickAdd}
              />
            )
          })}
        </div>

        {/* Drag Overlay: floating preview card while dragging */}
        <DragOverlay dropAnimation={null}>
          {activeApp ? (
            <div className="w-[275px] sm:w-[295px]">
              <KanbanCard
                application={activeApp}
                onClick={() => {}}
                onUpdateStage={() => {}}
                isOverlay
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Move Confirmation Dialog (Shares exact same UpdateStageDialog business logic) */}
      <UpdateStageDialog
        open={!!moveConfirmation}
        onOpenChange={(open) => !open && setMoveConfirmation(null)}
        application={moveConfirmation?.application || null}
        stages={stages}
        defaultTargetStageId={moveConfirmation?.targetStageId}
        onSuccess={() => {
          setMoveConfirmation(null)
          onRefresh()
        }}
      />
    </>
  )
}
