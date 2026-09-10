"use client"

import * as React from "react"
import Link from "next/link"
import { Filter, ArrowUpRight, CheckCircle2 } from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface RecruitmentFunnelCardProps {
  funnel: {
    stage: string
    count: number
    conversionRate: number
    color: string
  }[]
  totalApplications: number
}

export function RecruitmentFunnelCard({
  funnel,
  totalApplications,
}: RecruitmentFunnelCardProps) {
  return (
    <Card className="border-border/80 shadow-2xs">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm sm:text-base font-bold text-foreground">
              Funnel Konversi
            </CardTitle>
          </div>
        </div>

        <Link href="/insights">
          <Button variant="ghost" size="sm" className="text-xs gap-1 h-7">
            <span>Statistik Lengkap</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Button>
        </Link>
      </CardHeader>

      <CardContent className="space-y-4 pt-2">
        {totalApplications === 0 ? (
          <div className="p-8 text-center border border-dashed border-border/70 rounded-xl bg-card/30">
            <p className="text-xs text-muted-foreground">
              Belum ada lamaran untuk menghitung konversi funnel. Yuk mulai catat lamaran pertamamu!
            </p>
          </div>
        ) : (
          <div className="space-y-3.5">
            {funnel.map((item, idx) => {
              const widthPct = totalApplications > 0 ? Math.max((item.count / totalApplications) * 100, 4) : 0
              return (
                <div key={item.stage} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-foreground font-semibold">
                        {item.stage}
                      </span>
                      <span className="text-muted-foreground text-[11px]">
                        ({item.count})
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-foreground">
                        {item.conversionRate}%
                      </span>
                      {idx > 0 && (
                        <span className="text-[10px] text-muted-foreground">
                          dari total
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Funnel Progress bar */}
                  <div className="w-full bg-muted/50 rounded-full h-2.5 overflow-hidden p-0.5 border border-border/40">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${widthPct}%`,
                        backgroundColor: item.color,
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
