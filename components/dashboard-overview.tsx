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
  CheckCircle, PlayCircle, Sparkles, Star, Rocket, Building2, GraduationCap, Link2, Facebook
} from "lucide-react"
import { badgeConfig } from "@/lib/badge-config"
import type { ZoomCall } from "@/lib/types"

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

export function DashboardOverview() {
  const { user, profile, badges, completedResources, modules, recipes } = useUserData()
  const supabase = createClient()
  
  const [upcomingMeetings, setUpcomingMeetings] = useState<ZoomCall[]>([])
  const [loadingMeetings, setLoadingMeetings] = useState(true)

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

  // Calculate training progress
  const trainingProgress = useMemo(() => {
    const totalResources = modules.reduce((acc, m) => acc + m.resources.length, 0)
    const completed = completedResources.length
    const percentage = totalResources > 0 ? Math.round((completed / totalResources) * 100) : 0
    
    // Find next incomplete module
    let nextModule = null
    for (const module of modules) {
      const hasIncomplete = module.resources.some(r => !completedResources.includes(r.id))
      if (hasIncomplete) {
        nextModule = module
        break
      }
    }
    
    return { completed, total: totalResources, percentage, nextModule }
  }, [modules, completedResources])

  // Get recent badges (last 3)
  const recentBadges = useMemo(() => {
    return [...badges]
      .sort((a, b) => new Date(b.earnedAt).getTime() - new Date(a.earnedAt).getTime())
      .slice(0, 3)
  }, [badges])

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
            <CardTitle className="text-lg flex items-center gap-2 text-optavia-dark">
              <Link2 className="h-5 w-5 text-[hsl(var(--optavia-green))]" />
              Quick Links
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              <a 
                href="https://www.facebook.com/groups/optaviastrong" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-2.5 rounded-lg border-2 border-[hsl(var(--optavia-green))] hover:bg-[hsl(var(--optavia-green-light))] transition-colors cursor-pointer group"
              >
                <Facebook className="h-4 w-4 text-[#1877F2] flex-shrink-0" />
                <span className="font-medium text-sm text-optavia-dark group-hover:text-[hsl(var(--optavia-green))] flex-1 truncate">
                  Optavia Strong Facebook Group
                </span>
                <ExternalLink className="h-3 w-3 text-optavia-gray flex-shrink-0" />
              </a>
              
              <a 
                href="https://connect.optavia.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-2.5 rounded-lg border-2 border-[hsl(var(--optavia-green))] hover:bg-[hsl(var(--optavia-green-light))] transition-colors cursor-pointer group"
              >
                <img src="/media/optavia_logo.svg" alt="" className="h-4 w-4 flex-shrink-0" />
                <span className="font-medium text-sm text-optavia-dark group-hover:text-[hsl(var(--optavia-green))] flex-1">
                  OPTAVIA Connect
                </span>
                <ExternalLink className="h-3 w-3 text-optavia-gray flex-shrink-0" />
              </a>
              
              {profile?.optavia_id && (
                <a 
                  href={`https://www.optavia.com/us/en/coach/${profile.optavia_id}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-2.5 rounded-lg border-2 border-[hsl(var(--optavia-green))] hover:bg-[hsl(var(--optavia-green-light))] transition-colors cursor-pointer group"
                >
                  <img src="/media/optavia_logo.svg" alt="" className="h-4 w-4 flex-shrink-0" />
                  <span className="font-medium text-sm text-optavia-dark group-hover:text-[hsl(var(--optavia-green))] flex-1">
                    OPTAVIA Profile
                  </span>
                  <ExternalLink className="h-3 w-3 text-optavia-gray flex-shrink-0" />
                </a>
              )}
            </div>
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

            {/* Next Module */}
            {trainingProgress.nextModule && (
              <Link href={`/training/${trainingProgress.nextModule.id}`}>
                <div className="p-3 rounded-lg bg-green-50 border border-green-200 hover:bg-green-100 transition-colors cursor-pointer">
                  <p className="text-xs text-green-600 font-medium mb-1">Continue with:</p>
                  <p className="font-medium text-sm text-optavia-dark flex items-center gap-2">
                    <span>{trainingProgress.nextModule.icon}</span>
                    {trainingProgress.nextModule.title}
                  </p>
                </div>
              </Link>
            )}

            {trainingProgress.percentage === 100 && (
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
              
              <Link href="/resources">
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

        {/* Featured Recipes Card */}
        <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow md:col-span-2 lg:col-span-3">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2 text-optavia-dark">
                <UtensilsCrossed className="h-5 w-5 text-orange-500" />
                Featured Recipes
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
              {recipes.slice(0, 4).map((recipe) => (
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
    </div>
  )
}
