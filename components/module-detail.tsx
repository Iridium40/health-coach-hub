"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { ProgressBar } from "@/components/progress-bar"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ArrowLeft, Bookmark, ExternalLink, FileText, Video, X } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useAuth } from "@/hooks/use-auth"
import { useSupabaseData } from "@/hooks/use-supabase-data"
import { useUserData } from "@/contexts/user-data-context"
import { useToast } from "@/hooks/use-toast"
import { isOnboardingResource, checkOnboardingComplete, markOnboardingComplete } from "@/lib/onboarding-utils"
import type { Module, UserData } from "@/lib/types"

interface ModuleDetailProps {
  module: Module
  userData: UserData
  setUserData: (data: UserData) => void
  onBack: () => void
}

export function ModuleDetail({ module, userData, setUserData, onBack }: ModuleDetailProps) {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const { profile, refreshData } = useUserData()
  const { completedResources, bookmarks, toggleCompletedResource, toggleBookmark, loading } = useSupabaseData(user)
  const [openResource, setOpenResource] = useState<{ url: string; title: string; id: string } | null>(null)
  
  // Always use Supabase data when user is authenticated (it's the source of truth)
  // Only fall back to userData if not authenticated or data is still loading
  const effectiveCompletedResources = user && !loading ? completedResources : userData.completedResources
  const effectiveBookmarks = user && !loading ? bookmarks : userData.bookmarks
  const completedCount = module.resources.filter((resource) => effectiveCompletedResources.includes(resource.id)).length

  const progress = module.resources.length > 0 ? Math.round((completedCount / module.resources.length) * 100) : 0

  // Check if URL can be embedded in iframe
  const canEmbedInIframe = (url: string): boolean => {
    // URLs that cannot be embedded (block iframe embedding)
    const nonEmbeddableDomains = [
      "loom.com",
      "canva.com",
    ]
    
    return !nonEmbeddableDomains.some(domain => url.includes(domain))
  }

  // Convert URLs to embeddable format
  const getEmbedUrl = (url: string) => {
    // For onboarding pages, don't use iframe (they'll be routed)
    if (url.startsWith("/onboarding/")) {
      return url
    }
    
    // For academy pages, don't use iframe (they'll be routed)
    if (url.startsWith("/academy/")) {
      return url
    }
    
    // For Google Docs, convert to embeddable format
    if (url.includes("docs.google.com/document/d/")) {
      const docId = url.match(/\/document\/d\/([a-zA-Z0-9-_]+)/)?.[1]
      if (docId) {
        return `https://docs.google.com/document/d/${docId}/preview`
      }
    }
    
    // For Vimeo videos, convert to embeddable format
    if (url.includes("vimeo.com")) {
      // Handle different Vimeo URL formats:
      // https://vimeo.com/123456789
      // https://vimeo.com/123456789?fl=tl&fe=ec
      // https://vimeo.com/123456789/hash
      // https://vimeo.com/manage/videos/123456789/hash
      let videoId: string | undefined
      
      // Try to extract from manage URL format first
      const manageMatch = url.match(/\/manage\/videos\/(\d+)/)
      if (manageMatch) {
        videoId = manageMatch[1]
      } else {
        // Try to extract from standard format (matches /123456789 or /123456789/hash)
        // This regex captures the first number after vimeo.com/ and ignores trailing hash
        const standardMatch = url.match(/vimeo\.com\/(\d+)/)
        if (standardMatch) {
          videoId = standardMatch[1]
        }
      }
      
      if (videoId) {
        // Return embed URL with parameters for better player experience
        return `https://player.vimeo.com/video/${videoId}?autoplay=0&title=1&byline=0&portrait=0`
      }
      
      // If no video ID found, return original URL to show error or fallback
      console.warn("Could not extract Vimeo video ID from URL:", url)
      return url
    }
    
    // For YouTube videos, convert to embeddable format
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      let videoId: string | undefined
      
      // Handle youtube.com/watch?v=VIDEO_ID
      const watchMatch = url.match(/[?&]v=([a-zA-Z0-9_-]+)/)
      if (watchMatch) {
        videoId = watchMatch[1]
      } else {
        // Handle youtu.be/VIDEO_ID
        const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/)
        if (shortMatch) {
          videoId = shortMatch[1]
        }
      }
      
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`
      }
    }
    
    // For other URLs, try to use the original URL
    return url
  }

  // Check onboarding completion after marking a resource complete
  const handleToggleComplete = async (resourceId: string) => {
    if (user && toggleCompletedResource) {
      await toggleCompletedResource(resourceId)
      
      // Check if this is an onboarding resource and user is a new coach
      if (isOnboardingResource(resourceId) && profile?.is_new_coach) {
        // Check if all onboarding modules are now complete
        const allComplete = await checkOnboardingComplete(user.id)
        if (allComplete) {
          // Mark user as no longer a new coach
          await markOnboardingComplete(user.id)
          // Refresh user data to reflect the change
          await refreshData(true)
          toast({
            title: "🎉 Onboarding Complete!",
            description: "Congratulations! You've completed your new coach training. You now have access to all training modules.",
          })
        }
      }
    } else {
      // Fallback to local state if not authenticated
      const newCompleted = userData.completedResources.includes(resourceId)
        ? userData.completedResources.filter((id) => id !== resourceId)
        : [...userData.completedResources, resourceId]

      setUserData({
        ...userData,
        completedResources: newCompleted,
      })
    }
  }

  const handleToggleBookmark = (resourceId: string) => {
    if (user && toggleBookmark) {
      toggleBookmark(resourceId)
    } else {
      // Fallback to local state if not authenticated
      const newBookmarks = userData.bookmarks.includes(resourceId)
        ? userData.bookmarks.filter((id) => id !== resourceId)
        : [...userData.bookmarks, resourceId]

      setUserData({
        ...userData,
        bookmarks: newBookmarks,
      })
    }
  }

  // Auto-complete onboarding resources when opened
  const handleOpenResource = async (resource: { url: string; title: string; id: string }) => {
    // Check if this is an onboarding resource
    if (isOnboardingResource(resource.id)) {
      // If not already completed, mark it as complete
      if (user && !effectiveCompletedResources.includes(resource.id)) {
        await handleToggleComplete(resource.id)
      }
    }

    // If URL starts with /onboarding/, /academy/, or /training/, route to the page instead of opening in iframe
    if (resource.url.startsWith("/onboarding/") || resource.url.startsWith("/academy/") || resource.url.startsWith("/training/")) {
      router.push(resource.url)
      return
    }

    // If URL cannot be embedded (Loom, Canva, etc.), open in new tab
    if (!canEmbedInIframe(resource.url)) {
      window.open(resource.url, "_blank", "noopener,noreferrer")
      return
    }

    setOpenResource(resource)
  }

  return (
    <div className="container mx-auto px-4 py-4 sm:py-8">
      <Button variant="ghost" onClick={onBack} className="mb-4 sm:mb-6 gap-2 text-sm sm:text-base">
        <ArrowLeft className="h-4 w-4" />
        <span className="hidden sm:inline">Back to Training</span>
        <span className="sm:hidden">Back</span>
      </Button>

      <div className="mb-6 sm:mb-8">
        <div className="flex items-start gap-3 sm:gap-4 mb-4">
          <span className="text-3xl sm:text-5xl flex-shrink-0">{module.icon}</span>
          <div className="flex-1 min-w-0">
            <h1 className="font-heading font-bold text-xl sm:text-2xl md:text-3xl text-optavia-dark mb-2 break-words">{module.title}</h1>
            <Badge className="bg-[hsl(var(--optavia-green-light))] text-[hsl(var(--optavia-green))]">
              {module.category}
            </Badge>
            <p className="text-optavia-gray mt-3">{module.description}</p>
          </div>
        </div>

        <Card className="p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="font-heading font-semibold text-optavia-dark">Module Progress</span>
            <span className="font-bold text-[hsl(var(--optavia-green))]">{progress}%</span>
          </div>
          <ProgressBar progress={progress} />
          <p className="text-sm text-optavia-gray mt-2">
            {completedCount} of {module.resources.length} resources completed
          </p>
        </Card>
      </div>

      <div className="space-y-4">
        <h2 className="font-heading font-bold text-xl text-optavia-dark">Training</h2>
        {module.resources.map((resource) => {
          const isCompleted = effectiveCompletedResources.includes(resource.id)
          const isBookmarked = effectiveBookmarks.includes(resource.id)

          return (
            <Card key={resource.id} className="p-3 sm:p-4 bg-white border border-gray-200 shadow-sm">
              <div className="flex items-start gap-2 sm:gap-4">
                <div className="pt-1 flex-shrink-0">
                  <Checkbox 
                    checked={isCompleted} 
                    onCheckedChange={() => handleToggleComplete(resource.id)}
                    className="border-gray-400 data-[state=checked]:bg-[hsl(var(--optavia-green))] data-[state=checked]:border-[hsl(var(--optavia-green))]"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2 mb-1">
                    {resource.type === "doc" ? (
                      <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-[hsl(var(--optavia-green))] mt-0.5 flex-shrink-0" />
                    ) : (
                      <Video className="h-4 w-4 sm:h-5 sm:w-5 text-[hsl(var(--optavia-green))] mt-0.5 flex-shrink-0" />
                    )}
                    <h3
                      className={`font-heading font-semibold text-sm sm:text-base text-optavia-dark break-words ${isCompleted ? "line-through opacity-60" : ""}`}
                    >
                      {resource.title}
                    </h3>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {resource.type === "doc" ? "Document" : "Video"}
                  </Badge>
                </div>

                <div className="flex gap-1 sm:gap-2 flex-shrink-0">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleToggleBookmark(resource.id)}
                        className={`h-8 w-8 sm:h-10 sm:w-10 ${isBookmarked ? "text-[hsl(var(--optavia-green))]" : "text-optavia-gray"}`}
                      >
                        <Bookmark className={`h-3 w-3 sm:h-4 sm:w-4 ${isBookmarked ? "fill-current" : ""}`} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {isBookmarked ? "Remove bookmark" : "Bookmark this resource"}
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="sm"
                        className="gap-1 sm:gap-2 bg-[hsl(var(--optavia-green))] hover:bg-[hsl(var(--optavia-green-dark))] text-xs sm:text-sm px-2 sm:px-3"
                        onClick={() => handleOpenResource({ url: resource.url, title: resource.title, id: resource.id })}
                      >
                        <span className="hidden sm:inline">Open</span>
                        <span className="sm:hidden">Open</span>
                        <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      View document in app
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Resource View Modal */}
      <Dialog open={!!openResource} onOpenChange={(open) => !open && setOpenResource(null)}>
        <DialogContent className="max-w-[98vw] md:max-w-[95vw] lg:max-w-[92vw] xl:max-w-[90vw] w-[98vw] md:w-[95vw] lg:w-[92vw] xl:w-[90vw] h-[95vh] md:h-[96vh] lg:h-[97vh] p-0 flex flex-col" showCloseButton={false}>
          <DialogHeader className="px-4 sm:px-6 py-3 sm:py-4 border-b flex-shrink-0">
            <div className="flex items-center justify-between gap-2">
              <div className="flex-1 min-w-0">
                <DialogTitle className="text-base sm:text-lg font-heading truncate">{openResource?.title}</DialogTitle>
                <DialogDescription className="sr-only">
                  Video or document viewer for {openResource?.title}
                </DialogDescription>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setOpenResource(null)}
                className="h-8 w-8 sm:h-10 sm:w-10"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>
          <div className="flex-1 overflow-hidden relative bg-gray-50">
            {openResource && !openResource.url.startsWith("/onboarding/") && !openResource.url.startsWith("/academy/") && !openResource.url.startsWith("/training/health-assessment-mastery") && canEmbedInIframe(openResource.url) && (
              <iframe
                src={getEmbedUrl(openResource.url)}
                className="w-full h-full border-0"
                title={openResource.title}
                allow="clipboard-read; clipboard-write; autoplay; fullscreen; picture-in-picture"
                allowFullScreen
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
