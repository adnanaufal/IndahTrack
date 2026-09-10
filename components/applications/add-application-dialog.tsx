"use client"

import * as React from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, Plus, Calendar, DollarSign, Globe, MapPin, FileText } from "lucide-react"
import { toast } from "sonner"
import { applicationSchema, type ApplicationFormInput } from "@/lib/validations/application"
import {
  createApplicationAction,
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
import { EMPLOYMENT_TYPES, APPLICATION_SOURCES } from "@/lib/constants"

interface AddApplicationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  companies: CompanyOption[]
  stages: StageOption[]
  defaultStageId?: string
  onSuccess?: () => void
}

export function AddApplicationDialog({
  open,
  onOpenChange,
  companies: initialCompanies,
  stages,
  defaultStageId,
  onSuccess,
}: AddApplicationDialogProps) {
  const [companiesList, setCompaniesList] = React.useState<CompanyOption[]>(initialCompanies)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  // Default stage is "applied" or first stage
  const defaultStage = stages.find((s) => s.slug === "applied") || stages[0]

  const todayStr = new Date().toISOString().split("T")[0]

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<ApplicationFormInput>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      companyId: "",
      position: "",
      applicationDate: todayStr,
      currentStageId: defaultStage?.id || "",
      location: "",
      employmentType: "Full-time",
      source: "LinkedIn",
      jobUrl: "",
      salaryMin: null,
      salaryMax: null,
      salaryCurrency: "IDR",
      status: "Active",
      notes: "",
    },
  })

  // Sync stages default if stages update or defaultStageId provided
  React.useEffect(() => {
    if (open) {
      if (defaultStageId) {
        reset((prev) => ({ ...prev, currentStageId: defaultStageId }))
      } else if (defaultStage && !control._defaultValues.currentStageId) {
        reset((prev) => ({ ...prev, currentStageId: defaultStage.id }))
      }
    }
  }, [open, defaultStageId, defaultStage, reset, control._defaultValues.currentStageId])

  // Sync companies
  React.useEffect(() => {
    setCompaniesList(initialCompanies)
  }, [initialCompanies])

  const onSubmit = async (data: ApplicationFormInput) => {
    try {
      setIsSubmitting(true)
      const res = await createApplicationAction(data)

      if (!res.success) {
        toast.error(res.error || "Gagal menyimpan lamaran.")
        setIsSubmitting(false)
        return
      }

      const comp = companiesList.find((c) => c.id === data.companyId)
      toast.success(
        comp
          ? `Lamaran di ${comp.name} berhasil disimpan! Semangat ya!`
          : "Lamaran berhasil disimpan! Semangat ya!"
      )

      reset()
      onOpenChange(false)
      onSuccess?.()
    } catch (err) {
      toast.error("Terjadi kendala jaringan saat menyimpan lamaran.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
            <span>Catat Lamaran Baru</span>
          </DialogTitle>
          <DialogDescription>
            Masukkan detail lowongan pekerjaan yang baru saja kamu apply
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
              <div className="relative">
                <Input
                  type="date"
                  className="text-xs sm:text-sm h-9"
                  disabled={isSubmitting}
                  {...register("applicationDate")}
                />
              </div>
              {errors.applicationDate && (
                <p className="text-[11px] text-destructive font-medium">
                  {errors.applicationDate.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Tahapan Awal <span className="text-destructive">*</span>
              </label>
              <select
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs sm:text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                disabled={isSubmitting}
                {...register("currentStageId")}
              >
                {stages.map((stg) => (
                  <option key={stg.id} value={stg.id}>
                    {stg.name}
                  </option>
                ))}
              </select>
              {errors.currentStageId && (
                <p className="text-[11px] text-destructive font-medium">
                  {errors.currentStageId.message}
                </p>
              )}
            </div>
          </div>

          {/* Location & Employment Type */}
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

          {/* Source & Job URL */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">
                Sumber Info Lowongan
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
          </div>

          {/* Salary Expectation Range */}
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
              placeholder="Catatan kecil soal recruiter, syarat khusus, atau benefit..."
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-xs sm:text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-none"
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
                  <Plus className="h-3.5 w-3.5" />
                  <span>Simpan Lamaran</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
