"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useUserData } from "@/contexts/user-data-context"
import { createClient } from "@/lib/supabase/client"
import { ArrowLeft, Users, BookOpen, Award, TrendingUp } from "lucide-react"

interface ReportStats {
  totalUsers: number
  activeUsers7Days: number
  activeUsers30Days: number
  activePercent7Days: number
  activePercent30Days: number
  newCoaches: number
  experiencedCoaches: number
  totalCompletedResources: number
  totalBadgesEarned: number
}

export default function AdminReportsPage() {
  const router = useRouter()
  const { authLoading, profile } = useUserData()
  const [stats, setStats] = useState<ReportStats | null>(null)
  const [loading, setLoading] = useState(true)

  const isAdmin = profile?.user_role?.toLowerCase() === "admin"

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.replace("/training")
      return
    }

    if (isAdmin) {
      loadStats()
    }
  }, [authLoading, isAdmin, router])

  const loadStats = async () => {
    const supabase = createClient()
    
    try {
      // Get total users count
      const { count: totalUsers } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })

      // Get new vs experienced coaches
      const { data: coachData } = await supabase
        .from("profiles")
        .select("is_new_coach")

      const newCoaches = coachData?.filter(c => c.is_new_coach).length || 0
      const experiencedCoaches = coachData?.filter(c => !c.is_new_coach).length || 0

      // Get active users (signed in within last 7 days)
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      const { count: activeUsers7Days } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .gte("last_sign_in_at", sevenDaysAgo.toISOString())

      // Get active users (signed in within last 30 days)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      const { count: activeUsers30Days } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .gte("last_sign_in_at", thirtyDaysAgo.toISOString())
      
      // Calculate percentages
      const total = totalUsers || 1 // Avoid division by zero
      const activePercent7Days = Math.round(((activeUsers7Days || 0) / total) * 100)
      const activePercent30Days = Math.round(((activeUsers30Days || 0) / total) * 100)

      // Get total completed resources
      const { count: totalCompletedResources } = await supabase
        .from("user_progress")
        .select("*", { count: "exact", head: true })

      // Get total badges earned
      const { count: totalBadgesEarned } = await supabase
        .from("user_badges")
        .select("*", { count: "exact", head: true })

      setStats({
        totalUsers: totalUsers || 0,
        activeUsers7Days: activeUsers7Days || 0,
        activeUsers30Days: activeUsers30Days || 0,
        activePercent7Days,
        activePercent30Days,
        newCoaches,
        experiencedCoaches,
        totalCompletedResources: totalCompletedResources || 0,
        totalBadgesEarned: totalBadgesEarned || 0,
      })
    } catch (error) {
      console.error("Error loading stats:", error)
    } finally {
      setLoading(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[hsl(var(--optavia-green))] mx-auto mb-4"></div>
          <p className="text-optavia-gray">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[hsl(var(--optavia-green))] mx-auto mb-4"></div>
          <p className="text-optavia-gray">Redirecting...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header activeTab="training" />
      <main className="flex-1 bg-white">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <Button
            variant="ghost"
            onClick={() => router.push("/training")}
            className="mb-6 gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Training
          </Button>

          <h1 className="font-heading font-bold text-2xl sm:text-3xl text-optavia-dark mb-6">
            Coaching Reports
          </h1>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[hsl(var(--optavia-green))] mx-auto mb-4"></div>
              <p className="text-optavia-gray">Loading reports...</p>
            </div>
          ) : stats ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="bg-white border border-gray-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-optavia-gray">Total Coaches</CardTitle>
                  <Users className="h-5 w-5 text-[hsl(var(--optavia-green))]" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-optavia-dark">{stats.totalUsers}</div>
                  <p className="text-xs text-optavia-gray mt-1">
                    {stats.newCoaches} new • {stats.experiencedCoaches} experienced
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white border border-gray-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-optavia-gray">Active Last 7 Days</CardTitle>
                  <TrendingUp className="h-5 w-5 text-[hsl(var(--optavia-green))]" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-optavia-dark">
                    {stats.activePercent7Days}%
                  </div>
                  <p className="text-xs text-optavia-gray mt-1">
                    {stats.activeUsers7Days} of {stats.totalUsers} coaches
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className="bg-[hsl(var(--optavia-green))] h-2 rounded-full transition-all duration-500"
                      style={{ width: `${stats.activePercent7Days}%` }}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border border-gray-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-optavia-gray">Active Last 30 Days</CardTitle>
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-optavia-dark">
                    {stats.activePercent30Days}%
                  </div>
                  <p className="text-xs text-optavia-gray mt-1">
                    {stats.activeUsers30Days} of {stats.totalUsers} coaches
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${stats.activePercent30Days}%` }}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border border-gray-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-optavia-gray">Resources Completed</CardTitle>
                  <BookOpen className="h-5 w-5 text-[hsl(var(--optavia-green))]" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-optavia-dark">{stats.totalCompletedResources}</div>
                  <p className="text-xs text-optavia-gray mt-1">
                    Total across all coaches
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white border border-gray-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-optavia-gray">Badges Earned</CardTitle>
                  <Award className="h-5 w-5 text-[hsl(var(--optavia-green))]" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-optavia-dark">{stats.totalBadgesEarned}</div>
                  <p className="text-xs text-optavia-gray mt-1">
                    Total badges earned by coaches
                  </p>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card className="bg-white border border-gray-200">
              <CardContent className="pt-6">
                <p className="text-center text-optavia-gray">Unable to load reports.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}

