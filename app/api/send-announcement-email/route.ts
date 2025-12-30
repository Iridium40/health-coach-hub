import { Resend } from "resend"
import { NextRequest, NextResponse } from "next/server"
import { getEmailWrapper, getEmailHeader, getEmailFooter, getButtonStyle } from "@/lib/email-templates"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const { to, fullName, announcementTitle, announcementContent, priority } = await request.json()

    if (!to || !fullName || !announcementTitle || !announcementContent) {
      return NextResponse.json(
        { error: "Missing required fields: to, fullName, announcementTitle, announcementContent" },
        { status: 400 }
      )
    }

    // Priority color mapping
    const priorityColors: Record<string, string> = {
      low: "#6b7280", // gray
      normal: "#2d5016", // green
      high: "#f59e0b", // amber
      urgent: "#ef4444", // red
    }

    const priorityLabels: Record<string, string> = {
      low: "Low Priority",
      normal: "Normal Priority",
      high: "High Priority",
      urgent: "Urgent",
    }

    const priorityColor = priorityColors[priority] || priorityColors.normal
    const priorityLabel = priorityLabels[priority] || priorityLabels.normal

    // Create email content
    const subject = `Announcement: ${announcementTitle}`
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://www.coachingamplifier.com"
    
    const header = getEmailHeader("New Announcement", "Important update from Coaching Amplifier")
    
    const bodyContent = `
      <div style="padding: 30px 20px;">
        <p style="font-size: 16px; color: #333; margin: 0 0 20px 0;">Hi ${fullName},</p>
        
        <p style="font-size: 16px; color: #333; margin: 0 0 25px 0;">
          We have an important announcement to share with you:
        </p>
        
        <div style="background-color: #ffffff; border: 2px solid ${priorityColor}; border-radius: 8px; padding: 25px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px solid #eee;">
            <h2 style="color: ${priorityColor}; margin: 0; font-size: 24px; font-weight: bold;">
              ${announcementTitle}
            </h2>
            <span style="background-color: ${priorityColor}; color: white; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: bold; text-transform: uppercase;">
              ${priorityLabel}
            </span>
          </div>
          
          <div style="color: #333; font-size: 16px; line-height: 1.6; white-space: pre-wrap;">
            ${announcementContent}
          </div>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${appUrl}" style="${getButtonStyle()}">
            View in App
          </a>
        </div>
        
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid ${priorityColor};">
          <p style="margin: 0; font-size: 14px; color: #666;">
            <strong>Note:</strong> This announcement is also available in your Coaching Amplifier dashboard. You can view all announcements and manage your notification preferences in your account settings.
          </p>
        </div>
        
        <p style="font-size: 16px; color: #333; margin: 30px 0 0 0;">
          Best regards,<br>
          <strong>The Coaching Amplifier Team</strong>
        </p>
      </div>
    `
    
    const footer = getEmailFooter()
    
    const htmlContent = getEmailWrapper(header + bodyContent + footer, "Coaching Amplifier Announcement")

    const textContent = `
New Announcement from Coaching Amplifier

Hi ${fullName},

We have an important announcement to share with you:

${priorityLabel.toUpperCase()}: ${announcementTitle}

${announcementContent}

View this announcement in the app: ${appUrl}

Note: This announcement is also available in your Coaching Amplifier dashboard. You can view all announcements and manage your notification preferences in your account settings.

Best regards,
The Coaching Amplifier Team
    `

    // Send email using Resend
    const { data, error } = await resend.emails.send({
      from: "Coaching Amplifier <onboarding@coachingamplifier.com>", // Update this with your verified domain
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

