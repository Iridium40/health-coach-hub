"use client"

import { useState, useEffect } from "react"
import { CheckCircle, Circle, ChevronRight, Clock, Star, ArrowLeft, ArrowRight, Crown, Flame, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"
import { useSupabaseData } from "@/hooks/use-supabase-data"

const lessons = [
  { id: "5.3.1", title: "VIP Call How To", type: "Guide", icon: Crown, duration: "15 min read" },
  { id: "5.3.2", title: "Coaching a Metabolic Reset", type: "Training", icon: Flame, duration: "20 min read" },
  { id: "5.3.3", title: "Metabolic Talking Points for Coaches", type: "Reference", icon: MessageCircle, duration: "10 min read" },
]

export function AdvancedClientSupportContent() {
  const { toast } = useToast()
  const { user } = useAuth()
  const { completedResources, toggleCompletedResource } = useSupabaseData(user)
  const [expandedLesson, setExpandedLesson] = useState(lessons[0].id)

  const getResourceId = (lessonId: string) => `advanced-client-support-${lessonId}`
  const completedLessons = new Set(lessons.map((lesson) => lesson.id).filter((lessonId) => completedResources.includes(getResourceId(lessonId))))

  useEffect(() => {
    const saved = localStorage.getItem("advancedClientSupportExpanded")
    if (saved) {
      try {
        const lessonId = JSON.parse(saved)
        if (lessons.some((l) => l.id === lessonId)) setExpandedLesson(lessonId)
      } catch {}
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("advancedClientSupportExpanded", JSON.stringify(expandedLesson))
  }, [expandedLesson])

  const toggleComplete = async (lessonId: string) => {
    if (!user) {
      toast({ title: "Please sign in", description: "You need to be signed in to track your progress.", variant: "destructive" })
      return
    }
    await toggleCompletedResource(getResourceId(lessonId))
    toast({ title: !completedLessons.has(lessonId) ? "Lesson completed!" : "Lesson unmarked" })
  }

  const currentLessonIndex = lessons.findIndex((l) => l.id === expandedLesson)
  const currentLesson = lessons[currentLessonIndex]
  const prevLesson = currentLessonIndex > 0 ? lessons[currentLessonIndex - 1] : null
  const nextLesson = currentLessonIndex < lessons.length - 1 ? lessons[currentLessonIndex + 1] : null
  const completedCount = completedLessons.size
  const progressPercent = Math.round((completedCount / lessons.length) * 100)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="bg-gradient-to-r from-[hsl(var(--optavia-green))] to-[#006633] text-white py-8 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 text-sm opacity-90 mb-2 uppercase tracking-wide">
            <span>Training Center</span>
            <ChevronRight className="h-4 w-4" />
            <span>Phase 5: Senior Coach to Executive Director</span>
            <ChevronRight className="h-4 w-4" />
            <span className="font-semibold">Module 5.3</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Advanced Client Support</h1>
          <p className="text-lg opacity-90 max-w-2xl">Master client retention and results through VIP experiences and metabolic coaching expertise.</p>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid lg:grid-cols-[320px_1fr] gap-8">
          <aside className="space-y-6">
            <Card className="bg-gradient-to-br from-indigo-900 to-indigo-800 text-white text-center border-0">
              <CardContent className="pt-6">
                <div className="text-4xl mb-2">💎</div>
                <div className="font-bold text-sm">PHASE 5</div>
                <div className="text-sm opacity-90">Senior Coach → Executive Director</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-sm font-semibold">Module Progress</CardTitle>
                  <span className="text-sm font-semibold text-[hsl(var(--optavia-green))]">{completedCount}/{lessons.length}</span>
                </div>
              </CardHeader>
              <CardContent><Progress value={progressPercent} className="h-2" /></CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-xs font-semibold text-optavia-gray uppercase">Lessons</CardTitle></CardHeader>
              <CardContent className="p-0">
                {lessons.map((lesson) => {
                  const Icon = lesson.icon
                  const isActive = expandedLesson === lesson.id
                  const isComplete = completedLessons.has(lesson.id)
                  return (
                    <button key={lesson.id} onClick={() => setExpandedLesson(lesson.id)} className={`w-full p-4 flex items-start gap-3 border-b last:border-b-0 text-left ${isActive ? "bg-green-50 border-l-4 border-l-[hsl(var(--optavia-green))]" : "hover:bg-gray-50"}`}>
                      <div className="mt-1">{isComplete ? <CheckCircle className="h-5 w-5 text-[hsl(var(--optavia-green))]" /> : <Circle className="h-5 w-5 text-gray-300" />}</div>
                      <div className="flex-1">
                        <div className="text-xs font-semibold text-[hsl(var(--optavia-green))] mb-1">{lesson.id}</div>
                        <div className={`text-sm font-semibold mb-2 ${isActive ? "text-[hsl(var(--optavia-green))]" : ""}`}>{lesson.title}</div>
                        <div className="flex items-center gap-3 text-xs text-optavia-gray">
                          <Badge variant="outline" className="text-xs bg-gray-50"><Icon className="h-3 w-3 mr-1" />{lesson.type}</Badge>
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{lesson.duration}</span>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </CardContent>
            </Card>
          </aside>

          <main>
            <Card>
              <CardHeader className="border-b">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-xs font-semibold text-[hsl(var(--optavia-green))] uppercase mb-2">Lesson {currentLesson.id}</div>
                    <CardTitle className="text-2xl font-bold">{currentLesson.title}</CardTitle>
                  </div>
                  <Button onClick={() => toggleComplete(currentLesson.id)} variant={completedLessons.has(currentLesson.id) ? "default" : "outline"} className={completedLessons.has(currentLesson.id) ? "bg-[hsl(var(--optavia-green))]" : ""}>
                    {completedLessons.has(currentLesson.id) ? <><CheckCircle className="h-4 w-4 mr-2" />Completed</> : <><Circle className="h-4 w-4 mr-2" />Mark Complete</>}
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="p-8">
                <div className="bg-green-50 border-l-4 border-[hsl(var(--optavia-green))] p-5 rounded-lg mb-8">
                  <p className="text-base leading-relaxed">This module covers advanced client support techniques including VIP calls, metabolic reset coaching, and effective talking points for discussing metabolism with clients.</p>
                </div>

                <div className="space-y-6">
                  {currentLesson.id === "5.3.1" && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-bold">VIP Calls: Making Clients Feel Special</h3>
                      <p className="text-optavia-gray">VIP Calls are special recognition calls for clients who&apos;ve achieved milestones. They increase retention, generate referrals, and build community.</p>
                      <div className="grid grid-cols-2 gap-4">
                        {["Milestone Celebration", "Monthly VIP Club", "Transformation Spotlight", "Re-Engagement Call"].map((type, i) => (
                          <div key={i} className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                            <div className="font-semibold text-amber-800">{type}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {currentLesson.id === "5.3.2" && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-bold">Coaching Metabolic Resets</h3>
                      <p className="text-optavia-gray">A metabolic reset helps restore the body&apos;s natural ability to burn fat efficiently. Understanding this process makes you a more effective coach.</p>
                      <div className="p-4 bg-orange-50 rounded-lg border-l-4 border-orange-400">
                        <div className="font-bold text-orange-800 mb-2">Key Concept: Fat Burn State</div>
                        <p className="text-sm text-orange-900">Most clients enter fat burn within 3-5 days. Signs include decreased hunger, increased energy, and mental clarity.</p>
                      </div>
                    </div>
                  )}
                  {currentLesson.id === "5.3.3" && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-bold">Metabolic Talking Points</h3>
                      <p className="text-optavia-gray">Use simple language and relatable analogies when discussing metabolism. You&apos;re a guide, not a scientist.</p>
                      <div className="grid gap-3">
                        {["Why Diets Haven't Worked", "Blood Sugar & Cravings", "Fat Burning vs Sugar Burning", "The Transition Period"].map((topic, i) => (
                          <div key={i} className="p-3 bg-blue-50 rounded-lg">
                            <div className="font-semibold text-blue-800">{topic}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-10 p-6 bg-gradient-to-r from-amber-50 to-amber-100 rounded-lg border border-amber-200">
                  <h4 className="text-base font-bold text-amber-900 mb-4 flex items-center gap-2"><Star className="h-5 w-5 fill-amber-600" />Key Takeaways</h4>
                  <ul className="space-y-2 text-sm text-amber-900">
                    <li>• VIP Calls celebrate clients and increase retention</li>
                    <li>• Metabolic reset coaching requires understanding the fat burn state</li>
                    <li>• Use simple language when discussing metabolism with clients</li>
                  </ul>
                </div>
              </CardContent>

              <div className="border-t bg-gray-50 p-6 flex justify-between">
                {prevLesson ? <Button variant="outline" onClick={() => setExpandedLesson(prevLesson.id)}><ArrowLeft className="h-4 w-4 mr-2" />Previous</Button> : <Button variant="outline" onClick={() => (window.location.href = "/training/business-planning")}><ArrowLeft className="h-4 w-4 mr-2" />Back to Module 5.2</Button>}
                {nextLesson ? <Button onClick={() => setExpandedLesson(nextLesson.id)} className="bg-[hsl(var(--optavia-green))]">Next<ArrowRight className="h-4 w-4 ml-2" /></Button> : <Button className="bg-[hsl(var(--optavia-green))]" onClick={() => (window.location.href = "/training/team-building")}>Continue to Phase 6<ArrowRight className="h-4 w-4 ml-2" /></Button>}
              </div>
            </Card>
          </main>
        </div>
      </div>
    </div>
  )
}
