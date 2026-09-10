"use client"

import * as React from "react"
import { useSearchParams } from "next/navigation"
import {
  Search,
  ArrowUpDown,
  Plus,
  Inbox,
  Loader2,
  LayoutList,
  LayoutGrid,
  Filter,
  Sparkles,
} from "lucide-react"
import {
  getApplicationsAction,
  getCompaniesAction,
  getPipelineStagesAction,
  type ApplicationWithDetails,
  type CompanyOption,
  type StageOption,
} from "./actions"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AddApplicationDialog } from "@/components/applications/add-application-dialog"
import { EditApplicationDialog } from "@/components/applications/edit-application-dialog"
import { DeleteApplicationDialog } from "@/components/applications/delete-application-dialog"
import { UpdateStageDialog } from "@/components/applications/update-stage-dialog"
import { ApplicationDetailDrawer } from "@/components/applications/application-detail-drawer"
import { ApplicationTableView } from "@/components/applications/application-table-view"
import { ApplicationCardView } from "@/components/applications/application-card-view"
import {
  AdvancedFilterPopover,
  type FilterValues,
} from "@/components/applications/advanced-filter-popover"

const INITIAL_FILTERS: FilterValues = {
  stageId: "all",
  employmentType: "",
  source: "",
  hasSalaryOnly: false,
}

function ApplicationsContent() {
  const searchParams = useSearchParams()
  const autoOpenNew = searchParams.get("new") === "true"

  const [applications, setApplications] = React.useState<ApplicationWithDetails[]>([])
  const [companies, setCompanies] = React.useState<CompanyOption[]>([])
  const [stages, setStages] = React.useState<StageOption[]>([])
  const [loading, setLoading] = React.useState(true)

  // View Mode: Table vs Card
  const [viewMode, setViewMode] = React.useState<"table" | "card">("table")

  // Search & Filter State
  const [searchQuery, setSearchQuery] = React.useState("")
  const [quickStatus, setQuickStatus] = React.useState<
    "all" | "active" | "interview" | "offering" | "rejected"
  >("all")
  const [advancedFilters, setAdvancedFilters] = React.useState<FilterValues>(INITIAL_FILTERS)
  const [sortOrder, setSortOrder] = React.useState<"newest" | "oldest">("newest")

  // Modal & Drawer Dialogs State
  const [isAddOpen, setIsAddOpen] = React.useState(autoOpenNew)
  const [selectedAppId, setSelectedAppId] = React.useState<string | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false)

  const [editingApp, setEditingApp] = React.useState<ApplicationWithDetails | null>(null)
  const [deletingApp, setDeletingApp] = React.useState<ApplicationWithDetails | null>(null)
  const [stageUpdatingApp, setStageUpdatingApp] = React.useState<ApplicationWithDetails | null>(null)

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

  // Open Drawer handler
  const handleOpenDrawer = (app: ApplicationWithDetails) => {
    setSelectedAppId(app.id)
    setIsDrawerOpen(true)
  }

  // Multi-dimensional Filtering
  const filteredApps = React.useMemo(() => {
    return applications.filter((app) => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchPos = app.position.toLowerCase().includes(q)
        const matchComp = app.company?.name.toLowerCase().includes(q)
        const matchLoc = app.location?.toLowerCase().includes(q)
        const matchNotes = app.notes?.toLowerCase().includes(q)
        if (!matchPos && !matchComp && !matchLoc && !matchNotes) return false
      }

      // 2. Quick Status Filter
      if (quickStatus === "active") {
        if (app.status !== "Active") return false
      } else if (quickStatus === "interview") {
        const interviewSlugs = ["hr-interview", "user-interview", "final-interview", "assessment"]
        if (!app.stage?.slug || !interviewSlugs.includes(app.stage.slug)) return false
      } else if (quickStatus === "offering") {
        const offerSlugs = ["offer", "accepted", "completed"]
        if (!app.stage?.slug || !offerSlugs.includes(app.stage.slug)) return false
      } else if (quickStatus === "rejected") {
        const rejectedSlugs = ["rejected", "ghosted", "withdrawn"]
        const isRejectedStatus =
          app.status === "Rejected" || app.status === "Ghosted" || app.status === "Withdrawn"
        if (!isRejectedStatus && (!app.stage?.slug || !rejectedSlugs.includes(app.stage.slug))) {
          return false
        }
      }

      // 3. Advanced Filters
      // Stage ID
      if (advancedFilters.stageId && advancedFilters.stageId !== "all") {
        if (app.current_stage_id !== advancedFilters.stageId) return false
      }

      // Employment Type
      if (advancedFilters.employmentType && advancedFilters.employmentType !== "Semua") {
        if (app.employment_type?.toLowerCase() !== advancedFilters.employmentType.toLowerCase()) {
          return false
        }
      }

      // Source
      if (advancedFilters.source && advancedFilters.source !== "Semua") {
        if (app.source?.toLowerCase() !== advancedFilters.source.toLowerCase()) {
          return false
        }
      }

      // Has Salary
      if (advancedFilters.hasSalaryOnly) {
        if (!app.salary_min && !app.salary_max) return false
      }

      return true
    })
  }, [applications, searchQuery, quickStatus, advancedFilters])

  // Sorting
  const sortedApps = React.useMemo(() => {
    const list = [...filteredApps]
    list.sort((a, b) => {
      if (sortOrder === "newest") {
        return new Date(b.application_date).getTime() - new Date(a.application_date).getTime()
      }
      return new Date(a.application_date).getTime() - new Date(b.application_date).getTime()
    })
    return list
  }, [filteredApps, sortOrder])

  // Counts for Quick Status Tabs
  const counts = React.useMemo(() => {
    return {
      all: applications.length,
      active: applications.filter((a) => a.status === "Active").length,
      interview: applications.filter((a) =>
        ["hr-interview", "user-interview", "final-interview", "assessment"].includes(
          a.stage?.slug || ""
        )
      ).length,
      offering: applications.filter((a) =>
        ["offer", "accepted", "completed"].includes(a.stage?.slug || "")
      ).length,
      rejected: applications.filter(
        (a) =>
          ["rejected", "ghosted", "withdrawn"].includes(a.stage?.slug || "") ||
          a.status === "Rejected" ||
          a.status === "Ghosted" ||
          a.status === "Withdrawn"
      ).length,
    }
  }, [applications])

  const handleResetFilters = () => {
    setSearchQuery("")
    setQuickStatus("all")
    setAdvancedFilters(INITIAL_FILTERS)
  }

  const isFilterActive =
    searchQuery.trim() !== "" ||
    quickStatus !== "all" ||
    advancedFilters.stageId !== "all" ||
    advancedFilters.employmentType !== "" ||
    advancedFilters.source !== "" ||
    advancedFilters.hasSalaryOnly

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <span>Daftar Lamaran Kerja</span>
            <Badge variant="outline" className="text-xs font-normal">
              {applications.length} Lamaran
            </Badge>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Semua lowongan yang sudah kamu apply tersimpan rapi dan terorganisir di sini.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Switcher */}
          <div className="flex items-center rounded-lg border border-border/80 bg-muted/40 p-0.5 shadow-xs">
            <Button
              variant={viewMode === "table" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("table")}
              className={`h-8 px-2.5 text-xs gap-1.5 ${
                viewMode === "table" ? "shadow-xs font-semibold" : "text-muted-foreground"
              }`}
              title="Table View"
            >
              <LayoutList className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Table</span>
            </Button>
            <Button
              variant={viewMode === "card" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("card")}
              className={`h-8 px-2.5 text-xs gap-1.5 ${
                viewMode === "card" ? "shadow-xs font-semibold" : "text-muted-foreground"
              }`}
              title="Cards View"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Cards</span>
            </Button>
          </div>

          <Button
            onClick={() => setIsAddOpen(true)}
            size="sm"
            className="gap-1.5 font-medium shadow-xs"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Tambah Lamaran Baru</span>
            <span className="sm:hidden">Tambah</span>
          </Button>
        </div>
      </div>

      {/* Quick Status Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {[
          { key: "all", label: "Semua", count: counts.all },
          { key: "active", label: "Sedang Proses", count: counts.active },
          { key: "interview", label: "Tahap Interview", count: counts.interview },
          { key: "offering", label: "Offering / Goal", count: counts.offering },
          { key: "rejected", label: "Belum Jodoh", count: counts.rejected },
        ].map((tab) => {
          const isActive = quickStatus === tab.key
          return (
            <button
              key={tab.key}
              onClick={() => setQuickStatus(tab.key as typeof quickStatus)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors border shadow-2xs ${
                isActive
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-muted-foreground border-border/80 hover:bg-muted hover:text-foreground"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  isActive
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {tab.count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Filter & Search Bar */}
      <Card className="p-3 sm:p-4 border-border/80 shadow-xs">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari perusahaan, posisi, lokasi, atau catatan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 text-xs sm:text-sm h-9"
            />
          </div>

          <div className="flex items-center gap-2">
            {/* Advanced Multi-dimensional Filter Popover */}
            <AdvancedFilterPopover
              stages={stages}
              filters={advancedFilters}
              onFilterChange={setAdvancedFilters}
              onReset={() => setAdvancedFilters(INITIAL_FILTERS)}
            />

            {/* Sort Toggle Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setSortOrder((prev) => (prev === "newest" ? "oldest" : "newest"))
              }
              className="gap-1.5 text-xs h-9 shadow-xs"
            >
              <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
              <span>{sortOrder === "newest" ? "Terbaru" : "Terlama"}</span>
            </Button>
          </div>
        </div>
      </Card>

      {/* Applications Content: Table or Card View */}
      {loading ? (
        <div className="p-12 flex flex-col items-center justify-center space-y-3 bg-card rounded-2xl border border-border/80 shadow-xs">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <p className="text-xs text-muted-foreground">Memuat daftar lamaran kamu...</p>
        </div>
      ) : sortedApps.length === 0 ? (
        <Card className="p-8 sm:p-12 text-center border-dashed">
          <div className="max-w-md mx-auto space-y-3 flex flex-col items-center justify-center">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              <Inbox className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-base text-foreground">
              {isFilterActive
                ? "Tidak ada lamaran yang cocok"
                : "Belum Ada Lamaran yang Dicatat"}
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {isFilterActive
                ? "Coba ubah kata kunci pencarian atau sesuaikan filter di atas."
                : "Yuk mulai catat lowongan yang baru saja kamu apply biar proses hunting kerjaan kamu makin teratur!"}
            </p>
            {isFilterActive ? (
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetFilters}
                className="gap-1.5 text-xs font-medium mt-2"
              >
                <span>Reset Semua Filter</span>
              </Button>
            ) : (
              <Button
                onClick={() => setIsAddOpen(true)}
                size="sm"
                className="gap-1.5 font-medium mt-2"
              >
                <Plus className="h-4 w-4" />
                <span>Catat Lamaran Pertama</span>
              </Button>
            )}
          </div>
        </Card>
      ) : viewMode === "table" ? (
        <ApplicationTableView
          applications={sortedApps}
          onSelectApp={handleOpenDrawer}
          onUpdateStage={(app) => setStageUpdatingApp(app)}
          onEdit={(app) => setEditingApp(app)}
          onDelete={(app) => setDeletingApp(app)}
        />
      ) : (
        <ApplicationCardView
          applications={sortedApps}
          onSelectApp={handleOpenDrawer}
          onUpdateStage={(app) => setStageUpdatingApp(app)}
          onEdit={(app) => setEditingApp(app)}
          onDelete={(app) => setDeletingApp(app)}
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

      {/* Quick Stage Update Dialog (invoked from table/card directly) */}
      <UpdateStageDialog
        open={!!stageUpdatingApp}
        onOpenChange={(open) => !open && setStageUpdatingApp(null)}
        application={stageUpdatingApp}
        stages={stages}
        onSuccess={loadData}
      />

      {/* Add Application Modal */}
      <AddApplicationDialog
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        companies={companies}
        stages={stages}
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

export default function ApplicationsPage() {
  return (
    <React.Suspense
      fallback={
        <div className="p-12 flex flex-col items-center justify-center space-y-3 bg-card rounded-2xl border border-border/80">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <p className="text-xs text-muted-foreground">Memuat halaman lamaran...</p>
        </div>
      }
    >
      <ApplicationsContent />
    </React.Suspense>
  )
}
