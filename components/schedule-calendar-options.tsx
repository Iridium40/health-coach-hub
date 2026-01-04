"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Mail, Check, Loader2, Phone, MessageSquare } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useUserData } from "@/contexts/user-data-context"
import { sendCalendarInviteEmail } from "@/lib/email"
import { openNativeSMS, isValidUSPhoneNumber } from "@/lib/sms"
import type { CalendarEvent } from "@/lib/calendar-utils"

type InviteMethod = "email" | "sms"

interface ScheduleCalendarOptionsProps {
  event: CalendarEvent
  recipientName?: string
  recipientEmail?: string
  recipientPhone?: string
  onEmailChange?: (email: string) => void
  onPhoneChange?: (phone: string) => void
  onScheduleComplete?: () => void
  eventType?: "check-in" | "ha"
  className?: string
}

export function ScheduleCalendarOptions({
  event,
  recipientName,
  recipientEmail: initialEmail,
  recipientPhone: initialPhone,
  onEmailChange,
  onPhoneChange,
  onScheduleComplete,
  eventType = "check-in",
  className = "",
}: ScheduleCalendarOptionsProps) {
  const { toast } = useToast()
  const { profile } = useUserData()
  const [method, setMethod] = useState<InviteMethod>("email")
  const [email, setEmail] = useState(initialEmail || "")
  const [phone, setPhone] = useState(initialPhone || "")
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  // Use the coach's notification settings from their profile
  const organizerEmail = profile?.notification_email || undefined
  const organizerName = profile?.full_name || undefined

  // Update email/phone when initial values change
  useEffect(() => {
    if (initialEmail) setEmail(initialEmail)
  }, [initialEmail])

  useEffect(() => {
    if (initialPhone) setPhone(initialPhone)
  }, [initialPhone])

  const handleEmailChange = (value: string) => {
    setEmail(value)
    onEmailChange?.(value)
  }

  const handlePhoneChange = (value: string) => {
    // Only allow digits, up to 10
    const cleaned = value.replace(/\D/g, '').slice(0, 10)
    setPhone(cleaned)
    onPhoneChange?.(cleaned)
  }

  // Format phone for display
  const formatPhoneDisplay = (value: string) => {
    const cleaned = value.replace(/\D/g, '')
    if (cleaned.length <= 3) return cleaned
    if (cleaned.length <= 6) return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`
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

  // Send via SMS - opens native SMS app
  const handleSMSInvite = () => {
    if (!phone || !isValidUSPhoneNumber(phone)) {
      toast({
        title: "Valid phone number required",
        description: "Please enter a 10-digit US phone number",
        variant: "destructive",
      })
      return
    }

    // Open native SMS app with pre-filled message
    openNativeSMS({
      to: phone,
      toName: recipientName,
      fromName: organizerName,
      eventTitle: event.title,
      eventDescription: event.description,
      startDate: event.startDate.toISOString(),
      eventType: eventType,
    })

    setSent(true)
    onScheduleComplete?.()
    
    toast({
      title: "📱 SMS app opened!",
      description: "Your message is ready to send",
    })

    setTimeout(() => setSent(false), 3000)
  }

  const handleSendInvite = () => {
    if (method === "email") {
      handleEmailInvite()
    } else {
      handleSMSInvite()
    }
  }

  const isValid = method === "email" 
    ? email && organizerEmail 
    : phone && isValidUSPhoneNumber(phone)

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Method Toggle */}
      <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <button
          type="button"
          onClick={() => setMethod("email")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
            method === "email"
              ? "bg-white dark:bg-gray-700 text-purple-600 dark:text-purple-400 shadow-sm"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
          }`}
        >
          <Mail className="h-4 w-4" />
          Email
        </button>
        <button
          type="button"
          onClick={() => setMethod("sms")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
            method === "sms"
              ? "bg-white dark:bg-gray-700 text-teal-600 dark:text-teal-400 shadow-sm"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
          }`}
        >
          <MessageSquare className="h-4 w-4" />
          SMS
        </button>
      </div>

      {/* Email Input */}
      {method === "email" && (
        <div className="space-y-2">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Mail className="h-4 w-4 text-purple-500" />
            Client/Prospect Email <span className="text-red-500">*</span>
          </Label>
          <Input
            type="email"
            placeholder="email@example.com"
            value={email}
            onChange={(e) => handleEmailChange(e.target.value)}
            required
          />
          <p className="text-xs text-gray-500">
            They'll receive an email with a calendar invite attached
          </p>
          {!organizerEmail && (
            <p className="text-xs text-amber-600">
              ⚠️ Set your notification email in Settings → Notifications
            </p>
          )}
        </div>
      )}

      {/* Phone Input */}
      {method === "sms" && (
        <div className="space-y-2">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Phone className="h-4 w-4 text-teal-500" />
            Client/Prospect Phone <span className="text-red-500">*</span>
          </Label>
          <div className="flex">
            <span className="inline-flex items-center px-3 text-sm text-gray-500 bg-gray-100 border border-r-0 border-gray-300 rounded-l-md dark:bg-gray-700 dark:text-gray-400 dark:border-gray-600">
              +1
            </span>
            <Input
              type="tel"
              placeholder="(555) 555-5555"
              value={formatPhoneDisplay(phone)}
              onChange={(e) => handlePhoneChange(e.target.value)}
              className="rounded-l-none"
              maxLength={14} // Formatted: (123) 456-7890
              required
            />
          </div>
          <p className="text-xs text-gray-500">
            {phone.length === 10 ? (
              <span className="text-green-600">✓ Valid phone number</span>
            ) : (
              <>Enter 10 digits (US only)</>
            )}
          </p>
        </div>
      )}

      {/* Send Button */}
      <Button
        type="button"
        onClick={handleSendInvite}
        disabled={!isValid || sending}
        className={`w-full text-white ${
          method === "email" 
            ? "bg-purple-600 hover:bg-purple-700" 
            : "bg-teal-600 hover:bg-teal-700"
        }`}
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
        ) : method === "email" ? (
          <>
            <Mail className="h-4 w-4 mr-2" />
            Send Invite by Email
          </>
        ) : (
          <>
            <MessageSquare className="h-4 w-4 mr-2" />
            Send Invite by SMS
          </>
        )}
      </Button>
    </div>
  )
}
