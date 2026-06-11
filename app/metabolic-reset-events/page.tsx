"use client"

import Link from "next/link"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

const METABOLIC_RESET_EVENTS_URL = "https://sites.google.com/view/metabolicresetevents/home"

export default function MetabolicResetEventsPage() {

  return (
    <div className="h-[100dvh] flex flex-col bg-white">
      <Header activeTab="metabolic-reset-events" />

      <main className="flex-1 bg-white flex flex-col min-h-0 overflow-hidden">
        {/* Compact top bar */}
        <div className="border-b border-gray-200 bg-white">
          <div className="container mx-auto px-3 sm:px-4 py-2 sm:py-4">
            <div className="flex items-center gap-2">
              <Link href="/dashboard" className="flex-shrink-0">
                <Button variant="ghost" size="sm" className="px-2">
                  <ArrowLeft className="h-4 w-4" />
                  <span className="ml-2 hidden sm:inline">Back</span>
                </Button>
              </Link>

              <div className="min-w-0">
                <h1 className="font-heading font-bold text-base sm:text-xl text-optavia-dark truncate">
                  Metabolic Reset Events
                </h1>
              </div>
            </div>
          </div>
        </div>

        {/* Sheet viewer */}
        <div className="flex-1 min-h-0">
          <div className="h-full w-full sm:container sm:mx-auto sm:px-4 sm:py-4">
            <div className="h-full w-full sm:border sm:border-gray-200 sm:rounded-lg overflow-hidden bg-white sm:shadow-sm">
              <iframe
                title="Metabolic Reset Events"
                src={METABOLIC_RESET_EVENTS_URL}
                className="w-full h-full"
                referrerPolicy="no-referrer"
                scrolling="yes"
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

