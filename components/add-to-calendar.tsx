"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { CalendarPlus, Mail, MessageSquare, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useUserData } from "@/contexts/user-data-context"
import { sendCalendarInviteEmail } from "@/lib/email"
import { generateSMSUrl } from "@/lib/sms"
import type { ZoomCall } from "@/lib/types"

interface AddToCalendarProps {
  event: ZoomCall
  variant?: "default" | "outline" | "ghost"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
  showLabel?: boolean
}

export function AddToCalendar({ 
  event, 
  variant = "outline", 
  size = "sm",
  className = "",
  showLabel = true 
}: AddToCalendarProps) {
  const { toast } = useToast()
  const { profile } = useUserData()
  const [open, setOpen] = useState(false)
  const [sendingEmail, setSendingEmail] = useState(false)

  // Get coach's notification settings
  const userEmail = profile?.notification_email || profile?.email
  const userPhone = profile?.notification_phone
  const userName = profile?.full_name

  // Generate event details for email/SMS
  const eventStartDate = new Date(event.scheduled_at)
  const eventEndDate = new Date(eventStartDate.getTime() + (event.duration_minutes || 60) * 60000)

  // Build description with Zoom details
  const buildDescription = () => {
    let desc = event.description || ""
    if (event.zoom_link) {
      desc += `\n\nZoom Link: ${event.zoom_link}`
    }
    if (event.zoom_meeting_id) {
      desc += `\nMeeting ID: ${event.zoom_meeting_id}`
    }
    if (event.zoom_passcode) {
      desc += `\nPasscode: ${event.zoom_passcode}`
    }
    return desc.trim()
  }

  // Send calendar invite via email to self
  const handleEmailInvite = async () => {
    if (!userEmail) {
      toast({
        title: "No email configured",
        description: "Please set your notification email in Settings → Notifications",
        variant: "destructive",
      })
      return
    }

    setSendingEmail(true)
    setOpen(false)

    try {
      const result = await sendCalendarInviteEmail({
        to: userEmail,
        toName: userName,
        fromEmail: userEmail,
        fromName: "Coaching Amplifier",
        eventTitle: event.title,
        eventDescription: buildDescription(),
        startDate: eventStartDate.toISOString(),
        endDate: eventEndDate.toISOString(),
        eventType: "check-in", // Use check-in styling for meetings
      })

      if (result.success) {
        toast({
          title: "📧 Calendar invite sent!",
          description: `Check your email at ${userEmail}`,
        })
      } else {
        toast({
          title: "Failed to send",
          description: result.error || "Please try again",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      toast({
        title: "Failed to send",
        description: error.message || "Please try again",
        variant: "destructive",
      })
    } finally {
      setSendingEmail(false)
    }
  }

  // Send via SMS - opens native SMS app
  const handleSMSInvite = () => {
    if (!userPhone) {
      toast({
        title: "No phone configured",
        description: "Please set your notification phone in Settings → Notifications",
        variant: "destructive",
      })
      return
    }

    // Build SMS message
    const dateStr = eventStartDate.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    })
    
    // Format time with timezone info if available
    let timeStr = eventStartDate.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    })
    
    if (event.timezone) {
      const abbrevMap: Record<string, string> = {
        'America/New_York': 'ET',
        'America/Chicago': 'CT',
        'America/Denver': 'MT',
        'America/Los_Angeles': 'PT',
      }
      const originalTime = eventStartDate.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        timeZone: event.timezone
      })
      const tzAbbrev = abbrevMap[event.timezone] || event.timezone
      timeStr = `${originalTime} ${tzAbbrev}`
    }

    let message = `📅 Reminder: ${event.title}\n`
    message += `📆 ${dateStr} at ${timeStr}\n`
    message += `⏱️ ${event.duration_minutes || 60} min\n`
    
    if (event.zoom_link) {
      message += `\n🔗 ${event.zoom_link}`
    }
    if (event.zoom_meeting_id) {
      message += `\nID: ${event.zoom_meeting_id}`
    }
    if (event.zoom_passcode) {
      message += `\nPass: ${event.zoom_passcode}`
    }

    const smsUrl = generateSMSUrl(userPhone, message)
    window.open(smsUrl, '_self')
    
    setOpen(false)
    toast({
      title: "📱 SMS app opened!",
      description: "Your reminder is ready to send",
    })
  }

  return (
    <>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button 
            variant={variant} 
            size={size} 
            className={`border-[hsl(var(--optavia-green))] text-[hsl(var(--optavia-green))] hover:bg-[hsl(var(--optavia-green))] hover:text-white ${className}`}
            disabled={sendingEmail}
          >
            {sendingEmail ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CalendarPlus className="h-4 w-4" />
            )}
            {showLabel && <span className="ml-2">Add to Calendar</span>}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 bg-white">
          <DropdownMenuItem 
            onClick={handleEmailInvite} 
            className="cursor-pointer"
            disabled={!userEmail}
          >
            <Mail className="h-4 w-4 mr-2 text-purple-500" />
            <div className="flex flex-col">
              <span>Email to Me</span>
              {userEmail && (
                <span className="text-xs text-gray-500 truncate max-w-[180px]">{userEmail}</span>
              )}
            </div>
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            onClick={handleSMSInvite} 
            className="cursor-pointer"
            disabled={!userPhone}
          >
            <MessageSquare className="h-4 w-4 mr-2 text-teal-500" />
            <div className="flex flex-col">
              <span>SMS to Me</span>
              {userPhone && (
                <span className="text-xs text-gray-500">
                  +1 ({userPhone.slice(0,3)}) {userPhone.slice(3,6)}-{userPhone.slice(6)}
                </span>
              )}
            </div>
          </DropdownMenuItem>

          {(!userEmail || !userPhone) && (
            <>
              <DropdownMenuSeparator />
              <div className="px-2 py-1.5 text-xs text-amber-600">
                ⚠️ Set email/phone in Settings → Notifications
              </div>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}
