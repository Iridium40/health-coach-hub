"use client"

import { useState, useEffect } from "react"
import { CheckCircle, Circle, ChevronRight, Clock, Star, ArrowLeft, ArrowRight, Play, Users, Brain, Phone, MessageCircle, Lightbulb, AlertTriangle, Eye, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"
import { useSupabaseData } from "@/hooks/use-supabase-data"

interface MindsetShift {
  from: string
  to: string
  icon: string
  explanation: string
}

interface Motivation {
  surface: string
  deeper: string
  deepest: string
  icon: string
}

interface PowerfulQuestion {
  question: string
  purpose: string
}

interface Comparison {
  feature: string
  transformation: string
}

interface Principle {
  principle: string
  description: string
  icon: string
}

interface Benefit {
  benefit: string
  detail: string
}

interface PracticeStep {
  step: number
  title: string
  description: string
  duration: string
  checklist: string[]
}

interface FlowStep {
  phase: string
  duration: string
  goals: string[]
  scripts: string[]
}

interface Objection {
  objection: string
  response: string
  tip: string
}

interface Scenario {
  scenario: string
  description: string
  focus: string
  mentorRole: string
}

interface AfterPractice {
  selfReflection: string[]
  mentorFeedback: string[]
}

interface Booster {
  tip: string
  detail: string
}

interface VideoDetails {
  title: string
  duration: string
  vimeoId: string
  covers: string[]
}

interface Section {
  title: string
  content?: string
  insight?: string
  videoSection?: boolean
  videoDetails?: VideoDetails
  mindsetShifts?: MindsetShift[]
  motivations?: Motivation[]
  powerfulQuestions?: PowerfulQuestion[]
  comparison?: Comparison[]
  principles?: Principle[]
  benefits?: Benefit[]
  practiceSteps?: PracticeStep[]
  flowSteps?: FlowStep[]
  objections?: Objection[]
  scenarios?: Scenario[]
  afterPractice?: AfterPractice
  boosters?: Booster[]
}

interface Lesson {
  id: string
  title: string
  type: string
  icon: typeof Brain
  duration: string
  content: {
    intro: string
    sections: Section[]
    keyTakeaways: string[]
  }
}

const lessons: Lesson[] = [
  {
    id: "4.2.1",
    title: "The Mindset Behind Effective Sponsorship",
    type: "Video Training",
    icon: Brain,
    duration: "12 min watch",
    content: {
      intro: "Before you can effectively sponsor clients, you need to understand what REALLY motivates people to change. This training shifts your perspective from 'selling' to 'serving' – and that mindset shift changes everything.",
      sections: [
        {
          title: "Training Video",
          videoSection: true,
          videoDetails: {
            title: "The Mindset Behind Effective Sponsorship",
            duration: "~12 minutes",
            vimeoId: "805182089",
            covers: ["Why people really make changes", "The difference between features and transformation", "How to identify emotional motivators", "Asking the right questions", "Connecting solutions to their WHY", "Building genuine relationships"],
          },
        },
        {
          title: "Key Mindset Shifts",
          mindsetShifts: [
            { from: "I'm trying to sell them something", to: "I'm offering a solution to their problem", icon: "🔄", explanation: "You're not convincing anyone – you're helping them see what's possible. If the program isn't right for them, that's okay. Your job is to present the opportunity, not force a decision." },
            { from: "I need them to say yes", to: "I need to understand their situation", icon: "👂", explanation: "When you're desperate for a yes, people feel it. When you're genuinely curious about helping them, they feel that too. Detach from the outcome and focus on the conversation." },
            { from: "I'm sharing program features", to: "I'm painting a picture of their transformed life", icon: "🎨", explanation: "Nobody buys a diet – they buy confidence, energy, fitting into clothes, being around for their kids. Connect the program to what THEY want, not what the program offers." },
            { from: "They're rejecting ME", to: "The timing isn't right for THEM", icon: "⏰", explanation: "A 'no' is never personal. It's about where they are in their journey. Stay in touch – when they're ready, they'll remember the coach who cared." },
          ],
        },
        {
          title: "Understanding Client Motivations",
          content: "People don't change because of logic – they change because of EMOTION. Understanding what truly motivates your prospect is the key to effective sponsorship.",
          motivations: [
            { surface: '"I want to lose weight"', deeper: "I want to feel confident in my body again", deepest: "I want to feel worthy of love and respect", icon: "⚖️" },
            { surface: '"I want more energy"', deeper: "I want to keep up with my kids", deepest: "I don't want to miss out on life", icon: "⚡" },
            { surface: '"I want to be healthier"', deeper: "I'm scared of health problems", deepest: "I want to live long enough to see my grandkids", icon: "❤️" },
            { surface: '"I need to fit into my clothes"', deeper: "I feel embarrassed about how I look", deepest: "I've lost my sense of self", icon: "👗" },
          ],
          insight: "Your job is to help them articulate the DEEPEST level. That's where transformation starts.",
        },
        {
          title: "The Power of Questions",
          content: "Great sponsors ask more than they tell. Questions help prospects discover their own motivation – which is far more powerful than you telling them why they should change.",
          powerfulQuestions: [
            { question: "What would it mean to you to finally achieve this goal?", purpose: "Connects to emotional payoff" },
            { question: "What have you already tried, and why do you think it didn't work?", purpose: "Identifies past pain points and objections" },
            { question: "What's different about now? Why are you looking for a change today?", purpose: "Reveals their readiness and urgency" },
            { question: "If you could wave a magic wand and change one thing about your health, what would it be?", purpose: "Gets to their #1 priority" },
            { question: "How is your current situation affecting other areas of your life?", purpose: "Expands awareness of the problem's impact" },
            { question: "What would your life look like in 6 months if nothing changed?", purpose: "Creates urgency through consequence" },
            { question: "Who else in your life would benefit from you making this change?", purpose: "Connects to loved ones and external motivation" },
          ],
        },
        {
          title: "Features vs. Transformation",
          content: "New coaches often focus on program features. Master coaches focus on transformation. Here's the difference:",
          comparison: [
            { feature: "You eat 5 Fuelings and 1 Lean & Green", transformation: "You'll never have to wonder 'what should I eat?' – it's all planned for you" },
            { feature: "The Fuelings are nutritionally balanced", transformation: "You'll feel satisfied and energized all day without cravings" },
            { feature: "You get a free health coach", transformation: "You'll have someone in your corner every single day who believes in you" },
            { feature: "Most people lose 2-5 lbs per week", transformation: "Imagine looking in the mirror in 30 days and actually loving what you see" },
            { feature: "The program is simple to follow", transformation: "You won't have to use willpower – you just follow the plan and it works" },
          ],
        },
        {
          title: "The Servant-Leader Mindset",
          content: "The best sponsors see themselves as servant-leaders. They're not trying to GET something from prospects – they're trying to GIVE something valuable.",
          principles: [
            { principle: "Lead with empathy", description: "Remember what it felt like before you found OPTAVIA. Meet them where they are.", icon: "💚" },
            { principle: "Be unattached to the outcome", description: "Your worth isn't determined by their decision. Some will, some won't – so what?", icon: "🧘" },
            { principle: "Provide value regardless", description: "Even if they don't join, leave them better than you found them.", icon: "🎁" },
            { principle: "Think long-term", description: "Today's 'no' could be next month's 'yes.' Stay in relationship.", icon: "🌱" },
            { principle: "Be authentically you", description: "Don't try to be someone you're not. Your authentic story is your superpower.", icon: "⭐" },
          ],
        },
      ],
      keyTakeaways: ["Shift from selling to serving – it changes everything", "People buy transformation, not features", "Ask questions to uncover deep emotional motivations", "Detach from the outcome – focus on the relationship"],
    },
  },
  {
    id: "4.2.2",
    title: "Health Assessment Practice",
    type: "Practice Training",
    icon: Phone,
    duration: "30 min activity",
    content: {
      intro: "The best way to get confident doing Health Assessments is to PRACTICE. This training guides you through mock calls with your mentor so you can refine your skills in a safe environment before doing them with real prospects.",
      sections: [
        {
          title: "Why Practice Matters",
          content: "Even the best coaches practiced before they got great. Mock calls help you:",
          benefits: [
            { benefit: "Build muscle memory", detail: "The flow becomes natural through repetition" },
            { benefit: "Reduce anxiety", detail: "Familiarity breeds confidence" },
            { benefit: "Get feedback", detail: "Your mentor can help you improve" },
            { benefit: "Handle objections", detail: "Practice responses before you hear them live" },
            { benefit: "Find your voice", detail: "Develop YOUR style, not just a script" },
          ],
        },
        {
          title: "Practice Progression",
          practiceSteps: [
            { step: 1, title: "Script Familiarization", description: "Read through the Health Assessment script multiple times. Highlight key transition points. Understand the WHY behind each section.", duration: "15-20 minutes", checklist: ["Read the full script 3 times", "Highlight key questions", "Note transition phrases", "Identify where to personalize"] },
            { step: 2, title: "Solo Practice", description: "Practice the script out loud by yourself. Record yourself and listen back. Get comfortable with the words coming out of YOUR mouth.", duration: "20-30 minutes", checklist: ["Practice out loud (not just in your head)", "Record yourself on your phone", "Listen back and note awkward spots", "Practice until it feels more natural"] },
            { step: 3, title: "Mock Call with Mentor", description: "Schedule a practice call with your mentor. They'll play the prospect while you practice being the coach. Do this 2-3 times minimum.", duration: "30-45 minutes each", checklist: ["Schedule time with your mentor", "Treat it like a real call", "Take notes on feedback", "Practice handling objections"] },
            { step: 4, title: "Shadowing Real Calls", description: "Listen to your mentor do Health Assessments with real prospects (with permission). Observe their tone, pacing, and how they handle different situations.", duration: "Varies", checklist: ["Ask mentor to let you shadow", "Take notes on what works", "Notice their energy and tone", "Ask questions afterward"] },
            { step: 5, title: "Live Call with Support", description: "Do your first real Health Assessment with your mentor on the line (muted) for support. Debrief afterward.", duration: "30 minutes + debrief", checklist: ["Schedule your first real HA", "Have mentor available for backup", "Focus on connection, not perfection", "Debrief and celebrate!"] },
          ],
        },
        {
          title: "Health Assessment Flow Overview",
          flowSteps: [
            { phase: "Opening", duration: "2-3 min", goals: ["Build rapport", "Set expectations", "Get them comfortable"], scripts: ["Hi [Name]! I'm so glad we could connect today! Before we dive in, I'd love to learn a little about you. Tell me about yourself!", "Great to meet you! This call is really just about getting to know you and seeing if what I do might be a good fit for your goals. No pressure at all!"] },
            { phase: "Discovery", duration: "10-15 min", goals: ["Understand their situation", "Identify pain points", "Uncover emotional motivators"], scripts: ["What made you interested in exploring a health change right now?", "Tell me about what you've tried before – what worked, what didn't?", "How is your current health/weight affecting your daily life?", "If you could wave a magic wand, what would your ideal outcome look like?"] },
            { phase: "Share Your Story", duration: "3-5 min", goals: ["Connect through relatability", "Show proof of possibility", "Build trust"], scripts: ["I totally understand where you're coming from. Before I found OPTAVIA, I was [your story]...", "What changed for me was having a simple plan and someone supporting me every step of the way."] },
            { phase: "Present the Solution", duration: "5-7 min", goals: ["Explain how it works", "Connect features to THEIR goals", "Paint the transformation"], scripts: ["Based on what you've shared, I think this could really work for you. Here's how it works...", "The best part is you wouldn't be doing this alone. I'd be your coach, checking in on you every day."] },
            { phase: "Address Concerns", duration: "5-10 min", goals: ["Handle objections with empathy", "Provide reassurance", "Answer questions"], scripts: ["That's a great question, and a lot of people ask the same thing...", "I totally understand that concern. Here's what I've found..."] },
            { phase: "Close", duration: "3-5 min", goals: ["Invite them to start", "Make it easy to say yes", "Set next steps"], scripts: ["Based on everything we've talked about, do you feel like this could be the solution you've been looking for?", "If you're ready to get started, I can walk you through exactly what to do next. Would that be helpful?"] },
          ],
        },
        {
          title: "Common Objections & Responses",
          objections: [
            { objection: "It's too expensive", response: "I totally get that – I had the same concern. Here's how I looked at it: how much are you currently spending on food, coffee, snacks, eating out? For most people, it's actually comparable. Plus, what's the cost of NOT making a change? The health issues, the medications, missing out on life... When you look at it that way, it's actually an investment that pays for itself.", tip: "Ask them what they currently spend on food/eating out first" },
            { objection: "I need to think about it", response: "Absolutely! This is a big decision. What specifically do you want to think about? I want to make sure I've given you all the information you need.", tip: "This usually means there's an unaddressed concern – dig deeper" },
            { objection: "I've tried everything and nothing works", response: "I hear you – I felt the exact same way. The difference with OPTAVIA is you're not doing it alone. I'm going to be with you every step of the way, and the plan is designed to work WITH your body, not against it. Most of my clients have tried everything too – and this is what finally worked.", tip: "Emphasize the coaching support and community" },
            { objection: "I don't have time to cook/meal prep", response: "That's actually one of the best parts! Five of your six meals are grab-and-go Fuelings – they take less than 5 minutes to prepare. You only cook ONE meal a day. Most of my busiest clients say it actually saves them time because they're not constantly thinking about what to eat.", tip: "Highlight the convenience factor" },
            { objection: "I need to talk to my spouse", response: "Of course! That's really smart. Would it help if we did a quick call together so they can hear about it and ask questions? A lot of couples actually end up doing it together!", tip: "Offer to include the spouse in a follow-up call" },
            { objection: "I'll start after [event/holiday/vacation]", response: "I totally understand wanting to wait – but here's what I've learned: there's never a 'perfect' time. Life always has events, holidays, and vacations. What if you started now and learned how to navigate those situations with support? You'd actually be ahead by the time that event comes!", tip: "The 'perfect time' is the biggest trap" },
          ],
        },
        {
          title: "Practice Call Scenarios",
          scenarios: [
            { scenario: "The Skeptic", description: "They've tried everything and don't believe anything will work. They're guarded and hesitant.", focus: "Build trust through your story, acknowledge their past frustrations, emphasize you're not like other programs", mentorRole: "Be skeptical, push back on claims, say 'I've heard that before'" },
            { scenario: "The Busy Professional", description: "They want to change but are convinced they don't have time. Every excuse relates to their schedule.", focus: "Highlight convenience, emphasize time-saving aspects, show how it fits into busy lifestyles", mentorRole: "Keep saying 'but I'm so busy', mention travel, early mornings, late nights" },
            { scenario: "The Price-Conscious", description: "They're interested but cost is their primary concern. They keep coming back to money.", focus: "Value proposition, compare to current spending, emphasize ROI on health", mentorRole: "Keep asking about price, compare to other options, mention budget" },
            { scenario: "The Eager Beaver", description: "They're excited and ready to go! They just need guidance on next steps.", focus: "Don't over-explain, match their energy, make it easy to get started", mentorRole: "Be enthusiastic, ask how to sign up, minimal objections" },
            { scenario: "The Researcher", description: "They have lots of questions about the science, ingredients, studies, etc.", focus: "Provide factual information, offer to share resources, don't get defensive", mentorRole: "Ask detailed questions about nutrition, macros, studies" },
          ],
        },
        {
          title: "After Your Practice Calls",
          afterPractice: {
            selfReflection: ["What went well?", "Where did I feel stuck or awkward?", "What objection caught me off guard?", "Did I talk too much or listen enough?", "Did I connect the solution to THEIR goals?"],
            mentorFeedback: ["Ask: What was my strongest moment?", "Ask: Where did I lose momentum?", "Ask: How was my energy and tone?", "Ask: What should I practice more?", "Ask: Am I ready for a real call?"],
          },
        },
        {
          title: "Confidence Boosters",
          boosters: [
            { tip: "Remember your WHY", detail: "You're not selling – you're offering a solution that changed YOUR life. That's worth sharing." },
            { tip: "They reached out for a reason", detail: "If you're on a Health Assessment, they WANT to hear what you have to say. They're already interested." },
            { tip: "You're not for everyone – and that's okay", detail: "Your job isn't to convince everyone. It's to find the people who are ready for your help." },
            { tip: "Every call makes you better", detail: "Even 'failed' calls teach you something. There's no losing – only learning." },
            { tip: "Your mentor did this too", detail: "Every successful coach was once nervous about their first call. You're exactly where you should be." },
          ],
        },
      ],
      keyTakeaways: ["Practice is the fastest path to confidence", "Follow the flow: Open, Discover, Share, Present, Address, Close", "Prepare for common objections so they don't catch you off guard", "Debrief with your mentor after every practice call"],
    },
  },
]

export function ClientAcquisitionContent() {
  const { toast } = useToast()
  const { user } = useAuth()
  const { completedResources, toggleCompletedResource } = useSupabaseData(user)
  const [expandedLesson, setExpandedLesson] = useState(lessons[0].id)
  const [practiceStep, setPracticeStep] = useState(1)
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({})

  const getResourceId = (lessonId: string) => `client-acquisition-${lessonId}`

  const completedLessons = new Set(lessons.map((lesson) => lesson.id).filter((lessonId) => completedResources.includes(getResourceId(lessonId))))

  useEffect(() => {
    const saved = localStorage.getItem("clientAcquisitionExpanded")
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
    localStorage.setItem("clientAcquisitionExpanded", JSON.stringify(expandedLesson))
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

  const toggleChecked = (itemId: string) => {
    setCheckedItems((prev) => ({ ...prev, [itemId]: !prev[itemId] }))
  }

  const completedCount = completedLessons.size
  const progressPercent = lessons.length > 0 ? Math.round((completedCount / lessons.length) * 100) : 0

  const currentLessonIndex = lessons.findIndex((l) => l.id === expandedLesson)
  const currentLesson = lessons[currentLessonIndex]
  const prevLesson = currentLessonIndex > 0 ? lessons[currentLessonIndex - 1] : null
  const nextLesson = currentLessonIndex < lessons.length - 1 ? lessons[currentLessonIndex + 1] : null

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
            <span className="font-semibold">Module 4.2</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Client Acquisition Mastery</h1>
          <p className="text-lg opacity-90 max-w-2xl">Get confident doing Health Assessments independently through mindset training and practice.</p>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid lg:grid-cols-[320px_1fr] gap-8">
          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Phase Badge */}
            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-300 text-center">
              <CardContent className="pt-6">
                <div className="text-4xl mb-2">🎯</div>
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

            {/* Confidence Quote */}
            <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-300">
              <CardContent className="pt-6">
                <p className="text-sm text-amber-900 italic leading-relaxed mb-3">"Confidence doesn't come from knowing you'll succeed – it comes from knowing you can handle any outcome."</p>
                <div className="text-xs font-semibold text-amber-700">— The Mindset of Master Coaches</div>
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
                            <div className="text-sm text-optavia-gray">{section.videoDetails.duration}</div>
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

                    {/* Mindset Shifts */}
                    {section.mindsetShifts && (
                      <div className="space-y-3">
                        {section.mindsetShifts.map((shift, i) => (
                          <div key={i} className="p-5 bg-gray-50 rounded-xl">
                            <div className="flex items-center gap-3 mb-3">
                              <span className="text-3xl">{shift.icon}</span>
                              <div className="flex flex-wrap items-center gap-3">
                                <div className="px-4 py-2 bg-red-50 rounded-lg text-sm text-red-700 line-through">{shift.from}</div>
                                <ArrowRight className="h-5 w-5 text-optavia-gray" />
                                <div className="px-4 py-2 bg-green-50 rounded-lg text-sm text-green-700 font-semibold">{shift.to}</div>
                              </div>
                            </div>
                            <p className="text-sm text-optavia-gray leading-relaxed pl-12">{shift.explanation}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Motivations */}
                    {section.motivations && (
                      <div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                          {section.motivations.map((mot, i) => (
                            <div key={i} className="p-4 bg-gray-50 rounded-xl">
                              <div className="flex items-center gap-2 mb-3">
                                <span className="text-2xl">{mot.icon}</span>
                              </div>
                              <div className="space-y-2">
                                <div>
                                  <div className="text-[10px] uppercase text-optavia-gray mb-1">Surface:</div>
                                  <div className="text-sm text-optavia-gray">{mot.surface}</div>
                                </div>
                                <div>
                                  <div className="text-[10px] uppercase text-amber-600 mb-1">Deeper:</div>
                                  <div className="text-sm text-amber-700">{mot.deeper}</div>
                                </div>
                                <div>
                                  <div className="text-[10px] uppercase text-green-600 mb-1">Deepest:</div>
                                  <div className="text-sm text-green-700 font-semibold">{mot.deepest}</div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        {section.insight && (
                          <div className="p-4 bg-green-50 rounded-lg border-l-4 border-[hsl(var(--optavia-green))]">
                            <Lightbulb className="h-4 w-4 text-green-700 inline mr-2" />
                            <span className="text-sm text-green-800 font-medium">{section.insight}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Powerful Questions */}
                    {section.powerfulQuestions && (
                      <div className="space-y-2">
                        {section.powerfulQuestions.map((q, i) => (
                          <div key={i} className={`flex gap-4 p-4 rounded-lg ${i % 2 === 0 ? "bg-gray-50" : "bg-white"}`}>
                            <MessageCircle className="h-5 w-5 text-[hsl(var(--optavia-green))] flex-shrink-0 mt-0.5" />
                            <div>
                              <div className="text-sm font-medium text-optavia-dark mb-1">"{q.question}"</div>
                              <div className="text-xs text-optavia-gray italic">→ {q.purpose}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Feature vs Transformation */}
                    {section.comparison && (
                      <div className="overflow-hidden rounded-lg border border-gray-200">
                        <div className="grid grid-cols-2">
                          <div className="p-3 bg-gray-100 font-bold text-xs text-optavia-gray">❌ FEATURE (Don't say)</div>
                          <div className="p-3 bg-green-50 font-bold text-xs text-green-700">✅ TRANSFORMATION (Say this)</div>
                        </div>
                        {section.comparison.map((comp, i) => (
                          <div key={i} className="grid grid-cols-2 border-t border-gray-200">
                            <div className="p-3 bg-gray-50 text-sm text-optavia-gray">{comp.feature}</div>
                            <div className="p-3 bg-green-50/50 text-sm text-green-800">{comp.transformation}</div>
                          </div>
                        ))}
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

                    {/* Benefits */}
                    {section.benefits && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {section.benefits.map((item, i) => (
                          <div key={i} className="p-4 bg-green-50 rounded-lg">
                            <div className="flex items-center gap-2 mb-1">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              <span className="font-bold text-green-800">{item.benefit}</span>
                            </div>
                            <div className="text-sm text-green-700 pl-6">{item.detail}</div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Practice Steps */}
                    {section.practiceSteps && (
                      <div>
                        {/* Step Navigation */}
                        <div className="flex gap-2 mb-5 overflow-x-auto pb-2">
                          {section.practiceSteps.map((step) => (
                            <button key={step.step} onClick={() => setPracticeStep(step.step)} className={`px-4 py-3 rounded-lg border-2 min-w-[100px] text-center transition-colors ${practiceStep === step.step ? "border-[hsl(var(--optavia-green))] bg-green-50" : "border-gray-200 bg-white hover:bg-gray-50"}`}>
                              <div className={`w-7 h-7 rounded-full mx-auto mb-2 flex items-center justify-center font-bold text-sm ${practiceStep === step.step ? "bg-[hsl(var(--optavia-green))] text-white" : "bg-gray-200 text-optavia-gray"}`}>{step.step}</div>
                              <div className={`text-xs font-semibold ${practiceStep === step.step ? "text-[hsl(var(--optavia-green))]" : "text-optavia-gray"}`}>Step {step.step}</div>
                            </button>
                          ))}
                        </div>

                        {/* Current Step Content */}
                        {section.practiceSteps
                          .filter((s) => s.step === practiceStep)
                          .map((step) => (
                            <div key={step.step} className="bg-gray-50 rounded-xl p-6">
                              <div className="flex justify-between items-start mb-4">
                                <div>
                                  <div className="text-xs font-semibold text-[hsl(var(--optavia-green))] mb-1">STEP {step.step}</div>
                                  <div className="text-xl font-bold text-optavia-dark">{step.title}</div>
                                </div>
                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                  ⏱️ {step.duration}
                                </Badge>
                              </div>
                              <p className="text-sm text-optavia-gray leading-relaxed mb-5">{step.description}</p>
                              <div className="font-bold text-optavia-dark mb-3 text-sm">✅ Checklist:</div>
                              {step.checklist.map((item, i) => (
                                <div key={i} onClick={() => toggleChecked(`step${step.step}-${i}`)} className={`flex items-center gap-3 p-3 rounded-lg mb-2 cursor-pointer transition-colors ${checkedItems[`step${step.step}-${i}`] ? "bg-green-100 border border-green-300" : "bg-white border border-gray-200"}`}>
                                  {checkedItems[`step${step.step}-${i}`] ? <CheckCircle className="h-5 w-5 text-green-600" /> : <Circle className="h-5 w-5 text-gray-300" />}
                                  <span className={`text-sm ${checkedItems[`step${step.step}-${i}`] ? "text-green-700 line-through" : "text-optavia-gray"}`}>{item}</span>
                                </div>
                              ))}
                            </div>
                          ))}
                      </div>
                    )}

                    {/* Flow Steps */}
                    {section.flowSteps && (
                      <div className="space-y-4">
                        {section.flowSteps.map((flow, i) => (
                          <div key={i} className="flex gap-4 relative">
                            {i < section.flowSteps.length - 1 && <div className="absolute left-[45px] top-20 w-0.5 h-[calc(100%-20px)] bg-gray-200" />}
                            <div className="w-24 text-center flex-shrink-0">
                              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[hsl(var(--optavia-green))] to-[hsl(var(--optavia-green-dark))] text-white flex items-center justify-center font-bold mx-auto mb-2">{i + 1}</div>
                              <div className="text-xs text-optavia-gray">{flow.duration}</div>
                            </div>
                            <div className="flex-1 p-4 bg-gray-50 rounded-xl">
                              <div className="font-bold text-optavia-dark mb-2">{flow.phase}</div>
                              <div className="flex flex-wrap gap-2 mb-3">
                                {flow.goals.map((goal, j) => (
                                  <Badge key={j} variant="secondary" className="text-xs bg-green-100 text-green-800">
                                    {goal}
                                  </Badge>
                                ))}
                              </div>
                              {flow.scripts.map((script, j) => (
                                <div key={j} className="text-sm text-optavia-gray italic p-3 bg-white rounded-lg mb-2 border-l-4 border-[hsl(var(--optavia-green))]">
                                  "{script}"
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Objections */}
                    {section.objections && (
                      <div className="space-y-4">
                        {section.objections.map((obj, i) => (
                          <div key={i} className="rounded-xl border border-gray-200 overflow-hidden">
                            <div className="p-4 bg-red-50 border-b border-red-100 flex items-center gap-2">
                              <AlertTriangle className="h-4 w-4 text-red-600" />
                              <span className="font-bold text-red-700">"{obj.objection}"</span>
                            </div>
                            <div className="p-5">
                              <p className="text-sm text-optavia-gray leading-relaxed mb-3">
                                <strong className="text-[hsl(var(--optavia-green))]">Response:</strong> "{obj.response}"
                              </p>
                              <div className="p-3 bg-amber-50 rounded-lg text-xs text-amber-700">
                                💡 <strong>Tip:</strong> {obj.tip}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Scenarios */}
                    {section.scenarios && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {section.scenarios.map((scen, i) => (
                          <div key={i} className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                            <div className="font-bold text-optavia-dark mb-2">🎭 {scen.scenario}</div>
                            <p className="text-sm text-optavia-gray mb-3">{scen.description}</p>
                            <div className="p-3 bg-green-50 rounded-lg mb-2">
                              <div className="text-[10px] font-semibold text-green-700 uppercase mb-1">Your Focus:</div>
                              <div className="text-xs text-green-800">{scen.focus}</div>
                            </div>
                            <div className="p-3 bg-blue-50 rounded-lg">
                              <div className="text-[10px] font-semibold text-blue-700 uppercase mb-1">Mentor Acts:</div>
                              <div className="text-xs text-blue-800">{scen.mentorRole}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* After Practice */}
                    {section.afterPractice && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-5 bg-amber-50 rounded-xl">
                          <div className="font-bold text-amber-700 mb-3 flex items-center gap-2">
                            <Eye className="h-5 w-5" />
                            Self-Reflection Questions
                          </div>
                          {section.afterPractice.selfReflection.map((q, i) => (
                            <div key={i} className="text-sm text-amber-800 mb-2 pl-2">
                              • {q}
                            </div>
                          ))}
                        </div>
                        <div className="p-5 bg-green-50 rounded-xl">
                          <div className="font-bold text-green-700 mb-3 flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            Ask Your Mentor
                          </div>
                          {section.afterPractice.mentorFeedback.map((q, i) => (
                            <div key={i} className="text-sm text-green-800 mb-2 pl-2">
                              • {q}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Boosters */}
                    {section.boosters && (
                      <div className="space-y-2">
                        {section.boosters.map((boost, i) => (
                          <div key={i} className={`flex items-start gap-3 p-4 rounded-lg border border-green-200 ${i % 2 === 0 ? "bg-green-50" : "bg-white"}`}>
                            <Sparkles className="h-5 w-5 text-[hsl(var(--optavia-green))] flex-shrink-0 mt-0.5" />
                            <div>
                              <div className="font-bold text-optavia-dark mb-1">{boost.tip}</div>
                              <div className="text-sm text-optavia-gray">{boost.detail}</div>
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
                  <Button variant="outline" onClick={() => (window.location.href = "/training/social-media-business")}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Module 4.1
                  </Button>
                )}

                {nextLesson ? (
                  <Button onClick={() => setExpandedLesson(nextLesson.id)} className="bg-[hsl(var(--optavia-green))] hover:bg-[hsl(var(--optavia-green-dark))] text-white">
                    Next: {nextLesson.title.split(" ").slice(0, 3).join(" ")}...
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button className="bg-[hsl(var(--optavia-green))] hover:bg-[hsl(var(--optavia-green-dark))] text-white" onClick={() => (window.location.href = "/training/business-model")}>
                    Continue to Module 4.3
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
