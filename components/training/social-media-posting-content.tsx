"use client"

import { useState, useEffect } from "react"
import { CheckCircle, Circle, ChevronRight, ChevronDown, Play, FileText, Clock, Star, ArrowLeft, ArrowRight, MessageCircle, Send, AlertTriangle, Copy, Check, Users, Calendar, Zap, Target, Heart, ThumbsUp, Share2, ExternalLink } from "lucide-react"
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
}

interface ThreeWayFlowItem {
  role: string
  timing: string
  script: string
}

interface WorkflowItem {
  step: number
  action: string
  detail: string
}

interface Objection {
  question: string
  response: string
}

interface DayContent {
  day: number
  title: string
  theme: string
  icon: string
  description: string
  tips: string[]
  sampleCaption: string
}

interface Section {
  title: string
  content?: string
  emphasis?: string
  callout?: {
    type: "info" | "warning" | "tip"
    title: string
    content: string
  }
  proTip?: {
    title: string
    content: string
  }
  scripts?: Script[]
  script?: Script
  doNot?: string[]
  whatToDo?: string
  threeWayFlow?: ThreeWayFlowItem[]
  workflow?: WorkflowItem[]
  objections?: Objection[]
  stats?: Array<{ number: string; label: string }>
  tips?: Array<{ tip: string; detail: string }>
  donts?: string[]
  calendar?: boolean
}

interface Lesson {
  id: string
  title: string
  type: "Video" | "Document"
  icon: typeof MessageCircle
  duration: string
  pdfLink?: string
  content: {
    intro: string
    sections: Section[]
    days?: DayContent[]
    keyTakeaways: string[]
  }
}

const lessons: Lesson[] = [
  {
    id: "2.1.1",
    title: "How to Work Your Social Media Launch Post",
    type: "Document",
    icon: MessageCircle,
    duration: "15 min read",
    content: {
      intro: "Your launch post is live - now what? HOW you respond to comments and messages is critical. This guide shows you exactly what to say and do to turn engagement into conversations, and conversations into clients.",
      sections: [
        {
          title: "The Golden Rule",
          callout: {
            type: "warning",
            title: "DON'T START CONVERSATIONS WITHOUT YOUR MENTOR!",
            content: "Mentor coaches are here to help you learn, and we cannot teach you unless we do it WITH you! Everything happens in 3-way messages.",
          },
        },
        {
          title: "Why This Matters",
          content: "How you respond (we call this 'working your post') sets the tone for how your business will grow. We've learned through THOUSANDS of launches the most effective and fastest way to go from someone complimenting your post to that person becoming your client.",
          emphasis: "Our goal is YOUR success – everything we tell you is designed to FAST TRACK you!",
        },
        {
          title: "Step 1: Respond to EVERY Comment",
          content: "Reply to every single comment on your post. This builds engagement and shows you're active.",
          proTip: {
            title: "Algorithm Hack",
            content: "Respond to 2-3 comments at a time, then let the post sit for a few hours, then come back and respond to 2-3 more. This trips the algorithm to move your post to the TOP of the feed!",
          },
          scripts: [
            { label: "Simple Thank You", text: "Thank you! I'm feeling great!" },
            { label: "Show Pride", text: "I'm so proud of myself!" },
            { label: "Highlight Simplicity", text: "Love how simple it's been!" },
          ],
        },
        {
          title: "Step 2: When Someone Asks 'What Are You Doing?'",
          content: "When someone comments asking what you're doing or wants more info, DO NOT explain the program in the comments!",
          doNot: [
            "Don't message info on the program",
            "Don't share the website link",
            "Don't discuss cost",
            "Don't explain the details",
          ],
          whatToDo: "Simply comment back: \"I'll message you!\" Then move to Step 3.",
        },
        {
          title: "Step 3: Start a 3-Way Message",
          content: "This is where the magic happens. Start a group message in Messenger with THREE people: the friend asking for information, you, and your mentor coach.",
          threeWayFlow: [
            {
              role: "YOU (New Coach)",
              timing: "Start the thread",
              script: "Hi there! I'm so glad you reached out! This program has been AMAZING! I feel so good and it's been so simple! I'd love to help you—I'm including my coach [COACH NAME] here. She's an expert at figuring out which program is the best fit for your goals, and can help answer any questions!",
            },
            {
              role: "YOUR MENTOR",
              timing: "Takes over",
              script: "It's so nice to meet you! I can't wait to hear more about your story. This program changed everything for me. I lost [X] in [timeframe], and I learned how to KEEP it off. Game changer! What do your health and weight goals look like? How much weight do you want to lose? Any health issues you're concerned about, or are you just feeling run-down in general?",
            },
            {
              role: "POTENTIAL CLIENT",
              timing: "Responds",
              script: "I'd like to lose 40 pounds. I'm so tired, and I want to be a fun mom for my kids.",
            },
            {
              role: "YOUR MENTOR",
              timing: "Continues",
              script: "We've got you!! I lost 50 pounds with this program, and I have never felt better than I do today. I know exactly what that feels like—I was so exhausted before this program, and I knew my kids deserved better, but I didn't know how to fix it myself. I'm so grateful to my coach for giving me hope again! Please fill out this form so that we know exactly how we can help you. Then we can have a short call to answer any questions. What time today works for you?",
            },
          ],
        },
        {
          title: "Step 4: Thank the Likes",
          content: "Don't forget the people who liked but didn't comment! Send a quick message:",
          script: {
            label: "Thank a Liker",
            text: "Hey! Thanks so much for the love on my post! It means so much to have your support. How are you doing?",
          },
        },
        {
          title: "Pro Tip: Repost the Next Day",
          content: "The day after you launch, COPY & PASTE your post and photo into a NEW post at a DIFFERENT time of day. This exposes you to a whole new audience!",
          script: {
            label: "Day 2 Repost Caption",
            text: "Thank you for all the love on my last post! I am so grateful for your support! I'm getting back to everyone as fast as I can, but in case you missed it yesterday, I have big news!",
          },
        },
        {
          title: "The Complete Workflow",
          workflow: [
            { step: 1, action: "Respond to comments", detail: "2-3 at a time, spaced out" },
            { step: 2, action: "Start 3-way messages", detail: "With people asking for info" },
            { step: 3, action: "Thank the likes", detail: "Personal message to each" },
            { step: 4, action: "Repost next day", detail: "Different time, same content" },
          ],
          content: "This is a lather, rinse, repeat business. Mastering these skills will make you a pro at client acquisition!",
        },
        {
          title: "Common Objections in Messages",
          content: "Your mentor will handle these, but here's what to expect:",
          objections: [
            {
              question: "Can you just send me an email with some info?",
              response: "Everything is specific to you and your needs, but we can have a quick call to answer any questions so that you're clear! Please fill out this form– it helps us both know how we can help you and where you're starting off!",
            },
            {
              question: "Do you have a website?",
              response: "I do, but it's only for current clients updating their program. We need to figure out exactly what you need to be healthier, and we will go from there! Fill out this form to see exactly what we can help with, and then we can have a quick call to go over what it will look like for you!",
            },
            {
              question: "What is the program called?",
              response: "It's called Optavia. Have you ever heard of it? [Your coach's answer will depend on their response]",
            },
            {
              question: "How much does it cost?",
              response: "That varies based on the program and your goals. It's typically less than you're spending on food right now, but we need to see what program is the best fit for your goals and your budget.",
            },
            {
              question: "I don't have time to talk on the phone",
              response: "The thing that makes our program so different is the coaching– we even proved in clinical trials that our coaching leads to 10X better results than people who follow the program alone. My goal is your success, and the phone is a big part of that. I promise it won't take much time– 20 minutes or so to start, and then just a few minutes a week.",
            },
            {
              question: "What are Essential Amino Acids (EAAs)?",
              response: "They are magic! They support your muscle mass. That's what fires up your metabolism, and we naturally lose so much of this as we age. Plus, they make your hair super thick and your nails and skin healthy and strong!",
            },
          ],
        },
      ],
      keyTakeaways: [
        "NEVER start conversations without your mentor in the thread",
        "Respond to comments 2-3 at a time to boost the algorithm",
        "Use the exact 3-way message script - it's proven to work",
        "Don't share program details, cost, or website in public comments",
      ],
    },
  },
  {
    id: "2.1.2",
    title: "Week One Posting Guide",
    type: "Document",
    icon: Calendar,
    duration: "10 min read",
    pdfLink: "https://drive.google.com/file/d/1gUKC8VC8nzx6ywFPFU9fQ0lJ0OHw8sQQ/view",
    content: {
      intro: "Your first week as a coach is all about consistent visibility. This daily posting guide gives you exactly what to post each day to maintain momentum from your launch and keep conversations flowing.",
      sections: [
        {
          title: "Why Daily Posting Matters",
          content: "Consistency is key in social media. The algorithm rewards accounts that post regularly, and your audience needs multiple touchpoints before they'll reach out. Think of it this way: not everyone sees every post, so you need to show up daily to catch different people at different times.",
          stats: [
            { number: "7", label: "Days of consistent posting" },
            { number: "3-5", label: "Touchpoints before someone reaches out" },
            { number: "2x", label: "Engagement when posting daily vs. sporadic" },
          ],
        },
        {
          title: "Your Week One Calendar",
          calendar: true,
        },
        {
          title: "Best Practices for All Posts",
          tips: [
            { tip: "Post at different times", detail: "Morning one day, evening the next - reach different audiences" },
            { tip: "Use personal photos", detail: "Real photos of YOU always outperform stock images" },
            { tip: "Keep captions conversational", detail: "Write like you're texting a friend, not writing an ad" },
            { tip: "End with engagement", detail: "Ask a question or invite comments" },
            { tip: "Respond quickly", detail: "Reply to comments within a few hours when possible" },
            { tip: "Use Stories too", detail: "Stories reach people who might miss your feed posts" },
          ],
        },
        {
          title: "What NOT to Post",
          donts: [
            "Before/after photos without the required disclaimer",
            "Specific weight loss claims or timeframes",
            "Product photos without your face in them",
            "Negative talk about other programs or diets",
            "Medical claims or promises",
            "Screenshots of your earnings",
          ],
        },
      ],
      days: [
        {
          day: 1,
          title: "LAUNCH DAY",
          theme: "Your Transformation Story",
          icon: "🚀",
          description: "This is your big announcement! Share your transformation photos with your story.",
          tips: [
            "Post your before/after with required disclaimer",
            "Share your WHY - why did you start?",
            "Announce you're now helping others",
            "Keep it authentic and personal",
          ],
          sampleCaption: "I've been keeping a secret... and I'm finally ready to share! [X months ago], I made a decision that changed everything. I was tired of feeling [tired/uncomfortable/unhealthy], and I knew something had to change. Fast forward to today, and I don't even recognize myself - and I'm not just talking about the weight! I feel [energized/confident/alive] for the first time in years. The best part? I'm now a certified health coach, and I get to help others feel this way too! If you've been feeling stuck, I'd love to chat. Drop a 🙋‍♀️ below or send me a message!",
        },
        {
          day: 2,
          title: "REPOST + GRATITUDE",
          theme: "Thank Your Supporters",
          icon: "💚",
          description: "Repost your launch at a different time and thank everyone for the support.",
          tips: [
            "Same photo, slightly different caption",
            "Post at a different time than Day 1",
            "Genuinely thank your supporters",
            "Mention you're still responding to messages",
          ],
          sampleCaption: "WOW! Thank you all SO much for the love on my post yesterday! 💚 I'm still catching up on all the messages - you guys are amazing! If you missed my announcement, I'm officially a health coach now, helping others transform their health the same way I did. Still curious? I'd love to chat! Link in bio or send me a message!",
        },
        {
          day: 3,
          title: "BEHIND THE SCENES",
          theme: "A Day in Your Life",
          icon: "📸",
          description: "Show what your healthy lifestyle looks like day-to-day.",
          tips: [
            "Show your fuelings or a Lean & Green meal",
            "Keep it casual and real",
            "Don't make it feel like an ad",
            "Invite questions naturally",
          ],
          sampleCaption: "Someone asked me what I actually EAT on this program, so here you go! 🍽️ This is my lunch today - took me literally 10 minutes to make. The best part about this lifestyle is how SIMPLE it is. No complicated meal prep, no counting every calorie, just easy choices that make me feel amazing. Anyone else struggle with lunch ideas? What's your go-to?",
        },
        {
          day: 4,
          title: "NON-SCALE VICTORY",
          theme: "Celebrate the Small Wins",
          icon: "🎉",
          description: "Share a win that has nothing to do with the scale.",
          tips: [
            "Energy, sleep, confidence, clothes fitting",
            "Make it relatable",
            "Show that it's not just about weight",
            "Invite others to share their wins",
          ],
          sampleCaption: "Can we talk about NON-SCALE victories for a second? 🎉 Because honestly, the scale is just ONE measure of health. This week, I [had more energy/slept better/fit into old jeans/kept up with my kids]. THAT is what this is really about. The weight loss is amazing, but feeling like MYSELF again? Priceless. What's a non-scale victory you're working toward?",
        },
        {
          day: 5,
          title: "WHY I COACH",
          theme: "Your Mission",
          icon: "❤️",
          description: "Share why you decided to become a coach and help others.",
          tips: [
            "Be vulnerable and genuine",
            "Connect your story to your mission",
            "Invite people who are ready for change",
            "Don't make it about the money",
          ],
          sampleCaption: "Real talk: When my coach asked if I'd ever considered helping others, I laughed. ME? Help people? But then I thought about how STUCK I felt before I started... and how I wished someone had reached out to ME sooner. That's why I coach now. Not because I have all the answers, but because I know what it feels like to want change and not know where to start. If that's you, I see you. And I'm here when you're ready. ❤️",
        },
        {
          day: 6,
          title: "SOCIAL PROOF",
          theme: "Community & Support",
          icon: "👥",
          description: "Highlight the community aspect - you're not doing this alone.",
          tips: [
            "Mention your coach or team",
            "Share about group support",
            "Emphasize you're never alone",
            "Show the human side",
          ],
          sampleCaption: "One thing I didn't expect on this journey? The COMMUNITY. 👥 I thought I'd be doing this alone, white-knuckling my way through. But I have a coach who checks on me, a team who celebrates wins, and a group of people who GET IT. That's the difference maker. You don't have to figure it out on your own. Who's your support system? Or are you still looking for one? 💚",
        },
        {
          day: 7,
          title: "CALL TO ACTION",
          theme: "Invite Them In",
          icon: "✨",
          description: "Week wrap-up with a direct invitation to learn more.",
          tips: [
            "Summarize your week",
            "Be direct but not pushy",
            "Make it easy to respond",
            "Share excitement for the journey ahead",
          ],
          sampleCaption: "One week in as a coach, and I'm already SO fired up! 🔥 I've had some incredible conversations this week with people who are ready to make a change. Here's the thing: January is almost here. New Year, fresh start. If you've been thinking about making 2024 YOUR year for health, let's chat before the holiday craziness hits. No pressure, just a conversation to see if this could work for you. Comment 'INFO' or DM me - I've got you! ✨",
        },
      ],
      keyTakeaways: [
        "Post every single day during your first week",
        "Vary your posting times to reach different audiences",
        "Mix content types: story, behind-scenes, wins, mission",
        "Always end with an invitation to engage",
      ],
    },
  },
]

export function SocialMediaPostingContent() {
  const { toast } = useToast()
  const { user } = useAuth()
  const { completedResources, toggleCompletedResource, loading } = useSupabaseData(user)
  const [expandedLesson, setExpandedLesson] = useState(lessons[0].id)
  const [copiedScript, setCopiedScript] = useState<string | null>(null)
  const [expandedObjection, setExpandedObjection] = useState<number | null>(null)
  const [selectedDay, setSelectedDay] = useState(1)

  // Map lesson IDs to resource IDs for database tracking
  const getResourceId = (lessonId: string) => `social-media-posting-${lessonId}`

  // Load completed lessons from database
  const completedLessons = new Set(
    lessons
      .map((lesson) => lesson.id)
      .filter((lessonId) => completedResources.includes(getResourceId(lessonId)))
  )

  // Load expanded lesson from localStorage (UI preference only)
  useEffect(() => {
    const saved = localStorage.getItem("socialMediaPostingExpanded")
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
    localStorage.setItem("socialMediaPostingExpanded", JSON.stringify(expandedLesson))
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
      toast({
        title: "Copied!",
        description: "Script copied to clipboard.",
      })
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please try again.",
        variant: "destructive",
      })
    }
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
      <div className={`${style.bg} ${style.border} border-l-4 p-5 rounded-lg mt-4 ml-10`}>
        <div className={`flex items-center gap-2 font-semibold ${style.text} mb-2`}>
          <AlertTriangle className={`h-5 w-5 ${style.iconColor}`} />
          {callout.title}
        </div>
        <p className={`${style.text} text-sm`}>{callout.content}</p>
      </div>
    )
  }

  const renderCopyableScript = (script: Script, id: string) => (
    <div className="bg-gray-50 rounded-lg p-4 mb-3 border border-gray-200">
      {script.label && (
        <div className="text-xs font-semibold text-[hsl(var(--optavia-green))] mb-2 uppercase">
          {script.label}
        </div>
      )}
      <p className="text-sm text-optavia-dark italic mb-3 leading-relaxed">"{script.text}"</p>
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
            <span className="font-semibold">Module 2.1</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Your Launch Post</h1>
          <p className="text-lg opacity-90 max-w-2xl">
            Execute your social media launch and work the responses to turn engagement into clients.
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

            {/* Quick Resource Card */}
            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardHeader>
                <div className="flex items-center gap-2 font-semibold text-green-900 mb-2">
                  <Zap className="h-5 w-5 text-green-600" />
                  Fast Track Resource
                </div>
              </CardHeader>
              <CardContent>
                <a
                  href="https://www.canva.com/design/DAGRyr_F44Y/3_36EEwhi6JmMZfl1ZKAvw/edit"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-3 bg-white rounded-lg text-[hsl(var(--optavia-green))] text-sm font-semibold hover:bg-green-50 transition-colors"
                >
                  <Target className="h-4 w-4" />
                  Fast Track to Senior Coach Guide
                  <ExternalLink className="h-3 w-3 ml-auto" />
                </a>
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
                {/* PDF Link if available */}
                {currentLesson.pdfLink && (
                  <a
                    href={currentLesson.pdfLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-5 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200 mb-6 hover:from-blue-100 hover:to-blue-200 transition-colors"
                  >
                    <FileText className="h-6 w-6 text-blue-600" />
                    <div className="flex-1">
                      <div className="font-semibold text-blue-900">Download Printable PDF</div>
                      <div className="text-sm text-blue-700">Get the Week One Posting Guide as a shareable PDF</div>
                    </div>
                    <ExternalLink className="h-5 w-5 text-blue-600" />
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

                    {section.emphasis && (
                      <p className="text-base font-semibold text-[hsl(var(--optavia-green))] ml-10 mb-4">
                        {section.emphasis}
                      </p>
                    )}

                    {section.callout && renderCallout(section.callout)}

                    {section.proTip && (
                      <div className="ml-10 mt-4 p-5 bg-amber-50 rounded-lg border border-amber-200">
                        <div className="flex items-center gap-2 font-semibold text-amber-900 mb-2">
                          <Star className="h-4 w-4 fill-amber-600 text-amber-600" />
                          {section.proTip.title}
                        </div>
                        <p className="text-sm text-amber-900">{section.proTip.content}</p>
                      </div>
                    )}

                    {section.scripts && (
                      <div className="ml-10 mt-4 space-y-3">
                        {section.scripts.map((script, i) => renderCopyableScript(script, `${idx}-${i}`))}
                      </div>
                    )}

                    {section.script && (
                      <div className="ml-10 mt-4">
                        {renderCopyableScript(section.script, `single-${idx}`)}
                      </div>
                    )}

                    {section.doNot && (
                      <div className="ml-10 mt-4 space-y-2">
                        {section.doNot.map((item, i) => (
                          <div key={i} className="flex items-center gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
                            <span className="text-red-600 font-bold">✕</span>
                            <span className="text-sm text-red-900">{item}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {section.whatToDo && (
                      <div className="ml-10 mt-4 p-5 bg-green-50 rounded-lg border-2 border-[hsl(var(--optavia-green))]">
                        <div className="flex items-center gap-2 font-semibold text-[hsl(var(--optavia-green))] mb-2">
                          <Check className="h-5 w-5" />
                          What TO Do
                        </div>
                        <p className="text-sm text-green-900">{section.whatToDo}</p>
                      </div>
                    )}

                    {section.threeWayFlow && (
                      <div className="ml-10 mt-5 space-y-4">
                        {section.threeWayFlow.map((item, i) => (
                          <div key={i} className="flex gap-4">
                            <div
                              className={`min-w-[120px] p-3 rounded-lg text-center flex-shrink-0 ${
                                item.role.includes("YOU")
                                  ? "bg-green-50"
                                  : item.role.includes("MENTOR")
                                  ? "bg-blue-50"
                                  : "bg-gray-50"
                              }`}
                            >
                              <div
                                className={`text-xs font-semibold mb-1 ${
                                  item.role.includes("YOU")
                                    ? "text-[hsl(var(--optavia-green))]"
                                    : item.role.includes("MENTOR")
                                    ? "text-blue-600"
                                    : "text-gray-600"
                                }`}
                              >
                                {item.role}
                              </div>
                              <div className="text-xs text-optavia-gray">{item.timing}</div>
                            </div>
                            <div
                              className={`flex-1 p-4 bg-gray-50 rounded-lg border-l-4 ${
                                item.role.includes("YOU")
                                  ? "border-l-[hsl(var(--optavia-green))]"
                                  : item.role.includes("MENTOR")
                                  ? "border-l-blue-500"
                                  : "border-l-gray-400"
                              }`}
                            >
                              <p className="text-sm text-optavia-dark italic leading-relaxed mb-0">"{item.script}"</p>
                              {item.role.includes("YOU") && (
                                <Button
                                  onClick={() => copyToClipboard(item.script, `3way-${i}`)}
                                  variant="outline"
                                  size="sm"
                                  className="mt-3"
                                >
                                  {copiedScript === `3way-${i}` ? <Check className="h-3 w-3 mr-2" /> : <Copy className="h-3 w-3 mr-2" />}
                                  {copiedScript === `3way-${i}` ? "Copied!" : "Copy"}
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {section.workflow && (
                      <div className="ml-10 mt-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {section.workflow.map((item, i) => (
                            <div key={i} className="p-4 bg-gray-50 rounded-lg text-center">
                              <div className="w-8 h-8 rounded-full bg-[hsl(var(--optavia-green))] text-white flex items-center justify-center font-bold mx-auto mb-2">
                                {item.step}
                              </div>
                              <div className="font-semibold text-optavia-dark mb-1 text-sm">{item.action}</div>
                              <div className="text-xs text-optavia-gray">{item.detail}</div>
                            </div>
                          ))}
                        </div>
                        {section.content && (
                          <p className="mt-4 text-sm text-[hsl(var(--optavia-green))] font-semibold italic text-center">
                            {section.content}
                          </p>
                        )}
                      </div>
                    )}

                    {section.objections && (
                      <div className="ml-10 mt-4 space-y-2">
                        {section.objections.map((obj, i) => (
                          <div key={i} className="border border-gray-200 rounded-lg overflow-hidden">
                            <button
                              onClick={() => setExpandedObjection(expandedObjection === i ? null : i)}
                              className={`w-full p-4 flex justify-between items-center text-left transition-colors ${
                                expandedObjection === i ? "bg-green-50" : "bg-gray-50 hover:bg-gray-100"
                              }`}
                            >
                              <span className="font-semibold text-optavia-dark text-sm">"{obj.question}"</span>
                              <ChevronDown
                                className={`h-5 w-5 text-gray-500 transition-transform ${
                                  expandedObjection === i ? "rotate-180" : ""
                                }`}
                              />
                            </button>
                            {expandedObjection === i && (
                              <div className="p-4 bg-white">
                                <p className="text-sm text-optavia-gray italic leading-relaxed border-l-4 border-[hsl(var(--optavia-green))] pl-4 mb-0">
                                  "{obj.response}"
                                </p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {section.stats && (
                      <div className="ml-10 mt-4 grid grid-cols-3 gap-4">
                        {section.stats.map((stat, i) => (
                          <div key={i} className="p-5 bg-gradient-to-br from-green-50 to-green-100 rounded-lg text-center">
                            <div className="text-4xl font-bold text-[hsl(var(--optavia-green))]">{stat.number}</div>
                            <div className="text-xs text-optavia-gray mt-1">{stat.label}</div>
                          </div>
                        ))}
                      </div>
                    )}

                    {section.tips && (
                      <div className="ml-10 mt-4 space-y-2">
                        {section.tips.map((item, i) => (
                          <div key={i} className={`flex gap-3 p-4 rounded-lg ${i % 2 === 0 ? "bg-gray-50" : "bg-white"}`}>
                            <Check className="h-5 w-5 text-[hsl(var(--optavia-green))] flex-shrink-0 mt-0.5" />
                            <div>
                              <span className="font-semibold text-optavia-dark">{item.tip}</span>
                              <span className="text-optavia-gray"> – {item.detail}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {section.donts && (
                      <div className="ml-10 mt-4 space-y-2">
                        {section.donts.map((item, i) => (
                          <div key={i} className="flex items-center gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
                            <span className="text-red-600 font-bold">✕</span>
                            <span className="text-sm text-red-900">{item}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Week Calendar */}
                    {section.calendar && currentLesson.content.days && (
                      <div className="ml-10 mt-5">
                        {/* Day Selector */}
                        <div className="flex gap-2 mb-5 overflow-x-auto pb-2">
                          {currentLesson.content.days.map((day) => (
                            <button
                              key={day.day}
                              onClick={() => setSelectedDay(day.day)}
                              className={`p-3 rounded-lg border min-w-[80px] text-center transition-colors ${
                                selectedDay === day.day
                                  ? "bg-green-50 border-2 border-[hsl(var(--optavia-green))]"
                                  : "bg-white border border-gray-200 hover:bg-gray-50"
                              }`}
                            >
                              <div className="text-2xl mb-1">{day.icon}</div>
                              <div
                                className={`text-xs font-semibold ${
                                  selectedDay === day.day ? "text-[hsl(var(--optavia-green))]" : "text-optavia-gray"
                                }`}
                              >
                                Day {day.day}
                              </div>
                            </button>
                          ))}
                        </div>

                        {/* Selected Day Content */}
                        {currentLesson.content.days
                          .filter((d) => d.day === selectedDay)
                          .map((day) => (
                            <div key={day.day} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                              <div className="flex items-center gap-3 mb-4">
                                <span className="text-3xl">{day.icon}</span>
                                <div>
                                  <div className="text-xs font-semibold text-[hsl(var(--optavia-green))] uppercase">
                                    Day {day.day}: {day.title}
                                  </div>
                                  <div className="text-lg font-bold text-optavia-dark">{day.theme}</div>
                                </div>
                              </div>

                              <p className="text-sm text-optavia-gray leading-relaxed mb-5">{day.description}</p>

                              <div className="mb-5">
                                <div className="text-xs font-semibold text-optavia-gray uppercase mb-3">
                                  Tips for This Post
                                </div>
                                <div className="space-y-2">
                                  {day.tips.map((tip, i) => (
                                    <div key={i} className="flex items-center gap-2 p-2 bg-white rounded">
                                      <Check className="h-4 w-4 text-[hsl(var(--optavia-green))]" />
                                      <span className="text-xs text-optavia-gray">{tip}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              <div>
                                <div className="text-xs font-semibold text-optavia-gray uppercase mb-3">
                                  Sample Caption
                                </div>
                                <div className="bg-white rounded-lg p-4 border border-gray-200">
                                  <p className="text-sm text-optavia-dark italic leading-relaxed mb-3">
                                    "{day.sampleCaption}"
                                  </p>
                                  <Button
                                    onClick={() => copyToClipboard(day.sampleCaption, `day-${day.day}`)}
                                    variant="outline"
                                    size="sm"
                                  >
                                    {copiedScript === `day-${day.day}` ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                                    {copiedScript === `day-${day.day}` ? "Copied!" : "Copy Caption"}
                                  </Button>
                                </div>
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
                  <Button variant="outline" onClick={() => (window.location.href = "/training/understanding-health-assessment")}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Phase 1
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
                    onClick={() => (window.location.href = "/training/first-client-conversations")}
                  >
                    Continue to Module 2.2: First Client Conversations
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
