"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Users, BookOpen, CheckCircle } from "lucide-react"
import { useUserData } from "@/contexts/user-data-context"
import { createClient } from "@/lib/supabase/client"

interface DownlineCoach {
  id: string
  email: string | null
  full_name: string | null
  optavia_id: string | null
  is_new_coach: boolean
  completedLessons: string[]
  progress: number
}

export default function DownlineProgressPage() {
  const router = useRouter()
  const { authLoading, profile, user } = useUserData()
  const [downlineCoaches, setDownlineCoaches] = useState<DownlineCoach[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && user) {
      loadDownlineProgress()
    }
  }, [authLoading, user])

  const loadDownlineProgress = async () => {
    if (!user || !profile?.optavia_id) {
      setDownlineCoaches([])
      setLoading(false)
      return
    }

    const supabase = createClient()

    try {
      // Get profiles for downline coaches (coaches whose parent_optavia_id matches this coach's optavia_id)
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, email, full_name, optavia_id, is_new_coach")
        .eq("parent_optavia_id", profile.optavia_id)

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

      // Get progress for all downline coaches
      const { data: progressData, error: progressError } = await supabase
        .from("user_progress")
        .select("user_id, resource_id")
        .in("user_id", coachIds)
        .like("resource_id", "welcome-orientation-%")

      if (progressError) {
        console.error("Error loading progress:", progressError)
      }

      // Map progress to coaches
      const coachesWithProgress: DownlineCoach[] = (profiles || []).map((profile) => {
        const coachProgress = (progressData || [])
          .filter((p) => p.user_id === profile.id)
          .map((p) => p.resource_id.replace("welcome-orientation-", ""))

        const totalLessons = 4 // welcome-orientation has 4 lessons
        const progress = totalLessons > 0 ? Math.round((coachProgress.length / totalLessons) * 100) : 0

        return {
          id: profile.id,
          email: profile.email,
          full_name: profile.full_name,
          optavia_id: profile.optavia_id,
          is_new_coach: profile.is_new_coach,
          completedLessons: coachProgress,
          progress,
        }
      })

      setDownlineCoaches(coachesWithProgress)
    } catch (error) {
      console.error("Error loading downline progress:", error)
    } finally {
      setLoading(false)
    }
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

  // Show message if user doesn't have an Optavia ID set
  if (profile && !profile.optavia_id) {
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
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-optavia-gray mb-4">
                    Please set your Optavia ID in your profile settings to view your downline progress.
                  </p>
                  <Button onClick={() => router.push("/settings")}>
                    Go to Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
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

          <div className="mb-6">
            <h1 className="font-heading font-bold text-2xl sm:text-3xl text-optavia-dark mb-2">
              Downline Progress
            </h1>
            <p className="text-optavia-gray">
              Track your downline coaches' progress through the Welcome & Orientation module
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
                <Card key={coach.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">
                          {coach.full_name || coach.email || "Unknown Coach"}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {coach.email}
                          {coach.optavia_id && (
                            <span className="ml-2">• ID: {coach.optavia_id}</span>
                          )}
                          {coach.is_new_coach && (
                            <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-semibold">
                              New Coach
                            </span>
                          )}
                        </CardDescription>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-[hsl(var(--optavia-green))]">
                          {coach.progress}%
                        </div>
                        <div className="text-xs text-slate-500">
                          {coach.completedLessons.length} of 4 lessons
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Progress value={coach.progress} className="h-2 mb-4" />
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {["1.1.1", "1.1.2", "1.1.3", "1.1.4"].map((lessonId) => {
                        const isCompleted = coach.completedLessons.includes(lessonId)
                        return (
                          <div
                            key={lessonId}
                            className={`flex items-center gap-2 p-2 rounded ${
                              isCompleted ? "bg-green-50" : "bg-slate-50"
                            }`}
                          >
                            {isCompleted ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : (
                              <div className="h-4 w-4 rounded-full border-2 border-slate-300" />
                            )}
                            <span className="text-xs font-medium text-slate-700">
                              {lessonId}
                            </span>
                          </div>
                        )
                      })}
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
