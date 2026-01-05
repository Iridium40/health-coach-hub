"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ExternalLink, X, Loader2, AlertCircle } from "lucide-react"

interface EmbeddedContentViewerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  url: string
  title: string
  type: string
}

// Convert URLs to embeddable versions
function getEmbedUrl(url: string, type: string): string | null {
  // Canva type resources cannot be embedded
  if (type === "canva") {
    return null
  }
  
  try {
    const urlObj = new URL(url)
    
    // Google Docs/Sheets/Slides
    if (urlObj.hostname.includes("docs.google.com")) {
      // Already a preview or embed URL
      if (url.includes("/preview") || url.includes("/embed")) {
        return url
      }
      // Convert edit URL to preview
      if (url.includes("/edit")) {
        return url.replace("/edit", "/preview")
      }
      // Add preview to the end
      return url.replace(/\/?$/, "/preview")
    }
    
    // Google Drive files
    if (urlObj.hostname.includes("drive.google.com") && url.includes("/file/d/")) {
      const fileId = url.match(/\/file\/d\/([^/]+)/)?.[1]
      if (fileId) {
        return `https://drive.google.com/file/d/${fileId}/preview`
      }
    }
    
    // Vimeo
    if (urlObj.hostname.includes("vimeo.com")) {
      const videoId = urlObj.pathname.split("/").pop()
      if (videoId && /^\d+$/.test(videoId)) {
        return `https://player.vimeo.com/video/${videoId}`
      }
    }
    
    // YouTube
    if (urlObj.hostname.includes("youtube.com") || urlObj.hostname.includes("youtu.be")) {
      let videoId = ""
      if (urlObj.hostname.includes("youtu.be")) {
        videoId = urlObj.pathname.slice(1)
      } else {
        videoId = urlObj.searchParams.get("v") || ""
      }
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`
      }
    }
    
    // Loom
    if (urlObj.hostname.includes("loom.com")) {
      if (url.includes("/embed/")) {
        return url
      }
      const videoId = urlObj.pathname.split("/").pop()
      if (videoId) {
        return `https://www.loom.com/embed/${videoId}`
      }
    }
    
    // Canva - Cannot be embedded (CSP blocks it)
    if (urlObj.hostname.includes("canva.com")) {
      return null // Canva blocks embedding via CSP
    }
    
    // For other URLs, return null to indicate embedding may not work
    return null
  } catch {
    return null
  }
}

export function EmbeddedContentViewer({
  open,
  onOpenChange,
  url,
  title,
  type,
}: EmbeddedContentViewerProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  
  const embedUrl = getEmbedUrl(url, type)
  const canEmbed = embedUrl !== null
  
  const handleLoad = () => {
    setLoading(false)
    setError(false)
  }
  
  const handleError = () => {
    setLoading(false)
    setError(true)
  }
  
  const openExternal = () => {
    window.open(url, "_blank", "noopener,noreferrer")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] w-[95vw] h-[90vh] p-0 flex flex-col">
        <DialogHeader className="px-4 py-3 border-b flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0 pr-4">
              <DialogTitle className="truncate">{title}</DialogTitle>
              <DialogDescription className="text-xs truncate">
                {url}
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={openExternal}
                className="flex items-center gap-1"
              >
                <ExternalLink className="h-4 w-4" />
                Open in New Tab
              </Button>
            </div>
          </div>
        </DialogHeader>
        
        <div className="flex-1 relative bg-gray-100 overflow-hidden">
          {canEmbed ? (
            <>
              {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                    <p className="text-sm text-gray-500">Loading content...</p>
                  </div>
                </div>
              )}
              {error && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                  <div className="flex flex-col items-center gap-3 text-center p-4">
                    <AlertCircle className="h-12 w-12 text-amber-500" />
                    <div>
                      <p className="font-medium text-gray-700">Unable to embed this content</p>
                      <p className="text-sm text-gray-500 mt-1">
                        The content may require sign-in or doesn't allow embedding.
                      </p>
                    </div>
                    <Button onClick={openExternal} className="mt-2">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Open in New Tab
                    </Button>
                  </div>
                </div>
              )}
              <iframe
                src={embedUrl}
                className="w-full h-full border-0"
                onLoad={handleLoad}
                onError={handleError}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
              />
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <div className="flex flex-col items-center gap-3 text-center p-4">
                <AlertCircle className="h-12 w-12 text-amber-500" />
                <div>
                  <p className="font-medium text-gray-700">This content cannot be embedded</p>
                  <p className="text-sm text-gray-500 mt-1">
                    This type of link needs to be opened in a new tab.
                  </p>
                </div>
                <Button onClick={openExternal} className="mt-2">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open in New Tab
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
