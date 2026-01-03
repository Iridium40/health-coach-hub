"use client"

import { useState, useEffect, useMemo } from "react"
import { CheckCircle, Circle, ChevronRight, ChevronDown, Clock, Star, ArrowLeft, ArrowRight, Play, DollarSign, Calculator, BookOpen, HelpCircle, Lightbulb, Check, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"
import { useSupabaseData } from "@/hooks/use-supabase-data"

interface IncomeType {
  type: string
  icon: string
  color: string
  borderColor: string
  description: string
  sources: string[]
  tip: string
}

interface CommissionLevel {
  level: string
  description: string
  rate: string
  icon: string
}

interface Driver {
  driver: string
  impact: string
  explanation: string
  action: string
}

interface IncomePath {
  phase: string
  income: string
  focus: string
  timeline: string
}

interface Principle {
  principle: string
  description: string
  icon: string
}

interface VideoDetails {
  title: string
  duration: string
  vimeoId?: string
  platform?: string
  covers: string[]
}

interface FQVDefinition {
  term: string
  meaning: string
  importance: string
}

interface FQVComponent {
  component: string
  description: string
  icon: string
}

interface Step {
  step: number
  title: string
  instruction: string
  tip: string
}

interface Metric {
  metric: string
  what: string
  use: string
}

interface PlanningTip {
  scenario: string
  action: string
  icon: string
}

interface FAQ {
  question: string
  answer: string
}

interface VocabularyTerm {
  term: string
  definition: string
  category: string
  usage: string
}

interface Acronym {
  acronym: string
  meaning: string
}

interface LanguageTip {
  tip: string
  description: string
}

interface Section {
  title: string
  content?: string
  keyPoint?: string
  disclaimer?: string
  videoSection?: boolean
  videoDetails?: VideoDetails
  incomeTypes?: IncomeType[]
  commissionBreakdown?: CommissionLevel[]
  drivers?: Driver[]
  path?: IncomePath[]
  principles?: Principle[]
  definition?: FQVDefinition
  components?: FQVComponent[]
  steps?: Step[]
  metrics?: Metric[]
  planningTips?: PlanningTip[]
  faqs?: FAQ[]
  searchSection?: boolean
  vocabularyTerms?: VocabularyTerm[]
  acronyms?: Acronym[]
  languageTips?: LanguageTip[]
}

interface Lesson {
  id: string
  title: string
  type: string
  icon: typeof DollarSign
  duration: string
  content: {
    intro: string
    sections: Section[]
    keyTakeaways: string[]
  }
}

const lessons: Lesson[] = [
  {
    id: "4.3.1",
    title: "How Coaches Get Paid",
    type: "Video Training",
    icon: DollarSign,
    duration: "15 min watch",
    content: {
      intro: "Understanding how you get paid is essential to building a sustainable business. This training breaks down the OPTAVIA compensation structure so you know exactly what drives your income and how to maximize it.",
      sections: [
        {
          title: "Training Video",
          videoSection: true,
          videoDetails: {
            title: "How OPTAVIA Coaches Get Paid",
            duration: "~15 minutes",
            vimeoId: "805182089",
            covers: ["Overview of the compensation plan", "Client commissions explained", "Front-end vs back-end income", "Volume requirements", "Rank advancement bonuses", "Building residual income"],
          },
        },
        {
          title: "The Two Types of Income",
          incomeTypes: [
            { type: "Front-End Income", icon: "💵", color: "#e8f5e9", borderColor: "#4caf50", description: "Money you earn immediately from client orders", sources: ["Client acquisition bonuses", "Commissions on client orders", "First order bonuses"], tip: "This is your 'right now' money – great for getting started!" },
            { type: "Back-End Income", icon: "📈", color: "#e3f2fd", borderColor: "#2196f3", description: "Residual income that builds over time", sources: ["Ongoing client reorders", "Team volume overrides", "Rank bonuses and incentives"], tip: "This is your 'freedom' money – it keeps coming even when you're not actively working!" },
          ],
        },
        {
          title: "How Client Commissions Work",
          content: "Every time a client places an order, you earn a commission. The more clients you have ordering consistently, the more you earn.",
          commissionBreakdown: [
            { level: "Your Personal Clients", description: "Clients you personally sponsor", rate: "Highest commission rate", icon: "👤" },
            { level: "Team Client Volume", description: "Orders from your team's clients", rate: "Override percentages based on rank", icon: "👥" },
          ],
          keyPoint: "The goal is to build a base of clients who reorder monthly. Consistent reorders = consistent income.",
        },
        {
          title: "What Drives Your Paycheck",
          drivers: [
            { driver: "Number of Active Clients", impact: "HIGH", explanation: "More clients = more orders = more commissions", action: "Focus on client acquisition and retention" },
            { driver: "Client Reorder Rate", impact: "HIGH", explanation: "Clients who stay on program and reorder monthly are your most valuable asset", action: "Support clients so they succeed and continue" },
            { driver: "Personal Volume (PV)", impact: "MEDIUM", explanation: "Your own orders contribute to your qualifying volume", action: "Stay on program yourself" },
            { driver: "Team Volume", impact: "HIGH (at higher ranks)", explanation: "As you advance, you earn overrides on team production", action: "Help your team members succeed" },
            { driver: "Rank Advancement", impact: "HIGH", explanation: "Higher ranks unlock better commission rates and bonuses", action: "Work toward promotion milestones" },
          ],
        },
        {
          title: "The Path to Consistent Income",
          path: [
            { phase: "Phase 1: Getting Started", income: "$0 - $500/month", focus: "Acquire your first 3-5 clients", timeline: "Month 1-2" },
            { phase: "Phase 2: Building Momentum", income: "$500 - $2,000/month", focus: "Grow to 8-12 active clients, hit Senior Coach", timeline: "Month 2-4" },
            { phase: "Phase 3: Consistent Income", income: "$2,000 - $5,000/month", focus: "15-20+ clients, begin team building", timeline: "Month 4-8" },
            { phase: "Phase 4: Scaling", income: "$5,000+/month", focus: "Strong client base + growing team", timeline: "Month 8+" },
          ],
          disclaimer: "Income varies based on individual effort, skills, and market conditions. These are examples only.",
        },
        {
          title: "Key Income Principles",
          principles: [
            { principle: "Consistency Beats Intensity", description: "Steady daily actions beat occasional big pushes. Small consistent efforts compound over time.", icon: "📆" },
            { principle: "Client Retention is Everything", description: "It's easier to keep a client than find a new one. Support your clients so they stay.", icon: "🔄" },
            { principle: "Your Income Ceiling is Your Choice", description: "There's no cap on what you can earn. Your results match your effort and skill.", icon: "🚀" },
            { principle: "Delayed Gratification Pays Off", description: "The first few months build the foundation. Trust the process – it compounds.", icon: "⏳" },
          ],
        },
      ],
      keyTakeaways: ["You earn from client orders (front-end) and team volume (back-end)", "Client retention is as important as client acquisition", "Rank advancement unlocks higher earning potential", "Consistency and daily action drive long-term income"],
    },
  },
  {
    id: "4.3.2",
    title: "How to Check Your Current and Projected FQV",
    type: "Loom Tutorial",
    icon: Calculator,
    duration: "8 min watch",
    content: {
      intro: "FQV (Field Qualifying Volume) is one of the most important numbers in your business. This tutorial shows you exactly how to find your current FQV and project what it will be – essential for planning your rank advancement.",
      sections: [
        {
          title: "Tutorial Video",
          videoSection: true,
          videoDetails: {
            title: "How to Check Your FQV in OPTAVIA Connect",
            duration: "~8 minutes",
            platform: "Loom",
            covers: ["Logging into OPTAVIA Connect", "Navigating to your dashboard", "Finding your current FQV", "Understanding projected FQV", "Reading your volume breakdown", "Planning for rank requirements"],
          },
        },
        {
          title: "What is FQV?",
          definition: { term: "FQV (Field Qualifying Volume)", meaning: "The total volume from you and your team that counts toward rank qualification and bonuses.", importance: "Your FQV determines your rank and the bonuses you're eligible for." },
          components: [
            { component: "Personal Volume (PV)", description: "Volume from your own orders", icon: "👤" },
            { component: "Client Volume", description: "Volume from your personally-sponsored clients", icon: "🛒" },
            { component: "Team Volume", description: "Volume from your downline organization", icon: "👥" },
          ],
        },
        {
          title: "Step-by-Step: Finding Your FQV",
          steps: [
            { step: 1, title: "Log into OPTAVIA Connect", instruction: "Go to optaviaconnect.com and sign in with your credentials", tip: "Bookmark this page for quick access!" },
            { step: 2, title: "Navigate to Business Dashboard", instruction: "Click on 'Business' or 'My Business' in the main navigation", tip: "This is where all your business metrics live" },
            { step: 3, title: "Find Volume Section", instruction: "Look for 'Volume' or 'Qualifying Volume' section on your dashboard", tip: "It may be in a sidebar or main content area" },
            { step: 4, title: "View Current FQV", instruction: "Your current FQV shows what you've accumulated this qualification period", tip: "This resets each qualification period – know your dates!" },
            { step: 5, title: "Check Projected FQV", instruction: "Projected FQV estimates what your volume will be based on scheduled orders", tip: "Use this to plan – if projected is low, take action!" },
            { step: 6, title: "Review Volume Breakdown", instruction: "Click into details to see where your volume is coming from", tip: "This helps you identify which clients or team members are contributing" },
          ],
        },
        {
          title: "Understanding the Numbers",
          metrics: [
            { metric: "Current FQV", what: "Volume already processed this period", use: "Know where you stand TODAY" },
            { metric: "Projected FQV", what: "Estimated volume including scheduled orders", use: "Plan for rank qualification" },
            { metric: "Needed for Next Rank", what: "Gap between current and rank requirement", use: "Set your activity goals" },
            { metric: "Days Remaining", what: "Time left in qualification period", use: "Create urgency and timeline" },
          ],
        },
        {
          title: "Using FQV for Planning",
          planningTips: [
            { scenario: "FQV is on track", action: "Keep doing what you're doing! Maintain client support and activity.", icon: "✅" },
            { scenario: "FQV is slightly behind", action: "Reach out to clients about reorders. Follow up with prospects. Increase activity.", icon: "⚠️" },
            { scenario: "FQV is significantly behind", action: "Focus mode! Extra reach-outs, follow up with all 'maybes', ask for referrals.", icon: "🚨" },
            { scenario: "Projected FQV exceeds goal", action: "Great! Use extra time to plant seeds for NEXT month. Help team members.", icon: "🎯" },
          ],
        },
        {
          title: "Common FQV Questions",
          faqs: [
            { question: "How often should I check my FQV?", answer: "Weekly at minimum, more often as you approach qualification deadlines." },
            { question: "Why is my projected FQV different from current?", answer: "Projected includes scheduled Premier Orders that haven't processed yet." },
            { question: "What if a client cancels and my FQV drops?", answer: "Reach out to understand why, try to save them, and focus on acquiring new clients." },
            { question: "Does my own order count toward FQV?", answer: "Yes! Your personal volume (PV) counts toward your FQV." },
          ],
        },
      ],
      keyTakeaways: ["FQV = Personal Volume + Client Volume + Team Volume", "Check your FQV weekly to stay on track", "Use projected FQV to plan your activity level", "Know your rank requirements and qualification deadlines"],
    },
  },
  {
    id: "4.3.3",
    title: "OPTAVIA Vocabulary Review",
    type: "Reference",
    icon: BookOpen,
    duration: "10 min review",
    content: {
      intro: "Speaking the language of OPTAVIA helps you communicate confidently with clients, team members, and leadership. Review these key terms to ensure you're fluent in OPTAVIA vocabulary.",
      sections: [
        { title: "Search & Filter Terms", searchSection: true },
        {
          title: "Vocabulary by Category",
          vocabularyTerms: [
            { term: "Optimal Weight 5&1 Plan", definition: "The core OPTAVIA program where clients eat 5 Fuelings and 1 Lean & Green meal daily.", category: "Program", usage: '"The Optimal Weight 5&1 Plan is our most popular program for weight loss."' },
            { term: "Fuelings", definition: "OPTAVIA's nutritionally-designed meal replacements (bars, shakes, soups, etc.) that provide balanced nutrition.", category: "Program", usage: "\"You'll eat 5 Fuelings throughout the day – they're super convenient!\"" },
            { term: "Lean & Green", definition: "The one home-cooked meal per day consisting of 5-7 oz lean protein + 3 servings of non-starchy vegetables + healthy fats.", category: "Program", usage: '"Your Lean & Green is where you get to be creative with cooking!"' },
            { term: "Fat Burn State", definition: "The metabolic state where your body burns fat for fuel, typically achieved within 3-5 days on program.", category: "Program", usage: "\"Most people enter fat burn within the first week – that's when the magic happens!\"" },
            { term: "Optimal Health 3&3 Plan", definition: "A maintenance/lifestyle plan with 3 Fuelings and 3 balanced meals daily.", category: "Program", usage: "\"Once you hit your goal, you'll transition to the 3&3 for maintenance.\"" },
            { term: "Transition Phase", definition: "The gradual process of reintroducing foods after reaching goal weight.", category: "Program", usage: "\"We'll walk through transition together so you maintain your results.\"" },
            { term: "Health Coach", definition: "An independent OPTAVIA coach who supports clients on their health journey and earns income through the compensation plan.", category: "Business", usage: "\"As your Health Coach, I'm here to support you every step of the way.\"" },
            { term: "Sponsor", definition: "The coach who introduced someone to OPTAVIA (either as a client or coach).", category: "Business", usage: '"My sponsor helped me get started and still mentors me today."' },
            { term: "Upline", definition: "Coaches above you in your organization (your sponsor, their sponsor, etc.).", category: "Business", usage: "\"My upline is super supportive – I can always ask them questions.\"" },
            { term: "Downline", definition: "Coaches and clients you've sponsored and their organizations below you.", category: "Business", usage: '"As your downline grows, so does your income potential."' },
            { term: "Premier Order", definition: "A recurring monthly order (for clients or coaches) that auto-ships each month.", category: "Business", usage: "\"Setting up your Premier Order ensures you never run out of Fuelings!\"" },
            { term: "Health Assessment (HA)", definition: "A conversation with a prospect to understand their goals and determine if OPTAVIA is right for them.", category: "Business", usage: "\"Let's schedule a quick Health Assessment so I can learn more about your goals.\"" },
            { term: "PV (Personal Volume)", definition: "The volume/points from your own personal orders.", category: "Volume", usage: '"Your PV from staying on program helps you qualify."' },
            { term: "FQV (Field Qualifying Volume)", definition: "Total volume from you, your clients, and your team that counts toward rank qualification.", category: "Volume", usage: '"Check your FQV weekly to make sure you\'re on track for your rank."' },
            { term: "QP (Qualifying Points)", definition: "Points earned that count toward rank advancement requirements.", category: "Volume", usage: '"Each new client adds to your QP for rank advancement."' },
            { term: "Active Client", definition: "A client who has placed an order within the qualification period.", category: "Volume", usage: '"Focus on keeping your clients active with great support."' },
            { term: "Senior Coach", definition: "First rank promotion, achieved with 3 personally-sponsored clients (or 1 client + 1 coach).", category: "Rank", usage: "\"Senior Coach is your first milestone – totally achievable in 30-60 days!\"" },
            { term: "Certified Coach", definition: "Second rank requiring additional clients and completion of certification training.", category: "Rank", usage: "\"Certified Coach shows you've committed to your training and growing your business.\"" },
            { term: "Manager", definition: "Rank achieved through team building and meeting volume requirements.", category: "Rank", usage: "\"Hitting Manager means you're developing other coaches on your team.\"" },
            { term: "Director", definition: "Advanced rank with larger team and volume requirements.", category: "Rank", usage: '"Directors have built significant organizations and earn override income."' },
            { term: "Executive Director", definition: "Leadership rank with substantial team volume and multiple legs of business.", category: "Rank", usage: '"Executive Directors are top earners who mentor large teams."' },
            { term: "OPTAVIA Connect", definition: "The online portal where coaches and clients manage orders, track progress, and access resources.", category: "Community", usage: '"Log into OPTAVIA Connect to check your orders and business stats."' },
            { term: "Convention", definition: "Annual OPTAVIA event bringing together coaches for training, recognition, and community.", category: "Community", usage: "\"Convention is life-changing – you'll want to attend every year!\"" },
            { term: "Success Party", definition: "Virtual or in-person events to share the OPTAVIA opportunity with prospects.", category: "Community", usage: "\"I'm hosting a Success Party next week – it's a great way to learn more!\"" },
            { term: "Team Call", definition: "Regular calls with your upline and team for training and motivation.", category: "Community", usage: "\"Don't miss our weekly team call – it's where we learn and grow together.\"" },
            { term: "Habits of Health", definition: "The holistic lifestyle system developed by Dr. Wayne Andersen covering six key areas of optimal wellbeing.", category: "Habits of Health", usage: "\"OPTAVIA isn't just about weight loss – it's about building lifelong Habits of Health.\"" },
            { term: "Dr. A (Dr. Wayne Andersen)", definition: "Co-founder of OPTAVIA and author of the Habits of Health system.", category: "Habits of Health", usage: "\"Dr. A's approach focuses on creating sustainable health, not just quick fixes.\"" },
            { term: "LifeBook", definition: "The companion workbook to Habits of Health for implementing the system.", category: "Habits of Health", usage: '"Working through the LifeBook helps you build habits that last."' },
            { term: "Optimal Wellbeing", definition: "The state of thriving health across all six MacroHabits (healthy weight, movement, hydration, sleep, mind, and surroundings).", category: "Habits of Health", usage: "\"Our goal isn't just weight loss – it's optimal wellbeing in all areas of life.\"" },
          ],
        },
        {
          title: "Quick Reference: Acronyms",
          acronyms: [
            { acronym: "HA", meaning: "Health Assessment" },
            { acronym: "L&G", meaning: "Lean & Green" },
            { acronym: "PV", meaning: "Personal Volume" },
            { acronym: "FQV", meaning: "Field Qualifying Volume" },
            { acronym: "QP", meaning: "Qualifying Points" },
            { acronym: "SC", meaning: "Senior Coach" },
            { acronym: "CC", meaning: "Certified Coach" },
            { acronym: "ED", meaning: "Executive Director" },
            { acronym: "IPD", meaning: "Integrated Presidential Director" },
            { acronym: "HOH", meaning: "Habits of Health" },
            { acronym: "Dr. A", meaning: "Dr. Wayne Andersen" },
          ],
        },
        {
          title: "Tips for Using OPTAVIA Language",
          languageTips: [
            { tip: "Lead with transformation, not terminology", description: "Don't overwhelm prospects with jargon. Speak to their goals first, explain terms as needed." },
            { tip: "Use 'we' language with clients", description: "\"We'll work through this together\" is more supportive than \"You need to do this.\"" },
            { tip: "Avoid industry jargon with prospects", description: "Terms like 'downline,' 'volume,' and 'compensation' can feel salesy. Keep it simple." },
            { tip: "Know your terms for team conversations", description: "Speaking fluently with your mentor and team shows you're serious about your business." },
          ],
        },
      ],
      keyTakeaways: ["Know program terms to confidently explain OPTAVIA to prospects", "Understand business terms to track and grow your income", "Use appropriate language for each audience (client vs. team)", "Review this vocabulary regularly until it becomes second nature"],
    },
  },
]

const categories = ["all", "Program", "Business", "Volume", "Rank", "Community", "Habits of Health"]

export function BusinessModelContent() {
  const { toast } = useToast()
  const { user } = useAuth()
  const { completedResources, toggleCompletedResource } = useSupabaseData(user)
  const [expandedLesson, setExpandedLesson] = useState(lessons[0].id)
  const [expandedTerm, setExpandedTerm] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")

  const getResourceId = (lessonId: string) => `business-model-${lessonId}`

  const completedLessons = new Set(lessons.map((lesson) => lesson.id).filter((lessonId) => completedResources.includes(getResourceId(lessonId))))

  useEffect(() => {
    const saved = localStorage.getItem("businessModelExpanded")
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
    localStorage.setItem("businessModelExpanded", JSON.stringify(expandedLesson))
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

  // Get vocabulary terms for filtering
  const getVocabTerms = useMemo(() => {
    const vocabSection = currentLesson?.content?.sections?.find((s) => s.vocabularyTerms)
    if (!vocabSection || !vocabSection.vocabularyTerms) return []

    let terms = vocabSection.vocabularyTerms

    // Filter by search
    if (searchTerm) {
      terms = terms.filter((t) => t.term.toLowerCase().includes(searchTerm.toLowerCase()) || t.definition.toLowerCase().includes(searchTerm.toLowerCase()))
    }

    // Filter by category
    if (selectedCategory !== "all") {
      terms = terms.filter((t) => t.category === selectedCategory)
    }

    return terms
  }, [currentLesson, searchTerm, selectedCategory])

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Program":
        return { bg: "#e8f5e9", text: "#2e7d32" }
      case "Business":
        return { bg: "#e3f2fd", text: "#1565c0" }
      case "Volume":
        return { bg: "#fff8e1", text: "#f57c00" }
      case "Rank":
        return { bg: "#fce4ec", text: "#c2185b" }
      case "Community":
        return { bg: "#f3e5f5", text: "#7b1fa2" }
      case "Habits of Health":
        return { bg: "#e0f2f1", text: "#00695c" }
      default:
        return { bg: "#f5f5f5", text: "#666" }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-[hsl(var(--optavia-green))] to-[hsl(var(--optavia-green-dark))] text-white py-8 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 text-sm opacity-90 mb-2 uppercase tracking-wide">
            <span>Training Center</span>
            <ChevronRight className="h-4 w-4" />
            <span>Phase 4: Growing to Senior Coach</span>
            <ChevronRight className="h-4 w-4" />
            <span className="font-semibold">Module 4.3</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Understanding the Business Model</h1>
          <p className="text-lg opacity-90 max-w-2xl">Know how you get paid and what drives your income in OPTAVIA.</p>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid lg:grid-cols-[320px_1fr] gap-8">
          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Phase Badge */}
            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-300 text-center">
              <CardContent className="pt-6">
                <div className="text-4xl mb-2">💰</div>
                <div className="font-bold text-green-800 text-sm">PHASE 4</div>
                <div className="text-sm text-green-700">Growing to Senior Coach</div>
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

            {/* Income Tip */}
            <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-300">
              <CardHeader>
                <div className="flex items-center gap-2 font-semibold text-amber-800">
                  <Lightbulb className="h-5 w-5 text-amber-600" />
                  Income Insight
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-amber-900 leading-relaxed">Your income is directly tied to the value you provide. Help more people transform → Earn more income. It's that simple.</p>
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
                    {!section.searchSection && (
                      <h3 className="text-lg font-bold text-optavia-dark mb-4 flex items-center gap-3">
                        <span className="w-7 h-7 rounded-full bg-gradient-to-br from-[hsl(var(--optavia-green))] to-[hsl(var(--optavia-green-dark))] text-white flex items-center justify-center text-sm font-bold">{idx + 1}</span>
                        {section.title}
                      </h3>
                    )}

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

                    {/* Income Types */}
                    {section.incomeTypes && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {section.incomeTypes.map((type, i) => (
                          <div key={i} className="p-5 rounded-xl" style={{ backgroundColor: type.color, borderLeft: `4px solid ${type.borderColor}` }}>
                            <div className="flex items-center gap-3 mb-3">
                              <span className="text-3xl">{type.icon}</span>
                              <span className="font-bold text-optavia-dark text-lg">{type.type}</span>
                            </div>
                            <p className="text-sm text-optavia-gray mb-3">{type.description}</p>
                            <div className="mb-3 space-y-1">
                              {type.sources.map((src, j) => (
                                <div key={j} className="flex items-center gap-2 text-sm text-optavia-gray">
                                  <Check className="h-4 w-4 text-[hsl(var(--optavia-green))]" />
                                  {src}
                                </div>
                              ))}
                            </div>
                            <div className="p-3 bg-white/70 rounded-lg text-xs text-optavia-gray italic">💡 {type.tip}</div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Commission Breakdown */}
                    {section.commissionBreakdown && (
                      <div className="mb-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {section.commissionBreakdown.map((item, i) => (
                            <div key={i} className="p-4 bg-gray-50 rounded-lg">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-2xl">{item.icon}</span>
                                <span className="font-bold text-optavia-dark">{item.level}</span>
                              </div>
                              <p className="text-sm text-optavia-gray mb-1">{item.description}</p>
                              <div className="text-xs font-semibold text-[hsl(var(--optavia-green))]">{item.rate}</div>
                            </div>
                          ))}
                        </div>
                        {section.keyPoint && (
                          <div className="mt-4 p-4 bg-green-50 rounded-lg border-l-4 border-[hsl(var(--optavia-green))]">
                            <Lightbulb className="h-4 w-4 text-green-700 inline mr-2" />
                            <span className="text-sm text-green-800 font-medium">{section.keyPoint}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Drivers */}
                    {section.drivers && (
                      <div className="space-y-2">
                        {section.drivers.map((driver, i) => (
                          <div key={i} className={`flex items-start gap-4 p-4 rounded-lg ${i % 2 === 0 ? "bg-gray-50" : "bg-white"}`}>
                            <Badge variant="outline" className={`text-[10px] font-bold flex-shrink-0 ${driver.impact === "HIGH" || driver.impact.includes("HIGH") ? "bg-green-100 text-green-800 border-green-300" : "bg-amber-100 text-amber-800 border-amber-300"}`}>
                              {driver.impact}
                            </Badge>
                            <div className="flex-1">
                              <div className="font-bold text-optavia-dark mb-1">{driver.driver}</div>
                              <div className="text-sm text-optavia-gray mb-2">{driver.explanation}</div>
                              <div className="text-xs font-medium text-[hsl(var(--optavia-green))]">→ {driver.action}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Income Path */}
                    {section.path && (
                      <div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                          {section.path.map((phase, i) => (
                            <div key={i} className={`p-4 rounded-xl text-center ${i === 0 ? "bg-green-50" : i === 3 ? "bg-gradient-to-br from-[hsl(var(--optavia-green))] to-[hsl(var(--optavia-green-dark))] text-white" : "bg-gray-50"}`}>
                              <div className="text-[10px] font-semibold opacity-80 mb-1">{phase.phase}</div>
                              <div className="text-lg font-bold mb-2">{phase.income}</div>
                              <div className="text-[11px] opacity-90 mb-1 leading-tight">{phase.focus}</div>
                              <div className="text-[10px] opacity-70">{phase.timeline}</div>
                            </div>
                          ))}
                        </div>
                        {section.disclaimer && <div className="p-3 bg-gray-100 rounded-lg text-xs text-optavia-gray italic text-center">⚠️ {section.disclaimer}</div>}
                      </div>
                    )}

                    {/* Principles */}
                    {section.principles && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {section.principles.map((prin, i) => (
                          <div key={i} className="p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-xl">{prin.icon}</span>
                              <span className="font-bold text-optavia-dark">{prin.principle}</span>
                            </div>
                            <p className="text-sm text-optavia-gray">{prin.description}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* FQV Definition */}
                    {section.definition && (
                      <div className="p-5 bg-gradient-to-r from-green-50 to-green-100 rounded-xl mb-5">
                        <div className="text-xs font-semibold text-green-700 mb-1">{section.definition.term}</div>
                        <div className="text-base font-medium text-green-900 mb-2">{section.definition.meaning}</div>
                        <div className="text-sm text-green-700 italic">💡 {section.definition.importance}</div>
                      </div>
                    )}

                    {/* Components */}
                    {section.components && (
                      <div className="grid grid-cols-3 gap-3">
                        {section.components.map((comp, i) => (
                          <div key={i} className="p-4 bg-gray-50 rounded-lg text-center">
                            <span className="text-3xl">{comp.icon}</span>
                            <div className="font-bold text-optavia-dark mt-2 mb-1">{comp.component}</div>
                            <div className="text-xs text-optavia-gray">{comp.description}</div>
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

                    {/* Metrics */}
                    {section.metrics && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {section.metrics.map((met, i) => (
                          <div key={i} className="p-4 bg-gray-50 rounded-lg">
                            <div className="font-bold text-[hsl(var(--optavia-green))] mb-2">{met.metric}</div>
                            <div className="text-sm text-optavia-gray mb-1">
                              <strong>What:</strong> {met.what}
                            </div>
                            <div className="text-sm text-optavia-gray">
                              <strong>Use:</strong> {met.use}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Planning Tips */}
                    {section.planningTips && (
                      <div className="space-y-2">
                        {section.planningTips.map((tip, i) => (
                          <div key={i} className={`flex items-start gap-3 p-4 rounded-lg ${tip.icon === "✅" ? "bg-green-50" : tip.icon === "🚨" ? "bg-red-50" : "bg-gray-50"}`}>
                            <span className="text-xl">{tip.icon}</span>
                            <div>
                              <div className="font-semibold text-optavia-dark mb-1">{tip.scenario}</div>
                              <div className="text-sm text-optavia-gray">{tip.action}</div>
                            </div>
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
                              <HelpCircle className="h-4 w-4 text-[hsl(var(--optavia-green))] flex-shrink-0 mt-0.5" />
                              <span className="font-semibold text-optavia-dark">{faq.question}</span>
                            </div>
                            <div className="text-sm text-optavia-gray pl-6">{faq.answer}</div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Search Section */}
                    {section.searchSection && (
                      <div className="mb-5">
                        <div className="flex gap-3 mb-4">
                          <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-optavia-gray" />
                            <Input type="text" placeholder="Search terms..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
                          </div>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                          {categories.map((cat) => (
                            <Button key={cat} variant={selectedCategory === cat ? "default" : "outline"} size="sm" onClick={() => setSelectedCategory(cat)} className={`text-xs capitalize ${selectedCategory === cat ? "bg-[hsl(var(--optavia-green))] hover:bg-[hsl(var(--optavia-green-dark))]" : ""}`}>
                              {cat}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Vocabulary Terms */}
                    {section.vocabularyTerms && (
                      <div className="space-y-2">
                        {getVocabTerms.map((term, i) => {
                          const catColor = getCategoryColor(term.category)
                          return (
                            <div key={i} className="rounded-lg border border-gray-200 overflow-hidden">
                              <button onClick={() => setExpandedTerm(expandedTerm === term.term ? null : term.term)} className={`w-full p-4 flex items-center justify-between text-left transition-colors ${expandedTerm === term.term ? "bg-green-50" : "bg-gray-50 hover:bg-gray-100"}`}>
                                <div className="flex items-center gap-3">
                                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold" style={{ backgroundColor: catColor.bg, color: catColor.text }}>
                                    {term.category}
                                  </span>
                                  <span className="font-semibold text-optavia-dark">{term.term}</span>
                                </div>
                                <ChevronDown className={`h-5 w-5 text-optavia-gray transition-transform ${expandedTerm === term.term ? "rotate-180" : ""}`} />
                              </button>
                              {expandedTerm === term.term && (
                                <div className="px-4 pb-4">
                                  <p className="text-sm text-optavia-gray leading-relaxed mb-3">{term.definition}</p>
                                  <div className="p-3 bg-gray-100 rounded-lg border-l-4 border-[hsl(var(--optavia-green))]">
                                    <div className="text-[10px] text-optavia-gray uppercase mb-1">Example Usage:</div>
                                    <div className="text-sm text-optavia-gray italic">{term.usage}</div>
                                  </div>
                                </div>
                              )}
                            </div>
                          )
                        })}
                        {getVocabTerms.length === 0 && <div className="py-10 text-center text-optavia-gray">No terms match your search.</div>}
                      </div>
                    )}

                    {/* Acronyms */}
                    {section.acronyms && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {section.acronyms.map((acr, i) => (
                          <div key={i} className="p-3 bg-gray-50 rounded-lg text-center">
                            <div className="font-bold text-[hsl(var(--optavia-green))] text-lg mb-1">{acr.acronym}</div>
                            <div className="text-xs text-optavia-gray">{acr.meaning}</div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Language Tips */}
                    {section.languageTips && (
                      <div className="space-y-2">
                        {section.languageTips.map((tip, i) => (
                          <div key={i} className={`flex items-start gap-3 p-4 rounded-lg border border-green-200 ${i % 2 === 0 ? "bg-green-50" : "bg-white"}`}>
                            <Lightbulb className="h-5 w-5 text-[hsl(var(--optavia-green))] flex-shrink-0 mt-0.5" />
                            <div>
                              <div className="font-bold text-optavia-dark mb-1">{tip.tip}</div>
                              <div className="text-sm text-optavia-gray">{tip.description}</div>
                            </div>
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
                  <Button variant="outline" onClick={() => (window.location.href = "/training/client-acquisition")}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Module 4.2
                  </Button>
                )}

                {nextLesson ? (
                  <Button onClick={() => setExpandedLesson(nextLesson.id)} className="bg-[hsl(var(--optavia-green))] hover:bg-[hsl(var(--optavia-green-dark))] text-white">
                    Next: {nextLesson.title.split(" ").slice(0, 3).join(" ")}...
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button className="bg-[hsl(var(--optavia-green))] hover:bg-[hsl(var(--optavia-green-dark))] text-white" onClick={() => window.history.back()}>
                    🎉 Complete Phase 4!
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
