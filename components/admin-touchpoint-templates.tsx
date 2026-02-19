"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { useAdminChanges } from "@/hooks/use-admin-changes"
import { AdminSaveButton } from "@/components/admin-save-button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Plus,
  Copy,
  Check,
  Edit2,
  Trash2,
  Phone,
  MessageSquare,
  Calendar,
  Loader2,
  Star,
} from "lucide-react"

// Types
interface TouchpointTrigger {
  id: string
  trigger_key: string
  trigger_label: string
  phase: string
  action_type: "text" | "call"
  emoji: string
  day_start: number | null
  day_end: number | null
  sort_order: number
  is_active: boolean
}

interface TouchpointTemplate {
  id: string
  trigger_id: string
  title: string
  message: string
  is_default: boolean
  sort_order: number
}

interface MeetingInvite {
  id: string
  trigger_id: string
  subject: string
  body: string
}

interface TalkingPoint {
  id: string
  trigger_id: string
  point: string
  sort_order: number
}

// Personalization tokens
const TOKENS = [
  { token: "{firstName}", description: "Client first name" },
  { token: "{days}", description: "Days on program" },
  { token: "{coachName}", description: "Your name" },
  { token: "{nextMilestone}", description: "Next milestone day" },
  { token: "{today}", description: "Current day name (e.g. Monday)" },
]

export function AdminTouchpointTemplates() {
  const supabase = createClient()
  const { toast } = useToast()

  // Track unsaved changes for admin
  const { 
    hasUnsavedChanges, 
    isSaving, 
    changeCount, 
    trackChange, 
    saveChanges,
    showLeaveDialog,
    confirmLeave,
    saveAndLeave,
    cancelLeave,
  } = useAdminChanges()

  // Data state
  const [triggers, setTriggers] = useState<TouchpointTrigger[]>([])
  const [templates, setTemplates] = useState<TouchpointTemplate[]>([])
  const [meetingInvites, setMeetingInvites] = useState<MeetingInvite[]>([])
  const [talkingPoints, setTalkingPoints] = useState<TalkingPoint[]>([])

  // UI state
  const [loading, setLoading] = useState(true)
  const [selectedTrigger, setSelectedTrigger] = useState<TouchpointTrigger | null>(null)
  const [viewMode, setViewMode] = useState<"templates" | "meeting" | "talking">("templates")
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // Modal state
  const [showTemplateModal, setShowTemplateModal] = useState(false)
  const [showTriggerModal, setShowTriggerModal] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<TouchpointTemplate | null>(null)
  const [editingTrigger, setEditingTrigger] = useState<TouchpointTrigger | null>(null)

  // Form state
  const [templateTitle, setTemplateTitle] = useState("")
  const [templateMessage, setTemplateMessage] = useState("")
  const [templateTrigger, setTemplateTrigger] = useState("")  // For template trigger assignment
  const [triggerLabel, setTriggerLabel] = useState("")
  const [triggerKey, setTriggerKey] = useState("")
  const [triggerPhase, setTriggerPhase] = useState("attention")
  const [triggerActionType, setTriggerActionType] = useState<"text" | "call">("text")
  const [triggerEmoji, setTriggerEmoji] = useState("📱")
  const [triggerDayStart, setTriggerDayStart] = useState("")
  const [triggerDayEnd, setTriggerDayEnd] = useState("")

  // Meeting invite form
  const [meetingSubject, setMeetingSubject] = useState("")
  const [meetingBody, setMeetingBody] = useState("")

  // Load all data
  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [triggersRes, templatesRes, invitesRes, pointsRes] = await Promise.all([
        supabase.from("touchpoint_triggers").select("*").order("sort_order"),
        supabase.from("touchpoint_templates").select("*").order("sort_order"),
        supabase.from("touchpoint_meeting_invites").select("*"),
        supabase.from("touchpoint_talking_points").select("*").order("sort_order"),
      ])

      if (triggersRes.data) {
        setTriggers(triggersRes.data)
        if (!selectedTrigger && triggersRes.data.length > 0) {
          setSelectedTrigger(triggersRes.data[0])
        }
      }
      if (templatesRes.data) setTemplates(templatesRes.data)
      if (invitesRes.data) setMeetingInvites(invitesRes.data)
      if (pointsRes.data) setTalkingPoints(pointsRes.data)
    } catch (error) {
      console.error("Error loading data:", error)
      toast({
        title: "Error loading templates",
        description: "Please try refreshing the page",
        variant: "destructive",
      })
    }
    setLoading(false)
  }, [supabase, toast, selectedTrigger])

  useEffect(() => {
    loadData()
  }, [])

  // Get templates for selected trigger
  const triggerTemplates = selectedTrigger
    ? templates.filter((t) => t.trigger_id === selectedTrigger.id)
    : []

  const triggerMeetingInvite = selectedTrigger
    ? meetingInvites.find((m) => m.trigger_id === selectedTrigger.id)
    : null

  const triggerTalkingPoints = selectedTrigger
    ? talkingPoints.filter((tp) => tp.trigger_id === selectedTrigger.id)
    : []

  // Copy to clipboard
  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch (error) {
      toast({
        title: "Failed to copy",
        variant: "destructive",
      })
    }
  }

  // Save template
  const handleSaveTemplate = async () => {
    if (!templateTrigger || !templateTitle.trim() || !templateMessage.trim()) {
      toast({
        title: "Please fill in all fields",
        variant: "destructive",
      })
      return
    }

    // Count existing templates for the target trigger
    const existingTemplates = templates.filter(t => t.trigger_id === templateTrigger)

    try {
      if (editingTemplate) {
        const { error } = await supabase
          .from("touchpoint_templates")
          .update({ 
            title: templateTitle, 
            message: templateMessage,
            trigger_id: templateTrigger,  // Allow changing the trigger
          })
          .eq("id", editingTemplate.id)

        if (error) throw error
        toast({ title: "Template updated!" })
        trackChange()
      } else {
        const { error } = await supabase.from("touchpoint_templates").insert({
          trigger_id: templateTrigger,
          title: templateTitle,
          message: templateMessage,
          is_default: existingTemplates.length === 0,
          sort_order: existingTemplates.length,
        })

        if (error) throw error
        toast({ title: "Template created!" })
        trackChange()
      }

      setShowTemplateModal(false)
      setEditingTemplate(null)
      setTemplateTitle("")
      setTemplateMessage("")
      setTemplateTrigger("")
      loadData()
    } catch (error) {
      console.error("Error saving template:", error)
      toast({
        title: "Failed to save template",
        variant: "destructive",
      })
    }
  }

  // Set default template
  const handleSetDefault = async (templateId: string) => {
    if (!selectedTrigger) return

    try {
      // First, unset all defaults for this trigger
      await supabase
        .from("touchpoint_templates")
        .update({ is_default: false })
        .eq("trigger_id", selectedTrigger.id)

      // Then set the new default
      await supabase
        .from("touchpoint_templates")
        .update({ is_default: true })
        .eq("id", templateId)

      loadData()
      toast({ title: "Default template updated!" })
      trackChange()
    } catch (error) {
      toast({
        title: "Failed to update default",
        variant: "destructive",
      })
    }
  }

  // Delete template
  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm("Are you sure you want to delete this template?")) return

    try {
      const { error } = await supabase
        .from("touchpoint_templates")
        .delete()
        .eq("id", templateId)

      if (error) throw error
      loadData()
      toast({ title: "Template deleted" })
      trackChange()
    } catch (error) {
      toast({
        title: "Failed to delete template",
        variant: "destructive",
      })
    }
  }

  // Save meeting invite
  const handleSaveMeetingInvite = async () => {
    if (!selectedTrigger || !meetingSubject.trim() || !meetingBody.trim()) {
      toast({
        title: "Please fill in all fields",
        variant: "destructive",
      })
      return
    }

    try {
      if (triggerMeetingInvite) {
        await supabase
          .from("touchpoint_meeting_invites")
          .update({ subject: meetingSubject, body: meetingBody })
          .eq("id", triggerMeetingInvite.id)
      } else {
        await supabase.from("touchpoint_meeting_invites").insert({
          trigger_id: selectedTrigger.id,
          subject: meetingSubject,
          body: meetingBody,
        })
      }

      loadData()
      toast({ title: "Meeting invite saved!" })
      trackChange()
    } catch (error) {
      toast({
        title: "Failed to save meeting invite",
        variant: "destructive",
      })
    }
  }

  // Open template modal
  const openTemplateModal = (template?: TouchpointTemplate) => {
    if (template) {
      setEditingTemplate(template)
      setTemplateTitle(template.title)
      setTemplateMessage(template.message)
      setTemplateTrigger(template.trigger_id)
    } else {
      setEditingTemplate(null)
      setTemplateTitle("")
      setTemplateMessage("")
      setTemplateTrigger(selectedTrigger?.id || "")
    }
    setShowTemplateModal(true)
  }

  // Open trigger modal
  const openTriggerModal = (trigger?: TouchpointTrigger) => {
    if (trigger) {
      setEditingTrigger(trigger)
      setTriggerLabel(trigger.trigger_label)
      setTriggerKey(trigger.trigger_key)
      setTriggerPhase(trigger.phase)
      setTriggerActionType(trigger.action_type)
      setTriggerEmoji(trigger.emoji)
      setTriggerDayStart(trigger.day_start?.toString() || "")
      setTriggerDayEnd(trigger.day_end?.toString() || "")
    } else {
      setEditingTrigger(null)
      setTriggerLabel("")
      setTriggerKey("")
      setTriggerPhase("attention")
      setTriggerActionType("text")
      setTriggerEmoji("📱")
      setTriggerDayStart("")
      setTriggerDayEnd("")
    }
    setShowTriggerModal(true)
  }

  // Save trigger
  const handleSaveTrigger = async () => {
    if (!triggerLabel.trim() || !triggerKey.trim()) {
      toast({
        title: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    try {
      const triggerData = {
        trigger_key: triggerKey,
        trigger_label: triggerLabel,
        phase: triggerPhase,
        action_type: triggerActionType,
        emoji: triggerEmoji,
        day_start: triggerDayStart ? parseInt(triggerDayStart) : null,
        day_end: triggerDayEnd ? parseInt(triggerDayEnd) : null,
        is_active: true,
      }

      if (editingTrigger) {
        const { error } = await supabase
          .from("touchpoint_triggers")
          .update(triggerData)
          .eq("id", editingTrigger.id)

        if (error) throw error
        toast({ title: "Trigger updated!" })
      } else {
        const { error } = await supabase.from("touchpoint_triggers").insert({
          ...triggerData,
          sort_order: triggers.length,
        })

        if (error) throw error
        toast({ title: "Trigger created!" })
      }

      trackChange()
      setShowTriggerModal(false)
      setEditingTrigger(null)
      loadData()
    } catch (error) {
      console.error("Error saving trigger:", error)
      toast({
        title: "Failed to save trigger",
        variant: "destructive",
      })
    }
  }

  // Delete trigger
  const handleDeleteTrigger = async (triggerId: string) => {
    const triggerTemplates = templates.filter(t => t.trigger_id === triggerId)
    if (triggerTemplates.length > 0) {
      if (!confirm(`This trigger has ${triggerTemplates.length} template(s). Deleting it will also delete all associated templates. Continue?`)) {
        return
      }
    } else if (!confirm("Are you sure you want to delete this trigger?")) {
      return
    }

    try {
      // Delete associated templates first
      await supabase
        .from("touchpoint_templates")
        .delete()
        .eq("trigger_id", triggerId)

      // Delete the trigger
      const { error } = await supabase
        .from("touchpoint_triggers")
        .delete()
        .eq("id", triggerId)

      if (error) throw error
      
      // If we deleted the selected trigger, select another one
      if (selectedTrigger?.id === triggerId) {
        const remaining = triggers.filter(t => t.id !== triggerId)
        setSelectedTrigger(remaining.length > 0 ? remaining[0] : null)
      }
      
      loadData()
      toast({ title: "Trigger deleted" })
      trackChange()
    } catch (error) {
      toast({
        title: "Failed to delete trigger",
        variant: "destructive",
      })
    }
  }

  // Load meeting invite for editing
  useEffect(() => {
    if (viewMode === "meeting" && triggerMeetingInvite) {
      setMeetingSubject(triggerMeetingInvite.subject)
      setMeetingBody(triggerMeetingInvite.body)
    } else if (viewMode === "meeting") {
      setMeetingSubject("")
      setMeetingBody("")
    }
  }, [viewMode, triggerMeetingInvite])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Touchpoint Templates</h2>
          <p className="text-gray-500 mt-1">
            Manage milestone text messages and celebration call templates
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left Sidebar - Trigger List */}
        <div className="lg:col-span-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Triggers</CardTitle>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openTriggerModal()}
                  className="h-7 text-xs"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  New
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
                {triggers.map((trigger) => (
                  <div
                    key={trigger.id}
                    className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors ${
                      selectedTrigger?.id === trigger.id
                        ? "bg-green-50 border-l-4 border-[hsl(var(--optavia-green))]"
                        : ""
                    }`}
                  >
                    <button
                      onClick={() => {
                        setSelectedTrigger(trigger)
                        setViewMode("templates")
                      }}
                      className="flex items-center gap-3 flex-1 min-w-0 text-left"
                    >
                      <span className="text-xl">{trigger.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm font-medium truncate ${
                            selectedTrigger?.id === trigger.id
                              ? "text-[hsl(var(--optavia-green))]"
                              : "text-gray-800"
                          }`}
                        >
                          {trigger.trigger_label}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Badge
                            variant="outline"
                            className={`text-xs ${
                              trigger.action_type === "call"
                                ? "bg-purple-50 text-purple-700 border-purple-200"
                                : "bg-blue-50 text-blue-700 border-blue-200"
                            }`}
                          >
                            {trigger.action_type === "call" ? (
                              <>
                                <Phone className="h-3 w-3 mr-1" />
                                Call
                              </>
                            ) : (
                              <>
                                <MessageSquare className="h-3 w-3 mr-1" />
                                Text
                              </>
                            )}
                          </Badge>
                          <span className="text-xs text-gray-400">
                            {templates.filter((t) => t.trigger_id === trigger.id).length} templates
                          </span>
                        </div>
                      </div>
                    </button>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={(e) => {
                          e.stopPropagation()
                          openTriggerModal(trigger)
                        }}
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-50"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteTrigger(trigger.id)
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Content - Templates */}
        <div className="lg:col-span-8 space-y-4">
          {selectedTrigger && (
            <>
              {/* Trigger Header */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{selectedTrigger.emoji}</span>
                      <div>
                        <h3 className="font-bold text-gray-800 text-lg">
                          {selectedTrigger.trigger_label}
                        </h3>
                        <Badge
                          variant="outline"
                          className={`text-xs ${
                            selectedTrigger.action_type === "call"
                              ? "bg-purple-50 text-purple-700 border-purple-200"
                              : "bg-blue-50 text-blue-700 border-blue-200"
                          }`}
                        >
                          {selectedTrigger.action_type === "call"
                            ? "📅 Recommend: Schedule Call"
                            : "📱 Recommend: Text Message"}
                        </Badge>
                      </div>
                    </div>
                    <Button
                      onClick={() => openTemplateModal()}
                      className="bg-[hsl(var(--optavia-green))] hover:bg-[hsl(var(--optavia-green-dark))] text-white"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Template
                    </Button>
                  </div>

                  {/* Sub-tabs for call triggers */}
                  {selectedTrigger.action_type === "call" && (
                    <div className="border-t border-gray-100 mt-4 pt-3">
                      <div className="flex gap-1">
                        <button
                          onClick={() => setViewMode("templates")}
                          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                            viewMode === "templates"
                              ? "bg-[hsl(var(--optavia-green))] text-white"
                              : "text-gray-500 hover:bg-gray-100"
                          }`}
                        >
                          📱 Text Templates
                        </button>
                        <button
                          onClick={() => setViewMode("meeting")}
                          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                            viewMode === "meeting"
                              ? "bg-[hsl(var(--optavia-green))] text-white"
                              : "text-gray-500 hover:bg-gray-100"
                          }`}
                        >
                          📧 Meeting Invite
                        </button>
                        <button
                          onClick={() => setViewMode("talking")}
                          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                            viewMode === "talking"
                              ? "bg-[hsl(var(--optavia-green))] text-white"
                              : "text-gray-500 hover:bg-gray-100"
                          }`}
                        >
                          💬 Talking Points
                        </button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Personalization Tokens */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <div className="flex items-start gap-2">
                  <span className="text-lg">💡</span>
                  <div>
                    <p className="text-amber-800 font-medium text-sm">Personalization Tokens</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {TOKENS.map((t, idx) => (
                        <button
                          key={idx}
                          onClick={() => copyToClipboard(t.token, `token-${idx}`)}
                          className="bg-white border border-amber-300 text-amber-700 text-xs px-2 py-1 rounded hover:bg-amber-100 transition-colors"
                          title={t.description}
                        >
                          {t.token}
                          {copiedId === `token-${idx}` && <span className="ml-1">✓</span>}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Templates View */}
              {viewMode === "templates" && (
                <div className="space-y-4">
                  {triggerTemplates.length === 0 ? (
                    <Card>
                      <CardContent className="py-12 text-center">
                        <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p className="text-gray-500 mb-4">No templates yet</p>
                        <Button onClick={() => openTemplateModal()}>
                          <Plus className="h-4 w-4 mr-2" />
                          Create First Template
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    triggerTemplates.map((template) => (
                      <Card
                        key={template.id}
                        className={template.is_default ? "ring-2 ring-[hsl(var(--optavia-green))]" : ""}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold text-gray-800">{template.title}</h4>
                              {template.is_default && (
                                <Badge className="bg-green-100 text-green-700 border-0">
                                  <Star className="h-3 w-3 mr-1 fill-current" />
                                  Default
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              {!template.is_default && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleSetDefault(template.id)}
                                  className="text-xs text-gray-500 hover:text-green-600"
                                >
                                  Set as default
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openTemplateModal(template)}
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteTemplate(template.id)}
                                className="text-red-500 hover:text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          <div className="bg-gray-50 rounded-lg p-4 mb-3">
                            <p className="text-gray-700 text-sm whitespace-pre-wrap">
                              {template.message}
                            </p>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-400">
                              {template.message.length} characters
                            </span>
                            <Button
                              variant={copiedId === template.id ? "default" : "outline"}
                              size="sm"
                              onClick={() => copyToClipboard(template.message, template.id)}
                              className={
                                copiedId === template.id
                                  ? "bg-green-100 text-green-700 hover:bg-green-100"
                                  : ""
                              }
                            >
                              {copiedId === template.id ? (
                                <>
                                  <Check className="h-4 w-4 mr-1" />
                                  Copied!
                                </>
                              ) : (
                                <>
                                  <Copy className="h-4 w-4 mr-1" />
                                  Copy
                                </>
                              )}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              )}

              {/* Meeting Invite View */}
              {viewMode === "meeting" && (
                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Meeting Invite Template
                    </h4>

                    <div className="space-y-4">
                      <div>
                        <Label>Subject Line</Label>
                        <Input
                          value={meetingSubject}
                          onChange={(e) => setMeetingSubject(e.target.value)}
                          placeholder="e.g., 🎉 Celebrating Your First Week!"
                        />
                      </div>

                      <div>
                        <Label>Message Body</Label>
                        <Textarea
                          value={meetingBody}
                          onChange={(e) => setMeetingBody(e.target.value)}
                          placeholder="Write your meeting invite message..."
                          rows={8}
                        />
                      </div>

                      <div className="flex gap-2">
                        <Button
                          onClick={handleSaveMeetingInvite}
                          className="bg-[hsl(var(--optavia-green))] hover:bg-[hsl(var(--optavia-green-dark))] text-white"
                        >
                          Save Meeting Invite
                        </Button>
                        {meetingSubject && (
                          <Button
                            variant="outline"
                            onClick={() => copyToClipboard(meetingBody, "meeting-body")}
                          >
                            {copiedId === "meeting-body" ? (
                              <>
                                <Check className="h-4 w-4 mr-1" />
                                Copied!
                              </>
                            ) : (
                              <>
                                <Copy className="h-4 w-4 mr-1" />
                                Copy Body
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Talking Points View */}
              {viewMode === "talking" && (
                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      💬 Celebration Call Talking Points
                    </h4>

                    {triggerTalkingPoints.length === 0 ? (
                      <p className="text-gray-500 text-sm">
                        No talking points configured for this milestone.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {triggerTalkingPoints.map((point, idx) => (
                          <div
                            key={point.id}
                            className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                          >
                            <div className="w-6 h-6 bg-[hsl(var(--optavia-green))] text-white rounded-full flex items-center justify-center text-sm font-medium shrink-0">
                              {idx + 1}
                            </div>
                            <p className="text-gray-700">{point.point}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {triggerTalkingPoints.length > 0 && (
                      <Button
                        variant="outline"
                        className="mt-4 w-full"
                        onClick={() =>
                          copyToClipboard(
                            triggerTalkingPoints.map((tp) => tp.point).join("\n"),
                            "talking-points"
                          )
                        }
                      >
                        {copiedId === "talking-points" ? (
                          <>
                            <Check className="h-4 w-4 mr-1" />
                            Copied all points!
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4 mr-1" />
                            Copy all talking points
                          </>
                        )}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </div>

      {/* Add/Edit Template Modal */}
      <Dialog open={showTemplateModal} onOpenChange={setShowTemplateModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? "Edit Template" : "Add New Template"}
            </DialogTitle>
            <DialogDescription>
              Create a message template for a trigger/milestone
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Trigger / Milestone *</Label>
              <Select value={templateTrigger} onValueChange={setTemplateTrigger}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a trigger..." />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200 shadow-lg">
                  {triggers.map((trigger) => (
                    <SelectItem key={trigger.id} value={trigger.id}>
                      {trigger.emoji} {trigger.trigger_label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Template Title *</Label>
              <Input
                value={templateTitle}
                onChange={(e) => setTemplateTitle(e.target.value)}
                placeholder="e.g., Encouraging Check-in"
              />
            </div>
            <div>
              <Label>Message *</Label>
              <Textarea
                value={templateMessage}
                onChange={(e) => setTemplateMessage(e.target.value)}
                placeholder="Type your message here... Use {firstName}, {days}, etc. for personalization"
                rows={5}
              />
              <p className="text-xs text-gray-500 mt-1">
                {templateMessage.length} characters
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTemplateModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveTemplate}
              className="bg-[hsl(var(--optavia-green))] hover:bg-[hsl(var(--optavia-green-dark))] text-white"
            >
              {editingTemplate ? "Save Changes" : "Add Template"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Trigger Modal */}
      <Dialog open={showTriggerModal} onOpenChange={setShowTriggerModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingTrigger ? "Edit Trigger" : "Create New Trigger"}
            </DialogTitle>
            <DialogDescription>
              Define when this touchpoint should be triggered
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Label *</Label>
                <Input
                  value={triggerLabel}
                  onChange={(e) => setTriggerLabel(e.target.value)}
                  placeholder="e.g., Week 1 Complete!"
                />
              </div>
              <div>
                <Label>Key *</Label>
                <Input
                  value={triggerKey}
                  onChange={(e) => setTriggerKey(e.target.value.toLowerCase().replace(/\s+/g, "_"))}
                  placeholder="e.g., week_1_complete"
                />
                <p className="text-xs text-gray-400 mt-1">Unique identifier</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Action Type *</Label>
                <Select value={triggerActionType} onValueChange={(v) => setTriggerActionType(v as "text" | "call")}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200 shadow-lg">
                    <SelectItem value="text">
                      <span className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        Text Message
                      </span>
                    </SelectItem>
                    <SelectItem value="call">
                      <span className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        Phone Call
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Emoji</Label>
                <Input
                  value={triggerEmoji}
                  onChange={(e) => setTriggerEmoji(e.target.value)}
                  placeholder="📱"
                  maxLength={4}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Day Start</Label>
                <Input
                  type="number"
                  value={triggerDayStart}
                  onChange={(e) => setTriggerDayStart(e.target.value)}
                  placeholder="e.g., 1"
                  min={1}
                />
                <p className="text-xs text-gray-400 mt-1">First day of range</p>
              </div>
              <div>
                <Label>Day End</Label>
                <Input
                  type="number"
                  value={triggerDayEnd}
                  onChange={(e) => setTriggerDayEnd(e.target.value)}
                  placeholder="e.g., 7"
                  min={1}
                />
                <p className="text-xs text-gray-400 mt-1">Last day of range</p>
              </div>
            </div>

            <div>
              <Label>Phase</Label>
              <Select value={triggerPhase} onValueChange={setTriggerPhase}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200 shadow-lg">
                  <SelectItem value="critical">Critical (Days 1-3)</SelectItem>
                  <SelectItem value="attention">Attention (Days 4-7)</SelectItem>
                  <SelectItem value="building">Building (Days 8-14)</SelectItem>
                  <SelectItem value="habit">Habit (Days 15-21)</SelectItem>
                  <SelectItem value="mastery">Mastery (Days 22-30)</SelectItem>
                  <SelectItem value="milestone">Milestone</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTriggerModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveTrigger}
              className="bg-[hsl(var(--optavia-green))] hover:bg-[hsl(var(--optavia-green-dark))] text-white"
            >
              {editingTrigger ? "Save Changes" : "Create Trigger"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Floating Save Button */}
      <AdminSaveButton
        hasUnsavedChanges={hasUnsavedChanges}
        isSaving={isSaving}
        changeCount={changeCount}
        onSave={saveChanges}
        showLeaveDialog={showLeaveDialog}
        onConfirmLeave={confirmLeave}
        onSaveAndLeave={saveAndLeave}
        onCancelLeave={cancelLeave}
      />
    </div>
  )
}
