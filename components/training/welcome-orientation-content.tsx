"use client"

import { useState, useEffect } from "react"
import { CheckCircle, Circle, ChevronRight, ChevronDown, BookOpen, FileText, List, Clock, Star, ArrowLeft, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"
import { useSupabaseData } from "@/hooks/use-supabase-data"

interface Lesson {
  id: string
  title: string
  type: "Document" | "Checklist" | "Reference"
  icon: typeof FileText
  duration: string
  content: {
    intro: string
    sections: Array<{
      title: string
      content?: string
      bullets?: string[]
      footer?: string
      callout?: {
        day: string
        time: string
        zoom: string
        passcode: string
      }
      checklist?: Array<{
        task: string
        link: string | null
      }>
      glossary?: Array<{
        term: string
        full: string
        definition: string
      }>
    }>
    keyTakeaways: string[]
  }
}

const lessons: Lesson[] = [
  {
    id: "1.1.1",
    title: "New Coach Welcome Letter",
    type: "Document",
    icon: FileText,
    duration: "5 min read",
    content: {
      intro: "Welcome to your coaching journey! This letter introduces you to the apprenticeship model that will guide your growth.",
      sections: [
        {
          title: "The Secret to Success",
          content: "The secret to New Coach growth is SIMPLE, CONSISTENT ACTION. This playbook is designed to give you all the tools you need, but the playbook is NOT the secret to growth. Just like you leaned in to your Health Coach to learn how to create health wins, you will lean into your coach as a Business Coach, and they will mentor you to success.",
        },
        {
          title: "The Apprenticeship Model",
          content: "We use an apprenticeship model, where your coach support team SHOWS you what to do, while you WATCH and LEARN. Think of it like being a student teacher who shadows an experienced teacher to learn how to do the job. You will NEVER be alone on your coaching journey! You'll have help from your own coach, as well as their upline mentors. You'll be put in a message thread with your Upline coaches – please keep ALL communication in that thread.",
        },
        {
          title: "Just Like Starting as a Client",
          content: "Launching as a coach is a lot like starting as a client. As a new client, you get daily, step-by-step guidance from your health coach, and as a new coach, you get daily, step-by-step guidance from your business coach mentorship team. Lean in, ask questions, and stay in close contact with them as you learn the ropes.",
        },
        {
          title: "Your Main Job in the First 30 Days",
          content: "Your main job in your first 30 days is to:",
          bullets: [
            "SHARE your story on social media",
            "CONNECT your mentorship in 3-way messages",
            "LISTEN to Health Assessment calls",
            "Learn to SUPPORT your new clients by co-coaching them with your mentors",
          ],
          footer: "That's it! You will learn by doing it WITH your coach, not by memorizing this manual.",
        },
        {
          title: "Weekly Training",
          content: "COACHES WHO ATTEND WEEKLY THEIR FIRST MONTH GROW FASTER!",
          callout: {
            day: "SATURDAY",
            time: "7:00 AM PT / 8:00 AM MST / 9:00 AM CST / 10:00 AM EST",
            zoom: "ZOOM ID: 404 357 2439",
            passcode: "Passcode: OPTAVIA",
          },
        },
      ],
      keyTakeaways: [
        "Success comes from simple, consistent action",
        "You learn by doing WITH your mentor, not alone",
        "Keep all communication in your mentorship thread",
        "Attend weekly trainings your first month",
      ],
    },
  },
  {
    id: "1.1.2",
    title: "New Coach Printable Checklist",
    type: "Checklist",
    icon: List,
    duration: "10 min",
    content: {
      intro: "Use this checklist to make sure you complete all the essential setup tasks in your first week as a coach.",
      sections: [
        {
          title: "Week 1 Setup Tasks",
          checklist: [
            { task: "Purchase your Coaching Business Kit", link: "Module 1.2.1" },
            { task: "Set up your OPTAVIA Pay account (24 hours after first order)", link: "Module 1.2.2" },
            { task: "Join your mentorship message thread", link: null },
            { task: "Save the weekly training Zoom info to your calendar", link: null },
            { task: "Review the OPTAVIA Vocabulary", link: "Module 1.1.3" },
            { task: "Prepare your social media for launch", link: "Module 1.3" },
            { task: "Add disclaimer capability to your photo editing app", link: "Module 1.3.2" },
            { task: "Schedule your first 3-way call observation with your mentor", link: null },
          ],
        },
        {
          title: "Before Your Launch Post",
          checklist: [
            { task: "Have your transformation photos ready (with disclaimer)", link: null },
            { task: "Draft your launch post and get mentor approval", link: "Module 2.1.1" },
            { task: "Review the Week 1 Posting Guide", link: "Module 2.1.2" },
            { task: "Know how to do a 3-way message introduction", link: null },
          ],
        },
        {
          title: "When You Get Your First Client",
          checklist: [
            { task: "Send the Welcome & 9 Tips text", link: "Module 3.1.4" },
            { task: "Set up their daily text message schedule", link: "Module 3.2" },
            { task: "Schedule their Client Celebration Call (CCC) for Day 7-10", link: null },
            { task: "Add them to your client tracking system", link: null },
          ],
        },
      ],
      keyTakeaways: [
        "Complete setup tasks in order - each builds on the previous",
        "Don't skip the mentorship thread - it's your lifeline",
        "Prepare before you launch - quality over speed",
      ],
    },
  },
  {
    id: "1.1.3",
    title: "OPTAVIA Vocabulary",
    type: "Reference",
    icon: BookOpen,
    duration: "5 min read",
    content: {
      intro: "Understanding the language of OPTAVIA will help you communicate effectively with your mentors, team, and clients. Bookmark this page for quick reference!",
      sections: [
        {
          title: "Business Terms",
          glossary: [
            { term: "FQV", full: "Front Qualifying Volume", definition: "The total of your Frontline Client Orders. This is the volume from clients you personally sponsored." },
            { term: "PV", full: "Personal Volume", definition: "The amount of your personal order or a client's personal order." },
            { term: "GQV", full: "Group Qualifying Volume", definition: "The total volume from your entire organization, including all levels of your team." },
            { term: "CAB", full: "Client Acquisition Bonus", definition: "$100 bonus available to any coach in their first 30 days by bringing on 5 new clients." },
            { term: "Points", full: "Qualifying Points", definition: "One point can come from one of two things: $1200 in FQV OR one Senior Coach on your team." },
          ],
        },
        {
          title: "Rank Titles",
          glossary: [
            { term: "SC", full: "Senior Coach", definition: "The first rank. Requires 5 Ordering Entities and >$1000 FQV." },
            { term: "ED", full: "Executive Director", definition: "Qualified Senior Coach with 5 Points." },
            { term: "FIBC", full: "Field Independent Business Coach", definition: "A coach who has built a self-sustaining business with multiple Senior Coach teams." },
          ],
        },
        {
          title: "Coaching & Support Terms",
          glossary: [
            { term: "HA", full: "Health Assessment", definition: "The initial conversation with a potential client to understand their health goals and determine if OPTAVIA is right for them." },
            { term: "CCC", full: "Client Celebration Call", definition: "Phone call or Zoom with client, coach, and mentor after the first week on program is complete." },
            { term: "VIP Call", full: "VIP Celebration Call", definition: "A special recognition call for clients who achieve significant milestones." },
            { term: "HOH", full: "Habits of Health", definition: "The comprehensive lifestyle system that complements the OPTAVIA program." },
          ],
        },
        {
          title: "Program Terms",
          glossary: [
            { term: "L&G", full: "Lean & Green", definition: "The meal you prepare yourself: lean protein + green vegetables + healthy fats." },
            { term: "Fueling", full: "OPTAVIA Fueling", definition: "The portion-controlled, nutritionally-balanced meals provided by OPTAVIA." },
            { term: "5&1", full: "Optimal Weight 5&1 Plan", definition: "5 Fuelings + 1 Lean & Green meal per day." },
            { term: "Trilogy", full: "The OPTAVIA Trilogy", definition: "The three things we work on: Healthy Body, Healthy Mind, Healthy Finances." },
          ],
        },
      ],
      keyTakeaways: [
        "FQV is YOUR direct client volume - focus here first",
        "5 Points = Executive Director qualification",
        "The Trilogy represents the complete transformation: body, mind, finances",
      ],
    },
  },
  {
    id: "1.1.4",
    title: "New Coach Checklist",
    type: "Checklist",
    icon: List,
    duration: "15 min",
    content: {
      intro: "A comprehensive operational checklist to guide you through launching your first client and supporting them through their first month. Follow this step-by-step to ensure nothing falls through the cracks!",
      sections: [
        {
          title: "Social Media Launch",
          checklist: [
            { task: "Write your Launch Post and schedule the launch time with your Sponsoring Coach", link: null },
            { task: "Tag your Sponsoring Coach in your post", link: null },
            { task: "Post should show side-by-side transformation, include the disclaimer, make head size the same in each, don't use the word OPTAVIA", link: null },
          ],
        },
        {
          title: "Set Up Mentorship Thread",
          checklist: [
            { task: "Set up mentorship thread with New Coach, Sponsoring Coach, FIBC and/or Global", link: null },
            { task: "Global should be included if no FIBC is present", link: null },
          ],
        },
        {
          title: "Start 3-Way Messages",
          checklist: [
            { task: "Start 3-way messages with potential clients", link: null },
            { task: "ALWAYS include your mentoring coach and follow the script to set up the message", link: null },
          ],
        },
        {
          title: "Set Up Health Assessments",
          checklist: [
            { task: "Set up Health Assessments with your mentoring coach", link: null },
            { task: "Your mentors will lead for the first 5-8 Potential client calls", link: null },
          ],
        },
        {
          title: "When Someone Says YES to Program - Get This Information",
          checklist: [
            { task: "Shipping address", link: null },
            { task: "Email", link: null },
            { task: "Form of payment", link: null },
            { task: "Allergies/intolerances", link: null },
            { task: "Do they take thyroid medicine, Coumadin, have Afib or gout. Ask about GLP-1", link: null },
          ],
          content: "DO NOT send a preference sheet. Let the client know you will take this off their plate and will enter their order with a mix of \"crowd favorites.\" Enter the order within 12 hours of getting payment information.",
        },
        {
          title: "After the Order is Placed",
          checklist: [
            { task: "Add to Client Page on Facebook", link: null },
            { task: "Send New Client Welcome Text", link: null },
            { task: "Send New Client Videos (Journey Kick Off and Lean & Green) and confirm they can attend the group Kickoff Call or Schedule a voice-to-voice kickoff call", link: null },
            { task: "Short follow-up call after the Kickoff Call to answer any questions", link: null },
          ],
          footer: "Clients should always start on a Monday so they will be fully in fat burn before the weekend. We run a Team Kickoff Call on Sundays at 5pm. You must be on any Kickoff Call you have clients on, but this saves you time and ensures they get the importance of the MENTAL part of this program.",
        },
        {
          title: "Client Journey Kickoff Call",
          callout: {
            day: "SUNDAY",
            time: "5 pm EST / 4 PM CST / 3 PM MST / 2 PM PST",
            zoom: "ZOOM ID: 336 558 7242",
            passcode: "Passcode: OPTAVIA",
          },
        },
        {
          title: "Client Support Week One",
          checklist: [
            { task: "Day Before Kickoff: Confirm their Kickoff Call time", link: null },
            { task: "Send 5 Success Tips", link: null },
          ],
        },
        {
          title: "Client Support Days 1-8",
          content: "SEND DAILY TEXT MESSAGES AND SCHEDULE 5 MINUTE CHECK IN CALL",
          checklist: [
            { task: "DAY 1 - Daily text + 5 min check-in call", link: null },
            { task: "DAY 2 - Daily text + 5 min check-in call", link: null },
            { task: "DAY 3 - Daily text + 5 min check-in call", link: null },
            { task: "DAY 4 - Daily text + 5 min check-in call", link: null },
            { task: "DAY 5 - Daily text + 5 min check-in call", link: null },
            { task: "DAY 6 - Daily text + 5 min check-in call", link: null },
            { task: "DAY 7 - Daily text + 5 min check-in call", link: null },
            { task: "DAY 8 - Daily text + 5 min check-in call", link: null },
          ],
        },
        {
          title: "Schedule Week One Celebration Call",
          checklist: [
            { task: "Schedule Week One Celebration Call with your Mentorship Team", link: null },
          ],
        },
        {
          title: "Weeks Two Through Four",
          checklist: [
            { task: "10 minute check-in call each week", link: null },
          ],
        },
        {
          title: "Month One Celebration",
          checklist: [
            { task: "Month 1 Celebration Call with a Mentor", link: null },
          ],
        },
      ],
      keyTakeaways: [
        "Always start clients on a Monday for optimal results",
        "Your mentors lead the first 5-8 Health Assessment calls - watch and learn",
        "Daily contact in week one is critical for client success",
        "Never send preference sheets - you handle the order with crowd favorites",
      ],
    },
  },
]

export function WelcomeOrientationContent() {
  const { toast } = useToast()
  const { user } = useAuth()
  const { completedResources, toggleCompletedResource, loading } = useSupabaseData(user)
  const [expandedLesson, setExpandedLesson] = useState(lessons[0].id)

  // Map lesson IDs to resource IDs for database tracking
  const getResourceId = (lessonId: string) => `welcome-orientation-${lessonId}`

  // Load completed lessons from database
  const completedLessons = new Set(
    lessons
      .map((lesson) => lesson.id)
      .filter((lessonId) => completedResources.includes(getResourceId(lessonId)))
  )

  // Load expanded lesson from localStorage (UI preference only)
  useEffect(() => {
    const saved = localStorage.getItem("welcomeOrientationExpanded")
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

  // Save expanded lesson to localStorage (UI preference only)
  useEffect(() => {
    localStorage.setItem("welcomeOrientationExpanded", JSON.stringify(expandedLesson))
  }, [expandedLesson])

  const toggleComplete = async (lessonId: string) => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to track your progress.",
        variant: "destructive",
      })
      return
    }

    const resourceId = getResourceId(lessonId)
    await toggleCompletedResource(resourceId)

    const isNowCompleted = !completedLessons.has(lessonId)
    toast({
      title: isNowCompleted ? "Lesson completed!" : "Lesson unmarked",
      description: isNowCompleted ? "Great progress! Your coach can see this." : "You can complete it later.",
    })
  }

  const completedCount = completedLessons.size
  const progressPercent = lessons.length > 0 ? Math.round((completedCount / lessons.length) * 100) : 0

  const currentLessonIndex = lessons.findIndex((l) => l.id === expandedLesson)
  const currentLesson = lessons[currentLessonIndex]
  const prevLesson = currentLessonIndex > 0 ? lessons[currentLessonIndex - 1] : null
  const nextLesson = currentLessonIndex < lessons.length - 1 ? lessons[currentLessonIndex + 1] : null

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-8">
      {/* Sidebar - Lesson Navigation */}
      <aside className="space-y-6">
        {/* Progress Card */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <span className="font-semibold text-optavia-dark text-sm">Module Progress</span>
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
          <CardHeader className="pb-3">
            <CardTitle className="text-xs uppercase tracking-wide text-slate-500">
              Lessons in this Module
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {lessons.map((lesson, index) => {
              const Icon = lesson.icon
              const isActive = expandedLesson === lesson.id
              const isComplete = completedLessons.has(lesson.id)

              return (
                <button
                  key={lesson.id}
                  onClick={() => setExpandedLesson(lesson.id)}
                  className={`w-full p-4 flex items-start gap-3 border-b border-slate-100 last:border-0 transition-colors text-left ${
                    isActive ? "bg-green-50 border-l-4 border-l-[hsl(var(--optavia-green))]" : "bg-white hover:bg-slate-50"
                  }`}
                >
                  <div className="mt-0.5 flex-shrink-0">
                    {isComplete ? (
                      <CheckCircle className="h-5 w-5 text-[hsl(var(--optavia-green))]" />
                    ) : (
                      <Circle className="h-5 w-5 text-slate-300" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-[hsl(var(--optavia-green))] mb-1">
                      {lesson.id}
                    </div>
                    <div className={`text-sm font-semibold mb-2 ${isActive ? "text-[hsl(var(--optavia-green))]" : "text-optavia-dark"}`}>
                      {lesson.title}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded">
                        <Icon className="h-3 w-3" />
                        {lesson.type}
                      </span>
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
      </aside>

      {/* Main Content */}
      <main>
        <Card>
          {/* Content Header */}
          <CardHeader className="border-b border-slate-200">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-xs font-semibold text-[hsl(var(--optavia-green))] uppercase tracking-wide mb-1">
                  Lesson {currentLesson.id}
                </div>
                <CardTitle className="text-2xl">{currentLesson.title}</CardTitle>
              </div>
              <Button
                onClick={() => toggleComplete(currentLesson.id)}
                variant={completedLessons.has(currentLesson.id) ? "default" : "outline"}
                className={completedLessons.has(currentLesson.id) ? "bg-[hsl(var(--optavia-green))] hover:bg-[hsl(var(--optavia-green-dark))]" : ""}
              >
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

          {/* Content Body */}
          <CardContent className="p-8">
            {/* Intro */}
            <div className="mb-8 p-5 bg-green-50 border-l-4 border-[hsl(var(--optavia-green))] rounded-r-lg">
              <p className="text-base leading-relaxed text-slate-700 m-0">{currentLesson.content.intro}</p>
            </div>

            {/* Sections */}
            {currentLesson.content.sections.map((section, idx) => (
              <div key={idx} className="mb-8">
                <h3 className="text-lg font-bold text-optavia-dark mb-3 flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full bg-gradient-to-br from-[hsl(var(--optavia-green))] to-[#00c853] text-white flex items-center justify-center text-sm font-bold">
                    {idx + 1}
                  </span>
                  {section.title}
                </h3>

                {section.content && (
                  <p className="text-base leading-relaxed text-slate-600 ml-10">{section.content}</p>
                )}

                {section.bullets && (
                  <ul className="ml-10 space-y-2 list-none">
                    {section.bullets.map((bullet, i) => {
                      const firstWord = bullet.split(" ")[0]
                      const rest = bullet.split(" ").slice(1).join(" ")
                      return (
                        <li key={i} className="text-base text-slate-600 flex items-start gap-2">
                          <span className="text-[hsl(var(--optavia-green))] font-bold mt-0.5">→</span>
                          <span>
                            <strong className="text-[hsl(var(--optavia-green))]">{firstWord}</strong> {rest}
                          </span>
                        </li>
                      )
                    })}
                  </ul>
                )}

                {section.footer && (
                  <p className="text-base leading-relaxed text-slate-600 ml-10 italic mt-4">{section.footer}</p>
                )}

                {section.callout && (
                  <div className="ml-10 mt-4 p-6 bg-gradient-to-r from-[hsl(var(--optavia-green))] to-[#008542] rounded-xl text-white text-center">
                    <div className="text-xl font-bold mb-2">{section.callout.day}</div>
                    <div className="text-base mb-3">{section.callout.time}</div>
                    <div className="flex justify-center gap-6 text-sm opacity-95">
                      <span>{section.callout.zoom}</span>
                      <span>{section.callout.passcode}</span>
                    </div>
                  </div>
                )}

                {section.checklist && (
                  <div className="ml-10 mt-4 space-y-1">
                    {section.checklist.map((item, i) => (
                      <div
                        key={i}
                        className={`flex items-center gap-3 p-3 rounded-lg ${
                          i % 2 === 0 ? "bg-slate-50" : "bg-white"
                        }`}
                      >
                        <div className="w-5 h-5 border-2 border-[hsl(var(--optavia-green))] rounded flex-shrink-0" />
                        <span className="flex-1 text-sm text-slate-700">{item.task}</span>
                        {item.link && (
                          <span className="text-xs font-semibold text-[hsl(var(--optavia-green))]">
                            → {item.link}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {section.glossary && (
                  <div className="ml-10 mt-4 space-y-2">
                    {section.glossary.map((item, i) => (
                      <div
                        key={i}
                        className={`p-4 rounded-lg border-l-4 border-[hsl(var(--optavia-green))] ${
                          i % 2 === 0 ? "bg-slate-50" : "bg-white"
                        }`}
                      >
                        <div className="flex items-baseline gap-3 mb-2">
                          <span className="text-lg font-bold text-[hsl(var(--optavia-green))]">{item.term}</span>
                          <span className="text-sm text-slate-500">{item.full}</span>
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed m-0">{item.definition}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Key Takeaways */}
            {currentLesson.content.keyTakeaways && (
              <div className="mt-10 p-6 bg-amber-50 border border-amber-200 rounded-xl">
                <h4 className="m-0 mb-4 text-base font-bold text-amber-900 flex items-center gap-2">
                  <Star className="h-4 w-4 fill-amber-600" />
                  Key Takeaways
                </h4>
                <ul className="m-0 pl-6 space-y-2">
                  {currentLesson.content.keyTakeaways.map((takeaway, i) => (
                    <li key={i} className="text-sm text-slate-700 leading-relaxed">
                      {takeaway}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>

          {/* Navigation Footer */}
          <div className="p-5 border-t border-slate-200 bg-slate-50 flex justify-between items-center">
            {prevLesson ? (
              <Button
                variant="outline"
                onClick={() => setExpandedLesson(prevLesson.id)}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Previous: {prevLesson.title}
              </Button>
            ) : (
              <div />
            )}

            {nextLesson ? (
              <Button
                onClick={() => setExpandedLesson(nextLesson.id)}
                className="flex items-center gap-2 bg-[hsl(var(--optavia-green))] hover:bg-[hsl(var(--optavia-green-dark))]"
              >
                Next: {nextLesson.title}
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                className="flex items-center gap-2 bg-[hsl(var(--optavia-green))] hover:bg-[hsl(var(--optavia-green-dark))]"
              >
                Continue to Module 1.2: Business Setup
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </Card>
      </main>
    </div>
  )
}
