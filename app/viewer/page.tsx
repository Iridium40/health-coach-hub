"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { Suspense } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ExternalLink, Loader2 } from "lucide-react"
import { Header } from "@/components/header"

function toEmbedUrl(url: string): string {
  try {
    const u = new URL(url)

    if (u.hostname.includes("docs.google.com")) {
      // /document/d/{id}/edit → /document/d/{id}/preview
      // /presentation/d/{id}/edit → /presentation/d/{id}/embed
      // /spreadsheets/d/{id}/edit → /spreadsheets/d/{id}/preview
      const path = u.pathname
      if (/\/document\//.test(path)) {
        return url.replace(/\/(edit|view)(#.*)?(\?.*)?$/, "/preview")
      }
      if (/\/presentation\//.test(path)) {
        return url.replace(/\/(edit|view)(#.*)?(\?.*)?$/, "/embed")
      }
      if (/\/spreadsheets\//.test(path)) {
        return url.replace(/\/(edit|view)(#.*)?(\?.*)?$/, "/preview")
      }
    }

    return url
  } catch {
    return url
  }
}

function ViewerContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const rawUrl = searchParams.get("url")
  const title = searchParams.get("title") || "Document"

  if (!rawUrl) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">No document URL provided.</p>
      </div>
    )
  }

  const embedUrl = toEmbedUrl(rawUrl)

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
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
          <h1 className="text-sm font-semibold text-optavia-dark truncate max-w-[200px] sm:max-w-none">
            {title}
          </h1>
        </div>
        <a
          href={rawUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button variant="outline" size="sm" className="gap-1.5 text-xs">
            <ExternalLink className="h-3.5 w-3.5" />
            Open Original
          </Button>
        </a>
      </div>
      <div className="flex-1 relative">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
          <Loader2 className="h-8 w-8 animate-spin text-gray-300" />
        </div>
        <iframe
          src={embedUrl}
          className="w-full h-full border-0 relative z-10 bg-white"
          style={{ minHeight: "calc(100vh - 120px)" }}
          title={title}
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
        />
      </div>
    </div>
  )
}

export default function ViewerPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-300" />
      </div>
    }>
      <ViewerContent />
    </Suspense>
  )
}
