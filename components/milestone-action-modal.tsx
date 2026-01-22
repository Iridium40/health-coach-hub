"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { useTouchpointTemplates, type TouchpointTriggerWithData } from "@/hooks/use-touchpoint-templates"
import { useUserData } from "@/contexts/user-data-context"
import {
  Copy,
  Check,
  MessageSquare,
  Calendar,
  Phone,
  Star,
  Loader2,
  Lightbulb,
} from "lucide-react"
import { ClientContextualResources } from "@/components/resources"

interface MilestoneActionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  clientLabel: string
  programDay: number
  onScheduleClick?: () => void // Opens the schedule modal
  onTextSent?: () => void // Callback after text is copied
}

export function MilestoneActionModal({
  open,
  onOpenChange,
  clientLabel,
  programDay,
  onScheduleClick,
  onTextSent,
}: MilestoneActionModalProps) {
  const { toast } = useToast()
  const { profile } = useUserData()
  const { triggers, loading, getTrigger, personalizeMessage } = useTouchpointTemplates()

  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"templates" | "meeting" | "talking" | "resources">("templates")

  // Get the trigger for this day
  const trigger = getTrigger(programDay)

  // Reset tab when trigger changes
  useEffect(() => {
    setActiveTab("templates")
  }, [trigger?.id])

  // Get first name from label (assume format "First Last" or just "First")
  const firstName = clientLabel.split(" ")[0]
  const coachName = profile?.full_name?.split(" ")[0] || "Your Coach"

  // Calculate next milestone
  const getNextMilestone = (day: number): number => {
    if (day < 7) return 7
    if (day < 14) return 14
    if (day < 21) return 21
    if (day < 30) return 30
    return day + 30 // Next month milestone
  }

  const copyToClipboard = async (text: string, id: string) => {
    const personalizedText = personalizeMessage(text, {
      firstName,
      days: programDay,
      coachName,
      nextMilestone: getNextMilestone(programDay),
    })

    try {
      await navigator.clipboard.writeText(personalizedText)
      setCopiedId(id)
      toast({
        title: "Copied!",
        description: "Text copied to clipboard. Paste it in your messaging app.",
      })
      setTimeout(() => setCopiedId(null), 2000)
      onTextSent?.()
    } catch {
      toast({
        title: "Copy failed",
        description: "Please select and copy the text manually",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader className="sr-only">
            <DialogTitle>Loading milestone details</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  if (!trigger) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Day {programDay} - No Template</DialogTitle>
            <DialogDescription>
              No touchpoint template configured for this day.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    )
  }

  const isMilestone = trigger.phase === "milestone"
  const isCallRecommended = trigger.action_type === "call"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader className="pb-2">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{trigger.emoji}</span>
            <div>
              <DialogTitle className="text-lg">{trigger.trigger_label}</DialogTitle>
              <DialogDescription className="flex items-center gap-2 mt-1">
                <span>for {clientLabel}</span>
                {isMilestone && (
                  <Badge className="bg-amber-100 text-amber-700 border-0">
                    <Star className="h-3 w-3 mr-1 fill-current" />
                    Milestone!
                  </Badge>
                )}
              </DialogDescription>
            </div>
          </div>

          {/* Recommendation Badge */}
          <div className="mt-3">
            <Badge
              variant="outline"
              className={
                isCallRecommended
                  ? "bg-purple-50 text-purple-700 border-purple-200"
                  : "bg-blue-50 text-blue-700 border-blue-200"
              }
            >
              {isCallRecommended ? (
                <>
                  <Phone className="h-3 w-3 mr-1" />
                  Recommended: Schedule a celebration call!
                </>
              ) : (
                <>
                  <MessageSquare className="h-3 w-3 mr-1" />
                  Recommended: Send a text message
                </>
              )}
            </Badge>
          </div>
        </DialogHeader>

        {/* Tabs for call triggers */}
        {isCallRecommended ? (
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="flex-1 overflow-hidden flex flex-col">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="templates" className="text-xs">
                📱 Text
              </TabsTrigger>
              <TabsTrigger value="meeting" className="text-xs">
                📧 Meeting
              </TabsTrigger>
              <TabsTrigger value="talking" className="text-xs">
                💬 Points
              </TabsTrigger>
              <TabsTrigger value="resources" className="text-xs">
                💡 Resources
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto mt-4">
              <TabsContent value="templates" className="mt-0 space-y-3">
                {trigger.templates.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-4">No templates available</p>
                ) : (
                  trigger.templates.map((template) => (
                    <TemplateCard
                      key={template.id}
                      template={template}
                      personalizedMessage={personalizeMessage(template.message, {
                        firstName,
                        days: programDay,
                        coachName,
                        nextMilestone: getNextMilestone(programDay),
                      })}
                      copied={copiedId === template.id}
                      onCopy={() => copyToClipboard(template.message, template.id)}
                    />
                  ))
                )}
              </TabsContent>

              <TabsContent value="meeting" className="mt-0">
                {trigger.meetingInvite ? (
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Subject</label>
                      <div className="bg-gray-50 rounded-lg p-3 mt-1 border">
                        <p className="text-sm">
                          {personalizeMessage(trigger.meetingInvite.subject, {
                            firstName,
                            days: programDay,
                            coachName,
                          })}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-1 h-7 text-xs"
                        onClick={() => copyToClipboard(trigger.meetingInvite!.subject, "subject")}
                      >
                        {copiedId === "subject" ? (
                          <>
                            <Check className="h-3 w-3 mr-1" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3 mr-1" />
                            Copy subject
                          </>
                        )}
                      </Button>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-600">Message Body</label>
                      <div className="bg-gray-50 rounded-lg p-3 mt-1 border max-h-[200px] overflow-y-auto">
                        <pre className="whitespace-pre-wrap font-sans text-sm text-gray-700">
                          {personalizeMessage(trigger.meetingInvite.body, {
                            firstName,
                            days: programDay,
                            coachName,
                          })}
                        </pre>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-1 h-7 text-xs"
                        onClick={() => copyToClipboard(trigger.meetingInvite!.body, "body")}
                      >
                        {copiedId === "body" ? (
                          <>
                            <Check className="h-3 w-3 mr-1" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3 mr-1" />
                            Copy message
                          </>
                        )}
                      </Button>
                    </div>

                    {onScheduleClick && (
                      <Button
                        onClick={() => {
                          onOpenChange(false)
                          onScheduleClick()
                        }}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                      >
                        <Calendar className="h-4 w-4 mr-2" />
                        Schedule Celebration Call
                      </Button>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm text-center py-4">
                    No meeting template configured
                  </p>
                )}
              </TabsContent>

              <TabsContent value="talking" className="mt-0">
                {trigger.talkingPoints.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-4">
                    No talking points configured
                  </p>
                ) : (
                  <div className="space-y-2">
                    {trigger.talkingPoints.map((point, idx) => (
                      <div
                        key={point.id}
                        className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="w-6 h-6 bg-[hsl(var(--optavia-green))] text-white rounded-full flex items-center justify-center text-sm font-medium shrink-0">
                          {idx + 1}
                        </div>
                        <p className="text-sm text-gray-700">{point.point}</p>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      className="w-full mt-2"
                      onClick={() =>
                        copyToClipboard(
                          trigger.talkingPoints.map((tp) => `${trigger.talkingPoints.indexOf(tp) + 1}. ${tp.point}`).join("\n"),
                          "talking-all"
                        )
                      }
                    >
                      {copiedId === "talking-all" ? (
                        <>
                          <Check className="h-4 w-4 mr-1" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 mr-1" />
                          Copy all points
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="resources" className="mt-0">
                <ClientContextualResources
                  programDay={programDay}
                  clientName={clientLabel}
                  compact
                />
              </TabsContent>
            </div>
          </Tabs>
        ) : (
          /* Text-only triggers */
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="flex-1 overflow-hidden flex flex-col">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="templates" className="text-xs">
                📱 Text Templates
              </TabsTrigger>
              <TabsTrigger value="resources" className="text-xs">
                💡 Resources
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto mt-4">
              <TabsContent value="templates" className="mt-0 space-y-3">
                {trigger.templates.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-4">No templates available</p>
                ) : (
                  trigger.templates.map((template) => (
                    <TemplateCard
                      key={template.id}
                      template={template}
                      personalizedMessage={personalizeMessage(template.message, {
                        firstName,
                        days: programDay,
                        coachName,
                        nextMilestone: getNextMilestone(programDay),
                      })}
                      copied={copiedId === template.id}
                      onCopy={() => copyToClipboard(template.message, template.id)}
                    />
                  ))
                )}
              </TabsContent>

              <TabsContent value="resources" className="mt-0">
                <ClientContextualResources
                  programDay={programDay}
                  clientName={clientLabel}
                  compact
                />
              </TabsContent>
            </div>
          </Tabs>
        )}

        {/* Tip */}
        <div className="mt-4 p-3 bg-gray-100 rounded-lg text-xs text-gray-600 shrink-0">
          <strong>Tip:</strong> Copy the text, paste it into your messaging app, and personalize it before sending!
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Template card component
function TemplateCard({
  template,
  personalizedMessage,
  copied,
  onCopy,
}: {
  template: { id: string; title: string; is_default: boolean }
  personalizedMessage: string
  copied: boolean
  onCopy: () => void
}) {
  return (
    <div
      className={`border rounded-lg overflow-hidden ${
        template.is_default ? "ring-2 ring-[hsl(var(--optavia-green))]" : ""
      }`}
    >
      <div className="px-3 py-2 bg-gray-50 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm text-gray-800">{template.title}</span>
          {template.is_default && (
            <Badge className="bg-green-100 text-green-700 border-0 text-xs">
              <Star className="h-2.5 w-2.5 mr-0.5 fill-current" />
              Default
            </Badge>
          )}
        </div>
      </div>
      <div className="p-3">
        <pre className="whitespace-pre-wrap font-sans text-sm text-gray-700 leading-relaxed">
          {personalizedMessage}
        </pre>
      </div>
      <div className="px-3 py-2 bg-gray-50 border-t flex items-center justify-between">
        <span className="text-xs text-gray-400">{personalizedMessage.length} chars</span>
        <Button
          onClick={onCopy}
          size="sm"
          className={
            copied
              ? "bg-green-100 text-green-700 hover:bg-green-100"
              : "bg-[hsl(var(--optavia-green))] hover:bg-[hsl(var(--optavia-green-dark))] text-white"
          }
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 mr-1" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5 mr-1" />
              Copy
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
