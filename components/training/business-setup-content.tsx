"use client"

import { useState, useEffect } from "react"
import { CheckCircle, Circle, ChevronRight, Play, FileText, ExternalLink, Clock, Star, ArrowLeft, ArrowRight, DollarSign, Palette, Globe, ShoppingCart, AlertCircle, BookOpen, Users } from "lucide-react"
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
  type: "Video" | "Guide" | "Document"
  icon: typeof ShoppingCart
  duration: string
  videoType?: "vimeo" | "youtube"
  videoId?: string
  content: {
    intro: string
    sections: Array<{
      title: string
      content?: string
      bullets?: string[]
      steps?: Array<{
        step: number
        title: string
        detail: string
      }>
      callout?: {
        type: "info" | "warning" | "tip"
        title: string
        content: string
      }
      externalLink?: {
        title: string
        url: string
        description: string
      }
      videoEmbed?: {
        title: string
        url: string
        description: string
      }
      additionalVideo?: {
        title: string
        url: string
        description: string
      }
      subsections?: Array<{
        subtitle: string
        content?: string
        budgetItems?: Array<{
          category: string
          percent: string
          description: string
        }>
        callout?: {
          type: "info" | "warning" | "tip"
          title: string
          content: string
        }
      }>
      important?: string[]
    }>
    keyTakeaways: string[]
  }
}

const lessons: Lesson[] = [
  {
    id: "1.2.1",
    title: "How to Purchase Your Coaching Kit",
    type: "Video",
    icon: ShoppingCart,
    duration: "8 min video",
    videoType: "vimeo",
    videoId: "548985412",
    content: {
      intro: "Your Coaching Business Kit is your official entry into the OPTAVIA coaching business. This video walks you through the purchase process step-by-step.",
      sections: [
        {
          title: "What's in Your Coaching Kit",
          content: "Your Coaching Business Kit includes everything you need to start your coaching business:",
          bullets: [
            "Official OPTAVIA Coach credentials and access",
            "Business tools and marketing materials",
            "Access to OPTAVIA Connect (your business dashboard)",
            "Training resources and guides",
            "Your unique coach referral links",
          ],
        },
        {
          title: "Before You Purchase",
          content: "Make sure you have the following ready:",
          bullets: [
            "Your sponsor's (mentor coach's) information",
            "Payment method ready",
            "About 10-15 minutes to complete the process",
          ],
        },
        {
          title: "After Purchase",
          callout: {
            type: "info",
            title: "What Happens Next",
            content: "After purchasing your kit, you'll receive an email with your login credentials for OPTAVIA Connect. You can set up OPTAVIA Pay 24 hours after your first order is entered (covered in the next lesson).",
          },
        },
      ],
      keyTakeaways: [
        "Your Coaching Kit is a one-time purchase to start your business",
        "Make sure your mentor coach is correctly linked as your sponsor",
        "Save your login credentials in a safe place",
      ],
    },
  },
  {
    id: "1.2.2",
    title: "Setting Up Your OPTAVIA Pay",
    type: "Guide",
    icon: DollarSign,
    duration: "5 min read",
    content: {
      intro: "OPTAVIA Pay is how you'll receive your coaching earnings. This must be set up to get paid!",
      sections: [
        {
          title: "When Can You Set This Up?",
          callout: {
            type: "warning",
            title: "Important Timing",
            content: "OPTAVIA Pay can be set up 24 HOURS AFTER your first order is entered. Don't try to set it up immediately - the system needs time to process your account.",
          },
        },
        {
          title: "How to Set Up OPTAVIA Pay",
          content: "Follow these steps to configure your payment method:",
          steps: [
            {
              step: 1,
              title: "Log into OPTAVIA Connect",
              detail: "Go to optaviaconnect.com and sign in with your credentials",
            },
            {
              step: 2,
              title: "Navigate to Coach Answers",
              detail: "Access the official setup guide through Coach Answers",
            },
            {
              step: 3,
              title: "Choose Your Payment Method",
              detail: "Select how you want to receive your earnings (direct deposit, check, etc.)",
            },
            {
              step: 4,
              title: "Enter Your Banking Information",
              detail: "Provide your bank account details for direct deposit",
            },
            {
              step: 5,
              title: "Verify and Submit",
              detail: "Double-check all information and submit your setup",
            },
          ],
        },
        {
          title: "Official Resource",
          externalLink: {
            title: "OPTAVIA Coach Answers: Setting Up Your Earnings",
            url: "https://coachanswers.optavia.com/help/s/article/choosing-how-to-receive-your-earnings?language=en_US",
            description: "Complete official guide with all payment options",
          },
        },
        {
          title: "Payment Schedule",
          content: "OPTAVIA pays coaches on a regular schedule. Once your OPTAVIA Pay is set up, your earnings will be deposited according to the compensation plan timeline. Check with your mentor for specific pay dates.",
        },
      ],
      keyTakeaways: [
        "Wait 24 hours after your first order before setting up OPTAVIA Pay",
        "Use the official Coach Answers guide for step-by-step instructions",
        "Double-check your banking information before submitting",
      ],
    },
  },
  {
    id: "1.2.3",
    title: "Setting Up Your Coaching Website",
    type: "Video",
    icon: Globe,
    duration: "10 min video",
    videoType: "youtube",
    videoId: "xtSR2nJJfAg",
    content: {
      intro: "Your OPTAVIA coaching website is your professional online presence. This video shows you how to set it up and customize it for your business.",
      sections: [
        {
          title: "Your Coach Website",
          content: "Every OPTAVIA coach gets a personalized website that:",
          bullets: [
            "Displays your story and transformation",
            "Allows clients to order directly through your link",
            "Provides program information to potential clients",
            "Tracks orders and referrals automatically",
          ],
        },
        {
          title: "What You'll Learn in This Video",
          content: "This tutorial covers:",
          bullets: [
            "Accessing your website admin panel",
            "Customizing your coach bio and photos",
            "Setting up your personal story section",
            "Understanding your unique referral link",
            "How client orders are tracked to you",
          ],
        },
        {
          title: "Pro Tips",
          callout: {
            type: "tip",
            title: "Make It Personal",
            content: "Your website should feel authentic to YOU. Use your real transformation photos (with disclaimer), share your genuine story, and let your personality shine through. People connect with real people, not corporate speak.",
          },
        },
      ],
      keyTakeaways: [
        "Your coach website is included with your coaching business",
        "Customize it with your story and photos to make it personal",
        "Share your unique link when connecting with potential clients",
      ],
    },
  },
  {
    id: "1.2.4",
    title: "Branding and Setting Up Your Business",
    type: "Document",
    icon: Palette,
    duration: "10 min read",
    content: {
      intro: "Setting up your coaching business for success means thinking about finances, branding, and compliance from the start. This foundation will serve you well as you grow.",
      sections: [
        {
          title: "Setting Up for Financial Success",
          content: "Treat your coaching business like a real business from day one:",
          subsections: [
            {
              subtitle: "Create a Separate Business Account",
              content: "Open a separate bank account for your coaching business. Run ALL business income and expenses through this account. This makes taxes easier and helps you see your real business performance.",
            },
            {
              subtitle: "The Business Budget Formula",
              budgetItems: [
                { category: "Taxes", percent: "30%", description: "Set aside for quarterly estimated taxes" },
                { category: "Events", percent: "10%", description: "Convention, trainings, team events" },
                { category: "Business Tools", percent: "10%", description: "Scholarships, marketing, tools" },
                { category: "Your Paycheck", percent: "50%", description: "What's left after all expenses" },
              ],
            },
            {
              subtitle: "Important Mindset",
              callout: {
                type: "warning",
                title: "Business First",
                content: "You don't get paid until all business expenses are paid. This mindset keeps your business healthy and growing.",
              },
            },
          ],
        },
        {
          title: "Business Structure Options",
          content: "As your business grows, you'll want to consider your business structure. Options include:",
          bullets: [
            "Sole Proprietor (simplest to start)",
            "LLC (Limited Liability Company)",
            "S Corporation",
            "C Corporation",
          ],
          callout: {
            type: "info",
            title: "Get Professional Advice",
            content: "We are not financial advisors. We strongly encourage you to hire a CPA and bookkeeper as your business grows. Everyone's situation is different, and a professional can give you personalized advice.",
          },
        },
        {
          title: "Branding Basics",
          content: "Your personal brand is how people perceive you and your coaching business.",
          videoEmbed: {
            title: "Branding Basics Video",
            url: "https://youtu.be/xG2c7UIS1tM",
            description: "Learn the fundamentals of building your personal brand",
          },
          externalLink: {
            title: "Growing Your Facebook Friends List",
            url: "http://optaviamedia.com/pdf/learn/OPTAVIA-LEARN_Growing-Facebook.pdf",
            description: "Official OPTAVIA guide to growing your social network",
          },
        },
        {
          title: "Required Legal Disclaimer",
          callout: {
            type: "warning",
            title: "Use This on ALL Transformation Photos",
            content: '"Average weight loss on the Optimal Weight 5 & 1 Plan® is 12 pounds. Clients are in weight loss, on average, for 12 weeks."',
          },
          important: [
            "This disclaimer is REQUIRED on all before/after photos",
            "Do NOT make medical claims",
            "Do NOT mention specific time frames on your transformations",
            "Learn how to add this disclaimer in Module 1.3.2",
          ],
        },
      ],
      keyTakeaways: [
        "Open a separate bank account for your business immediately",
        "Budget: 30% taxes, 10% events, 10% tools, 50% paycheck",
        "Always use the legal disclaimer on transformation photos",
        "Hire a CPA as your business grows",
      ],
    },
  },
]

export function BusinessSetupContent() {
  const { toast } = useToast()
  const { user } = useAuth()
  const { completedResources, toggleCompletedResource, loading } = useSupabaseData(user)
  const [expandedLesson, setExpandedLesson] = useState(lessons[0].id)

  // Map lesson IDs to resource IDs for database tracking
  const getResourceId = (lessonId: string) => `business-setup-${lessonId}`

  // Load completed lessons from database
  const completedLessons = new Set(
    lessons
      .map((lesson) => lesson.id)
      .filter((lessonId) => completedResources.includes(getResourceId(lessonId)))
  )

  // Load expanded lesson from localStorage (UI preference only)
  useEffect(() => {
    const saved = localStorage.getItem("businessSetupExpanded")
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
    localStorage.setItem("businessSetupExpanded", JSON.stringify(expandedLesson))
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
          <AlertCircle className={`h-5 w-5 ${style.iconColor}`} />
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
    } else if (lesson.videoType === "youtube" && lesson.videoId) {
      return (
        <div className="relative w-full pb-[56.25%] h-0 overflow-hidden rounded-lg mb-8 shadow-lg">
          <iframe
            src={`https://www.youtube.com/embed/${lesson.videoId}`}
            className="absolute top-0 left-0 w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
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
            <span className="font-semibold">Module 1.2</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Business Setup</h1>
          <p className="text-lg opacity-90 max-w-2xl">
            Get your coaching business officially set up with payment, website, and professional branding.
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

            {/* Quick Links */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-semibold text-optavia-dark">Quick Links</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <a
                  href="https://optaviaconnect.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg text-[hsl(var(--optavia-green))] hover:bg-gray-100 transition-colors text-sm font-medium"
                >
                  <Globe className="h-4 w-4" />
                  OPTAVIA Connect Login
                  <ExternalLink className="h-3 w-3 ml-auto" />
                </a>
                <a
                  href="https://coachanswers.optavia.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg text-[hsl(var(--optavia-green))] hover:bg-gray-100 transition-colors text-sm font-medium"
                >
                  <BookOpen className="h-4 w-4" />
                  Coach Answers
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

                    {section.steps && (
                      <div className="ml-10 space-y-3">
                        {section.steps.map((step, i) => (
                          <div
                            key={i}
                            className={`flex gap-4 p-4 rounded-lg ${
                              i % 2 === 0 ? "bg-gray-50" : "bg-white"
                            }`}
                          >
                            <div className="w-8 h-8 rounded-full bg-[hsl(var(--optavia-green))] text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                              {step.step}
                            </div>
                            <div>
                              <div className="font-semibold text-optavia-dark mb-1">{step.title}</div>
                              <div className="text-sm text-optavia-gray">{step.detail}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {section.callout && renderCallout(section.callout)}

                    {section.externalLink && (
                      <a
                        href={section.externalLink.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 ml-10 mt-4 p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-200 hover:shadow-md transition-shadow"
                      >
                        <div className="w-10 h-10 rounded-lg bg-[hsl(var(--optavia-green))] flex items-center justify-center flex-shrink-0">
                          <ExternalLink className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-optavia-dark mb-1">{section.externalLink.title}</div>
                          <div className="text-sm text-optavia-gray">{section.externalLink.description}</div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-[hsl(var(--optavia-green))] flex-shrink-0" />
                      </a>
                    )}

                    {section.videoEmbed && (
                      <a
                        href={section.videoEmbed.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 ml-10 mt-4 p-4 bg-amber-50 rounded-lg border border-amber-200 hover:shadow-md transition-shadow"
                      >
                        <div className="w-10 h-10 rounded-lg bg-amber-600 flex items-center justify-center flex-shrink-0">
                          <Play className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-optavia-dark mb-1">{section.videoEmbed.title}</div>
                          <div className="text-sm text-optavia-gray">{section.videoEmbed.description}</div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-amber-600 flex-shrink-0" />
                      </a>
                    )}

                    {section.additionalVideo && (
                      <a
                        href={section.additionalVideo.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 ml-10 mt-3 p-4 bg-amber-50 rounded-lg border border-amber-200 hover:shadow-md transition-shadow"
                      >
                        <div className="w-10 h-10 rounded-lg bg-amber-600 flex items-center justify-center flex-shrink-0">
                          <Play className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-optavia-dark mb-1">{section.additionalVideo.title}</div>
                          <div className="text-sm text-optavia-gray">{section.additionalVideo.description}</div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-amber-600 flex-shrink-0" />
                      </a>
                    )}

                    {section.contactCoach && (
                      <div className="ml-10 mt-4 p-5 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                            <span className="text-2xl">{section.contactCoach.icon}</span>
                          </div>
                          <div>
                            <div className="font-semibold text-blue-800 mb-2">{section.contactCoach.title}</div>
                            <p className="text-sm text-blue-700 leading-relaxed">{section.contactCoach.message}</p>
                            <div className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-blue-600">
                              <Users className="h-4 w-4" />
                              Contact Your Sponsoring Coach
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {section.subsections &&
                      section.subsections.map((sub, subIdx) => (
                        <div key={subIdx} className="ml-10 mt-5">
                          <h4 className="text-base font-semibold text-optavia-dark mb-2">{sub.subtitle}</h4>
                          {sub.content && (
                            <p className="text-sm text-optavia-gray leading-relaxed mb-3">{sub.content}</p>
                          )}
                          {sub.budgetItems && (
                            <div className="grid grid-cols-2 gap-3 mt-3">
                              {sub.budgetItems.map((item, i) => (
                                <div key={i} className="p-4 bg-gray-50 rounded-lg text-center">
                                  <div className="text-2xl font-bold text-[hsl(var(--optavia-green))] mb-1">
                                    {item.percent}
                                  </div>
                                  <div className="text-sm font-semibold text-optavia-dark mb-1">{item.category}</div>
                                  <div className="text-xs text-optavia-gray">{item.description}</div>
                                </div>
                              ))}
                            </div>
                          )}
                          {sub.callout && renderCallout(sub.callout)}
                        </div>
                      ))}

                    {section.important && (
                      <ul className="ml-10 mt-4 space-y-2">
                        {section.important.map((item, i) => (
                          <li key={i} className="text-sm text-optavia-gray flex items-start gap-2">
                            <span className="text-[hsl(var(--optavia-green))] mt-1">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
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
                  <Button variant="outline" onClick={() => window.history.back()}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Module 1.1
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
                    onClick={() => (window.location.href = "/training/social-media-preparation")}
                  >
                    Continue to Module 1.3: Social Media Preparation
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
