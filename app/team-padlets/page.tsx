"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ExternalLink } from "lucide-react"

const DOC_ID = "1nLXcyXJBbrVxnJfv7cdPpgJj-jSr9r8oghxdUSQ_hOs"
const TEAM_PADLETS_EDIT_URL = `https://docs.google.com/document/d/${DOC_ID}/edit?tab=t.0`
const TEAM_PADLETS_MOBILE_URL = `https://docs.google.com/document/d/${DOC_ID}/mobilebasic`

export default function TeamPadletsPage() {
  const router = useRouter()
  const [iframeSrc, setIframeSrc] = useState(TEAM_PADLETS_EDIT_URL)

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 640px)")

    const update = () => {
      setIframeSrc(mq.matches ? TEAM_PADLETS_MOBILE_URL : TEAM_PADLETS_EDIT_URL)
    }

    update()

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
    <div className="h-[100dvh] flex flex-col bg-white">
      <Header activeTab="team-padlets" />

      <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="gap-1.5 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <h1 className="text-sm font-semibold text-optavia-dark">Team Padlets</h1>
        </div>
        <a href={TEAM_PADLETS_EDIT_URL} target="_blank" rel="noopener noreferrer">
          <Button variant="outline" size="sm" className="gap-1.5 text-xs">
            <ExternalLink className="h-3.5 w-3.5" />
            Open Original
          </Button>
        </a>
      </div>

      <main className="flex-1 bg-white flex flex-col min-h-0 overflow-hidden">
        <div className="flex-1 min-h-0">
          <div className="h-full w-full sm:container sm:mx-auto sm:px-4 sm:py-4">
            <div className="h-full w-full sm:border sm:border-gray-200 sm:rounded-lg overflow-hidden bg-white sm:shadow-sm">
              <iframe
                title="Team Padlets"
                src={iframeSrc}
                className="w-full h-full"
                referrerPolicy="no-referrer"
                allow="clipboard-read; clipboard-write"
                scrolling="yes"
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
