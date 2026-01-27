import { Resend } from "resend"
import { NextRequest, NextResponse } from "next/server"
import { getEmailWrapper, getEmailHeader, getEmailFooter, getButtonStyle } from "@/lib/email-templates"
import { verifyAuth } from "@/lib/api-auth"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  // Verify authentication
  const { user, response } = await verifyAuth()
  if (response) return response

  try {
    const { to, fullName } = await request.json()

    if (!to || !fullName) {
      return NextResponse.json(
        { error: "Missing required fields: to, fullName" },
        { status: 400 }
      )
    }

    // Create email content
    const subject = `Welcome to Coaching Amplifier!`
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://www.coachingamplifier.com"
    
    const header = getEmailHeader("Welcome to Coaching Amplifier!", "Your coaching journey starts here")
    
    const bodyContent = `
      <div style="padding: 30px 20px;">
        <p style="font-size: 16px; color: #333; margin: 0 0 20px 0;">Hi ${fullName},</p>
        
        <p style="font-size: 16px; color: #333; margin: 0 0 20px 0;">
          Welcome to <strong>Coaching Amplifier</strong>! We're excited to have you join our community of coaches dedicated to amplifying their business and supporting their clients.
        </p>
        
        <div style="background-color: #e7f5e7; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #2d5016;">
          <h2 style="color: #2d5016; margin-top: 0; font-size: 20px; font-weight: bold;">What's Inside?</h2>
          <ul style="margin: 10px 0; padding-left: 20px; color: #333; font-size: 15px; line-height: 1.8;">
            <li>Step-by-step training modules for every stage of your coaching journey</li>
            <li>Client Tracker to manage touchpoints and celebrate milestones</li>
            <li>100's List and Prospect Pipeline to grow your business</li>
            <li>Calendar with team calls and events</li>
            <li>Lean & Green recipes to share with your clients</li>
            <li>Rank Calculator to track your path to the next level</li>
          </ul>
        </div>
        
        <p style="font-size: 16px; color: #333; margin: 20px 0;">Ready to get started? Click the button below to access your dashboard:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${appUrl}" style="${getButtonStyle()}">
            Go to Dashboard
          </a>
        </div>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0;">
          <h3 style="color: #2d5016; margin-top: 0; font-size: 18px; font-weight: bold;">Quick Tips to Get Started</h3>
          <div style="margin-top: 15px;">
            <p style="margin: 10px 0; font-size: 15px; color: #333;">
              <strong style="color: #2d5016;">📊 Dashboard:</strong> Your home base with quick stats, upcoming events, and personalized recommendations.
            </p>
            <p style="margin: 10px 0; font-size: 15px; color: #333;">
              <strong style="color: #2d5016;">📚 Training:</strong> Follow the guided curriculum from orientation through leadership development.
            </p>
            <p style="margin: 10px 0; font-size: 15px; color: #333;">
              <strong style="color: #2d5016;">👥 My Business:</strong> Access your Client Tracker, 100's List, Prospect Pipeline, and Rank Calculator.
            </p>
            <p style="margin: 10px 0; font-size: 15px; color: #333;">
              <strong style="color: #2d5016;">📅 Calendar:</strong> Never miss a team call or event - join directly from the app.
            </p>
            <p style="margin: 10px 0; font-size: 15px; color: #333;">
              <strong style="color: #2d5016;">🍽️ Recipes:</strong> Browse Lean & Green recipes you can share with your clients.
            </p>
          </div>
        </div>
        
        <p style="font-size: 16px; color: #333; margin: 30px 0 0 0;">
          If you have any questions or need assistance, don't hesitate to reach out. We're here to support your success!
        </p>
        
        <p style="font-size: 16px; color: #333; margin: 20px 0 0 0;">
          Best regards,<br>
          <strong>The Coaching Amplifier Team</strong>
        </p>
      </div>
    `
    
    const footer = getEmailFooter()
    
    const htmlContent = getEmailWrapper(header + bodyContent + footer, "Welcome to Coaching Amplifier")

    const textContent = `
Welcome to Coaching Amplifier!

Hi ${fullName},

Welcome to Coaching Amplifier! We're excited to have you join our community of coaches dedicated to amplifying their business and supporting their clients.

What's Inside?

• Step-by-step training modules for every stage of your coaching journey
• Client Tracker to manage touchpoints and celebrate milestones
• 100's List and Prospect Pipeline to grow your business
• Calendar with team calls and events
• Lean & Green recipes to share with your clients
• Rank Calculator to track your path to the next level

Ready to get started? Visit your dashboard: ${appUrl}

Quick Tips to Get Started:

📊 Dashboard: Your home base with quick stats, upcoming events, and personalized recommendations.

📚 Training: Follow the guided curriculum from orientation through leadership development.

👥 My Business: Access your Client Tracker, 100's List, Prospect Pipeline, and Rank Calculator.

📅 Calendar: Never miss a team call or event - join directly from the app.

🍽️ Recipes: Browse Lean & Green recipes you can share with your clients.

If you have any questions or need assistance, don't hesitate to reach out. We're here to support your success!

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

