import { z } from "zod"

export const applicationSchema = z.object({
  companyId: z.string().min(1, "Perusahaan wajib dipilih atau dibuat ya!"),
  position: z.string().min(1, "Posisi / nama pekerjaan wajib diisi ya!"),
  applicationDate: z.string().min(1, "Tanggal lamaran wajib diisi ya!"),
  currentStageId: z.string().min(1, "Tahapan lamaran wajib dipilih ya!"),
  location: z.string().optional().nullable(),
  employmentType: z.string().optional().nullable(),
  source: z.string().optional().nullable(),
  jobUrl: z
    .string()
    .optional()
    .nullable()
    .refine(
      (val) => !val || val === "" || val.startsWith("http://") || val.startsWith("https://"),
      "Link lowongan harus diawali dengan https:// atau http://"
    ),
  salaryMin: z
    .union([z.number(), z.string()])
    .optional()
    .nullable()
    .transform((val) => (val === "" || val === null || val === undefined ? null : Number(val))),
  salaryMax: z
    .union([z.number(), z.string()])
    .optional()
    .nullable()
    .transform((val) => (val === "" || val === null || val === undefined ? null : Number(val))),
  salaryCurrency: z.string().default("IDR"),
  status: z
    .enum(["Active", "Offer", "Accepted", "Rejected", "Withdrawn", "Ghosted", "Completed"])
    .default("Active"),
  notes: z.string().optional().nullable(),
})

export type ApplicationFormInput = z.input<typeof applicationSchema>
export type ApplicationOutput = z.output<typeof applicationSchema>
