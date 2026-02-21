"use client"

import { useState, useEffect } from "react"
import { CheckCircle, Circle, ChevronRight, FileText, Clock, Star, ArrowLeft, ArrowRight, MessageCircle, Copy, Check, Users, Calendar, Heart, Play, Gift, Send, Phone, CheckSquare, Lightbulb, ExternalLink, Package, Video, Award, Timer, Bell, Sparkles, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"
import { useSupabaseData } from "@/hooks/use-supabase-data"

interface ChecklistItem {
  id: string
  task: string
  detail: string
}

interface Communication {
  type: string
  content: string
}

interface TimelineItem {
  day: string
  title: string
  icon: string
  communications: Communication[]
}

interface Practice {
  practice: string
  detail: string
}

interface TimeSlot {
  time: string
  purpose: string
}

interface VideoDetails {
  title: string
  duration: string
  covers: string[]
  link: string
  vimeoId: string
}

interface AdditionalVideo {
  title: string
  description: string
  whenToSend: string
  comingSoon?: boolean
}

interface SuccessTip {
  number: number
  title: string
  emoji: string
  description: string
  detail: string
  common_mistake: string
}

interface TimingInfo {
  when: string
  why: string
}

interface FollowUp {
  timing: string
  script: string
}

interface Reinforcement {
  tip: string
  when: string
}

interface Script {
  label: string
  text: string
}

interface Callout {
  type: "tip" | "info" | "warning"
  title: string
  content: string
}

interface Section {
  title: string
  timing?: string | Array<{ when: string; why: string }>
  icon?: string
  description?: string
  checklist?: ChecklistItem[]
  timeline?: TimelineItem[]
  practices?: Practice[]
  timeSlots?: TimeSlot[]
  tip?: string
  videoDetails?: VideoDetails
  whenToSend?: string
  script?: Script
  additionalVideos?: AdditionalVideo[]
  tips?: string[] | SuccessTip[]
  welcomeScript?: Script
  sendableScript?: Script
  followUps?: FollowUp[]
  reinforcement?: Reinforcement[]
  callout?: Callout
}

interface Lesson {
  id: string
  title: string
  type: string
  icon: typeof CheckSquare
  duration: string
  content: {
    intro: string
    sections: Section[]
    keyTakeaways: string[]
  }
}

const lessons: Lesson[] = [
  {
    id: "3.1.1",
    title: "New Client Checklist",
    type: "Checklist",
    icon: CheckSquare,
    duration: "10 min read",
    content: {
      intro: "Congratulations! You've got your first client! 🎉 This checklist ensures you don't miss any steps in launching them successfully. Use this as your go-to tracker for every new client.",
      sections: [
        {
          title: "Before Their Order Ships",
          timing: "Day 0-1",
          checklist: [
            { id: "pre-1", task: "Celebrate! Send excited message about their decision", detail: '"I\'m SO excited for you! This is going to change everything!"' },
            { id: "pre-2", task: "Confirm their order went through in your back office", detail: "Check OPTAVIA Connect to verify the order" },
            { id: "pre-3", task: "Schedule their Kickoff Call", detail: "Ideally the day before or day their box arrives" },
            { id: "pre-4", task: "Send Welcome & 9 Tips Text (Lesson 3.1.4)", detail: "Sets expectations and builds excitement" },
            { id: "pre-5", task: "Add them to your Client List", detail: "Name, start date, goals, contact info" },
            { id: "pre-6", task: "Send tracking number when available", detail: "They'll be watching for that box!" },
          ],
        },
        {
          title: "When Their Box Arrives",
          timing: "Day 2-4",
          checklist: [
            { id: "box-1", task: 'Check in: "Did your box arrive?! 📦"', detail: "Share their excitement!" },
            { id: "box-2", task: "Have them unbox and organize their Fuelings", detail: "Suggest they organize by type or meal time" },
            { id: "box-3", task: "Send Journey Kickoff Video (Lesson 3.1.3)", detail: "Prepares them for what to expect" },
            { id: "box-4", task: "Send Lean & Green Video (Lesson 3.1.3)", detail: "So they understand their one meal" },
            { id: "box-5", task: "Confirm Kickoff Call time", detail: "Remind them of your scheduled call" },
            { id: "box-6", task: "Ask about their Lean & Green meal plan for Day 1", detail: "Make sure they're prepared" },
          ],
        },
        {
          title: "Kickoff Call",
          timing: "Day of First Fueling",
          checklist: [
            { id: "kick-1", task: "Complete the Kickoff Call (30-45 min)", detail: "Go through program basics together" },
            { id: "kick-2", task: "Review the 5 Success Tips (Lesson 3.1.5)", detail: "Key reminders for their journey" },
            { id: "kick-3", task: "Set up daily check-in expectations", detail: "When and how you'll connect each day" },
            { id: "kick-4", task: "Help them log into OPTAVIA Connect app", detail: "Show them how to track" },
            { id: "kick-5", task: "Answer any questions about Fuelings", detail: "Which ones to try first, how to prepare" },
            { id: "kick-6", task: "Celebrate their Day 1!", detail: "Make it special – this is a big deal!" },
          ],
        },
        {
          title: "Week 1 Support",
          timing: "Days 1-7",
          checklist: [
            { id: "week1-1", task: "Daily check-in messages", detail: "How are you feeling? What did you eat?" },
            { id: "week1-2", task: "Address any adjustment symptoms", detail: "Headaches, fatigue, cravings are normal" },
            { id: "week1-3", task: "Share recipe ideas for Lean & Green", detail: "Keep it simple at first" },
            { id: "week1-4", task: "Encourage them through 'fat burn' transition", detail: "Days 3-5 can be tough – cheer them on" },
            { id: "week1-5", task: "Celebrate small wins", detail: "More energy, better sleep, clothes fitting" },
            { id: "week1-6", task: "First weigh-in (Day 7)", detail: "Celebrate progress, set tone for ongoing check-ins" },
          ],
        },
        {
          title: "Ongoing Success",
          timing: "Week 2+",
          checklist: [
            { id: "ongoing-1", task: "Weekly check-in calls", detail: "15-20 min to review progress and troubleshoot" },
            { id: "ongoing-2", task: "Monitor their reorder date", detail: "Reach out 5-7 days before they run out" },
            { id: "ongoing-3", task: "Share transformation stories for motivation", detail: "Help them see what's possible" },
            { id: "ongoing-4", task: "Introduce coaching opportunity when ready", detail: "Usually after 6-8 weeks of success" },
            { id: "ongoing-5", task: "Celebrate milestones", detail: "Every 10 lbs, non-scale victories, consistency" },
          ],
        },
      ],
      keyTakeaways: [
        "Use this checklist for EVERY new client to ensure consistency",
        "The first week is critical – over-communicate during this time",
        "Celebrate everything – their wins are your wins",
        "Set up systems now that scale as you grow",
      ],
    },
  },
  {
    id: "3.1.2",
    title: "Schedule for New Client Communication",
    type: "Schedule",
    icon: Calendar,
    duration: "8 min read",
    content: {
      intro: "Knowing WHEN to reach out is just as important as knowing WHAT to say. This communication schedule ensures your clients feel supported without being overwhelmed.",
      sections: [
        {
          title: "The Communication Timeline",
          timeline: [
            { day: "Day 0", title: "Order Placed", icon: "🛒", communications: [{ type: "Text", content: "Celebration message – you're so excited for them!" }, { type: "Text", content: "Welcome & 9 Tips (see Lesson 3.1.4)" }, { type: "Text", content: "Schedule Kickoff Call for when box arrives" }] },
            { day: "Day 1-2", title: "Order Processing", icon: "📦", communications: [{ type: "Text", content: "Send tracking number when available" }, { type: "Text", content: "Ask about their meal prep plans" }, { type: "Optional", content: "Share a simple Lean & Green recipe" }] },
            { day: "Day 3-4", title: "Box Arrives", icon: "🎁", communications: [{ type: "Text", content: '"Did it arrive?! Unboxing time!"' }, { type: "Video", content: "Send Journey Kickoff Video" }, { type: "Video", content: "Send Lean & Green Video" }, { type: "Text", content: "Confirm Kickoff Call time" }] },
            { day: "Day 4-5", title: "Kickoff Call", icon: "📞", communications: [{ type: "Call", content: "30-45 min Kickoff Call" }, { type: "Text", content: "Follow-up: 5 Success Tips" }, { type: "Text", content: '"You\'ve GOT this! Day 1 starts tomorrow!"' }] },
            { day: "Day 5", title: "Day 1 on Program", icon: "🌟", communications: [{ type: "Text (AM)", content: '"Good morning! Day 1! How are you feeling?"' }, { type: "Text (PM)", content: '"How did Day 1 go? What Fuelings did you try?"' }] },
            { day: "Days 6-8", title: "Days 2-4 (Transition)", icon: "💪", communications: [{ type: "Daily Text", content: "Morning check-in: How are you feeling?" }, { type: "Daily Text", content: "Evening: Celebrate their wins" }, { type: "As Needed", content: "Address symptoms: headaches, fatigue, cravings" }] },
            { day: "Day 9-11", title: "Days 5-7 (Finding Rhythm)", icon: "🔥", communications: [{ type: "Daily Text", content: "Continued daily check-ins" }, { type: "Text", content: "\"You're in fat burn now! How's your energy?\"" }, { type: "Text", content: "First weigh-in celebration (Day 7)" }] },
            { day: "Week 2", title: "Building Routine", icon: "📈", communications: [{ type: "Daily Text", content: "Can reduce to once daily if going well" }, { type: "Call", content: "Weekly check-in call (15-20 min)" }, { type: "Text", content: "Share recipe ideas and tips" }] },
            { day: "Week 3-4", title: "Momentum", icon: "🚀", communications: [{ type: "Text", content: "Daily or every-other-day check-ins" }, { type: "Call", content: "Weekly check-in call" }, { type: "Text", content: "Reorder reminder (5-7 days before running out)" }] },
            { day: "Month 2+", title: "Ongoing Support", icon: "⭐", communications: [{ type: "Text", content: "3-4x per week check-ins" }, { type: "Call", content: "Weekly or bi-weekly calls" }, { type: "Text", content: "Monthly milestone celebrations" }] },
          ],
        },
        {
          title: "Communication Best Practices",
          practices: [
            { practice: "Be consistent", detail: "Set expectations and stick to them" },
            { practice: "Front-load support", detail: "Week 1 needs the most attention" },
            { practice: "Match their energy", detail: "Some clients want more contact, some less" },
            { practice: "Use voice notes", detail: "More personal than text, faster than calls" },
            { practice: "Don't ghost them", detail: 'If you\'re busy, send a quick "thinking of you!"' },
            { practice: "Celebrate everything", detail: "Every win deserves acknowledgment" },
          ],
        },
        {
          title: "What Time of Day to Reach Out",
          timeSlots: [
            { time: "Morning (7-9 AM)", purpose: "Set the tone for their day, remind of goals" },
            { time: "Midday (11 AM-1 PM)", purpose: "Check on lunch choices, Lean & Green planning" },
            { time: "Evening (6-8 PM)", purpose: "Celebrate wins, troubleshoot challenges, check tomorrow's plan" },
          ],
          tip: "Ask your client when they prefer to hear from you!",
        },
      ],
      keyTakeaways: [
        "Week 1 requires daily (sometimes 2x daily) contact",
        "Gradually reduce frequency as they build confidence",
        "Always reach out about reorders 5-7 days early",
        "Adjust communication style to each client's needs",
      ],
    },
  },
  {
    id: "3.1.3",
    title: "New Client Videos",
    type: "Videos",
    icon: Video,
    duration: "5 min read",
    content: {
      intro: "These videos are essential resources for your new clients. Send them at the right time to set your clients up for success. You can copy the links below to share directly.",
      sections: [
        {
          title: "Journey Kickoff Video",
          icon: "🚀",
          description: "Send this when their box arrives or right before Day 1. It covers what to expect in the first few days and weeks.",
          videoDetails: {
            title: "Your OPTAVIA Journey Kickoff",
            duration: "~15 minutes",
            covers: ["What to expect in the first 3-5 days", "Understanding the adjustment period", "How fat burn works", "Tips for success from the start", "Common questions answered"],
            link: "https://vimeo.com/123456789",
            vimeoId: "805182089",
          },
          whenToSend: "Send when box arrives, before Kickoff Call",
          script: {
            label: "Message to Send with Video",
            text: "Here's an important video to watch before we do our Kickoff Call! It covers everything you need to know about your first few days. Watch it when you have 15 quiet minutes – it'll answer so many questions! 🎬",
          },
        },
        {
          title: "Lean & Green Video",
          icon: "🥗",
          description: "Send this to explain their one meal per day. Essential for understanding what to eat and how to build a balanced Lean & Green meal.",
          videoDetails: {
            title: "Understanding Your Lean & Green Meal",
            duration: "~10 minutes",
            covers: ["What is a Lean & Green meal", "Protein portions and options", "Green vegetable choices", "Healthy fat servings", "Sample meals and recipes", "Common mistakes to avoid"],
            link: "https://vimeo.com/123456790",
            vimeoId: "805182567",
          },
          whenToSend: "Send with Journey Kickoff video or day before Day 1",
          script: {
            label: "Message to Send with Video",
            text: "This video explains your Lean & Green meal – the ONE meal you'll cook each day! It's easier than you think. Watch this and let me know if you have any questions about what to eat. I have tons of recipe ideas too! 🥗",
          },
        },
        {
          title: "Additional Helpful Videos",
          additionalVideos: [
            { title: "How to Use OPTAVIA Connect App", description: "Show clients how to track their daily habits", whenToSend: "After Kickoff Call" },
            { title: "Fueling Hacks & Recipes", description: "Creative ways to enjoy Fuelings", whenToSend: "Week 2 or when they need variety" },
            { title: "Staying On Track While Traveling", description: "Tips for maintaining the program on-the-go", whenToSend: "When they have travel planned" },
          ],
        },
        {
          title: "Creating Your Own Videos",
          tips: ["Consider making a personal welcome video for each client", "Screen record yourself showing how to navigate Connect", "Quick recipe videos from your own kitchen are powerful", '"Day in the Life" videos help clients visualize success'],
          callout: {
            type: "tip",
            title: "Pro Tip",
            content: "Personalized video messages have MUCH higher engagement than generic ones. A quick 30-second welcome video makes clients feel special!",
          },
        },
      ],
      keyTakeaways: [
        "Send Journey Kickoff video when box arrives",
        "Send Lean & Green video before or on Day 1",
        "Personalized videos make a huge impact",
        "Use videos to save time explaining the same things",
      ],
    },
  },
  {
    id: "3.1.4",
    title: "Welcome & 9 Tips Text",
    type: "Script",
    icon: MessageCircle,
    duration: "5 min read",
    content: {
      intro: "This is the FIRST message you send to a new client after they place their order. It sets expectations, builds excitement, and gives them actionable tips while they wait for their box.",
      sections: [
        {
          title: "The Welcome Message",
          description: "Send this immediately after they place their order. It's long, but it gives them everything they need to feel prepared and excited.",
          welcomeScript: {
            label: "Welcome & 9 Tips Text",
            text: `🎉 CONGRATULATIONS on making this decision for yourself! I am SO excited to be on this journey with you!

While you're waiting for your box to arrive (usually 3-5 business days), here are 9 tips to set you up for success:

1️⃣ TAKE YOUR 'BEFORE' PHOTOS NOW
Front, side, and back in form-fitting clothes. You'll thank yourself later – I promise!

2️⃣ MEASURE YOURSELF
Chest, waist, hips, thighs, and arms. The scale doesn't tell the whole story!

3️⃣ CLEAN OUT YOUR KITCHEN
Donate or hide tempting foods. Out of sight = out of mind. Set yourself up to win!

4️⃣ STOCK UP ON LEAN & GREEN STAPLES
Lean proteins (chicken, fish, lean beef), green veggies, and healthy fats. I'll send you recipes!

5️⃣ GET A GOOD WATER BOTTLE
You'll be drinking 64+ oz of water daily. Make it easy!

6️⃣ TELL YOUR SUPPORT PEOPLE
Let your family/roommates know what you're doing. Ask for their encouragement!

7️⃣ CLEAR YOUR CALENDAR FOR DAY 1
Your first day should be low-stress. Don't start on a holiday or big event day!

8️⃣ PREPARE MENTALLY
This isn't a diet – it's a lifestyle change. Commit to giving it 100% for the first 30 days.

9️⃣ GET EXCITED!
You're about to feel AMAZING. This program works if you work it!

📦 When your box arrives, let me know immediately! We'll schedule your Kickoff Call and get you started.

I'm here for you every step of the way. Let's DO this! 💪`,
          },
        },
        {
          title: "When to Send This",
          timing: [
            { when: "Immediately after order confirmation", why: "Strike while they're excited!" },
            { when: "Within a few hours max", why: "Don't let doubt creep in" },
          ],
        },
        {
          title: "Follow-Up Messages While They Wait",
          followUps: [
            { timing: "Day 1-2 after order", script: "How's the kitchen cleanout going? What tempting foods are you getting rid of? 🧹" },
            { timing: "Day 2-3", script: "Did you take your before photos yet? 📸 I know it's uncomfortable, but future you will be SO grateful!" },
            { timing: "When tracking shows delivery soon", script: "Your box is almost there! 📦 Let me know the SECOND it arrives – I'm excited to get you started!" },
          ],
        },
        {
          title: "Customization Tips",
          tips: ["Add their name at the beginning", "Reference something from their Health Assessment", 'Mention their specific goal ("40 lbs lighter by summer!")', "Add a personal note about your own experience", "Adjust tone to match the client's personality"],
        },
      ],
      keyTakeaways: [
        "Send this message immediately after they order",
        "This sets the tone for your entire coaching relationship",
        "Follow up during the waiting period to keep momentum",
        "Customize to make it personal – don't just copy/paste",
      ],
    },
  },
  {
    id: "3.1.5",
    title: "5 Success Tips",
    type: "Tips",
    icon: Award,
    duration: "5 min read",
    content: {
      intro: "These are the 5 most important tips for client success. Share these during the Kickoff Call and send as a follow-up text. Simple rules that make ALL the difference.",
      sections: [
        {
          title: "The 5 Success Tips",
          tips: [
            { number: 1, title: "Eat Every 2-3 Hours", emoji: "⏰", description: "Space your 6 meals throughout the day. Set alarms if you need to! This keeps your metabolism active and prevents extreme hunger.", detail: "Example schedule: 7am, 10am, 12pm, 3pm, 5pm, 8pm", common_mistake: "Skipping meals or going too long between them" },
            { number: 2, title: "Drink Your Water", emoji: "💧", description: "Aim for at least 64 oz (8 glasses) of water daily. More if you're active or it's hot. Water helps your body burn fat efficiently.", detail: "Tip: Finish 32 oz before noon, 32 oz before dinner", common_mistake: "Drinking too much caffeine or not enough plain water" },
            { number: 3, title: "Follow the Plan 100%", emoji: "✅", description: "Don't modify the program – it's designed precisely for optimal fat burn. No adding foods, no skipping Fuelings, no substitutions.", detail: "The first 30 days especially – trust the process!", common_mistake: "Adding 'healthy' foods that aren't on plan, or thinking one bite won't hurt" },
            { number: 4, title: "Stay Connected with Me", emoji: "📱", description: "Check in with me daily, especially in the first few weeks. I'm your coach – let me help! No question is too small.", detail: "I'm here for wins, struggles, and everything in between", common_mistake: "Going silent when struggling instead of reaching out" },
            { number: 5, title: "Trust the Process", emoji: "🙏", description: "The scale won't move every day. Some weeks are slower than others. This is normal! Focus on how you FEEL, not just the number.", detail: "Non-scale victories matter: energy, sleep, clothes fitting, confidence", common_mistake: "Getting discouraged by daily scale fluctuations" },
          ],
        },
        {
          title: "Send as a Text",
          sendableScript: {
            label: "5 Success Tips Text",
            text: `Here are your 5 SUCCESS TIPS – the keys to crushing this program! 🔑

⏰ 1. EAT EVERY 2-3 HOURS
Keep your metabolism fired up! Set alarms if needed.

💧 2. DRINK YOUR WATER
64+ oz daily. Your body needs it to burn fat!

✅ 3. FOLLOW THE PLAN 100%
No modifications – trust the process, especially the first 30 days.

📱 4. STAY CONNECTED WITH ME
Check in daily. I'm here for you – no question is too small!

🙏 5. TRUST THE PROCESS
The scale won't move every day. Focus on how you FEEL.

Save this and read it daily! You've GOT this! 💪`,
          },
        },
        {
          title: "Reinforcing the Tips",
          reinforcement: [
            { tip: "Tip 1 (Eat Every 2-3 Hours)", when: "When they mention extreme hunger or low energy" },
            { tip: "Tip 2 (Water)", when: "When they have headaches or slow progress" },
            { tip: "Tip 3 (Follow 100%)", when: "When they ask about adding foods or making changes" },
            { tip: "Tip 4 (Stay Connected)", when: "When you haven't heard from them in a day or two" },
            { tip: "Tip 5 (Trust Process)", when: "When they're frustrated about the scale" },
          ],
        },
        {
          title: "Creating a Visual",
          callout: {
            type: "tip",
            title: "Power Move",
            content: "Create a shareable graphic with these 5 tips using Canva. Clients can save it to their phone and reference it anytime. Visual reminders are powerful!",
          },
        },
      ],
      keyTakeaways: [
        "Share these during Kickoff Call AND send as a text",
        "Reference specific tips when troubleshooting with clients",
        "These same 5 tips apply to every client, every time",
        "Simple rules, consistently followed, lead to success",
      ],
    },
  },
]

export function FirstClientContent() {
  const { toast } = useToast()
  const { user } = useAuth()
  const { completedResources, toggleCompletedResource } = useSupabaseData(user)
  const [expandedLesson, setExpandedLesson] = useState(lessons[0].id)
  const [copiedScript, setCopiedScript] = useState<string | null>(null)
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({})

  const getResourceId = (lessonId: string) => `first-client-${lessonId}`

  const completedLessons = new Set(
    lessons.map((lesson) => lesson.id).filter((lessonId) => completedResources.includes(getResourceId(lessonId)))
  )

  useEffect(() => {
    const saved = localStorage.getItem("firstClientExpanded")
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
    localStorage.setItem("firstClientExpanded", JSON.stringify(expandedLesson))
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

  const toggleChecked = (id: string) => {
    setCheckedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
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

  const renderCopyableScript = (script: Script, id: string, large = false) => (
    <div className={`rounded-xl p-5 mb-4 ${large ? "bg-gradient-to-br from-green-50 to-green-100 border-2 border-[hsl(var(--optavia-green))]" : "bg-gray-50 border border-gray-200"}`}>
      {script.label && (
        <div className="text-xs font-bold text-[hsl(var(--optavia-green))] mb-3 uppercase flex items-center gap-2">
          <Send className="h-4 w-4" />
          {script.label}
        </div>
      )}
      <pre className="text-sm text-optavia-dark leading-relaxed whitespace-pre-wrap font-sans mb-4">{script.text}</pre>
      <Button
        onClick={() => copyToClipboard(script.text, id)}
        variant={copiedScript === id ? "default" : "outline"}
        className={copiedScript === id ? "bg-[hsl(var(--optavia-green))] hover:bg-[hsl(var(--optavia-green-dark))]" : ""}
      >
        {copiedScript === id ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
        {copiedScript === id ? "Copied to Clipboard!" : "Copy Full Message"}
      </Button>
    </div>
  )

  const isSuccessTipsArray = (tips: string[] | SuccessTip[]): tips is SuccessTip[] => {
    return tips.length > 0 && typeof tips[0] === "object" && "number" in tips[0]
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-[hsl(var(--optavia-green))] to-[hsl(var(--optavia-green-dark))] text-white py-8 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 text-sm opacity-90 mb-2 uppercase tracking-wide">
            <span>Training Center</span>
            <ChevronRight className="h-4 w-4" />
            <span>Phase 3: First 30 Days</span>
            <ChevronRight className="h-4 w-4" />
            <span className="font-semibold">Module 3.1</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2 flex items-center gap-3">
            <Sparkles className="h-8 w-8" />
            When You Get Your First Client
          </h1>
          <p className="text-lg opacity-90 max-w-2xl">Know exactly how to launch and support a new client for success. Checklists, schedules, and scripts ready to use!</p>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid lg:grid-cols-[320px_1fr] gap-8">
          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Celebration Card */}
            <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-300 text-center">
              <CardContent className="pt-6">
                <div className="text-5xl mb-2">🎉</div>
                <div className="font-bold text-amber-700 text-lg">Congratulations!</div>
                <p className="text-sm text-amber-800 mt-2">Getting your first client is a HUGE milestone. You're officially a coach!</p>
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
                    <button
                      key={lesson.id}
                      onClick={() => setExpandedLesson(lesson.id)}
                      className={`w-full p-4 flex items-start gap-3 border-b border-gray-100 last:border-b-0 transition-colors text-left ${isActive ? "bg-green-50 border-l-4 border-l-[hsl(var(--optavia-green))]" : "hover:bg-gray-50"}`}
                    >
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
                      {section.icon ? (
                        <span className="text-2xl">{section.icon}</span>
                      ) : (
                        <span className="w-7 h-7 rounded-full bg-gradient-to-br from-[hsl(var(--optavia-green))] to-[hsl(var(--optavia-green-dark))] text-white flex items-center justify-center text-sm font-bold">{idx + 1}</span>
                      )}
                      {section.title}
                      {section.timing && !section.checklist && typeof section.timing === 'string' && <Badge variant="secondary" className="ml-2 text-xs">{section.timing}</Badge>}
                    </h3>

                    {section.description && <p className="text-base leading-relaxed text-optavia-gray mb-4">{section.description}</p>}

                    {/* Checklist */}
                    {section.checklist && (
                      <div className="mb-4">
                        {section.timing && typeof section.timing === 'string' && (
                          <Badge variant="outline" className="mb-3 text-xs bg-green-50 text-green-700 border-green-300">
                            {section.timing}
                          </Badge>
                        )}
                        <div className="space-y-2">
                          {section.checklist.map((item) => (
                            <div
                              key={item.id}
                              onClick={() => toggleChecked(item.id)}
                              className={`flex gap-3 p-4 rounded-lg cursor-pointer transition-all ${checkedItems[item.id] ? "bg-green-50 border border-[hsl(var(--optavia-green))]" : "bg-gray-50 border border-gray-200 hover:bg-gray-100"}`}
                            >
                              <div className="flex-shrink-0 mt-0.5">{checkedItems[item.id] ? <CheckCircle className="h-5 w-5 text-[hsl(var(--optavia-green))]" /> : <Circle className="h-5 w-5 text-gray-300" />}</div>
                              <div className="flex-1">
                                <div className={`font-semibold ${checkedItems[item.id] ? "text-[hsl(var(--optavia-green))] line-through" : "text-optavia-dark"}`}>{item.task}</div>
                                <div className="text-sm text-optavia-gray mt-1">{item.detail}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Timeline */}
                    {section.timeline && (
                      <div className="space-y-5 relative">
                        {section.timeline.map((item, i) => (
                          <div key={i} className="flex gap-5 relative">
                            {i < section.timeline!.length - 1 && <div className="absolute left-[44px] top-[70px] w-0.5 h-[calc(100%-30px)] bg-gray-200" />}
                            <div className="w-[90px] text-center flex-shrink-0">
                              <div className="text-3xl mb-1">{item.icon}</div>
                              <Badge className="text-xs bg-green-100 text-green-700 border-green-300">{item.day}</Badge>
                            </div>
                            <div className="flex-1 bg-gray-50 rounded-lg p-5">
                              <div className="font-bold text-optavia-dark mb-3">{item.title}</div>
                              <div className="space-y-2">
                                {item.communications.map((comm, j) => (
                                  <div key={j} className="flex items-start gap-2">
                                    <Badge variant="outline" className={`text-xs flex-shrink-0 ${comm.type === "Call" ? "bg-orange-50 text-orange-700 border-orange-300" : comm.type === "Video" ? "bg-purple-50 text-purple-700 border-purple-300" : comm.type === "Optional" || comm.type === "As Needed" ? "bg-gray-100 text-gray-600" : "bg-blue-50 text-blue-700 border-blue-300"}`}>
                                      {comm.type}
                                    </Badge>
                                    <span className="text-sm text-optavia-gray">{comm.content}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Practices */}
                    {section.practices && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {section.practices.map((item, i) => (
                          <div key={i} className="p-4 bg-gray-50 rounded-lg border-l-4 border-[hsl(var(--optavia-green))]">
                            <div className="font-semibold text-optavia-dark mb-1">{item.practice}</div>
                            <div className="text-sm text-optavia-gray">{item.detail}</div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Time Slots */}
                    {section.timeSlots && (
                      <div className="space-y-2 mb-4">
                        {section.timeSlots.map((slot, i) => (
                          <div key={i} className="flex gap-4 p-3 bg-gray-50 rounded-lg">
                            <div className="font-semibold text-[hsl(var(--optavia-green))] min-w-[140px]">{slot.time}</div>
                            <div className="text-sm text-optavia-gray">{slot.purpose}</div>
                          </div>
                        ))}
                        {section.tip && (
                          <div className="mt-3 p-3 bg-amber-50 rounded-lg text-sm text-amber-900">💡 {section.tip}</div>
                        )}
                      </div>
                    )}

                    {/* Video Details */}
                    {section.videoDetails && (
                      <div className="bg-gray-50 rounded-xl p-6 mb-5">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[hsl(var(--optavia-green))] to-[hsl(var(--optavia-green-dark))] flex items-center justify-center">
                            <Play className="h-6 w-6 text-white fill-white" />
                          </div>
                          <div>
                            <div className="font-bold text-optavia-dark">{section.videoDetails.title}</div>
                            <div className="text-sm text-optavia-gray">{section.videoDetails.duration}</div>
                          </div>
                        </div>
                        <div className="mb-4">
                          <div className="text-xs font-semibold text-optavia-gray uppercase mb-2">This video covers:</div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {section.videoDetails.covers.map((item, i) => (
                              <div key={i} className="flex items-center gap-2 text-sm text-optavia-gray">
                                <Check className="h-4 w-4 text-[hsl(var(--optavia-green))]" />
                                {item}
                              </div>
                            ))}
                          </div>
                        </div>
                        {section.whenToSend && (
                          <div className="p-3 bg-green-100 rounded-lg mb-4">
                            <div className="text-xs font-semibold text-green-800 mb-1">📅 When to Send</div>
                            <div className="text-sm text-green-900">{section.whenToSend}</div>
                          </div>
                        )}
                        {section.script && renderCopyableScript(section.script, `video-script-${idx}`)}
                      </div>
                    )}

                    {/* Additional Videos */}
                    {section.additionalVideos && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {section.additionalVideos.map((video, i) => (
                          <div key={i} className={`p-4 rounded-lg border ${video.comingSoon ? "bg-amber-50 border-amber-200" : "bg-gray-50 border-gray-200"}`}>
                            <div className="flex items-center gap-2 mb-2">
                              <Video className={`h-4 w-4 ${video.comingSoon ? "text-amber-600" : "text-purple-600"}`} />
                              <span className="font-semibold text-optavia-dark text-sm">{video.title}</span>
                              {video.comingSoon && (
                                <span className="text-xs bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full font-semibold">Coming Soon</span>
                              )}
                            </div>
                            <div className="text-sm text-optavia-gray mb-2">{video.description}</div>
                            <div className="text-xs font-semibold text-[hsl(var(--optavia-green))]">📅 {video.whenToSend}</div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Tips List (strings) */}
                    {section.tips && !isSuccessTipsArray(section.tips) && (
                      <div className="space-y-2">
                        {section.tips.map((tip, i) => (
                          <div key={i} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                            <Lightbulb className="h-4 w-4 text-amber-500" />
                            <span className="text-sm text-optavia-gray">{tip}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Success Tips (numbered) */}
                    {section.tips && isSuccessTipsArray(section.tips) && (
                      <div className="space-y-4">
                        {section.tips.map((tip) => (
                          <div key={tip.number} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                            <div className="flex items-center gap-4 mb-3">
                              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[hsl(var(--optavia-green))] to-[hsl(var(--optavia-green-dark))] text-white flex items-center justify-center text-2xl font-bold">{tip.number}</div>
                              <div>
                                <div className="text-3xl mb-1">{tip.emoji}</div>
                                <div className="font-bold text-optavia-dark text-lg">{tip.title}</div>
                              </div>
                            </div>
                            <p className="text-base text-optavia-gray leading-relaxed mb-3">{tip.description}</p>
                            <div className="p-3 bg-green-100 rounded-lg mb-2">
                              <span className="text-sm text-green-900">💡 {tip.detail}</span>
                            </div>
                            <div className="p-3 bg-red-50 rounded-lg">
                              <span className="text-sm text-red-900">⚠️ Common mistake: {tip.common_mistake}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Welcome Script */}
                    {section.welcomeScript && renderCopyableScript(section.welcomeScript, "welcome-script", true)}

                    {/* Sendable Script */}
                    {section.sendableScript && renderCopyableScript(section.sendableScript, "sendable-script", true)}

                    {/* Timing info (non-checklist) */}
                    {section.timing && !section.checklist && Array.isArray(section.timing) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                        {(section.timing as unknown as TimingInfo[]).map((item, i) => (
                          <div key={i} className="p-4 bg-green-50 rounded-lg">
                            <div className="font-semibold text-green-800 mb-1">{item.when}</div>
                            <div className="text-sm text-green-900">{item.why}</div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Follow-ups */}
                    {section.followUps && (
                      <div className="space-y-3">
                        {section.followUps.map((item, i) => (
                          <div key={i} className="p-4 bg-gray-50 rounded-lg">
                            <div className="text-xs font-semibold text-[hsl(var(--optavia-green))] mb-2">{item.timing}</div>
                            <div className="text-sm text-optavia-gray italic p-3 bg-white rounded border-l-4 border-[hsl(var(--optavia-green))]">"{item.script}"</div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Reinforcement Table */}
                    {section.reinforcement && (
                      <div className="space-y-2">
                        {section.reinforcement.map((item, i) => (
                          <div key={i} className={`flex gap-4 p-3 rounded-lg ${i % 2 === 0 ? "bg-gray-50" : "bg-white"}`}>
                            <div className="font-semibold text-[hsl(var(--optavia-green))] min-w-[180px]">{item.tip}</div>
                            <div className="text-sm text-optavia-gray">When: {item.when}</div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Callout */}
                    {section.callout && (
                      <div className={`mt-4 p-5 rounded-lg border-l-4 ${section.callout.type === "tip" ? "bg-green-50 border-green-500" : "bg-blue-50 border-blue-500"}`}>
                        <div className={`flex items-center gap-2 mb-2 font-bold ${section.callout.type === "tip" ? "text-green-800" : "text-blue-800"}`}>
                          <Lightbulb className="h-5 w-5" />
                          {section.callout.title}
                        </div>
                        <p className="text-sm text-optavia-gray leading-relaxed">{section.callout.content}</p>
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

                {/* Scope of Practice Reminder */}
                <div className="mt-6 p-4 bg-red-50 border-l-4 border-red-400 rounded-r-lg">
                  <div className="flex items-center gap-2 font-semibold text-red-900 mb-2">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    Scope of Practice Reminder
                  </div>
                  <p className="text-sm text-red-900 leading-relaxed">
                    Health coaches are not medical professionals. When clients mention symptoms like headaches, 
                    fatigue, or other physical issues, provide general encouragement but never diagnose or give 
                    medical advice. If symptoms persist or are concerning, always recommend they consult their 
                    healthcare provider. When in doubt, refer to their doctor.
                  </p>
                </div>
              </CardContent>

              {/* Navigation Footer */}
              <div className="border-t bg-gray-50 p-6 flex justify-between items-center">
                {prevLesson ? (
                  <Button variant="outline" onClick={() => setExpandedLesson(prevLesson.id)}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Previous
                  </Button>
                ) : (
                  <Button variant="outline" onClick={() => (window.location.href = "/training/first-client-conversations")}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Phase 2
                  </Button>
                )}

                {nextLesson ? (
                  <Button onClick={() => setExpandedLesson(nextLesson.id)} className="bg-[hsl(var(--optavia-green))] hover:bg-[hsl(var(--optavia-green-dark))] text-white">
                    Next: {nextLesson.title.split(" ").slice(0, 3).join(" ")}...
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button className="bg-[hsl(var(--optavia-green))] hover:bg-[hsl(var(--optavia-green-dark))] text-white" onClick={() => (window.location.href = "/training/client-resources")}>
                    Continue to Module 3.3: Client Resources
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
