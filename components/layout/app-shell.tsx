import * as React from "react"
import { Sidebar } from "./sidebar"
import { Topbar } from "./topbar"
import { MobileNav } from "./mobile-nav"
import { AddApplicationProvider } from "@/components/applications/add-application-context"

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <AddApplicationProvider>
      <div className="flex min-h-screen bg-background text-foreground antialiased selection:bg-primary selection:text-primary-foreground">
        {/* Desktop Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 pb-16 lg:pb-0">
          <Topbar />
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-in fade-in-50 duration-200">
            {children}
          </main>
        </div>

        {/* Mobile Bottom Navigation Bar */}
        <MobileNav />
      </div>
    </AddApplicationProvider>
  )
}
