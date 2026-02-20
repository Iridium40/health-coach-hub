import { Resend } from "resend"
import { NextRequest, NextResponse } from "next/server"
import { getEmailWrapper, getEmailHeader, getEmailFooter, getButtonStyle } from "@/lib/email-templates"

const resend = new Resend(process.env.RESEND_API_KEY)

/**
 * Generate ICS content for a calendar invite
 */
function generateICSContent(
  title: string,
  description: string,
  startDate: string, // ISO string
  endDate: string, // ISO string
  organizerEmail: string,
  organizerName: string,
  attendeeEmail: string,
  attendeeName: string
): string {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
  }
  
  const uid = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}@coachingamplifier.com`
  const now = formatDate(new Date().toISOString())
  
  const escapeICS = (str: string) => {
    return str
      .replace(/\\/g, '\\\\')
      .replace(/;/g, '\\;')
      .replace(/,/g, '\\,')
      .replace(/\n/g, '\\n')
  }
  
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Coaching Amplifier//Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:REQUEST',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${now}`,
    `DTSTART:${formatDate(startDate)}`,
    `DTEND:${formatDate(endDate)}`,
    `SUMMARY:${escapeICS(title)}`,
    `DESCRIPTION:${escapeICS(description)}`,
    `ORGANIZER;CN=${escapeICS(organizerName)}:mailto:${organizerEmail}`,
    `ATTENDEE;CUTYPE=INDIVIDUAL;ROLE=REQ-PARTICIPANT;PARTSTAT=NEEDS-ACTION;RSVP=TRUE;CN=${escapeICS(attendeeName)}:mailto:${attendeeEmail}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR'
  ]
  
  return lines.join('\r\n')
}

export async function POST(request: NextRequest) {
  try {
    const { 
      to,
      toName,
      fromEmail,
      fromName,
      eventTitle,
      eventDescription,
      startDate,
      endDate,
      eventType, // "check-in" | "ha"
    } = await request.json()

    if (!to || !fromEmail || !eventTitle || !startDate || !endDate) {
      return NextResponse.json(
        { error: "Missing required fields: to, fromEmail, eventTitle, startDate, endDate" },
        { status: 400 }
      )
    }

    // Format dates for display
    const startDateTime = new Date(startDate)
    const dateStr = startDateTime.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    })
    const timeStr = startDateTime.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    })

    // Calculate duration
    const endDateTime = new Date(endDate)
    const durationMins = Math.round((endDateTime.getTime() - startDateTime.getTime()) / 60000)

    // Generate ICS content
    const icsContent = generateICSContent(
      eventTitle,
      eventDescription || "",
      startDate,
      endDate,
      fromEmail,
      fromName || "Coach",
      to,
      toName || to.split("@")[0]
    )

    // Create email content
    const isHA = eventType === "ha"
    const subject = `📅 Calendar Invite: ${eventTitle}`
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.coachingamplifier.com"
    
    const headerTitle = isHA ? "Health Assessment Scheduled" : "Check-in Scheduled"
    const headerSubtitle = isHA 
      ? "You have a Health Assessment call scheduled" 
      : "You have a check-in scheduled"
    const header = getEmailHeader(headerTitle, headerSubtitle)
    
    const bodyContent = `
      <div style="padding: 30px 20px;">
        <p style="font-size: 16px; color: #333; margin: 0 0 20px 0;">Hi ${toName || "there"},</p>
        
        <p style="font-size: 16px; color: #333; margin: 0 0 25px 0;">
          ${isHA 
            ? `${fromName || "Your coach"} has scheduled a Health Assessment call with you!`
            : `${fromName || "Your coach"} has scheduled a check-in with you.`
          }
        </p>
        
        <div style="background-color: #ffffff; border: 2px solid #2d5016; border-radius: 8px; padding: 25px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h2 style="color: #2d5016; margin: 0 0 20px 0; font-size: 20px; font-weight: bold;">
            ${eventTitle}
          </h2>
          
          <div style="margin-bottom: 15px;">
            <p style="margin: 8px 0; font-size: 16px; color: #333;">
              <strong style="color: #666;">📅 Date:</strong> ${dateStr}
            </p>
            <p style="margin: 8px 0; font-size: 16px; color: #333;">
              <strong style="color: #666;">🕐 Time:</strong> ${timeStr}
            </p>
            <p style="margin: 8px 0; font-size: 16px; color: #333;">
              <strong style="color: #666;">⏱️ Duration:</strong> ${durationMins} minutes
            </p>
          </div>
          
          ${eventDescription ? `
            <div style="background-color: #f9fafb; padding: 15px; border-radius: 6px; margin-top: 15px;">
              <p style="margin: 0; font-size: 14px; color: #333; white-space: pre-wrap;">${eventDescription}</p>
            </div>
          ` : ""}
        </div>
        
        <div style="background-color: #f0fdf4; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #2d5016;">
          <p style="margin: 0; font-size: 14px; color: #166534;">
            <strong>📎 Calendar Invite Attached:</strong> Open the attached .ics file to add this event to your calendar (Google Calendar, Outlook, Apple Calendar, etc.)
          </p>
        </div>
        
        ${isHA ? `
          <div style="background-color: #fef3c7; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #d97706;">
            <p style="margin: 0; font-size: 14px; color: #92400e;">
              <strong>💡 What to expect:</strong> During your Health Assessment, we'll discuss your health goals, past experiences, and create a personalized plan for your journey!
            </p>
          </div>
        ` : ""}
        
        <p style="font-size: 16px; color: #333; margin: 30px 0 0 0;">
          Looking forward to connecting!<br><br>
          Best regards,<br>
          <strong>${fromName || "Your Coach"}</strong>
        </p>
      </div>
    `
    
    const footer = getEmailFooter()
    
    const htmlContent = getEmailWrapper(header + bodyContent + footer, headerTitle)

    // Plain text version
    const textContent = `
${headerTitle}

Hi ${toName || "there"},

${isHA 
  ? `${fromName || "Your coach"} has scheduled a Health Assessment call with you!`
  : `${fromName || "Your coach"} has scheduled a check-in with you.`
}

${eventTitle}
Date: ${dateStr}
Time: ${timeStr}
Duration: ${durationMins} minutes

${eventDescription || ""}

Calendar Invite Attached: Open the attached .ics file to add this event to your calendar.

${isHA ? "What to expect: During your Health Assessment, we'll discuss your health goals, past experiences, and create a personalized plan for your journey!" : ""}

Looking forward to connecting!

Best regards,
${fromName || "Your Coach"}
    `

    // Send email with ICS attachment using Resend
    const { data, error } = await resend.emails.send({
      from: `Coaching Amplifier <noreply@coachingamplifier.com>`,
      replyTo: fromEmail,
      to: [to],
      subject: subject,
      html: htmlContent,
      text: textContent,
      attachments: [
        {
          filename: `${eventTitle.replace(/[^a-z0-9]/gi, '_')}.ics`,
          content: Buffer.from(icsContent).toString('base64'),
        },
      ],
    })

    if (error) {
      console.error("Resend error:", error)
      return NextResponse.json(
        { error: error.message || "Failed to send email" },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error("Calendar invite email error:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}
