import { Resend } from "resend"
import { NextRequest, NextResponse } from "next/server"

const resend = new Resend(process.env.RESEND_API_KEY)

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
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Coaching Amplifier Invitation</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h1 style="color: #2d5016; margin-top: 0;">Welcome to Coaching Amplifier!</h1>
          </div>
          
          <p>Hi ${fullName},</p>
          
          <p>You've been invited by ${invitedByName} to join <strong>Coaching Amplifier</strong>, your hub for coaching resources, training, and support.</p>
          
          ${coachRank ? `<p><strong>Your Coach Rank:</strong> ${coachRank}</p>` : ""}
          
          <p>Click the button below to create your account and get started:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${inviteLink}" 
               style="background-color: #2d5016; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
              Accept Invitation
            </a>
          </div>
          
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #666; font-size: 14px;">${inviteLink}</p>
          
          <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 14px;">
            This invitation link will expire in 30 days. If you didn't expect this invitation, you can safely ignore this email.
          </p>
          
          <p style="margin-top: 20px; color: #666; font-size: 14px;">
            Best regards,<br>
            The Coaching Amplifier Team
          </p>
        </body>
      </html>
    `

    const textContent = `
Welcome to Coaching Amplifier!

Hi ${fullName},

You've been invited by ${invitedByName} to join Coaching Amplifier, your hub for coaching resources, training, and support.

${coachRank ? `Your Coach Rank: ${coachRank}\n\n` : ""}
Click the link below to create your account and get started:

${inviteLink}

This invitation link will expire in 30 days. If you didn't expect this invitation, you can safely ignore this email.

Best regards,
The Coaching Amplifier Team
    `

    // Send email using Resend
    const { data, error } = await resend.emails.send({
      from: "Coaching Amplifier <onboarding@resend.dev>", // Update this with your verified domain
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

