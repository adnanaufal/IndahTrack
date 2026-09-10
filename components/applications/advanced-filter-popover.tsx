"use client"

import * as React from "react"
import { Filter, X, RotateCcw, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { type StageOption } from "@/app/(dashboard)/applications/actions"

export interface FilterValues {
  stageId: string
  employmentType: string
  source: string
  hasSalaryOnly: boolean
}

interface AdvancedFilterPopoverProps {
  stages: StageOption[]
  filters: FilterValues
  onFilterChange: (filters: FilterValues) => void
  onReset: () => void
}

const EMPLOYMENT_TYPES = [
  "Semua",
  "Full-time",
  "Part-time",
  "Contract",
  "Internship",
  "Freelance",
]

const SOURCES = [
  "Semua",
  "LinkedIn",
  "JobStreet",
  "Glints",
  "Kalibrr",
  "Website Karir",
  "Referral",
  "Lainnya",
]

export function AdvancedFilterPopover({
  stages,
  filters,
  onFilterChange,
  onReset,
}: AdvancedFilterPopoverProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const popoverRef = React.useRef<HTMLDivElement>(null)

  // Calculate count of active non-default filters
  const activeCount = React.useMemo(() => {
    let count = 0
    if (filters.stageId && filters.stageId !== "all") count++
    if (filters.employmentType && filters.employmentType !== "Semua") count++
    if (filters.source && filters.source !== "Semua") count++
    if (filters.hasSalaryOnly) count++
    return count
  }, [filters])

  // Handle outside click
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  return (
    <div className="relative inline-block" ref={popoverRef}>
      <Button
        variant={activeCount > 0 ? "default" : "outline"}
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="gap-1.5 text-xs h-9 shadow-xs"
      >
        <Filter className="h-3.5 w-3.5" />
        <span>Filter Lanjutan</span>
        {activeCount > 0 && (
          <Badge
            variant="secondary"
            className="ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px] bg-primary-foreground text-primary font-bold"
          >
            {activeCount}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 sm:left-0 sm:right-auto mt-2 w-[320px] sm:w-[360px] bg-card border border-border/80 rounded-2xl shadow-xl z-50 p-4 space-y-4 animate-in fade-in-0 zoom-in-95 duration-150">
          {/* Popover Header */}
          <div className="flex items-center justify-between pb-2 border-b border-border/60">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-primary" />
              <h4 className="font-bold text-xs sm:text-sm text-foreground">
                Filter Multi-Dimensi
              </h4>
            </div>
            <div className="flex items-center gap-1">
              {activeCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onReset}
                  className="h-7 px-2 text-[11px] text-muted-foreground hover:text-foreground gap-1"
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>Reset</span>
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setIsOpen(false)}
                className="h-7 w-7 text-muted-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {/* Filter: Tahapan Spesifik */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Tahapan Rekrutmen
            </label>
            <select
              value={filters.stageId}
              onChange={(e) =>
                onFilterChange({ ...filters, stageId: e.target.value })
              }
              className="w-full h-8 rounded-lg border border-input bg-background px-2.5 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="all">Semua Tahapan</option>
              {stages.map((stg) => (
                <option key={stg.id} value={stg.id}>
                  {stg.name}
                </option>
              ))}
            </select>
          </div>

          {/* Filter: Tipe Pekerjaan */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Tipe Pekerjaan
            </label>
            <div className="flex flex-wrap gap-1.5">
              {EMPLOYMENT_TYPES.map((type) => {
                const isSelected =
                  (filters.employmentType === "" && type === "Semua") ||
                  filters.employmentType === type
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() =>
                      onFilterChange({
                        ...filters,
                        employmentType: type === "Semua" ? "" : type,
                      })
                    }
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                      isSelected
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-muted/40 text-muted-foreground border-border/70 hover:bg-muted"
                    }`}
                  >
                    {type}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Filter: Sumber Lamaran */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Sumber Lowongan (Source)
            </label>
            <select
              value={filters.source}
              onChange={(e) =>
                onFilterChange({ ...filters, source: e.target.value })
              }
              className="w-full h-8 rounded-lg border border-input bg-background px-2.5 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              {SOURCES.map((src) => (
                <option key={src} value={src === "Semua" ? "" : src}>
                  {src}
                </option>
              ))}
            </select>
          </div>

          {/* Filter: Kompensasi / Gaji dicantumkan */}
          <div className="pt-2 border-t border-border/60">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={filters.hasSalaryOnly}
                onChange={(e) =>
                  onFilterChange({
                    ...filters,
                    hasSalaryOnly: e.target.checked,
                  })
                }
                className="rounded border-input text-primary focus:ring-primary h-4 w-4"
              />
              <span className="text-xs text-foreground font-medium">
                Hanya yang mencantumkan kisaran gaji
              </span>
            </label>
          </div>

          {/* Bottom Action */}
          <div className="pt-2">
            <Button
              onClick={() => setIsOpen(false)}
              size="sm"
              className="w-full text-xs font-semibold h-8"
            >
              Lihat Hasil ({activeCount > 0 ? `${activeCount} filter aktif` : "Semua"})
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
