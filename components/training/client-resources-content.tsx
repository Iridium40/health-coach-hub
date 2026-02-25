"use client"

import { useState, useEffect } from "react"
import { CheckCircle, Circle, ChevronRight, ChevronDown, FileText, Clock, Star, ArrowLeft, ArrowRight, Copy, Check, BookOpen, Utensils, ShoppingCart, HelpCircle, Lightbulb, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"
import { useSupabaseData } from "@/hooks/use-supabase-data"

interface Guide {
  name: string
  icon: string
  description: string
  whenToSend: string
  keyContents: string[]
  messageScript: string
}

interface TimelineItem {
  phase: string
  guides: string[]
}

interface DailyMeal {
  time: string
  type: string
  icon: string
  options: string
  tip: string
  isLeanGreen?: boolean
}

interface DailyPlan {
  title: string
  subtitle: string
  meals: DailyMeal[]
  waterReminder: {
    goal: string
    tip: string
  }
}

interface Rule {
  rule: string
  why: string
}

interface VeggieCategory {
  category: string
  examples: string
}

interface LeanGreen {
  protein: {
    title: string
    options: string[]
  }
  veggies: {
    title: string
    categories: VeggieCategory[]
  }
  fats: {
    title: string
    options: string[]
  }
}

interface SampleMeal {
  time: string
  meal: string
  type: string
}

interface Script {
  label: string
  text: string
}

interface Benefit {
  benefit: string
  detail: string
}

interface Step {
  step: number
  title: string
  instruction: string
  tip: string
}

interface FAQ {
  question: string
  answer: string
}

interface Guidance {
  situation: string
  action: string
}

interface ReorderTimeline {
  days: string
  action: string
}

interface Section {
  title: string
  description?: string
  content?: string
  guides?: Guide[]
  timeline?: TimelineItem[] | ReorderTimeline[]
  tips?: string[]
  dailyPlan?: DailyPlan
  rules?: Rule[]
  leanGreen?: LeanGreen
  sampleDay?: SampleMeal[]
  messageScript?: Script
  benefits?: Benefit[]
  steps?: Step[]
  faqs?: FAQ[]
  guidance?: Guidance[]
  warning?: string
  scripts?: Script[]
}

export interface Lesson {
  id: string
  title: string
  type: string
  icon: typeof BookOpen
  duration: string
  content: {
    intro: string
    sections: Section[]
    keyTakeaways: string[]
  }
}

export const lessons: Lesson[] = [
  {
    id: "3.3.1",
    title: "Digital Guides",
    type: "Resources",
    icon: BookOpen,
    duration: "12 min read",
    content: {
      intro: "OPTAVIA provides official digital guides for clients. Knowing WHICH guide to send WHEN makes you a more effective coach. Here's your complete reference library with when and how to share each resource.",
      sections: [
        {
          title: "Essential Client Guides",
          description: "These are the core guides every client should have access to. Send them at the appropriate time in their journey.",
          guides: [
            {
              name: "Optimal Weight 5&1 Plan Quick Start Guide",
              icon: "🚀",
              description: "Complete overview of the 5&1 Plan including meal timing, Fueling info, and getting started tips.",
              whenToSend: "With their first order or during Kickoff Call",
              keyContents: ["Program overview and expectations", "Meal timing guidelines (every 2-3 hours)", "Introduction to Fuelings", "Lean & Green basics", "First week tips"],
              messageScript: "Here's your Quick Start Guide! 📖 This has everything you need to know about the program. I'd especially focus on pages 4-6 about meal timing. Let me know what questions you have after you read it!",
            },
            {
              name: "Lean & Green Meal Guide",
              icon: "🥗",
              description: "Comprehensive guide to building proper Lean & Green meals with protein portions, vegetable options, and healthy fats.",
              whenToSend: "Before Day 1 or when they have L&G questions",
              keyContents: ["Lean protein options and portions (5-7 oz)", "Green vegetable categories and servings", "Healthy fat options and amounts", "Sample meal combinations", "Cooking method recommendations"],
              messageScript: "Here's the Lean & Green guide! 🥗 This shows you exactly how to build your one cooked meal each day. The protein portion chart on page 2 is super helpful! Save this one – you'll reference it a lot!",
            },
            {
              name: "Condiment Guide",
              icon: "🧂",
              description: "Approved condiments, seasonings, and flavor enhancers with serving sizes.",
              whenToSend: "Week 1 or when they ask about adding flavor",
              keyContents: ["Approved condiments by category", "Serving size limits", "Sugar-free options", "Herbs and spices (unlimited)", "What to avoid"],
              messageScript: "You asked about condiments – here's the official guide! 🧂 Great news: most herbs and spices are unlimited! The key is watching serving sizes on things like mustard, hot sauce, and dressings. Check out page 3 for the full list!",
            },
            {
              name: "Dining Out Guide",
              icon: "🍽️",
              description: "How to stay on plan at restaurants, including chain restaurant recommendations.",
              whenToSend: "Before a restaurant outing or social event",
              keyContents: ["General dining out strategies", "What to order (lean protein + veggies)", "What to avoid (breadbaskets, fried foods)", "Chain restaurant suggestions", "How to handle social pressure"],
              messageScript: "Restaurant meal coming up? Here's the Dining Out Guide! 🍽️ Page 4 has specific suggestions for popular chains. The key is: order a lean protein with double veggies instead of starch, ask for dressings on the side, and you're golden!",
            },
            {
              name: "Grocery Shopping Guide",
              icon: "🛒",
              description: "What to buy at the store for Lean & Green meals and approved snacks.",
              whenToSend: "Before their first grocery trip on program",
              keyContents: ["Protein aisle recommendations", "Produce section staples", "Dairy section choices", "What to skip", "Budget-friendly options"],
              messageScript: "Heading to the grocery store? Here's your shopping guide! 🛒 Focus on the perimeter of the store – that's where all your L&G ingredients are. I highlighted my favorites on page 2. Let me know if you want my personal shopping list too!",
            },
            {
              name: "Fueling Preparation Guide",
              icon: "👨‍🍳",
              description: "Creative ways to prepare and enjoy Fuelings – recipes, hacks, and variations.",
              whenToSend: "Week 2-3 or when they want variety",
              keyContents: ["Shake preparation tips", "Bar hacks (freezing, warming)", "Soup enhancements", "Sweet treat variations", "Savory options"],
              messageScript: "Want to get creative with your Fuelings? Here's the preparation guide! 👨‍🍳 My favorite hack is on page 5 – freezing the brownie bar for 20 minutes makes it taste like a candy bar! What Fuelings do you want to experiment with?",
            },
            {
              name: "Travel Guide",
              icon: "✈️",
              description: "How to stay on plan while traveling – packing tips, airport strategies, hotel solutions.",
              whenToSend: "Before any trip",
              keyContents: ["What to pack (extra Fuelings!)", "Airport and airplane tips", "Hotel room strategies", "Road trip planning", "International travel considerations"],
              messageScript: "Trip coming up? Here's the travel guide! ✈️ The #1 tip: pack MORE Fuelings than you think you need! Page 3 has a great packing checklist. Also, most hotels have a mini fridge – ask for one if yours doesn't!",
            },
            {
              name: "Holiday & Special Occasions Guide",
              icon: "🎄",
              description: "Navigating holidays, parties, and celebrations while staying on plan.",
              whenToSend: "Before major holidays or celebrations",
              keyContents: ["Pre-event strategies", "What to eat at parties", "Handling food pushers", "Alcohol guidelines (if applicable)", "Getting back on track after indulgence"],
              messageScript: "Big event coming up? Here's the Holiday & Special Occasions guide! 🎄 The best strategy is on page 2 – eat a Fueling BEFORE you go so you're not starving. And remember: one meal doesn't define your journey!",
            },
          ],
        },
        {
          title: "When to Send Each Guide",
          timeline: [
            { phase: "Before Day 1", guides: ["Quick Start Guide", "Lean & Green Guide", "Grocery Shopping Guide"] },
            { phase: "Week 1", guides: ["Condiment Guide (when they ask)"] },
            { phase: "Week 2-3", guides: ["Fueling Preparation Guide (for variety)"] },
            { phase: "As Needed", guides: ["Dining Out Guide", "Travel Guide", "Holiday Guide"] },
          ],
        },
        {
          title: "Pro Tips for Sharing Guides",
          tips: ["Don't overwhelm them – send ONE guide at a time", "Highlight the specific pages that answer their question", "Follow up to see if they have questions after reading", "Save guides to your phone for quick sharing", "Create a 'Client Resources' folder in your photos/files"],
        },
      ],
      keyTakeaways: ["Send guides proactively at the right time, not all at once", "Always highlight which pages/sections are most relevant", "Follow up to answer questions after they've read the guide", "Keep all guides easily accessible on your phone"],
    },
  },
  {
    id: "3.3.2",
    title: "Eat This Every Day",
    type: "Visual Guide",
    icon: Utensils,
    duration: "8 min read",
    content: {
      intro: "This simple visual guide shows clients exactly what they should eat every day on the 5&1 Plan. It's the most-shared resource because it makes the program crystal clear. Send this early and often!",
      sections: [
        {
          title: "The Daily Eating Plan",
          dailyPlan: {
            title: "Optimal Weight 5&1 Plan Daily Guide",
            subtitle: "What to Eat Every Single Day",
            meals: [
              { time: "Breakfast (7-8 AM)", type: "Fueling #1", icon: "🌅", options: "Shake, oatmeal, bar, or eggs & cheese", tip: "Start within 1 hour of waking" },
              { time: "Mid-Morning (10-11 AM)", type: "Fueling #2", icon: "☀️", options: "Bar, shake, soup, or crunchy snack", tip: "Keep one in your bag for on-the-go" },
              { time: "Lunch (12-1 PM)", type: "Fueling #3", icon: "🌤️", options: "Shake, soup, mac & cheese, or bar", tip: "Great time for a savory Fueling" },
              { time: "Afternoon (3-4 PM)", type: "Fueling #4", icon: "⛅", options: "Bar, shake, or crunchy option", tip: "Prevents dinner-time overeating" },
              { time: "Dinner (6-7 PM)", type: "Lean & Green", icon: "🌙", options: "5-7 oz protein + 3 veggie servings + healthy fats", tip: "Your one cooked meal – make it count!", isLeanGreen: true },
              { time: "Evening (8-9 PM)", type: "Fueling #5", icon: "🌟", options: "Brownie, shake, bar, or pudding", tip: "Satisfies sweet cravings before bed" },
            ],
            waterReminder: { goal: "64+ oz of water throughout the day", tip: "Try to finish half before noon!" },
          },
        },
        {
          title: "Key Rules to Remember",
          rules: [
            { rule: "Eat every 2-3 hours", why: "Keeps metabolism active and prevents extreme hunger" },
            { rule: "All 5 Fuelings – no skipping", why: "Each Fueling provides essential nutrition" },
            { rule: "1 Lean & Green per day", why: "Your source of lean protein and vegetables" },
            { rule: "64+ oz water", why: "Essential for fat burning and feeling full" },
            { rule: "Don't go longer than 3 hours", why: "Prevents blood sugar crashes and cravings" },
          ],
        },
        {
          title: "Lean & Green Breakdown",
          leanGreen: {
            protein: {
              title: "Lean Protein (5-7 oz cooked)",
              options: ["Chicken breast", "Fish/Seafood", "Lean beef (96% lean)", "Turkey breast", "Pork tenderloin", "Eggs (2 whole + 4 whites)", "Tofu/Tempeh"],
            },
            veggies: {
              title: "Green Vegetables (3 servings)",
              categories: [
                { category: "Lower Carb (pick 3)", examples: "Lettuce, spinach, celery, cucumber, mushrooms" },
                { category: "Moderate Carb (pick 2)", examples: "Broccoli, cauliflower, peppers, tomatoes, green beans" },
                { category: "Higher Carb (pick 1)", examples: "Carrots, peas, winter squash" },
              ],
            },
            fats: {
              title: "Healthy Fats (0-2 servings)",
              options: ["1 tsp oil", "2 tbsp low-fat dressing", "1 tbsp reduced-fat cheese", "5-10 olives", "1.5 tbsp avocado"],
            },
          },
        },
        {
          title: "Sample Day Visual",
          sampleDay: [
            { time: "7 AM", meal: "Honey Mustard & Onion Pretzel Sticks 🥨", type: "Fueling" },
            { time: "10 AM", meal: "Chocolate Mint Soft Baked Cookie 🍪", type: "Fueling" },
            { time: "12 PM", meal: "Chicken Flavored & Vegetable Noodle Soup 🍜", type: "Fueling" },
            { time: "3 PM", meal: "Caramel Delight Crisp Bar 🍫", type: "Fueling" },
            { time: "6 PM", meal: "Grilled salmon + roasted broccoli + side salad 🐟🥗", type: "Lean & Green" },
            { time: "8 PM", meal: "Triple Chocolate Brownie 🍫", type: "Fueling" },
          ],
        },
        {
          title: "Message Script for Sharing",
          messageScript: {
            label: "Send with Daily Guide",
            text: "Here's your daily eating guide! 📋 This shows exactly what to eat and when. The key things to remember:\n\n✅ Eat every 2-3 hours\n✅ All 5 Fuelings + 1 Lean & Green\n✅ 64+ oz water\n\nSave this to your phone – you'll look at it a lot the first week! Any questions? 💚",
          },
        },
      ],
      keyTakeaways: ["This is your most-shared resource – save it for quick access", "Clients love the visual format – it makes the plan simple", "Reference this guide when troubleshooting eating issues", "Send it multiple times if needed – repetition helps!"],
    },
  },
  {
    id: "3.3.3",
    title: "How to Update Your Premier Order",
    type: "Tutorial",
    icon: ShoppingCart,
    duration: "8 min read",
    content: {
      intro: "Premier Orders (previously called 'Subscribe & Save') help clients save money and never run out of Fuelings. Teaching clients to manage their orders builds independence and ensures continuity. Here's the complete tutorial to share.",
      sections: [
        {
          title: "What is a Premier Order?",
          content: "A Premier Order is a recurring monthly shipment of Fuelings that saves clients money and ensures they never run out. Clients can customize what's in their order, when it ships, and can skip or cancel anytime.",
          benefits: [
            { benefit: "Save money", detail: "Lower prices than one-time orders" },
            { benefit: "Never run out", detail: "Automatic monthly delivery" },
            { benefit: "Full flexibility", detail: "Change items, dates, or cancel anytime" },
            { benefit: "Free shipping", detail: "On qualifying orders" },
          ],
        },
        {
          title: "Step-by-Step: Updating a Premier Order",
          steps: [
            { step: 1, title: "Log into OPTAVIA Connect", instruction: "Go to optaviaconnect.com and log in with your email and password.", tip: "If they forgot their password, they can reset it from the login page." },
            { step: 2, title: "Navigate to 'My Orders'", instruction: "Click on the menu icon (☰) and select 'My Orders' or 'Manage Orders'.", tip: "On mobile, the menu is usually in the top corner." },
            { step: 3, title: "Select 'Premier Order'", instruction: "Find their active Premier Order and click 'Edit' or 'Manage'.", tip: "They'll see their next ship date and what's currently in the order." },
            { step: 4, title: "Make Changes", instruction: "From here they can:\n• Add or remove Fuelings\n• Change quantities\n• Swap flavors\n• Update shipping address\n• Change payment method", tip: "Changes must be made 5+ days before the ship date." },
            { step: 5, title: "Adjust Ship Date (if needed)", instruction: "Click 'Change Date' to move the shipment earlier or later.", tip: "Useful if they're traveling or have extra Fuelings." },
            { step: 6, title: "Save Changes", instruction: "Click 'Save' or 'Update Order' to confirm all changes.", tip: "They should receive a confirmation email." },
          ],
        },
        {
          title: "Common Client Questions",
          faqs: [
            { question: "Can I skip a month?", answer: "Yes! Log in, go to your Premier Order, and click 'Skip' or push the date out. You won't be charged until the next shipment." },
            { question: "Can I cancel my Premier Order?", answer: "Yes, you can cancel anytime. Go to your Premier Order and select 'Cancel.' But remember – you can also just skip months if you need a break!" },
            { question: "What if I need more Fuelings before my ship date?", answer: "You can either move your ship date up OR place a one-time order. I'd recommend moving your Premier Order date to save money." },
            { question: "I'm running low – how do I check when my order ships?", answer: "Log into OPTAVIA Connect and look at your Premier Order. The next ship date is displayed at the top." },
            { question: "Can I change what Fuelings are in my order?", answer: "Absolutely! Edit your Premier Order and swap out any Fuelings you want. Try new flavors each month!" },
            { question: "How do I update my payment method?", answer: "In your account settings, you can update your credit card information. Changes apply to your next order." },
          ],
        },
        {
          title: "When to Help vs. Let Them Do It",
          guidance: [
            { situation: "First time managing their order", action: "Walk them through it step-by-step (phone or video call)" },
            { situation: "They're comfortable with technology", action: "Send them this guide and let them try first" },
            { situation: "They're frustrated or confused", action: "Offer to hop on a quick call and screen share" },
            { situation: "Ongoing questions", action: "Point them to OPTAVIA's customer service: 1-888-OPTAVIA" },
          ],
        },
        {
          title: "Reorder Reminder Timeline",
          timeline: [
            { days: "7 days before running out", action: 'First reminder: "How are your Fuelings looking? Running low?"' },
            { days: "5 days before running out", action: 'Second reminder: "Don\'t want you to run out! Need help with your order?"' },
            { days: "3 days before running out", action: 'Urgent: "Let\'s get your order in today so you don\'t have a gap!"' },
          ],
          warning: "Running out of Fuelings is the #1 reason clients go off-plan. Be proactive with reminders!",
        },
        {
          title: "Message Scripts",
          scripts: [
            { label: "Reorder Reminder", text: "Hey! 📦 Quick check – how are your Fuelings looking? You should be getting close to needing a reorder. Let me know if you need help updating your Premier Order or if you want to try any new flavors this month!" },
            { label: "How to Update Tutorial", text: "Here's how to update your Premier Order:\n\n1️⃣ Log into optaviaconnect.com\n2️⃣ Click Menu → My Orders → Premier Order\n3️⃣ Click 'Edit' to make changes\n4️⃣ Add/remove Fuelings, change date, etc.\n5️⃣ Save your changes!\n\nChanges need to be made 5+ days before your ship date. Need help? I can walk you through it!" },
            { label: "Encouraging New Flavors", text: "Time to update your order! 🎉 Any Fuelings you want to swap out? Now's a great time to try something new! Here are some client favorites:\n\n🍪 Chocolate Mint Cookie\n🥨 Honey Mustard Pretzels\n🍫 Caramel Crisp Bar\n\nWant recommendations based on what you like?" },
          ],
        },
      ],
      keyTakeaways: ["Proactive reorder reminders prevent clients from going off-plan", "Teach them to manage their own orders for independence", "Encourage trying new flavors to prevent boredom", "Offer to walk them through it the first time"],
    },
  },
]

export function ClientResourcesContent() {
  const { toast } = useToast()
  const { user } = useAuth()
  const { completedResources, toggleCompletedResource } = useSupabaseData(user)
  const [expandedLesson, setExpandedLesson] = useState(lessons[0].id)
  const [copiedScript, setCopiedScript] = useState<string | null>(null)
  const [expandedGuide, setExpandedGuide] = useState<number | null>(null)

  const getResourceId = (lessonId: string) => `client-resources-${lessonId}`

  const completedLessons = new Set(lessons.map((lesson) => lesson.id).filter((lessonId) => completedResources.includes(getResourceId(lessonId))))

  useEffect(() => {
    const saved = localStorage.getItem("clientResourcesExpanded")
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
    localStorage.setItem("clientResourcesExpanded", JSON.stringify(expandedLesson))
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
      {script.label && <div className="text-xs font-semibold text-[hsl(var(--optavia-green))] mb-2 uppercase">{script.label}</div>}
      <pre className="text-sm text-optavia-dark leading-relaxed whitespace-pre-wrap font-sans mb-3">{script.text}</pre>
      <Button onClick={() => copyToClipboard(script.text, id)} variant={copiedScript === id ? "default" : "outline"} size="sm" className={copiedScript === id ? "bg-[hsl(var(--optavia-green))] hover:bg-[hsl(var(--optavia-green-dark))]" : ""}>
        {copiedScript === id ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
        {copiedScript === id ? "Copied!" : "Copy Script"}
      </Button>
    </div>
  )

  const isGuideTimeline = (timeline: TimelineItem[] | ReorderTimeline[]): timeline is TimelineItem[] => {
    return timeline.length > 0 && "guides" in timeline[0]
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
            <span className="font-semibold">Module 3.3</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Client Resources to Share</h1>
          <p className="text-lg opacity-90 max-w-2xl">Know what resources to send clients and when. Your complete guide library with sharing scripts.</p>
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

            {/* Pro Tip Card */}
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardHeader>
                <div className="flex items-center gap-2 font-semibold text-blue-900">
                  <FileText className="h-5 w-5 text-blue-600" />
                  Pro Tip
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-blue-900 leading-relaxed">Create a "Client Resources" folder on your phone with all these guides saved for quick sharing!</p>
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

                    {section.description && <p className="text-base leading-relaxed text-optavia-gray mb-5">{section.description}</p>}
                    {section.content && <p className="text-base leading-relaxed text-optavia-gray mb-5">{section.content}</p>}

                    {/* Digital Guides */}
                    {section.guides && (
                      <div className="space-y-3">
                        {section.guides.map((guide, i) => (
                          <div key={i} className="rounded-xl border border-gray-200 overflow-hidden">
                            <button onClick={() => setExpandedGuide(expandedGuide === i ? null : i)} className={`w-full p-4 flex items-center gap-3 text-left transition-colors ${expandedGuide === i ? "bg-green-50" : "bg-gray-50 hover:bg-gray-100"}`}>
                              <span className="text-3xl">{guide.icon}</span>
                              <div className="flex-1">
                                <div className="font-bold text-optavia-dark mb-1">{guide.name}</div>
                                <div className="text-sm text-optavia-gray">{guide.description}</div>
                              </div>
                              <ChevronDown className={`h-5 w-5 text-optavia-gray transition-transform ${expandedGuide === i ? "rotate-180" : ""}`} />
                            </button>
                            {expandedGuide === i && (
                              <div className="p-5 bg-white border-t border-gray-100">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                  <div className="p-4 bg-green-50 rounded-lg">
                                    <div className="text-xs font-bold text-green-800 mb-2">📅 WHEN TO SEND</div>
                                    <div className="text-sm text-green-900">{guide.whenToSend}</div>
                                  </div>
                                  <div className="p-4 bg-gray-50 rounded-lg">
                                    <div className="text-xs font-bold text-optavia-gray mb-2">📖 KEY CONTENTS</div>
                                    {guide.keyContents.slice(0, 3).map((item, j) => (
                                      <div key={j} className="text-xs text-optavia-gray mb-1">
                                        • {item}
                                      </div>
                                    ))}
                                    {guide.keyContents.length > 3 && <div className="text-xs text-optavia-gray italic">+ {guide.keyContents.length - 3} more...</div>}
                                  </div>
                                </div>
                                <div className="bg-white rounded-lg p-4 border border-gray-200">
                                  <div className="text-xs font-bold text-[hsl(var(--optavia-green))] mb-2">💬 MESSAGE SCRIPT</div>
                                  <p className="text-sm text-optavia-dark leading-relaxed italic mb-3">"{guide.messageScript}"</p>
                                  <Button onClick={() => copyToClipboard(guide.messageScript, `guide-${i}`)} variant={copiedScript === `guide-${i}` ? "default" : "outline"} size="sm" className={copiedScript === `guide-${i}` ? "bg-[hsl(var(--optavia-green))] hover:bg-[hsl(var(--optavia-green-dark))]" : ""}>
                                    {copiedScript === `guide-${i}` ? <Check className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
                                    {copiedScript === `guide-${i}` ? "Copied!" : "Copy Script"}
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Guide Timeline */}
                    {section.timeline && isGuideTimeline(section.timeline) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {section.timeline.map((item, i) => (
                          <div key={i} className="p-4 bg-gray-50 rounded-lg border-l-4 border-[hsl(var(--optavia-green))]">
                            <div className="font-bold text-[hsl(var(--optavia-green))] mb-2">{item.phase}</div>
                            {item.guides.map((guide, j) => (
                              <div key={j} className="text-sm text-optavia-gray mb-1">
                                • {guide}
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Tips */}
                    {section.tips && (
                      <div className="space-y-2">
                        {section.tips.map((tip, i) => (
                          <div key={i} className={`flex items-center gap-2 p-3 rounded-lg ${i % 2 === 0 ? "bg-gray-50" : "bg-white"}`}>
                            <Lightbulb className="h-4 w-4 text-amber-500" />
                            <span className="text-sm text-optavia-gray">{tip}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Daily Plan */}
                    {section.dailyPlan && (
                      <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border-2 border-[hsl(var(--optavia-green))]">
                        <div className="text-center mb-6">
                          <div className="text-xs font-semibold text-[hsl(var(--optavia-green))] uppercase mb-1">{section.dailyPlan.title}</div>
                          <div className="text-xl font-bold text-optavia-dark">{section.dailyPlan.subtitle}</div>
                        </div>
                        <div className="space-y-2">
                          {section.dailyPlan.meals.map((meal, i) => (
                            <div key={i} className={`flex items-center gap-4 p-4 rounded-xl ${meal.isLeanGreen ? "bg-amber-50 border-2 border-amber-300" : "bg-white border border-gray-200"}`}>
                              <span className="text-3xl">{meal.icon}</span>
                              <div className="flex-1">
                                <div className="flex justify-between items-center mb-1">
                                  <span className="font-bold text-optavia-dark">{meal.type}</span>
                                  <Badge variant="secondary" className="text-xs">
                                    {meal.time}
                                  </Badge>
                                </div>
                                <div className="text-sm text-optavia-gray mb-1">{meal.options}</div>
                                <div className="text-xs text-[hsl(var(--optavia-green))] italic">💡 {meal.tip}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="mt-4 p-4 bg-blue-50 rounded-xl text-center">
                          <div className="text-2xl mb-2">💧</div>
                          <div className="font-bold text-blue-800">{section.dailyPlan.waterReminder.goal}</div>
                          <div className="text-sm text-blue-700">{section.dailyPlan.waterReminder.tip}</div>
                        </div>
                      </div>
                    )}

                    {/* Rules */}
                    {section.rules && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {section.rules.map((item, i) => (
                          <div key={i} className="p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <CheckCircle className="h-4 w-4 text-[hsl(var(--optavia-green))]" />
                              <span className="font-bold text-optavia-dark">{item.rule}</span>
                            </div>
                            <div className="text-sm text-optavia-gray pl-6">{item.why}</div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Lean & Green Breakdown */}
                    {section.leanGreen && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-5 bg-red-50 rounded-xl">
                          <div className="font-bold text-red-800 mb-3 text-sm">🥩 {section.leanGreen.protein.title}</div>
                          {section.leanGreen.protein.options.map((opt, i) => (
                            <div key={i} className="text-sm text-red-900 mb-1">
                              • {opt}
                            </div>
                          ))}
                        </div>
                        <div className="p-5 bg-green-50 rounded-xl">
                          <div className="font-bold text-green-800 mb-3 text-sm">🥬 {section.leanGreen.veggies.title}</div>
                          {section.leanGreen.veggies.categories.map((cat, i) => (
                            <div key={i} className="mb-2">
                              <div className="text-xs font-semibold text-green-900">{cat.category}</div>
                              <div className="text-xs text-green-700">{cat.examples}</div>
                            </div>
                          ))}
                        </div>
                        <div className="p-5 bg-amber-50 rounded-xl">
                          <div className="font-bold text-amber-800 mb-3 text-sm">🥑 {section.leanGreen.fats.title}</div>
                          {section.leanGreen.fats.options.map((opt, i) => (
                            <div key={i} className="text-sm text-amber-900 mb-1">
                              • {opt}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Sample Day */}
                    {section.sampleDay && (
                      <div className="bg-gray-50 rounded-xl p-5">
                        <div className="font-bold text-optavia-dark mb-4">📋 Sample Day</div>
                        <div className="space-y-2">
                          {section.sampleDay.map((item, i) => (
                            <div key={i} className={`flex items-center gap-3 p-3 rounded-lg ${item.type === "Lean & Green" ? "bg-amber-50" : "bg-white"}`}>
                              <span className="text-xs font-semibold text-optavia-gray min-w-[60px]">{item.time}</span>
                              <span className="flex-1 text-sm text-optavia-dark">{item.meal}</span>
                              <Badge variant={item.type === "Lean & Green" ? "default" : "secondary"} className={`text-xs ${item.type === "Lean & Green" ? "bg-amber-500" : "bg-green-100 text-green-800"}`}>
                                {item.type}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Message Script */}
                    {section.messageScript && renderCopyableScript(section.messageScript, `message-${idx}`)}

                    {/* Benefits */}
                    {section.benefits && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5">
                        {section.benefits.map((item, i) => (
                          <div key={i} className="p-4 bg-green-50 rounded-lg">
                            <div className="flex items-center gap-2 mb-1">
                              <Check className="h-4 w-4 text-[hsl(var(--optavia-green))]" />
                              <span className="font-bold text-green-800">{item.benefit}</span>
                            </div>
                            <div className="text-sm text-green-900 pl-6">{item.detail}</div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Steps */}
                    {section.steps && (
                      <div className="space-y-4">
                        {section.steps.map((item, i) => (
                          <div key={i} className="flex gap-4">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[hsl(var(--optavia-green))] to-[hsl(var(--optavia-green-dark))] text-white flex items-center justify-center font-bold text-lg flex-shrink-0">{item.step}</div>
                            <div className="flex-1 p-4 bg-gray-50 rounded-xl">
                              <div className="font-bold text-optavia-dark mb-2">{item.title}</div>
                              <div className="text-sm text-optavia-gray whitespace-pre-line mb-2">{item.instruction}</div>
                              <div className="text-xs text-[hsl(var(--optavia-green))] italic">💡 {item.tip}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* FAQs */}
                    {section.faqs && (
                      <div className="space-y-2">
                        {section.faqs.map((faq, i) => (
                          <div key={i} className={`p-4 rounded-lg ${i % 2 === 0 ? "bg-gray-50" : "bg-white border border-gray-100"}`}>
                            <div className="flex items-start gap-2 mb-2">
                              <HelpCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                              <span className="font-bold text-optavia-dark">"{faq.question}"</span>
                            </div>
                            <div className="text-sm text-optavia-gray pl-7 leading-relaxed">{faq.answer}</div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Guidance */}
                    {section.guidance && (
                      <div className="space-y-2">
                        {section.guidance.map((item, i) => (
                          <div key={i} className={`flex gap-4 p-3 rounded-lg ${i % 2 === 0 ? "bg-gray-50" : "bg-white"}`}>
                            <div className="text-sm font-semibold text-optavia-gray min-w-[200px]">{item.situation}</div>
                            <div className="text-sm font-semibold text-[hsl(var(--optavia-green))]">→ {item.action}</div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Reorder Timeline with Warning */}
                    {section.timeline && section.warning && !isGuideTimeline(section.timeline) && (
                      <div>
                        <div className="space-y-3 mb-4">
                          {(section.timeline as ReorderTimeline[]).map((item, i) => (
                            <div key={i} className="flex gap-4">
                              <Badge variant={i === 2 ? "destructive" : "default"} className={`min-w-[160px] justify-center text-xs ${i === 2 ? "" : "bg-green-100 text-green-800"}`}>
                                {item.days}
                              </Badge>
                              <div className="flex-1 p-3 bg-gray-50 rounded-lg text-sm text-optavia-gray">{item.action}</div>
                            </div>
                          ))}
                        </div>
                        <div className="p-4 bg-amber-50 rounded-lg border-l-4 border-amber-500">
                          <div className="flex items-center gap-2 font-bold text-amber-800 mb-1">
                            <AlertTriangle className="h-5 w-5" />
                            Important
                          </div>
                          <p className="text-sm text-amber-900">{section.warning}</p>
                        </div>
                      </div>
                    )}

                    {/* Scripts */}
                    {section.scripts && (
                      <div className="space-y-3">
                        {section.scripts.map((script, i) => renderCopyableScript(script, `script-${idx}-${i}`))}
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
                  <Button variant="outline" onClick={() => (window.location.href = "/training/first-client")}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Module 3.1
                  </Button>
                )}

                {nextLesson ? (
                  <Button onClick={() => setExpandedLesson(nextLesson.id)} className="bg-[hsl(var(--optavia-green))] hover:bg-[hsl(var(--optavia-green-dark))] text-white">
                    Next: {nextLesson.title.split(" ").slice(0, 3).join(" ")}...
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button className="bg-[hsl(var(--optavia-green))] hover:bg-[hsl(var(--optavia-green-dark))] text-white" onClick={() => (window.location.href = "/training/thirty-day-evaluation")}>
                    Continue to Module 3.4: 30-Day Evaluation
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
