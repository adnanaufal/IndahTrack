"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  getCompaniesAction,
  getPipelineStagesAction,
  type CompanyOption,
  type StageOption,
} from "@/app/(dashboard)/applications/actions"
import { AddApplicationDialog } from "./add-application-dialog"

interface AddApplicationContextValue {
  openAddApplication: (stageId?: string) => void
  closeAddApplication: () => void
}

const AddApplicationContext = React.createContext<AddApplicationContextValue | null>(null)

export function useAddApplication() {
  const context = React.useContext(AddApplicationContext)
  if (!context) {
    throw new Error("useAddApplication must be used within an AddApplicationProvider")
  }
  return context
}

export function AddApplicationProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [isOpen, setIsOpen] = React.useState(false)
  const [defaultStageId, setDefaultStageId] = React.useState<string | undefined>(undefined)
  const [companies, setCompanies] = React.useState<CompanyOption[]>([])
  const [stages, setStages] = React.useState<StageOption[]>([])
  const [hasLoadedMeta, setHasLoadedMeta] = React.useState(false)

  const loadMetadata = React.useCallback(async () => {
    try {
      const [compsRes, stagesRes] = await Promise.all([
        getCompaniesAction(),
        getPipelineStagesAction(),
      ])
      if (compsRes.success && compsRes.data) {
        setCompanies(compsRes.data)
      }
      if (stagesRes.success && stagesRes.data) {
        setStages(stagesRes.data)
      }
      setHasLoadedMeta(true)
    } catch {
      // Ignored
    }
  }, [])

  const openAddApplication = React.useCallback((stageId?: string) => {
    setDefaultStageId(stageId)
    setIsOpen(true)
    if (!hasLoadedMeta) {
      loadMetadata()
    }
  }, [hasLoadedMeta, loadMetadata])

  const closeAddApplication = React.useCallback(() => {
    setIsOpen(false)
    setDefaultStageId(undefined)
  }, [])

  const handleSuccess = React.useCallback(() => {
    closeAddApplication()
    // Emit custom event for client pages to refresh their list
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("application:created"))
    }
    router.refresh()
  }, [closeAddApplication, router])

  return (
    <AddApplicationContext.Provider value={{ openAddApplication, closeAddApplication }}>
      {children}
      <AddApplicationDialog
        open={isOpen}
        onOpenChange={(open) => {
          if (!open) closeAddApplication()
          else setIsOpen(true)
        }}
        companies={companies}
        stages={stages}
        defaultStageId={defaultStageId}
        onSuccess={handleSuccess}
      />
    </AddApplicationContext.Provider>
  )
}
