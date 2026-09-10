"use client"

import * as React from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, Save } from "lucide-react"
import { toast } from "sonner"
import { applicationSchema, type ApplicationFormInput } from "@/lib/validations/application"
import {
  updateApplicationAction,
  type ApplicationWithDetails,
  type CompanyOption,
  type StageOption,
} from "@/app/(dashboard)/applications/actions"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CompanyCombobox } from "./company-combobox"
import { EMPLOYMENT_TYPES, APPLICATION_SOURCES, APPLICATION_STATUSES } from "@/lib/constants"

interface EditApplicationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  application: ApplicationWithDetails | null
  companies: CompanyOption[]
  stages: StageOption[]
  onSuccess?: () => void
}

export function EditApplicationDialog({
  open,
  onOpenChange,
  application,
  companies: initialCompanies,
  stages,
  onSuccess,
}: EditApplicationDialogProps) {
  const [companiesList, setCompaniesList] = React.useState<CompanyOption[]>(initialCompanies)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<ApplicationFormInput>({
    resolver: zodResolver(applicationSchema),
  })

  // Populate form whenever application changes
  React.useEffect(() => {
    if (application) {
      reset({
        companyId: application.company_id,
        position: application.position,
        applicationDate: application.application_date,
        currentStageId: application.current_stage_id,
        location: application.location || "",
        employmentType: application.employment_type || "Full-time",
        source: application.source || "LinkedIn",
        jobUrl: application.job_url || "",
        salaryMin: application.salary_min,
        salaryMax: application.salary_max,
        salaryCurrency: application.salary_currency || "IDR",
        status: application.status || "Active",
        notes: application.notes || "",
      })
    }
  }, [application, reset])

  // Sync companies
  React.useEffect(() => {
    setCompaniesList(initialCompanies)
  }, [initialCompanies])

  const onSubmit = async (data: ApplicationFormInput) => {
    if (!application) return

    try {
      setIsSubmitting(true)
      const res = await updateApplicationAction(application.id, data)

      if (!res.success) {
        toast.error(res.error || "Gagal mengupdate data lamaran.")
        setIsSubmitting(false)
        return
      }

      toast.success("Perubahan data lamaran berhasil disimpan!")
      onOpenChange(false)
      onSuccess?.()
    } catch (err) {
      toast.error("Terjadi kendala jaringan saat mengupdate data.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!application) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
            <span>Ubah Data Lamaran</span>
          </DialogTitle>
          <DialogDescription>
            Perbarui detail atau status lamaran di {application.company?.name}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-1">
          {/* Company & Position */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Perusahaan <span className="text-destructive">*</span>
              </label>
              <Controller
                name="companyId"
                control={control}
                render={({ field }) => (
                  <CompanyCombobox
                    value={field.value}
                    onChange={field.onChange}
                    companies={companiesList}
                    onCompanyCreated={(newComp) => {
                      setCompaniesList((prev) => [...prev, newComp])
                    }}
                    error={errors.companyId?.message}
                    disabled={isSubmitting}
                  />
                )}
              />
              {errors.companyId && (
                <p className="text-[11px] text-destructive font-medium">
                  {errors.companyId.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Posisi / Role <span className="text-destructive">*</span>
              </label>
              <Input
                placeholder="Contoh: Product Analyst"
                className="text-xs sm:text-sm h-9"
                disabled={isSubmitting}
                {...register("position")}
              />
              {errors.position && (
                <p className="text-[11px] text-destructive font-medium">
                  {errors.position.message}
                </p>
              )}
            </div>
          </div>

          {/* Application Date & Stage */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Tanggal Submit <span className="text-destructive">*</span>
              </label>
              <Input
                type="date"
                className="text-xs sm:text-sm h-9"
                disabled={isSubmitting}
                {...register("applicationDate")}
              />
              {errors.applicationDate && (
                <p className="text-[11px] text-destructive font-medium">
                  {errors.applicationDate.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Tahapan Saat Ini <span className="text-destructive">*</span>
              </label>
              <select
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs sm:text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                disabled={isSubmitting}
                {...register("currentStageId")}
              >
                {stages.map((stg) => (
                  <option key={stg.id} value={stg.id}>
                    {stg.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Status & Employment Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Status Lamaran
              </label>
              <select
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs sm:text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                disabled={isSubmitting}
                {...register("status")}
              >
                {APPLICATION_STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">
                Tipe Pekerjaan
              </label>
              <select
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs sm:text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                disabled={isSubmitting}
                {...register("employmentType")}
              >
                {EMPLOYMENT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Location & Source */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">
                Lokasi Kerja
              </label>
              <Input
                placeholder="Contoh: Jakarta (Hybrid)"
                className="text-xs sm:text-sm h-9"
                disabled={isSubmitting}
                {...register("location")}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">
                Sumber Info
              </label>
              <select
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs sm:text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                disabled={isSubmitting}
                {...register("source")}
              >
                {APPLICATION_SOURCES.map((src) => (
                  <option key={src} value={src}>
                    {src}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Job URL */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">
              Link Lowongan (URL)
            </label>
            <Input
              type="url"
              placeholder="https://..."
              className="text-xs sm:text-sm h-9"
              disabled={isSubmitting}
              {...register("jobUrl")}
            />
            {errors.jobUrl && (
              <p className="text-[11px] text-destructive font-medium">
                {errors.jobUrl.message}
              </p>
            )}
          </div>

          {/* Salary Range */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground flex items-center justify-between">
              <span>Ekspektasi Gaji (IDR/bulan)</span>
              <span className="text-[10px] text-muted-foreground">Opsional</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="number"
                placeholder="Min: 8000000"
                className="text-xs sm:text-sm h-9"
                disabled={isSubmitting}
                {...register("salaryMin")}
              />
              <Input
                type="number"
                placeholder="Max: 12000000"
                className="text-xs sm:text-sm h-9"
                disabled={isSubmitting}
                {...register("salaryMax")}
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">
              Catatan Pribadi
            </label>
            <textarea
              rows={2}
              placeholder="Catatan..."
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-xs sm:text-sm shadow-sm transition-colors resize-none"
              disabled={isSubmitting}
              {...register("notes")}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button
              type="submit"
              size="sm"
              className="gap-2 font-medium"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Save className="h-3.5 w-3.5" />
                  <span>Simpan Perubahan</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
