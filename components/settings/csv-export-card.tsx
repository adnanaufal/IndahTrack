"use client"

import * as React from "react"
import { FileSpreadsheet, Download, Loader2, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getApplicationsForExportAction, type ExportApplicationItem } from "@/app/(dashboard)/settings/actions"

interface CsvExportCardProps {
  firstName: string
}

export function CsvExportCard({ firstName }: CsvExportCardProps) {
  const [isExporting, setIsExporting] = React.useState(false)

  const handleExportCsv = async () => {
    try {
      setIsExporting(true)
      const res = await getApplicationsForExportAction()

      if (!res.success || !res.data) {
        toast.error(res.error || "Gagal menyiapkan data ekspor.")
        return
      }

      const items = res.data

      if (items.length === 0) {
        toast.info(`Belum ada data lamaran untuk diekspor.`)
        return
      }

      // 1. Define CSV Headers in Indonesian / Clear business terms
      const headers = [
        "Perusahaan",
        "Posisi",
        "Tahapan",
        "Status",
        "Tanggal Apply",
        "Lokasi",
        "Tipe Pekerjaan",
        "Sumber Lowongan",
        "Kompensasi / Gaji",
        "Link Lowongan",
        "Catatan",
        "Terakhir Diperbarui",
      ]

      // 2. Escape each cell according to RFC 4180
      const escapeCsvCell = (val: string | number | null | undefined): string => {
        if (val === null || val === undefined) return '""'
        const str = String(val).replace(/"/g, '""')
        return `"${str}"`
      }

      // 3. Build CSV Rows
      const rows = items.map((item) => [
        escapeCsvCell(item.company),
        escapeCsvCell(item.position),
        escapeCsvCell(item.stage),
        escapeCsvCell(item.status),
        escapeCsvCell(item.application_date),
        escapeCsvCell(item.location),
        escapeCsvCell(item.employment_type),
        escapeCsvCell(item.source),
        escapeCsvCell(item.salary),
        escapeCsvCell(item.job_url),
        escapeCsvCell(item.notes),
        escapeCsvCell(item.last_updated),
      ])

      const csvContent = [
        headers.map((h) => `"${h}"`).join(","),
        ...rows.map((r) => r.join(",")),
      ].join("\r\n")

      // 4. Prepend UTF-8 BOM (\uFEFF) for Excel compatibility
      const blob = new Blob(["\uFEFF" + csvContent], {
        type: "text/csv;charset=utf-8;",
      })

      // 5. Generate filename: IndahTrack_Lamaran_YYYY-MM-DD.csv
      const todayStr = new Date().toISOString().split("T")[0]
      const filename = `IndahTrack_Lamaran_${todayStr}.csv`

      // 6. Trigger download
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.setAttribute("href", url)
      link.setAttribute("download", filename)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast.success(`Berhasil mengunduh ${items.length} berkas lamaran ke ${filename}!`)
    } catch (err: any) {
      toast.error(err.message || "Terjadi kesalahan saat mengunduh CSV.")
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Card className="border-border/80 shadow-2xs">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="h-4 w-4 text-primary" />
          <CardTitle className="text-base font-semibold text-foreground">
            Ekspor Data Lamaran
          </CardTitle>
        </div>
        <CardDescription className="text-xs mt-0.5">
          Unduh seluruh riwayat dan catatan lamaran kerja {firstName} ke dalam format spreadsheet (.csv) yang siap dibuka di Microsoft Excel atau Google Sheets.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 rounded-xl bg-muted/20 border border-border/70">
          <div className="space-y-1">
            <h4 className="text-xs sm:text-sm font-semibold text-foreground">
              Format CSV Spreadsheet (UTF-8)
            </h4>
            <p className="text-[11px] text-muted-foreground">
              Mencakup nama perusahaan, posisi, status seleksi, tanggal apply, kompensasi, link lowongan, dan catatan.
            </p>
          </div>

          <Button
            onClick={handleExportCsv}
            disabled={isExporting}
            className="gap-2 shrink-0 font-medium shadow-xs text-xs h-9 bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            {isExporting ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Menyiapkan File...</span>
              </>
            ) : (
              <>
                <Download className="h-3.5 w-3.5" />
                <span>Unduh CSV Spreadsheet</span>
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
