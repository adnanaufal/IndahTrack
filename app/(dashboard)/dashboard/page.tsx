"use client"

import * as React from "react"
import Link from "next/link"
import {
  Plus,
  ArrowUpRight,
  Sparkles,
  Loader2,
  Calendar,
  Building2,
  MapPin,
  ExternalLink,
} from "lucide-react"
import {
  getDashboardStatsAction,
  type DashboardStatsData,
} from "./actions"
import {
  getCompaniesAction,
  getPipelineStagesAction,
  type ApplicationWithDetails,
  type CompanyOption,
  type StageOption,
} from "../applications/actions"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { KPICardGrid } from "@/components/dashboard/kpi-card-grid"
import { ApplicationTrendChart } from "@/components/dashboard/application-trend-chart"
import { StatusDistributionChart } from "@/components/dashboard/status-distribution-chart"
import { RecruitmentFunnelCard } from "@/components/dashboard/recruitment-funnel-card"
import { FollowupAgendaCard } from "@/components/dashboard/followup-agenda-card"
import { ApplicationDetailDrawer } from "@/components/applications/application-detail-drawer"
import { AddApplicationDialog } from "@/components/applications/add-application-dialog"

export default function DashboardPage() {
  const [data, setData] = React.useState<DashboardStatsData | null>(null)
  const [companies, setCompanies] = React.useState<CompanyOption[]>([])
  const [stages, setStages] = React.useState<StageOption[]>([])
  const [loading, setLoading] = React.useState(true)

  // Drawer & Add Dialog state
  const [selectedAppId, setSelectedAppId] = React.useState<string | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false)
  const [isAddOpen, setIsAddOpen] = React.useState(false)

  const loadData = React.useCallback(async () => {
    try {
      setLoading(true)
      const [statsRes, compsRes, stagesRes] = await Promise.all([
        getDashboardStatsAction(),
        getCompaniesAction(),
        getPipelineStagesAction(),
      ])

      if (statsRes.success && statsRes.data) {
        setData(statsRes.data)
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

  const handleSelectRecentApp = (app: ApplicationWithDetails) => {
    setSelectedAppId(app.id)
    setIsDrawerOpen(true)
  }

  if (loading) {
    return (
      <div className="p-16 flex flex-col items-center justify-center space-y-3 bg-card rounded-2xl border border-border/80 shadow-2xs">
        <Loader2 className="h-7 w-7 animate-spin text-primary" />
        <p className="text-xs text-muted-foreground">Menyiapkan dashboard ringkasan kamu...</p>
      </div>
    )
  }

  const kpi = data?.kpi || {
    totalApplications: 0,
    activeApplications: 0,
    interviewsCount: 0,
    offersCount: 0,
    rejectedCount: 0,
    acceptedCount: 0,
  }

  const firstName = data?.userName?.split(" ")[0] || "Indah"

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <span>Semangat cari kerja hari ini, {firstName}!</span>
              <Sparkles className="h-4 w-4 text-primary" />
            </h1>
            <Badge
              variant="outline"
              className="text-[10px] hidden sm:inline-flex border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
            >
              Proses Menuju Karir Impian
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Berikut ringkasan progres lamaran {firstName}, jadwal penting, dan performa seleksi.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            onClick={() => setIsAddOpen(true)}
            size="sm"
            className="gap-1.5 font-medium shadow-xs"
          >
            <Plus className="h-4 w-4" />
            <span>Catat Lamaran Baru</span>
          </Button>
        </div>
      </div>

      {/* 2. KPI Cards Grid (6 Cards) */}
      <KPICardGrid kpi={kpi} />

      {/* 3. Charts Row: Application Trend (Left) + Status Distribution (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ApplicationTrendChart data={data?.trendData || []} />
        <StatusDistributionChart data={data?.statusDistribution || []} />
      </div>

      {/* 4. Funnel Section */}
      <RecruitmentFunnelCard
        funnel={data?.funnel || []}
        totalApplications={kpi.totalApplications}
      />

      {/* 5. Bottom Row: Recent Applications + Follow-up Agenda */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Applications (2 Cols) */}
        <Card className="lg:col-span-2 border-border/80 shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border/60">
            <div>
              <CardTitle className="text-sm sm:text-base font-bold text-foreground">
                Lamaran Terbaru {firstName}
              </CardTitle>
              <CardDescription className="text-xs mt-0.5">
                Daftar posisi yang baru saja {firstName} kirim
              </CardDescription>
            </div>
            <Link href="/applications">
              <Button variant="outline" size="sm" className="text-xs gap-1 h-8">
                <span>Buka Semua Lamaran</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </CardHeader>

          <CardContent className="p-0">
            {!data?.recentApplications || data.recentApplications.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground">
                Belum ada lamaran yang tercatat. Klik tombol di atas untuk mulai mencatat.
              </div>
            ) : (
              <div className="divide-y divide-border/60">
                {data.recentApplications.map((app) => (
                  <div
                    key={app.id}
                    onClick={() => handleSelectRecentApp(app)}
                    className="p-3.5 sm:px-5 flex items-center justify-between hover:bg-muted/30 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-9 w-9 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-bold text-xs shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors shadow-2xs">
                        {app.company?.name ? app.company.name[0].toUpperCase() : "J"}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs sm:text-sm font-bold text-foreground group-hover:text-primary transition-colors truncate">
                          {app.position}
                        </h4>
                        <div className="text-[11px] text-muted-foreground flex items-center gap-2 mt-0.5 truncate">
                          <span className="font-semibold text-foreground/80 truncate">
                            {app.company?.name}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1 shrink-0">
                            <Calendar className="h-3 w-3 text-muted-foreground/70" />
                            {app.application_date}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 ml-3">
                      <Badge
                        variant={
                          app.stage?.slug?.includes("interview")
                            ? "pink"
                            : app.stage?.slug === "offer" || app.stage?.slug === "accepted"
                            ? "success"
                            : "mocha"
                        }
                        className="text-[11px] font-semibold"
                      >
                        {app.stage?.name || "Applied"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Follow-up & Upcoming Agenda (1 Col) */}
        <div className="lg:col-span-1">
          <FollowupAgendaCard agenda={data?.followupAgenda || []} />
        </div>
      </div>

      {/* Slide-over Detail Drawer */}
      <ApplicationDetailDrawer
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        applicationId={selectedAppId}
        companies={companies}
        stages={stages}
        onRefresh={loadData}
      />

      {/* Add Application Modal */}
      <AddApplicationDialog
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        companies={companies}
        stages={stages}
        onSuccess={loadData}
      />
    </div>
  )
}
