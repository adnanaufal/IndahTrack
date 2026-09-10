"use client"

import * as React from "react"
import { Plus, Search, Layers, Loader2, Sparkles, SlidersHorizontal } from "lucide-react"
import {
  getApplicationsAction,
  getCompaniesAction,
  getPipelineStagesAction,
  type ApplicationWithDetails,
  type CompanyOption,
  type StageOption,
} from "../applications/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { KanbanBoard } from "@/components/pipeline/kanban-board"
import { AddApplicationDialog } from "@/components/applications/add-application-dialog"
import { UpdateStageDialog } from "@/components/applications/update-stage-dialog"
import { EditApplicationDialog } from "@/components/applications/edit-application-dialog"
import { DeleteApplicationDialog } from "@/components/applications/delete-application-dialog"
import { ApplicationDetailDrawer } from "@/components/applications/application-detail-drawer"

// 7 core recruitment pipeline stages
const CORE_STAGE_SLUGS = [
  "applied",
  "screening",
  "hr-interview",
  "assessment",
  "user-interview",
  "final-interview",
  "offer",
]

export default function PipelinePage() {
  const [applications, setApplications] = React.useState<ApplicationWithDetails[]>([])
  const [companies, setCompanies] = React.useState<CompanyOption[]>([])
  const [stages, setStages] = React.useState<StageOption[]>([])
  const [loading, setLoading] = React.useState(true)

  // Filter & Column Toggle State
  const [searchQuery, setSearchQuery] = React.useState("")
  const [showAllStages, setShowAllStages] = React.useState(false)

  // Dialogs state
  const [isAddOpen, setIsAddOpen] = React.useState(false)
  const [addDefaultStageId, setAddDefaultStageId] = React.useState<string | undefined>(undefined)

  const [selectedAppId, setSelectedAppId] = React.useState<string | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false)

  const [stageUpdatingApp, setStageUpdatingApp] = React.useState<ApplicationWithDetails | null>(null)
  const [editingApp, setEditingApp] = React.useState<ApplicationWithDetails | null>(null)
  const [deletingApp, setDeletingApp] = React.useState<ApplicationWithDetails | null>(null)

  const loadData = React.useCallback(async () => {
    try {
      setLoading(true)
      const [appsRes, compsRes, stagesRes] = await Promise.all([
        getApplicationsAction(),
        getCompaniesAction(),
        getPipelineStagesAction(),
      ])

      if (appsRes.success && appsRes.data) {
        setApplications(appsRes.data)
      }
      if (compsRes.success && compsRes.data) {
        setCompanies(compsRes.data)
      }
      if (stagesRes.success && stagesRes.data) {
        setStages(stagesRes.data)
      }
    } catch (err) {
      // Handled silently
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    loadData()
  }, [loadData])

  // Filter applications by search query
  const filteredApps = React.useMemo(() => {
    if (!searchQuery.trim()) return applications
    const q = searchQuery.toLowerCase()
    return applications.filter(
      (app) =>
        app.position.toLowerCase().includes(q) ||
        app.company?.name.toLowerCase().includes(q) ||
        app.location?.toLowerCase().includes(q) ||
        app.notes?.toLowerCase().includes(q)
    )
  }, [applications, searchQuery])

  // Determine which stages to display in columns
  const visibleStages = React.useMemo(() => {
    if (showAllStages) return stages
    return stages.filter((stg) => CORE_STAGE_SLUGS.includes(stg.slug))
  }, [stages, showAllStages])

  // Handle Quick Add per Column
  const handleQuickAdd = (stageId: string) => {
    setAddDefaultStageId(stageId)
    setIsAddOpen(true)
  }

  // Handle Global Add
  const handleGlobalAdd = () => {
    setAddDefaultStageId(undefined)
    setIsAddOpen(true)
  }

  // Handle Card Click (Opens Drawer)
  const handleSelectApp = (app: ApplicationWithDetails) => {
    setSelectedAppId(app.id)
    setIsDrawerOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <span>Recruitment Pipeline</span>
            <Badge variant="outline" className="text-xs font-normal">
              {applications.length} Lamaran
            </Badge>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Pantau progress lamaran kerja kamu secara visual dan geser kartu (drag & drop) untuk memindahkan tahap.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Toggle 7 Tahap Inti vs Semua Tahap */}
          <Button
            variant={showAllStages ? "default" : "outline"}
            size="sm"
            onClick={() => setShowAllStages((prev) => !prev)}
            className="gap-1.5 text-xs h-9 shadow-xs"
            title="Tampilkan seluruh kolom termasuk Wishlist dan Belum Jodoh"
          >
            <Layers className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">
              {showAllStages ? "Semua Tahap Aktif" : "Tahap Inti"}
            </span>
            <span className="sm:hidden">
              {showAllStages ? "Semua" : "Inti"}
            </span>
          </Button>

          <Button
            onClick={handleGlobalAdd}
            size="sm"
            className="gap-1.5 font-medium shadow-xs"
          >
            <Plus className="h-4 w-4" />
            <span>Tambah Lamaran</span>
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari perusahaan atau posisi di papan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 text-xs sm:text-sm h-9 bg-card border-border/80"
          />
        </div>

        {searchQuery && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSearchQuery("")}
            className="text-xs text-muted-foreground hover:text-foreground h-9"
          >
            Reset Pencarian
          </Button>
        )}
      </div>

      {/* Main Kanban Board */}
      {loading ? (
        <div className="p-16 flex flex-col items-center justify-center space-y-3 bg-card rounded-2xl border border-border/80 shadow-xs">
          <Loader2 className="h-7 w-7 animate-spin text-primary" />
          <p className="text-xs text-muted-foreground">Menyiapkan papan rekrutmen kamu...</p>
        </div>
      ) : (
        <KanbanBoard
          stages={visibleStages}
          applications={filteredApps}
          onSelectApp={handleSelectApp}
          onUpdateStage={(app) => setStageUpdatingApp(app)}
          onQuickAdd={handleQuickAdd}
          onRefresh={loadData}
        />
      )}

      {/* Slide-over Detail Drawer */}
      <ApplicationDetailDrawer
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        applicationId={selectedAppId}
        companies={companies}
        stages={stages}
        onRefresh={loadData}
      />

      {/* Direct Stage Update Modal */}
      <UpdateStageDialog
        open={!!stageUpdatingApp}
        onOpenChange={(open) => !open && setStageUpdatingApp(null)}
        application={stageUpdatingApp}
        stages={stages}
        onSuccess={loadData}
      />

      {/* Add Application Modal (Supports column defaultStageId) */}
      <AddApplicationDialog
        open={isAddOpen}
        onOpenChange={(open) => {
          setIsAddOpen(open)
          if (!open) setAddDefaultStageId(undefined)
        }}
        companies={companies}
        stages={stages}
        defaultStageId={addDefaultStageId}
        onSuccess={loadData}
      />

      {/* Edit Application Modal */}
      <EditApplicationDialog
        open={!!editingApp}
        onOpenChange={(open) => !open && setEditingApp(null)}
        application={editingApp}
        companies={companies}
        stages={stages}
        onSuccess={loadData}
      />

      {/* Delete Application Modal */}
      <DeleteApplicationDialog
        open={!!deletingApp}
        onOpenChange={(open) => !open && setDeletingApp(null)}
        application={deletingApp}
        onSuccess={loadData}
      />
    </div>
  )
}
