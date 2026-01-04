"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Announcements } from "@/components/announcements"
import { useUserData } from "@/contexts/user-data-context"
import { createClient } from "@/lib/supabase/client"
import { 
  Video, Calendar, Clock, Users, UserCircle, ChevronRight,
  BookOpen, UtensilsCrossed, Wrench, ExternalLink, Award,
  CheckCircle, CheckCircle2, PlayCircle, Sparkles, Star, Rocket, Building2, GraduationCap, Link2, Facebook, Lightbulb, X, ClipboardList,
  AlertCircle, Circle, MessageSquare, Trophy, Pin, Droplets, Dumbbell, Activity, Share2
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { badgeConfig } from "@/lib/badge-config"
import { useProspects } from "@/hooks/use-prospects"
import { useClients, getProgramDay, getDayPhase } from "@/hooks/use-clients"
import { useTrainingResources } from "@/hooks/use-training-resources"
import { useRankCalculator, RANK_REQUIREMENTS, RANK_ORDER, type RankType } from "@/hooks/use-rank-calculator"
import type { ZoomCall } from "@/lib/types"
import { getOnboardingProgress } from "@/lib/onboarding-utils"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { WaterCalculator } from "@/components/coach-tools/water-calculator"
import { ExerciseGuide } from "@/components/coach-tools/exercise-guide"
import { MetabolicHealthInfo } from "@/components/coach-tools/metabolic-health-info"
import { HealthAssessment } from "@/components/coach-tools/health-assessment"
import { ClientOnboardingDialog } from "@/components/coach-tools/client-onboarding-dialog"
import { ClientTroubleshootingDialog } from "@/components/coach-tools/client-troubleshooting-dialog"
import { SocialMediaPromptGenerator } from "@/components/social-media-prompt-generator"

// Icon mapping for badge categories (matching badge-display.tsx)
const badgeIcons: Record<string, React.ReactNode> = {
  "Getting Started": <Rocket className="h-3 w-3" />,
  "Business Building": <Building2 className="h-3 w-3" />,
  "Client Support": <Users className="h-3 w-3" />,
  "Training": <GraduationCap className="h-3 w-3" />,
}

// Color mapping for badge categories
const badgeColors: Record<string, string> = {
  "Getting Started": "bg-blue-500",
  "Business Building": "bg-purple-500",
  "Client Support": "bg-green-500",
  "Training": "bg-orange-500",
}

// Rotating coach tips about Habits of Health
const coachTips = [
  "Remind clients that weight loss is more than diet — the Habits of Health cover mindset, sleep, motion, and surroundings too!",
  "Dr. A's LifeBook helps clients track their journey across all 6 Habits of Health. Have you suggested it to your clients?",
  "The Habits of Health assessment at habitsofhealth.com helps clients identify which areas need the most attention.",
  "Micro-habits make big changes sustainable. Help clients start with small, achievable steps they can't fail at.",
  "Sleep is a Habit of Health! Ask clients how their sleep routine is supporting their wellness goals.",
  "The 'Mind' habit is crucial — help clients develop a healthy mindset around food and self-image.",
  "Motion doesn't mean intense workouts. Even small movements throughout the day build the habit of an active lifestyle.",
  "Surroundings matter! Encourage clients to create an environment that supports their healthy choices.",
  "The OPTAVIA app has habit tracking built in. Show clients how to use it to stay accountable.",
  "Dr. A's daily tips at habitsofhealth.com provide ongoing motivation and education for clients.",
  "Weight management is just ONE of six habits. Help clients see the bigger picture of optimal health.",
  "Hydration is part of the Eating & Hydration habit. Ensure clients understand proper water intake for their goals.",
  "The 30-day email challenge at habitsofhealth.com is a great way to introduce clients to the system.",
  "Transformation isn't just physical — it's mental, emotional, and environmental. Share this holistic view with clients.",
  "Celebrate micro-wins with clients! Each small habit they build is a step toward lasting transformation.",
]

// Coach Tools definitions with components (matching external-resources-tab.tsx)
const COACH_TOOLS: { id: string; title: string; icon: LucideIcon; component: React.ComponentType }[] = [
  { id: "health-assessment", title: "Health Assessment Call Checklist", icon: ClipboardList, component: HealthAssessment },
  { id: "client-onboarding", title: "Client Onboarding Tool", icon: Users, component: ClientOnboardingDialog },
  { id: "client-troubleshooting", title: "Client Troubleshooting Guide", icon: Wrench, component: ClientTroubleshootingDialog },
  { id: "water-calculator", title: "Water Intake Calculator", icon: Droplets, component: WaterCalculator },
  { id: "exercise-guide", title: "Exercise & Motion Guide", icon: Dumbbell, component: ExerciseGuide },
  { id: "metabolic-health", title: "Metabolic Health Education", icon: Activity, component: MetabolicHealthInfo },
  { id: "social-media-generator", title: "Social Media Post Generator", icon: Share2, component: SocialMediaPromptGenerator },
]

// External Resources definitions (matching external-resources-tab.tsx)
const EXTERNAL_RESOURCES: { id: string; title: string; url: string }[] = [
  { id: "optavia-strong-fb", title: "Optavia Strong Facebook Group", url: "https://www.facebook.com/groups/810104670912639" },
  { id: "healthy-edge-team", title: "Healthy Edge 3.0 Team Page", url: "https://www.facebook.com/groups/2156291101444241" },
  { id: "healthy-edge-client", title: "Healthy Edge 3.0 Client Page", url: "https://www.facebook.com/groups/778947831962215" },
  { id: "optavia-connect", title: "OPTAVIA Connect", url: "https://optaviaconnect.com/login" },
  { id: "optavia-blog", title: "OPTAVIA Blog", url: "https://www.optaviablog.com" },
  { id: "habits-of-health", title: "Habits of Health", url: "https://www.habitsofhealth.com/" },
  { id: "optavia-habits-of-health", title: "OPTAVIA Habits of Health System", url: "https://www.optavia.com/us/en/habits-of-health" },
  { id: "optavia-fb", title: "OPTAVIA Facebook", url: "https://www.facebook.com/optavia" },
  { id: "optavia-ig", title: "OPTAVIA Instagram", url: "https://www.instagram.com/optavia" },
  { id: "optavia-yt", title: "OPTAVIA YouTube", url: "https://www.youtube.com/optavia" },
]

export function DashboardOverview() {
  const { user, profile, badges, recipes, favoriteRecipes } = useUserData()
  const supabase = createClient()
  
  // CRM hooks for Priority Actions
  const { prospects, stats: prospectStats } = useProspects()
  const { clients, stats: clientStats, toggleTouchpoint, needsAttention } = useClients()

  // Training resources progress
  const { progress: trainingProgress, uniqueCategories } = useTrainingResources(user)
  
  // Rank calculator for business growth
  const { rankData, frontlineCoaches, qualifyingLegsCount, calculateGaps, getNextRank } = useRankCalculator(user)
  
  const [upcomingMeetings, setUpcomingMeetings] = useState<ZoomCall[]>([])
  const [loadingMeetings, setLoadingMeetings] = useState(true)
  const [onboardingProgress, setOnboardingProgress] = useState<{ completed: number; total: number; percentage: number }>({ completed: 0, total: 3, percentage: 0 })
  const [coachTipDismissed, setCoachTipDismissed] = useState(false)
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

  // Load today's meetings only
  useEffect(() => {
    if (!user) return
    
    const loadMeetings = async () => {
      // Get start and end of today
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

  // Check if coach tip was dismissed today
  useEffect(() => {
    const today = new Date().toDateString()
    const dismissedDate = localStorage.getItem('coachTipDismissedDate')
    if (dismissedDate === today) {
      setCoachTipDismissed(true)
    }
  }, [])

  // Handle coach tip dismissal
  const handleDismissCoachTip = () => {
    const today = new Date().toDateString()
    localStorage.setItem('coachTipDismissedDate', today)
    setCoachTipDismissed(true)
  }

  // Get recent badges (last 3)
  const recentBadges = useMemo(() => {
    return [...badges]
      .sort((a, b) => new Date(b.earnedAt).getTime() - new Date(a.earnedAt).getTime())
      .slice(0, 3)
  }, [badges])

  // Get popular recipes the user hasn't favorited yet
  const popularRecipes = useMemo(() => {
    // Filter out recipes the user has already favorited
    const unfavoritedRecipes = recipes.filter(r => !favoriteRecipes.includes(r.id))
    
    // Sort by favorite count (popularity) descending
    const sortedByPopularity = [...unfavoritedRecipes].sort((a, b) => 
      (b.favoriteCount || 0) - (a.favoriteCount || 0)
    )
    
    // Return top 4 popular recipes
    return sortedByPopularity.slice(0, 4)
  }, [recipes, favoriteRecipes])

  // Format time helper
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    let dayStr = date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })
    if (date.toDateString() === now.toDateString()) dayStr = "Today"
    else if (date.toDateString() === tomorrow.toDateString()) dayStr = "Tomorrow"
    
    const timeStr = date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
    return { dayStr, timeStr }
  }

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good morning"
    if (hour < 17) return "Good afternoon"
    return "Good evening"
  }

  const firstName = profile?.full_name?.split(" ")[0] || "Coach"

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

      {/* Coach Tip of the Day */}
      {!coachTipDismissed && (() => {
        // Get tip based on day of year for daily rotation
        const now = new Date()
        const startOfYear = new Date(now.getFullYear(), 0, 0)
        const diff = now.getTime() - startOfYear.getTime()
        const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24))
        const tipIndex = dayOfYear % coachTips.length
        const todaysTip = coachTips[tipIndex]
        
        return (
          <div className="mt-6 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3 relative">
            <div className="bg-amber-100 rounded-full p-2 shrink-0">
              <Lightbulb className="h-5 w-5 text-amber-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-amber-800 mb-1">Coach Tip of the Day</p>
              <p className="text-sm text-amber-700">{todaysTip}</p>
            </div>
            <Link href="/resources?category=Habits%20of%20Health" className="shrink-0">
              <Button variant="ghost" size="sm" className="text-amber-700 hover:bg-amber-100 hover:text-amber-800 text-xs">
                Healthy Habits
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDismissCoachTip}
              className="absolute top-2 right-2 h-6 w-6 text-amber-700 hover:bg-amber-100 hover:text-amber-800"
              aria-label="Close coach tip"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )
      })()}

      {/* Priority Actions Section */}
      {(clientStats.needsAttention > 0 || prospectStats.overdue > 0 || clientStats.milestonesToday > 0) && (
        <Card className="mt-6 border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2 text-optavia-dark">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              Priority Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {/* Clients Needing Touchpoints */}
              {clients
                .filter(c => c.status === "active" && needsAttention(c))
                .slice(0, 3)
                .map(client => {
                  const programDay = getProgramDay(client.start_date)
                  const phase = getDayPhase(programDay)
                  return (
                    <div
                      key={client.id}
                      className="flex items-center justify-between p-3 bg-white rounded-lg border border-orange-200"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-lg flex flex-col items-center justify-center text-xs font-bold"
                          style={{ backgroundColor: phase.bg, color: phase.color }}
                        >
                          <span className="text-[8px]">DAY</span>
                          <span>{programDay}</span>
                        </div>
                        <div>
                          <div className="font-medium text-sm text-gray-900">{client.label}</div>
                          <div className="text-xs text-gray-500">Needs touchpoint today</div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleTouchpoint(client.id, "am_done")}
                          className={client.am_done ? "bg-green-100 text-green-700" : ""}
                        >
                          {client.am_done ? <CheckCircle className="h-3 w-3 mr-1" /> : <Circle className="h-3 w-3 mr-1" />}
                          AM
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleTouchpoint(client.id, "pm_done")}
                          className={client.pm_done ? "bg-green-100 text-green-700" : ""}
                        >
                          {client.pm_done ? <CheckCircle className="h-3 w-3 mr-1" /> : <Circle className="h-3 w-3 mr-1" />}
                          PM
                        </Button>
                      </div>
                    </div>
                  )
                })}

              {/* Milestone Celebrations */}
              {clients
                .filter(c => {
                  if (c.status !== "active") return false
                  const day = getProgramDay(c.start_date)
                  return [7, 14, 21, 30].includes(day)
                })
                .slice(0, 2)
                .map(client => {
                  const programDay = getProgramDay(client.start_date)
                  const phase = getDayPhase(programDay)
                  return (
                    <div
                      key={`milestone-${client.id}`}
                      className="flex items-center justify-between p-3 bg-white rounded-lg border border-green-200"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                          <Trophy className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <div className="font-medium text-sm text-gray-900">{client.label}</div>
                          <div className="text-xs text-green-600 font-medium">{phase.label}</div>
                        </div>
                      </div>
                      <Link href="/client-tracker">
                        <Button size="sm" className="bg-green-500 hover:bg-green-600">
                          <MessageSquare className="h-3 w-3 mr-1" />
                          Celebrate
                        </Button>
                      </Link>
                    </div>
                  )
                })}

              {/* Overdue Prospect Follow-ups */}
              {prospects
                .filter(p => {
                  if (!p.next_action || ["converted", "coach", "not_interested"].includes(p.status)) return false
                  return new Date(p.next_action) < new Date(new Date().toISOString().split("T")[0])
                })
                .slice(0, 2)
                .map(prospect => (
                  <div
                    key={`prospect-${prospect.id}`}
                    className="flex items-center justify-between p-3 bg-white rounded-lg border border-red-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                        <Clock className="h-5 w-5 text-red-500" />
                      </div>
                      <div>
                        <div className="font-medium text-sm text-gray-900">{prospect.label}</div>
                        <div className="text-xs text-red-500">Overdue follow-up</div>
                      </div>
                    </div>
                    <Link href="/prospect-tracker">
                      <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
                        Follow Up
                      </Button>
                    </Link>
                  </div>
                ))}

              {/* View All Link */}
              <div className="flex gap-2 pt-2">
                {clientStats.needsAttention > 0 && (
                  <Link href="/client-tracker" className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      <Users className="h-4 w-4 mr-2" />
                      All Clients ({clientStats.active})
                    </Button>
                  </Link>
                )}
                {prospectStats.overdue > 0 && (
                  <Link href="/prospect-tracker" className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      <Users className="h-4 w-4 mr-2" />
                      All Prospects ({prospectStats.total})
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* New Coach Onboarding Card */}
      {profile?.is_new_coach && (
        <Card className="mt-6 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-[hsl(var(--optavia-green))] shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl flex items-center gap-2 text-optavia-dark">
              <GraduationCap className="h-5 w-5 text-[hsl(var(--optavia-green))]" />
              New Coach Training Path
            </CardTitle>
            <CardDescription className="text-optavia-gray">
              Complete your onboarding to unlock all training modules and resources
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-optavia-gray">Progress</span>
                  <span className="text-sm font-bold text-[hsl(var(--optavia-green))]">
                    {onboardingProgress.completed} of {onboardingProgress.total} modules completed
                  </span>
                </div>
                <Progress value={onboardingProgress.percentage} className="h-3" />
                <p className="text-xs text-optavia-gray mt-1">
                  {onboardingProgress.percentage}% complete
                </p>
              </div>
              <Link href="/training">
                <Button 
                  className="w-full bg-[hsl(var(--optavia-green))] hover:bg-[hsl(var(--optavia-green-dark))] text-white"
                  size="lg"
                >
                  Continue Training
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* My Business Summary - Today's Focus */}
      <Card className="mt-6 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2 text-optavia-dark">
              <Users className="h-5 w-5 text-[hsl(var(--optavia-green))]" />
              My Business - Today
            </CardTitle>
            <Link href="/daily-actions">
              <Button variant="ghost" size="sm" className="text-[hsl(var(--optavia-green))] hover:bg-green-100 -mr-2">
                Weekly Actions <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Client Scheduling Status */}
            <Link href="/client-tracker" className="block">
              <div className="p-4 rounded-lg bg-white border border-green-200 hover:shadow-md transition-shadow cursor-pointer h-full">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Client Check-ins</span>
                  <Badge variant="secondary" className={clientStats.needsAttention > 0 ? "bg-orange-100 text-orange-700" : "bg-green-100 text-green-700"}>
                    {clientStats.needsAttention > 0 ? `${clientStats.needsAttention} need scheduling` : "All scheduled!"}
                  </Badge>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-2xl font-bold text-[hsl(var(--optavia-green))]">
                    {clientStats.active - clientStats.needsAttention}/{clientStats.active}
                  </div>
                  <div className="text-xs text-gray-500">clients with upcoming check-ins</div>
                </div>
                {clientStats.milestonesToday > 0 && (
                  <div className="mt-2 flex items-center gap-1 text-xs text-yellow-600">
                    <Trophy className="h-3 w-3" />
                    {clientStats.milestonesToday} milestone{clientStats.milestonesToday > 1 ? 's' : ''} to celebrate!
                  </div>
                )}
              </div>
            </Link>

            {/* HA Scheduled - Prospects with upcoming Health Assessments */}
            {(() => {
              const now = new Date()
              const todayStart = new Date()
              todayStart.setHours(0, 0, 0, 0)
              
              // Count all prospects with HA Scheduled status
              const haScheduled = prospects.filter(p => p.status === 'ha_scheduled')
              
              // Determine upcoming vs overdue based on ha_scheduled_at OR next_action
              const upcomingHA = haScheduled.filter(p => {
                if (p.ha_scheduled_at) {
                  return new Date(p.ha_scheduled_at) >= now
                }
                if (p.next_action) {
                  return new Date(p.next_action) >= todayStart
                }
                return true // No date = consider as upcoming (needs scheduling)
              })
              const overdueHA = haScheduled.filter(p => {
                if (p.ha_scheduled_at) {
                  return new Date(p.ha_scheduled_at) < now
                }
                if (p.next_action) {
                  return new Date(p.next_action) < todayStart
                }
                return false
              })
              
              return (
                <Link href="/prospect-tracker" className="block">
                  <div className="p-4 rounded-lg bg-white border border-purple-200 hover:shadow-md transition-shadow cursor-pointer h-full">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-600">HA Scheduled</span>
                      <Badge variant="secondary" className={overdueHA.length > 0 ? "bg-orange-100 text-orange-700" : haScheduled.length > 0 ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-600"}>
                        {overdueHA.length > 0 ? `${overdueHA.length} overdue` : haScheduled.length > 0 ? "All upcoming!" : "None scheduled"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-2xl font-bold text-purple-600">
                        {upcomingHA.length}/{haScheduled.length}
                      </div>
                      <div className="text-xs text-gray-500">prospects with upcoming HAs</div>
                    </div>
                    {overdueHA.length > 0 && (
                      <div className="mt-2 flex items-center gap-1 text-xs text-red-600">
                        <AlertCircle className="h-3 w-3" />
                        {overdueHA.length} need{overdueHA.length === 1 ? 's' : ''} rescheduling
                      </div>
                    )}
                  </div>
                </Link>
              )
            })()}

            {/* Rank Progression */}
            <Link href="/my-business" className="block sm:col-span-2 lg:col-span-1">
              <div className="p-4 rounded-lg bg-white border border-yellow-200 hover:shadow-md transition-shadow cursor-pointer h-full">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Next Rank</span>
                  {rankData && (
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
                      {RANK_REQUIREMENTS[rankData.current_rank as RankType]?.icon} {rankData.current_rank}
                    </Badge>
                  )}
                </div>
                {rankData && getNextRank(rankData.current_rank as RankType) ? (
                  <>
                    <div className="text-sm font-semibold text-yellow-700 mb-2">
                      → {getNextRank(rankData.current_rank as RankType)}
                    </div>
                    {(() => {
                      const nextRank = getNextRank(rankData.current_rank as RankType)
                      if (!nextRank) return null
                      const gaps = calculateGaps(rankData.current_rank as RankType, clientStats.active)
                      if (!gaps) return null
                      
                      const items: JSX.Element[] = []
                      if (gaps.clients > 0) {
                        items.push(
                          <div key="clients" className="flex items-center gap-1 text-xs text-gray-600">
                            <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                            Need {gaps.clients} more client{gaps.clients > 1 ? 's' : ''}
                          </div>
                        )
                      }
                      if (gaps.coaches > 0) {
                        items.push(
                          <div key="coaches" className="flex items-center gap-1 text-xs text-gray-600">
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                            Need {gaps.coaches} more coach{gaps.coaches > 1 ? 'es' : ''}
                          </div>
                        )
                      }
                      if (gaps.qualifyingLegs > 0) {
                        items.push(
                          <div key="legs" className="flex items-center gap-1 text-xs text-gray-600">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                            Need {gaps.qualifyingLegs} qualifying leg{gaps.qualifyingLegs > 1 ? 's' : ''} (Senior Coach+)
                          </div>
                        )
                      }
                      if (items.length === 0) {
                        items.push(
                          <div key="ready" className="flex items-center gap-1 text-xs text-green-600 font-medium">
                            <Trophy className="h-3 w-3" />
                            Ready for promotion!
                          </div>
                        )
                      }
                      return <div className="space-y-1">{items}</div>
                    })()}
                  </>
                ) : (
                  <div className="text-sm text-gray-500">You've reached the top rank! 🎉</div>
                )}
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        
        {/* Today's Meetings Card */}
        <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2 text-optavia-dark">
                <Video className="h-5 w-5 text-blue-600" />
                Today's Meetings
              </CardTitle>
              <Link href="/calendar">
                <Button variant="ghost" size="sm" className="text-[hsl(var(--optavia-green))] hover:bg-green-50 -mr-2">
                  View All <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {loadingMeetings ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              </div>
            ) : upcomingMeetings.length === 0 ? (
              <div className="text-center py-6 text-optavia-gray">
                <Calendar className="h-10 w-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No meetings scheduled for today</p>
                <Link href="/calendar">
                  <Button variant="outline" size="sm" className="mt-3">
                    View Calendar
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingMeetings.map((meeting) => {
                  const { dayStr, timeStr } = formatDateTime(meeting.scheduled_at)
                  return (
                    <div
                      key={meeting.id}
                      className={`p-3 rounded-lg border ${
                        meeting.status === "live" 
                          ? "border-red-300 bg-red-50" 
                          : "border-gray-200 bg-gray-50"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="font-medium text-sm text-optavia-dark line-clamp-1">
                          {meeting.title}
                        </span>
                        {meeting.status === "live" && (
                          <Badge className="bg-red-500 animate-pulse text-xs">Live</Badge>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-optavia-gray">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {dayStr}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {timeStr}
                          </span>
                        </div>
                        <Badge 
                          variant="secondary" 
                          className={`text-xs ${
                            meeting.call_type === "coach_only" 
                              ? "bg-purple-100 text-purple-700" 
                              : "bg-teal-100 text-teal-700"
                          }`}
                        >
                          {meeting.call_type === "coach_only" ? (
                            <><UserCircle className="h-3 w-3 mr-1" />Coach</>
                          ) : (
                            <><Users className="h-3 w-3 mr-1" />Clients</>
                          )}
                        </Badge>
                      </div>
                      {meeting.zoom_link && (
                        <Button
                          asChild
                          size="sm"
                          className={`w-full mt-2 text-white ${
                            meeting.status === "live" 
                              ? "bg-red-500 hover:bg-red-600" 
                              : "bg-blue-600 hover:bg-blue-700"
                          }`}
                        >
                          <a href={meeting.zoom_link} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center text-white">
                            <Video className="h-4 w-4 mr-1 text-white" />
                            {meeting.status === "live" ? "Join Now" : "Join Meeting"}
                          </a>
                        </Button>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

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
                {/* Pinned Tools - Open directly in dialog */}
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
                
                {/* Pinned Resources - Open directly in new tab */}
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
                <p className="text-sm text-optavia-gray mb-3">
                  No quick links yet
                </p>
                <p className="text-xs text-gray-400 mb-3">
                  Pin your favorite tools and resources for easy access
                </p>
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

        {/* Training Progress Card */}
        <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2 text-optavia-dark">
                <BookOpen className="h-5 w-5 text-[hsl(var(--optavia-green))]" />
                Training Progress
              </CardTitle>
              <Link href="/training">
                <Button variant="ghost" size="sm" className="text-[hsl(var(--optavia-green))] hover:bg-green-50 -mr-2">
                  Continue <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-optavia-gray">Overall Progress</span>
                <span className="font-semibold text-[hsl(var(--optavia-green))]">{trainingProgress.percentage}%</span>
              </div>
              <Progress value={trainingProgress.percentage} className="h-2" />
              <p className="text-xs text-optavia-gray mt-1">
                {trainingProgress.completed} of {trainingProgress.total} resources completed
              </p>
            </div>

            {/* Recent Badges */}
            {recentBadges.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-medium text-optavia-gray uppercase tracking-wide mb-2">
                  Recent Badges
                </p>
                <div className="flex flex-wrap gap-2">
                  {recentBadges.map((badge, idx) => {
                    const category = badge.category || badge.badgeType
                    const config = badgeConfig[category]
                    const icon = badgeIcons[category] || <Award className="h-3 w-3" />
                    const bgColor = badgeColors[category] || "bg-gray-500"
                    
                    return (
                      <div 
                        key={idx} 
                        className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-gray-100 border border-gray-200"
                      >
                        <div className={`${bgColor} text-white p-1 rounded-full`}>
                          {icon}
                        </div>
                        <span className="text-xs font-medium text-optavia-dark">
                          {config?.name || badge.badgeType}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Continue Training or Complete */}
            {trainingProgress.percentage < 100 && trainingProgress.total > 0 && (
              <Link href="/training">
                <div className="p-3 rounded-lg bg-green-50 border border-green-200 hover:bg-green-100 transition-colors cursor-pointer">
                  <p className="text-xs text-green-600 font-medium mb-1">
                    {uniqueCategories.length} categories to explore
                  </p>
                  <p className="font-medium text-sm text-optavia-dark flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    Continue Training
                  </p>
                </div>
              </Link>
            )}

            {trainingProgress.percentage === 100 && trainingProgress.total > 0 && (
              <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-center">
                <Sparkles className="h-6 w-6 mx-auto mb-1 text-amber-500" />
                <p className="text-sm font-medium text-amber-700">All Training Complete!</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions Card */}
        <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow md:col-span-2 lg:col-span-3">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2 text-optavia-dark">
              <Sparkles className="h-5 w-5 text-amber-500" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Link href="/meal-planner">
                <div className="p-4 rounded-lg bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200 hover:from-orange-100 hover:to-amber-100 transition-colors text-center cursor-pointer">
                  <UtensilsCrossed className="h-6 w-6 mx-auto mb-2 text-orange-600" />
                  <p className="text-sm font-medium text-optavia-dark">Create Meal Plan</p>
                </div>
              </Link>
              
              <Link href="/favorites">
                <div className="p-4 rounded-lg bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-200 hover:from-amber-100 hover:to-yellow-100 transition-colors text-center cursor-pointer">
                  <Star className="h-6 w-6 mx-auto mb-2 text-amber-600" />
                  <p className="text-sm font-medium text-optavia-dark">Favorites</p>
                </div>
              </Link>
              
              <Link href="/resources?category=Coach%20Tools">
                <div className="p-4 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 hover:from-blue-100 hover:to-indigo-100 transition-colors text-center cursor-pointer">
                  <Wrench className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                  <p className="text-sm font-medium text-optavia-dark">Coach Tools</p>
                </div>
              </Link>
              
              <Link href="/calendar">
                <div className="p-4 rounded-lg bg-gradient-to-br from-purple-50 to-violet-50 border border-purple-200 hover:from-purple-100 hover:to-violet-100 transition-colors text-center cursor-pointer">
                  <Calendar className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                  <p className="text-sm font-medium text-optavia-dark">View Calendar</p>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Popular Recipes Card - shows recipes the user hasn't favorited yet */}
        <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow md:col-span-2 lg:col-span-3">
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
      </div>

      {/* Tool Dialogs - Open tools directly from Quick Links */}
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
