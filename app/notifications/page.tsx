"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function NotificationsPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace("/settings?tab=notifications")
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[hsl(var(--optavia-green))] mx-auto mb-4"></div>
        <p className="text-optavia-gray">Redirecting...</p>
      </div>
    </div>
  )
}
