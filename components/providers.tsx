"use client"

import { ReactNode } from "react"
import { UserDataProvider } from "@/contexts/user-data-context"

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <UserDataProvider>
      {children}
    </UserDataProvider>
  )
}

