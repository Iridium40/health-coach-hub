import { Resend } from "resend"
import { NextRequest, NextResponse } from "next/server"
import { getEmailWrapper, getEmailHeader, getEmailFooter, getButtonStyle } from "@/lib/email-templates"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const { 
      to, 
      fullName, 
      meetingTitle, 
      meetingDescription,
      meetingDate,
      meetingTime,
      durationMinutes,
      callType,
      zoomLink,
      zoomMeetingId,
      zoomPasscode,
      isRecurring,
      recurrencePattern
    } = await request.json()

    if (!to || !fullName || !meetingTitle || !meetingDate || !meetingTime) {
      return NextResponse.json(
        { error: "Missing required fields: to, fullName, meetingTitle, meetingDate, meetingTime" },
        { status: 400 }
      )
    }

    // Call type display
    const callTypeLabel = callType === "coach_only" ? "Coach Only" : "With Clients"
    const callTypeColor = callType === "coach_only" ? "#7c3aed" : "#14b8a6" // purple or teal

    // Create email content
    const subject = `📅 New Meeting Scheduled: ${meetingTitle}`
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://www.coachingamplifier.com"
    
    const header = getEmailHeader("New Meeting Scheduled", "A new meeting has been added to your calendar")
    
    // Build Zoom details section
    let zoomDetailsHtml = ""
    if (zoomLink || zoomMeetingId || zoomPasscode) {
      zoomDetailsHtml = `
        <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <h3 style="color: #1e40af; margin: 0 0 15px 0; font-size: 16px;">
            📹 Zoom Meeting Details
          </h3>
          ${zoomMeetingId ? `<p style="margin: 5px 0; font-size: 14px; color: #333;"><strong>Meeting ID:</strong> ${zoomMeetingId}</p>` : ""}
          ${zoomPasscode ? `<p style="margin: 5px 0; font-size: 14px; color: #333;"><strong>Passcode:</strong> ${zoomPasscode}</p>` : ""}
          ${zoomLink ? `
            <div style="margin-top: 15px;">
              <a href="${zoomLink}" style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold; font-size: 14px;">
                Join Zoom Meeting
              </a>
            </div>
          ` : ""}
        </div>
      `
    }
    
    const bodyContent = `
      <div style="padding: 30px 20px;">
        <p style="font-size: 16px; color: #333; margin: 0 0 20px 0;">Hi ${fullName},</p>
        
        <p style="font-size: 16px; color: #333; margin: 0 0 25px 0;">
          A new meeting has been scheduled. Here are the details:
        </p>
        
        <div style="background-color: #ffffff; border: 2px solid #2d5016; border-radius: 8px; padding: 25px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <div style="margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px solid #eee;">
            <h2 style="color: #2d5016; margin: 0 0 10px 0; font-size: 24px; font-weight: bold;">
              ${meetingTitle}
            </h2>
            <span style="background-color: ${callTypeColor}; color: white; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: bold;">
              ${callTypeLabel}
            </span>
            ${isRecurring && recurrencePattern ? `
              <span style="background-color: #6b7280; color: white; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: bold; margin-left: 8px;">
                ${recurrencePattern}
              </span>
            ` : ""}
          </div>
          
          <div style="margin-bottom: 15px;">
            <p style="margin: 8px 0; font-size: 16px; color: #333;">
              <strong style="color: #666;">📅 Date:</strong> ${meetingDate}
            </p>
            <p style="margin: 8px 0; font-size: 16px; color: #333;">
              <strong style="color: #666;">🕐 Time:</strong> ${meetingTime}
            </p>
            <p style="margin: 8px 0; font-size: 16px; color: #333;">
              <strong style="color: #666;">⏱️ Duration:</strong> ${durationMinutes} minutes
            </p>
          </div>
          
          ${meetingDescription ? `
            <div style="background-color: #f9fafb; padding: 15px; border-radius: 6px; margin-top: 15px;">
              <p style="margin: 0; font-size: 14px; color: #333; white-space: pre-wrap;">${meetingDescription}</p>
            </div>
          ` : ""}
        </div>
        
        ${zoomDetailsHtml}
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${appUrl}/calendar" style="${getButtonStyle()}">
            View in Calendar
          </a>
        </div>
        
        <div style="background-color: #f0fdf4; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #2d5016;">
          <p style="margin: 0; font-size: 14px; color: #166534;">
            <strong>💡 Tip:</strong> Add this meeting to your personal calendar using the "Add to Calendar" button in the app.
          </p>
        </div>
        
        <p style="font-size: 16px; color: #333; margin: 30px 0 0 0;">
          Best regards,<br>
          <strong>The Coaching Amplifier Team</strong>
        </p>
      </div>
    `
    
    const footer = getEmailFooter()
    
    const htmlContent = getEmailWrapper(header + bodyContent + footer, "New Meeting Scheduled")

    // Plain text version
    const textContent = `
New Meeting Scheduled

Hi ${fullName},

A new meeting has been scheduled. Here are the details:

${meetingTitle}
Type: ${callTypeLabel}
${isRecurring && recurrencePattern ? `Schedule: ${recurrencePattern}` : ""}

Date: ${meetingDate}
Time: ${meetingTime}
Duration: ${durationMinutes} minutes

${meetingDescription ? `Description: ${meetingDescription}` : ""}

${zoomLink ? `
Zoom Meeting Details:
${zoomMeetingId ? `Meeting ID: ${zoomMeetingId}` : ""}
${zoomPasscode ? `Passcode: ${zoomPasscode}` : ""}
Join: ${zoomLink}
` : ""}

View in Calendar: ${appUrl}/calendar

Tip: Add this meeting to your personal calendar using the "Add to Calendar" button in the app.

Best regards,
The Coaching Amplifier Team
    `

    // Send email using Resend
    const { data, error } = await resend.emails.send({
      from: "Coaching Amplifier <onboarding@coachingamplifier.com>",
      to: [to],
      subject: subject,
      html: htmlContent,
      text: textContent,
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
    console.error("Email sending error:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}
