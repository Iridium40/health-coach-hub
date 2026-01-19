"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import dynamic from "next/dynamic"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Announcements } from "@/components/announcements"
import { useUserData } from "@/contexts/user-data-context"
import { createClient } from "@/lib/supabase/client"
import {
  Video, Calendar, Clock, Users, ChevronRight,
  BookOpen, UtensilsCrossed, Wrench, ExternalLink, Award,
  CheckCircle, Sparkles, Star, GraduationCap, Link2, Pin,
  Droplets, Dumbbell, Activity, Share2, Bookmark,
  Info, Trophy, Heart
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { useProspects } from "@/hooks/use-prospects"
import { useClients } from "@/hooks/use-clients"
import { useTrainingResources } from "@/hooks/use-training-resources"
import { useRankCalculator, type RankType, RANK_REQUIREMENTS } from "@/hooks/use-rank-calculator"
import { useBookmarks } from "@/hooks/use-bookmarks"
import type { ZoomCall } from "@/lib/types"
import { expandRecurringEvents, getEventsForDate, type ExpandedZoomCall } from "@/lib/expand-recurring-events"
import { getOnboardingProgress } from "@/lib/onboarding-utils"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Progress } from "@/components/ui/progress"

// Dashboard Components
import { CoachTip, PipelineSnapshot, TodaysPriorities, RankProgressCard, QuickActions, NextTrainingCard } from "@/components/dashboard/index"
import { TodaysFocus } from "@/components/dashboard/TodaysFocus"
import { getProgramDay } from "@/hooks/use-clients"

// Lazy-load heavy modals/tools to reduce initial dashboard JS (big win at scale)
const MilestoneActionModal = dynamic(
  () => import("@/components/milestone-action-modal").then((m) => m.MilestoneActionModal),
  { ssr: false }
)

const WaterCalculator = dynamic(
  () => import("@/components/coach-tools/water-calculator").then((m) => m.WaterCalculator),
  { ssr: false }
)
const ExerciseGuide = dynamic(
  () => import("@/components/coach-tools/exercise-guide").then((m) => m.ExerciseGuide),
  { ssr: false }
)
const MetabolicHealthInfo = dynamic(
  () => import("@/components/coach-tools/metabolic-health-info").then((m) => m.MetabolicHealthInfo),
  { ssr: false }
)
const ClientOnboardingDialog = dynamic(
  () => import("@/components/coach-tools/client-onboarding-dialog").then((m) => m.ClientOnboardingDialog),
  { ssr: false }
)
const ClientTroubleshootingDialog = dynamic(
  () => import("@/components/coach-tools/client-troubleshooting-dialog").then((m) => m.ClientTroubleshootingDialog),
  { ssr: false }
)
const SocialMediaPromptGenerator = dynamic(
  () => import("@/components/social-media-prompt-generator").then((m) => m.SocialMediaPromptGenerator),
  { ssr: false }
)
const OPTAVIAReferenceGuide = dynamic(
  () => import("@/components/coach-tools/optavia-reference-guide").then((m) => m.OPTAVIAReferenceGuide),
  { ssr: false }
)

// Coach Tools definitions
const COACH_TOOLS: { id: string; title: string; icon: LucideIcon; component: React.ComponentType }[] = [
  { id: "client-onboarding", title: "Client Onboarding Tool", icon: Users, component: ClientOnboardingDialog },
  { id: "client-troubleshooting", title: "Client Troubleshooting Guide", icon: Wrench, component: ClientTroubleshootingDialog },
  { id: "water-calculator", title: "Water Intake Calculator", icon: Droplets, component: WaterCalculator },
  { id: "exercise-guide", title: "Exercise & Motion Guide", icon: Dumbbell, component: ExerciseGuide },
  { id: "metabolic-health", title: "Metabolic Health Education", icon: Activity, component: MetabolicHealthInfo },
  { id: "social-media-generator", title: "Social Media Post Generator", icon: Share2, component: SocialMediaPromptGenerator },
  { id: "optavia-reference", title: "Condiments Quick Reference Guide", icon: BookOpen, component: OPTAVIAReferenceGuide },
]

// External Resources definitions
const EXTERNAL_RESOURCES: { id: string; title: string; url: string }[] = [
  { id: "optavia-strong-fb", title: "Optavia Strong Facebook Group", url: "https://www.facebook.com/groups/810104670912639" },
  { id: "healthy-edge-team", title: "Healthy Edge 3.0 Team Page", url: "https://www.facebook.com/groups/2156291101444241" },
  { id: "healthy-edge-client", title: "Healthy Edge 3.0 Client Page", url: "https://www.facebook.com/groups/778947831962215" },
  { id: "optavia-connect", title: "OPTAVIA Connect", url: "https://optaviaconnect.com/login" },
  { id: "optavia-blog", title: "OPTAVIA Blog", url: "https://www.optaviablog.com" },
  { id: "habits-of-health", title: "Habits of Health", url: "https://www.habitsofhealth.com/" },
]

export function DashboardOverview() {
  const { user, profile, badges, recipes, favoriteRecipes } = useUserData()
  const supabase = createClient()

  // CRM hooks
  const { prospects, stats: prospectStats, updateProspect } = useProspects()
  const { clients, stats: clientStats, toggleTouchpoint, needsAttention, updateClient } = useClients()

  // Training resources progress - pass user rank to properly filter accessible categories
  const { progress: trainingProgress, resources: trainingResources } = useTrainingResources(user, profile?.coach_rank || null)
  
  // Bookmarks for training resources
  const { getBookmarkedIds } = useBookmarks(user)

  // Rank calculator
  const { rankData, frontlineCoaches, qualifyingLegsCount, calculateGaps, getNextRank } = useRankCalculator(user)

  const [upcomingMeetings, setUpcomingMeetings] = useState<ExpandedZoomCall[]>([])
  const [loadingMeetings, setLoadingMeetings] = useState(true)
  const [onboardingProgress, setOnboardingProgress] = useState<{ completed: number; total: number; percentage: number }>({ completed: 0, total: 3, percentage: 0 })
  const [pinnedToolIds, setPinnedToolIds] = useState<string[]>([])
  const [pinnedResourceIds, setPinnedResourceIds] = useState<string[]>([])
  const [openToolId, setOpenToolId] = useState<string | null>(null)
  const [milestoneClient, setMilestoneClient] = useState<any | null>(null)
  const [showMilestoneModal, setShowMilestoneModal] = useState(false)
  const [showRankPromotionModal, setShowRankPromotionModal] = useState(false)
  const [promotedRank, setPromotedRank] = useState<string | null>(null)
  const [dismissedMilestoneKeys, setDismissedMilestoneKeys] = useState<Set<string>>(new Set())

  // Load pinned items from localStorage (with Safari-safe error handling)
  useEffect(() => {
    // Safety check for localStorage availability (Safari private mode, etc.)
    const isLocalStorageAvailable = () => {
      try {
        const testKey = "__test__"
        window.localStorage.setItem(testKey, testKey)
        window.localStorage.removeItem(testKey)
        return true
      } catch (e) {
        return false
      }
    }

    if (!isLocalStorageAvailable()) {
      console.warn("localStorage not available (possibly Safari private mode)")
      return
    }

    try {
      const savedTools = localStorage.getItem("pinnedTools")
      if (savedTools) {
        const parsed = JSON.parse(savedTools)
        if (Array.isArray(parsed)) {
          setPinnedToolIds(parsed)
        }
      }
    } catch (e) {
      console.error("Failed to parse pinned tools:", e)
    }

    try {
      const savedResources = localStorage.getItem("pinnedResources")
      if (savedResources) {
        const parsed = JSON.parse(savedResources)
        if (Array.isArray(parsed)) {
          setPinnedResourceIds(parsed)
        }
      }
    } catch (e) {
      console.error("Failed to parse pinned resources:", e)
    }
  }, [])

  // Milestone dismissals (per day) so "Celebrate!" cards can be cleared
  useEffect(() => {
    try {
      const todayKey = new Date().toISOString().split("T")[0]
      const raw = localStorage.getItem(`dismissedMilestones_${todayKey}`)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) setDismissedMilestoneKeys(new Set(parsed))
      }
    } catch {
      // ignore
    }
  }, [])

  const dismissMilestoneForToday = (clientId: string, programDay: number) => {
    const todayKey = new Date().toISOString().split("T")[0]
    const key = `${clientId}:${programDay}`
    setDismissedMilestoneKeys((prev) => {
      const next = new Set(prev)
      next.add(key)
      try {
        localStorage.setItem(`dismissedMilestones_${todayKey}`, JSON.stringify(Array.from(next)))
      } catch {
        // ignore
      }
      return next
    })
  }

  const isMilestoneDismissedToday = (clientId: string, programDay: number) => {
    return dismissedMilestoneKeys.has(`${clientId}:${programDay}`)
  }

  // Get pinned tools and resources
  const pinnedTools = useMemo(() => {
    return COACH_TOOLS.filter(t => pinnedToolIds.includes(t.id))
  }, [pinnedToolIds])

  const pinnedResources = useMemo(() => {
    return EXTERNAL_RESOURCES.filter(r => pinnedResourceIds.includes(r.id))
  }, [pinnedResourceIds])

  // Get bookmarked training resources
  const bookmarkedTrainingResources = useMemo(() => {
    const bookmarkedIds = getBookmarkedIds()
    return trainingResources.filter(r => bookmarkedIds.includes(r.id))
  }, [trainingResources, getBookmarkedIds])

  const hasPinnedItems = pinnedTools.length > 0 || pinnedResources.length > 0 || bookmarkedTrainingResources.length > 0

  // Load today's meetings (including recurring)
  useEffect(() => {
    if (!user) return

    const loadMeetings = async () => {
      const today = new Date()
      const todayStart = new Date(today)
      todayStart.setHours(0, 0, 0, 0)
      const todayEnd = new Date(today)
      todayEnd.setHours(23, 59, 59, 999)
      const todayStartIso = todayStart.toISOString()
      const todayEndIso = todayEnd.toISOString()

      // Fetch all upcoming/live meetings to expand recurring ones
      const { data, error } = await supabase
        .from("zoom_calls")
        .select("id,title,description,call_type,scheduled_at,duration_minutes,timezone,is_recurring,recurrence_pattern,recurrence_day,recurrence_end_date,zoom_link,zoom_meeting_id,zoom_passcode,recording_url,recording_platform,recording_available_at,status,created_at,updated_at")
        .in("status", ["upcoming", "live"])
        // Include recurring templates regardless of scheduled_at, and non-recurring calls scheduled today.
        .or(`is_recurring.eq.true,and(scheduled_at.gte.${todayStartIso},scheduled_at.lte.${todayEndIso})`)
        .order("scheduled_at", { ascending: true })

      if (!error && data) {
        // Expand recurring events and filter for today
        const expandedEvents = expandRecurringEvents(data, { rangeStart: todayStart, rangeEnd: todayEnd })
        const todaysEvents = getEventsForDate(expandedEvents, today)
        setUpcomingMeetings(todaysEvents.slice(0, 5))
      }
      setLoadingMeetings(false)
    }

    loadMeetings()
  }, [user])

  // Load onboarding progress for new coaches
  useEffect(() => {
    if (!user || !profile?.is_new_coach) {
      setOnboardingProgress({ completed: 0, total: 3, percentage: 0 })
      return
    }

    const loadOnboardingProgress = async () => {
      const progress = await getOnboardingProgress(user.id)
      setOnboardingProgress(progress)
    }

    loadOnboardingProgress()
  }, [user, profile?.is_new_coach])

  // Get popular recipes
  const popularRecipes = useMemo(() => {
    const unfavoritedRecipes = recipes.filter(r => !favoriteRecipes.includes(r.id))
    const sortedByPopularity = [...unfavoritedRecipes].sort((a, b) =>
      (b.favoriteCount || 0) - (a.favoriteCount || 0)
    )
    return sortedByPopularity.slice(0, 4)
  }, [recipes, favoriteRecipes])

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good morning"
    if (hour < 17) return "Good afternoon"
    return "Good evening"
  }

  const firstName = profile?.full_name?.split(" ")[0] || "Coach"

  // Calculate rank gaps for RankProgressCard
  const nextRank = rankData ? getNextRank(rankData.current_rank as RankType) : null
  const gaps = rankData ? calculateGaps(rankData.current_rank as RankType, clientStats.active) : null

  // Check if ready for promotion and show celebration
  useEffect(() => {
    if (!rankData || !nextRank || !gaps) return
    
    // Check if all gaps are 0 (ready for promotion)
    const isReadyForPromotion = gaps.clients === 0 && gaps.coaches === 0 && gaps.qualifyingLegs === 0
    
    if (isReadyForPromotion) {
      // Check if we've already shown this celebration (using localStorage)
      const lastCelebratedRank = localStorage.getItem(`rankPromotionCelebrated_${nextRank}`)
      const currentRankKey = `${rankData.current_rank}_to_${nextRank}`
      
      // Only show if we haven't celebrated this specific promotion yet
      if (lastCelebratedRank !== currentRankKey) {
        setPromotedRank(nextRank)
        setShowRankPromotionModal(true)
        // Mark as celebrated
        localStorage.setItem(`rankPromotionCelebrated_${nextRank}`, currentRankKey)
      }
    }
  }, [rankData, nextRank, gaps])

  const completeDashboardClientCheckIn = async (client: any) => {
    // If the "needs attention" is caused by an overdue scheduled check-in, clear the schedule so the alert goes away.
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)

    if (client.next_scheduled_at) {
      const scheduled = new Date(client.next_scheduled_at)
      const scheduledDay = new Date(scheduled)
      scheduledDay.setHours(0, 0, 0, 0)
      if (scheduledDay.getTime() <= todayStart.getTime()) {
        await updateClient(client.id, {
          next_scheduled_at: null,
          recurring_frequency: null,
          recurring_day: null,
          recurring_time: null,
        })
      }
    }

    // Marks today's touchpoint as done (and sets last_touchpoint_date to today in the hook)
    await toggleTouchpoint(client.id, "am_done")
  }

  const logDashboardProspectFollowUp = async (prospect: any, daysUntilNext = 3) => {
    const today = new Date()
    const todayStr = today.toISOString().split("T")[0]
    const nextDate = new Date(today)
    nextDate.setDate(nextDate.getDate() + daysUntilNext)
    const nextStr = nextDate.toISOString().split("T")[0]

    await updateProspect(prospect.id, {
      last_action: todayStr,
      next_action: nextStr,
      action_type: "follow_up" as any,
    })
  }

  return (
    <div className="container mx-auto px-4 py-4 sm:py-8">
      {/* Welcome Section */}
      <div className="text-center py-4 sm:py-6 mb-6">
        <h1 className="font-heading font-bold text-2xl sm:text-3xl text-optavia-dark mb-2">
          {getGreeting()}, {firstName}!
        </h1>
        <p className="text-optavia-gray text-base sm:text-lg">
          {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
        </p>
        <div className="mt-4 flex justify-center px-2">
          <Link href="/coaching-quick-links">
            <Button
              className="group w-full max-w-sm sm:w-auto bg-[hsl(var(--optavia-green))] hover:bg-[hsl(var(--optavia-green))]/90 text-white font-bold tracking-wide shadow-lg hover:shadow-xl transition-all ring-2 ring-[hsl(var(--optavia-green))]/25 whitespace-normal leading-tight"
              size="lg"
            >
              <Link2 className="h-5 w-5 mr-2 text-white/95 group-hover:text-white" />
              COACHING QUICK LINKS
            </Button>
          </Link>
        </div>
      </div>

      {/* Announcements */}
      <Announcements />

      {/* Today's Focus - Combined Training + Today's Tasks */}
      <div className="mt-6">
        <TodaysFocus
          user={user}
          userRank={profile?.coach_rank || null}
          isNewCoach={profile?.is_new_coach}
          clients={clients}
          prospects={prospects}
          upcomingMeetings={upcomingMeetings}
          loadingMeetings={loadingMeetings}
          needsAttention={needsAttention}
          toggleTouchpoint={toggleTouchpoint}
          completeClientCheckIn={completeDashboardClientCheckIn}
          logProspectFollowUp={logDashboardProspectFollowUp}
          dismissMilestone={dismissMilestoneForToday}
          isMilestoneDismissed={isMilestoneDismissedToday}
          onCelebrateClick={(client) => {
            setMilestoneClient(client)
            setShowMilestoneModal(true)
          }}
        />
      </div>

      {/* Coach Tip of the Day */}
      <div className="mt-6">
        <CoachTip />
      </div>

      {/* Section 2: Pipeline Snapshot (4 stat cards) */}
      <div className="mt-6">
        <PipelineSnapshot
          clients={clients}
          clientStats={clientStats}
          prospects={prospects}
          prospectStats={prospectStats}
        />
      </div>

      {/* Main Grid: Quick Links + Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {/* Quick Links Card */}
        <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg flex items-center gap-2 text-optavia-dark">
                  <Pin className="h-5 w-5 text-[hsl(var(--optavia-green))]" />
                  Quick Links
                </CardTitle>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button className="text-gray-400 hover:text-gray-600">
                        <Info className="h-4 w-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="max-w-xs p-3 bg-white/95 backdrop-blur-sm shadow-lg border border-gray-200">
                      <p className="font-semibold text-gray-700 mb-1">Quick Links</p>
                      <p className="text-sm text-gray-600">
                        Your pinned coach tools, external resource links, and bookmarked training resources from the Resources and Training pages.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Link href="/resources">
                <Button variant="ghost" size="sm" className="text-[hsl(var(--optavia-green))] hover:bg-green-50 -mr-2 text-xs">
                  Manage
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {hasPinnedItems ? (
              <div className="space-y-2">
                {pinnedTools.map((tool) => {
                  const IconComponent = tool.icon
                  return (
                    <button
                      key={tool.id}
                      onClick={() => setOpenToolId(tool.id)}
                      className="w-full flex items-center gap-2 p-2.5 rounded-lg border-2 border-[hsl(var(--optavia-green))] bg-[hsl(var(--optavia-green-light))] hover:bg-green-100 transition-colors cursor-pointer group text-left"
                    >
                      <IconComponent className="h-4 w-4 text-[hsl(var(--optavia-green))] flex-shrink-0" />
                      <span className="font-medium text-sm text-optavia-dark group-hover:text-[hsl(var(--optavia-green))] flex-1 truncate">
                        {tool.title}
                      </span>
                      <ChevronRight className="h-3 w-3 text-optavia-gray flex-shrink-0" />
                    </button>
                  )
                })}

                {pinnedResources.map((resource) => (
                  <a
                    key={resource.id}
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-2.5 rounded-lg border-2 border-[hsl(var(--optavia-green))] bg-[hsl(var(--optavia-green-light))] hover:bg-green-100 transition-colors cursor-pointer group"
                  >
                    <Link2 className="h-4 w-4 text-[hsl(var(--optavia-green))] flex-shrink-0" />
                    <span className="font-medium text-sm text-optavia-dark group-hover:text-[hsl(var(--optavia-green))] flex-1 truncate">
                      {resource.title}
                    </span>
                    <ExternalLink className="h-3 w-3 text-optavia-gray flex-shrink-0" />
                  </a>
                ))}

                {/* Bookmarked Training Resources */}
                {bookmarkedTrainingResources.map((resource) => (
                  <a
                    key={`bookmark-${resource.id}`}
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-2.5 rounded-lg border-2 border-amber-400 bg-amber-50 hover:bg-amber-100 transition-colors cursor-pointer group"
                  >
                    <Bookmark className="h-4 w-4 text-amber-500 fill-amber-400 flex-shrink-0" />
                    <span className="font-medium text-sm text-optavia-dark group-hover:text-amber-600 flex-1 truncate">
                      {resource.title}
                    </span>
                    <ExternalLink className="h-3 w-3 text-optavia-gray flex-shrink-0" />
                  </a>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <Pin className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-optavia-gray mb-3">No quick links yet</p>
                <Link href="/resources">
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-[hsl(var(--optavia-green))] text-[hsl(var(--optavia-green))] hover:bg-[hsl(var(--optavia-green-light))]"
                  >
                    <Pin className="h-3 w-3 mr-1" />
                    Browse Resources
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Smart Quick Actions - contextual based on current state */}
        {(() => {
          const today = new Date().toISOString().split("T")[0]
          const todayStart = new Date()
          todayStart.setHours(0, 0, 0, 0)
          const todayEnd = new Date()
          todayEnd.setHours(23, 59, 59, 999)
          
          const overdueProspects = prospects.filter(p => {
            if (!p.next_action || ["converted", "coach", "not_interested"].includes(p.status)) return false
            return new Date(p.next_action) < new Date(today)
          }).length
          
          const haScheduledToday = prospects.filter(p => 
            p.status === "ha_scheduled" && 
            p.ha_scheduled_at && 
            new Date(p.ha_scheduled_at) >= todayStart && 
            new Date(p.ha_scheduled_at) <= todayEnd
          ).length
          
          return (
            <QuickActions
              overdueProspects={overdueProspects}
              clientsNeedingCheckIn={clientStats.needsAttention}
              haScheduledToday={haScheduledToday}
              trainingPercentage={trainingProgress.percentage}
            />
          )
        })()}
      </div>

      {/* Business Growth (Rank Progress) */}
      {rankData && (
        <div className="mt-6">
          <RankProgressCard
            currentRank={rankData.current_rank}
            nextRank={nextRank}
            activeClients={clientStats.active}
            frontlineCoaches={frontlineCoaches.length}
            qualifyingLegs={qualifyingLegsCount}
            gaps={gaps}
          />
        </div>
      )}

      {/* Popular Recipes */}
      {popularRecipes.length > 0 && (
        <Card className="mt-6 bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2 text-optavia-dark">
                <UtensilsCrossed className="h-5 w-5 text-orange-500" />
                Popular Recipes
              </CardTitle>
              <Link href="/recipes">
                <Button variant="ghost" size="sm" className="text-[hsl(var(--optavia-green))] hover:bg-green-50 -mr-2">
                  View All <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {popularRecipes.map((recipe) => (
                <Link key={recipe.id} href={`/recipes/${recipe.id}`}>
                  <div className="group rounded-lg overflow-hidden border border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
                    <div className="aspect-video relative overflow-hidden bg-gray-100">
                      <img
                        src={recipe.image || "/recipies/placeholder.jpg"}
                        alt={recipe.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <Badge
                        variant="secondary"
                        className="absolute top-2 left-2 bg-white/90 text-xs"
                      >
                        {recipe.category}
                      </Badge>
                    </div>
                    <div className="p-3">
                      <p className="font-medium text-sm text-optavia-dark line-clamp-1">{recipe.title}</p>
                      <p className="text-xs text-optavia-gray mt-1">
                        {recipe.prepTime + recipe.cookTime} min · {recipe.difficulty}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tool Dialogs */}
      {COACH_TOOLS.map((tool) => {
        const ToolComponent = tool.component
        const IconComponent = tool.icon

        return (
          <Dialog key={tool.id} open={openToolId === tool.id} onOpenChange={(open) => !open && setOpenToolId(null)}>
            <DialogContent className="max-h-[90vh] overflow-y-auto max-w-[95vw] md:max-w-5xl lg:max-w-6xl">
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-[hsl(var(--optavia-green-light))]">
                    <IconComponent className="h-5 w-5 text-[hsl(var(--optavia-green))]" />
                  </div>
                  <DialogTitle className="text-xl text-optavia-dark">{tool.title}</DialogTitle>
                </div>
              </DialogHeader>
              <div className="mt-4">
                <ToolComponent />
              </div>
            </DialogContent>
          </Dialog>
        )
      })}

      {/* Milestone Action Modal */}
      {milestoneClient && (
        <MilestoneActionModal
          open={showMilestoneModal}
          onOpenChange={setShowMilestoneModal}
          clientLabel={milestoneClient.label}
          programDay={getProgramDay(milestoneClient.start_date)}
        />
      )}

      {/* Rank Promotion Celebration Modal */}
      {promotedRank && (() => {
        const rankInfo = RANK_REQUIREMENTS[promotedRank as RankType]
        const rankIcon = rankInfo?.icon || '🏆'
        const rankName = promotedRank
        
        return (
          <Dialog open={showRankPromotionModal} onOpenChange={setShowRankPromotionModal}>
            <DialogContent className="max-w-md text-center">
              <div className="py-6">
                <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-amber-400 via-yellow-400 to-amber-600 rounded-full flex items-center justify-center shadow-2xl animate-bounce">
                  <Trophy className="h-12 w-12 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-gray-800 mb-3">
                  🎉 RANK PROMOTION! 🎉
                </h2>
                <div className="mb-4">
                  <div className="text-6xl mb-2">
                    {rankIcon}
                  </div>
                  <div className="text-3xl font-bold text-amber-700 mb-1">
                    {rankName}
                  </div>
                  <p className="text-lg text-gray-600 mt-2">
                    You've achieved all the requirements!
                  </p>
                </div>
                <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-lg p-5 mb-4">
                  <div className="flex items-center justify-center gap-2 text-amber-700 mb-3">
                    <Star className="h-6 w-6 fill-current" />
                    <span className="font-bold text-lg">Incredible Achievement!</span>
                    <Star className="h-6 w-6 fill-current" />
                  </div>
                  <p className="text-sm text-amber-800 leading-relaxed">
                    {rankName === "Senior Coach" && "Your first promotion! You're building momentum and making a real impact. Keep going! 🌟"}
                    {rankName === "Executive Director" && "Executive Director! You're leading by example and building a strong team. Amazing work! 💫"}
                    {rankName === "FIBC" && "FIBC! You've built a solid foundation with qualifying legs. You're a true leader! 🏆"}
                    {rankName === "Global Director" && "Global Director! Your influence is expanding. You're changing lives at scale! 🌍"}
                    {rankName === "Presidential Director" && "Presidential Director! The pinnacle of leadership. You've built an incredible legacy! 👑"}
                    {rankName === "IPD" && "IPD! The highest achievement. You've reached the absolute top! 💎"}
                    {!["Senior Coach", "Executive Director", "FIBC", "Global Director", "Presidential Director", "IPD"].includes(rankName) && 
                      `Congratulations on reaching ${rankName}! Your dedication and hard work have paid off. Keep inspiring others! 🎊`
                    }
                  </p>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                  <p className="text-sm text-green-700 font-medium">
                    💚 Remember: Rank is great, but the lives you've changed are what truly matter.
                  </p>
                </div>
              </div>
              <Button 
                onClick={() => {
                  setShowRankPromotionModal(false)
                  setPromotedRank(null)
                }}
                className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-bold text-lg py-6 shadow-lg"
              >
                Continue the Journey! 🚀
              </Button>
            </DialogContent>
          </Dialog>
        )
      })()}
    </div>
  )
}
