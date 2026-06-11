"use client"

import { useEffect } from "react"

const METABOLIC_RESET_EVENTS_URL = "https://sites.google.com/view/metabolicresetevents/home"

export default function MetabolicResetEventsPage() {
  useEffect(() => {
    window.location.href = METABOLIC_RESET_EVENTS_URL
  }, [])

  return (
    <div className="h-[100dvh] flex items-center justify-center bg-white">
      <div className="text-center p-8">
        <p className="text-gray-600 mb-4">Redirecting to Metabolic Reset Events...</p>
        <a 
          href={METABOLIC_RESET_EVENTS_URL}
          className="text-[hsl(var(--optavia-green))] hover:underline"
        >
          Click here if not redirected automatically
        </a>
      </div>
    </div>
  )
}

