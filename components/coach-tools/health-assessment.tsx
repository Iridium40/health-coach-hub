"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { useUserData } from "@/contexts/user-data-context"
import { 
  ClipboardList, CheckCircle2, Clock, ChevronDown, ChevronUp, 
  Send, RotateCcw, Play, Pause, Square
} from "lucide-react"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

interface ChecklistItem {
  id: string
  title: string
  tip?: string
  script?: string
  warning?: string
  hasNote?: boolean
  section: string
}

const CHECKLIST_ITEMS: ChecklistItem[] = [
  // Phase 1: Pre-Call Prep
  { id: "prep-1", title: "Review their Health Assessment form", tip: "Note their current state, goals, medical conditions, and commitment level BEFORE the call", section: "prep" },
  { id: "prep-2", title: "Identify their 'Why' from the form", tip: "Look at: 'Why do you want to lose weight? What will be different?'", section: "prep" },
  { id: "prep-3", title: "Note any red flags or special considerations", tip: "Check for: Pregnant/Nursing, Diabetes, Medications. Low scores on Sleep/Energy below 3 = discuss", section: "prep" },
  { id: "prep-4", title: "Prepare your environment", tip: "Quiet space, water nearby, this checklist open, smile on your face 😊", section: "prep" },
  
  // Phase 2: Opening
  { id: "open-1", title: "Warm greeting with their name", script: "Hi [NAME]! It's so great to connect with you. Thank you for taking the time to fill out the Health Assessment — I really appreciated reading your story.", section: "open" },
  { id: "open-2", title: "Confirm they have 20-30 minutes", script: "Do you have about 20-30 minutes right now? I want to make sure we have enough time to chat without rushing.", section: "open" },
  { id: "open-3", title: "Set the agenda for the call", script: "Here's what I'd love to do today: First, I want to hear more about YOU — your goals and what's brought you here. Then I'll share a bit about myself and how I might be able to help. Sound good?", section: "open" },
  { id: "open-4", title: "Ask an easy ice-breaker", script: "So tell me a little about yourself — what's keeping you busy these days?", tip: "Listen for family, work, hobbies — things you can connect to later", section: "open" },
  
  // Phase 3: Discovery
  { id: "discover-1", title: "Explore their current situation", script: "You mentioned [REFERENCE THEIR FORM ANSWER about current state]. Tell me more about that — how long has this been going on?", hasNote: true, section: "discover" },
  { id: "discover-2", title: "Dig into their 'Why'", script: "You wrote that [REFERENCE THEIR WHY]. That's really powerful. Can you tell me more about what that would mean for your life?", tip: "Get emotional. The deeper the 'why,' the more committed they'll be.", hasNote: true, section: "discover" },
  { id: "discover-3", title: "Understand what they've tried before", script: "What have you tried in the past to reach your health goals? What worked? What didn't?", tip: "Listen for patterns — yo-yo dieting, lack of support, too complicated", hasNote: true, section: "discover" },
  { id: "discover-4", title: "Ask about their support system", script: "Do you have people around you who support your health goals? A spouse, family, friends?", section: "discover" },
  { id: "discover-5", title: "Identify their biggest obstacle", script: "If you could wave a magic wand and remove ONE thing standing between you and your health goals, what would it be?", hasNote: true, section: "discover" },
  { id: "discover-6", title: "Gauge urgency and timeline", script: "On a scale of 1-10, how important is it for you to make a change right now? Why that number and not lower?", tip: "If they say 7, ask 'Why not a 5?' — this gets them to sell themselves", section: "discover" },
  
  // Phase 4: Present
  { id: "present-1", title: "Share your personal story (briefly)", script: "Can I share a little about my own journey? I was in a similar place — [YOUR BRIEF STORY]. That's why I'm so passionate about helping others.", warning: "Keep it to 60-90 seconds. This is about THEM, not you.", section: "present" },
  { id: "present-2", title: "Explain the OPTAVIA approach (simple)", script: "OPTAVIA is different because it's not just about the food — it's about building healthy habits that last. You get a structured plan PLUS a coach (me!) who checks in with you every day. You're never alone.", section: "present" },
  { id: "present-3", title: "Connect to their specific goals", script: "Remember how you said [THEIR WHY]? Here's how this helps with that specifically: [CONNECT THE DOTS]", tip: "Use THEIR words back to them — it shows you listened", section: "present" },
  { id: "present-4", title: "Explain what working together looks like", script: "If we work together, here's what you can expect: Daily check-ins from me, weekly calls to talk through challenges, access to our support community, and a simple plan you can follow. I'm with you every step.", section: "present" },
  { id: "present-5", title: "Ask if they have questions", script: "What questions do you have so far? I want to make sure this all makes sense.", section: "present" },
  
  // Phase 5: Close
  { id: "close-1", title: "Ask the closing question", script: "Based on everything we've talked about, can you see yourself doing this? What's holding you back from getting started today?", section: "close" },
  { id: "close-2", title: "Handle any objections", section: "close" },
  { id: "close-3", title: "If YES: Walk them through enrollment", script: "Awesome! I'm so excited to start this journey with you. Let me walk you through the next steps — it only takes a few minutes...", tip: "Have your OPTAVIA Coach link ready to share", section: "close" },
  { id: "close-4", title: "If NOT YET: Set a follow-up", script: "No pressure at all! How about we schedule a quick follow-up call for [DAY]? That gives you time to think, and I can answer any new questions.", hasNote: true, section: "close" },
  
  // Phase 6: Follow-up
  { id: "followup-1", title: "Send a thank you text within 1 hour", script: "Hey [NAME]! It was so great talking with you today. I'm really excited about your goals and I'm here whenever you're ready. No rush — just know I'm cheering you on! 💚", section: "followup" },
  { id: "followup-2", title: "Log notes in your CRM/tracker", tip: "Record: their why, objections, follow-up date, hot/warm/cold status", section: "followup" },
  { id: "followup-3", title: "Set reminder for follow-up (if needed)", tip: "If they didn't enroll, follow up in 24-48 hours with value (recipe, tip, etc.)", section: "followup" },
]

const PHASES = [
  { id: "prep", title: "Pre-Call Preparation", icon: "📋", color: "bg-blue-50 text-blue-700" },
  { id: "open", title: "Opening & Rapport (2-3 min)", icon: "👋", color: "bg-yellow-50 text-yellow-700" },
  { id: "discover", title: "Discovery Questions (10-12 min)", icon: "🔍", color: "bg-purple-50 text-purple-700" },
  { id: "present", title: "Present the Solution (5-7 min)", icon: "💡", color: "bg-green-50 text-green-700" },
  { id: "close", title: "Close & Next Steps (5 min)", icon: "✅", color: "bg-pink-50 text-pink-700" },
  { id: "followup", title: "Post-Call Follow-Up", icon: "📞", color: "bg-indigo-50 text-indigo-700" },
]

export function HealthAssessment() {
  const { toast } = useToast()
  const { profile, user } = useUserData()
  const [clientName, setClientName] = useState("")
  const [clientPhone, setClientPhone] = useState("")
  const [clientWhy, setClientWhy] = useState("")
  const [clientCommitment, setClientCommitment] = useState("")
  const [callOutcome, setCallOutcome] = useState("")
  const [callNotes, setCallNotes] = useState("")
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set())
  const [notes, setNotes] = useState<Record<string, string>>({})
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(["prep", "open"]))
  const [timerSeconds, setTimerSeconds] = useState(0)
  const [timerRunning, setTimerRunning] = useState(false)
  const [sending, setSending] = useState(false)

  // Timer effect
  useEffect(() => {
    if (timerRunning) {
      const interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1)
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [timerRunning])

  // Load state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("haChecklist")
    if (saved) {
      try {
        const state = JSON.parse(saved)
        if (state.clientName) setClientName(state.clientName)
        if (state.clientPhone) setClientPhone(state.clientPhone)
        if (state.clientWhy) setClientWhy(state.clientWhy)
        if (state.clientCommitment) setClientCommitment(state.clientCommitment)
        if (state.callOutcome) setCallOutcome(state.callOutcome)
        if (state.callNotes) setCallNotes(state.callNotes)
        if (state.checked) setCheckedItems(new Set(state.checked))
        if (state.notes) setNotes(state.notes)
        if (state.timerSeconds) setTimerSeconds(state.timerSeconds)
      } catch (e) {
        console.error("Failed to load saved state:", e)
      }
    }
  }, [])

  // Save state to localStorage
  const saveState = () => {
    const state = {
      clientName,
      clientPhone,
      clientWhy,
      clientCommitment,
      callOutcome,
      callNotes,
      checked: Array.from(checkedItems),
      notes,
      timerSeconds,
    }
    localStorage.setItem("haChecklist", JSON.stringify(state))
  }

  useEffect(() => {
    saveState()
  }, [clientName, clientPhone, clientWhy, clientCommitment, callOutcome, callNotes, checkedItems, notes, timerSeconds])

  const toggleCheck = (itemId: string) => {
    const newChecked = new Set(checkedItems)
    if (newChecked.has(itemId)) {
      newChecked.delete(itemId)
    } else {
      newChecked.add(itemId)
    }
    setCheckedItems(newChecked)
  }

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId)
    } else {
      newExpanded.add(sectionId)
    }
    setExpandedSections(newExpanded)
  }

  const resetAll = () => {
    if (confirm("Reset all checkboxes and notes? This cannot be undone.")) {
      setClientName("")
      setClientPhone("")
      setClientWhy("")
      setClientCommitment("")
      setCallOutcome("")
      setCallNotes("")
      setCheckedItems(new Set())
      setNotes({})
      setTimerSeconds(0)
      setTimerRunning(false)
      localStorage.removeItem("haChecklist")
      toast({
        title: "Reset",
        description: "All data has been cleared",
      })
    }
  }

  const resetTimer = () => {
    setTimerSeconds(0)
    setTimerRunning(false)
  }

  const toggleTimer = () => {
    setTimerRunning(!timerRunning)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  // Calculate progress
  const getSectionProgress = (section: string) => {
    const sectionItems = CHECKLIST_ITEMS.filter((item) => item.section === section)
    const checked = sectionItems.filter((item) => checkedItems.has(item.id)).length
    return { checked, total: sectionItems.length }
  }

  const getOverallProgress = () => {
    const total = CHECKLIST_ITEMS.length
    const checked = checkedItems.size
    return total > 0 ? Math.round((checked / total) * 100) : 0
  }

  const handleSendEmail = async () => {
    if (!profile?.email) {
      toast({
        title: "Error",
        description: "Unable to find your email address",
        variant: "destructive",
      })
      return
    }

    if (!user?.id) {
      toast({
        title: "Error",
        description: "Unable to authenticate. Please refresh the page.",
        variant: "destructive",
      })
      return
    }

    if (!callOutcome) {
      toast({
        title: "Please select an outcome",
        description: "Select a call outcome before sending the email.",
        variant: "destructive",
      })
      return
    }

    setSending(true)
    try {
      const response = await fetch("/api/send-health-assessment-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: profile.email,
          userId: user.id,
          coachName: profile.full_name || "Coach",
          clientName,
          clientPhone,
          clientWhy,
          clientCommitment,
          callOutcome,
          callNotes,
          checkedItems: Array.from(checkedItems),
          notes,
          timerSeconds,
          progress: getOverallProgress(),
          phaseProgress: PHASES.map((phase) => ({
            phase: phase.title,
            ...getSectionProgress(phase.id),
          })),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to send email")
      }

      const result = await response.json()
      toast({
        title: "Email sent!",
        description: result.savedToDatabase 
          ? "Health assessment results have been sent to your email and saved"
          : "Health assessment results have been sent to your email",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send email. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-wrap gap-2 justify-between items-center">
        <div className="flex items-center gap-2">
          <ClipboardList className="h-5 w-5 text-[hsl(var(--optavia-green))]" />
          <h3 className="text-lg font-semibold text-optavia-dark">Health Assessment Call Checklist</h3>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={resetAll}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button 
            size="sm" 
            onClick={handleSendEmail}
            disabled={sending}
            className="bg-[hsl(var(--optavia-green))] hover:bg-[hsl(var(--optavia-green-dark))] text-white"
          >
            <Send className="h-4 w-4 mr-2" />
            {sending ? "Sending..." : "Email Results"}
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-optavia-gray">Call Progress</span>
          <span className="font-semibold text-[hsl(var(--optavia-green))]">{getOverallProgress()}%</span>
        </div>
        <Progress value={getOverallProgress()} className="h-2" />
      </div>

      {/* Client Information Card */}
      <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-[hsl(var(--optavia-green))]">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-[hsl(var(--optavia-green))] uppercase tracking-wide">
            📝 Client Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="clientName" className="text-optavia-dark">Client Name</Label>
              <Input
                id="clientName"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Enter name..."
                className="bg-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="clientPhone" className="text-optavia-dark">Phone</Label>
              <Input
                id="clientPhone"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                placeholder="Enter phone..."
                className="bg-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="clientWhy" className="text-optavia-dark">Their "Why"</Label>
              <Input
                id="clientWhy"
                value={clientWhy}
                onChange={(e) => setClientWhy(e.target.value)}
                placeholder="What motivates them?"
                className="bg-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="clientCommitment" className="text-optavia-dark">Commitment Level (from form)</Label>
              <Input
                id="clientCommitment"
                value={clientCommitment}
                onChange={(e) => setClientCommitment(e.target.value)}
                placeholder="1-10"
                className="bg-white"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timer */}
      <Card className="bg-white">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-optavia-gray" />
              <span className="text-sm font-medium text-optavia-gray">Call Duration</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-optavia-dark font-mono">{formatTime(timerSeconds)}</span>
              <Button variant="outline" size="sm" onClick={toggleTimer}>
                {timerRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
              <Button variant="outline" size="sm" onClick={resetTimer}>
                <Square className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Phases */}
      {PHASES.map((phase) => {
        const phaseItems = CHECKLIST_ITEMS.filter((item) => item.section === phase.id)
        const progress = getSectionProgress(phase.id)
        const isExpanded = expandedSections.has(phase.id)
        
        return (
          <Collapsible key={phase.id} open={isExpanded} onOpenChange={() => toggleSection(phase.id)}>
            <Card>
              <CollapsibleTrigger className="w-full">
                <CardHeader className="hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${phase.color}`}>
                        {phase.icon} Phase {PHASES.findIndex((p) => p.id === phase.id) + 1}
                      </span>
                      <span>{phase.title}</span>
                    </CardTitle>
                    <div className="flex items-center gap-3">
                      <span className={`text-sm font-medium ${progress.checked === progress.total && progress.total > 0 ? "text-[hsl(var(--optavia-green))]" : "text-optavia-gray"}`}>
                        {progress.checked}/{progress.total}
                      </span>
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </div>
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="space-y-4">
                  {phaseItems.map((item) => (
                    <div
                      key={item.id}
                      className={`flex gap-3 p-3 rounded-lg border ${
                        checkedItems.has(item.id)
                          ? "bg-gray-50 border-gray-200 opacity-75"
                          : "bg-white border-gray-200"
                      }`}
                    >
                      <div className="pt-1">
                        <Checkbox
                          checked={checkedItems.has(item.id)}
                          onCheckedChange={() => toggleCheck(item.id)}
                          className="data-[state=checked]:bg-[hsl(var(--optavia-green))] data-[state=checked]:border-[hsl(var(--optavia-green))]"
                        />
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className={`font-medium ${checkedItems.has(item.id) ? "line-through text-optavia-gray" : "text-optavia-dark"}`}>
                          {item.title}
                        </div>
                        {item.script && (
                          <div className="text-sm text-optavia-gray bg-gray-50 p-3 rounded border-l-2 border-[hsl(var(--optavia-green))] italic">
                            💬 {item.script}
                          </div>
                        )}
                        {item.tip && (
                          <div className="text-sm text-blue-700 bg-blue-50 p-2 rounded">
                            💡 {item.tip}
                          </div>
                        )}
                        {item.warning && (
                          <div className="text-sm text-amber-700 bg-amber-50 p-2 rounded">
                            ⚠️ {item.warning}
                          </div>
                        )}
                        {item.hasNote && (
                          <Textarea
                            placeholder="Add notes..."
                            value={notes[item.id] || ""}
                            onChange={(e) => setNotes({ ...notes, [item.id]: e.target.value })}
                            className="bg-white text-sm"
                            rows={2}
                          />
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {/* Objections for close phase */}
                  {phase.id === "close" && (
                    <div className="mt-4 space-y-2 p-4 bg-red-50 rounded-lg border border-red-200">
                      <div className="font-semibold text-red-900 mb-3">Common Objections & Responses:</div>
                      <div className="space-y-3">
                        <div className="bg-white p-3 rounded border border-red-200">
                          <div className="font-semibold text-red-700 mb-2">"It's too expensive"</div>
                          <div className="text-sm text-green-700 bg-green-50 p-2 rounded">
                            ✅ I understand. Let me ask — how much are you spending now on food, snacks, coffee runs? Most clients find it's actually comparable. And what's it costing you NOT to fix this?
                          </div>
                        </div>
                        <div className="bg-white p-3 rounded border border-red-200">
                          <div className="font-semibold text-red-700 mb-2">"I need to think about it"</div>
                          <div className="text-sm text-green-700 bg-green-50 p-2 rounded">
                            ✅ I totally get that. What specifically do you need to think through? Sometimes it helps to talk it out together.
                          </div>
                        </div>
                        <div className="bg-white p-3 rounded border border-red-200">
                          <div className="font-semibold text-red-700 mb-2">"I need to talk to my spouse"</div>
                          <div className="text-sm text-green-700 bg-green-50 p-2 rounded">
                            ✅ That's great that you make decisions together! Would it help if I hopped on a quick call with both of you? I'm happy to answer any questions they might have.
                          </div>
                        </div>
                        <div className="bg-white p-3 rounded border border-red-200">
                          <div className="font-semibold text-red-700 mb-2">"I've tried everything"</div>
                          <div className="text-sm text-green-700 bg-green-50 p-2 rounded">
                            ✅ I hear you — it's frustrating when nothing sticks. Here's what's different: you've never had a coach with you every single day. That's the piece most people are missing.
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        )
      })}

      {/* Call Notes & Outcome */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">📝 Call Notes & Outcome</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="callOutcome">Call Outcome</Label>
            <Select value={callOutcome} onValueChange={setCallOutcome}>
              <SelectTrigger id="callOutcome" className="bg-white">
                <SelectValue placeholder="Select outcome..." />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="enrolled">✅ Enrolled!</SelectItem>
                <SelectItem value="followup">📅 Follow-up scheduled</SelectItem>
                <SelectItem value="thinking">🤔 Thinking about it</SelectItem>
                <SelectItem value="not-ready">⏸️ Not ready now</SelectItem>
                <SelectItem value="not-fit">❌ Not a good fit</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="callNotes">Additional Notes</Label>
            <Textarea
              id="callNotes"
              value={callNotes}
              onChange={(e) => setCallNotes(e.target.value)}
              placeholder="Key takeaways, things to remember for follow-up, personal details mentioned..."
              className="bg-white"
              rows={5}
            />
          </div>
        </CardContent>
      </Card>

      {/* Footer Note */}
      <div className="text-center text-sm text-optavia-gray italic">
        Remember: Listen more than you talk! 👂
      </div>
    </div>
  )
}
