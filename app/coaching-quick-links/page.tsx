"use client"

import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

const COACHING_QUICK_LINKS_URL =
  "https://docs.google.com/document/d/1rMvUSWUDvxEy7pTHKt5JmiLLtG6wrMaQpKVOgcCXmn0/edit?tab=t.0"

export default function CoachingQuickLinksPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header activeTab="dashboard" />

      <main className="flex-1 bg-white">
        <div className="container mx-auto px-4 py-4 sm:py-6">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="min-w-0">
              <h1 className="font-heading font-bold text-xl sm:text-2xl text-optavia-dark truncate">
                Coaching Quick Links
              </h1>
              <p className="text-sm text-optavia-gray">
                This opens inside the app (no redirect, no new tab).
              </p>
            </div>

            <Link href="/dashboard">
              <Button variant="outline" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            </Link>
          </div>

          <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
            <iframe
              title="Coaching Quick Links"
              src={COACHING_QUICK_LINKS_URL}
              className="w-full h-[75vh] md:h-[78vh] lg:h-[80vh]"
              referrerPolicy="no-referrer"
              allow="clipboard-read; clipboard-write"
            />
          </div>

          <p className="text-xs text-optavia-gray mt-3">
            If the document doesn’t load, Google may be blocking embedding for this doc.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  )
}

