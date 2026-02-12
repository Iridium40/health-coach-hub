"use client"

import { useEffect, useState } from "react"
import { Header } from "@/components/header"

const DOC_ID = "1nLXcyXJBbrVxnJfv7cdPpgJj-jSr9r8oghxdUSQ_hOs"
const TEAM_PADLETS_EDIT_URL = `https://docs.google.com/document/d/${DOC_ID}/edit?tab=t.0`
const TEAM_PADLETS_MOBILE_URL = `https://docs.google.com/document/d/${DOC_ID}/mobilebasic`

export default function TeamPadletsPage() {
  const [iframeSrc, setIframeSrc] = useState(TEAM_PADLETS_EDIT_URL)

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 640px)")

    const update = () => {
      setIframeSrc(mq.matches ? TEAM_PADLETS_MOBILE_URL : TEAM_PADLETS_EDIT_URL)
    }

    update()

    // Safari compatibility
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

      <main className="flex-1 bg-white flex flex-col min-h-0 overflow-hidden">
        {/* Doc viewer */}
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
