"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/hooks/use-auth"
import { useSupabaseData } from "@/hooks/use-supabase-data"
import { createClient } from "@/lib/supabase/client"
import { modules } from "@/lib/data"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface UserStats {
  total: number
  active: number
  activeByRole: {
    admin: number
    coach: number
  }
  loggedInLast7Days: number
  loggedInLast7DaysPercent: number
}

interface CategoryCompletion {
  category: string
  totalUsers: number
  completedUsers: number
  completionPercent: number
}

export function AdminReports({ onClose }: { onClose?: () => void }) {
  const { user } = useAuth()
  const { profile } = useSupabaseData(user)
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [categoryCompletions, setCategoryCompletions] = useState<CategoryCompletion[]>([])

  const role = profile?.user_role?.toLowerCase()
  const isAdmin = role === "admin" || role === "system_admin"

  useEffect(() => {
    if (!user || !isAdmin) {
      setLoading(false)
      return
    }
    loadReports()
  }, [user, isAdmin])

  const loadReports = async () => {
    // Note: Admin API is not available from client, so we'll use profiles table
    // For production, you may want to create a server-side API route or
    // add a last_login_at field to the profiles table
    await loadReportsFromProfiles()
  }

  const loadReportsFromProfiles = async () => {
    // Get all profiles with user roles
    const { data: profiles, error } = await supabase
      .from("profiles")
      .select("id, user_role, updated_at")

    if (error) {
      console.error("Error loading profiles:", error)
      setLoading(false)
      return
    }

    // Calculate dates
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    const totalUsers = profiles?.length || 0
    let activeUsers = 0
    let activeByRole = { admin: 0, coach: 0 }
    let loggedInLast7Days = 0

    profiles?.forEach((profile) => {
      // Use updated_at as a proxy for last activity
      // Note: For accurate tracking, you should add a last_login_at field to profiles
      // or create a user_sessions table to track actual logins
      const lastActivity = profile.updated_at ? new Date(profile.updated_at) : null
      const userRole = profile.user_role?.toLowerCase() || "coach"

      // Active = updated (logged in) last 30 days
      if (lastActivity && lastActivity >= thirtyDaysAgo) {
        activeUsers++
        if (userRole === "admin") {
          activeByRole.admin++
        } else {
          activeByRole.coach++
        }
      }

      // Logged in last 7 days
      if (lastActivity && lastActivity >= sevenDaysAgo) {
        loggedInLast7Days++
      }
    })

    const loggedInLast7DaysPercent = totalUsers > 0 
      ? Math.round((loggedInLast7Days / totalUsers) * 100) 
      : 0

    setUserStats({
      total: totalUsers,
      active: activeUsers,
      activeByRole,
      loggedInLast7Days,
      loggedInLast7DaysPercent,
    })

    await loadCategoryCompletions(profiles?.map(p => p.id) || [])
  }

  const loadCategoryCompletions = async (userIds: string[]) => {
    const categories = ["Getting Started", "Business Building", "Client Support", "Training"]
    const completions: CategoryCompletion[] = []

    // Get all user progress
    const { data: allProgress, error: progressError } = await supabase
      .from("user_progress")
      .select("user_id, resource_id")

    if (progressError) {
      console.error("Error loading progress:", progressError)
      return
    }

    // Group progress by user
    const userProgressMap = new Map<string, Set<string>>()
    allProgress?.forEach((progress) => {
      if (!userProgressMap.has(progress.user_id)) {
        userProgressMap.set(progress.user_id, new Set())
      }
      userProgressMap.get(progress.user_id)?.add(progress.resource_id)
    })

    // Calculate completion for each category
    for (const category of categories) {
      // Get all resources in this category
      const categoryModules = modules.filter(m => m.category === category)
      const categoryResourceIds = new Set<string>()
      categoryModules.forEach(module => {
        module.resources.forEach(resource => {
          categoryResourceIds.add(resource.id)
        })
      })

      if (categoryResourceIds.size === 0) {
        completions.push({
          category,
          totalUsers: userIds.length,
          completedUsers: 0,
          completionPercent: 0,
        })
        continue
      }

      // Count users who completed all resources in this category
      let completedUsers = 0
      userIds.forEach((userId) => {
        const userResources = userProgressMap.get(userId) || new Set()
        const hasAllResources = Array.from(categoryResourceIds).every(id => userResources.has(id))
        if (hasAllResources) {
          completedUsers++
        }
      })

      const completionPercent = userIds.length > 0
        ? Math.round((completedUsers / userIds.length) * 100)
        : 0

      completions.push({
        category,
        totalUsers: userIds.length,
        completedUsers,
        completionPercent,
      })
    }

    setCategoryCompletions(completions)
  }

  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="bg-white border border-gray-200">
          <CardContent className="pt-6">
            <p className="text-center text-optavia-gray">You don't have permission to access this page.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-optavia-gray">Loading reports...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading font-bold text-2xl sm:text-3xl text-optavia-dark">Admin Reports</h1>
        {onClose && (
          <Button variant="ghost" onClick={onClose} className="text-optavia-gray hover:bg-gray-100">
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Active Users by Role */}
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-optavia-dark">Active Users by Role</CardTitle>
            <CardDescription className="text-optavia-gray">
              Users who logged in within the last 30 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-optavia-gray">Total Active Users</span>
                <span className="font-bold text-optavia-dark text-lg">{userStats?.active || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-optavia-gray">Admins</span>
                <span className="font-semibold text-optavia-dark">{userStats?.activeByRole.admin || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-optavia-gray">Coaches</span>
                <span className="font-semibold text-optavia-dark">{userStats?.activeByRole.coach || 0}</span>
              </div>
              <div className="pt-2 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-optavia-gray">Total Users</span>
                  <span className="text-sm text-optavia-gray">{userStats?.total || 0}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Users Logged In Last 7 Days */}
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-optavia-dark">Recent Activity</CardTitle>
            <CardDescription className="text-optavia-gray">
              Users logged in within the last 7 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-optavia-gray">Users Logged In</span>
                <span className="font-bold text-optavia-dark text-lg">
                  {userStats?.loggedInLast7Days || 0}
                </span>
              </div>
              <div className="pt-2">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-optavia-gray">Percentage</span>
                  <span className="font-bold text-optavia-dark text-2xl">
                    {userStats?.loggedInLast7DaysPercent || 0}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-[hsl(var(--optavia-green))] h-2.5 rounded-full transition-all"
                    style={{ width: `${userStats?.loggedInLast7DaysPercent || 0}%` }}
                  />
                </div>
              </div>
              <div className="pt-2 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-optavia-gray">Total Users</span>
                  <span className="text-sm text-optavia-gray">{userStats?.total || 0}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Completions */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-optavia-dark">Completion by Category</CardTitle>
          <CardDescription className="text-optavia-gray">
            Percentage of users who completed all resources in each category
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {categoryCompletions.map((completion) => (
              <div key={completion.category} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-optavia-dark">{completion.category}</span>
                  <span className="font-bold text-optavia-dark text-lg">
                    {completion.completionPercent}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-[hsl(var(--optavia-green))] h-2.5 rounded-full transition-all"
                    style={{ width: `${completion.completionPercent}%` }}
                  />
                </div>
                <div className="flex justify-between items-center text-xs text-optavia-gray">
                  <span>
                    {completion.completedUsers} of {completion.totalUsers} users completed
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

