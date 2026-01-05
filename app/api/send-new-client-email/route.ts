import { Resend } from "resend"
import { NextRequest, NextResponse } from "next/server"
import { getEmailWrapper, getEmailHeader, getEmailFooter, getButtonStyle } from "@/lib/email-templates"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const { to, coachName, clientName, startDate } = await request.json()

    if (!to || !coachName || !clientName) {
      return NextResponse.json(
        { error: "Missing required fields: to, coachName, clientName" },
        { status: 400 }
      )
    }

    const formattedDate = startDate 
      ? new Date(startDate).toLocaleDateString("en-US", { 
          weekday: "long", 
          month: "long", 
          day: "numeric", 
          year: "numeric" 
        })
      : "Today"

    // Create email content
    const subject = `🎉 Congratulations! New Client: ${clientName}`
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://www.coachingamplifier.com"
    
    const header = getEmailHeader("Congratulations!", "You just changed someone's life!")
    
    const bodyContent = `
      <div style="padding: 30px 20px;">
        <div style="background: linear-gradient(135deg, #00A651 0%, #2d5016 100%); padding: 40px 30px; border-radius: 12px; margin-bottom: 25px; text-align: center;">
          <div style="font-size: 72px; margin-bottom: 15px;">🎉</div>
          <h1 style="color: white; margin: 0; font-size: 32px; font-weight: bold;">Congratulations!</h1>
          <p style="color: white; margin: 15px 0 0 0; font-size: 20px; opacity: 0.95;">You're changing lives!</p>
        </div>
        
        <div style="background-color: #f0fdf4; padding: 25px; border-radius: 8px; margin-bottom: 25px; border-left: 4px solid #00A651; text-align: center;">
          <p style="color: #166534; margin: 0; font-size: 18px; font-weight: bold;">
            🌟 New Client Added 🌟
          </p>
          <h2 style="color: #00A651; margin: 15px 0 5px 0; font-size: 28px; font-weight: bold;">
            ${clientName}
          </h2>
          <p style="color: #166534; margin: 0; font-size: 16px;">
            Starting: ${formattedDate}
          </p>
        </div>
        
        <p style="font-size: 16px; color: #333; margin: 0 0 20px 0;">Hi ${coachName},</p>
        
        <p style="font-size: 16px; color: #333; margin: 0 0 20px 0;">
          <strong>This is a big deal!</strong> You've just helped someone take the first step toward optimal health. ${clientName} trusted you to guide them on this journey, and that's something to celebrate!
        </p>
        
        <p style="font-size: 16px; color: #333; margin: 0 0 20px 0;">
          Every client you help is a life transformed. You're not just building a business — you're creating a ripple effect of health and wellness that will impact families and communities.
        </p>
        
        <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #f59e0b;">
          <p style="margin: 0 0 10px 0; font-size: 16px; color: #92400e; font-weight: bold;">
            💡 Quick Tips for a Great Start:
          </p>
          <ul style="margin: 0; padding-left: 20px; color: #92400e; font-size: 14px; line-height: 1.8;">
            <li>Reach out within 24 hours to welcome your new client</li>
            <li>Schedule your first check-in call</li>
            <li>Share helpful resources from your Training section</li>
            <li>Set expectations and build that relationship!</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${appUrl}/client-tracker" style="${getButtonStyle()}">
            View Your Clients
          </a>
        </div>
        
        <div style="background-color: #e7f5e7; padding: 20px; border-radius: 6px; margin: 20px 0; text-align: center;">
          <p style="margin: 0; font-size: 18px; color: #2d5016; font-weight: bold;">
            🌱 Remember: Every journey starts with a single step.
          </p>
          <p style="margin: 10px 0 0 0; font-size: 14px; color: #2d5016;">
            You just helped ${clientName} take theirs!
          </p>
        </div>
        
        <p style="font-size: 16px; color: #333; margin: 30px 0 0 0;">
          Keep up the amazing work!<br><br>
          <strong>The Coaching Amplifier Team</strong>
        </p>
      </div>
    `
    
    const footer = getEmailFooter()
    
    const htmlContent = getEmailWrapper(header + bodyContent + footer, "New Client Celebration - Coaching Amplifier")

    const textContent = `
🎉 Congratulations! You're changing lives!

Hi ${coachName},

This is a big deal! You've just helped someone take the first step toward optimal health.

NEW CLIENT: ${clientName}
Starting: ${formattedDate}

${clientName} trusted you to guide them on this journey, and that's something to celebrate!

Every client you help is a life transformed. You're not just building a business — you're creating a ripple effect of health and wellness that will impact families and communities.

Quick Tips for a Great Start:
• Reach out within 24 hours to welcome your new client
• Schedule your first check-in call
• Share helpful resources from your Training section
• Set expectations and build that relationship!

View your clients: ${appUrl}/client-tracker

Remember: Every journey starts with a single step. You just helped ${clientName} take theirs!

Keep up the amazing work!
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
