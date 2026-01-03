"use client"

import { useState, useEffect } from "react"
import { CheckCircle, Circle, ChevronRight, Clock, Star, ArrowLeft, ArrowRight, Layers, Award, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"
import { useSupabaseData } from "@/hooks/use-supabase-data"

const lessons = [
  { id: "7.1.1", title: "Team Resources", type: "Resource Guide", icon: Layers, duration: "10 min read" },
  { id: "7.1.2", title: "Gold Standard Trainings", type: "Training Guide", icon: Award, duration: "25 min read" },
  { id: "7.1.3", title: "Global/Presidential Daily Tracker", type: "Interactive Tool", icon: BarChart3, duration: "10 min + daily use" },
]

const resourceCategories = [
  { category: "Training Padlets", icon: "📋", resources: ["New Coach Training", "Client Success", "Business Building", "Leadership Development"] },
  { category: "Team Pages & Groups", icon: "👥", resources: ["Team Facebook Group", "Leadership Inner Circle", "Coach Collaboration Space"] },
  { category: "YouTube & Video", icon: "🎬", resources: ["OPTAVIA Official", "Team Training Channel", "Success Story Playlist"] },
  { category: "Documents & Templates", icon: "📄", resources: ["Health Assessment Template", "Follow-Up Scripts", "Recognition Templates", "Business Trackers"] },
]

const goldStandardElements = [
  { element: "Documented Process", description: "Every step is written down and teachable", icon: "📋" },
  { element: "Proven Results", description: "The process consistently produces outcomes", icon: "📈" },
  { element: "Observable & Coachable", description: "You can watch and give specific feedback", icon: "👁️" },
  { element: "Duplicatable", description: "Anyone can learn it, not just naturally talented people", icon: "🔄" },
]

const dailyActivities = [
  { activity: "Leader Connections", target: "3-5 daily", icon: "🤝", color: "#4caf50" },
  { activity: "Team Recognition", target: "5+ daily", icon: "🎉", color: "#ff9800" },
  { activity: "Training Delivered", target: "30-60 min", icon: "📚", color: "#2196f3" },
  { activity: "Pipeline Review", target: "15-30 min", icon: "📊", color: "#9c27b0" },
  { activity: "Personal Production", target: "30-60 min", icon: "💪", color: "#f44336" },
  { activity: "Culture Building", target: "15-30 min", icon: "❤️", color: "#e91e63" },
  { activity: "Strategic Planning", target: "15-30 min", icon: "🎯", color: "#00bcd4" },
  { activity: "Self-Development", target: "15-30 min", icon: "🌱", color: "#8bc34a" },
]

export function LeadershipDevelopmentContent() {
  const { toast } = useToast()
  const { user } = useAuth()
  const { completedResources, toggleCompletedResource } = useSupabaseData(user)
  const [expandedLesson, setExpandedLesson] = useState(lessons[0].id)
  const [trackerData, setTrackerData] = useState<Record<string, string>>({})

  const getResourceId = (lessonId: string) => `leadership-development-${lessonId}`
  const completedLessons = new Set(lessons.map((lesson) => lesson.id).filter((lessonId) => completedResources.includes(getResourceId(lessonId))))

  useEffect(() => {
    const saved = localStorage.getItem("leadershipDevExpanded")
    if (saved) {
      try {
        const lessonId = JSON.parse(saved)
        if (lessons.some((l) => l.id === lessonId)) setExpandedLesson(lessonId)
      } catch {}
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("leadershipDevExpanded", JSON.stringify(expandedLesson))
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

  const trackerScore = Object.values(trackerData).filter(v => v).reduce((sum, v) => sum + parseInt(v || "0"), 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="bg-gradient-to-r from-[hsl(var(--optavia-green))] to-[#006633] text-white py-8 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 text-sm opacity-90 mb-2 uppercase tracking-wide">
            <span>Training Center</span>
            <ChevronRight className="h-4 w-4" />
            <span>Phase 7: FIBC to Global/Presidential</span>
            <ChevronRight className="h-4 w-4" />
            <span className="font-semibold">Module 7.1</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Leadership Development</h1>
          <p className="text-lg opacity-90 max-w-2xl">Develop leaders on your team who can develop leaders.</p>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid lg:grid-cols-[320px_1fr] gap-8">
          <aside className="space-y-6">
            <Card className="bg-gradient-to-br from-blue-900 to-blue-800 text-white text-center border-0">
              <CardContent className="pt-6">
                <div className="text-4xl mb-2">👑</div>
                <div className="font-bold text-sm">PHASE 7</div>
                <div className="text-sm opacity-90">FIBC → Global/Presidential</div>
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

            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-300">
              <CardContent className="pt-5">
                <p className="text-sm text-blue-900 italic leading-relaxed mb-2">&quot;Before you are a leader, success is all about growing yourself. When you become a leader, success is all about growing others.&quot;</p>
                <p className="text-xs text-blue-700 font-semibold">— Jack Welch</p>
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
                {/* Lesson 7.1.1 - Team Resources */}
                {currentLesson.id === "7.1.1" && (
                  <div className="space-y-8">
                    <div className="bg-green-50 border-l-4 border-[hsl(var(--optavia-green))] p-5 rounded-lg">
                      <p className="text-base leading-relaxed">At the Global and Presidential level, your team needs easy access to the same resources that helped you succeed. Centralized resources allow consistent messaging, 24/7 access to training, and scalable duplication.</p>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold mb-4">Why Centralized Resources Matter</h3>
                      <div className="grid grid-cols-4 gap-3">
                        {[
                          { icon: "🎯", reason: "Consistency", desc: "Everyone gets the same proven training" },
                          { icon: "📈", reason: "Scalability", desc: "Resources work while you sleep" },
                          { icon: "💪", reason: "Empowerment", desc: "Leaders can help without needing you" },
                          { icon: "✨", reason: "Professionalism", desc: "Polished resources build credibility" },
                        ].map((item, i) => (
                          <div key={i} className="p-4 bg-green-50 rounded-lg text-center">
                            <span className="text-2xl block mb-2">{item.icon}</span>
                            <div className="font-bold text-green-800 text-sm mb-1">{item.reason}</div>
                            <div className="text-xs text-green-700">{item.desc}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold mb-4">Essential Team Resources Hub</h3>
                      <div className="space-y-4">
                        {resourceCategories.map((cat, i) => (
                          <div key={i} className="rounded-lg border overflow-hidden">
                            <div className="bg-gray-50 px-4 py-3 flex items-center gap-3 border-b">
                              <span className="text-2xl">{cat.icon}</span>
                              <span className="font-bold">{cat.category}</span>
                            </div>
                            <div className="p-4 grid grid-cols-2 gap-2">
                              {cat.resources.map((res, j) => (
                                <div key={j} className="p-3 bg-gray-50 rounded-lg text-sm">{res}</div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold mb-4">Creating Your Resource Hub</h3>
                      <div className="space-y-3">
                        {[
                          { step: 1, title: "Audit Existing Resources", action: "Make a list of every resource you use" },
                          { step: 2, title: "Organize by User Journey", action: "Create clear categories matching progression" },
                          { step: 3, title: "Create Central Access Point", action: "One link that leads to everything" },
                          { step: 4, title: "Train Your Leaders", action: "Schedule resource walkthrough with all leaders" },
                          { step: 5, title: "Keep It Updated", action: "Set calendar reminders for quarterly audits" },
                        ].map((item, i) => (
                          <div key={i} className="flex gap-4">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-r from-[hsl(var(--optavia-green))] to-green-500 text-white flex items-center justify-center font-bold shrink-0">{item.step}</div>
                            <div className="flex-1 p-4 bg-gray-50 rounded-lg">
                              <div className="font-bold mb-1">{item.title}</div>
                              <div className="text-sm text-[hsl(var(--optavia-green))]">✅ {item.action}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Lesson 7.1.2 - Gold Standard Trainings */}
                {currentLesson.id === "7.1.2" && (
                  <div className="space-y-8">
                    <div className="bg-green-50 border-l-4 border-[hsl(var(--optavia-green))] p-5 rounded-lg">
                      <p className="text-base leading-relaxed">At the Global and Presidential level, you&apos;re teaching your leaders to execute at an exceptionally high level. These &apos;Gold Standard&apos; trainings represent the highest-quality execution of the three most critical coaching activities.</p>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold mb-4">What Makes a Training &apos;Gold Standard&apos;?</h3>
                      <div className="grid grid-cols-4 gap-3">
                        {goldStandardElements.map((item, i) => (
                          <div key={i} className="p-4 bg-amber-50 rounded-lg text-center border-2 border-amber-300">
                            <span className="text-2xl block mb-2">{item.icon}</span>
                            <div className="font-bold text-amber-800 text-sm mb-1">{item.element}</div>
                            <div className="text-xs text-amber-700">{item.description}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold mb-4">The Three Gold Standard Trainings</h3>
                      <div className="space-y-4">
                        {[
                          { title: "Mock Health Assessment", purpose: "Practice the HA process with zero stakes", duration: "45-60 min", when: "Before a new coach's first real HA" },
                          { title: "Transition & Optimization Calls", purpose: "Guide clients through key transition points", duration: "20-45 min", when: "At key milestones in client journey" },
                          { title: "The Kickoff Call", purpose: "Set expectations and establish coaching relationship", duration: "30-45 min", when: "Within 24 hours of order placement" },
                        ].map((item, i) => (
                          <div key={i} className="p-5 rounded-lg border-2 border-[hsl(var(--optavia-green))] bg-white">
                            <div className="font-bold text-lg text-[hsl(var(--optavia-green))] mb-2">{item.title}</div>
                            <p className="text-sm text-optavia-gray mb-3">{item.purpose}</p>
                            <div className="flex gap-4 text-xs">
                              <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full">⏱️ {item.duration}</span>
                              <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full">📅 {item.when}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold mb-4">The See One, Do One, Teach One Model</h3>
                      <div className="grid grid-cols-3 gap-4">
                        {[
                          { step: "See One", desc: "They observe you conducting the activity at Gold Standard level", color: "blue" },
                          { step: "Do One", desc: "They conduct the activity while you observe and coach", color: "green" },
                          { step: "Teach One", desc: "They teach the process to someone else while you observe", color: "amber" },
                        ].map((item, i) => (
                          <div key={i} className={`p-5 rounded-lg text-center bg-${item.color}-50`}>
                            <div className={`w-10 h-10 rounded-full bg-${item.color}-600 text-white flex items-center justify-center mx-auto mb-3 font-bold`}>{i + 1}</div>
                            <div className={`font-bold text-${item.color}-800 mb-2`}>{item.step}</div>
                            <div className="text-sm text-optavia-gray">{item.desc}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Lesson 7.1.3 - Daily Tracker */}
                {currentLesson.id === "7.1.3" && (
                  <div className="space-y-8">
                    <div className="bg-green-50 border-l-4 border-[hsl(var(--optavia-green))] p-5 rounded-lg">
                      <p className="text-base leading-relaxed">At the Global and Presidential level, your focus shifts from personal production to leadership development, team culture, and strategic growth. This daily tracker keeps you focused on the highest-leverage activities for your rank.</p>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold mb-4">The Shift in Daily Focus</h3>
                      <div className="p-5 bg-gray-50 rounded-lg mb-6">
                        <div className="flex items-center justify-center gap-6 mb-6">
                          <div className="px-4 py-2 bg-red-100 text-red-700 rounded-lg line-through">Personal Production Focus</div>
                          <span className="text-2xl">→</span>
                          <div className="px-4 py-2 bg-green-100 text-green-700 rounded-lg font-bold">Leadership Multiplication Focus</div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          {[
                            { from: "Reach out to 10 prospects", to: "Help 3 leaders reach their prospects" },
                            { from: "Conduct 2 Health Assessments", to: "Observe/coach 2 leaders on their HAs" },
                            { from: "Support 10 clients", to: "Train leaders to support their clients" },
                            { from: "Hit personal volume goals", to: "Help leaders hit THEIR volume goals" },
                          ].map((item, i) => (
                            <div key={i} className="flex items-center gap-3">
                              <span className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded line-through flex-1 text-right">{item.from}</span>
                              <span>→</span>
                              <span className="text-xs bg-green-50 text-green-600 px-2 py-1 rounded flex-1">{item.to}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold mb-4">The 8 Daily Leadership Activities</h3>
                      <div className="grid grid-cols-2 gap-3">
                        {dailyActivities.map((item, i) => (
                          <div key={i} className="p-4 bg-white rounded-lg border-2" style={{ borderColor: item.color }}>
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-xl">{item.icon}</span>
                              <span className="font-bold" style={{ color: item.color }}>{item.activity}</span>
                            </div>
                            <div className="text-xs text-optavia-gray bg-gray-50 px-2 py-1 rounded inline-block">🎯 Target: {item.target}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-300">
                      <h4 className="text-lg font-bold text-green-800 mb-4">📊 Today&apos;s Leadership Tracker</h4>
                      <p className="text-sm text-green-700 mb-4">Rate each activity 1-5 based on your completion and quality today.</p>
                      <div className="grid grid-cols-2 gap-3">
                        {dailyActivities.map((item) => (
                          <div key={item.activity} className="flex items-center gap-3 p-3 bg-white rounded-lg">
                            <span className="flex-1 text-sm">{item.icon} {item.activity}</span>
                            <Input
                              type="number"
                              min="1"
                              max="5"
                              placeholder="1-5"
                              className="w-16 text-center"
                              value={trackerData[item.activity] || ""}
                              onChange={(e) => setTrackerData(prev => ({ ...prev, [item.activity]: e.target.value }))}
                            />
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 p-4 bg-white rounded-lg text-center">
                        <div className="text-sm text-optavia-gray mb-1">Today&apos;s Score</div>
                        <div className="text-3xl font-bold text-[hsl(var(--optavia-green))]">{trackerScore} / 40</div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold mb-4">Common Time Traps at Senior Levels</h3>
                      <div className="space-y-3">
                        {[
                          { trap: "Skip-Level Management", desc: "Trying to manage people who should be managed by your leaders", solution: "Route through leaders" },
                          { trap: "Endless Availability", desc: "Being available to everyone all the time", solution: "Set office hours, empower leaders" },
                          { trap: "Doing Instead of Teaching", desc: "Stepping in because it's faster", solution: "Invest time to teach once, save time forever" },
                          { trap: "Meeting Creep", desc: "Calendar filled with meetings leaving no strategic time", solution: "Audit meetings quarterly, protect strategic time" },
                        ].map((item, i) => (
                          <div key={i} className="p-4 bg-red-50 rounded-lg">
                            <div className="font-bold text-red-800 mb-2">⚠️ {item.trap}</div>
                            <div className="text-sm text-red-700 mb-2">{item.desc}</div>
                            <div className="text-sm bg-green-50 text-green-700 p-2 rounded">✅ Solution: {item.solution}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Key Takeaways */}
                <div className="mt-10 p-6 bg-gradient-to-r from-amber-50 to-amber-100 rounded-lg border border-amber-200">
                  <h4 className="text-base font-bold text-amber-900 mb-4 flex items-center gap-2"><Star className="h-5 w-5 fill-amber-600" />Key Takeaways</h4>
                  <ul className="space-y-2 text-sm text-amber-900">
                    {currentLesson.id === "7.1.1" && (
                      <>
                        <li>• Centralized resources enable scalable, consistent team development</li>
                        <li>• Organize resources by user journey, not just by topic</li>
                        <li>• Share specific resources for specific situations – don&apos;t overwhelm</li>
                        <li>• Build your own content library as part of your leadership legacy</li>
                      </>
                    )}
                    {currentLesson.id === "7.1.2" && (
                      <>
                        <li>• Gold Standard trainings are documented, proven, observable, and duplicatable</li>
                        <li>• Mock HAs with detailed feedback accelerate new coach readiness</li>
                        <li>• Transition calls at key moments dramatically improve client retention</li>
                        <li>• Use See One, Do One, Teach One to develop leaders who can develop leaders</li>
                      </>
                    )}
                    {currentLesson.id === "7.1.3" && (
                      <>
                        <li>• At senior levels, your focus shifts from doing to developing and multiplying</li>
                        <li>• Track 8 key leadership activities daily to maintain balance</li>
                        <li>• Establish a weekly rhythm that covers all aspects of senior leadership</li>
                        <li>• Avoid common time traps: skip-level management, endless availability, doing vs. teaching</li>
                      </>
                    )}
                  </ul>
                </div>
              </CardContent>

              <div className="border-t bg-gray-50 p-6 flex justify-between">
                {prevLesson ? (
                  <Button variant="outline" onClick={() => setExpandedLesson(prevLesson.id)}><ArrowLeft className="h-4 w-4 mr-2" />Previous</Button>
                ) : (
                  <Button variant="outline" onClick={() => (window.location.href = "/training/moving-beyond-ed")}><ArrowLeft className="h-4 w-4 mr-2" />Back to Phase 6</Button>
                )}
                {nextLesson ? (
                  <Button onClick={() => setExpandedLesson(nextLesson.id)} className="bg-[hsl(var(--optavia-green))]">Next<ArrowRight className="h-4 w-4 ml-2" /></Button>
                ) : (
                  <Button className="bg-[hsl(var(--optavia-green))]" onClick={() => window.history.back()}>🎉 Complete Module 7.1<ArrowRight className="h-4 w-4 ml-2" /></Button>
                )}
              </div>
            </Card>
          </main>
        </div>
      </div>
    </div>
  )
}
