"use client"

import { useState, useEffect } from "react"
import { CheckCircle, Circle, ChevronRight, ChevronDown, FileText, Clock, Star, ArrowLeft, ArrowRight, MessageCircle, Send, Users, Copy, Check, Phone, Calendar, Heart, AlertTriangle, Lightbulb, ExternalLink, RefreshCw, UserPlus, MessageSquare, ThumbsUp, XCircle, Timer } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"
import { useSupabaseData } from "@/hooks/use-supabase-data"

interface Script {
  label?: string
  text: string
  note?: string
}

interface FrameworkItem {
  letter: string
  word: string
  description: string
}

interface AZStep {
  step: string
  title: string
  description: string
  example: string
}

interface StarterCategory {
  category: string
  scripts: string[]
}

interface BreakdownItem {
  percent: string
  label: string
  activities: string[]
}

interface QuestionItem {
  question: string
  why: string
}

interface DontItem {
  action: string
  why: string
}

interface OutcomeItem {
  status: string
  icon: string
  description: string
  nextStep: string
}

interface FollowUpItem {
  timing: string
  action: string
  script: string
}

interface TrackingTip {
  tip: string
  detail: string
}

interface MindsetPoint {
  point: string
  detail: string
}

interface Section {
  title: string
  content?: string
  context?: string
  bullets?: string[]
  callout?: {
    type: "info" | "warning" | "tip"
    title: string
    content: string
  }
  script?: Script
  tips?: string[]
  multipleScripts?: Script[]
  dosList?: string[]
  dontsList?: string[]
  framework?: FrameworkItem[]
  azSteps?: AZStep[]
  starters?: StarterCategory[]
  breakdown?: BreakdownItem[]
  proTip?: string
  questions?: QuestionItem[]
  pivotPhrases?: string[]
  responseScript?: Script
  donts?: DontItem[]
  outcomes?: OutcomeItem[]
  followUpSequence?: FollowUpItem[]
  ghostScripts?: Script[]
  noResponse?: {
    script: string
    after: string[]
  }
  trackingTips?: TrackingTip[]
  mindsetPoints?: MindsetPoint[]
}

interface Lesson {
  id: string
  title: string
  type: string
  icon: typeof MessageCircle
  duration: string
  canvaLink?: string
  content: {
    intro: string
    sections: Section[]
    keyTakeaways: string[]
  }
}

const lessons: Lesson[] = [
  {
    id: "2.2.1",
    title: "3-Way Message Scripts",
    type: "Scripts",
    icon: MessageCircle,
    duration: "10 min read",
    content: {
      intro: "The 3-way message is the foundation of how new coaches learn to convert interest into clients. Your mentor does the heavy lifting while you learn by watching. These are the EXACT scripts to use in every situation.",
      sections: [
        {
          title: "Why 3-Way Messages Work",
          content: "The 3-way message system works because it:",
          bullets: [
            "Gives credibility through your mentor's experience",
            "Takes pressure off you as a new coach",
            "Lets you learn by watching a pro in action",
            "Creates a warm, supportive environment for the prospect",
            "Allows you to focus on relationship while mentor handles details",
          ],
          callout: {
            type: "tip",
            title: "Your Job in a 3-Way",
            content: "Start the conversation, make the introduction, then let your mentor lead. Jump in to support with encouragement or your personal experience when it feels natural.",
          },
        },
        {
          title: "Script 1: Initial Introduction",
          context: "Use this when someone comments or messages asking for info about your transformation.",
          script: {
            label: "Opening Introduction",
            text: "Hi there! I'm so glad you reached out! This program has been AMAZING! I feel so good and it's been so simple! I'd love to help you—I'm including my coach [MENTOR NAME] here. She's an expert at figuring out which program is the best fit for your goals, and can help answer any questions!",
          },
          tips: [
            "Personalize by using their name",
            "Add your mentor to the group message AFTER sending this",
            "Keep your energy positive and excited",
          ],
        },
        {
          title: "Script 2: Warm Introduction (Close Friend/Family)",
          context: "Use this for people you know well who have shown interest.",
          script: {
            label: "Warm Lead Introduction",
            text: "Hey [NAME]! I'm SO excited you're interested! I have to tell you, this has changed everything for me. I'm adding my coach [MENTOR NAME] to our chat – she helped me through my entire journey and she's amazing at figuring out the best plan for your specific goals. [MENTOR NAME], this is [FRIEND NAME] – she's been one of my biggest supporters and she's ready to feel amazing too!",
          },
          tips: [
            "Highlight your relationship with them",
            "Build up your mentor's credibility",
            "Show genuine excitement for them specifically",
          ],
        },
        {
          title: "Script 3: Re-Engaging an Old Lead",
          context: "Use this for someone who showed interest before but didn't start.",
          script: {
            label: "Re-Engagement Script",
            text: "Hey [NAME]! I was just thinking about you and wanted to check in. How are you doing? I know we chatted a while back about your health goals – I've been meaning to reach out! A lot has happened since then, and I'd love to catch up. Are you still thinking about making some changes?",
          },
          tips: [
            "Don't immediately pitch – reconnect first",
            "Wait for their response before adding mentor",
            "Be genuine, not salesy",
          ],
        },
        {
          title: "Script 4: After They Express Interest",
          context: "Use this after the prospect has indicated they want to learn more.",
          script: {
            label: "Transition to Mentor",
            text: "I'm so glad you're open to learning more! I want to make sure you get the best information possible, so I'm adding my mentor [MENTOR NAME] to our chat. She's helped so many people and she'll know exactly what questions to ask to figure out the perfect fit for you. [MENTOR NAME], meet [PROSPECT NAME] – she's interested in learning how we can help her [reach her goals/lose weight/get healthy/have more energy]!",
          },
          tips: [
            "Reference their specific goals if they've shared them",
            "Build anticipation for the mentor conversation",
            "Make it about THEM, not the program",
          ],
        },
        {
          title: "Script 5: When Someone is Skeptical",
          context: "Use this when someone seems interested but hesitant or skeptical.",
          script: {
            label: "Handling Skepticism",
            text: "I totally get it – I was skeptical too! Honestly, I'd tried SO many things before this. What made the difference for me was having a real coach who actually cared about my success. Would it help if I connected you with my coach? She can answer your questions way better than I can, and there's zero pressure – just a conversation to see if it might work for you.",
          },
          tips: [
            "Validate their skepticism",
            "Share your own initial doubts",
            "Remove pressure by emphasizing 'just a conversation'",
          ],
        },
        {
          title: "Script 6: Supporting Your Mentor Mid-Conversation",
          context: "Use these to jump in and support during the mentor's conversation.",
          multipleScripts: [
            { label: "Confirming Mentor's Point", text: "Yes! That's exactly what happened for me too!" },
            { label: "Adding Your Experience", text: "I remember feeling the same way [NAME]. The first week I thought 'can I really do this?' and now look at me!" },
            { label: "Showing Excitement", text: "Oh my gosh [NAME], I'm so excited for you! You're going to love how you feel!" },
            { label: "Building Connection", text: "I'm here for you through this whole journey – we're going to do this together!" },
          ],
        },
        {
          title: "Do's and Don'ts in 3-Way Messages",
          dosList: [
            "DO let your mentor lead the conversation",
            "DO add supportive comments when natural",
            "DO share your personal experience when relevant",
            "DO stay positive and encouraging",
            "DO respond to direct questions to you",
          ],
          dontsList: [
            "DON'T take over the conversation",
            "DON'T share pricing or program details yourself",
            "DON'T pressure or create urgency",
            "DON'T disappear from the conversation entirely",
            "DON'T argue with objections – let mentor handle",
          ],
        },
      ],
      keyTakeaways: [
        "Always introduce your mentor with enthusiasm and credibility",
        "Your job is to start and support, not to lead",
        "Personalize every script with names and specific goals",
        "Stay present in the conversation but let mentor guide",
      ],
    },
  },
  {
    id: "2.2.2",
    title: "How to Have Effective Conversations",
    type: "Framework",
    icon: Users,
    duration: "12 min read",
    canvaLink: "https://www.canva.com/design/DAGwKmV4-qY/jcb8D4BueFoAYZsc8uERiQ/view",
    content: {
      intro: "Effective conversations are about CONNECTION, not conversion. This framework teaches you how to have genuine conversations that naturally lead to opportunities to help people – whether that's today, next month, or next year.",
      sections: [
        {
          title: "The Conversation Framework",
          framework: [
            { letter: "C", word: "Connect", description: "Find common ground. Ask about their life, not just their health." },
            { letter: "A", word: "Ask", description: "Ask open-ended questions. Listen more than you talk." },
            { letter: "R", word: "Relate", description: "Share your story when it connects to what they've shared." },
            { letter: "E", word: "Explore", description: "Dig deeper into their goals, struggles, and motivations." },
            { letter: "S", word: "Serve", description: "Offer help without expectation. Plant seeds for the future." },
          ],
        },
        {
          title: "A-Z Commenting Strategy",
          content: "Building your network starts with genuine engagement on social media. The A-Z strategy helps you connect with people authentically.",
          azSteps: [
            { step: "A", title: "Acknowledge", description: "Notice what they posted and acknowledge it genuinely", example: '"This is such a beautiful photo! Where was this taken?"' },
            { step: "B", title: "Bridge", description: "Find something in common to build connection", example: '"I love hiking too! What\'s your favorite trail?"' },
            { step: "C", title: "Continue", description: "Keep the conversation going with follow-up questions", example: '"That sounds amazing. Have you been there in fall? I\'ve heard the colors are incredible."' },
          ],
          callout: {
            type: "warning",
            title: "Important",
            content: "NEVER pitch in comments. The goal is to start a genuine conversation that might later move to messages. People can tell when you have an agenda.",
          },
        },
        {
          title: "Conversation Starters That Work",
          starters: [
            {
              category: "On Their Posts",
              scripts: [
                "I love this! How did you [do this/make this/find this]?",
                "This is so inspiring! What got you into [topic]?",
                "You always have the best [content type]. What's your secret?",
              ],
            },
            {
              category: "When They Comment on Yours",
              scripts: [
                "Thank you so much! How are YOU doing?",
                "That means so much! What's new in your world?",
                "You're the sweetest! We need to catch up – how have you been?",
              ],
            },
            {
              category: "Re-Connecting with Old Friends",
              scripts: [
                "I saw your post and it made me think of you! How are things going?",
                "It's been forever! What have you been up to lately?",
                "I've been meaning to reach out – how's life treating you?",
              ],
            },
            {
              category: "After an Event or Life Update",
              scripts: [
                "Congratulations on [event]! That's so exciting! How are you feeling?",
                "I saw your update about [topic] – thinking of you! How's it going?",
                "Just saw your news! Would love to hear more about it!",
              ],
            },
          ],
        },
        {
          title: "The 70/30 Rule",
          content: "In any conversation, aim for them to talk 70% of the time and you 30%. This means:",
          breakdown: [
            { percent: "70%", label: "THEM", activities: ["Sharing their story", "Answering your questions", "Expressing their goals/frustrations", "Asking questions about your experience"] },
            { percent: "30%", label: "YOU", activities: ["Asking questions", "Listening and acknowledging", "Sharing relevant parts of your story", "Offering to help"] },
          ],
          proTip: "If you find yourself talking more than they are, stop and ask a question.",
        },
        {
          title: "Questions That Open Doors",
          content: "These questions help move conversations toward health topics naturally:",
          questions: [
            { question: "How are you REALLY doing?", why: "Shows you care beyond surface level" },
            { question: "What's been keeping you busy lately?", why: "Opens door to stress, overwhelm, or positive news" },
            { question: "What are you looking forward to this year?", why: "Reveals their goals and priorities" },
            { question: "Have you been able to [exercise/eat well/take care of yourself] lately?", why: "Natural entry to health conversation" },
            { question: "What would your ideal day look like if you had unlimited energy?", why: "Helps them envision what they're missing" },
          ],
        },
        {
          title: "When to Pivot to Health",
          content: "Wait for natural openings. Look for comments like:",
          pivotPhrases: [
            "I'm so tired all the time",
            "I really need to lose weight",
            "I've been struggling with [health issue]",
            "I wish I had more energy",
            "I don't know what to do about [health concern]",
            "You look amazing – what are you doing?",
            "I need to get healthy but don't know where to start",
          ],
          responseScript: {
            label: "Natural Pivot Response",
            text: "I totally understand that feeling. I felt the exact same way before I started my health journey. Would you be open to hearing what worked for me?",
          },
        },
        {
          title: "What NOT to Do",
          donts: [
            { action: "Pitch in comments", why: "It's public and feels pushy" },
            { action: "Send copy-paste messages", why: "People can tell – it feels impersonal" },
            { action: "Lead with the program", why: "Lead with connection, not the product" },
            { action: "Assume everyone wants help", why: "Ask permission before sharing" },
            { action: "Give up after one conversation", why: "Building relationships takes time" },
          ],
        },
      ],
      keyTakeaways: [
        "Connection comes before conversion – build relationships first",
        "Listen 70% of the time, talk 30%",
        "Never pitch in public comments – move to private messages",
        "Ask permission before sharing your health journey",
      ],
    },
  },
  {
    id: "2.2.3",
    title: "Effective Follow Up After a Health Assessment",
    type: "Document",
    icon: RefreshCw,
    duration: "10 min read",
    content: {
      intro: "Not everyone says 'yes' right away – and that's okay! How you follow up after a Health Assessment determines whether a 'not yet' becomes a 'yes' later. This guide shows you exactly what to do after every type of outcome.",
      sections: [
        {
          title: "Understanding the Outcomes",
          content: "After a Health Assessment, prospects fall into one of these categories:",
          outcomes: [
            { status: "YES!", icon: "🎉", description: "They're ready to start!", nextStep: "Go to Module 3.1: When You Get Your First Client" },
            { status: "Not Yet", icon: "⏰", description: "Interested but not ready right now", nextStep: "Follow the 'Not Yet' follow-up sequence below" },
            { status: "No", icon: "🚫", description: "Not interested at this time", nextStep: "Thank them gracefully and keep the door open" },
            { status: "Ghost", icon: "👻", description: "Stopped responding", nextStep: "Use the ghost recovery scripts below" },
          ],
        },
        {
          title: "The 'Not Yet' Follow-Up Sequence",
          content: "When someone is interested but not ready, stay in touch without being pushy:",
          followUpSequence: [
            { timing: "Same Day", action: "Send a thank you message", script: "It was so great chatting with you today! I'm here whenever you're ready – no pressure at all. In the meantime, is it okay if I check in with you from time to time?" },
            { timing: "3-5 Days Later", action: "Value-add check-in", script: "Hey [NAME]! I was just thinking about you. I came across this [article/recipe/tip] and thought of our conversation. How are you doing?" },
            { timing: "2 Weeks Later", action: "Genuine connection", script: "Hi [NAME]! Just wanted to say hi and see how things are going. Any updates on [something they mentioned in the HA]?" },
            { timing: "1 Month Later", action: "Soft check-in", script: "Hey [NAME]! It's been a bit – hope you're doing well! Still thinking about your goals? I'm here if you ever want to chat!" },
            { timing: "Ongoing", action: "Stay connected on social", script: "Continue engaging with their posts genuinely. Like, comment, stay visible without being pushy." },
          ],
        },
        {
          title: "The 'Ghost' Recovery Scripts",
          content: "When someone stops responding mid-conversation, try these approaches:",
          ghostScripts: [
            { label: "The Casual Check-In", text: "Hey [NAME]! Just wanted to make sure my messages are coming through – I know things get busy! No rush at all, just checking in. 😊" },
            { label: "The Assumption Close", text: "Hi [NAME]! I'm guessing life got crazy – totally understand! Just wanted you to know the door is always open. Whenever you're ready, I'm here!" },
            { label: "The Break-Up Message", text: "Hey [NAME]! I don't want to be that person who keeps bugging you, so this will be my last message about this. But I truly believe in what this program could do for you, so I'll leave the door open. If you ever want to chat, you know where to find me! Take care! 💚", note: "This often gets a response because it removes pressure" },
          ],
        },
        {
          title: "After a 'No'",
          content: "A 'no' deserves a graceful response. Here's how to handle it:",
          noResponse: {
            script: "I completely understand – this isn't for everyone, and I respect that! Thank you for taking the time to chat with me. I'm always here if anything changes, and I wish you the best on your health journey, whatever that looks like! 💚",
            after: [
              "Don't take it personally",
              "Continue engaging with them on social media genuinely",
              "Never bring up the program again unless they do",
              "A 'no' today might be a 'yes' in 6 months",
            ],
          },
        },
        {
          title: "Tracking Your Follow-Ups",
          content: "Keep track of your prospects so no one falls through the cracks:",
          trackingTips: [
            { tip: "Use a simple spreadsheet or notes app", detail: "Name, date of HA, outcome, next follow-up date" },
            { tip: "Set calendar reminders", detail: "Schedule your follow-ups so you don't forget" },
            { tip: "Note personal details", detail: "Kids' names, vacation plans, work situation – use these in follow-ups" },
            { tip: "Track what resonated", detail: "What part of the conversation got them excited? Reference it later" },
          ],
        },
        {
          title: "The Long Game Mindset",
          content: "Remember: you're building relationships, not making one-time sales.",
          mindsetPoints: [
            { point: "Plant seeds everywhere", detail: "You never know when they'll bloom" },
            { point: "Be patient", detail: "Some of your best clients will take months to start" },
            { point: "Stay visible", detail: "Keep posting your journey – they're watching" },
            { point: "Be genuine", detail: "People can tell when you care about them vs. the sale" },
            { point: "Trust the process", detail: "Consistent follow-up compounds over time" },
          ],
          callout: {
            type: "tip",
            title: "Coach Story",
            content: "Many top coaches have clients who said 'no' 3, 4, or even 5 times before finally saying 'yes.' The ones who gave up after the first 'no' missed out on those transformations – and that business.",
          },
        },
      ],
      keyTakeaways: [
        "A 'not yet' is NOT a 'no' – follow up consistently",
        "Use the break-up message for ghosts – it often works",
        "Track your prospects so no one falls through the cracks",
        "Play the long game – relationships take time",
      ],
    },
  },
]

export function FirstClientConversationsContent() {
  const { toast } = useToast()
  const { user } = useAuth()
  const { completedResources, toggleCompletedResource } = useSupabaseData(user)
  const [expandedLesson, setExpandedLesson] = useState(lessons[0].id)
  const [copiedScript, setCopiedScript] = useState<string | null>(null)

  const getResourceId = (lessonId: string) => `first-client-conversations-${lessonId}`

  const completedLessons = new Set(
    lessons
      .map((lesson) => lesson.id)
      .filter((lessonId) => completedResources.includes(getResourceId(lessonId)))
  )

  useEffect(() => {
    const saved = localStorage.getItem("firstClientConversationsExpanded")
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
    localStorage.setItem("firstClientConversationsExpanded", JSON.stringify(expandedLesson))
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

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedScript(id)
      setTimeout(() => setCopiedScript(null), 2000)
      toast({ title: "Copied!", description: "Script copied to clipboard." })
    } catch {
      toast({ title: "Failed to copy", description: "Please try again.", variant: "destructive" })
    }
  }

  const completedCount = completedLessons.size
  const progressPercent = lessons.length > 0 ? Math.round((completedCount / lessons.length) * 100) : 0

  const currentLessonIndex = lessons.findIndex((l) => l.id === expandedLesson)
  const currentLesson = lessons[currentLessonIndex]
  const prevLesson = currentLessonIndex > 0 ? lessons[currentLessonIndex - 1] : null
  const nextLesson = currentLessonIndex < lessons.length - 1 ? lessons[currentLessonIndex + 1] : null

  const renderCopyableScript = (script: Script, id: string) => (
    <div className="bg-gray-50 rounded-lg p-4 mb-3 border border-gray-200">
      {script.label && (
        <div className="text-xs font-semibold text-[hsl(var(--optavia-green))] mb-2 uppercase">{script.label}</div>
      )}
      <p className="text-sm text-optavia-dark italic mb-3 leading-relaxed">"{script.text}"</p>
      {script.note && (
        <p className="text-xs text-optavia-gray italic mb-3">💡 {script.note}</p>
      )}
      <Button
        onClick={() => copyToClipboard(script.text, id)}
        variant={copiedScript === id ? "default" : "outline"}
        size="sm"
        className={copiedScript === id ? "bg-[hsl(var(--optavia-green))] hover:bg-[hsl(var(--optavia-green-dark))]" : ""}
      >
        {copiedScript === id ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
        {copiedScript === id ? "Copied!" : "Copy Script"}
      </Button>
    </div>
  )

  const renderCallout = (callout: { type: "info" | "warning" | "tip"; title: string; content: string }) => {
    const colors = {
      info: { bg: "bg-blue-50", border: "border-blue-500", text: "text-blue-900", iconColor: "text-blue-600" },
      warning: { bg: "bg-amber-50", border: "border-amber-500", text: "text-amber-900", iconColor: "text-amber-600" },
      tip: { bg: "bg-green-50", border: "border-green-500", text: "text-green-900", iconColor: "text-green-600" },
    }
    const style = colors[callout.type] || colors.info

    return (
      <div className={`${style.bg} ${style.border} border-l-4 p-5 rounded-lg mt-4`}>
        <div className={`flex items-center gap-2 font-semibold ${style.text} mb-2`}>
          <Lightbulb className={`h-5 w-5 ${style.iconColor}`} />
          {callout.title}
        </div>
        <p className={`${style.text} text-sm`}>{callout.content}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-[hsl(var(--optavia-green))] to-[hsl(var(--optavia-green-dark))] text-white py-8 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 text-sm opacity-90 mb-2 uppercase tracking-wide">
            <span>Training Center</span>
            <ChevronRight className="h-4 w-4" />
            <span>Phase 2: Launch Week</span>
            <ChevronRight className="h-4 w-4" />
            <span className="font-semibold">Module 2.2</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">First Client Conversations</h1>
          <p className="text-lg opacity-90 max-w-2xl">
            Learn by doing WITH your mentor. Master the scripts and frameworks that turn conversations into clients.
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
                        <div className="text-xs font-semibold text-[hsl(var(--optavia-green))] mb-1">{lesson.id}</div>
                        <div className={`text-sm font-semibold mb-2 ${isActive ? "text-[hsl(var(--optavia-green))]" : "text-optavia-dark"}`}>
                          {lesson.title}
                        </div>
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

            {/* Mentor Reminder Card */}
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardHeader>
                <div className="flex items-center gap-2 font-semibold text-blue-900 mb-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  Remember!
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-blue-900 leading-relaxed">
                  Every conversation happens with your mentor. You're learning by watching them work!
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
                {/* Canva Link if available */}
                {currentLesson.canvaLink && (
                  <a
                    href={currentLesson.canvaLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-5 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg border border-purple-200 mb-6 hover:from-purple-100 hover:to-purple-200 transition-colors"
                  >
                    <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                      <FileText className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-purple-900">View Full Canva Presentation</div>
                      <div className="text-sm text-purple-700">Interactive guide with visuals and examples</div>
                    </div>
                    <ExternalLink className="h-5 w-5 text-purple-600" />
                  </a>
                )}

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

                    {section.context && (
                      <p className="text-sm text-optavia-gray ml-10 mb-3 italic">📝 {section.context}</p>
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

                    {section.callout && <div className="ml-10">{renderCallout(section.callout)}</div>}

                    {section.script && (
                      <div className="ml-10 mt-4">{renderCopyableScript(section.script, `script-${idx}`)}</div>
                    )}

                    {section.tips && (
                      <div className="ml-10 mt-3 space-y-2">
                        {section.tips.map((tip, i) => (
                          <div key={i} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                            <Lightbulb className="h-4 w-4 text-amber-500" />
                            <span className="text-sm text-optavia-gray">{tip}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {section.multipleScripts && (
                      <div className="ml-10 mt-4 space-y-3">
                        {section.multipleScripts.map((script, i) => renderCopyableScript(script, `multi-${idx}-${i}`))}
                      </div>
                    )}

                    {section.dosList && section.dontsList && (
                      <div className="ml-10 mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-5 bg-green-50 rounded-lg">
                          <div className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                            <Check className="h-5 w-5" />
                            DO's
                          </div>
                          <div className="space-y-2">
                            {section.dosList.map((item, i) => (
                              <div key={i} className="text-sm text-green-900">✓ {item}</div>
                            ))}
                          </div>
                        </div>
                        <div className="p-5 bg-red-50 rounded-lg">
                          <div className="font-semibold text-red-800 mb-3 flex items-center gap-2">
                            <XCircle className="h-5 w-5" />
                            DON'Ts
                          </div>
                          <div className="space-y-2">
                            {section.dontsList.map((item, i) => (
                              <div key={i} className="text-sm text-red-900">✗ {item}</div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {section.framework && (
                      <div className="ml-10 mt-4 flex flex-wrap gap-3">
                        {section.framework.map((item, i) => (
                          <div key={i} className="flex-1 min-w-[120px] p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg text-center">
                            <div className="w-10 h-10 rounded-full bg-[hsl(var(--optavia-green))] text-white flex items-center justify-center font-bold text-lg mx-auto mb-2">
                              {item.letter}
                            </div>
                            <div className="font-semibold text-[hsl(var(--optavia-green))] mb-1 text-sm">{item.word}</div>
                            <div className="text-xs text-optavia-gray">{item.description}</div>
                          </div>
                        ))}
                      </div>
                    )}

                    {section.azSteps && (
                      <div className="ml-10 mt-4 space-y-4">
                        {section.azSteps.map((item, i) => (
                          <div key={i} className="flex gap-4 p-5 bg-gray-50 rounded-lg">
                            <div className="w-12 h-12 rounded-full bg-[hsl(var(--optavia-green))] text-white flex items-center justify-center font-bold text-xl flex-shrink-0">
                              {item.step}
                            </div>
                            <div className="flex-1">
                              <div className="font-semibold text-optavia-dark mb-1">{item.title}</div>
                              <div className="text-sm text-optavia-gray mb-2">{item.description}</div>
                              <div className="text-sm text-[hsl(var(--optavia-green))] italic p-2 bg-green-50 rounded">
                                Example: {item.example}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {section.starters && (
                      <div className="ml-10 mt-4 space-y-5">
                        {section.starters.map((category, i) => (
                          <div key={i}>
                            <div className="text-sm font-semibold text-optavia-dark mb-3 p-2 bg-green-50 rounded inline-block">
                              {category.category}
                            </div>
                            <div className="space-y-2">
                              {category.scripts.map((script, j) => (
                                <div key={j} className="p-3 bg-gray-50 rounded-lg text-sm text-optavia-gray italic border-l-4 border-[hsl(var(--optavia-green))]">
                                  "{script}"
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {section.breakdown && (
                      <div className="ml-10 mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        {section.breakdown.map((item, i) => (
                          <div key={i} className={`p-5 rounded-lg ${i === 0 ? "bg-blue-50" : "bg-green-50"}`}>
                            <div className={`text-4xl font-bold mb-1 ${i === 0 ? "text-blue-600" : "text-[hsl(var(--optavia-green))]"}`}>
                              {item.percent}
                            </div>
                            <div className={`font-semibold mb-3 ${i === 0 ? "text-blue-800" : "text-green-800"}`}>
                              {item.label}
                            </div>
                            <div className="space-y-1">
                              {item.activities.map((activity, j) => (
                                <div key={j} className="text-sm text-optavia-gray">• {activity}</div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {section.proTip && (
                      <div className="ml-10 mt-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
                        <Star className="h-4 w-4 text-amber-600 inline mr-2" />
                        <span className="text-sm text-amber-900 font-semibold">Pro Tip: {section.proTip}</span>
                      </div>
                    )}

                    {section.questions && (
                      <div className="ml-10 mt-4 space-y-3">
                        {section.questions.map((item, i) => (
                          <div key={i} className="p-4 bg-gray-50 rounded-lg">
                            <div className="font-semibold text-[hsl(var(--optavia-green))] mb-1">"{item.question}"</div>
                            <div className="text-sm text-optavia-gray">💡 {item.why}</div>
                          </div>
                        ))}
                      </div>
                    )}

                    {section.pivotPhrases && (
                      <div className="ml-10 mt-4 flex flex-wrap gap-2">
                        {section.pivotPhrases.map((phrase, i) => (
                          <span key={i} className="px-3 py-2 bg-blue-50 rounded-full text-sm text-blue-700">
                            "{phrase}"
                          </span>
                        ))}
                      </div>
                    )}

                    {section.responseScript && (
                      <div className="ml-10 mt-4">{renderCopyableScript(section.responseScript, `response-${idx}`)}</div>
                    )}

                    {section.donts && section.donts[0] && "why" in section.donts[0] && (
                      <div className="ml-10 mt-4 space-y-2">
                        {section.donts.map((item, i) => (
                          <div key={i} className="flex gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
                            <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                            <div>
                              <span className="font-semibold text-red-800">{item.action}</span>
                              <span className="text-red-700"> – {item.why}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {section.outcomes && (
                      <div className="ml-10 mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                        {section.outcomes.map((item, i) => (
                          <div key={i} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-2xl">{item.icon}</span>
                              <span className="font-semibold text-optavia-dark">{item.status}</span>
                            </div>
                            <div className="text-sm text-optavia-gray mb-2">{item.description}</div>
                            <div className="text-xs font-semibold text-[hsl(var(--optavia-green))]">→ {item.nextStep}</div>
                          </div>
                        ))}
                      </div>
                    )}

                    {section.followUpSequence && (
                      <div className="ml-10 mt-4 space-y-4 relative">
                        {section.followUpSequence.map((item, i) => (
                          <div key={i} className="flex gap-4 relative">
                            {i < section.followUpSequence!.length - 1 && (
                              <div className="absolute left-[50px] top-[70px] w-0.5 h-[calc(100%-30px)] bg-gray-200" />
                            )}
                            <div className="w-[100px] p-2 bg-green-50 rounded-lg text-center flex-shrink-0">
                              <Timer className="h-4 w-4 text-[hsl(var(--optavia-green))] mx-auto mb-1" />
                              <div className="text-xs font-semibold text-[hsl(var(--optavia-green))]">{item.timing}</div>
                            </div>
                            <div className="flex-1 p-4 bg-gray-50 rounded-lg">
                              <div className="font-semibold text-optavia-dark mb-2">{item.action}</div>
                              <div className="text-sm text-optavia-gray italic p-3 bg-white rounded border-l-4 border-[hsl(var(--optavia-green))]">
                                "{item.script}"
                              </div>
                              <Button
                                onClick={() => copyToClipboard(item.script, `followup-${i}`)}
                                variant="outline"
                                size="sm"
                                className="mt-2"
                              >
                                {copiedScript === `followup-${i}` ? <Check className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
                                {copiedScript === `followup-${i}` ? "Copied!" : "Copy"}
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {section.ghostScripts && (
                      <div className="ml-10 mt-4 space-y-3">
                        {section.ghostScripts.map((script, i) => renderCopyableScript(script, `ghost-${i}`))}
                      </div>
                    )}

                    {section.noResponse && (
                      <div className="ml-10 mt-4">
                        {renderCopyableScript({ label: "Graceful 'No' Response", text: section.noResponse.script }, "no-response")}
                        <div className="mt-4 space-y-2">
                          {section.noResponse.after.map((item, i) => (
                            <div key={i} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                              <Check className="h-4 w-4 text-[hsl(var(--optavia-green))]" />
                              <span className="text-sm text-optavia-gray">{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {section.trackingTips && (
                      <div className="ml-10 mt-4 space-y-3">
                        {section.trackingTips.map((item, i) => (
                          <div key={i} className="p-4 bg-gray-50 rounded-lg border-l-4 border-[hsl(var(--optavia-green))]">
                            <div className="font-semibold text-optavia-dark mb-1">{item.tip}</div>
                            <div className="text-sm text-optavia-gray">{item.detail}</div>
                          </div>
                        ))}
                      </div>
                    )}

                    {section.mindsetPoints && (
                      <div className="ml-10 mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                        {section.mindsetPoints.map((item, i) => (
                          <div key={i} className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                            <div className="font-semibold text-[hsl(var(--optavia-green))] mb-1 flex items-center gap-1">
                              <Heart className="h-4 w-4" />
                              {item.point}
                            </div>
                            <div className="text-xs text-optavia-gray">{item.detail}</div>
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
                  <Button variant="outline" onClick={() => (window.location.href = "/training/social-media-posting")}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Module 2.1
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
                    onClick={() => (window.location.href = "/training/first-client")}
                  >
                    🎉 Continue to Phase 3: First Client
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
