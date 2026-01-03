"use client"

import { useState, useEffect } from "react"
import { CheckCircle, Circle, ChevronRight, Clock, Star, ArrowLeft, ArrowRight, UserPlus, Target, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"
import { useSupabaseData } from "@/hooks/use-supabase-data"

const lessons = [
  { id: "6.1.1", title: "Converting Clients to Coaches", type: "Training", icon: UserPlus, duration: "15 min read" },
  { id: "6.1.2", title: "Grow to FIBC Bubble Tracker", type: "Visual Tracker", icon: Target, duration: "10 min activity" },
  { id: "6.1.3", title: "FIBC Daily Tracker", type: "Daily Checklist", icon: Calendar, duration: "5 min daily" },
]

export function TeamBuildingContent() {
  const { toast } = useToast()
  const { user } = useAuth()
  const { completedResources, toggleCompletedResource } = useSupabaseData(user)
  const [expandedLesson, setExpandedLesson] = useState(lessons[0].id)

  const getResourceId = (lessonId: string) => `team-building-${lessonId}`
  const completedLessons = new Set(lessons.map((lesson) => lesson.id).filter((lessonId) => completedResources.includes(getResourceId(lessonId))))

  useEffect(() => {
    const saved = localStorage.getItem("teamBuildingExpanded")
    if (saved) {
      try {
        const lessonId = JSON.parse(saved)
        if (lessons.some((l) => l.id === lessonId)) setExpandedLesson(lessonId)
      } catch {}
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("teamBuildingExpanded", JSON.stringify(expandedLesson))
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
            <span>Phase 6: ED to FIBC</span>
            <ChevronRight className="h-4 w-4" />
            <span className="font-semibold">Module 6.1</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Team Building Fundamentals</h1>
          <p className="text-lg opacity-90 max-w-2xl">Learn to sponsor and develop new coaches as you build toward FIBC.</p>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid lg:grid-cols-[320px_1fr] gap-8">
          <aside className="space-y-6">
            <Card className="bg-gradient-to-br from-purple-900 to-purple-800 text-white text-center border-0">
              <CardContent className="pt-6">
                <div className="text-4xl mb-2">👑</div>
                <div className="font-bold text-sm">PHASE 6</div>
                <div className="text-sm opacity-90">Executive Director → FIBC</div>
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

            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-300">
              <CardContent className="pt-5">
                <p className="text-sm text-green-900 italic leading-relaxed mb-2">&quot;The greatest leader is not the one who does the greatest things, but the one who gets people to do the greatest things.&quot;</p>
                <p className="text-xs text-green-700 font-semibold">— Ronald Reagan</p>
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
                  <p className="text-base leading-relaxed">This module teaches you how to convert successful clients to coaches, track your progress toward FIBC, and maintain the daily habits needed for leadership growth.</p>
                </div>

                <div className="space-y-6">
                  {currentLesson.id === "6.1.1" && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-bold">Converting Clients to Coaches</h3>
                      <p className="text-optavia-gray">Your best potential coaches are successful clients who already believe in the program. They have credibility, passion, and a personal story that resonates.</p>
                      <div className="grid grid-cols-3 gap-3">
                        {[{ icon: "💯", title: "Authentic Testimony" }, { icon: "✨", title: "Product Believers" }, { icon: "🌐", title: "Built-In Network" }, { icon: "🤝", title: "Coached Relationship" }, { icon: "❤️", title: "Understand Experience" }].map((item, i) => (
                          <div key={i} className="p-4 bg-green-50 rounded-lg text-center">
                            <span className="text-2xl block mb-2">{item.icon}</span>
                            <div className="text-sm font-semibold text-green-800">{item.title}</div>
                          </div>
                        ))}
                      </div>
                      <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                        <div className="font-bold text-blue-800 mb-2">The 5-Phase Conversation Framework</div>
                        <ol className="text-sm text-blue-900 space-y-1">
                          <li>1. Acknowledge Their Success</li>
                          <li>2. Share What You&apos;ve Noticed</li>
                          <li>3. Ask a Curiosity Question</li>
                          <li>4. Invite to Learn More</li>
                          <li>5. The Follow-Up Call</li>
                        </ol>
                      </div>
                    </div>
                  )}
                  {currentLesson.id === "6.1.2" && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-bold">FIBC Bubble Tracker</h3>
                      <p className="text-optavia-gray">FIBC (Field Independent Business Coach) represents building a substantial, self-sustaining business. Track your progress across these key areas:</p>
                      <div className="grid grid-cols-2 gap-4">
                        {["Personal Production", "Team Building", "Leadership Development", "Business Systems", "Volume & Points"].map((area, i) => (
                          <div key={i} className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                            <div className="font-semibold text-purple-800">{area}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {currentLesson.id === "6.1.3" && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-bold">FIBC Daily Tracker</h3>
                      <p className="text-optavia-gray">The path to FIBC requires shifting your focus from personal production to leadership development.</p>
                      <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                        <div className="font-bold text-amber-800 mb-3">The 50/30/20 Time Rule</div>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="text-center p-3 bg-white rounded-lg"><div className="text-2xl font-bold text-green-600">50%</div><div className="text-xs text-optavia-gray">Leadership Development</div></div>
                          <div className="text-center p-3 bg-white rounded-lg"><div className="text-2xl font-bold text-blue-600">30%</div><div className="text-xs text-optavia-gray">Team Support</div></div>
                          <div className="text-center p-3 bg-white rounded-lg"><div className="text-2xl font-bold text-pink-600">20%</div><div className="text-xs text-optavia-gray">Personal Production</div></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-10 p-6 bg-gradient-to-r from-amber-50 to-amber-100 rounded-lg border border-amber-200">
                  <h4 className="text-base font-bold text-amber-900 mb-4 flex items-center gap-2"><Star className="h-5 w-5 fill-amber-600" />Key Takeaways</h4>
                  <ul className="space-y-2 text-sm text-amber-900">
                    <li>• Your best coaching candidates are successful, engaged clients</li>
                    <li>• FIBC requires depth – focus on developing leaders</li>
                    <li>• Follow the 50/30/20 rule for time allocation</li>
                  </ul>
                </div>
              </CardContent>

              <div className="border-t bg-gray-50 p-6 flex justify-between">
                {prevLesson ? <Button variant="outline" onClick={() => setExpandedLesson(prevLesson.id)}><ArrowLeft className="h-4 w-4 mr-2" />Previous</Button> : <Button variant="outline" onClick={() => (window.location.href = "/training/advanced-client-support")}><ArrowLeft className="h-4 w-4 mr-2" />Back to Phase 5</Button>}
                {nextLesson ? <Button onClick={() => setExpandedLesson(nextLesson.id)} className="bg-[hsl(var(--optavia-green))]">Next<ArrowRight className="h-4 w-4 ml-2" /></Button> : <Button className="bg-[hsl(var(--optavia-green))]" onClick={() => window.history.back()}>🎉 Complete Phase 6<ArrowRight className="h-4 w-4 ml-2" /></Button>}
              </div>
            </Card>
          </main>
        </div>
      </div>
    </div>
  )
}
