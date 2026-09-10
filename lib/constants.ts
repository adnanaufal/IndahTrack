export const APP_CONFIG = {
  name: "IndahTrack",
  tagline: "Pantau semua lamaran kerja Indah. Aku bantu rapikan biar gak pusing.",
  description: "Personal job tracker & analytics platform yang kubuat spesial buat nemenin proses hunting kerjaan Indah sampai dapet offering impian.",
  version: "0.2.0",
}

export interface NavItem {
  title: string
  href: string
  icon: string
  badge?: string
}

export const NAV_SECTIONS = [
  {
    title: "Overview",
    items: [
      {
        title: "Dashboard",
        href: "/dashboard",
        icon: "LayoutDashboard",
      },
    ],
  },
  {
    title: "Job Hunt",
    items: [
      {
        title: "Daftar Lamaran",
        href: "/applications",
        icon: "Briefcase",
      },
      {
        title: "Pipeline Board",
        href: "/pipeline",
        icon: "Kanban",
      },
      {
        title: "Follow-ups & Reminder",
        href: "/follow-ups",
        icon: "CheckSquare",
      },
      {
        title: "Insights & Stat",
        href: "/insights",
        icon: "BarChart3",
      },
    ],
  },
  {
    title: "Pengaturan",
    items: [
      {
        title: "Settings",
        href: "/settings",
        icon: "Settings",
      },
    ],
  },
]

export const MOBILE_NAV_ITEMS = [
  { title: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
  { title: "Lamaran", href: "/applications", icon: "Briefcase" },
  { title: "Tambah", href: "/applications?new=true", icon: "PlusCircle", isAction: true },
  { title: "Pipeline", href: "/pipeline", icon: "Kanban" },
  { title: "Insights", href: "/insights", icon: "BarChart3" },
]

export const DEFAULT_PIPELINE_STAGES = [
  { id: "wishlist", name: "Wishlist (Naksir Posisi Ini)", slug: "wishlist", type: "active", position: 1 },
  { id: "applied", name: "Applied (Sudah Submit)", slug: "applied", type: "active", position: 2 },
  { id: "screening", name: "Screening (Sedang Direview HR)", slug: "screening", type: "active", position: 3 },
  { id: "hr_interview", name: "HR Interview", slug: "hr-interview", type: "active", position: 4 },
  { id: "assessment", name: "Assessment / Skill Test", slug: "assessment", type: "active", position: 5 },
  { id: "user_interview", name: "User Interview", slug: "user-interview", type: "active", position: 6 },
  { id: "final_interview", name: "Final Interview / Direksi", slug: "final-interview", type: "active", position: 7 },
  { id: "offer", name: "Offering Letter", slug: "offer", type: "active", position: 8 },
  { id: "accepted", name: "Accepted (Resmi Diterima!)", slug: "accepted", type: "closed_won", position: 9 },
  { id: "onboarding", name: "Onboarding (Mulai Kerja)", slug: "onboarding", type: "closed_won", position: 10 },
  { id: "completed", name: "Completed", slug: "completed", type: "closed_won", position: 11 },
  { id: "rejected", name: "Belum Jodoh", slug: "rejected", type: "closed_lost", position: 12 },
  { id: "withdrawn", name: "Withdrawn (Ditarik Sendiri)", slug: "withdrawn", type: "closed_lost", position: 13 },
  { id: "ghosted", name: "Ghosted (Tanpa Kabar)", slug: "ghosted", type: "closed_lost", position: 14 },
] as const

export const EMPLOYMENT_TYPES = [
  "Full-time",
  "Part-time",
  "Contract",
  "Internship",
  "Freelance",
  "Remote",
] as const

export const APPLICATION_SOURCES = [
  "LinkedIn",
  "JobStreet",
  "Glints",
  "Indeed",
  "Website Perusahaan",
  "Rekomendasi / Referral",
  "Career Fair",
  "Cold Email / Direct Message",
  "Lainnya",
] as const

export const APPLICATION_STATUSES = [
  "Active",
  "Offer",
  "Accepted",
  "Rejected",
  "Withdrawn",
  "Ghosted",
  "Completed",
] as const
