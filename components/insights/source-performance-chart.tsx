"use client"

import * as React from "react"
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts"
import { Compass, Inbox } from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { type SourceMetricItem } from "@/app/(dashboard)/insights/actions"

interface SourcePerformanceChartProps {
  sources: SourceMetricItem[]
}

export function SourcePerformanceChart({ sources }: SourcePerformanceChartProps) {
  return (
    <Card className="border-border/80 shadow-2xs">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Compass className="h-4 w-4 text-primary" />
          <CardTitle className="text-sm sm:text-base font-bold text-foreground">
            Performa Berdasarkan Sumber Lowongan
          </CardTitle>
        </div>
        <CardDescription className="text-xs mt-0.5">
          Perbandingan jumlah lamaran diajukan dan panggilan interview per platform
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-2">
        {sources.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-center p-6 space-y-2 border border-dashed border-border/70 rounded-xl bg-card/40">
            <Inbox className="h-6 w-6 text-muted-foreground/60" />
            <p className="text-xs text-muted-foreground">
              Belum ada data sumber lowongan.
            </p>
          </div>
        ) : (
          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={sources}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="var(--border)"
                  opacity={0.6}
                />
                <XAxis
                  dataKey="name"
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
                  itemStyle={{ fontWeight: 600 }}
                  formatter={(value: any, name: any) => [
                    `${value} Lamaran`,
                    name === "applied" ? "Diajukan" : "Lolos Interview",
                  ]}
                />
                <Legend
                  verticalAlign="top"
                  align="right"
                  iconType="circle"
                  wrapperStyle={{ fontSize: "11px", paddingBottom: "8px" }}
                  formatter={(value) =>
                    value === "applied" ? "Diajukan" : "Lolos Interview"
                  }
                />
                <Bar
                  dataKey="applied"
                  fill="#78350f" // rich warm mocha brown
                  radius={[4, 4, 0, 0]}
                  barSize={18}
                />
                <Bar
                  dataKey="interview"
                  fill="#be185d" // vibrant dusty rose pink
                  radius={[4, 4, 0, 0]}
                  barSize={18}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
