"use client"

import { useState, useRef, useMemo, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import {
  Copy,
  Check,
  ChevronLeft,
  Search,
  ClipboardList,
  Phone,
  Handshake,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

interface Step {
  type: "script" | "tip" | "followup" | "exit"
  title: string
  content: string
}

interface Objection {
  id: string
  label: string
  tone: "empathetic" | "curious" | "direct"
  toneLabel: string
  whyWorks: string
  steps: Step[]
}

interface ContextDef {
  id: string
  label: string
  icon: LucideIcon
  color: string
}

const CONTEXTS: ContextDef[] = [
  { id: "ha_invite", label: "Health Assessment Invite", icon: ClipboardList, color: "text-blue-500 bg-blue-50 border-blue-200" },
  { id: "follow_up", label: "Follow-Up Call", icon: Phone, color: "text-amber-500 bg-amber-50 border-amber-200" },
  { id: "closing", label: "Closing Conversation", icon: Handshake, color: "text-[hsl(var(--optavia-green))] bg-[hsl(var(--optavia-green-light))] border-[hsl(var(--optavia-green))]" },
]

const OBJECTIONS: Record<string, Objection[]> = {
  ha_invite: [
    {
      id: "cant_afford",
      label: "\"I can't afford it\"",
      tone: "empathetic",
      toneLabel: "Empathetic & Curious",
      whyWorks: "Most people who say they can't afford it are really saying they're not sure it's worth the investment yet. By asking about what they're currently spending, you help them see the hidden costs they're already paying — and reframe the program as a redirect, not an added expense.",
      steps: [
        { type: "script", title: "Acknowledge & Validate", content: "I totally understand — that's something a lot of people think about. Can I ask you a quick question though?" },
        { type: "script", title: "Reframe the Cost", content: "What are you currently spending each month on eating out, snacks, coffee runs, and groceries? Most people are surprised to find they're already spending $400-600 a month on food that's actually working against their health goals." },
        { type: "tip", title: "Why This Works", content: "You're not arguing — you're redirecting. The goal is to help them realize OPTAVIA isn't an added cost; it's a reallocation of what they're already spending, but now it's working FOR them." },
        { type: "script", title: "Bridge to Value", content: "What if I could show you how this program could actually save you money compared to what you're spending now — and you'd be getting healthier at the same time? Would that be worth a 30-minute conversation?" },
        { type: "followup", title: "If They're Still Hesitant", content: "No pressure at all. The Health Assessment is completely free and takes about 30 minutes. The worst that happens is you walk away with some great health insights. Can we find a time this week?" },
      ],
    },
    {
      id: "need_to_think",
      label: "\"I need to think about it\"",
      tone: "curious",
      toneLabel: "Curious & Direct",
      whyWorks: "\"I need to think about it\" is almost never about thinking — it's about an unspoken concern. By gently uncovering the real objection, you can address it directly instead of letting the conversation die in follow-up limbo.",
      steps: [
        { type: "script", title: "Respect & Redirect", content: "Absolutely — I'd never want you to rush into anything. Can I ask, when you say you need to think about it, is there something specific that's giving you pause?" },
        { type: "tip", title: "Why This Works", content: "This question surfaces the REAL objection. Usually it's cost, time, spousal buy-in, or past diet failure. Once you know the real concern, you can actually help them." },
        { type: "script", title: "If They Can't Pinpoint It", content: "Totally fair. Usually when people tell me that, it's one of three things — they're wondering about the cost, whether they'll have time, or if this will actually be different from other things they've tried. Does any of that resonate?" },
        { type: "script", title: "Set a Follow-Up Commitment", content: "How about this — take a couple of days, and I'll check in with you on [specific day]. That way you've had time to think, and I can answer any questions that come up. Sound good?" },
        { type: "exit", title: "Know When to Pause", content: "If they still resist, respect it. Say: \"I get it — when the timing is right, I'm here. I'll just check in every now and then because I genuinely think this could help you.\" Then set a 2-week follow-up reminder." },
      ],
    },
    {
      id: "tried_diets",
      label: "\"Diets never work for me\"",
      tone: "empathetic",
      toneLabel: "Empathetic & Educational",
      whyWorks: "People who've failed at diets before are actually your BEST prospects — they're already motivated, they just haven't found the right system. Your job is to differentiate OPTAVIA from everything else they've tried.",
      steps: [
        { type: "script", title: "Validate Their Experience", content: "Honestly? I felt the exact same way. And you're right — most diets DON'T work long-term. That's actually why I got excited about this program, because it's not really a diet." },
        { type: "tip", title: "Why This Works", content: "Agreement disarms resistance. When you say \"you're right, diets don't work,\" you're on their team instead of arguing. Now you can introduce OPTAVIA as something fundamentally different." },
        { type: "script", title: "Differentiate OPTAVIA", content: "What makes this different is that it's built around creating healthy habits — not willpower or calorie counting. You get a personal coach (that's me), a simple structured plan, and a community of people doing it alongside you. It's designed so you don't have to figure it out alone." },
        { type: "script", title: "Social Proof", content: "I've worked with people who had tried everything — keto, Weight Watchers, counting macros — and this was the first thing that actually stuck. Would you be open to just hearing how it works? No commitment." },
      ],
    },
    {
      id: "no_time",
      label: "\"I don't have time\"",
      tone: "direct",
      toneLabel: "Direct & Practical",
      whyWorks: "Time objections are usually about perceived complexity. When you demonstrate how simple the program actually is — and how much time poor health costs them — the objection dissolves.",
      steps: [
        { type: "script", title: "Acknowledge & Flip", content: "I hear you — and honestly, that's one of the reasons this program works so well for busy people. The Fuelings take about 2 minutes to prepare, and your one Lean & Green meal is the only real cooking you do." },
        { type: "script", title: "Paint the Picture", content: "Think about it this way — most people spend more time deciding what to eat than actually preparing food on this plan. The decision fatigue alone that it removes is a game-changer for busy schedules." },
        { type: "tip", title: "Why This Works", content: "You're solving the problem they didn't know they had. It's not about ADDING time — it's about REMOVING complexity from their day. That reframe is powerful." },
        { type: "script", title: "Close with Ease", content: "The Health Assessment itself is just 30 minutes, and we can do it over Zoom whenever works for you — even on a lunch break. What does your schedule look like this week?" },
      ],
    },
  ],
  follow_up: [
    {
      id: "ghosting",
      label: "They're not responding",
      tone: "curious",
      toneLabel: "Warm & Low-Pressure",
      whyWorks: "People ghost because they feel pressured or guilty. A pattern-interrupt message that's genuinely different from typical follow-ups can re-open the door without triggering their defenses.",
      steps: [
        { type: "script", title: "Pattern Interrupt Text", content: "Hey [Name]! No need to respond to this — I just saw [something relevant: a recipe, article, success story] and thought of you. Hope you're having a great week!" },
        { type: "tip", title: "Why This Works", content: "Saying \"no need to respond\" removes all pressure. Ironically, this makes them MORE likely to respond. You're showing you care about them as a person, not just as a prospect." },
        { type: "script", title: "The 3-Touch Rule (Touch 2)", content: "Wait 5-7 days. Then: \"Hey [Name]! Quick question — are you still thinking about making some health changes, or has the timing just not been right? Either way is totally fine, I just don't want to keep bugging you if now's not the time!\"" },
        { type: "script", title: "The 3-Touch Rule (Touch 3)", content: "Wait another 7-10 days: \"[Name], I'm going to take your silence as a 'not right now' and I totally respect that! Just know my door is always open. I'll check in again in a month or so — rooting for you either way!\"" },
        { type: "exit", title: "Move to Long-Term Nurture", content: "After 3 touches with no response, move them to a 30-60 day check-in cycle. Mark as NOT_CLOSED in your pipeline with a reactivation date. Don't take it personally — timing is everything." },
      ],
    },
    {
      id: "spouse_issue",
      label: "\"My spouse isn't on board\"",
      tone: "empathetic",
      toneLabel: "Empathetic & Strategic",
      whyWorks: "When a spouse isn't on board, the prospect feels caught between you and their partner. Never position yourself against the spouse — instead, make the spouse an ally by addressing their likely concerns.",
      steps: [
        { type: "script", title: "Validate the Partnership", content: "I love that you make decisions together — that tells me a lot about your relationship. Can I ask, what specifically is their concern? Is it the cost, the approach, or something else?" },
        { type: "tip", title: "Why This Works", content: "Complimenting their partnership builds trust and takes you OUT of an adversarial position. Then identifying the spouse's specific concern lets you equip your prospect with the right information to share." },
        { type: "script", title: "Offer a Three-Way Conversation", content: "What if we all hopped on a quick call together? That way [spouse's name] can ask questions directly and you don't have to play messenger. I do this all the time — it usually puts both people at ease." },
        { type: "script", title: "If They Decline the Call", content: "Totally understand. How about this — let me send you a quick video/info sheet that addresses [specific concern]. You can share it with [spouse] and then we can chat after they've seen it?" },
      ],
    },
    {
      id: "lost_momentum",
      label: "\"I've lost motivation\"",
      tone: "direct",
      toneLabel: "Direct & Encouraging",
      whyWorks: "When a prospect was once interested but has cooled off, reconnecting them with their original WHY is more powerful than re-selling the program. People don't lose motivation — they lose connection to their reason.",
      steps: [
        { type: "script", title: "Reconnect to Their Why", content: "I remember when we first talked, you mentioned [their original reason — energy, confidence, health scare, etc.]. Has that changed, or does that still matter to you?" },
        { type: "tip", title: "Why This Works", content: "By referencing their specific motivation, you're not selling — you're reminding. This personalizes the conversation and shows you actually listened the first time." },
        { type: "script", title: "Remove the Overwhelm", content: "Here's the thing — you don't have to be 100% ready. You just have to be willing to take one step. And that first step is just the Health Assessment. Can we start there?" },
        { type: "followup", title: "Share a Story", content: "Share a success story of someone who was hesitant too: \"I had a client who almost didn't start three times. She's now [result]. She told me she's so glad she just said yes.\"" },
      ],
    },
  ],
  closing: [
    {
      id: "compare_programs",
      label: "\"How is this different from X?\"",
      tone: "direct",
      toneLabel: "Confident & Educational",
      whyWorks: "Comparison questions mean they're seriously considering it — they just need clarity. Never trash other programs; instead, highlight what makes OPTAVIA unique in a way that addresses what other programs lack.",
      steps: [
        { type: "script", title: "Acknowledge Other Programs", content: "Great question — and honestly, there are a lot of good programs out there. The biggest difference with OPTAVIA is that you're never doing it alone. You get me as your personal coach, plus a proven system built around creating lifelong habits, not just short-term results." },
        { type: "tip", title: "Why This Works", content: "Acknowledging competitors shows confidence. Then pivoting to coaching, community, and habit creation highlights OPTAVIA's real differentiators that no app or meal kit can replicate." },
        { type: "script", title: "The Three Pillars", content: "I think about it in three parts: 1) A clinically proven plan that's simple to follow, 2) a personal coach who's walked this path and checks in with you regularly, and 3) a community of people on the same journey. Most programs give you one of those — this gives you all three." },
        { type: "script", title: "Close with Confidence", content: "At the end of the day, the best program is the one you'll actually stick with. And the coaching and community piece is what makes people stick with this. Want to give it a shot?" },
      ],
    },
    {
      id: "too_expensive",
      label: "\"It's too expensive\"",
      tone: "empathetic",
      toneLabel: "Empathetic & Analytical",
      whyWorks: "At the closing stage, cost objections need a more concrete breakdown than during the invite phase. Show them the actual math — what they're spending now vs. what the program costs — to make the investment tangible.",
      steps: [
        { type: "script", title: "Break Down the Numbers", content: "Let me walk you through the real math. The Optimal Weight 5&1 Plan comes out to about $17-20 per day for 5 of your 6 meals. That's roughly $3.50 per meal. Compare that to a typical lunch out at $12-15, and you're actually saving money on most of your meals." },
        { type: "script", title: "The Cost of NOT Starting", content: "Can I share something that shifted my perspective? Think about the cost of NOT making a change — the energy you're missing, the doctor visits, the medications down the road, the clothes that don't fit. What's that costing you right now, even if it's not in dollars?" },
        { type: "tip", title: "Why This Works", content: "Emotional cost is often more motivating than financial logic. By connecting health to quality of life, you move the conversation from budget to priorities." },
        { type: "script", title: "Offer a Starting Point", content: "If budget is the main concern, we can look at the Essential plan as a starting point. It's more affordable and still gives you the coaching, community, and structure. Would you like me to walk you through that option?" },
      ],
    },
    {
      id: "not_sure_works",
      label: "\"I'm not sure it'll work for me\"",
      tone: "empathetic",
      toneLabel: "Empathetic & Confident",
      whyWorks: "Self-doubt is the deepest objection. They're not questioning the program — they're questioning themselves. Your job is to transfer YOUR belief to THEM through stories and confidence.",
      steps: [
        { type: "script", title: "Normalize the Fear", content: "You know what? Almost every single person I've coached said that exact thing before they started. And I get it — if you've tried things before and they didn't work, why would this be different?" },
        { type: "script", title: "Transfer Belief", content: "Here's what I'll tell you — I don't need you to believe it'll work yet. That's MY job. I believe in this enough for both of us right now. Your only job is to follow the plan, and I'll be with you every step of the way." },
        { type: "tip", title: "Why This Works", content: "\"I believe enough for both of us\" is one of the most powerful things a coach can say. It removes the burden of certainty from the prospect and places it on your experience and conviction." },
        { type: "script", title: "Seal with a Story", content: "I worked with someone who was in a very similar situation to you — [brief relevant detail]. Within the first two weeks, they started feeling a difference. By month two, people were asking them what they were doing. That's going to be you." },
      ],
    },
  ],
}

const TONE_STYLES: Record<Objection["tone"], { badge: string; label: string }> = {
  empathetic: { badge: "bg-amber-100 text-amber-800 border-amber-200", label: "Empathetic" },
  curious: { badge: "bg-blue-100 text-blue-800 border-blue-200", label: "Curious" },
  direct: { badge: "bg-emerald-100 text-emerald-800 border-emerald-200", label: "Direct" },
}

const STEP_STYLES: Record<Step["type"], { border: string; bg: string; labelColor: string; label: string }> = {
  script: { border: "border-l-[hsl(var(--optavia-green))]", bg: "bg-white", labelColor: "text-[hsl(var(--optavia-green))]", label: "SAY THIS" },
  tip: { border: "border-l-amber-400", bg: "bg-amber-50", labelColor: "text-amber-600", label: "INSIGHT" },
  followup: { border: "border-l-blue-400", bg: "bg-blue-50", labelColor: "text-blue-600", label: "FOLLOW-UP" },
  exit: { border: "border-l-red-400", bg: "bg-red-50", labelColor: "text-red-600", label: "EXIT STRATEGY" },
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      toast({ title: "Copied!", description: "Script copied to clipboard" })
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast({ title: "Error", description: "Failed to copy", variant: "destructive" })
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleCopy}
      className={`h-7 px-2 text-xs font-semibold gap-1 ${
        copied
          ? "text-[hsl(var(--optavia-green))] bg-[hsl(var(--optavia-green-light))]"
          : "text-optavia-gray hover:text-[hsl(var(--optavia-green))] hover:bg-[hsl(var(--optavia-green-light))]"
      }`}
    >
      {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
      {copied ? "Copied" : "Copy"}
    </Button>
  )
}

function StepCard({ step, index, total }: { step: Step; index: number; total: number }) {
  const style = STEP_STYLES[step.type]

  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center pt-1">
        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
          step.type === "script"
            ? "bg-[hsl(var(--optavia-green-light))] text-[hsl(var(--optavia-green))]"
            : step.type === "tip"
            ? "bg-amber-100 text-amber-600"
            : step.type === "followup"
            ? "bg-blue-100 text-blue-600"
            : "bg-red-100 text-red-600"
        }`}>
          {index + 1}
        </div>
        {index < total - 1 && (
          <div className="w-0.5 flex-1 bg-gray-200 my-1" />
        )}
      </div>

      <div className={`flex-1 rounded-lg border-l-4 ${style.border} ${style.bg} p-4 mb-3 shadow-sm`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-bold tracking-wider uppercase ${style.labelColor}`}>
              {style.label}
            </span>
          </div>
          {step.type === "script" && <CopyButton text={step.content} />}
        </div>
        <h4 className="font-semibold text-sm text-optavia-dark mb-1">{step.title}</h4>
        <p className={`text-sm leading-relaxed ${
          step.type === "script" ? "text-optavia-dark" : "text-optavia-gray"
        }`}>
          {step.content}
        </p>
      </div>
    </div>
  )
}

export function ObjectionNavigator() {
  const { toast } = useToast()
  const [selectedContext, setSelectedContext] = useState<string | null>(null)
  const [selectedObjection, setSelectedObjection] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const detailRef = useRef<HTMLDivElement>(null)

  const allObjections = useMemo(
    () =>
      Object.entries(OBJECTIONS).flatMap(([ctx, objs]) =>
        objs.map((o) => ({ ...o, context: ctx }))
      ),
    []
  )

  const filteredObjections = useMemo(() => {
    if (!searchQuery.trim()) return []
    const q = searchQuery.toLowerCase()
    return allObjections.filter(
      (o) =>
        o.label.toLowerCase().includes(q) ||
        o.steps.some((s) => s.content.toLowerCase().includes(q))
    )
  }, [searchQuery, allObjections])

  const currentObjections = selectedContext ? OBJECTIONS[selectedContext] || [] : []
  const activeObjection = selectedObjection
    ? allObjections.find((o) => o.id === selectedObjection)
    : null

  const handleSelectObjection = useCallback((id: string) => {
    setSelectedObjection(id)
    setTimeout(() => detailRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100)
  }, [])

  const handleCopyAllScripts = async () => {
    if (!activeObjection) return
    const allScripts = activeObjection.steps
      .filter((s) => s.type === "script")
      .map((s) => `${s.title}:\n${s.content}`)
      .join("\n\n---\n\n")
    try {
      await navigator.clipboard.writeText(allScripts)
      toast({ title: "Copied!", description: "All scripts copied to clipboard" })
    } catch {
      toast({ title: "Error", description: "Failed to copy", variant: "destructive" })
    }
  }

  return (
    <div className="space-y-5">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-optavia-gray opacity-50" />
        <Input
          type="text"
          placeholder="Search any objection or keyword..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value)
            if (e.target.value) {
              setSelectedContext(null)
              setSelectedObjection(null)
            }
          }}
          className="pl-10 border-2 border-gray-200 focus:border-[hsl(var(--optavia-green))] bg-white"
        />
      </div>

      {/* Search Results */}
      {searchQuery.trim() && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-optavia-gray uppercase tracking-wider">
            {filteredObjections.length} result{filteredObjections.length !== 1 ? "s" : ""}
          </p>
          {filteredObjections.map((obj) => (
            <button
              key={obj.id}
              onClick={() => {
                setSelectedContext(obj.context)
                handleSelectObjection(obj.id)
                setSearchQuery("")
              }}
              className="block w-full text-left p-3 rounded-lg border border-gray-200 bg-white hover:border-[hsl(var(--optavia-green))] hover:shadow-sm transition-all"
            >
              <span className="font-semibold text-sm text-optavia-dark">{obj.label}</span>
              <span className="block text-xs text-optavia-gray mt-0.5">
                {CONTEXTS.find((c) => c.id === obj.context)?.label}
              </span>
            </button>
          ))}
          {filteredObjections.length === 0 && (
            <p className="text-center text-optavia-gray text-sm py-6">
              No matching objections found. Try different keywords.
            </p>
          )}
        </div>
      )}

      {/* Context Selection */}
      {!searchQuery.trim() && !activeObjection && (
        <>
          <div>
            <h3 className="text-xs font-bold text-optavia-gray uppercase tracking-wider mb-3">
              What type of conversation?
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {CONTEXTS.map((ctx) => {
                const Icon = ctx.icon
                const isSelected = selectedContext === ctx.id
                return (
                  <button
                    key={ctx.id}
                    onClick={() => {
                      setSelectedContext(ctx.id)
                      setSelectedObjection(null)
                    }}
                    className={`p-3 rounded-xl border-2 text-left transition-all ${
                      isSelected
                        ? "border-[hsl(var(--optavia-green))] bg-[hsl(var(--optavia-green-light))] shadow-sm"
                        : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${
                      isSelected ? "bg-[hsl(var(--optavia-green-light))]" : "bg-gray-100"
                    }`}>
                      <Icon className={`h-4 w-4 ${isSelected ? "text-[hsl(var(--optavia-green))]" : "text-optavia-gray"}`} />
                    </div>
                    <span className="font-semibold text-xs text-optavia-dark block leading-tight">
                      {ctx.label}
                    </span>
                    <span className="text-[10px] text-optavia-gray mt-1 block">
                      {(OBJECTIONS[ctx.id] || []).length} objection{(OBJECTIONS[ctx.id] || []).length !== 1 ? "s" : ""}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Objection Buttons */}
          {selectedContext && (
            <div>
              <h3 className="text-xs font-bold text-optavia-gray uppercase tracking-wider mb-3">
                What are they saying?
              </h3>
              <div className="space-y-2">
                {currentObjections.map((obj) => {
                  const toneStyle = TONE_STYLES[obj.tone]
                  return (
                    <button
                      key={obj.id}
                      onClick={() => handleSelectObjection(obj.id)}
                      className="w-full p-3 rounded-xl border-2 border-gray-200 bg-white hover:border-[hsl(var(--optavia-green))] hover:shadow-sm text-left transition-all flex items-center justify-between gap-3"
                    >
                      <div>
                        <span className="font-semibold text-sm text-optavia-dark block">{obj.label}</span>
                        <Badge variant="outline" className={`mt-1.5 text-[10px] font-bold ${toneStyle.badge}`}>
                          {obj.toneLabel}
                        </Badge>
                      </div>
                      <ChevronLeft className="h-4 w-4 text-optavia-gray rotate-180 flex-shrink-0" />
                    </button>
                  )
                })}
              </div>
            </div>
          )}

        </>
      )}

      {/* Detail View */}
      {activeObjection && !searchQuery.trim() && (
        <div ref={detailRef} className="space-y-4">
          <button
            onClick={() => setSelectedObjection(null)}
            className="flex items-center gap-1.5 text-sm font-semibold text-[hsl(var(--optavia-green))] hover:text-[hsl(var(--optavia-green-dark))] transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to objections
          </button>

          <Card className="p-5 border-gray-200 shadow-sm">
            <div className="mb-3">
              <h2 className="font-bold text-lg text-optavia-dark leading-tight">
                {activeObjection.label}
              </h2>
            </div>

            <Badge variant="outline" className={`mb-4 text-xs font-bold ${TONE_STYLES[activeObjection.tone].badge}`}>
              Recommended Tone: {activeObjection.toneLabel}
            </Badge>

            <div className="bg-gradient-to-r from-[hsl(var(--optavia-green-light))] to-amber-50 rounded-lg p-4">
              <h4 className="text-[10px] font-bold text-optavia-dark uppercase tracking-wider mb-1.5">
                Why this comes up
              </h4>
              <p className="text-sm leading-relaxed text-optavia-gray">
                {activeObjection.whyWorks}
              </p>
            </div>
          </Card>

          <div>
            <h3 className="text-xs font-bold text-optavia-gray uppercase tracking-wider mb-3">
              Conversation Flow
            </h3>
            <div>
              {activeObjection.steps.map((step, i) => (
                <StepCard key={i} step={step} index={i} total={activeObjection.steps.length} />
              ))}
            </div>
          </div>

          <div className="text-center pt-2">
            <Button
              onClick={handleCopyAllScripts}
              className="bg-[hsl(var(--optavia-green))] hover:bg-[hsl(var(--optavia-green-dark))] text-white gap-2 shadow-md"
            >
              <Copy className="h-4 w-4" />
              Copy All Scripts
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
