import * as React from "react"
import { createClient } from "@/lib/supabase/server"
import { ProfileCard } from "@/components/settings/profile-card"
import { CsvExportCard } from "@/components/settings/csv-export-card"

export default async function SettingsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const fullName = user?.user_metadata?.full_name || "Indah"
  const firstName = fullName.split(" ")[0] || "Indah"
  const email = user?.email || "indah@indahtrack.app"

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          Pengaturan Akun {firstName}
        </h1>
      </div>

      {/* Profile Section */}
      <ProfileCard
        fullName={fullName}
        firstName={firstName}
        email={email}
      />

      {/* CSV Export Section */}
      <CsvExportCard firstName={firstName} />
    </div>
  )
}
