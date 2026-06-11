"use client"

import Link from "next/link"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ExternalLink, CalendarPlus, Calendar } from "lucide-react"

const METABOLIC_RESET_EVENTS_URL = "https://sites.google.com/view/metabolicresetevents/home"
const SUBMIT_EVENT_FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSfAsKbLm6nDy3_3TY0Y4H97SfNkgmMfAsBbdEnzEsaTCfHI4w/viewform"

export default function MetabolicResetEventsPage() {
  return (
    <div className="h-[100dvh] flex flex-col bg-white">
      <Header activeTab="metabolic-reset-events" />

      <main className="flex-1 bg-gray-50 flex flex-col">
        {/* Top bar */}
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

        {/* Content */}
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-lg w-full space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Metabolic Reset Events</h2>
              <p className="text-gray-600">View upcoming events or submit your own event to share with the community.</p>
            </div>

            {/* View Events Button */}
            <a
              href={METABOLIC_RESET_EVENTS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between w-full p-5 bg-white border-2 border-[hsl(var(--optavia-green))] rounded-lg hover:bg-green-50 transition-colors group"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-full">
                  <Calendar className="h-6 w-6 text-[hsl(var(--optavia-green))]" />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-gray-900">View Upcoming Events</div>
                  <div className="text-sm text-gray-500">See all scheduled Metabolic Reset events</div>
                </div>
              </div>
              <ExternalLink className="h-5 w-5 text-gray-400 group-hover:text-[hsl(var(--optavia-green))]" />
            </a>

            {/* Submit Event Button */}
            <a
              href={SUBMIT_EVENT_FORM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between w-full p-5 bg-white border-2 border-purple-500 rounded-lg hover:bg-purple-50 transition-colors group"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 rounded-full">
                  <CalendarPlus className="h-6 w-6 text-purple-600" />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-gray-900">Submit Your Metabolic Event Here</div>
                  <div className="text-sm text-gray-500">Add your Metabolic Reset event to the calendar</div>
                </div>
              </div>
              <ExternalLink className="h-5 w-5 text-gray-400 group-hover:text-purple-600" />
            </a>
          </div>
        </div>
      </main>
    </div>
  )
}

