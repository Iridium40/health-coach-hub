"use client"

import { useState, useEffect } from "react"
import { RotateCcw, Printer, Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"

type TabId = "welcome" | "tips" | "followup" | "quick"

interface OnboardingState {
  clientName: string
  startDate: string
  tipChecks: string[]
  taskChecks: number[]
}

export function ClientOnboardingTool() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState<TabId>("welcome")
  const [clientName, setClientName] = useState("")
  const [startDate, setStartDate] = useState("")
  const [checkedTips, setCheckedTips] = useState<Set<string>>(new Set())
  const [checkedTasks, setCheckedTasks] = useState<Set<number>>(new Set())

  // Load state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("clientOnboarding")
    if (saved) {
      try {
        const state: OnboardingState = JSON.parse(saved)
        if (state.clientName) setClientName(state.clientName)
        if (state.startDate) setStartDate(state.startDate)
        if (state.tipChecks) setCheckedTips(new Set(state.tipChecks))
        if (state.taskChecks) setCheckedTasks(new Set(state.taskChecks))
      } catch (e) {
        console.error("Failed to load saved state", e)
      }
    }
  }, [])

  // Save state to localStorage
  const saveState = () => {
    const state: OnboardingState = {
      clientName,
      startDate,
      tipChecks: Array.from(checkedTips),
      taskChecks: Array.from(checkedTasks),
    }
    localStorage.setItem("clientOnboarding", JSON.stringify(state))
  }

  useEffect(() => {
    saveState()
  }, [clientName, startDate, checkedTips, checkedTasks])

  const copyToClipboard = (text: string) => {
    const finalText = text.replace(/Name/g, clientName || "Name")
    navigator.clipboard.writeText(finalText).then(() => {
      toast({
        title: "Copied!",
        description: "Text copied to clipboard",
      })
    })
  }

  const toggleTip = (tipId: string) => {
    const newChecked = new Set(checkedTips)
    if (newChecked.has(tipId)) {
      newChecked.delete(tipId)
    } else {
      newChecked.add(tipId)
    }
    setCheckedTips(newChecked)
  }

  const toggleTask = (taskIndex: number) => {
    const newChecked = new Set(checkedTasks)
    if (newChecked.has(taskIndex)) {
      newChecked.delete(taskIndex)
    } else {
      newChecked.add(taskIndex)
    }
    setCheckedTasks(newChecked)
  }

  const resetAll = () => {
    if (confirm("Reset all data for this client? This will clear all checkboxes and info.")) {
      localStorage.removeItem("clientOnboarding")
      setClientName("")
      setStartDate("")
      setCheckedTips(new Set())
      setCheckedTasks(new Set())
      toast({
        title: "Reset complete",
        description: "All data has been cleared",
      })
    }
  }

  const tipProgress = checkedTips.size
  const tipProgressPercent = Math.round((tipProgress / 9) * 100)

  const welcomeText = `Hello ${clientName || "Name"}!!! I am so honored to be on this journey with you! 👏 Together, we're going to work toward your health goals in a way that's simple, sustainable, and truly life-changing. WE KNOW you can do this and we can't wait to walk alongside you every step of the way!

This is the start of a new chapter for you, one that's not just about weight loss, but about restoring your metabolic health and helping your body work the way it was designed to. 💪 There's some amazing new research showing how this program helps reverse the effects of metabolic dysfunction ... things like energy dips, stubborn weight, and sluggish metabolism and we are so excited for you to start feeling the difference! ✨

To set you up for success, please watch this quick video:
🎥 https://youtu.be/GitLueKKsO0

Here are 9 simple tips to prepare for your journey:

1️⃣ Write down your WHYs and keep them somewhere visible, like your bathroom mirror!

2️⃣ Take before pictures (front, back, and side) in fitted clothing ... you'll be SO glad you did!

3️⃣ On the Monday that you start, weigh yourself first thing in the morning. Use a digital body scale to track your progress, using it from the beginning will give you a whole new perspective to your journey!! 
Here's a great option to grab if you don't have one yet: https://amzn.to/47zW8xq

4️⃣ Take your measurements and keep them somewhere safe.

5️⃣ Aim for at least 64 oz of water daily.

6️⃣ Start practicing your Lean & Green meals. You'll need a digital food scale (it doesn't have to be fancy!) this one works great: https://amzn.to/47fOcmc

7️⃣ Read Dr. A's Stop. Challenge. Choose. eBook (linktr.ee below).

8️⃣ Save this Client Resource Link for quick access to guides, videos, and tools: 👇 https://linktr.ee/clientresourcetools

9️⃣ Download the Optavia App (login: your email / password: Welcome1!) & the EatWise app (for meal reminders).

✨ Let us know when your box arrives because that's when the magic really begins!`

  const tips = [
    {
      id: "1",
      title: "Write Down Your WHYs",
      what: "Keep their reasons for starting somewhere visible — bathroom mirror, phone wallpaper, or journal.",
      why: "When motivation dips (and it will), their \"why\" brings them back. Visual reminders create daily reconnection to their goals. Clients who write their why are 42% more likely to stick with the program.",
      script: "\"Hey! Quick question — have you had a chance to write down your WHYs yet? I'd love to hear what's driving you. Sometimes saying it out loud makes it even more real!\"",
    },
    {
      id: "2",
      title: "Take Before Pictures",
      what: "Front, back, and side photos in fitted clothing. Store somewhere private but accessible.",
      why: "The scale doesn't tell the whole story. Many clients lose inches before pounds. Before photos become their most powerful motivation during plateaus — they can SEE the change even when the scale stalls.",
      script: "\"I know before photos feel awkward, but I promise — you'll thank yourself later! They're just for YOU. Take them, put them away, and we'll look back in 30 days. Every single client who does this is SO glad they did.\"",
    },
    {
      id: "3",
      title: "Get a Digital Body Scale",
      what: "Weigh first thing Monday morning before starting. Use the same scale consistently.",
      why: "Consistent data = accurate tracking. Digital scales with body composition give clients a fuller picture (muscle vs. fat). Weekly weigh-ins (same day, same time) reduce anxiety from daily fluctuations.",
      link: "https://amzn.to/47zW8xq",
      linkText: "Recommended Scale (Amazon)",
      script: "\"Remember — weigh yourself first thing in the morning, after using the bathroom, before eating or drinking. Same conditions every time for the most accurate comparison!\"",
    },
    {
      id: "4",
      title: "Take Measurements",
      what: "Measure chest, waist, hips, thighs, and arms. Record and store safely.",
      why: "Non-scale victories are HUGE for motivation. Clients often lose 2-3 inches before seeing significant scale movement. Measurements prove progress when the scale lies.",
      script: "\"Let's plan to retake measurements every 2-4 weeks. That's when you'll really start to see the inches drop. Some clients lose 10+ inches before hitting their goal weight!\"",
    },
    {
      id: "5",
      title: "Drink 64+ oz Water Daily",
      what: "Minimum 64 oz, ideally half their body weight in ounces. Spread throughout the day.",
      why: "Hydration is critical for fat metabolism. Dehydration mimics hunger and causes fatigue. Proper water intake improves energy, reduces cravings, and accelerates results. It's the #1 free tool for weight loss.",
      script: "\"Take your weight, divide by 2 — that's your goal in ounces. So if you weigh 180 lbs, aim for 90 oz. Get a big water bottle and track your refills!\"",
    },
    {
      id: "6",
      title: "Practice Lean & Green + Get Food Scale",
      what: "Start practicing Lean & Green meals before Day 1. A food scale ensures proper portions.",
      why: "Portion distortion is real — most people underestimate portions by 30-50%. A food scale removes guesswork. Practicing L&G before starting reduces overwhelm on Day 1.",
      link: "https://amzn.to/47fOcmc",
      linkText: "Recommended Food Scale (Amazon)",
      script: "\"This week, try making 2-3 Lean & Green meals just to get the hang of it. Keep it simple — grilled chicken + a big salad is a perfect L&G. Once your box arrives, you'll feel confident!\"",
    },
    {
      id: "7",
      title: "Read Stop. Challenge. Choose.",
      what: "Dr. A's eBook on mindset and decision-making. Available in the resource link.",
      why: "This program is about more than food — it's about habits and mindset. Stop. Challenge. Choose. teaches the mental framework for making healthy decisions automatically. It's the foundation of lasting change.",
      script: "\"Have you had a chance to check out Dr. A's Stop. Challenge. Choose. book? It's short but powerful — it'll change how you think about cravings and choices. Total game-changer!\"",
    },
    {
      id: "8",
      title: "Save Client Resource Link",
      what: "Bookmark the Linktree with guides, videos, recipes, and tools.",
      why: "Self-service resources reduce overwhelm and dependency. When clients can find answers themselves, they feel empowered. This also reduces repetitive questions for coaches.",
      link: "https://linktr.ee/clientresourcetools",
      linkText: "Client Resource Tools",
      script: "\"I'm always here for you, AND you have 24/7 access to guides, recipes, and videos in that resource link. Bookmark it on your phone — it's like having a coach in your pocket!\"",
    },
    {
      id: "9",
      title: "Download OPTAVIA + EatWise Apps",
      what: "OPTAVIA App (login: email / password: Welcome1!) and EatWise for meal reminders.",
      why: "The OPTAVIA app has recipes, tracking, and community. EatWise sends fueling reminders so they never forget to eat. Consistent eating = stable blood sugar = no cravings = better results.",
      script: "\"Did you get the apps downloaded? The OPTAVIA one uses your email as the login and 'Welcome1!' as the password. And EatWise will remind you when it's time to eat — super helpful in the first few weeks!\"",
    },
  ]

  const timelineItems = [
    {
      day: "Day 0",
      badge: "Day 0",
      title: "Enrollment Day",
      tasks: [
        { title: "Send Welcome & 9 Tips message", desc: "Use the template from the Welcome Message tab" },
        { title: "Confirm shipping address", desc: "Make sure their box is going to the right place" },
        { title: "Add to your tracking system", desc: "Log their start date, contact info, and goals" },
      ],
    },
    {
      day: "Day 1-2",
      badge: "Day 1-2",
      title: "Waiting for Box",
      tasks: [
        { title: "Check in: \"How's your prep going?\"", desc: "Ask about their WHYs, photos, measurements" },
        { title: "Share a simple L&G recipe", desc: "Help them practice before Day 1" },
      ],
    },
    {
      day: "Box Arrives",
      badge: "📦",
      title: "Box Arrives!",
      tasks: [
        { title: "Celebrate! \"It's here!!! 🎉\"", desc: "Match their excitement" },
        { title: "Confirm their start day", desc: "Usually the following Monday" },
        { title: "Walk through the box contents", desc: "Quick call or voice memo explaining what's inside" },
      ],
    },
    {
      day: "Day 1",
      badge: "🚀 Day 1",
      title: "First Day on Plan",
      tasks: [
        { title: "Morning text: \"It's GO time! 💪\"", desc: "Pump them up first thing" },
        { title: "Confirm they weighed in", desc: "Starting weight recorded" },
        { title: "Evening check-in: \"How'd Day 1 go?\"", desc: "Listen for any confusion or struggles" },
      ],
    },
    {
      day: "Days 2-3",
      badge: "Days 2-3",
      title: "Building Rhythm",
      tasks: [
        { title: "Daily check-in texts", desc: "\"How are you feeling? Getting your water in?\"" },
        { title: "Troubleshoot any issues", desc: "Hunger, timing, fueling preferences" },
      ],
    },
    {
      day: "Days 4-5",
      badge: "Days 4-5",
      title: "Potential Transition Symptoms",
      tasks: [
        { title: "Proactive check-in about symptoms", desc: "\"Some people feel tired or headachy around now — that's normal! How are you?\"" },
        { title: "Remind about water and electrolytes", desc: "Hydration helps with transition symptoms" },
      ],
    },
    {
      day: "Day 7",
      badge: "Day 7",
      title: "First Weigh-In! 🎉",
      tasks: [
        { title: "Celebrate their first week!", desc: "\"YOU DID IT! One full week in the books!\"" },
        { title: "Record weigh-in results", desc: "Track their progress" },
        { title: "Schedule weekly check-in call", desc: "Set a recurring time for ongoing support" },
      ],
    },
  ]

  const quickCopyMessages = {
    "Daily Check-Ins": [
      { title: "Morning Check-In", text: "Good morning! 🌞 How are you feeling today? Remember to get that water in early!" },
      { title: "Midday Check-In", text: "Hey! Just checking in — how's your day going? Getting all your fuelings in? 💚" },
      { title: "Evening Check-In", text: "How did today go? What was your win for the day? 🌟" },
      { title: "Monday Motivation", text: "Happy Monday! 🚀 New week, fresh start. What's one thing you're focusing on this week?" },
    ],
    "Celebrations": [
      { title: "Scale Victory", text: "OMG YES!!! 🎉🎉🎉 I am SO proud of you! That is AMAZING! Keep going — you're doing incredible!" },
      { title: "Non-Scale Victory", text: "That's a HUGE non-scale victory! 🙌 Those are the wins that really matter. Your body is changing!" },
      { title: "First Week Complete", text: "ONE WEEK DOWN! 🔥 You should be SO proud of yourself. The hardest part is starting — and you've already done that!" },
      { title: "Consistency Win", text: "Look at you staying consistent! 💪 That's what builds lasting results. You're doing this!" },
    ],
    "Encouragement": [
      { title: "Plateau Support", text: "Plateaus are NORMAL and they're temporary. Your body is adjusting. Trust the process — the scale will catch up! 💚" },
      { title: "After a Slip", text: "One off day doesn't undo your progress. Just start fresh at your next fueling. You've got this! 🙌" },
      { title: "Struggling Client", text: "I know it feels hard right now, but remember your WHY. You started for a reason. I believe in you! 💚" },
      { title: "Transition Symptoms", text: "Those transition symptoms are actually a GOOD sign — your body is switching to fat-burning mode. Hang in there! 💪" },
    ],
    "Reminders": [
      { title: "Water Reminder", text: "Water check! 💧 How many ounces are you at so far today? Remember, hydration = results!" },
      { title: "Photo Reminder", text: "Just a reminder to take your weekly progress photo! 📸 Same outfit, same spot, same pose. Future you will thank you!" },
      { title: "Reorder Reminder", text: "Time to reorder! 📦 Let me know if you need help placing your order so there's no gap in your journey." },
      { title: "App Tracking Reminder", text: "Don't forget to log your fuelings in the app today! 📱 Tracking = accountability = results!" },
    ],
  }

  let taskIndex = 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200">
      {/* Tool Header */}
      <div className="sticky top-[73px] z-40 bg-gradient-to-r from-[hsl(var(--optavia-green))] to-[#00c760] text-white shadow-lg shadow-green-500/30">
        <div className="max-w-4xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <h1 className="text-xl font-bold flex items-center gap-2">
              🎉 <span className="hidden sm:inline">New Client</span> Onboarding Tool
            </h1>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={resetAll}
                className="bg-white/10 border-white/50 text-white hover:bg-white/20"
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                Reset
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.print()}
                className="bg-white text-[hsl(var(--optavia-green))] hover:bg-gray-50 border-white"
              >
                <Printer className="h-4 w-4 mr-1" />
                Print
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-4xl mx-auto px-6 pt-4 bg-white border-b border-slate-200">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabId)}>
          <TabsList className="flex flex-wrap gap-1 h-auto p-1 bg-muted">
            <TabsTrigger value="welcome" className="text-xs sm:text-sm px-3 py-2">Welcome Message</TabsTrigger>
            <TabsTrigger value="tips" className="text-xs sm:text-sm px-3 py-2">Tips Explained</TabsTrigger>
            <TabsTrigger value="followup" className="text-xs sm:text-sm px-3 py-2">First Week Follow-Up</TabsTrigger>
            <TabsTrigger value="quick" className="text-xs sm:text-sm px-3 py-2">Quick Copy</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-6">
        {/* Client Info Card */}
        <Card className="mb-6 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-[hsl(var(--optavia-green))]">
          <CardHeader>
            <CardTitle className="text-xs uppercase tracking-wider text-[hsl(var(--optavia-green))] font-semibold">
              👤 Client Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="clientName" className="text-xs font-semibold text-green-800">
                  Client First Name
                </Label>
                <Input
                  id="clientName"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Enter name..."
                  className="border-green-200 focus:border-[hsl(var(--optavia-green))] focus:ring-[hsl(var(--optavia-green))]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="startDate" className="text-xs font-semibold text-green-800">
                  Start Date
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="border-green-200 focus:border-[hsl(var(--optavia-green))] focus:ring-[hsl(var(--optavia-green))]"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabId)}>
          {/* Welcome Message Tab */}
          <TabsContent value="welcome" className="space-y-6">
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 font-bold text-blue-800 mb-2">
                  💡 Why This Message Works
                </div>
                <p className="text-sm text-blue-700">
                  This welcome message sets the tone for the entire client relationship. It's warm, sets expectations, provides immediate action items, and gives them resources to succeed. Send this as soon as they enroll!
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">📱 Welcome & 9 Tips Text</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative bg-slate-50 border border-slate-200 rounded-xl p-5">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                    📋 Copy & Send via Text/DM
                  </div>
                  <Button
                    size="sm"
                    onClick={() => copyToClipboard(welcomeText)}
                    className="absolute top-3 right-3 bg-[hsl(var(--optavia-green))] hover:bg-green-700"
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    Copy
                  </Button>
                  <div className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700 pr-20">
                    {welcomeText}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 9 Tips Explained Tab */}
          <TabsContent value="tips" className="space-y-6">
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 font-bold text-blue-800 mb-2">
                  🎓 Why Each Tip Matters
                </div>
                <p className="text-sm text-blue-700">
                  Understanding the "why" behind each tip helps you explain it to clients and troubleshoot when they skip steps. These aren't random suggestions — each one is proven to increase client success rates.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-bold text-slate-500">Client Prep Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <Progress value={tipProgressPercent} className="h-3 mb-2" />
                <div className="flex justify-between text-sm text-slate-500">
                  <span>{tipProgress} of 9 completed</span>
                  <span className="font-bold text-[hsl(var(--optavia-green))]">{tipProgressPercent}%</span>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              {tips.map((tip) => (
                <Card key={tip.id} className="overflow-hidden">
                  <div className="bg-slate-50 border-b border-slate-200 p-4 flex items-center gap-3">
                    <div className="w-9 h-9 bg-gradient-to-br from-[hsl(var(--optavia-green))] to-[#00c760] text-white rounded-lg flex items-center justify-center font-extrabold text-base flex-shrink-0">
                      {tip.id}
                    </div>
                    <div className="font-bold text-slate-800 flex-1">{tip.title}</div>
                    <div
                      className={`w-6 h-6 border-2 rounded-md cursor-pointer flex items-center justify-center transition-all ${
                        checkedTips.has(tip.id)
                          ? "bg-[hsl(var(--optavia-green))] border-[hsl(var(--optavia-green))]"
                          : "border-slate-300 hover:border-[hsl(var(--optavia-green))] hover:bg-green-50"
                      }`}
                      onClick={() => toggleTip(tip.id)}
                    >
                      {checkedTips.has(tip.id) && <Check className="h-4 w-4 text-white" />}
                    </div>
                  </div>
                  <CardContent className="p-4 space-y-3">
                    <p className="text-sm text-slate-700">{tip.what}</p>
                    <div className="bg-purple-50 border-l-4 border-purple-500 p-3 rounded-r-lg">
                      <div className="text-xs font-bold text-purple-700 uppercase tracking-wide mb-1">
                        🧠 Why This Works
                      </div>
                      <p className="text-sm text-purple-800">{tip.why}</p>
                    </div>
                    {tip.link && (
                      <div>
                        <a
                          href={tip.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm text-[hsl(var(--optavia-green))] font-semibold hover:underline"
                        >
                          🔗 {tip.linkText}
                        </a>
                      </div>
                    )}
                    <div className="bg-green-50 border-l-4 border-[hsl(var(--optavia-green))] p-3 rounded-r-lg">
                      <div className="text-xs font-bold text-[hsl(var(--optavia-green))] uppercase tracking-wide mb-1">
                        💬 {tip.id === "3" ? "Coaching Note" : tip.id === "4" ? "When to Remeasure" : tip.id === "5" ? "Quick Math" : tip.id === "6" ? "Getting Started" : tip.id === "7" ? "Introducing It" : tip.id === "8" ? "How to Use It" : tip.id === "9" ? "App Setup Help" : "If They Haven't Done It"}
                      </div>
                      <p className="text-sm text-green-800 italic">{tip.script}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* First Week Follow-Up Tab */}
          <TabsContent value="followup" className="space-y-6">
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 font-bold text-blue-800 mb-2">
                  📅 The First Week is Critical
                </div>
                <p className="text-sm text-blue-700">
                  The first 7 days set the tone for the entire journey. Consistent check-ins during this window dramatically increase retention and results. Use this timeline to stay on track with each new client.
                </p>
              </CardContent>
            </Card>

            <div className="relative pl-8">
              <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-slate-200" />
              {timelineItems.map((item, idx) => (
                <div key={idx} className="relative mb-6 bg-white border border-slate-200 rounded-xl overflow-hidden">
                  <div className="absolute -left-7 top-5 w-3 h-3 bg-white border-3 border-[hsl(var(--optavia-green))] rounded-full" />
                  <div className="bg-slate-50 border-b border-slate-200 p-4 flex items-center justify-between">
                    <div className="font-bold text-slate-800 flex items-center gap-2">
                      <span className="bg-gradient-to-r from-[hsl(var(--optavia-green))] to-[#00c760] text-white px-3 py-1 rounded-full text-xs font-bold">
                        {item.badge}
                      </span>
                      {item.title}
                    </div>
                  </div>
                  <div className="p-4 space-y-3">
                    {item.tasks.map((task, taskIdx) => {
                      const currentTaskIndex = taskIndex++
                      return (
                        <div key={taskIdx} className="flex items-start gap-3 pb-3 border-b border-slate-100 last:border-0">
                          <div
                            className={`w-5 h-5 border-2 rounded cursor-pointer flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
                              checkedTasks.has(currentTaskIndex)
                                ? "bg-[hsl(var(--optavia-green))] border-[hsl(var(--optavia-green))]"
                                : "border-slate-300 hover:border-[hsl(var(--optavia-green))]"
                            }`}
                            onClick={() => toggleTask(currentTaskIndex)}
                          >
                            {checkedTasks.has(currentTaskIndex) && <Check className="h-3 w-3 text-white" />}
                          </div>
                          <div className="flex-1">
                            <div className="font-semibold text-slate-800 text-sm">{task.title}</div>
                            <div className="text-xs text-slate-500 mt-0.5">{task.desc}</div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Quick Copy Tab */}
          <TabsContent value="quick" className="space-y-6">
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 font-bold text-blue-800 mb-2">
                  ⚡ Quick Copy Messages
                </div>
                <p className="text-sm text-blue-700">
                  One-click copy for common messages. Click any card to copy the text, then paste into your text/DM conversation.
                </p>
              </CardContent>
            </Card>

            {Object.entries(quickCopyMessages).map(([category, messages]) => (
              <Card key={category}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {category === "Daily Check-Ins" && "📱"}
                    {category === "Celebrations" && "🎉"}
                    {category === "Encouragement" && "💪"}
                    {category === "Reminders" && "📋"}
                    {category}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {messages.map((msg, idx) => (
                      <button
                        key={idx}
                        onClick={() => copyToClipboard(msg.text)}
                        className="text-left p-4 bg-slate-50 border border-slate-200 rounded-lg hover:border-[hsl(var(--optavia-green))] hover:bg-green-50 transition-all"
                      >
                        <div className="font-semibold text-slate-800 text-sm mb-1">{msg.title}</div>
                        <div className="text-xs text-slate-500 truncate">{msg.text}</div>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="text-center py-10 px-6 text-slate-500 text-sm">
        <p>New Client Onboarding Tool • Coach Tools</p>
        <p className="mt-1 text-xs">The first week sets the tone for the entire journey! 🚀</p>
      </footer>
    </div>
  )
}
