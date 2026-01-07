"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { useUserData } from "@/contexts/user-data-context"
import { 
  ClipboardList, RotateCcw, ExternalLink, Video, FileText
} from "lucide-react"

interface ChecklistItem {
  id: string
  title: string
  tip?: string
  link?: string
  linkText?: string
  section: string
  isHeader?: boolean
  isBold?: boolean
}

const CHECKLIST_ITEMS: ChecklistItem[] = [
  // Initial Order Section
  { id: "initial-1", title: "Add Kit, customize as needed, and Register for Optavia Premier (check for 20% discount prior to order.)", section: "initial-order" },
  { id: "initial-2", title: "Send Welcome Text", section: "initial-order" },
  { id: "initial-3", title: "Add client to Client page on Facebook (For Team Tarleton clients, use Optavia Strong Client, for Team Healthy Edge clients, use Healthy Edge 3.0)", section: "initial-order" },
  { id: "initial-4", title: "Schedule a Kickoff Call for your new client. All clients MUST have a kickoff call, and it's best to do this the Sunday before the Monday Start", section: "initial-order" },
  
  // New Client Videos Section
  { id: "video-1", title: "KICKOFF CALL VIDEO", link: "https://vimeo.com/showcase/8816357", linkText: "UNIVERSAL KICKOFF VIDEO", section: "videos", isBold: true },
  { id: "video-2", title: "LEAN AND GREEN VIDEO", link: "https://vimeo.com/414057972", linkText: "https://vimeo.com/414057972", section: "videos", isBold: true },
  
  // FAQ Texts Section (prior to start date)
  { id: "faq-1", title: "WELCOME AND 9 TIPS", link: "https://docs.google.com/document/d/1x9k469K6XvuQ8rcPdgR3z4i9iXKLxBvSIR_77UuDgpM/edit?usp=sharing", linkText: "WELCOME AND 9 TIPS", section: "faq-texts", isBold: true },
  { id: "faq-2", title: "Digital Guides (Please ask client to save to phone and/or print)", link: "https://docs.google.com/document/d/1TtZoQcKzTT77PZP0XNlMH-e8HiYzwKhS1UL8ZW5BcT8/edit?usp=sharing", linkText: "Digital Guides", section: "faq-texts", isBold: true },
  { id: "faq-3", title: "THE DAY BEFORE THE START DAY, SEND THE", link: "https://docs.google.com/document/d/1V4vgLqx6-0uE9ZRfIp7024tTCB5NoqjHa0YAbV0_RlU/edit?usp=sharing", linkText: "METABOLIC RESET DAY BEFORE TEXT", section: "faq-texts" },
  { id: "faq-4", title: "DAY ONE, BEGIN SENDING", link: "https://docs.google.com/document/d/1gtH2fYDKLA6f3sv6-yxFUM8b6rLBqp8jF5R7h4ec6i4/edit?usp=sharing", linkText: "THE DAILY METABOLIC HEALTH TEXTS", section: "faq-texts" },
  
  // Daily/Weekly Check-ins
  { id: "checkin-1", title: "3-5 minute daily check-in call Days 1-5 using", link: "https://docs.google.com/document/d/1HLqL_l7IELKgjlx5d3SBuXi2xdyBSaawJ5JmcKDoGHM/edit?usp=sharing", linkText: "DAILY CHECK IN QUESTIONS", tip: "EXACTLY as written", section: "check-ins" },
  { id: "checkin-2", title: "Week 1 Celebration Call", section: "check-ins", isBold: true },
  { id: "checkin-3", title: "OPTIONAL- send", link: "https://docs.google.com/document/d/1G9YtI07xIvazS4KZcCkLlB4N_E1axueXVeV4R0Na4Yc/edit?usp=sharing", linkText: "Day 10-30 Metabolic Health Texts", section: "check-ins" },
  { id: "checkin-4", title: "Weekly 5-10 minute check-in call weeks 1-4", section: "check-ins" },
  { id: "checkin-5", title: "Weekly check-in after month 1", section: "check-ins" },
  { id: "checkin-6", title: "Invite Client to VIP Call (can be as early as Week 2, check with your mentorship to clarify)", section: "check-ins" },
]

const SECTIONS = [
  { id: "initial-order", title: "INITIAL ORDER", icon: "📋" },
  { id: "videos", title: "SEND THE NEW CLIENT VIDEOS PRIOR TO KICKOFF CALL", icon: "🎬" },
  { id: "faq-texts", title: "FAQ TEXTS (Send prior to start date)", icon: "📱", note: "Send these FAQ Texts to your client prior to their start date. These can be found in the CLIENT COMMUNICATION file." },
  { id: "check-ins", title: "ONGOING CHECK-INS", icon: "📞" },
]

export function HealthAssessment() {
  const { toast } = useToast()
  const [clientName, setClientName] = useState("")
  const [startDate, setStartDate] = useState("")
  const [notes, setNotes] = useState("")
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set())

  // Load state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("clientSuccessChecklist")
    if (saved) {
      try {
        const state = JSON.parse(saved)
        if (state.clientName) setClientName(state.clientName)
        if (state.startDate) setStartDate(state.startDate)
        if (state.notes) setNotes(state.notes)
        if (state.checked) setCheckedItems(new Set(state.checked))
      } catch (e) {
        console.error("Failed to load saved state:", e)
      }
    }
  }, [])

  // Save state to localStorage
  const saveState = () => {
    const state = {
      clientName,
      startDate,
      notes,
      checked: Array.from(checkedItems),
    }
    localStorage.setItem("clientSuccessChecklist", JSON.stringify(state))
  }

  useEffect(() => {
    saveState()
  }, [clientName, startDate, notes, checkedItems])

  const toggleCheck = (itemId: string) => {
    const newChecked = new Set(checkedItems)
    if (newChecked.has(itemId)) {
      newChecked.delete(itemId)
    } else {
      newChecked.add(itemId)
    }
    setCheckedItems(newChecked)
  }

  const resetAll = () => {
    if (confirm("Reset all checkboxes and notes? This cannot be undone.")) {
      setClientName("")
      setStartDate("")
      setNotes("")
      setCheckedItems(new Set())
      localStorage.removeItem("clientSuccessChecklist")
      toast({
        title: "Reset",
        description: "All data has been cleared",
      })
    }
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center border-b-4 border-black pb-4">
        <h2 className="text-2xl md:text-3xl font-bold text-optavia-dark tracking-wider uppercase">
          Setting Your Clients Up for Success
        </h2>
      </div>

      {/* Header Actions */}
      <div className="flex flex-wrap gap-2 justify-between items-center">
        <div className="flex items-center gap-2">
          <ClipboardList className="h-5 w-5 text-[hsl(var(--optavia-green))]" />
          <h3 className="text-lg font-semibold text-optavia-dark">New Client Checklist</h3>
        </div>
        <Button variant="outline" size="sm" onClick={resetAll}>
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset
        </Button>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-optavia-gray">Overall Progress</span>
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
                placeholder="Enter client name..."
                className="bg-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="startDate" className="text-optavia-dark">Program Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-white"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sections */}
      {SECTIONS.map((section) => {
        const sectionItems = CHECKLIST_ITEMS.filter((item) => item.section === section.id)
        const progress = getSectionProgress(section.id)
        
        return (
          <Card key={section.id} className="overflow-hidden">
            <CardHeader className="bg-gray-50 border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold uppercase underline decoration-2 underline-offset-4">
                  {section.title}
                </CardTitle>
                <span className={`text-sm font-medium px-2 py-1 rounded ${
                  progress.checked === progress.total && progress.total > 0 
                    ? "bg-green-100 text-green-700" 
                    : "bg-gray-100 text-gray-600"
                }`}>
                  {progress.checked}/{progress.total}
                </span>
              </div>
              {section.note && (
                <p className="text-sm text-optavia-gray mt-2">{section.note}</p>
              )}
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              {sectionItems.map((item) => (
                <div
                  key={item.id}
                  className={`flex gap-3 p-3 rounded-lg border transition-all ${
                    checkedItems.has(item.id)
                      ? "bg-green-50 border-green-200"
                      : "bg-white border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="pt-0.5">
                    <Checkbox
                      checked={checkedItems.has(item.id)}
                      onCheckedChange={() => toggleCheck(item.id)}
                      className="h-5 w-5 border-2 data-[state=checked]:bg-[hsl(var(--optavia-green))] data-[state=checked]:border-[hsl(var(--optavia-green))]"
                    />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className={`${checkedItems.has(item.id) ? "line-through text-gray-500" : "text-optavia-dark"} ${item.isBold ? "font-semibold" : ""}`}>
                      {item.title}
                      {item.link && (
                        <>
                          {" "}
                          <a
                            href={item.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 underline inline-flex items-center gap-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {item.linkText}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </>
                      )}
                    </div>
                    {item.tip && (
                      <div className="text-sm text-amber-700 bg-amber-50 p-2 rounded font-medium">
                        ⚠️ {item.tip}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )
      })}

      {/* Notes Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">📝 Additional Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any additional notes about this client..."
            className="bg-white"
            rows={4}
          />
        </CardContent>
      </Card>

      {/* Footer Note */}
      <div className="text-center text-sm text-optavia-gray italic bg-green-50 p-4 rounded-lg border border-green-200">
        💚 Remember: Consistent check-ins are key to client success!
      </div>
    </div>
  )
}
