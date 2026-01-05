"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
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
  ClipboardList, Droplets, Dumbbell, Activity, Share2
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { useProspects } from "@/hooks/use-prospects"
import { useClients } from "@/hooks/use-clients"
import { useTrainingResources } from "@/hooks/use-training-resources"
import { useRankCalculator, type RankType } from "@/hooks/use-rank-calculator"
import type { ZoomCall } from "@/lib/types"
import { getOnboardingProgress } from "@/lib/onboarding-utils"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"

// Dashboard Components
import { CoachTip, PipelineSnapshot, TodaysPriorities, TrainingProgressCard, RankProgressCard, QuickActions, NextTrainingCard } from "@/components/dashboard/index"
import { TodaysFocus } from "@/components/dashboard/TodaysFocus"

// Coach Tools imports
import { WaterCalculator } from "@/components/coach-tools/water-calculator"
import { ExerciseGuide } from "@/components/coach-tools/exercise-guide"
import { MetabolicHealthInfo } from "@/components/coach-tools/metabolic-health-info"
import { HealthAssessment } from "@/components/coach-tools/health-assessment"
import { ShareHALink } from "@/components/coach-tools/share-ha-link"
import { ClientOnboardingDialog } from "@/components/coach-tools/client-onboarding-dialog"
import { ClientTroubleshootingDialog } from "@/components/coach-tools/client-troubleshooting-dialog"
import { SocialMediaPromptGenerator } from "@/components/social-media-prompt-generator"

// Coach Tools definitions
const COACH_TOOLS: { id: string; title: string; icon: LucideIcon; component: React.ComponentType }[] = [
  { id: "share-ha-link", title: "Share Health Assessment", icon: Share2, component: ShareHALink },
  { id: "health-assessment", title: "Health Assessment Call Checklist", icon: ClipboardList, component: HealthAssessment },
  { id: "client-onboarding", title: "Client Onboarding Tool", icon: Users, component: ClientOnboardingDialog },
  { id: "client-troubleshooting", title: "Client Troubleshooting Guide", icon: Wrench, component: ClientTroubleshootingDialog },
  { id: "water-calculator", title: "Water Intake Calculator", icon: Droplets, component: WaterCalculator },
  { id: "exercise-guide", title: "Exercise & Motion Guide", icon: Dumbbell, component: ExerciseGuide },
  { id: "metabolic-health", title: "Metabolic Health Education", icon: Activity, component: MetabolicHealthInfo },
  { id: "social-media-generator", title: "Social Media Post Generator", icon: Share2, component: SocialMediaPromptGenerator },
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
  const { prospects, stats: prospectStats } = useProspects()
  const { clients, stats: clientStats, toggleTouchpoint, needsAttention } = useClients()

  // Training resources progress - pass user rank to properly filter accessible categories
  const { progress: trainingProgress, uniqueCategories } = useTrainingResources(user, profile?.coach_rank || null)

  // Rank calculator
  const { rankData, frontlineCoaches, qualifyingLegsCount, calculateGaps, getNextRank } = useRankCalculator(user)

  const [upcomingMeetings, setUpcomingMeetings] = useState<ZoomCall[]>([])
  const [loadingMeetings, setLoadingMeetings] = useState(true)
  const [onboardingProgress, setOnboardingProgress] = useState<{ completed: number; total: number; percentage: number }>({ completed: 0, total: 3, percentage: 0 })
  const [pinnedToolIds, setPinnedToolIds] = useState<string[]>([])
  const [pinnedResourceIds, setPinnedResourceIds] = useState<string[]>([])
  const [openToolId, setOpenToolId] = useState<string | null>(null)

  // Load pinned items from localStorage
  useEffect(() => {
    const savedTools = localStorage.getItem("pinnedTools")
    if (savedTools) {
      try {
        setPinnedToolIds(JSON.parse(savedTools))
      } catch (e) {
        console.error("Failed to parse pinned tools:", e)
      }
    }

    const savedResources = localStorage.getItem("pinnedResources")
    if (savedResources) {
      try {
        setPinnedResourceIds(JSON.parse(savedResources))
      } catch (e) {
        console.error("Failed to parse pinned resources:", e)
      }
    }
  }, [])

  // Get pinned tools and resources
  const pinnedTools = useMemo(() => {
    return COACH_TOOLS.filter(t => pinnedToolIds.includes(t.id))
  }, [pinnedToolIds])

  const pinnedResources = useMemo(() => {
    return EXTERNAL_RESOURCES.filter(r => pinnedResourceIds.includes(r.id))
  }, [pinnedResourceIds])

  const hasPinnedItems = pinnedTools.length > 0 || pinnedResources.length > 0

  // Load today's meetings
  useEffect(() => {
    if (!user) return

    const loadMeetings = async () => {
      const now = new Date()
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0)
      const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)

      const { data, error } = await supabase
        .from("zoom_calls")
        .select("*")
        .in("status", ["upcoming", "live"])
        .gte("scheduled_at", startOfToday.toISOString())
        .lte("scheduled_at", endOfToday.toISOString())
        .order("scheduled_at", { ascending: true })
        .limit(3)

      if (!error && data) {
        setUpcomingMeetings(data)
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
        {/* Quick Stats */}
        <div className="flex flex-wrap justify-center gap-4 sm:gap-8 mt-4">
          <div className="flex items-center gap-2 text-optavia-gray">
            <Award className="h-5 w-5 text-amber-500" />
            <span><strong className="text-optavia-dark">{badges.length}</strong> badges earned</span>
          </div>
          <div className="flex items-center gap-2 text-optavia-gray">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span><strong className="text-optavia-dark">{trainingProgress.completed}</strong> resources completed</span>
          </div>
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
        />
      </div>

      {/* Coach Tip of the Day */}
      <div className="mt-6">
        <CoachTip />
      </div>

      {/* Section 1: Business Growth (Rank Progress) */}
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

      {/* Section 2: Pipeline Snapshot (4 stat cards) */}
      <div className="mt-6">
        <PipelineSnapshot
          clients={clients}
          clientStats={clientStats}
          prospects={prospects}
          prospectStats={prospectStats}
        />
      </div>

      {/* Main Grid: Training Progress + Quick Links + Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {/* Section 4: Training Progress */}
        <TrainingProgressCard
          progress={trainingProgress}
          badges={badges.map(b => ({ ...b, earnedAt: b.earnedAt || new Date().toISOString() }))}
          uniqueCategories={uniqueCategories}
        />

        {/* Quick Links Card */}
        <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2 text-optavia-dark">
                <Pin className="h-5 w-5 text-[hsl(var(--optavia-green))]" />
                Quick Links
              </CardTitle>
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
    </div>
  )
}
