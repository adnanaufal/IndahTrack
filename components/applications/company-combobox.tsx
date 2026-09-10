"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Plus, Building2, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createCompanyAction, type CompanyOption } from "@/app/(dashboard)/applications/actions"

interface CompanyComboboxProps {
  value: string
  onChange: (companyId: string, companyName?: string) => void
  companies: CompanyOption[]
  onCompanyCreated?: (company: CompanyOption) => void
  disabled?: boolean
  error?: string
}

export function CompanyCombobox({
  value,
  onChange,
  companies,
  onCompanyCreated,
  disabled,
  error,
}: CompanyComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")
  const [isCreating, setIsCreating] = React.useState(false)
  const dropdownRef = React.useRef<HTMLDivElement>(null)

  const selectedCompany = companies.find((c) => c.id === value)

  // Filter companies based on search
  const filtered = companies.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase().trim())
  )

  const exactMatch = companies.some(
    (c) => c.name.toLowerCase() === search.toLowerCase().trim()
  )

  // Close when clicked outside
  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleCreateCompany = async () => {
    const name = search.trim()
    if (!name) return

    try {
      setIsCreating(true)
      const res = await createCompanyAction(name)
      if (res.success && res.data) {
        onCompanyCreated?.(res.data)
        onChange(res.data.id, res.data.name)
        setSearch("")
        setOpen(false)
      }
    } catch (err) {
      // Handle error
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="relative space-y-1" ref={dropdownRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(!open)}
        className={cn(
          "flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-1 text-xs sm:text-sm shadow-sm transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 text-left",
          !selectedCompany && "text-muted-foreground",
          error && "border-destructive focus-visible:ring-destructive"
        )}
      >
        <span className="flex items-center gap-2 truncate">
          <Building2 className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <span className="truncate">
            {selectedCompany ? selectedCompany.name : "Pilih atau ketik perusahaan..."}
          </span>
        </span>
        <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground opacity-70" />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full mt-1 z-50 max-h-60 rounded-xl border border-border/80 bg-card p-1.5 shadow-xl animate-in fade-in-0 zoom-in-95 duration-150 flex flex-col overflow-hidden">
          <div className="p-1">
            <Input
              type="text"
              placeholder="Cari atau tambah baru..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 text-xs"
              autoFocus
            />
          </div>

          <div className="overflow-y-auto max-h-40 space-y-0.5 mt-1 divide-y divide-border/30">
            {filtered.map((company) => {
              const isSelected = company.id === value
              return (
                <button
                  key={company.id}
                  type="button"
                  onClick={() => {
                    onChange(company.id, company.name)
                    setOpen(false)
                    setSearch("")
                  }}
                  className={cn(
                    "w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors hover:bg-muted text-left cursor-pointer",
                    isSelected ? "bg-accent font-semibold text-foreground" : "text-foreground"
                  )}
                >
                  <span className="truncate">{company.name}</span>
                  {isSelected && <Check className="h-3.5 w-3.5 text-primary shrink-0 ml-2" />}
                </button>
              )
            })}

            {filtered.length === 0 && search.trim() && (
              <p className="px-2.5 py-2 text-xs text-muted-foreground text-center">
                Belum ada di database
              </p>
            )}

            {search.trim() && !exactMatch && (
              <button
                type="button"
                onClick={handleCreateCompany}
                disabled={isCreating}
                className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-semibold text-primary hover:bg-primary/10 transition-colors cursor-pointer mt-1"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Menambahkan {search.trim()}...</span>
                  </>
                ) : (
                  <>
                    <Plus className="h-3.5 w-3.5" />
                    <span>Tambah perusahaan &quot;{search.trim()}&quot;</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
