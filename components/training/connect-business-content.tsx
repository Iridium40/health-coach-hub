"use client"

import { useState, useEffect } from "react"
import { CheckCircle, Circle, ChevronRight, Clock, Star, ArrowLeft, ArrowRight, Play, Monitor, Calculator, Calendar, HelpCircle, Lightbulb, AlertTriangle, Check, Award } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"
import { useSupabaseData } from "@/hooks/use-supabase-data"

interface Feature {
  feature: string
  description: string
  icon: string
}

interface DashboardSection {
  section: string
  purpose: string
  keyMetrics: string[]
  frequency: string
}

interface Report {
  report: string
  what: string
  why: string
  when: string
}

interface ClientFeature {
  feature: string
  description: string
  actionable: string
}

interface BestPractice {
  practice: string
  description: string
  icon: string
}

interface FAQ {
  question: string
  answer: string
}

interface Benefit {
  benefit: string
  description: string
  icon: string
}

interface Step {
  step: number
  title: string
  instruction: string
  tip: string
}

interface MathExample {
  goal: string
  projected: string
  gap: string
  daysLeft: string
}

interface MathBreakdown {
  source: string
  volume: string
}

interface RedFlag {
  flag: string
  meaning: string
  action: string
}

interface Routine {
  day: string
  action: string
  time: string
}

interface Stake {
  stake: string
  description: string
  impact: string
}

interface Comparison {
  strategic: { title: string; characteristics: string[]; color: string }
  desperate: { title: string; characteristics: string[]; color: string }
}

interface TimelinePeriod {
  period: string
  title: string
  actions: string[]
}

interface ClientStrategy {
  strategy: string
  description: string
  script: string
  ethical: boolean
}

interface TeamStrategy {
  strategy: string
  description: string
  approach: string
}

interface Dont {
  dont: string
  why: string
}

interface NextMonthAction {
  action: string
  description: string
}

interface Mindset {
  mindset: string
  description: string
}

interface VideoDetails {
  title: string
  duration: string
  vimeoId?: string
  platform?: string
  covers: string[]
}

interface Section {
  title: string
  content?: string
  principle?: string
  disclaimer?: string
  videoSection?: boolean
  videoDetails?: VideoDetails
  features?: Feature[]
  dashboardSections?: DashboardSection[]
  reports?: Report[]
  clientFeatures?: ClientFeature[]
  teamFeatures?: ClientFeature[]
  bestPractices?: BestPractice[]
  faqs?: FAQ[]
  benefits?: Benefit[]
  steps?: Step[]
  teamSteps?: Step[]
  math?: { formula: string; example: MathExample; breakdown: MathBreakdown[] }
  redFlags?: RedFlag[]
  routine?: Routine[]
  stakes?: Stake[]
  comparison?: Comparison
  timeline?: TimelinePeriod[]
  clientStrategies?: ClientStrategy[]
  teamStrategies?: TeamStrategy[]
  donts?: Dont[]
  nextMonth?: NextMonthAction[]
  mindsets?: Mindset[]
}

interface Lesson {
  id: string
  title: string
  type: string
  icon: typeof Monitor
  duration: string
  content: {
    intro: string
    sections: Section[]
    keyTakeaways: string[]
  }
}

const lessons: Lesson[] = [
  {
    id: "5.1.1",
    title: "How to Use Connect to Grow Your Business",
    type: "Overview",
    icon: Monitor,
    duration: "12 min read",
    content: {
      intro: "OPTAVIA Connect is more than an ordering system – it's your business command center. As you grow from Senior Coach to Executive Director, mastering Connect becomes essential for tracking your business, supporting your team, and making data-driven decisions.",
      sections: [
        {
          title: "What is OPTAVIA Connect?",
          content: "OPTAVIA Connect is your all-in-one platform for managing every aspect of your coaching business. Think of it as your business dashboard, order management system, and team tracker all rolled into one.",
          features: [
            { feature: "Business Dashboard", description: "See your key metrics at a glance – volume, rank progress, team activity", icon: "📊" },
            { feature: "Order Management", description: "Track client orders, Premier Orders, and order history", icon: "📦" },
            { feature: "Team Insights", description: "Monitor your downline's activity, volume, and progress", icon: "👥" },
            { feature: "Resource Library", description: "Access training materials, marketing assets, and tools", icon: "📚" },
            { feature: "Commission Tracking", description: "View your earnings, bonuses, and payment history", icon: "💰" },
            { feature: "Client Management", description: "See client details, order history, and engagement", icon: "🤝" },
          ],
        },
        {
          title: "Navigating the Dashboard",
          dashboardSections: [
            { section: "Home/Overview", purpose: "Quick snapshot of your business health", keyMetrics: ["Current FQV", "Projected FQV", "Active clients", "Rank status"], frequency: "Check daily" },
            { section: "Volume Center", purpose: "Deep dive into your volume breakdown", keyMetrics: ["Personal volume", "Client volume", "Team volume", "Volume trends"], frequency: "Check 2-3x weekly" },
            { section: "Team/Organization", purpose: "Monitor and support your downline", keyMetrics: ["Team member activity", "New orders", "At-risk clients", "Team FQV"], frequency: "Check 2-3x weekly" },
            { section: "Orders", purpose: "Track all order activity", keyMetrics: ["Pending orders", "Processed orders", "Premier Order status", "Returns"], frequency: "Check daily" },
            { section: "Commissions", purpose: "Understand your earnings", keyMetrics: ["Current period earnings", "Bonus qualifications", "Payment history"], frequency: "Check weekly" },
          ],
        },
        {
          title: "Key Reports Every Leader Should Know",
          reports: [
            { report: "Volume Summary Report", what: "Shows your total volume and where it's coming from", why: "Identify your strongest contributors and gaps", when: "Weekly, and daily near month-end" },
            { report: "Team Activity Report", what: "Shows which team members are active, ordering, and engaging", why: "Identify who needs support and who's crushing it", when: "2-3 times per week" },
            { report: "Client Retention Report", what: "Shows which clients are reordering vs. at risk of churning", why: "Proactively reach out before clients lapse", when: "Weekly" },
            { report: "Rank Qualification Report", what: "Shows your progress toward maintaining or advancing rank", why: "Know exactly what you need to hit your goals", when: "Weekly, daily near month-end" },
            { report: "Projected Volume Report", what: "Estimates your end-of-month volume based on scheduled orders", why: "Plan your activity based on where you'll land", when: "2-3 times per week" },
          ],
        },
        {
          title: "Using Connect for Client Management",
          clientFeatures: [
            { feature: "Client List View", description: "See all your personally-sponsored clients in one place", actionable: "Sort by last order date to identify who needs attention" },
            { feature: "Order History", description: "View each client's complete order history", actionable: "Use this to personalize your check-ins and recommendations" },
            { feature: "Premier Order Status", description: "See which clients have active Premier Orders and when they ship", actionable: "Reach out before ship dates to help with adjustments" },
            { feature: "Client Notes", description: "Add notes about client preferences, goals, challenges", actionable: "Build a database of knowledge for personalized support" },
          ],
        },
        {
          title: "Using Connect for Team Management",
          teamFeatures: [
            { feature: "Organization Tree", description: "Visual hierarchy of your team structure", actionable: "Identify depth and breadth of your organization" },
            { feature: "Team Member Profiles", description: "Individual coach activity, volume, and rank progress", actionable: "Know exactly where each team member stands" },
            { feature: "New Coach Activity", description: "Track new coaches through their first 30-60 days", actionable: "Ensure new team members don't fall through the cracks" },
            { feature: "Volume by Leg", description: "See how volume is distributed across your organization", actionable: "Balance your focus across different parts of your team" },
          ],
        },
        {
          title: "Best Practices for Connect Power Users",
          bestPractices: [
            { practice: "Set a Daily Check-in Routine", description: "Spend 5-10 minutes each morning reviewing your dashboard. Know your numbers before you start your day.", icon: "🌅" },
            { practice: "Create a Weekly Deep-Dive", description: "Block 30 minutes weekly for a thorough review of reports. Look for trends, not just snapshots.", icon: "📅" },
            { practice: "Use Filters Effectively", description: "Filter by date ranges, team levels, and order status to find exactly what you need.", icon: "🔍" },
            { practice: "Export Data for Analysis", description: "Download reports to Excel for custom analysis and tracking over time.", icon: "📥" },
            { practice: "Set Up Notifications", description: "Enable alerts for new orders, team activity, and important milestones.", icon: "🔔" },
            { practice: "Bookmark Key Pages", description: "Save direct links to the reports and views you use most often.", icon: "⭐" },
          ],
        },
        {
          title: "Common Connect Questions",
          faqs: [
            { question: "How often does data update in Connect?", answer: "Most data updates in real-time or within a few hours. Volume data typically updates overnight." },
            { question: "Can I see my team's clients?", answer: "You can see aggregate team volume, but individual client details belong to each coach for privacy." },
            { question: "Why does my projected volume look different than current?", answer: "Projected includes scheduled Premier Orders that haven't shipped yet." },
            { question: "How do I find clients who are about to run out of Fuelings?", answer: "Use the Client Retention report and filter by last order date." },
          ],
        },
      ],
      keyTakeaways: ["Connect is your business command center – master it", "Check your dashboard daily, do deep-dives weekly", "Use reports to make proactive, data-driven decisions", "Set up routines and notifications to stay on top of your business"],
    },
  },
  {
    id: "5.1.2",
    title: "How to Run Projected Numbers for Yourself and a Team",
    type: "Loom Tutorial",
    icon: Calculator,
    duration: "10 min watch",
    content: {
      intro: "Understanding projected numbers is critical for strategic planning. This tutorial shows you exactly how to calculate projections for yourself and your team members – so you can take action BEFORE the month ends, not after.",
      sections: [
        {
          title: "Tutorial Video",
          videoSection: true,
          videoDetails: { title: "Running Projected Numbers in OPTAVIA Connect", duration: "~10 minutes", platform: "Loom", covers: ["Accessing volume projections", "Understanding current vs. projected", "Running projections for yourself", "Running projections for team members", "Identifying gaps and opportunities", "Creating action plans from projections"] },
        },
        {
          title: "Why Projections Matter",
          content: "Projections turn you from reactive to proactive. Instead of finding out you missed rank on the 1st of the month, projections tell you on the 15th that you need to take action NOW.",
          benefits: [
            { benefit: "Prevent Surprises", description: "Know where you'll land before the month ends", icon: "🎯" },
            { benefit: "Create Urgency", description: "Take action while there's still time to affect the outcome", icon: "⏰" },
            { benefit: "Support Your Team", description: "Identify team members who need help before it's too late", icon: "👥" },
            { benefit: "Plan Strategically", description: "Focus energy where it will have the most impact", icon: "📈" },
          ],
        },
        {
          title: "Step-by-Step: Running Your Projections",
          steps: [
            { step: 1, title: "Navigate to Volume Center", instruction: "From your Connect dashboard, click into the Volume or Business section", tip: "This is where all your volume data lives" },
            { step: 2, title: "Find Projected Volume", instruction: "Look for 'Projected FQV' or 'Estimated Volume' – this shows where you're trending", tip: "Projected = Current + Scheduled Premier Orders" },
            { step: 3, title: "Compare to Goal", instruction: "What volume do you need for your rank? What's the gap?", tip: "Gap = Goal - Projected. This is what you need to make up." },
            { step: 4, title: "Identify Sources", instruction: "Where will additional volume come from? Clients? Personal? Team?", tip: "Be specific – which clients, which team members, how much?" },
            { step: 5, title: "Create Action Plan", instruction: "What exactly will you do to close the gap?", tip: "Actions: reach out to X clients, support Y team member, etc." },
          ],
        },
        {
          title: "Step-by-Step: Running Team Projections",
          teamSteps: [
            { step: 1, title: "Go to Team/Organization Section", instruction: "Navigate to where you can see your downline activity", tip: "You may need to expand or drill into team levels" },
            { step: 2, title: "Review Each Team Member", instruction: "Look at each coach's current and projected volume", tip: "Focus on coaches who are close to rank thresholds" },
            { step: 3, title: "Identify At-Risk Coaches", instruction: "Who is close but might miss their goal without help?", tip: "These are your highest-impact support opportunities" },
            { step: 4, title: "Calculate Team Impact", instruction: "How does each team member's volume affect YOUR volume?", tip: "Their success is your success – the math compounds" },
            { step: 5, title: "Prioritize Your Support", instruction: "Who should you focus on helping this week?", tip: "Help those closest to breakthrough first" },
          ],
        },
        {
          title: "The Projection Math",
          math: {
            formula: "Gap = Goal Volume - Projected Volume",
            example: { goal: "10,000 FQV for rank maintenance", projected: "8,500 FQV", gap: "1,500 FQV", daysLeft: "10 days" },
            breakdown: [
              { source: "3 clients reorder early", volume: "+600 FQV" },
              { source: "1 new client acquisition", volume: "+400 FQV" },
              { source: "Team member hits their goal", volume: "+500 FQV" },
              { source: "TOTAL", volume: "+1,500 FQV ✓" },
            ],
          },
        },
        {
          title: "Projection Red Flags to Watch",
          redFlags: [
            { flag: "Projected far below goal", meaning: "You need significant action – this is urgent", action: "Emergency mode: all hands on deck for client acquisition and reorders" },
            { flag: "Projected just below goal", meaning: "You're close but need a push", action: "Focused outreach to clients due for reorders + follow up on pending HAs" },
            { flag: "Team member projected to drop rank", meaning: "They may need support they haven't asked for", action: "Proactive call to understand their situation and offer help" },
            { flag: "Multiple team members struggling", meaning: "Systemic issue – may need team-wide support", action: "Team call or training session addressing common challenges" },
          ],
        },
        {
          title: "Weekly Projection Routine",
          routine: [
            { day: "Monday", action: "Run full projections for yourself and key team members", time: "15-20 min" },
            { day: "Wednesday", action: "Check progress – are you on track from Monday's plan?", time: "10 min" },
            { day: "Friday", action: "Weekend planning – what can be accomplished before Monday?", time: "10 min" },
            { day: "End of Month (last 5 days)", action: "Daily projections – every day counts", time: "10-15 min daily" },
          ],
        },
      ],
      keyTakeaways: ["Projections let you act before the month ends, not after", "Gap = Goal - Projected. Always know your gap.", "Run projections for yourself AND your team members", "Create specific action plans to close any gaps"],
    },
  },
  {
    id: "5.1.3",
    title: "How to End the Month Strategically",
    type: "Video Training",
    icon: Calendar,
    duration: "15 min watch",
    content: {
      intro: "The last 5-10 days of the month can make or break your rank, bonuses, and momentum. This training teaches you how to approach end-of-month strategically – maximizing results while maintaining integrity and relationships.",
      sections: [
        {
          title: "Training Video",
          videoSection: true,
          videoDetails: { title: "How to End the Month Strategically", duration: "~15 minutes", vimeoId: "805182089", covers: ["The importance of monthly cycles", "Strategic vs. desperate end-of-month", "Client-focused approaches", "Team support strategies", "Maintaining integrity", "Setting up next month's success"] },
        },
        {
          title: "Why End-of-Month Matters",
          content: "In OPTAVIA, your rank, bonuses, and momentum are calculated on monthly cycles. A strong end-of-month can mean the difference between promotion and stagnation, between bonus checks and missed opportunities.",
          stakes: [
            { stake: "Rank Maintenance", description: "Miss your volume and you could drop rank – affecting commissions for the entire next month", impact: "HIGH" },
            { stake: "Rank Advancement", description: "Being 100 FQV short means waiting another full month for promotion", impact: "HIGH" },
            { stake: "Bonus Qualifications", description: "Many bonuses have monthly volume thresholds", impact: "MEDIUM" },
            { stake: "Team Momentum", description: "Your success (or struggle) affects your team's belief and activity", impact: "HIGH" },
          ],
        },
        {
          title: "Strategic vs. Desperate: Know the Difference",
          comparison: {
            strategic: { title: "Strategic End-of-Month", characteristics: ["Planned and proactive (starts mid-month)", "Focused on client value and timing", "Supports team members genuinely", "Maintains long-term relationships", "Wins feel good and sustainable"], color: "#e8f5e9" },
            desperate: { title: "Desperate End-of-Month", characteristics: ["Reactive and last-minute", "Pushy or manipulative tactics", "Pressures team inappropriately", "Damages relationships for short-term wins", "Wins feel hollow and unsustainable"], color: "#ffebee" },
          },
          principle: "Always choose strategic over desperate. Your reputation and relationships are worth more than any single month's numbers.",
        },
        {
          title: "The Strategic End-of-Month Timeline",
          timeline: [
            { period: "Days 15-20", title: "Assessment Phase", actions: ["Run projections – where are you trending?", "Identify your gap to goal", "List all potential volume sources", "Prioritize highest-probability actions"] },
            { period: "Days 20-25", title: "Execution Phase", actions: ["Reach out to clients due for reorders", "Follow up on all pending Health Assessments", "Support team members close to their goals", "Check in with 'quiet' clients and team members"] },
            { period: "Days 25-28", title: "Acceleration Phase", actions: ["Daily projection updates", "Intensify follow-up cadence", "Help team members close their gaps", "Focus only on high-probability activities"] },
            { period: "Days 28-31", title: "Closing Phase", actions: ["Final pushes on pending orders", "Last-minute client support", "Celebrate wins with your team", "Begin planning for next month"] },
          ],
        },
        {
          title: "Client-Focused End-of-Month Strategies",
          clientStrategies: [
            { strategy: "Early Reorder Outreach", description: "Contact clients who typically order early next month about ordering a few days earlier", script: "Hey [name]! I noticed your order usually ships around the 5th. Would you like me to help you move it up a few days so you don't run low over the weekend?", ethical: true },
            { strategy: "Check-In Calls", description: "Genuine check-ins with clients you haven't heard from", script: "Hi [name]! I wanted to check in and see how things are going. How are you feeling? Do you need anything?", ethical: true },
            { strategy: "Fueling Review", description: "Help clients review their Fueling supply and avoid running out", script: "Let's do a quick inventory check – I want to make sure you're set for the next few weeks. What Fuelings are you running low on?", ethical: true },
            { strategy: "New Client Closing", description: "Follow up with prospects who've been considering but haven't started", script: "I know you've been thinking about getting started. Is there anything I can answer for you? I'd love to help you begin your journey this month!", ethical: true },
          ],
        },
        {
          title: "Team Support End-of-Month Strategies",
          teamStrategies: [
            { strategy: "Individual Check-Ins", description: "Personal calls with team members who are close to their goals", approach: '"How can I help you close the gap this month? Let\'s strategize together."' },
            { strategy: "Team Motivation Call", description: "Group call to energize and align the team for a strong finish", approach: "Share wins, recognize efforts, create collective momentum" },
            { strategy: "Hands-On Help", description: "Offer to do 3-way calls or support specific prospects", approach: '"Would it help if I joined your call with [prospect]?"' },
            { strategy: "Resource Sharing", description: "Share scripts, strategies, and tools that are working", approach: "\"Here's what's working for me this month – feel free to use it!\"" },
          ],
        },
        {
          title: "What NOT to Do",
          donts: [
            { dont: "Don't pressure clients to order more than they need", why: "It damages trust and creates returns next month" },
            { dont: "Don't guilt team members into activity", why: "Fear-based motivation doesn't build sustainable teams" },
            { dont: "Don't stretch the truth about products or opportunity", why: "Integrity is everything – short-term gains aren't worth long-term reputation" },
            { dont: "Don't sacrifice next month for this month", why: "Pulling orders forward just moves the problem – it doesn't solve it" },
            { dont: "Don't neglect self-care in the push", why: "Burnout helps no one – pace yourself for sustainable success" },
          ],
        },
        {
          title: "Setting Up Next Month While Closing This One",
          nextMonth: [
            { action: "Plant seeds during outreach", description: "Every conversation is an opportunity for next month. Ask for referrals, mention upcoming opportunities." },
            { action: "Note follow-ups needed", description: "Keep a list of people to contact early next month – don't let leads go cold." },
            { action: "Identify new prospects", description: "Even while closing this month, keep an eye out for next month's potential clients." },
            { action: "Reflect on lessons learned", description: "What worked? What didn't? Apply these insights to start next month stronger." },
          ],
        },
        {
          title: "End-of-Month Mindset",
          mindsets: [
            { mindset: "Serve, Don't Sell", description: "Every interaction should add value for the other person. If it doesn't benefit them, don't push it." },
            { mindset: "Control the Controllables", description: "You can't control outcomes, only your actions. Focus on the activities, not the anxious waiting." },
            { mindset: "Progress Over Perfection", description: "Even if you don't hit the exact goal, growth is growth. Celebrate progress." },
            { mindset: "Long Game Thinking", description: "One month doesn't define your business. Consistent effort over time creates success." },
          ],
        },
      ],
      keyTakeaways: ["Start your end-of-month strategy by day 15-20, not day 28", "Always choose strategic over desperate – protect relationships", "Support your team as much as you push for personal goals", "Every end-of-month is also the setup for next month's success"],
    },
  },
]

export function ConnectBusinessContent() {
  const { toast } = useToast()
  const { user } = useAuth()
  const { completedResources, toggleCompletedResource } = useSupabaseData(user)
  const [expandedLesson, setExpandedLesson] = useState(lessons[0].id)

  const getResourceId = (lessonId: string) => `connect-business-${lessonId}`

  const completedLessons = new Set(lessons.map((lesson) => lesson.id).filter((lessonId) => completedResources.includes(getResourceId(lessonId))))

  useEffect(() => {
    const saved = localStorage.getItem("connectBusinessExpanded")
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
    localStorage.setItem("connectBusinessExpanded", JSON.stringify(expandedLesson))
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
            <span className="font-semibold">Module 5.1</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Using Connect for Business Intelligence</h1>
          <p className="text-lg opacity-90 max-w-2xl">Master OPTAVIA Connect to manage, track, and grow your business strategically.</p>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid lg:grid-cols-[320px_1fr] gap-8">
          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Phase Badge */}
            <Card className="bg-gradient-to-br from-indigo-900 to-indigo-800 text-white text-center border-0">
              <CardContent className="pt-6">
                <div className="text-4xl mb-2">🚀</div>
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

            {/* Leadership Tip */}
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-300">
              <CardHeader>
                <div className="flex items-center gap-2 font-semibold text-blue-800">
                  <Award className="h-5 w-5 text-blue-600" />
                  Leadership Insight
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-blue-900 leading-relaxed">Leaders who master their numbers lead with confidence. Data-driven decisions build trust with your team.</p>
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

                    {/* Video Section */}
                    {section.videoSection && section.videoDetails && (
                      <div className="bg-gray-50 rounded-xl p-6 mb-5">
                        <div className="flex items-center gap-4 mb-5">
                          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[hsl(var(--optavia-green))] to-[hsl(var(--optavia-green-dark))] flex items-center justify-center">
                            <Play className="h-7 w-7 text-white fill-white" />
                          </div>
                          <div>
                            <div className="font-bold text-optavia-dark text-lg">{section.videoDetails.title}</div>
                            <div className="text-sm text-optavia-gray">
                              {section.videoDetails.duration}
                              {section.videoDetails.platform && ` • ${section.videoDetails.platform}`}
                            </div>
                          </div>
                        </div>
                        <div className="relative pb-[56.25%] bg-gray-200 rounded-xl mb-5 flex items-center justify-center">
                          <div className="absolute inset-0 flex items-center justify-center text-optavia-gray">
                            <Play className="h-12 w-12" />
                          </div>
                        </div>
                        <div className="text-xs font-semibold text-optavia-gray uppercase mb-2">This video covers:</div>
                        <div className="grid grid-cols-2 gap-2">
                          {section.videoDetails.covers.map((item, i) => (
                            <div key={i} className="flex items-center gap-2 text-sm text-optavia-gray">
                              <CheckCircle className="h-4 w-4 text-[hsl(var(--optavia-green))]" />
                              {item}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Features Grid */}
                    {section.features && (
                      <div className="grid grid-cols-3 gap-3">
                        {section.features.map((feat, i) => (
                          <div key={i} className="p-4 bg-gray-50 rounded-lg text-center">
                            <span className="text-3xl block mb-2">{feat.icon}</span>
                            <div className="font-bold text-optavia-dark mb-1 text-sm">{feat.feature}</div>
                            <div className="text-xs text-optavia-gray">{feat.description}</div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Dashboard Sections */}
                    {section.dashboardSections && (
                      <div className="space-y-2">
                        {section.dashboardSections.map((dash, i) => (
                          <div key={i} className={`p-4 rounded-lg border border-gray-200 ${i % 2 === 0 ? "bg-gray-50" : "bg-white"}`}>
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <div className="font-bold text-optavia-dark mb-1">{dash.section}</div>
                                <div className="text-sm text-optavia-gray">{dash.purpose}</div>
                              </div>
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300 text-xs">
                                {dash.frequency}
                              </Badge>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {dash.keyMetrics.map((metric, j) => (
                                <span key={j} className="text-xs text-optavia-gray bg-white px-2 py-1 rounded border border-gray-200">
                                  {metric}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Reports */}
                    {section.reports && (
                      <div className="space-y-2">
                        {section.reports.map((report, i) => (
                          <div key={i} className="p-4 bg-gray-50 rounded-lg border-l-4 border-[hsl(var(--optavia-green))]">
                            <div className="font-bold text-optavia-dark mb-2">📊 {report.report}</div>
                            <div className="grid grid-cols-3 gap-3 text-sm">
                              <div>
                                <div className="text-xs text-optavia-gray mb-1">WHAT:</div>
                                <div className="text-optavia-gray">{report.what}</div>
                              </div>
                              <div>
                                <div className="text-xs text-optavia-gray mb-1">WHY:</div>
                                <div className="text-optavia-gray">{report.why}</div>
                              </div>
                              <div>
                                <div className="text-xs text-optavia-gray mb-1">WHEN:</div>
                                <div className="text-[hsl(var(--optavia-green))] font-medium">{report.when}</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Client Features */}
                    {section.clientFeatures && (
                      <div className="grid grid-cols-2 gap-3">
                        {section.clientFeatures.map((feat, i) => (
                          <div key={i} className="p-4 bg-gray-50 rounded-lg">
                            <div className="font-bold text-optavia-dark mb-1">{feat.feature}</div>
                            <div className="text-sm text-optavia-gray mb-2">{feat.description}</div>
                            <div className="text-xs text-[hsl(var(--optavia-green))] font-medium">→ {feat.actionable}</div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Team Features */}
                    {section.teamFeatures && (
                      <div className="grid grid-cols-2 gap-3">
                        {section.teamFeatures.map((feat, i) => (
                          <div key={i} className="p-4 bg-blue-50 rounded-lg">
                            <div className="font-bold text-blue-800 mb-1">{feat.feature}</div>
                            <div className="text-sm text-optavia-gray mb-2">{feat.description}</div>
                            <div className="text-xs text-blue-700 font-medium">→ {feat.actionable}</div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Best Practices */}
                    {section.bestPractices && (
                      <div className="grid grid-cols-2 gap-3">
                        {section.bestPractices.map((practice, i) => (
                          <div key={i} className="p-4 bg-green-50 rounded-lg border border-green-200">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-xl">{practice.icon}</span>
                              <span className="font-bold text-green-800">{practice.practice}</span>
                            </div>
                            <div className="text-sm text-green-900">{practice.description}</div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* FAQs */}
                    {section.faqs && (
                      <div className="space-y-2">
                        {section.faqs.map((faq, i) => (
                          <div key={i} className={`p-4 rounded-lg border border-gray-200 ${i % 2 === 0 ? "bg-gray-50" : "bg-white"}`}>
                            <div className="flex items-start gap-2 mb-2">
                              <HelpCircle className="h-4 w-4 text-[hsl(var(--optavia-green))] mt-0.5 flex-shrink-0" />
                              <span className="font-semibold text-optavia-dark">{faq.question}</span>
                            </div>
                            <div className="text-sm text-optavia-gray pl-6">{faq.answer}</div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Benefits */}
                    {section.benefits && (
                      <div className="grid grid-cols-2 gap-3">
                        {section.benefits.map((item, i) => (
                          <div key={i} className="p-4 bg-green-50 rounded-lg">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xl">{item.icon}</span>
                              <span className="font-bold text-green-800">{item.benefit}</span>
                            </div>
                            <div className="text-sm text-green-900">{item.description}</div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Steps */}
                    {section.steps && (
                      <div className="space-y-3">
                        {section.steps.map((item, i) => (
                          <div key={i} className="flex gap-4">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[hsl(var(--optavia-green))] to-[hsl(var(--optavia-green-dark))] text-white flex items-center justify-center font-bold text-sm flex-shrink-0">{item.step}</div>
                            <div className="flex-1 p-4 bg-gray-50 rounded-lg">
                              <div className="font-bold text-optavia-dark mb-1">{item.title}</div>
                              <div className="text-sm text-optavia-gray mb-2">{item.instruction}</div>
                              <div className="text-xs text-[hsl(var(--optavia-green))] italic">💡 {item.tip}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Team Steps */}
                    {section.teamSteps && (
                      <div className="space-y-3">
                        {section.teamSteps.map((item, i) => (
                          <div key={i} className="flex gap-4">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">{item.step}</div>
                            <div className="flex-1 p-4 bg-blue-50 rounded-lg">
                              <div className="font-bold text-blue-800 mb-1">{item.title}</div>
                              <div className="text-sm text-optavia-gray mb-2">{item.instruction}</div>
                              <div className="text-xs text-blue-700 italic">💡 {item.tip}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Math Section */}
                    {section.math && (
                      <div className="bg-gray-50 rounded-xl p-5">
                        <div className="p-4 bg-gradient-to-r from-[hsl(var(--optavia-green))] to-[hsl(var(--optavia-green-dark))] rounded-lg text-white text-center mb-4">
                          <div className="text-xs opacity-90 mb-1">FORMULA</div>
                          <div className="text-xl font-bold">{section.math.formula}</div>
                        </div>
                        <div className="mb-4">
                          <div className="text-xs text-optavia-gray mb-2">EXAMPLE:</div>
                          <div className="grid grid-cols-4 gap-2">
                            <div className="p-3 bg-white rounded-lg text-center">
                              <div className="text-xs text-optavia-gray">Goal</div>
                              <div className="font-bold text-optavia-dark text-sm">{section.math.example.goal}</div>
                            </div>
                            <div className="p-3 bg-white rounded-lg text-center">
                              <div className="text-xs text-optavia-gray">Projected</div>
                              <div className="font-bold text-amber-600 text-sm">{section.math.example.projected}</div>
                            </div>
                            <div className="p-3 bg-white rounded-lg text-center">
                              <div className="text-xs text-optavia-gray">Gap</div>
                              <div className="font-bold text-red-600 text-sm">{section.math.example.gap}</div>
                            </div>
                            <div className="p-3 bg-white rounded-lg text-center">
                              <div className="text-xs text-optavia-gray">Days Left</div>
                              <div className="font-bold text-blue-600 text-sm">{section.math.example.daysLeft}</div>
                            </div>
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-optavia-gray mb-2">HOW TO CLOSE THE GAP:</div>
                          {section.math.breakdown.map((item, i) => (
                            <div key={i} className={`flex justify-between p-3 rounded-md mb-1 ${item.source === "TOTAL" ? "bg-green-100 font-bold" : "bg-white"}`}>
                              <span className={item.source === "TOTAL" ? "text-green-800" : "text-optavia-gray"}>{item.source}</span>
                              <span className={item.source === "TOTAL" ? "text-green-800" : "text-[hsl(var(--optavia-green))]"}>{item.volume}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Red Flags */}
                    {section.redFlags && (
                      <div className="space-y-2">
                        {section.redFlags.map((flag, i) => (
                          <div key={i} className="p-4 bg-amber-50 rounded-lg border-l-4 border-amber-400">
                            <div className="flex items-center gap-2 mb-2">
                              <AlertTriangle className="h-4 w-4 text-amber-600" />
                              <span className="font-bold text-amber-800">{flag.flag}</span>
                            </div>
                            <div className="text-sm text-optavia-gray mb-1">
                              <strong>Meaning:</strong> {flag.meaning}
                            </div>
                            <div className="text-sm text-green-700 font-medium">
                              <strong>Action:</strong> {flag.action}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Routine */}
                    {section.routine && (
                      <div className="grid grid-cols-4 gap-3">
                        {section.routine.map((item, i) => (
                          <div key={i} className={`p-4 rounded-lg text-center ${i === 3 ? "bg-amber-50 border-2 border-amber-300" : "bg-gray-50 border border-gray-200"}`}>
                            <div className={`font-bold mb-2 ${i === 3 ? "text-amber-700" : "text-[hsl(var(--optavia-green))]"}`}>{item.day}</div>
                            <div className="text-xs text-optavia-gray mb-2">{item.action}</div>
                            <Badge variant="outline" className="text-xs bg-white">
                              ⏱️ {item.time}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Stakes */}
                    {section.stakes && (
                      <div className="space-y-2">
                        {section.stakes.map((stake, i) => (
                          <div key={i} className={`flex items-start gap-3 p-4 rounded-lg ${i % 2 === 0 ? "bg-gray-50" : "bg-white"}`}>
                            <Badge variant="outline" className={`text-[10px] font-bold flex-shrink-0 ${stake.impact === "HIGH" ? "bg-red-50 text-red-700 border-red-300" : "bg-amber-50 text-amber-700 border-amber-300"}`}>
                              {stake.impact}
                            </Badge>
                            <div>
                              <div className="font-bold text-optavia-dark mb-1">{stake.stake}</div>
                              <div className="text-sm text-optavia-gray">{stake.description}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Comparison */}
                    {section.comparison && (
                      <div className="mb-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-5 rounded-xl" style={{ backgroundColor: section.comparison.strategic.color }}>
                            <div className="flex items-center gap-2 font-bold text-green-800 mb-3">
                              <CheckCircle className="h-5 w-5" />
                              {section.comparison.strategic.title}
                            </div>
                            {section.comparison.strategic.characteristics.map((char, i) => (
                              <div key={i} className="text-sm text-green-900 mb-1 pl-2">
                                ✓ {char}
                              </div>
                            ))}
                          </div>
                          <div className="p-5 rounded-xl" style={{ backgroundColor: section.comparison.desperate.color }}>
                            <div className="flex items-center gap-2 font-bold text-red-800 mb-3">
                              <AlertTriangle className="h-5 w-5" />
                              {section.comparison.desperate.title}
                            </div>
                            {section.comparison.desperate.characteristics.map((char, i) => (
                              <div key={i} className="text-sm text-red-900 mb-1 pl-2">
                                ✗ {char}
                              </div>
                            ))}
                          </div>
                        </div>
                        {section.principle && (
                          <div className="mt-4 p-4 bg-blue-50 rounded-lg text-center">
                            <Lightbulb className="h-4 w-4 text-blue-600 inline mr-2" />
                            <span className="text-sm text-blue-800 font-medium">{section.principle}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Timeline */}
                    {section.timeline && (
                      <div className="space-y-4">
                        {section.timeline.map((period, i) => (
                          <div key={i} className="flex gap-4 relative">
                            {i < section.timeline!.length - 1 && <div className="absolute left-[45px] top-[70px] w-0.5 h-[calc(100%-30px)] bg-gray-200" />}
                            <div className="w-[90px] text-center flex-shrink-0">
                              <div className={`px-3 py-2 rounded-lg text-xs font-bold ${i === section.timeline!.length - 1 ? "bg-gradient-to-r from-[hsl(var(--optavia-green))] to-[hsl(var(--optavia-green-dark))] text-white" : "bg-gray-100 text-optavia-gray"}`}>{period.period}</div>
                            </div>
                            <div className={`flex-1 p-4 rounded-xl ${i === section.timeline!.length - 1 ? "bg-green-50" : "bg-gray-50"}`}>
                              <div className="font-bold text-optavia-dark mb-2">{period.title}</div>
                              {period.actions.map((action, j) => (
                                <div key={j} className="flex items-center gap-2 text-sm text-optavia-gray mb-1">
                                  <Check className="h-4 w-4 text-[hsl(var(--optavia-green))]" />
                                  {action}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Client Strategies */}
                    {section.clientStrategies && (
                      <div className="space-y-3">
                        {section.clientStrategies.map((strat, i) => (
                          <div key={i} className="p-4 bg-gray-50 rounded-lg border-l-4 border-[hsl(var(--optavia-green))]">
                            <div className="font-bold text-optavia-dark mb-1">{strat.strategy}</div>
                            <div className="text-sm text-optavia-gray mb-3">{strat.description}</div>
                            <div className="p-3 bg-green-50 rounded-lg text-sm text-green-800 italic">💬 &quot;{strat.script}&quot;</div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Team Strategies */}
                    {section.teamStrategies && (
                      <div className="grid grid-cols-2 gap-3">
                        {section.teamStrategies.map((strat, i) => (
                          <div key={i} className="p-4 bg-blue-50 rounded-lg">
                            <div className="font-bold text-blue-800 mb-1">{strat.strategy}</div>
                            <div className="text-sm text-optavia-gray mb-2">{strat.description}</div>
                            <div className="text-xs text-blue-700 italic">→ {strat.approach}</div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Don'ts */}
                    {section.donts && (
                      <div className="space-y-2">
                        {section.donts.map((item, i) => (
                          <div key={i} className="p-4 bg-red-50 rounded-lg border-l-4 border-red-400">
                            <div className="flex items-center gap-2 mb-1">
                              <AlertTriangle className="h-4 w-4 text-red-600" />
                              <span className="font-bold text-red-800">{item.dont}</span>
                            </div>
                            <div className="text-sm text-red-900 pl-6">{item.why}</div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Next Month */}
                    {section.nextMonth && (
                      <div className="grid grid-cols-2 gap-3">
                        {section.nextMonth.map((item, i) => (
                          <div key={i} className="p-4 bg-green-50 rounded-lg border border-green-200">
                            <div className="font-bold text-green-800 mb-1">🌱 {item.action}</div>
                            <div className="text-sm text-green-900">{item.description}</div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Mindsets */}
                    {section.mindsets && (
                      <div className="grid grid-cols-2 gap-3">
                        {section.mindsets.map((item, i) => (
                          <div key={i} className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                            <div className="font-bold text-blue-800 mb-2">💭 {item.mindset}</div>
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
                  <Button variant="outline" onClick={() => (window.location.href = "/training/business-model")}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Phase 4
                  </Button>
                )}

                {nextLesson ? (
                  <Button onClick={() => setExpandedLesson(nextLesson.id)} className="bg-[hsl(var(--optavia-green))] hover:bg-[hsl(var(--optavia-green-dark))] text-white">
                    Next: {nextLesson.title.split(" ").slice(0, 4).join(" ")}...
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button className="bg-[hsl(var(--optavia-green))] hover:bg-[hsl(var(--optavia-green-dark))] text-white" onClick={() => (window.location.href = "/training/business-planning")}>
                    Continue to Module 5.2
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
