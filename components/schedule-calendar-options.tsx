"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Mail, Check, Loader2, MessageSquare, Copy } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useUserData } from "@/contexts/user-data-context"
import { sendCalendarInviteEmail } from "@/lib/email"
import type { CalendarEvent } from "@/lib/calendar-utils"

export type RecurringFrequency = "none" | "weekly" | "biweekly" | "monthly"

interface ScheduleCalendarOptionsProps {
  event: CalendarEvent
  recipientName?: string
  recipientEmail?: string
  recipientPhone?: string
  onEmailChange?: (email: string) => void
  onPhoneChange?: (phone: string) => void
  onScheduleComplete?: () => void
  eventType?: "check-in" | "ha"
  recurringFrequency?: RecurringFrequency
  className?: string
}

export function ScheduleCalendarOptions({
  event,
  recipientName,
  recipientEmail: initialEmail,
  onEmailChange,
  onScheduleComplete,
  eventType = "check-in",
  recurringFrequency = "none",
  className = "",
}: ScheduleCalendarOptionsProps) {
  const { toast } = useToast()
  const { profile } = useUserData()
  const [email, setEmail] = useState(initialEmail || "")
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [copied, setCopied] = useState(false)

  // Use the coach's notification settings from their profile
  const organizerEmail = profile?.notification_email || undefined
  const organizerName = profile?.full_name || undefined

  // Update email when initial value changes
  useEffect(() => {
    if (initialEmail) setEmail(initialEmail)
  }, [initialEmail])

  const handleEmailChange = (value: string) => {
    setEmail(value)
    onEmailChange?.(value)
  }

  // Get recurring label for display
  const getRecurringLabel = (frequency: RecurringFrequency): string => {
    switch (frequency) {
      case "weekly": return "every week"
      case "biweekly": return "every 2 weeks"
      case "monthly": return "every month"
      default: return ""
    }
  }

  // Generate the text invite message
  const generateTextInvite = () => {
    const dateStr = event.startDate.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    })
    const timeStr = event.startDate.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    })

    const eventLabel = eventType === "ha" ? "Health Assessment" : "check-in"
    const greeting = recipientName ? `Hi ${recipientName}!` : "Hi!"
    
    // Add recurring info if applicable
    const recurringInfo = recurringFrequency !== "none" 
      ? `\n🔄 Recurring ${getRecurringLabel(recurringFrequency)}`
      : ""

    return `${greeting}

I'd like to schedule a ${eventLabel} with you.

📅 ${dateStr}
⏰ ${timeStr}${recurringInfo}

Looking forward to connecting with you!

${organizerName || "Your Coach"}`
  }

  // Copy text invite to clipboard
  const handleCopyTextInvite = async () => {
    const message = generateTextInvite()
    
    try {
      await navigator.clipboard.writeText(message)
      setCopied(true)
      
      toast({
        title: "📋 Copied to clipboard!",
        description: "Paste this message into your texting app",
      })

      setTimeout(() => setCopied(false), 3000)
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please try again",
        variant: "destructive",
      })
    }
  }

  // Send via Email
  const handleEmailInvite = async () => {
    if (!email) {
      toast({
        title: "Email required",
        description: "Please enter the client/prospect email address",
        variant: "destructive",
      })
      return
    }

    if (!organizerEmail) {
      toast({
        title: "Notification email required",
        description: "Please set your notification email in Settings > Notifications first",
        variant: "destructive",
      })
      return
    }

    setSending(true)

    try {
      const result = await sendCalendarInviteEmail({
        to: email,
        toName: recipientName,
        fromEmail: organizerEmail,
        fromName: organizerName,
        eventTitle: event.title,
        eventDescription: event.description,
        startDate: event.startDate.toISOString(),
        endDate: event.endDate.toISOString(),
        eventType: eventType,
      })

      if (result.success) {
        setSent(true)
        onScheduleComplete?.()
        
        toast({
          title: "📧 Calendar invite sent!",
          description: `${recipientName || "They"} will receive the invite at ${email}`,
        })

        setTimeout(() => setSent(false), 3000)
      } else {
        toast({
          title: "Failed to send invite",
          description: result.error || "Please try again",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      toast({
        title: "Failed to send invite",
        description: error.message || "Please try again",
        variant: "destructive",
      })
    } finally {
      setSending(false)
    }
  }

  const isValidEmail = email && organizerEmail

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Email Section */}
      <div className="space-y-2">
        <Label className="text-sm font-medium flex items-center gap-2">
          <Mail className="h-4 w-4 text-purple-500" />
          Send Calendar Invite by Email
        </Label>
        <Input
          type="email"
          placeholder="email@example.com"
          value={email}
          onChange={(e) => handleEmailChange(e.target.value)}
        />
        <p className="text-xs text-gray-500">
          They'll receive an email with a calendar invite attached
        </p>
        {!organizerEmail && (
          <p className="text-xs text-amber-600">
            ⚠️ Set your notification email in Settings → Notifications
          </p>
        )}
        <Button
          type="button"
          onClick={handleEmailInvite}
          disabled={!isValidEmail || sending}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white"
        >
          {sending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Sending...
            </>
          ) : sent ? (
            <>
              <Check className="h-4 w-4 mr-2" />
              Invite Sent!
            </>
          ) : (
            <>
              <Mail className="h-4 w-4 mr-2" />
              Send Email Invite
            </>
          )}
        </Button>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 border-t border-gray-200" />
        <span className="text-xs text-gray-400 uppercase">or</span>
        <div className="flex-1 border-t border-gray-200" />
      </div>

      {/* Copy for Text Section */}
      <div className="space-y-2">
        <Label className="text-sm font-medium flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-teal-500" />
          Copy Invite for Text Message
        </Label>
        <p className="text-xs text-gray-500">
          Copy the invite message and paste it into your favorite texting app
        </p>
        <Button
          type="button"
          onClick={handleCopyTextInvite}
          variant="outline"
          className={`w-full ${copied ? "bg-teal-50 border-teal-300 text-teal-700" : "border-teal-200 text-teal-600 hover:bg-teal-50"}`}
        >
          {copied ? (
            <>
              <Check className="h-4 w-4 mr-2" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="h-4 w-4 mr-2" />
              Copy Text Invite
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
