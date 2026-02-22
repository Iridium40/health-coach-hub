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
  Users,
  RefreshCcw,
  BarChart3,
  ChevronDown,
  ChevronUp,
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

interface LogEntry {
  id: string
  label: string
  context: string
  timestamp: string
}

const CONTEXTS: ContextDef[] = [
  { id: "recruitment", label: "Team Recruitment", icon: Users, color: "text-purple-500 bg-purple-50 border-purple-200" },
  { id: "reengagement", label: "Re-Engagement", icon: RefreshCcw, color: "text-pink-500 bg-pink-50 border-pink-200" },
]

const OBJECTIONS: Record<string, Objection[]> = {
  recruitment: [
    {
      id: "mlm_concern",
      label: "\"Is this an MLM?\"",
      tone: "direct",
      toneLabel: "Direct & Honest",
      whyWorks: "Dodging this question destroys trust instantly. The most powerful response is honest, confident, and reframes the business model in terms they can relate to — while addressing the real concern behind the question.",
      steps: [
        { type: "script", title: "Be Direct", content: "I appreciate you asking that directly. OPTAVIA uses a network marketing model, which means coaches can earn income by helping others. I know that term can carry some baggage, so let me tell you what it actually looks like day to day." },
        { type: "tip", title: "Why This Works", content: "Honesty builds immediate trust. When you don't dodge the question, you signal confidence and integrity — the exact qualities that make someone want to work WITH you." },
        { type: "script", title: "Reframe the Reality", content: "My actual day-to-day is: helping people get healthy, sharing what worked for me, and mentoring other coaches who want to do the same. There's no inventory to buy, no cold calling strangers, and no pressure tactics. It's really about building genuine relationships." },
        { type: "script", title: "Address the Real Concern", content: "I think what most people really want to know is: 'Will I have to be pushy or weird?' And the answer is absolutely not. The best coaches succeed because they genuinely help people. That's it. Does that ease your concern a bit?" },
      ],
    },
    {
      id: "not_salesperson",
      label: "\"I'm not a salesperson\"",
      tone: "curious",
      toneLabel: "Curious & Reframing",
      whyWorks: "People who say this are actually ideal coaches — they're relational, not transactional. Your job is to show them that coaching isn't selling; it's sharing something that changed their life.",
      steps: [
        { type: "script", title: "Agree With Them", content: "Good — because I'm not looking for salespeople! Honestly, the best coaches I know aren't \"sales types\" at all. They're people who had a transformation and can't help but share it." },
        { type: "script", title: "Reframe the Role", content: "Think about it — have you ever recommended a restaurant you loved, or told a friend about a great show? You weren't \"selling\" anything. You were sharing something you believed in. That's literally all coaching is." },
        { type: "tip", title: "Why This Works", content: "By connecting coaching to something they already do naturally (recommending things they love), you remove the \"salesperson\" identity barrier. They realize the skill they need is authenticity, not persuasion." },
        { type: "script", title: "Paint Their Future", content: "Imagine if you could help even 5 people have the same transformation you had — and get paid for it. That's what this looks like. You don't need a business degree. You just need your story and a willingness to help people." },
      ],
    },
    {
      id: "no_time_biz",
      label: "\"I don't have time for a business\"",
      tone: "direct",
      toneLabel: "Direct & Realistic",
      whyWorks: "Time concerns about the business opportunity need a different approach than program time objections. Show them the part-time reality and scalable nature of coaching.",
      steps: [
        { type: "script", title: "Set Realistic Expectations", content: "I totally respect that. Here's the reality — most coaches start with just 5-10 hours a week, and a lot of that is stuff you're already doing: sharing on social media, texting friends, having conversations over coffee." },
        { type: "script", title: "Show the Trade-Off", content: "What if those 5-10 hours a week could eventually replace your full-time income? I'm not saying it happens overnight, but the beauty of this model is that it compounds over time as you build a team." },
        { type: "tip", title: "Why This Works", content: "The key insight is that this business fits INTO their life — it doesn't require them to rearrange it. And the scalability means the time investment gets MORE efficient over time, not less." },
        { type: "script", title: "Remove the Pressure", content: "There's no minimum requirement. Some coaches do this super casually and just cover the cost of their own program. Others build it into something much bigger. You get to choose the pace. Want me to show you what the first 30 days actually look like?" },
      ],
    },
  ],
  reengagement: [
    {
      id: "fell_off",
      label: "Client who fell off the program",
      tone: "empathetic",
      toneLabel: "Warm & Judgment-Free",
      whyWorks: "Clients who fell off the program feel shame and guilt. Leading with zero judgment and celebrating their courage to re-engage is the fastest way to bring them back.",
      steps: [
        { type: "script", title: "Open Without Judgment", content: "Hey [Name]! I've been thinking about you. How have you been? I want you to know — there's absolutely no judgment here. Life happens to everyone, and the most important thing is that you're still open to the conversation." },
        { type: "tip", title: "Why This Works", content: "Leading with warmth and zero judgment removes the #1 barrier to re-engagement: shame. Most clients who fell off WANT to come back but are embarrassed. Your job is to make that easy." },
        { type: "script", title: "Reframe the Setback", content: "Here's something I tell all my clients: falling off doesn't erase your progress. Every healthy habit you built is still in there. It's not starting over — it's picking back up. And this time, you know what to expect." },
        { type: "script", title: "Create a Fresh Start", content: "What if we treated this like a fresh chapter? We can do a quick Health Assessment to see where you are now, set some new goals, and build a plan that works for your life today. How does that sound?" },
        { type: "followup", title: "If They're Hesitant", content: "No rush at all. How about we just start with a 15-minute check-in call? No commitments — just catching up and seeing if the timing feels right. I'm here whenever you're ready." },
      ],
    },
    {
      id: "prev_not_interested",
      label: "Previously said \"Not Interested\"",
      tone: "curious",
      toneLabel: "Low-Pressure & Value-First",
      whyWorks: "People's circumstances and priorities change. A value-first approach — where you lead with something helpful rather than a pitch — can re-open doors that were closed months ago.",
      steps: [
        { type: "script", title: "Lead with Value, Not a Pitch", content: "Hey [Name]! I hope you're doing great. I came across [something relevant: a recipe, article, health tip] and genuinely thought you'd find it helpful — no strings attached. Sending it your way!" },
        { type: "tip", title: "Why This Works", content: "You're not asking for anything. You're giving. This builds goodwill and keeps you top of mind. Over time, this approach turns \"not interested\" into \"tell me more\" naturally." },
        { type: "script", title: "The Casual Check-In (2 weeks later)", content: "Hey [Name]! Just curious — has anything changed on the health front for you? I know when we talked before the timing wasn't right, and I totally respected that. Just checking in because I care." },
        { type: "exit", title: "Respect the No", content: "If they say they're still not interested, respect it gracefully: \"Completely understand! Just know I'm always here if anything changes. Wishing you the best!\" Then set a 90-day reminder for one more light touch." },
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

export function RecruitmentNavigator() {
  const { toast } = useToast()
  const [selectedContext, setSelectedContext] = useState<string | null>(null)
  const [selectedObjection, setSelectedObjection] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [objectionLog, setObjectionLog] = useState<LogEntry[]>([])
  const [showLog, setShowLog] = useState(false)
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

  const logObjection = useCallback((objection: Objection & { context: string }) => {
    setObjectionLog((prev) => [
      {
        id: objection.id,
        label: objection.label,
        context: objection.context,
        timestamp: new Date().toLocaleString(),
      },
      ...prev.slice(0, 19),
    ])
    toast({ title: "Logged!", description: `"${objection.label}" added to your conversation log` })
  }, [toast])

  const topObjections = useMemo(() => {
    const counts: Record<string, number> = {}
    objectionLog.forEach((item) => {
      counts[item.label] = (counts[item.label] || 0) + 1
    })
    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
  }, [objectionLog])

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

      {!searchQuery.trim() && !activeObjection && (
        <>
          <div>
            <h3 className="text-xs font-bold text-optavia-gray uppercase tracking-wider mb-3">
              What type of conversation?
            </h3>
            <div className="grid grid-cols-2 gap-2">
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
                      {(OBJECTIONS[ctx.id] || []).length} scenario{(OBJECTIONS[ctx.id] || []).length !== 1 ? "s" : ""}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {selectedContext && (
            <div>
              <h3 className="text-xs font-bold text-optavia-gray uppercase tracking-wider mb-3">
                What&apos;s the situation?
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

          {objectionLog.length > 0 && (
            <div>
              <button
                onClick={() => setShowLog(!showLog)}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-colors"
              >
                <span className="flex items-center gap-2 text-xs font-semibold text-optavia-gray">
                  <BarChart3 className="h-4 w-4" />
                  Conversation Log ({objectionLog.length})
                </span>
                {showLog ? <ChevronUp className="h-4 w-4 text-optavia-gray" /> : <ChevronDown className="h-4 w-4 text-optavia-gray" />}
              </button>
              {showLog && (
                <Card className="mt-2 p-4 border-gray-200">
                  <h4 className="text-[10px] font-bold text-optavia-gray uppercase tracking-wider mb-3">
                    Most Common Scenarios
                  </h4>
                  <div className="space-y-2">
                    {topObjections.map(([label, count], i) => (
                      <div key={i} className="flex items-center justify-between py-1.5 border-b border-gray-100 last:border-0">
                        <span className="text-sm text-optavia-dark">{label}</span>
                        <span className="text-sm font-bold text-[hsl(var(--optavia-green))]">{count}x</span>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          )}
        </>
      )}

      {activeObjection && !searchQuery.trim() && (
        <div ref={detailRef} className="space-y-4">
          <button
            onClick={() => setSelectedObjection(null)}
            className="flex items-center gap-1.5 text-sm font-semibold text-[hsl(var(--optavia-green))] hover:text-[hsl(var(--optavia-green-dark))] transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to scenarios
          </button>

          <Card className="p-5 border-gray-200 shadow-sm">
            <div className="flex items-start justify-between gap-3 mb-3">
              <h2 className="font-bold text-lg text-optavia-dark leading-tight">
                {activeObjection.label}
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => logObjection(activeObjection)}
                className="flex-shrink-0 text-xs gap-1.5 border-gray-300 text-optavia-gray hover:text-[hsl(var(--optavia-green))] hover:border-[hsl(var(--optavia-green))]"
              >
                <BarChart3 className="h-3 w-3" />
                Log
              </Button>
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
