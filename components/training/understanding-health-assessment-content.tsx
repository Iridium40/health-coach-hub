"use client"

import { useState, useEffect } from "react"
import { CheckCircle, Circle, ChevronRight, Play, FileText, Clock, Star, ArrowLeft, ArrowRight, Phone, MessageSquare, HelpCircle, Target, Heart, AlertTriangle, CheckSquare, XCircle, Lightbulb, Users, Volume2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"
import { useSupabaseData } from "@/hooks/use-supabase-data"

interface Lesson {
  id: string
  title: string
  type: "Video" | "Document"
  icon: typeof Target
  duration: string
  videoType?: "vimeo" | "youtube"
  videoId?: string
  content: {
    intro: string
    sections: Array<{
      title: string
      content?: string
      bullets?: string[]
      roleSteps?: Array<{
        phase: string
        role: string
        description: string
      }>
      haFlow?: Array<{
        step: number
        title: string
        duration: string
        description: string
        example: string
      }>
      listeningSkills?: Array<{
        skill: string
        description: string
      }>
      afterSteps?: Array<{
        action: string
        description: string
      }>
      openers?: Array<{
        trigger: string
        response: string
      }>
      transitionQuestions?: string[]
      threeWaySteps?: Array<{
        step: number
        action: string
        script: string
      }>
      objections?: Array<{
        objection: string
        category: string
        understanding: string
        responses: string[]
        tip: string
      }>
      framework?: Array<{
        letter: string
        word: string
        description: string
      }>
      noResponse?: string[]
      donts?: string[]
      callout?: {
        type: "info" | "warning" | "tip"
        title: string
        content: string
      }
      note?: string
    }>
    keyTakeaways: string[]
  }
}

const lessons: Lesson[] = [
  {
    id: "1.4.1",
    title: "How to Nail the Health Assessment",
    type: "Document",
    icon: Target,
    duration: "12 min read",
    content: {
      intro: "The Health Assessment (HA) is the heart of client acquisition. As a new coach, you'll OBSERVE your mentor doing these calls before you lead them yourself. This lesson helps you understand what's happening so you can learn effectively while watching.",
      sections: [
        {
          title: "What IS a Health Assessment?",
          content: "A Health Assessment is a conversation - NOT a sales pitch. It's a discovery call where you learn about someone's health goals, struggles, and what they've tried before. The goal is to determine if OPTAVIA is a good fit for THEM.",
          callout: {
            type: "tip",
            title: "The Mindset Shift",
            content: "You're not trying to convince anyone to buy anything. You're having a genuine conversation to see if you can help. If OPTAVIA isn't right for them, that's okay! The HA helps both of you figure that out.",
          },
        },
        {
          title: "Your Role as a New Coach",
          content: "In your first weeks, your job is to LISTEN and LEARN:",
          roleSteps: [
            { phase: "Week 1-2", role: "Silent Observer", description: "Join calls on mute. Take notes on what your mentor asks and how they respond." },
            { phase: "Week 3-4", role: "Active Listener", description: "Start to notice patterns. What questions work? How does the mentor handle objections?" },
            { phase: "Week 5+", role: "Supported Lead", description: "With mentor on the call, you start leading portions. They're there to help if needed." },
          ],
          note: "Every coach learns at their own pace. Don't rush this process!",
        },
        {
          title: "The Flow of a Great Health Assessment",
          content: "While every conversation is different, great HAs tend to follow this general structure:",
          haFlow: [
            {
              step: 1,
              title: "Warm Connection",
              duration: "2-3 min",
              description: "Build rapport. Ask about their day. Find something in common. Make them feel comfortable.",
              example: '"Thanks so much for taking the time to chat! How\'s your day going?"',
            },
            {
              step: 2,
              title: "Understand Their 'Why'",
              duration: "5-7 min",
              description: "Ask open-ended questions about their health goals and what's driving them to make a change NOW.",
              example: '"What made you reach out today? What\'s going on with your health that you want to change?"',
            },
            {
              step: 3,
              title: "Explore Their History",
              duration: "3-5 min",
              description: "Learn what they've tried before. What worked? What didn't? Why?",
              example: '"What have you tried in the past? What worked and what didn\'t work for you?"',
            },
            {
              step: 4,
              title: "Paint the Picture",
              duration: "3-5 min",
              description: "Help them envision success. What would life look like if they achieved their goals?",
              example: '"If we fast forward 6 months and you\'ve hit your goals, what\'s different about your life?"',
            },
            {
              step: 5,
              title: "Share Your Story",
              duration: "2-3 min",
              description: "Briefly share your own transformation and why you became a coach. Keep it relevant to their situation.",
              example: '"I totally understand that struggle. Let me share what happened for me..."',
            },
            {
              step: 6,
              title: "Explain the Program",
              duration: "3-5 min",
              description: "Based on what they've shared, explain how OPTAVIA addresses their specific concerns.",
              example: '"Based on what you\'ve told me, here\'s how this program could work for you..."',
            },
            {
              step: 7,
              title: "Address Questions",
              duration: "5+ min",
              description: "Answer their questions honestly. If you don't know, say so - your mentor can help!",
              example: '"What questions do you have? I want to make sure you have everything you need."',
            },
            {
              step: 8,
              title: "Clear Next Step",
              duration: "2-3 min",
              description: "If they're ready, help them get started. If not, set a clear follow-up.",
              example: '"Are you ready to get started, or would you like some time to think about it?"',
            },
          ],
        },
        {
          title: "Key Listening Skills",
          content: "Great health assessors are great LISTENERS. Watch for these skills in your mentor:",
          listeningSkills: [
            { skill: "Asking Open Questions", description: "Questions that can't be answered with just 'yes' or 'no'" },
            { skill: "Reflective Listening", description: "Repeating back what they heard to confirm understanding" },
            { skill: "Comfortable Silence", description: "Giving the person space to think and share more" },
            { skill: "Empathy Statements", description: '"I totally understand" or "That sounds really frustrating"' },
            { skill: "Not Interrupting", description: "Letting the person finish their thought completely" },
          ],
        },
        {
          title: "What NOT to Do",
          donts: [
            "Don't talk more than you listen (aim for 70% them, 30% you)",
            "Don't rush to 'close the sale' - this isn't a sales pitch",
            "Don't make promises about specific results or timeframes",
            "Don't get defensive if they have concerns or objections",
            "Don't pressure or create false urgency",
            "Don't compare OPTAVIA to other programs negatively",
          ],
        },
        {
          title: "After the Call",
          content: "What happens after the HA is just as important:",
          afterSteps: [
            { action: "Debrief with Mentor", description: "Discuss what went well and what you learned" },
            { action: "Send Thank You", description: "A simple message thanking them for their time" },
            { action: "Follow Up Plan", description: "If they didn't start, set a reminder to check in" },
            { action: "Notes", description: "Write down key details about their goals and concerns" },
          ],
        },
      ],
      keyTakeaways: [
        "A Health Assessment is a conversation, not a sales pitch",
        "Your job as a new coach is to OBSERVE and LEARN first",
        "Listen more than you talk (70/30 rule)",
        "Every great coach started by watching their mentor",
      ],
    },
  },
  {
    id: "1.4.2",
    title: "How to Back Into a Health Assessment",
    type: "Video",
    icon: MessageSquare,
    duration: "8 min video",
    videoType: "vimeo",
    videoId: "671134401",
    content: {
      intro: "Not every Health Assessment starts with someone saying 'I want to learn about OPTAVIA.' Often, the best conversations start naturally. This video shows you how to turn everyday conversations into opportunities for health assessments.",
      sections: [
        {
          title: "What Does 'Backing In' Mean?",
          content: '"Backing into" a Health Assessment means starting from a natural conversation and transitioning to a discussion about health goals. It\'s the opposite of a cold pitch - it\'s warm, authentic, and based on genuine interest in the other person.',
          callout: {
            type: "tip",
            title: "The Natural Approach",
            content: "When someone comments on your transformation or energy, that's a natural opening. You're not selling - you're responding to their curiosity.",
          },
        },
        {
          title: "Common Conversation Starters",
          content: "Watch for these natural openings in everyday conversations:",
          openers: [
            { trigger: '"You look great! What are you doing?"', response: "Thank them, share briefly, then ask about THEIR goals" },
            { trigger: '"I need to lose weight but nothing works"', response: "Express empathy, ask what they've tried, listen" },
            { trigger: '"I wish I had your energy"', response: "Share what changed for you, ask about their energy levels" },
            { trigger: '"My doctor says I need to get healthier"', response: "Ask what the doctor recommended, what they're considering" },
            { trigger: '"I\'m so tired of feeling this way"', response: "Ask them to tell you more, understand their frustration" },
          ],
        },
        {
          title: "The Transition Question",
          content: "The key to backing into an HA is the transition question. After listening to their situation, ask:",
          transitionQuestions: [
            '"Would you be open to hearing what worked for me?"',
            '"Can I share what made the difference for me?"',
            '"Would it be helpful if I told you about my experience?"',
            '"What if I could connect you with something that actually works?"',
          ],
          note: "Notice how each question asks PERMISSION. You're not pushing - you're offering.",
        },
        {
          title: "What You'll Learn in This Video",
          content: "This training covers:",
          bullets: [
            "How to recognize natural openings in conversation",
            "The exact language to use for transitions",
            "How to move from casual chat to a scheduled call",
            "When to involve your mentor (hint: early!)",
            "Real examples of backing-in conversations",
          ],
        },
        {
          title: "The 3-Way Message Connection",
          content: "When you identify someone interested, bring in your mentor through a 3-way message:",
          threeWaySteps: [
            {
              step: 1,
              action: "Get permission",
              script: '"Hey, I\'d love to connect you with my mentor who can explain this better than me. Can I add them to our chat?"',
            },
            {
              step: 2,
              action: "Add mentor",
              script: '"[Mentor name], this is [friend name]. She\'s been asking about what I\'ve been doing for my health..."',
            },
            {
              step: 3,
              action: "Let mentor lead",
              script: "Your mentor takes over the conversation from here",
            },
          ],
        },
      ],
      keyTakeaways: [
        "Natural conversations are the best path to Health Assessments",
        "Always ask permission before sharing your story",
        "Bring your mentor into conversations early via 3-way message",
        "Listen first, share second - their interest opens the door",
      ],
    },
  },
  {
    id: "1.4.3",
    title: "Common Objections and How to Address Them",
    type: "Document",
    icon: HelpCircle,
    duration: "15 min read",
    content: {
      intro: "Objections aren't rejections - they're questions in disguise. When someone raises a concern, they're often saying 'Help me understand this better.' This guide helps you recognize common objections and respond with empathy and honesty.",
      sections: [
        {
          title: "The Right Mindset About Objections",
          content: "Before diving into specific objections, understand this: objections mean someone is THINKING about it. If they weren't interested, they'd just say no. An objection is often a request for more information or reassurance.",
          callout: {
            type: "tip",
            title: "The Golden Rule",
            content: "Never argue with an objection. Acknowledge it, empathize with it, and then address it. 'I totally understand that concern. A lot of people feel that way at first...'",
          },
        },
        {
          title: "Common Objections & Responses",
          objections: [
            {
              objection: "It's too expensive",
              category: "Cost",
              understanding: "They may not realize what's included, or they're comparing to grocery costs without considering the coaching, structure, and convenience.",
              responses: [
                '"I totally understand - I felt the same way at first. Can I ask what you\'re currently spending on food, coffee, eating out, and snacks each month?"',
                '"What\'s included is actually 5 out of 6 of your daily meals, plus a free coach. When I broke it down, it was actually less than I was spending before."',
                '"What would it cost you NOT to get healthy? In terms of medical bills, energy, missing out on life with your family?"',
              ],
              tip: "Help them see the VALUE, not just the price. This includes their time, the coaching, the simplicity, and the results.",
            },
            {
              objection: "I need to think about it",
              category: "Timing",
              understanding: "This is often a polite way of saying they have concerns they haven't voiced. Or they may genuinely need time to process.",
              responses: [
                '"Absolutely, this is a big decision. What specifically do you want to think about? Maybe I can help answer some questions."',
                '"Of course! Can I ask - what would help you make a decision? Is there information you need?"',
                '"I respect that. When would be a good time to follow up? I don\'t want you to forget about your goals."',
              ],
              tip: "Try to uncover the REAL concern. Often 'I need to think about it' means something else is on their mind.",
            },
            {
              objection: "I've tried everything and nothing works",
              category: "Doubt",
              understanding: "They're frustrated from past failures. They're protecting themselves from another disappointment.",
              responses: [
                '"I completely understand that frustration. I felt the exact same way. Can I ask - what have you tried before?"',
                '"That\'s actually why this is different - you get a personal coach (me!) supporting you every single day. You\'re never alone."',
                '"What made those other things not work for you? Let me explain why this is different..."',
              ],
              tip: "Acknowledge their frustration genuinely. Then focus on what makes OPTAVIA different: the coaching, the community, the structured approach.",
            },
            {
              objection: "I don't have time to cook",
              category: "Lifestyle",
              understanding: "They may think OPTAVIA requires extensive meal prep. They don't realize how simple it is.",
              responses: [
                '"That\'s actually one of the best parts - 5 out of 6 meals are grab-and-go Fuelings. The only meal you prepare is one Lean & Green, and I have 15-minute recipes!"',
                '"I get it - I was crazy busy too. This actually SAVED me time because I wasn\'t constantly thinking about what to eat."',
                '"What if I told you this takes LESS time than what you\'re doing now?"',
              ],
              tip: "This is often an easy objection to address once they understand the simplicity of the program.",
            },
            {
              objection: "My spouse/family won't support me",
              category: "Support",
              understanding: "They're worried about pushback at home, or they've faced this in past diet attempts.",
              responses: [
                '"That\'s a real concern. Can I ask - what specifically are you worried they\'ll say?"',
                '"Would it help if I hopped on a call with you and your spouse together? Sometimes hearing from someone else helps."',
                '"A lot of people find that once their family SEES the results, they become their biggest supporters."',
              ],
              tip: "Offer to include the spouse in a conversation. Often resistance comes from misunderstanding.",
            },
            {
              objection: "I don't like the taste of meal replacements",
              category: "Product",
              understanding: "They may have had bad experiences with other brands, or they're assuming all shakes taste the same.",
              responses: [
                '"Have you tried OPTAVIA specifically, or are you thinking of other brands? There\'s a huge difference."',
                '"I was skeptical too! There are over 60 Fuelings to choose from - bars, shakes, soups, even mac & cheese and brownies."',
                '"What kinds of foods do you normally enjoy? I can point you to Fuelings that fit your taste."',
              ],
              tip: "Don't argue about taste - offer variety and let them try options.",
            },
            {
              objection: "I'll just do it on my own",
              category: "Independence",
              understanding: "They may not value coaching, or they're confident they can figure it out themselves.",
              responses: [
                '"I respect that! Can I ask - what\'s your plan? And what\'s been stopping you from starting already?"',
                '"I thought that too. What I found is that having daily support made the difference between trying and succeeding."',
                '"The coaching is really what sets this apart. You get someone in your corner every single day."',
              ],
              tip: "Don't push - but help them see the value of support and accountability.",
            },
            {
              objection: "Is this a pyramid scheme / MLM?",
              category: "Business Model",
              understanding: "They've heard negative things about network marketing, or they're skeptical of the business model.",
              responses: [
                '"I totally get why you\'d ask that. OPTAVIA is a legitimate company that\'s been around for over 40 years. The products are real, and you only pay for what you use."',
                '"The coaching is free - you\'re only paying for your food. I don\'t make money unless you actually get results and want to continue."',
                '"I was skeptical too. What helped me was seeing that this is really about the health transformation, not about recruiting."',
              ],
              tip: "Be honest and transparent. Don't get defensive. Focus on the product and results.",
            },
          ],
        },
        {
          title: "The LAER Framework",
          content: "Use this framework for any objection:",
          framework: [
            { letter: "L", word: "Listen", description: "Let them fully express their concern without interrupting" },
            { letter: "A", word: "Acknowledge", description: '"I totally understand" or "That\'s a great question"' },
            { letter: "E", word: "Explore", description: "Ask questions to understand the real concern beneath the surface" },
            { letter: "R", word: "Respond", description: "Address their specific concern with honesty and empathy" },
          ],
        },
        {
          title: "When They Say 'No'",
          content: "Sometimes, despite your best efforts, someone will say no. That's okay!",
          noResponse: [
            "Thank them for their time and the conversation",
            "Leave the door open: \"If anything changes, I'm here for you\"",
            "Ask if you can check in later: \"Mind if I follow up in a few months?\"",
            "Don't take it personally - it's not about you",
            "Remember: a 'no' now might be a 'yes' later",
          ],
          callout: {
            type: "info",
            title: "The Long Game",
            content: "Many successful coaches have stories of clients who said 'no' multiple times before finally saying 'yes.' Stay in touch, keep posting your journey, and be there when they're ready.",
          },
        },
      ],
      keyTakeaways: [
        "Objections are questions in disguise - they mean someone is thinking about it",
        "Never argue - acknowledge, empathize, then address",
        "Use the LAER framework: Listen, Acknowledge, Explore, Respond",
        "A 'no' today might be a 'yes' tomorrow - leave doors open",
      ],
    },
  },
]

export function UnderstandingHealthAssessmentContent() {
  const { toast } = useToast()
  const { user } = useAuth()
  const { completedResources, toggleCompletedResource, loading } = useSupabaseData(user)
  const [expandedLesson, setExpandedLesson] = useState(lessons[0].id)
  const [expandedObjection, setExpandedObjection] = useState<number | null>(null)

  // Map lesson IDs to resource IDs for database tracking
  const getResourceId = (lessonId: string) => `health-assessment-${lessonId}`

  // Load completed lessons from database
  const completedLessons = new Set(
    lessons
      .map((lesson) => lesson.id)
      .filter((lessonId) => completedResources.includes(getResourceId(lessonId)))
  )

  // Load expanded lesson from localStorage (UI preference only)
  useEffect(() => {
    const saved = localStorage.getItem("healthAssessmentExpanded")
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
    localStorage.setItem("healthAssessmentExpanded", JSON.stringify(expandedLesson))
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

  const renderCallout = (callout: { type: "info" | "warning" | "tip"; title: string; content: string }) => {
    const colors = {
      info: { bg: "bg-blue-50", border: "border-blue-500", text: "text-blue-900", iconColor: "text-blue-600" },
      warning: { bg: "bg-amber-50", border: "border-amber-500", text: "text-amber-900", iconColor: "text-amber-600" },
      tip: { bg: "bg-green-50", border: "border-green-500", text: "text-green-900", iconColor: "text-green-600" },
    }
    const style = colors[callout.type] || colors.info

    return (
      <div className={`${style.bg} ${style.border} border-l-4 p-4 rounded-lg mt-4`}>
        <div className={`flex items-center gap-2 font-semibold ${style.text} mb-2`}>
          <Lightbulb className={`h-5 w-5 ${style.iconColor}`} />
          {callout.title}
        </div>
        <p className={`${style.text} text-sm`}>{callout.content}</p>
      </div>
    )
  }

  const renderVideoEmbed = (lesson: Lesson) => {
    if (lesson.videoType === "vimeo" && lesson.videoId) {
      return (
        <div className="relative w-full pb-[56.25%] h-0 overflow-hidden rounded-lg mb-8 shadow-lg">
          <iframe
            src={`https://player.vimeo.com/video/${lesson.videoId}?badge=0&autopause=0&player_id=0&app_id=58479`}
            className="absolute top-0 left-0 w-full h-full border-0"
            allow="autoplay; fullscreen; picture-in-picture"
            title={lesson.title}
          />
        </div>
      )
    }
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-[hsl(var(--optavia-green))] to-[hsl(var(--optavia-green-dark))] text-white py-8 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 text-sm opacity-90 mb-2 uppercase tracking-wide">
            <span>Training Center</span>
            <ChevronRight className="h-4 w-4" />
            <span>Phase 1: Pre-Launch</span>
            <ChevronRight className="h-4 w-4" />
            <span className="font-semibold">Module 1.4</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Understanding the Health Assessment</h1>
          <p className="text-lg opacity-90 max-w-2xl">
            Learn before you observe - understand what you'll see your mentors doing so you can learn effectively.
          </p>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid lg:grid-cols-[320px_1fr] gap-8">
          {/* Sidebar */}
          <aside className="space-y-6">
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
                <CardTitle className="text-xs font-semibold text-optavia-gray uppercase tracking-wide">
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
                      className={`w-full p-4 flex items-start gap-3 border-b border-gray-100 last:border-b-0 transition-colors text-left ${
                        isActive ? "bg-green-50 border-l-4 border-l-[hsl(var(--optavia-green))]" : "hover:bg-gray-50"
                      }`}
                    >
                      <div className="mt-1">
                        {isComplete ? (
                          <CheckCircle className="h-5 w-5 text-[hsl(var(--optavia-green))]" />
                        ) : (
                          <Circle className="h-5 w-5 text-gray-300" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-[hsl(var(--optavia-green))] mb-1">
                          {lesson.id}
                        </div>
                        <div className={`text-sm font-semibold mb-2 ${isActive ? "text-[hsl(var(--optavia-green))]" : "text-optavia-dark"}`}>
                          {lesson.title}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-optavia-gray">
                          <Badge
                            variant="outline"
                            className={`text-xs ${
                              lesson.type === "Video" ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-gray-50"
                            }`}
                          >
                            {lesson.type === "Video" && <Play className="h-3 w-3 mr-1" />}
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

            {/* Reminder Card */}
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardHeader>
                <div className="flex items-center gap-2 font-semibold text-blue-900 mb-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  Your Role Right Now
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-blue-900 leading-relaxed">
                  As a new coach, your job is to <strong>observe and learn</strong>. You'll join Health Assessment calls with your mentor before leading them yourself.
                </p>
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
                    <div className="flex items-center gap-2 text-xs font-semibold text-[hsl(var(--optavia-green))] uppercase tracking-wide mb-2">
                      <span>Lesson {currentLesson.id}</span>
                      {currentLesson.type === "Video" && (
                        <Badge className="bg-amber-100 text-amber-700 border-amber-200">
                          <Play className="h-3 w-3 mr-1" />
                          VIDEO
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-2xl font-bold text-optavia-dark">{currentLesson.title}</CardTitle>
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

              <CardContent className="p-8">
                {/* Video Embed */}
                {currentLesson.videoType && renderVideoEmbed(currentLesson)}

                {/* Intro */}
                <div className="bg-green-50 border-l-4 border-[hsl(var(--optavia-green))] p-5 rounded-lg mb-8">
                  <p className="text-base leading-relaxed text-optavia-dark">{currentLesson.content.intro}</p>
                </div>

                {/* Sections */}
                {currentLesson.content.sections.map((section, idx) => (
                  <div key={idx} className="mb-8">
                    <h3 className="text-lg font-bold text-optavia-dark mb-4 flex items-center gap-3">
                      <span className="w-7 h-7 rounded-full bg-gradient-to-br from-[hsl(var(--optavia-green))] to-[hsl(var(--optavia-green-dark))] text-white flex items-center justify-center text-sm font-bold">
                        {idx + 1}
                      </span>
                      {section.title}
                    </h3>

                    {section.content && (
                      <p className="text-base leading-relaxed text-optavia-gray ml-10 mb-4">{section.content}</p>
                    )}

                    {section.bullets && (
                      <ul className="ml-10 space-y-2 mb-4">
                        {section.bullets.map((bullet, i) => (
                          <li key={i} className="text-base text-optavia-gray flex items-start gap-2">
                            <span className="text-[hsl(var(--optavia-green))] mt-1">•</span>
                            <span>{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    {section.callout && renderCallout(section.callout)}

                    {/* Role Steps */}
                    {section.roleSteps && (
                      <div className="ml-10 mt-4 space-y-3">
                        {section.roleSteps.map((item, i) => (
                          <div
                            key={i}
                            className={`flex gap-4 p-5 rounded-lg ${
                              i === 2 ? "bg-green-50 border-2 border-[hsl(var(--optavia-green))]" : "bg-gray-50 border border-gray-200"
                            }`}
                          >
                            <div
                              className={`min-w-[80px] px-3 py-2 rounded text-xs font-bold text-center ${
                                i === 2 ? "bg-[hsl(var(--optavia-green))] text-white" : "bg-gray-200 text-gray-700"
                              }`}
                            >
                              {item.phase}
                            </div>
                            <div>
                              <div className="font-semibold text-optavia-dark mb-1">{item.role}</div>
                              <div className="text-sm text-optavia-gray">{item.description}</div>
                            </div>
                          </div>
                        ))}
                        {section.note && (
                          <p className="text-xs text-optavia-gray italic mt-2">{section.note}</p>
                        )}
                      </div>
                    )}

                    {/* HA Flow */}
                    {section.haFlow && (
                      <div className="ml-10 mt-4 space-y-4 relative">
                        {section.haFlow.map((item, i) => (
                          <div key={i} className="flex gap-4 relative">
                            {i < (section.haFlow?.length ?? 0) - 1 && (
                              <div className="absolute left-[18px] top-11 w-0.5 h-full bg-gray-300" />
                            )}
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[hsl(var(--optavia-green))] to-[hsl(var(--optavia-green-dark))] text-white flex items-center justify-center font-bold text-sm flex-shrink-0 z-10">
                              {item.step}
                            </div>
                            <div className="flex-1 p-5 bg-gray-50 rounded-lg">
                              <div className="flex justify-between items-center mb-2">
                                <span className="font-semibold text-optavia-dark">{item.title}</span>
                                <Badge className="bg-green-100 text-green-700 text-xs">
                                  {item.duration}
                                </Badge>
                              </div>
                              <p className="text-sm text-optavia-gray mb-3">{item.description}</p>
                              <div className="text-sm text-[hsl(var(--optavia-green))] italic p-3 bg-green-50 rounded-lg flex items-start gap-2">
                                <MessageSquare className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                <span>{item.example}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Listening Skills */}
                    {section.listeningSkills && (
                      <div className="ml-10 mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                        {section.listeningSkills.map((item, i) => (
                          <div key={i} className="p-4 bg-gray-50 rounded-lg border-l-4 border-[hsl(var(--optavia-green))]">
                            <div className="font-semibold text-[hsl(var(--optavia-green))] mb-1 text-sm">
                              {item.skill}
                            </div>
                            <div className="text-xs text-optavia-gray">{item.description}</div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Don'ts */}
                    {section.donts && (
                      <div className="ml-10 mt-4 space-y-2">
                        {section.donts.map((dont, i) => (
                          <div key={i} className="flex items-center gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
                            <XCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                            <span className="text-sm text-red-900">{dont}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* After Steps */}
                    {section.afterSteps && (
                      <div className="ml-10 mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                        {section.afterSteps.map((item, i) => (
                          <div key={i} className="p-4 bg-gray-50 rounded-lg">
                            <div className="font-semibold text-optavia-dark mb-1">{item.action}</div>
                            <div className="text-xs text-optavia-gray">{item.description}</div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Openers */}
                    {section.openers && (
                      <div className="ml-10 mt-4 space-y-3">
                        {section.openers.map((item, i) => (
                          <div key={i} className="p-4 bg-gray-50 rounded-lg">
                            <div className="text-sm font-semibold text-optavia-dark mb-2 p-2 bg-blue-50 rounded inline-block">
                              <Volume2 className="h-4 w-4 inline mr-2" />
                              {item.trigger}
                            </div>
                            <div className="text-sm text-[hsl(var(--optavia-green))] pl-3 border-l-2 border-[hsl(var(--optavia-green))]">
                              → {item.response}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Transition Questions */}
                    {section.transitionQuestions && (
                      <div className="ml-10 mt-4 space-y-2">
                        {section.transitionQuestions.map((q, i) => (
                          <div
                            key={i}
                            className={`flex items-center gap-3 p-4 rounded-lg ${
                              i === 0 ? "bg-green-50 border-2 border-[hsl(var(--optavia-green))]" : "bg-gray-50 border border-gray-200"
                            }`}
                          >
                            <MessageSquare className="h-4 w-4 text-[hsl(var(--optavia-green))] flex-shrink-0" />
                            <span className="text-sm text-optavia-dark italic">{q}</span>
                          </div>
                        ))}
                        {section.note && (
                          <p className="text-xs text-optavia-gray italic mt-3">{section.note}</p>
                        )}
                      </div>
                    )}

                    {/* 3-Way Steps */}
                    {section.threeWaySteps && (
                      <div className="ml-10 mt-4 space-y-3">
                        {section.threeWaySteps.map((item, i) => (
                          <div key={i} className="flex gap-4">
                            <div className="w-8 h-8 rounded-full bg-[hsl(var(--optavia-green))] text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                              {item.step}
                            </div>
                            <div className="flex-1 p-4 bg-gray-50 rounded-lg">
                              <div className="font-semibold text-optavia-dark mb-2">{item.action}</div>
                              <div className="text-xs text-optavia-gray italic p-3 bg-green-50 rounded-lg">
                                {item.script}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Objections */}
                    {section.objections && (
                      <div className="ml-10 mt-4 space-y-3">
                        {section.objections.map((obj, i) => (
                          <div key={i} className="border border-gray-200 rounded-lg overflow-hidden">
                            <button
                              onClick={() => setExpandedObjection(expandedObjection === i ? null : i)}
                              className={`w-full p-4 flex justify-between items-center text-left transition-colors ${
                                expandedObjection === i ? "bg-green-50" : "bg-gray-50 hover:bg-gray-50"
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <Badge className="bg-blue-100 text-blue-700 text-xs">
                                  {obj.category}
                                </Badge>
                                <span className="font-semibold text-optavia-dark">"{obj.objection}"</span>
                              </div>
                              <ChevronRight
                                className={`h-5 w-5 text-gray-500 transition-transform ${
                                  expandedObjection === i ? "rotate-90" : ""
                                }`}
                              />
                            </button>
                            {expandedObjection === i && (
                              <div className="p-5 bg-white space-y-4">
                                <div>
                                  <div className="text-xs font-semibold text-optavia-gray uppercase mb-2">
                                    Understanding This Objection
                                  </div>
                                  <p className="text-sm text-optavia-gray">{obj.understanding}</p>
                                </div>
                                <div>
                                  <div className="text-xs font-semibold text-optavia-gray uppercase mb-3">
                                    How to Respond
                                  </div>
                                  <div className="space-y-2">
                                    {obj.responses.map((resp, j) => (
                                      <div
                                        key={j}
                                        className="p-3 bg-gray-50 rounded-lg text-sm text-optavia-dark italic border-l-4 border-[hsl(var(--optavia-green))]"
                                      >
                                        {resp}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                                <div className="p-3 bg-amber-50 rounded-lg flex items-start gap-2 border border-amber-200">
                                  <Lightbulb className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                                  <span className="text-xs text-amber-900">
                                    <strong>Pro Tip:</strong> {obj.tip}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* LAER Framework */}
                    {section.framework && (
                      <div className="ml-10 mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                        {section.framework.map((item, i) => (
                          <div key={i} className="p-5 bg-gradient-to-br from-green-50 to-green-100 rounded-lg text-center">
                            <div className="w-12 h-12 rounded-full bg-[hsl(var(--optavia-green))] text-white flex items-center justify-center font-bold text-2xl mx-auto mb-3">
                              {item.letter}
                            </div>
                            <div className="font-semibold text-[hsl(var(--optavia-green))] mb-2">{item.word}</div>
                            <div className="text-xs text-optavia-gray">{item.description}</div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* No Response */}
                    {section.noResponse && (
                      <div className="ml-10 mt-4 space-y-2">
                        {section.noResponse.map((item, i) => (
                          <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <CheckSquare className="h-4 w-4 text-[hsl(var(--optavia-green))] flex-shrink-0" />
                            <span className="text-sm text-optavia-gray">{item}</span>
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
                  <Button variant="outline" onClick={() => (window.location.href = "/training/social-media-preparation")}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Module 1.3
                  </Button>
                )}

                {nextLesson ? (
                  <Button
                    onClick={() => setExpandedLesson(nextLesson.id)}
                    className="bg-[hsl(var(--optavia-green))] hover:bg-[hsl(var(--optavia-green-dark))] text-white"
                  >
                    Next: {nextLesson.title.split(" ").slice(0, 3).join(" ")}...
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    className="bg-[hsl(var(--optavia-green))] hover:bg-[hsl(var(--optavia-green-dark))] text-white"
                    onClick={() => window.history.back()}
                  >
                    🎉 Complete Phase 1 - Continue to Phase 2
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
