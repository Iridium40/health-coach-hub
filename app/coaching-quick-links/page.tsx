"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

const DOC_ID = "1rMvUSWUDvxEy7pTHKt5JmiLLtG6wrMaQpKVOgcCXmn0"
const COACHING_QUICK_LINKS_EDIT_URL = `https://docs.google.com/document/d/${DOC_ID}/edit?tab=t.0`
const COACHING_QUICK_LINKS_PREVIEW_URL = `https://docs.google.com/document/d/${DOC_ID}/preview`
const COACHING_QUICK_LINKS_MOBILE_URL = `https://docs.google.com/document/d/${DOC_ID}/mobilebasic`

export default function CoachingQuickLinksPage() {
  // Mobile-friendly rendering: Google's /edit UI is cramped in an iframe on small screens.
  // Use /mobilebasic on mobile while staying fully inside the app (continuous scroll, less whitespace).
  const [iframeSrc, setIframeSrc] = useState(COACHING_QUICK_LINKS_EDIT_URL)

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 640px)")

    const update = () => {
      setIframeSrc(mq.matches ? COACHING_QUICK_LINKS_MOBILE_URL : COACHING_QUICK_LINKS_EDIT_URL)
    }

    update()

    // Safari compatibility for older versions
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (mq.addEventListener) mq.addEventListener("change", update)
    else mq.addListener(update)

    return () => {
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (mq.removeEventListener) mq.removeEventListener("change", update)
      else mq.removeListener(update)
    }
  }, [])

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header activeTab="dashboard" />

      <main className="flex-1 bg-white flex flex-col min-h-0 overflow-hidden">
        {/* Compact top bar (mobile-first) */}
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
                  Coaching Quick Links
                </h1>
                <p className="text-xs text-optavia-gray hidden sm:block">
                  This opens inside the app (no redirect, no new tab).
                </p>
              </div>

              <div className="ml-auto hidden sm:flex items-center gap-2">
                <a href={COACHING_QUICK_LINKS_EDIT_URL} className="text-xs text-[hsl(var(--optavia-green))] hover:underline">
                  Open in Google Docs
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Doc viewer */}
        <div className="flex-1 min-h-0">
          <div className="h-full w-full sm:container sm:mx-auto sm:px-4 sm:py-4">
            <div className="h-full w-full sm:border sm:border-gray-200 sm:rounded-lg overflow-hidden bg-white sm:shadow-sm">
              <iframe
                title="Coaching Quick Links"
                src={iframeSrc}
                className="w-full h-full"
                referrerPolicy="no-referrer"
                allow="clipboard-read; clipboard-write"
                scrolling="yes"
              />
            </div>
          </div>
        </div>

        <p className="hidden sm:block container mx-auto px-4 pb-4 text-xs text-optavia-gray">
          If the document doesn’t load, Google may be blocking embedding for this doc.
        </p>
      </main>

      {/* Hide footer on mobile to maximize viewer space */}
      <div className="hidden md:block">
        <Footer />
      </div>
    </div>
  )
}

