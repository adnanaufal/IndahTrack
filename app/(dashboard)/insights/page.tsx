"use client"

import * as React from "react"
import {
  TrendingUp,
  Award,
  Users,
  Clock,
  Briefcase,
  CheckCircle2,
  Target,
  Loader2,
  Compass,
  ArrowUpRight,
} from "lucide-react"
import {
  getInsightsStatsAction,
  type InsightsStatsData,
} from "./actions"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { SourcePerformanceChart } from "@/components/insights/source-performance-chart"

export default function InsightsPage() {
  const [data, setData] = React.useState<InsightsStatsData | null>(null)
  const [loading, setLoading] = React.useState(true)

  const loadData = React.useCallback(async () => {
    try {
      setLoading(true)
      const res = await getInsightsStatsAction()
      if (res.success && res.data) {
        setData(res.data)
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

  if (loading) {
    return (
      <div className="p-16 flex flex-col items-center justify-center space-y-3 bg-card rounded-2xl border border-border/80 shadow-2xs">
        <Loader2 className="h-7 w-7 animate-spin text-primary" />
        <p className="text-xs text-muted-foreground">Menghitung analitik dan konversi rekrutmen...</p>
      </div>
    )
  }

  const stats = data || {
    totalApplications: 0,
    interviewCount: 0,
    interviewRate: 0,
    offerCount: 0,
    offerRate: 0,
    acceptanceRate: 0,
    avgTimeToInterviewDays: null,
    avgTimeToOfferDays: null,
    sources: [],
    positions: [],
    evaluations: [],
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <span>Job Search Insights</span>
            <TrendingUp className="h-4 w-4 text-primary" />
          </h1>
        </div>

        <Badge variant="outline" className="text-xs py-1 px-3 w-fit shadow-2xs">
          Seluruh Riwayat Lamaran
        </Badge>
      </div>

      {/* 1. Key Metric Highlights */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {/* Interview Conversion */}
        <Card className="p-4 sm:p-5 border-border/80 hover:border-primary/40 transition-all shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">
              Interview Rate
            </span>
            <div className="p-1.5 rounded-lg bg-pink-500/10 text-pink-600 dark:text-pink-400">
              <Users className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-bold text-foreground">
            {stats.interviewRate}%
          </div>
        </Card>

        {/* Offer Conversion */}
        <Card className="p-4 sm:p-5 border-border/80 hover:border-primary/40 transition-all shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">
              Offer Rate
            </span>
            <div className="p-1.5 rounded-lg bg-amber-700/10 text-amber-800 dark:text-amber-400">
              <Award className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-bold text-pink-700 dark:text-pink-400">
            {stats.offerRate}%
          </div>
        </Card>

        {/* Acceptance Rate */}
        <Card className="p-4 sm:p-5 border-border/80 hover:border-primary/40 transition-all shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">
              Acceptance Rate
            </span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-bold text-foreground">
            {stats.acceptanceRate}%
          </div>
        </Card>

        {/* Avg Time to Interview */}
        <Card className="p-4 sm:p-5 border-border/80 hover:border-primary/40 transition-all shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">
              Waktu ke Interview
            </span>
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-400">
              <Clock className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-bold text-foreground">
            {stats.avgTimeToInterviewDays !== null ? stats.avgTimeToInterviewDays : "-"}{" "}
            <span className="text-xs font-normal text-muted-foreground">hari</span>
          </div>
        </Card>

        {/* Avg Time to Offer */}
        <Card className="p-4 sm:p-5 border-border/80 hover:border-primary/40 transition-all shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">
              Waktu ke Offer
            </span>
            <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
              <Target className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-bold text-foreground">
            {stats.avgTimeToOfferDays !== null ? stats.avgTimeToOfferDays : "-"}{" "}
            <span className="text-xs font-normal text-muted-foreground">hari</span>
          </div>
        </Card>
      </div>

      {/* 2. Charts & Breakdowns: Left Source Performance, Right Position Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SourcePerformanceChart sources={stats.sources} />

        {/* Applications by Position */}
        <Card className="border-border/80 shadow-2xs">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-primary" />
              <CardTitle className="text-sm sm:text-base font-bold text-foreground">
                Lamaran Berdasarkan Posisi
              </CardTitle>
            </div>
          </CardHeader>

          <CardContent className="pt-2">
            {stats.positions.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-center p-6 space-y-2 border border-dashed border-border/70 rounded-xl bg-card/40">
                <p className="text-xs text-muted-foreground">
                  Belum ada data posisi pekerjaan yang diajukan.
                </p>
              </div>
            ) : (
              <div className="space-y-4 pt-1">
                {stats.positions.map((pos) => (
                  <div key={pos.position} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-foreground truncate max-w-[220px]">
                        {pos.position}
                      </span>
                      <span className="text-muted-foreground font-medium">
                        {pos.interview} interview / {pos.applied} apply ({pos.rate}%)
                      </span>
                    </div>

                    <div className="w-full bg-muted/60 rounded-full h-2 overflow-hidden border border-border/40">
                      <div
                        className="bg-primary h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.min(
                            Math.max((pos.applied / (stats.totalApplications || 1)) * 100, 5),
                            100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
