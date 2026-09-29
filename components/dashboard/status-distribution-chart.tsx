"use client"

import * as React from "react"
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts"
import { PieChart as PieIcon, Inbox } from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"

interface StatusDistributionChartProps {
  data: {
    name: string
    value: number
    color: string
  }[]
}

export function StatusDistributionChart({ data }: StatusDistributionChartProps) {
  const total = React.useMemo(() => {
    return data.reduce((acc, curr) => acc + curr.value, 0)
  }, [data])

  return (
    <Card className="border-border/80 shadow-2xs">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <PieIcon className="h-4 w-4 text-primary" />
          <CardTitle className="text-sm sm:text-base font-bold text-foreground">
            Distribusi Status Lamaran
          </CardTitle>
        </div>
        <CardDescription className="text-xs mt-0.5">
          Proporsi tahapan lamaran aktif dan selesai
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-2">
        {data.length === 0 || total === 0 ? (
          <div className="h-56 flex flex-col items-center justify-center text-center p-6 space-y-2 border border-dashed border-border/70 rounded-xl bg-card/40">
            <Inbox className="h-6 w-6 text-muted-foreground/60" />
            <p className="text-xs text-muted-foreground">
              Belum ada data status lamaran.
            </p>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 min-h-[220px]">
            {/* Donut Chart */}
            <div className="w-full sm:w-1/2 h-44 sm:h-56 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      borderColor: "hsl(var(--border))",
                      borderRadius: "0.75rem",
                      fontSize: "0.75rem",
                      boxShadow: "0 6px 20px rgba(0,0,0,0.25)",
                    }}
                    itemStyle={{ color: "hsl(var(--foreground))", fontWeight: 600 }}
                    formatter={(value: any, name: any) => [
                      `${value} (${Math.round(((value as number) / total) * 100)}%)`,
                      name,
                    ]}
                  />
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {data.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        stroke="hsl(var(--card))"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Custom Legend List */}
            <div className="w-full sm:w-1/2 space-y-2 py-1">
              {data.map((item) => {
                const percentage = Math.round((item.value / total) * 100)
                return (
                  <div
                    key={item.name}
                    className="flex items-center justify-between text-xs py-1 px-1.5 rounded-lg hover:bg-muted/40 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className="h-3 w-3 rounded-full shrink-0 shadow-2xs ring-1 ring-border/50"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-foreground/90 truncate font-semibold">
                        {item.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      <span className="font-bold text-foreground">{item.value}</span>
                      <span className="text-[11px] text-muted-foreground">
                        ({percentage}%)
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
