import { Resend } from "resend"
import { NextRequest, NextResponse } from "next/server"
import { getEmailWrapper, getEmailHeader, getEmailFooter, getButtonStyle } from "@/lib/email-templates"

const resend = new Resend(process.env.RESEND_API_KEY)

// Resend Segment ID for Coaching Amplifier audience tracking
const RESEND_SEGMENT_ID = process.env.RESEND_SEGMENT_ID

/**
 * Add contact to Resend segment for marketing purposes
 */
async function addContactToResendSegment(email: string): Promise<void> {
  try {
    if (!RESEND_SEGMENT_ID) {
      return
    }

    // Add contact to segment using the SDK's built-in method
    const { data: segmentData, error: segmentError } = await resend.contacts.segments.add({
      email: email,
      segmentId: RESEND_SEGMENT_ID,
    })

    if (segmentError) {
      console.warn(`Failed to add ${email} to segment:`, segmentError.message)
      return
    }

    console.log(`Added ${email} to Coaching Amplifier segment`, segmentData)
  } catch (error: any) {
    console.warn(`Failed to add ${email} to segment:`, error.message)
  }
}

export async function POST(request: NextRequest) {
  try {
    const { to, fullName, coachRank, inviteLink, invitedBy } = await request.json()

    if (!to || !fullName || !inviteLink) {
      return NextResponse.json(
        { error: "Missing required fields: to, fullName, inviteLink" },
        { status: 400 }
      )
    }

    // Get the invitedBy name from the request or use a default
    const invitedByName = invitedBy || "an admin"

    // Create email content
    const subject = `You're Invited to Join Coaching Amplifier`
    
    const header = getEmailHeader("Welcome to Coaching Amplifier!", "Your invitation awaits")
    
    const bodyContent = `
      <div style="padding: 30px 20px;">
        <p style="font-size: 16px; color: #333; margin: 0 0 20px 0;">Hi ${fullName},</p>
        
        <p style="font-size: 16px; color: #333; margin: 0 0 20px 0;">
          You've been invited by <strong>${invitedByName}</strong> to join <strong>Coaching Amplifier</strong>, your hub for coaching resources, training, and support.
        </p>
        
        ${coachRank ? `
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #2d5016;">
            <p style="margin: 0; font-size: 15px; color: #333;">
              <strong style="color: #2d5016;">Your Coach Rank:</strong> ${coachRank}
            </p>
          </div>
        ` : ""}
        
        <p style="font-size: 16px; color: #333; margin: 20px 0;">Click the button below to set your password and create your account:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${inviteLink}" style="${getButtonStyle()}">
            Set Password & Create Account
          </a>
        </div>
        
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 6px; margin: 20px 0;">
          <p style="margin: 0 0 10px 0; font-size: 14px; color: #666; font-weight: bold;">Or copy and paste this link:</p>
          <p style="word-break: break-all; color: #2d5016; font-size: 13px; margin: 0; font-family: monospace;">${inviteLink}</p>
        </div>
        
        <div style="background-color: #fff3cd; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #ffc107;">
          <p style="margin: 0; font-size: 14px; color: #856404;">
            <strong>Note:</strong> This invitation link will expire in 14 days. After setting your password, you can sign in to access Coaching Amplifier.
          </p>
        </div>
        
        <p style="font-size: 16px; color: #333; margin: 30px 0 0 0;">
          Best regards,<br>
          <strong>The Coaching Amplifier Team</strong>
        </p>
      </div>
    `
    
    const footer = getEmailFooter()
    
    const htmlContent = getEmailWrapper(header + bodyContent + footer, "Coaching Amplifier Invitation")

    const textContent = `
Welcome to Coaching Amplifier!

Hi ${fullName},

You've been invited by ${invitedByName} to join Coaching Amplifier, your hub for coaching resources, training, and support.

${coachRank ? `Your Coach Rank: ${coachRank}\n\n` : ""}
Click the link below to set your password and create your account:

${inviteLink}

This invitation link will expire in 14 days. After setting your password, you can sign in to access Coaching Amplifier.

Best regards,
The Coaching Amplifier Team
    `

    // Send email using Resend (disable click tracking so invite links go directly to our app)
    const { data, error } = await resend.emails.send({
      from: "Coaching Amplifier <noreply@coachingamplifier.com>",
      to: [to],
      subject: subject,
      html: htmlContent,
      text: textContent,
      headers: {
        "X-Entity-Ref-ID": inviteLink, // Prevents link rewriting
      },
    })

    if (error) {
      console.error("Resend error:", error)
      return NextResponse.json(
        { error: error.message || "Failed to send email" },
        { status: 500 }
      )
    }

    // Add contact to Resend segment for marketing/audience tracking
    await addContactToResendSegment(to)

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error("Email sending error:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}

