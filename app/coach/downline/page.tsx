"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowLeft, Users, CheckCircle, UserCircle, Calendar, Target, GraduationCap } from "lucide-react"
import { useUserData } from "@/contexts/user-data-context"
import { createClient } from "@/lib/supabase/client"
import { meetsRankRequirement, COACH_RANKS } from "@/hooks/use-training-resources"

interface DownlineCoach {
  id: string
  email: string | null
  full_name: string | null
  avatar_url: string | null
  optavia_id: string | null
  coach_rank: string | null
  is_new_coach: boolean
  // Stats
  trainingCompleted: number
  trainingTotal: number
  trainingComplete: boolean
  prospectCount: number
  haScheduledCount: number
  activeClientCount: number
}

export default function DownlineProgressPage() {
  const router = useRouter()
  const { authLoading, profile, user } = useUserData()
  const [downlineCoaches, setDownlineCoaches] = useState<DownlineCoach[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && user) {
      loadDownlineData()
    }
  }, [authLoading, user])

  const loadDownlineData = async () => {
    if (!user || !profile?.id) {
      setDownlineCoaches([])
      setLoading(false)
      return
    }

    const supabase = createClient()

    try {
      // Get profiles for downline coaches
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, email, full_name, avatar_url, optavia_id, coach_rank, is_new_coach")
        .eq("sponsor_id", profile.id)

      if (profilesError) {
        console.error("Error loading profiles:", profilesError)
        setLoading(false)
        return
      }

      if (!profiles || profiles.length === 0) {
        setDownlineCoaches([])
        setLoading(false)
        return
      }

      const coachIds = profiles.map((p) => p.id)

      // Get training categories with required_rank
      const { data: categories } = await supabase
        .from("training_categories")
        .select("id, name, required_rank")
        .eq("is_active", true)

      // Get all training resources
      const { data: resources } = await supabase
        .from("training_resources")
        .select("id, category")
        .eq("is_active", true)

      // Get training completions for all downline coaches
      const { data: completions } = await supabase
        .from("training_resource_completions")
        .select("user_id, resource_id")
        .in("user_id", coachIds)

      // Get prospects for all downline coaches
      const { data: prospects } = await supabase
        .from("prospects")
        .select("id, user_id, ha_scheduled_date")
        .in("user_id", coachIds)

      // Get active clients for all downline coaches
      const { data: clients } = await supabase
        .from("clients")
        .select("id, user_id, status")
        .in("user_id", coachIds)
        .eq("status", "active")

      // Calculate 2 weeks from now
      const twoWeeksFromNow = new Date()
      twoWeeksFromNow.setDate(twoWeeksFromNow.getDate() + 14)
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      // Build coach data with stats
      const coachesWithStats: DownlineCoach[] = profiles.map((coachProfile) => {
        const coachRank = coachProfile.coach_rank || "Coach"

        // Calculate accessible resources based on coach's rank
        const accessibleCategories = (categories || []).filter(cat => 
          meetsRankRequirement(coachRank, cat.required_rank)
        )
        const accessibleCategoryNames = new Set(accessibleCategories.map(c => c.name))
        
        const accessibleResources = (resources || []).filter(r => 
          accessibleCategoryNames.has(r.category)
        )
        const accessibleResourceIds = new Set(accessibleResources.map(r => r.id))

        // Count completed resources for this coach
        const coachCompletions = (completions || []).filter(c => 
          c.user_id === coachProfile.id && accessibleResourceIds.has(c.resource_id)
        )

        const trainingTotal = accessibleResources.length
        const trainingCompleted = coachCompletions.length
        const trainingComplete = trainingTotal > 0 && trainingCompleted >= trainingTotal

        // Count prospects
        const coachProspects = (prospects || []).filter(p => p.user_id === coachProfile.id)
        const prospectCount = coachProspects.length

        // Count HA scheduled within 2 weeks
        const haScheduledCount = coachProspects.filter(p => {
          if (!p.ha_scheduled_date) return false
          const haDate = new Date(p.ha_scheduled_date)
          return haDate >= today && haDate <= twoWeeksFromNow
        }).length

        // Count active clients
        const activeClientCount = (clients || []).filter(c => c.user_id === coachProfile.id).length

        return {
          id: coachProfile.id,
          email: coachProfile.email,
          full_name: coachProfile.full_name,
          avatar_url: coachProfile.avatar_url,
          optavia_id: coachProfile.optavia_id,
          coach_rank: coachProfile.coach_rank,
          is_new_coach: coachProfile.is_new_coach,
          trainingCompleted,
          trainingTotal,
          trainingComplete,
          prospectCount,
          haScheduledCount,
          activeClientCount,
        }
      })

      setDownlineCoaches(coachesWithStats)
    } catch (error) {
      console.error("Error loading downline data:", error)
    } finally {
      setLoading(false)
    }
  }

  const getRankLabel = (rank: string | null) => {
    if (!rank) return "Coach"
    const found = COACH_RANKS.find(r => r.value === rank)
    return found ? found.label : rank
  }

  const getInitials = (name: string | null, email: string | null) => {
    if (name) {
      return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    }
    if (email) {
      return email[0].toUpperCase()
    }
    return "?"
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[hsl(var(--optavia-green))] mx-auto mb-4"></div>
          <p className="text-optavia-gray">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header activeTab="my-business" />
      <main className="flex-1 bg-white">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <Button
            variant="ghost"
            onClick={() => router.push("/my-business")}
            className="mb-6 gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to My Business
          </Button>

          <div className="mb-6">
            <h1 className="font-heading font-bold text-2xl sm:text-3xl text-optavia-dark mb-2">
              Downline Overview
            </h1>
            <p className="text-optavia-gray">
              Track your team's training progress, prospects, and client activity
            </p>
          </div>

          {downlineCoaches.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-optavia-gray">
                    You don't have any downline coaches yet, or coach relationships haven't been set up.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {downlineCoaches.map((coach) => (
                <Card key={coach.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row">
                      {/* Coach Info Section */}
                      <div className="flex items-center gap-4 p-4 md:w-1/3 border-b md:border-b-0 md:border-r">
                        <Avatar className="h-14 w-14">
                          <AvatarImage src={coach.avatar_url || undefined} />
                          <AvatarFallback className="bg-[hsl(var(--optavia-green))]/10 text-[hsl(var(--optavia-green))] text-lg font-semibold">
                            {getInitials(coach.full_name, coach.email)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-lg text-optavia-dark truncate">
                            {coach.full_name || coach.email || "Unknown"}
                          </h3>
                          <div className="flex flex-wrap items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {getRankLabel(coach.coach_rank)}
                            </Badge>
                            {coach.is_new_coach && (
                              <Badge className="bg-green-100 text-green-700 text-xs">
                                New Coach
                              </Badge>
                            )}
                          </div>
                          {coach.email && (
                            <p className="text-xs text-gray-500 mt-1 truncate">{coach.email}</p>
                          )}
                        </div>
                      </div>

                      {/* Stats Section */}
                      <div className="flex-1 grid grid-cols-2 md:grid-cols-4 divide-x">
                        {/* Training Progress */}
                        <div className="p-4 flex flex-col items-center justify-center text-center">
                          <div className="flex items-center gap-1 mb-1">
                            <GraduationCap className="h-4 w-4 text-gray-400" />
                            <span className="text-xs text-gray-500">Training</span>
                          </div>
                          {coach.trainingComplete ? (
                            <div className="flex items-center gap-1">
                              <CheckCircle className="h-5 w-5 text-green-500" />
                              <span className="text-lg font-bold text-green-600">100%</span>
                            </div>
                          ) : (
                            <div className="text-center">
                              <span className="text-lg font-bold text-optavia-dark">
                                {coach.trainingTotal > 0 
                                  ? Math.round((coach.trainingCompleted / coach.trainingTotal) * 100) 
                                  : 0}%
                              </span>
                              <p className="text-[10px] text-gray-400">
                                {coach.trainingCompleted}/{coach.trainingTotal}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Prospects */}
                        <div className="p-4 flex flex-col items-center justify-center text-center">
                          <div className="flex items-center gap-1 mb-1">
                            <Target className="h-4 w-4 text-gray-400" />
                            <span className="text-xs text-gray-500">Prospects</span>
                          </div>
                          <span className="text-2xl font-bold text-optavia-dark">
                            {coach.prospectCount}
                          </span>
                        </div>

                        {/* HA Scheduled */}
                        <div className="p-4 flex flex-col items-center justify-center text-center">
                          <div className="flex items-center gap-1 mb-1">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className="text-xs text-gray-500">HA Scheduled</span>
                          </div>
                          <span className="text-2xl font-bold text-optavia-dark">
                            {coach.haScheduledCount}
                          </span>
                          <p className="text-[10px] text-gray-400">next 2 weeks</p>
                        </div>

                        {/* Active Clients */}
                        <div className="p-4 flex flex-col items-center justify-center text-center">
                          <div className="flex items-center gap-1 mb-1">
                            <UserCircle className="h-4 w-4 text-gray-400" />
                            <span className="text-xs text-gray-500">Clients</span>
                          </div>
                          <span className="text-2xl font-bold text-optavia-dark">
                            {coach.activeClientCount}
                          </span>
                          <p className="text-[10px] text-gray-400">active</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
