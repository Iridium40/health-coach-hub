"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
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
import { CoachTip, PipelineSnapshot, TodaysPriorities, TodaysFocus, RankProgressCard, QuickActions, NextTrainingCard } from "@/components/dashboard/index"
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
  const { getBookmarkedIds } = useBookmarks(user, "training")

  // Bookmarks for pinned resources and coach tools (persisted in Supabase)
  const { getBookmarkedIds: getPinnedResourceIds } = useBookmarks(user, "resource")
  const { getBookmarkedIds: getPinnedToolIds } = useBookmarks(user, "coach_tool")

  // Rank calculator
  const { rankData, calculateGaps, getNextRank } = useRankCalculator(user)
  
  // Estimate points from clients only (~5 clients = 1 point)
  // Note: SC+ frontline coaches also contribute points - use Rank Calculator for full simulation
  const estimatedPoints = Math.floor(clientStats.active / 5)

  const [upcomingMeetings, setUpcomingMeetings] = useState<ExpandedZoomCall[]>([])
  const [loadingMeetings, setLoadingMeetings] = useState(true)
  const [onboardingProgress, setOnboardingProgress] = useState<{ completed: number; total: number; percentage: number }>({ completed: 0, total: 3, percentage: 0 })
  const [openToolId, setOpenToolId] = useState<string | null>(null)
  const [milestoneClient, setMilestoneClient] = useState<any | null>(null)
  const [showMilestoneModal, setShowMilestoneModal] = useState(false)
  const [showRankPromotionModal, setShowRankPromotionModal] = useState(false)
  const [promotedRank, setPromotedRank] = useState<string | null>(null)
  const [dismissedMilestoneKeys, setDismissedMilestoneKeys] = useState<Set<string>>(new Set())

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

  const dismissMilestoneForToday = useCallback((clientId: string, programDay: number) => {
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
  }, [])

  const isMilestoneDismissedToday = useCallback((clientId: string, programDay: number) => {
    return dismissedMilestoneKeys.has(`${clientId}:${programDay}`)
  }, [dismissedMilestoneKeys])

  // Get pinned tools and resources from Supabase bookmarks
  const pinnedToolIdsList = getPinnedToolIds()
  const pinnedResourceIdsList = getPinnedResourceIds()

  const pinnedTools = useMemo(() => {
    return COACH_TOOLS.filter(t => pinnedToolIdsList.includes(t.id))
  }, [pinnedToolIdsList])

  const pinnedResources = useMemo(() => {
    return EXTERNAL_RESOURCES.filter(r => pinnedResourceIdsList.includes(r.id))
  }, [pinnedResourceIdsList])

  // Get bookmarked training resources
  const bookmarkedTrainingResources = useMemo(() => {
    if (!trainingResources) return []
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
        .select("id,title,description,call_type,scheduled_at,duration_minutes,timezone,is_recurring,recurrence_pattern,recurrence_day,recurrence_end_date,zoom_link,zoom_meeting_id,zoom_passcode,recording_url,recording_platform,recording_available_at,status,created_by,created_at,updated_at")
        .in("status", ["upcoming", "live"])
        // Include recurring templates regardless of scheduled_at, and non-recurring calls scheduled today.
        .or(`is_recurring.eq.true,and(scheduled_at.gte.${todayStartIso},scheduled_at.lte.${todayEndIso})`)
        .order("scheduled_at", { ascending: true })

      if (!error && data) {
        // Expand recurring events and filter for today
        const expandedEvents = expandRecurringEvents(data, { rangeStart: todayStart, rangeEnd: todayEnd })
        const todaysEvents = getEventsForDate(expandedEvents, today)
        
        // Filter out meetings that ended more than 30 minutes ago
        const now = new Date()
        const pastCutoff = new Date(now.getTime() - 30 * 60 * 1000)
        const upcomingOrRecentEvents = todaysEvents.filter(m => {
          const meetingDate = new Date(m.occurrence_date)
          const duration = m.duration_minutes || 60
          const meetingEndTime = new Date(meetingDate.getTime() + duration * 60 * 1000)
          return meetingEndTime > pastCutoff
        })
        
        setUpcomingMeetings(upcomingOrRecentEvents.slice(0, 5))
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
    if (!recipes || !favoriteRecipes) return []
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
  // Note: Frontline coaches are now manually entered in the Rank Calculator
  const nextRank = rankData ? getNextRank(rankData.current_rank as RankType) : null
  const gaps = rankData ? calculateGaps(rankData.current_rank as RankType, estimatedPoints, 0, 0, 0, clientStats.active) : null

  // Check if ready for promotion and show celebration
  useEffect(() => {
    if (!rankData || !nextRank || !gaps) return
    
    // Check if all gaps are 0 (ready for promotion) and has minimum clients
    const isReadyForPromotion = gaps.minClients === 0 && gaps.points === 0 && gaps.scTeams === 0 && gaps.edTeams === 0 && gaps.fibcTeams === 0
    
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

  const completeDashboardClientCheckIn = useCallback(async (client: any) => {
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
  }, [updateClient, toggleTouchpoint])

  const logDashboardProspectFollowUp = useCallback(async (prospect: any, daysUntilNext = 3) => {
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
  }, [updateProspect])

  const completeDashboardHA = useCallback(async (prospect: any) => {
    const todayStr = new Date().toISOString().split("T")[0]
    await updateProspect(prospect.id, {
      ha_scheduled_at: null,
      last_action: todayStr,
    })
  }, [updateProspect])

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
      </div>

      {/* Announcements */}
      <Announcements />

      {/* Coach Tip of the Day */}
      <div className="mt-6">
        <CoachTip />
      </div>

      {/* Today's Focus */}
      <div className="mt-6">
        <TodaysFocus
          user={user ?? null}
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
          completeHA={completeDashboardHA}
          dismissMilestone={dismissMilestoneForToday}
          isMilestoneDismissed={isMilestoneDismissedToday}
          onCelebrateClick={(client) => {
            setMilestoneClient(client)
            setShowMilestoneModal(true)
          }}
        />
      </div>

      {/* Dashboard Buttons */}
      <div className="mt-6">
        <QuickActions />
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
            <DialogContent className="max-h-[90vh] overflow-y-auto max-w-[95vw] sm:max-w-[95vw] md:max-w-5xl lg:max-w-6xl">
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
              <DialogHeader className="sr-only">
                <DialogTitle>Rank Promotion Celebration</DialogTitle>
              </DialogHeader>
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
