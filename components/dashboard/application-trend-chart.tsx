"use client"

import * as React from "react"
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts"
import { TrendingUp, Inbox } from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface ApplicationTrendChartProps {
  data: {
    date: string
    label: string
    count: number
  }[]
}

export function ApplicationTrendChart({ data }: ApplicationTrendChartProps) {
  const [timeframe, setTimeframe] = React.useState<"30d" | "90d" | "all">("30d")

  // Filter data based on selected timeframe
  const filteredData = React.useMemo(() => {
    if (!data || data.length === 0) return []

    const now = new Date()
    let cutoffDays = 30

    if (timeframe === "30d") cutoffDays = 30
    else if (timeframe === "90d") cutoffDays = 90
    else return data

    const cutoffTime = now.getTime() - cutoffDays * 24 * 60 * 60 * 1000

    return data.filter((item) => new Date(item.date).getTime() >= cutoffTime)
  }, [data, timeframe])

  // Aggregate total applications in period
  const periodTotal = React.useMemo(() => {
    return filteredData.reduce((acc, curr) => acc + curr.count, 0)
  }, [filteredData])

  return (
    <Card className="border-border/80 shadow-2xs">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm sm:text-base font-bold text-foreground">
              Tren Pengiriman Lamaran
            </CardTitle>
          </div>
          <CardDescription className="text-xs mt-0.5">
            {periodTotal > 0
              ? `${periodTotal} lamaran diajukan pada periode ini`
              : "Grafik keaktifan kamu mengirim berkas lamaran"}
          </CardDescription>
        </div>

        {/* Timeframe buttons */}
        <div className="flex items-center rounded-lg border border-border/70 bg-muted/30 p-0.5 text-xs">
          <Button
            variant={timeframe === "30d" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setTimeframe("30d")}
            className={`h-7 px-2 text-[11px] ${
              timeframe === "30d" ? "font-semibold shadow-2xs" : "text-muted-foreground"
            }`}
          >
            30 Hari
          </Button>
          <Button
            variant={timeframe === "90d" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setTimeframe("90d")}
            className={`h-7 px-2 text-[11px] ${
              timeframe === "90d" ? "font-semibold shadow-2xs" : "text-muted-foreground"
            }`}
          >
            3 Bulan
          </Button>
          <Button
            variant={timeframe === "all" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setTimeframe("all")}
            className={`h-7 px-2 text-[11px] ${
              timeframe === "all" ? "font-semibold shadow-2xs" : "text-muted-foreground"
            }`}
          >
            Semua
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pt-2">
        {filteredData.length === 0 ? (
          <div className="h-56 flex flex-col items-center justify-center text-center p-6 space-y-2 border border-dashed border-border/70 rounded-xl bg-card/40">
            <Inbox className="h-6 w-6 text-muted-foreground/60" />
            <p className="text-xs text-muted-foreground">
              Belum ada riwayat lamaran pada rentang waktu ini.
            </p>
          </div>
        ) : (
          <div className="h-56 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={filteredData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="var(--border)"
                  opacity={0.6}
                />
                <XAxis
                  dataKey="label"
                  stroke="var(--muted-foreground)"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  stroke="var(--muted-foreground)"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    borderColor: "var(--border)",
                    borderRadius: "0.75rem",
                    fontSize: "0.75rem",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  }}
                  itemStyle={{ color: "var(--foreground)", fontWeight: 600 }}
                  labelStyle={{ color: "var(--muted-foreground)", marginBottom: 4 }}
                  formatter={(value: any) => [`${value} Lamaran`, "Terkirim"]}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="var(--primary)"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorCount)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
