"use client"

import { useState, useEffect } from "react"
import { CheckCircle, Circle, ChevronRight, Clock, Star, ArrowLeft, ArrowRight, MapPin, CheckSquare, Calculator, Target, Zap, Users, Trophy, Flag, Check, Lightbulb } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"
import { useSupabaseData } from "@/hooks/use-supabase-data"

interface Benefit {
  benefit: string
  description: string
  icon: string
}

interface HowTo {
  step: string
  description: string
}

interface BestPractice {
  practice: string
  description: string
  icon: string
}

interface EDQuality {
  quality: string
  description: string
}

interface TrackerCategory {
  category: string
  color: string
  borderColor: string
  items: { id: string; task: string; priority: string }[]
}

interface WeeklyPowerHour {
  day: string
  focus: string
  tasks: string[]
  duration: string
}

interface ConsistencyLevel {
  level: string
  status: string
  description: string
  color: string
}

interface PointMethod {
  method: string
  description: string
  icon: string
  example: string
}

interface PointMath {
  volumeExample: { title: string; scenarios: { fqv: string; points: string }[] }
  teamExample: { title: string; scenarios: { team: string; points: string }[] }
  combinedExample: { title: string; coach: string; breakdown: { source: string; points: number }[] }
}

interface RankRequirement {
  rank: string
  points: string
  requirement: string
  note: string
}

interface Strategy {
  strategy: string
  description: string
  icon: string
  tip: string
}

interface FAQ {
  question: string
  answer: string
}

interface Insight {
  insight: string
  description: string
}

interface Section {
  title: string
  content?: string
  disclaimer?: string
  isMapSection?: boolean
  isDailyTracker?: boolean
  isCalculator?: boolean
  benefits?: Benefit[]
  howTo?: HowTo[]
  bestPractices?: BestPractice[]
  edQualities?: EDQuality[]
  categories?: TrackerCategory[]
  weeklyPowerHours?: WeeklyPowerHour[]
  consistencyLevels?: ConsistencyLevel[]
  pointsDefinition?: { headline: string; methods: PointMethod[]; note: string }
  pointMath?: PointMath
  rankRequirements?: RankRequirement[]
  strategies?: Strategy[]
  faqs?: FAQ[]
  mindset?: Insight[]
}

interface Lesson {
  id: string
  title: string
  type: string
  icon: typeof MapPin
  duration: string
  content: {
    intro: string
    sections: Section[]
    keyTakeaways: string[]
  }
}

const lessons: Lesson[] = [
  {
    id: "5.2.1",
    title: "MAP (Monthly Action Plan) Template",
    type: "Planning Tool",
    icon: MapPin,
    duration: "20 min activity",
    content: {
      intro: "A goal without a plan is just a wish. Your Monthly Action Plan (MAP) transforms your rank advancement dreams into concrete, actionable steps. Complete this template each month to stay focused and intentional about your business growth.",
      sections: [
        {
          title: "Why Use a MAP?",
          content: "Top coaches don't leave their success to chance. They plan intentionally, track consistently, and adjust strategically. Your MAP is your monthly blueprint for success.",
          benefits: [
            { benefit: "Clarity", description: "Know exactly what you're working toward this month", icon: "🎯" },
            { benefit: "Focus", description: "Eliminate distractions by prioritizing what matters most", icon: "🔍" },
            { benefit: "Accountability", description: "Written plans create commitment and measurable progress", icon: "📝" },
            { benefit: "Momentum", description: "Small wins compound into major breakthroughs over time", icon: "🚀" },
          ],
        },
        { title: "Your Monthly Action Plan", isMapSection: true },
        {
          title: "How to Use Your MAP",
          howTo: [
            { step: "1. Complete at Month Start", description: "Fill out your MAP in the first 1-3 days of each month. Set aside 20-30 minutes of focused time." },
            { step: "2. Review Weekly", description: "Every Sunday or Monday, review your MAP. Are you on track? What needs to adjust?" },
            { step: "3. Share with Your Mentor", description: "Send your MAP to your upline for accountability and support. They can help you strategize." },
            { step: "4. Reflect at Month End", description: "Before creating next month's MAP, reflect on what worked and what didn't." },
          ],
        },
        {
          title: "MAP Best Practices",
          bestPractices: [
            { practice: "Be Specific", description: '"Get more clients" isn\'t a goal. "Acquire 3 new clients this month" is.', icon: "✏️" },
            { practice: "Be Realistic", description: "Stretch yourself, but set goals you can actually achieve. Build confidence through wins.", icon: "⚖️" },
            { practice: "Focus on Activities", description: "You can't control outcomes, but you CAN control actions. Plan the activities.", icon: "🎬" },
            { practice: "Build in Flexibility", description: "Life happens. Leave room to adjust without abandoning the whole plan.", icon: "🌊" },
            { practice: "Celebrate Progress", description: "Acknowledge every win, even small ones. Momentum builds on recognition.", icon: "🎉" },
          ],
        },
      ],
      keyTakeaways: ["Create your MAP in the first 3 days of each month", "Focus on activities you can control, not just outcomes", "Review weekly and adjust as needed", "Share with your mentor for accountability"],
    },
  },
  {
    id: "5.2.2",
    title: "ED Daily Tracker",
    type: "Daily Checklist",
    icon: CheckSquare,
    duration: "5 min daily",
    content: {
      intro: "Executive Directors aren't built overnight – they're built one day at a time. This daily tracker ensures you're taking the consistent actions that lead to ED rank. Check off each item daily and watch your progress compound.",
      sections: [
        {
          title: "The ED Mindset",
          content: "Executive Director isn't just a rank – it's a level of leadership. EDs show up consistently, support their teams, and lead by example. This tracker helps you develop ED habits BEFORE you hit the rank.",
          edQualities: [
            { quality: "Consistency Over Intensity", description: "EDs don't sprint and crash. They show up every single day, even when it's hard." },
            { quality: "Team-First Thinking", description: "EDs understand their success comes through their team's success." },
            { quality: "Data-Driven Decisions", description: "EDs know their numbers and make strategic choices based on data." },
            { quality: "Resilience", description: "EDs face rejection and setbacks, but they don't quit. They adjust and continue." },
          ],
        },
        {
          title: "Your Daily ED Tracker",
          isDailyTracker: true,
          categories: [
            { category: "Personal Development", color: "#e8f5e9", borderColor: "#4caf50", items: [{ id: "pd1", task: "Review my MAP goals (2 min)", priority: "HIGH" }, { id: "pd2", task: "Personal development reading/listening (15+ min)", priority: "HIGH" }, { id: "pd3", task: "Mindset practice (gratitude, visualization, affirmations)", priority: "MEDIUM" }] },
            { category: "Client Acquisition", color: "#e3f2fd", borderColor: "#2196f3", items: [{ id: "ca1", task: "Start 5+ new conversations", priority: "HIGH" }, { id: "ca2", task: "Follow up with all pending prospects", priority: "HIGH" }, { id: "ca3", task: "Post value-driven content on social media", priority: "MEDIUM" }, { id: "ca4", task: "Schedule or conduct Health Assessments", priority: "HIGH" }] },
            { category: "Client Support", color: "#fff8e1", borderColor: "#ffc107", items: [{ id: "cs1", task: "Check in with all active clients", priority: "HIGH" }, { id: "cs2", task: "Send encouraging texts/messages", priority: "MEDIUM" }, { id: "cs3", task: "Address any client questions or concerns", priority: "HIGH" }] },
            { category: "Team Development", color: "#fce4ec", borderColor: "#e91e63", items: [{ id: "td1", task: "Check in with team members on their goals", priority: "HIGH" }, { id: "td2", task: "Recognize team wins (shoutouts, celebrations)", priority: "MEDIUM" }, { id: "td3", task: "Support a team member with a call or strategy session", priority: "MEDIUM" }, { id: "td4", task: "Review team projections in Connect", priority: "HIGH" }] },
            { category: "Business Management", color: "#f3e5f5", borderColor: "#9c27b0", items: [{ id: "bm1", task: "Check Connect dashboard (FQV, projections)", priority: "HIGH" }, { id: "bm2", task: "Review and update your pipeline/prospect list", priority: "MEDIUM" }, { id: "bm3", task: "Plan tomorrow's priorities before bed", priority: "HIGH" }] },
          ],
        },
        {
          title: "Weekly ED Power Hours",
          weeklyPowerHours: [
            { day: "Monday", focus: "Weekly Planning", tasks: ["Review last week's results", "Set this week's priorities", "Check team projections"], duration: "30-45 min" },
            { day: "Wednesday", focus: "Team Development", tasks: ["1-on-1 check-ins with key team members", "Training or strategy calls", "Recognition and celebration"], duration: "60 min" },
            { day: "Friday", focus: "Business Review", tasks: ["Review Connect reports", "Assess progress toward goals", "Adjust weekend/next week plans"], duration: "30 min" },
            { day: "Sunday", focus: "Week Ahead Prep", tasks: ["Schedule the week's activities", "Prepare content for social media", "Set intentions for the week"], duration: "30 min" },
          ],
        },
        {
          title: "Tracking Your Consistency",
          content: "Print this tracker or use a notebook to check off daily items. At the end of each week, count your completion rate. EDs aim for 80%+ consistency.",
          consistencyLevels: [
            { level: "90-100%", status: "ED-Level Consistency", description: "You're operating like an Executive Director. Keep it up!", color: "#4caf50" },
            { level: "80-89%", status: "Strong Performance", description: "Great work! Small improvements will push you to the next level.", color: "#8bc34a" },
            { level: "70-79%", status: "Room to Grow", description: "You're building habits. Identify what's holding you back.", color: "#ffc107" },
            { level: "Below 70%", status: "Needs Focus", description: "Time to recommit. What support do you need to stay consistent?", color: "#f44336" },
          ],
        },
      ],
      keyTakeaways: ["EDs are built through daily consistent actions, not occasional big pushes", "Focus on all 5 categories: Development, Acquisition, Support, Team, Business", "Track your consistency and aim for 80%+ daily completion", "Use weekly Power Hours for deeper strategic work"],
    },
  },
  {
    id: "5.2.3",
    title: "Understanding Points",
    type: "Training",
    icon: Calculator,
    duration: "10 min read",
    content: {
      intro: "Points are the currency of rank advancement in OPTAVIA. Understanding how points work – and how to earn them strategically – is essential for growing from Senior Coach to Executive Director and beyond.",
      sections: [
        {
          title: "What Are Points?",
          content: "Points (also called Qualifying Points or QP) measure your organization's productivity. They're used to determine rank qualifications, bonuses, and incentives.",
          pointsDefinition: {
            headline: "The Two Ways to Earn Points",
            methods: [
              { method: "$1,200 FQV = 1 Point", description: "Every $1,200 of Field Qualifying Volume (from you, your clients, and team) equals 1 point", icon: "💰", example: "$6,000 FQV = 5 Points" },
              { method: "1 Senior Coach Team Member = 1 Point", description: "Each personally-sponsored coach who achieves Senior Coach rank gives you 1 point", icon: "👤", example: "3 Senior Coaches on your team = 3 Points" },
            ],
            note: "Both methods count! A coach can earn points through volume AND team development simultaneously.",
          },
        },
        {
          title: "The Point Math",
          pointMath: {
            volumeExample: { title: "Volume-Based Points", scenarios: [{ fqv: "$1,200", points: "1 Point" }, { fqv: "$2,400", points: "2 Points" }, { fqv: "$6,000", points: "5 Points" }, { fqv: "$12,000", points: "10 Points" }, { fqv: "$24,000", points: "20 Points" }] },
            teamExample: { title: "Team-Based Points", scenarios: [{ team: "1 Senior Coach", points: "1 Point" }, { team: "3 Senior Coaches", points: "3 Points" }, { team: "5 Senior Coaches", points: "5 Points" }, { team: "10 Senior Coaches", points: "10 Points" }] },
            combinedExample: { title: "Combined Example", coach: "Coach Sarah", breakdown: [{ source: "Personal FQV: $3,600", points: 3 }, { source: "Team member Alex (SC rank)", points: 1 }, { source: "Team member Jordan (SC rank)", points: 1 }, { source: "TOTAL POINTS", points: 5 }] },
          },
        },
        {
          title: "Points and Rank Requirements",
          rankRequirements: [
            { rank: "Senior Coach", points: "N/A", requirement: "3 personally-sponsored clients (or 1 client + 1 coach)", note: "Points start mattering after Senior Coach" },
            { rank: "Certified Coach", points: "Varies", requirement: "Additional clients + certification training", note: "Check current requirements in Connect" },
            { rank: "Manager", points: "Team building focus", requirement: "Volume + team development requirements", note: "Points become increasingly important" },
            { rank: "Director", points: "Higher thresholds", requirement: "Significant team volume + multiple legs", note: "Team-based points accelerate growth" },
            { rank: "Executive Director", points: "Major milestone", requirement: "Large organization + consistent production", note: "Both volume and team points typically needed" },
          ],
          disclaimer: "Point requirements may change. Always verify current requirements in OPTAVIA Connect or with your upline.",
        },
        {
          title: "Strategic Point Building",
          strategies: [
            { strategy: "Build Both Paths Simultaneously", description: "Don't rely only on volume OR only on team. The fastest path to ED uses both.", icon: "🔀", tip: "While growing your client base, also help team members reach Senior Coach" },
            { strategy: "Help Team Members Promote", description: "Every team member you help reach Senior Coach = 1 point for you. Their success is your success.", icon: "🤝", tip: "Focus on helping 1-2 team members at a time rather than spreading thin" },
            { strategy: "Focus on Client Retention", description: "Retained clients provide consistent volume month after month. Volume points compound.", icon: "🔄", tip: "It's easier to keep a client than find a new one – retention is key" },
            { strategy: "Know Your Gap", description: "How many points do you need? What's the fastest path to close the gap?", icon: "🎯", tip: "Review your point status weekly and plan accordingly" },
          ],
        },
        { title: "Points Planning Calculator", isCalculator: true },
        {
          title: "Common Points Questions",
          faqs: [
            { question: "Do my personal orders count toward points?", answer: "Your personal orders contribute to your FQV (volume), which then converts to points at the $1,200 = 1 point rate." },
            { question: "What happens if a team member drops from Senior Coach?", answer: "You would lose that team-based point. This is why helping team members stay consistent is so important." },
            { question: "Do points reset each month?", answer: "Points are typically calculated within qualification periods. Check current policies in Connect for specifics." },
            { question: "How do I see my current points?", answer: "Log into OPTAVIA Connect and navigate to your Business Dashboard or Rank Qualification section." },
            { question: "Can I earn partial points?", answer: "Typically no – you need the full $1,200 FQV for each volume-based point. Plan to hit full point thresholds." },
          ],
        },
        {
          title: "The Power of Points Thinking",
          mindset: [
            { insight: "Every Client Matters", description: "A client ordering $400/month x 3 months = $1,200 = 1 point. Consistent clients add up!" },
            { insight: "Team Building Accelerates Growth", description: "Helping 5 team members hit Senior Coach = 5 points. That's like adding $6,000 FQV instantly." },
            { insight: "Points Create Compound Growth", description: "Each Senior Coach you develop can then develop THEIR team, multiplying your organization's point-earning potential." },
            { insight: "Track Weekly, Act Daily", description: "Know your point status and take daily actions that contribute to point goals." },
          ],
        },
      ],
      keyTakeaways: ["$1,200 FQV = 1 Point, 1 Senior Coach team member = 1 Point", "Build points through BOTH volume and team development", "Help team members reach Senior Coach to accelerate your point growth", "Track your points weekly and know exactly what you need for your next rank"],
    },
  },
]

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

export function BusinessPlanningContent() {
  const { toast } = useToast()
  const { user } = useAuth()
  const { completedResources, toggleCompletedResource } = useSupabaseData(user)
  const [expandedLesson, setExpandedLesson] = useState(lessons[0].id)
  const [dailyChecks, setDailyChecks] = useState<Record<string, boolean>>({})
  const [mapInputs, setMapInputs] = useState<Record<string, string>>({})

  const getResourceId = (lessonId: string) => `business-planning-${lessonId}`

  const completedLessons = new Set(lessons.map((lesson) => lesson.id).filter((lessonId) => completedResources.includes(getResourceId(lessonId))))

  useEffect(() => {
    const saved = localStorage.getItem("businessPlanningExpanded")
    if (saved) {
      try {
        const lessonId = JSON.parse(saved)
        if (lessons.some((l) => l.id === lessonId)) {
          setExpandedLesson(lessonId)
        }
      } catch (e) {
        console.error("Failed to load expanded lesson", e)
      }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("businessPlanningExpanded", JSON.stringify(expandedLesson))
  }, [expandedLesson])

  const toggleComplete = async (lessonId: string) => {
    if (!user) {
      toast({ title: "Please sign in", description: "You need to be signed in to track your progress.", variant: "destructive" })
      return
    }

    const resourceId = getResourceId(lessonId)
    await toggleCompletedResource(resourceId)

    const isNowCompleted = !completedLessons.has(lessonId)
    toast({ title: isNowCompleted ? "Lesson completed!" : "Lesson unmarked", description: isNowCompleted ? "Great progress! Your coach can see this." : "You can complete it later." })
  }

  const toggleDailyCheck = (day: string, itemId: string) => {
    const key = `${day}-${itemId}`
    setDailyChecks((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const handleMapInput = (field: string, value: string) => {
    setMapInputs((prev) => ({ ...prev, [field]: value }))
  }

  const currentLessonIndex = lessons.findIndex((l) => l.id === expandedLesson)
  const currentLesson = lessons[currentLessonIndex]
  const prevLesson = currentLessonIndex > 0 ? lessons[currentLessonIndex - 1] : null
  const nextLesson = currentLessonIndex < lessons.length - 1 ? lessons[currentLessonIndex + 1] : null

  const completedCount = completedLessons.size
  const progressPercent = lessons.length > 0 ? Math.round((completedCount / lessons.length) * 100) : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-[hsl(var(--optavia-green))] to-[#006633] text-white py-8 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 text-sm opacity-90 mb-2 uppercase tracking-wide">
            <span>Training Center</span>
            <ChevronRight className="h-4 w-4" />
            <span>Phase 5: Senior Coach to Executive Director</span>
            <ChevronRight className="h-4 w-4" />
            <span className="font-semibold">Module 5.2</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Business Planning</h1>
          <p className="text-lg opacity-90 max-w-2xl">Create intentional plans for rank advancement with proven tools and frameworks.</p>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid lg:grid-cols-[320px_1fr] gap-8">
          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Phase Badge */}
            <Card className="bg-gradient-to-br from-indigo-900 to-indigo-800 text-white text-center border-0">
              <CardContent className="pt-6">
                <div className="text-4xl mb-2">📋</div>
                <div className="font-bold text-sm">PHASE 5</div>
                <div className="text-sm opacity-90">Senior Coach → Executive Director</div>
              </CardContent>
            </Card>

            {/* Progress Card */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-sm font-semibold text-optavia-dark">Module Progress</CardTitle>
                  <span className="text-sm font-semibold text-[hsl(var(--optavia-green))]">
                    {completedCount}/{lessons.length} Complete
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <Progress value={progressPercent} className="h-2" />
              </CardContent>
            </Card>

            {/* Lesson List */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xs font-semibold text-optavia-gray uppercase tracking-wide">Lessons in this Module</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {lessons.map((lesson) => {
                  const Icon = lesson.icon
                  const isActive = expandedLesson === lesson.id
                  const isComplete = completedLessons.has(lesson.id)

                  return (
                    <button key={lesson.id} onClick={() => setExpandedLesson(lesson.id)} className={`w-full p-4 flex items-start gap-3 border-b border-gray-100 last:border-b-0 transition-colors text-left ${isActive ? "bg-green-50 border-l-4 border-l-[hsl(var(--optavia-green))]" : "hover:bg-gray-50"}`}>
                      <div className="mt-1">{isComplete ? <CheckCircle className="h-5 w-5 text-[hsl(var(--optavia-green))]" /> : <Circle className="h-5 w-5 text-gray-300" />}</div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-[hsl(var(--optavia-green))] mb-1">{lesson.id}</div>
                        <div className={`text-sm font-semibold mb-2 ${isActive ? "text-[hsl(var(--optavia-green))]" : "text-optavia-dark"}`}>{lesson.title}</div>
                        <div className="flex items-center gap-3 text-xs text-optavia-gray">
                          <Badge variant="outline" className="text-xs bg-gray-50">
                            <Icon className="h-3 w-3 mr-1" />
                            {lesson.type}
                          </Badge>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {lesson.duration}
                          </span>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </CardContent>
            </Card>

            {/* Quote */}
            <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-300">
              <CardContent className="pt-5">
                <p className="text-sm text-amber-900 italic leading-relaxed mb-2">&quot;A goal without a plan is just a wish. A plan without action is just a dream.&quot;</p>
                <p className="text-xs text-amber-700 font-semibold">— The Path to ED</p>
              </CardContent>
            </Card>
          </aside>

          {/* Main Content */}
          <main>
            <Card>
              {/* Content Header */}
              <CardHeader className="border-b">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-xs font-semibold text-[hsl(var(--optavia-green))] uppercase tracking-wide mb-2">Lesson {currentLesson.id}</div>
                    <CardTitle className="text-2xl font-bold text-optavia-dark">{currentLesson.title}</CardTitle>
                  </div>
                  <Button onClick={() => toggleComplete(currentLesson.id)} variant={completedLessons.has(currentLesson.id) ? "default" : "outline"} className={completedLessons.has(currentLesson.id) ? "bg-[hsl(var(--optavia-green))] hover:bg-[hsl(var(--optavia-green-dark))]" : ""}>
                    {completedLessons.has(currentLesson.id) ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Completed
                      </>
                    ) : (
                      <>
                        <Circle className="h-4 w-4 mr-2" />
                        Mark Complete
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="p-8">
                {/* Intro */}
                <div className="bg-green-50 border-l-4 border-[hsl(var(--optavia-green))] p-5 rounded-lg mb-8">
                  <p className="text-base leading-relaxed text-optavia-dark">{currentLesson.content.intro}</p>
                </div>

                {/* Sections */}
                {currentLesson.content.sections.map((section, idx) => (
                  <div key={idx} className="mb-10">
                    <h3 className="text-lg font-bold text-optavia-dark mb-4 flex items-center gap-3">
                      <span className="w-7 h-7 rounded-full bg-gradient-to-br from-[hsl(var(--optavia-green))] to-[hsl(var(--optavia-green-dark))] text-white flex items-center justify-center text-sm font-bold">{idx + 1}</span>
                      {section.title}
                    </h3>

                    {section.content && <p className="text-base leading-relaxed text-optavia-gray mb-5">{section.content}</p>}

                    {/* Benefits */}
                    {section.benefits && (
                      <div className="grid grid-cols-4 gap-3">
                        {section.benefits.map((item, i) => (
                          <div key={i} className="p-4 bg-green-50 rounded-lg text-center">
                            <span className="text-3xl block mb-2">{item.icon}</span>
                            <div className="font-bold text-green-800 mb-1">{item.benefit}</div>
                            <div className="text-xs text-green-900">{item.description}</div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* MAP Section */}
                    {section.isMapSection && (
                      <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border-2 border-green-300">
                        <div className="text-center mb-6 pb-4 border-b-2 border-dashed border-green-300">
                          <div className="text-xs text-optavia-gray mb-1">MONTHLY ACTION PLAN (MAP)</div>
                          <div className="text-2xl font-bold text-[hsl(var(--optavia-green))]">📍 Your Roadmap to Success</div>
                          <div className="text-sm text-optavia-gray mt-2">Month: _________________ Year: _________</div>
                        </div>

                        <div className="mb-6">
                          <div className="text-sm font-bold text-optavia-dark mb-3 flex items-center gap-2">
                            <Flag className="h-4 w-4 text-[hsl(var(--optavia-green))]" />
                            SECTION 1: Where Am I Now?
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-xs text-optavia-gray block mb-1">Current Rank</label>
                              <Input value={mapInputs.currentRank || ""} onChange={(e) => handleMapInput("currentRank", e.target.value)} placeholder="e.g., Senior Coach" className="bg-white" />
                            </div>
                            <div>
                              <label className="text-xs text-optavia-gray block mb-1">Current FQV</label>
                              <Input value={mapInputs.currentFQV || ""} onChange={(e) => handleMapInput("currentFQV", e.target.value)} placeholder="e.g., $4,800" className="bg-white" />
                            </div>
                            <div>
                              <label className="text-xs text-optavia-gray block mb-1">Current Points</label>
                              <Input value={mapInputs.currentPoints || ""} onChange={(e) => handleMapInput("currentPoints", e.target.value)} placeholder="e.g., 4" className="bg-white" />
                            </div>
                            <div>
                              <label className="text-xs text-optavia-gray block mb-1">Active Clients</label>
                              <Input value={mapInputs.activeClients || ""} onChange={(e) => handleMapInput("activeClients", e.target.value)} placeholder="e.g., 8" className="bg-white" />
                            </div>
                          </div>
                        </div>

                        <div className="mb-6">
                          <div className="text-sm font-bold text-optavia-dark mb-3 flex items-center gap-2">
                            <Target className="h-4 w-4 text-[hsl(var(--optavia-green))]" />
                            SECTION 2: Where Am I Going This Month?
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-xs text-optavia-gray block mb-1">Target Rank</label>
                              <Input value={mapInputs.targetRank || ""} onChange={(e) => handleMapInput("targetRank", e.target.value)} placeholder="e.g., Certified Coach" className="bg-white" />
                            </div>
                            <div>
                              <label className="text-xs text-optavia-gray block mb-1">Target FQV</label>
                              <Input value={mapInputs.targetFQV || ""} onChange={(e) => handleMapInput("targetFQV", e.target.value)} placeholder="e.g., $7,200" className="bg-white" />
                            </div>
                            <div>
                              <label className="text-xs text-optavia-gray block mb-1">Target Points</label>
                              <Input value={mapInputs.targetPoints || ""} onChange={(e) => handleMapInput("targetPoints", e.target.value)} placeholder="e.g., 6" className="bg-white" />
                            </div>
                            <div>
                              <label className="text-xs text-optavia-gray block mb-1">Income Goal</label>
                              <Input value={mapInputs.incomeGoal || ""} onChange={(e) => handleMapInput("incomeGoal", e.target.value)} placeholder="e.g., $1,500" className="bg-white" />
                            </div>
                          </div>
                        </div>

                        <div className="mb-6">
                          <div className="text-sm font-bold text-optavia-dark mb-3 flex items-center gap-2">
                            <Zap className="h-4 w-4 text-[hsl(var(--optavia-green))]" />
                            SECTION 3: Activity Goals
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-xs text-optavia-gray block mb-1">New Clients to Acquire</label>
                              <Input value={mapInputs.clientGoal || ""} onChange={(e) => handleMapInput("clientGoal", e.target.value)} placeholder="e.g., 3" className="bg-white" />
                            </div>
                            <div>
                              <label className="text-xs text-optavia-gray block mb-1">Health Assessments to Complete</label>
                              <Input value={mapInputs.haGoal || ""} onChange={(e) => handleMapInput("haGoal", e.target.value)} placeholder="e.g., 8" className="bg-white" />
                            </div>
                            <div>
                              <label className="text-xs text-optavia-gray block mb-1">New Conversations per Day</label>
                              <Input value={mapInputs.conversationGoal || ""} onChange={(e) => handleMapInput("conversationGoal", e.target.value)} placeholder="e.g., 5" className="bg-white" />
                            </div>
                            <div>
                              <label className="text-xs text-optavia-gray block mb-1">Team Members to Support to SC</label>
                              <Input value={mapInputs.teamGoal || ""} onChange={(e) => handleMapInput("teamGoal", e.target.value)} placeholder="e.g., 1" className="bg-white" />
                            </div>
                          </div>
                        </div>

                        <div className="mb-6">
                          <div className="text-sm font-bold text-optavia-dark mb-3 flex items-center gap-2">
                            <Users className="h-4 w-4 text-[hsl(var(--optavia-green))]" />
                            SECTION 4: Challenges & Support
                          </div>
                          <div className="mb-3">
                            <label className="text-xs text-optavia-gray block mb-1">My biggest challenge this month will be:</label>
                            <Textarea value={mapInputs.biggestChallenge || ""} onChange={(e) => handleMapInput("biggestChallenge", e.target.value)} placeholder="What obstacle do you anticipate? How will you overcome it?" className="bg-white" rows={2} />
                          </div>
                          <div>
                            <label className="text-xs text-optavia-gray block mb-1">The support I need from my mentor/team:</label>
                            <Textarea value={mapInputs.supportNeeded || ""} onChange={(e) => handleMapInput("supportNeeded", e.target.value)} placeholder="What help do you need? Be specific!" className="bg-white" rows={2} />
                          </div>
                        </div>

                        <div className="p-4 bg-gradient-to-r from-[hsl(var(--optavia-green))] to-[hsl(var(--optavia-green-dark))] rounded-lg text-white">
                          <div className="text-sm font-bold mb-2 flex items-center gap-2">
                            <Trophy className="h-4 w-4" />
                            MY COMMITMENT
                          </div>
                          <p className="text-sm opacity-95 mb-3">&quot;I commit to following this plan with intention and consistency. I will review my progress weekly and take daily actions toward my goals.&quot;</p>
                          <div className="flex gap-4">
                            <div className="flex-1">
                              <label className="text-xs opacity-90 block mb-1">Signature</label>
                              <Input value={mapInputs.commitment || ""} onChange={(e) => handleMapInput("commitment", e.target.value)} placeholder="Type your name" className="bg-white/20 border-white/50 text-white placeholder:text-white/70" />
                            </div>
                            <div className="w-32">
                              <label className="text-xs opacity-90 block mb-1">Date</label>
                              <Input placeholder="MM/DD/YYYY" className="bg-white/20 border-white/50 text-white placeholder:text-white/70" />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* How To */}
                    {section.howTo && (
                      <div className="space-y-2">
                        {section.howTo.map((item, i) => (
                          <div key={i} className={`flex gap-3 p-4 rounded-lg ${i % 2 === 0 ? "bg-gray-50" : "bg-white"}`}>
                            <div className="font-bold text-[hsl(var(--optavia-green))] text-sm min-w-5">{item.step.split(".")[0]}.</div>
                            <div>
                              <div className="font-semibold text-optavia-dark mb-1">{item.step.split(". ")[1]}</div>
                              <div className="text-sm text-optavia-gray">{item.description}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Best Practices */}
                    {section.bestPractices && (
                      <div className="grid grid-cols-2 gap-3">
                        {section.bestPractices.map((item, i) => (
                          <div key={i} className="p-4 bg-green-50 rounded-lg border border-green-200">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-lg">{item.icon}</span>
                              <span className="font-bold text-green-800">{item.practice}</span>
                            </div>
                            <div className="text-sm text-green-900">{item.description}</div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* ED Qualities */}
                    {section.edQualities && (
                      <div className="grid grid-cols-2 gap-3">
                        {section.edQualities.map((item, i) => (
                          <div key={i} className="p-4 bg-gradient-to-br from-indigo-900 to-indigo-800 rounded-lg text-white">
                            <div className="font-bold mb-1">{item.quality}</div>
                            <div className="text-sm opacity-90">{item.description}</div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Daily Tracker */}
                    {section.isDailyTracker && section.categories && (
                      <div className="bg-gray-50 rounded-xl p-6">
                        <div className="flex gap-2 mb-5 justify-center">
                          {days.map((day) => (
                            <div key={day} className="w-12 py-2 text-center bg-white rounded-lg text-xs font-semibold text-optavia-gray border border-gray-200">
                              {day}
                            </div>
                          ))}
                        </div>

                        {section.categories.map((cat, catIdx) => (
                          <div key={catIdx} className="mb-5">
                            <div className="px-4 py-2 rounded-t-lg font-bold text-optavia-dark text-sm" style={{ backgroundColor: cat.color, borderLeft: `4px solid ${cat.borderColor}` }}>
                              {cat.category}
                            </div>
                            <div className="bg-white rounded-b-lg border border-gray-200 border-t-0">
                              {cat.items.map((item, itemIdx) => (
                                <div key={itemIdx} className="flex items-center p-3 border-b border-gray-100 last:border-b-0">
                                  <div className="flex-1 flex items-center gap-2">
                                    <Badge variant="outline" className={`text-[10px] font-bold ${item.priority === "HIGH" ? "bg-red-50 text-red-700 border-red-300" : "bg-amber-50 text-amber-700 border-amber-300"}`}>
                                      {item.priority}
                                    </Badge>
                                    <span className="text-sm text-optavia-gray">{item.task}</span>
                                  </div>
                                  <div className="flex gap-1">
                                    {days.map((day) => (
                                      <button key={day} onClick={() => toggleDailyCheck(day, item.id)} className={`w-7 h-7 rounded border flex items-center justify-center transition-colors ${dailyChecks[`${day}-${item.id}`] ? "bg-green-100 border-[hsl(var(--optavia-green))]" : "bg-white border-gray-200 hover:border-gray-300"}`}>
                                        {dailyChecks[`${day}-${item.id}`] && <Check className="h-4 w-4 text-[hsl(var(--optavia-green))]" />}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Weekly Power Hours */}
                    {section.weeklyPowerHours && (
                      <div className="grid grid-cols-4 gap-3">
                        {section.weeklyPowerHours.map((item, i) => (
                          <div key={i} className="p-4 bg-blue-50 rounded-lg">
                            <div className="font-bold text-blue-800 mb-1">{item.day}</div>
                            <div className="text-xs text-blue-700 font-semibold mb-2">{item.focus}</div>
                            <div className="mb-2">
                              {item.tasks.map((task, j) => (
                                <div key={j} className="text-xs text-optavia-gray mb-1">
                                  • {task}
                                </div>
                              ))}
                            </div>
                            <Badge variant="outline" className="text-xs bg-white">
                              ⏱️ {item.duration}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Consistency Levels */}
                    {section.consistencyLevels && (
                      <div className="space-y-2">
                        {section.consistencyLevels.map((level, i) => (
                          <div key={i} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg" style={{ borderLeft: `4px solid ${level.color}` }}>
                            <div className="font-bold min-w-20" style={{ color: level.color }}>
                              {level.level}
                            </div>
                            <div className="flex-1">
                              <div className="font-semibold text-optavia-dark mb-1">{level.status}</div>
                              <div className="text-sm text-optavia-gray">{level.description}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Points Definition */}
                    {section.pointsDefinition && (
                      <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6">
                        <div className="text-center mb-5">
                          <div className="text-lg font-bold text-green-800">{section.pointsDefinition.headline}</div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          {section.pointsDefinition.methods.map((method, i) => (
                            <div key={i} className="p-5 bg-white rounded-xl text-center">
                              <span className="text-4xl block mb-3">{method.icon}</span>
                              <div className="text-lg font-bold text-[hsl(var(--optavia-green))] mb-2">{method.method}</div>
                              <div className="text-sm text-optavia-gray mb-3">{method.description}</div>
                              <div className="px-3 py-2 bg-green-50 rounded-lg text-xs text-green-800 font-medium">Example: {method.example}</div>
                            </div>
                          ))}
                        </div>
                        <div className="p-3 bg-white/70 rounded-lg text-center text-sm text-green-900">
                          <Lightbulb className="h-4 w-4 inline mr-2" />
                          {section.pointsDefinition.note}
                        </div>
                      </div>
                    )}

                    {/* Point Math */}
                    {section.pointMath && (
                      <div className="grid grid-cols-2 gap-4 mb-5">
                        <div className="p-5 bg-green-50 rounded-xl">
                          <div className="font-bold text-green-800 mb-3">{section.pointMath.volumeExample.title}</div>
                          {section.pointMath.volumeExample.scenarios.map((s, i) => (
                            <div key={i} className="flex justify-between p-2 bg-white rounded-md mb-1">
                              <span className="text-optavia-gray">{s.fqv} FQV</span>
                              <span className="font-semibold text-[hsl(var(--optavia-green))]">{s.points}</span>
                            </div>
                          ))}
                        </div>
                        <div className="p-5 bg-blue-50 rounded-xl">
                          <div className="font-bold text-blue-800 mb-3">{section.pointMath.teamExample.title}</div>
                          {section.pointMath.teamExample.scenarios.map((s, i) => (
                            <div key={i} className="flex justify-between p-2 bg-white rounded-md mb-1">
                              <span className="text-optavia-gray">{s.team}</span>
                              <span className="font-semibold text-blue-600">{s.points}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Combined Example */}
                    {section.pointMath?.combinedExample && (
                      <div className="p-5 bg-gradient-to-r from-amber-50 to-amber-100 rounded-xl border-2 border-amber-300 mb-5">
                        <div className="font-bold text-amber-700 mb-3 flex items-center gap-2">
                          <Calculator className="h-5 w-5" />
                          {section.pointMath.combinedExample.title}: {section.pointMath.combinedExample.coach}
                        </div>
                        {section.pointMath.combinedExample.breakdown.map((item, i) => (
                          <div key={i} className={`flex justify-between p-3 rounded-md mb-1 ${item.source === "TOTAL POINTS" ? "bg-[hsl(var(--optavia-green))] text-white font-bold" : "bg-white"}`}>
                            <span>{item.source}</span>
                            <span className="font-semibold">
                              +{item.points} {item.points === 1 ? "point" : "points"}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Rank Requirements */}
                    {section.rankRequirements && (
                      <div className="mb-4">
                        {section.rankRequirements.map((rank, i) => (
                          <div key={i} className={`p-4 rounded-lg mb-2 ${i % 2 === 0 ? "bg-gray-50" : "bg-white"}`} style={{ borderLeft: i === 4 ? "4px solid hsl(var(--optavia-green))" : "4px solid #e0e0e0" }}>
                            <div className="flex justify-between items-start mb-1">
                              <div className={`font-bold ${i === 4 ? "text-[hsl(var(--optavia-green))]" : "text-optavia-dark"}`}>{rank.rank}</div>
                              <Badge variant="outline" className="text-xs bg-gray-100">
                                {rank.points}
                              </Badge>
                            </div>
                            <div className="text-sm text-optavia-gray mb-1">{rank.requirement}</div>
                            <div className="text-xs text-optavia-gray italic">{rank.note}</div>
                          </div>
                        ))}
                        {section.disclaimer && (
                          <div className="p-3 bg-amber-50 rounded-lg text-xs text-amber-700 text-center mt-3">⚠️ {section.disclaimer}</div>
                        )}
                      </div>
                    )}

                    {/* Strategies */}
                    {section.strategies && (
                      <div className="space-y-3">
                        {section.strategies.map((strat, i) => (
                          <div key={i} className="p-4 bg-green-50 rounded-lg border-l-4 border-[hsl(var(--optavia-green))]">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-xl">{strat.icon}</span>
                              <span className="font-bold text-green-800">{strat.strategy}</span>
                            </div>
                            <div className="text-sm text-optavia-gray mb-2">{strat.description}</div>
                            <div className="p-2 bg-white rounded-md text-xs text-[hsl(var(--optavia-green))]">💡 Tip: {strat.tip}</div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Calculator */}
                    {section.isCalculator && (
                      <div className="bg-gray-50 rounded-xl p-6">
                        <div className="text-center mb-5">
                          <Calculator className="h-8 w-8 text-[hsl(var(--optavia-green))] mx-auto" />
                          <div className="font-bold text-optavia-dark mt-2">Quick Points Calculator</div>
                          <div className="text-sm text-optavia-gray">Use this to estimate your points potential</div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-5 bg-green-50 rounded-xl">
                            <div className="font-semibold text-green-800 mb-3">Volume-Based Points</div>
                            <div className="mb-2">
                              <label className="text-xs text-optavia-gray">Your FQV ($)</label>
                              <Input type="number" placeholder="e.g., 6000" className="mt-1 bg-white" />
                            </div>
                            <div className="p-3 bg-white rounded-lg text-center">
                              <div className="text-xs text-optavia-gray">Volume Points</div>
                              <div className="text-2xl font-bold text-[hsl(var(--optavia-green))]">÷ $1,200 = ? pts</div>
                            </div>
                          </div>
                          <div className="p-5 bg-blue-50 rounded-xl">
                            <div className="font-semibold text-blue-800 mb-3">Team-Based Points</div>
                            <div className="mb-2">
                              <label className="text-xs text-optavia-gray"># of Senior Coaches</label>
                              <Input type="number" placeholder="e.g., 3" className="mt-1 bg-white" />
                            </div>
                            <div className="p-3 bg-white rounded-lg text-center">
                              <div className="text-xs text-optavia-gray">Team Points</div>
                              <div className="text-2xl font-bold text-blue-600">× 1 = ? pts</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* FAQs */}
                    {section.faqs && (
                      <div className="space-y-2">
                        {section.faqs.map((faq, i) => (
                          <div key={i} className={`p-4 rounded-lg border border-gray-200 ${i % 2 === 0 ? "bg-gray-50" : "bg-white"}`}>
                            <div className="font-semibold text-optavia-dark mb-2">❓ {faq.question}</div>
                            <div className="text-sm text-optavia-gray">{faq.answer}</div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Mindset */}
                    {section.mindset && (
                      <div className="grid grid-cols-2 gap-3">
                        {section.mindset.map((item, i) => (
                          <div key={i} className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                            <div className="font-bold text-blue-800 mb-2">💡 {item.insight}</div>
                            <div className="text-sm text-blue-900">{item.description}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {/* Key Takeaways */}
                {currentLesson.content.keyTakeaways && (
                  <div className="mt-10 p-6 bg-gradient-to-r from-amber-50 to-amber-100 rounded-lg border border-amber-200">
                    <h4 className="text-base font-bold text-amber-900 mb-4 flex items-center gap-2">
                      <Star className="h-5 w-5 fill-amber-600 text-amber-600" />
                      Key Takeaways
                    </h4>
                    <ul className="space-y-2">
                      {currentLesson.content.keyTakeaways.map((takeaway, i) => (
                        <li key={i} className="text-sm text-amber-900 flex items-start gap-2">
                          <span className="text-amber-600 mt-1">•</span>
                          <span>{takeaway}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>

              {/* Navigation Footer */}
              <div className="border-t bg-gray-50 p-6 flex justify-between items-center">
                {prevLesson ? (
                  <Button variant="outline" onClick={() => setExpandedLesson(prevLesson.id)}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Previous
                  </Button>
                ) : (
                  <Button variant="outline" onClick={() => (window.location.href = "/training/connect-business")}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Module 5.1
                  </Button>
                )}

                {nextLesson ? (
                  <Button onClick={() => setExpandedLesson(nextLesson.id)} className="bg-[hsl(var(--optavia-green))] hover:bg-[hsl(var(--optavia-green-dark))] text-white">
                    Next: {nextLesson.title.split(" ").slice(0, 3).join(" ")}...
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button className="bg-[hsl(var(--optavia-green))] hover:bg-[hsl(var(--optavia-green-dark))] text-white" onClick={() => (window.location.href = "/training/advanced-client-support")}>
                    Continue to Module 5.3
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                )}
              </div>
            </Card>
          </main>
        </div>
      </div>
    </div>
  )
}
