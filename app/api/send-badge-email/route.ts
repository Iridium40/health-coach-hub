import { Resend } from "resend"
import { NextRequest, NextResponse } from "next/server"
import { badgeConfig } from "@/lib/badge-config"
import { getEmailWrapper, getEmailHeader, getEmailFooter, getButtonStyle } from "@/lib/email-templates"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const { to, fullName, badgeName, badgeCategory, badgeDescription } = await request.json()

    if (!to || !fullName || !badgeName || !badgeCategory) {
      return NextResponse.json(
        { error: "Missing required fields: to, fullName, badgeName, badgeCategory" },
        { status: 400 }
      )
    }

    const badgeInfo = badgeConfig[badgeCategory] || {
      name: badgeName,
      description: badgeDescription || "Achievement unlocked!",
      emoji: "🏆",
      color: "#2d5016",
    }

    // Create email content
    const subject = `🏆 Achievement Unlocked: ${badgeInfo.name}!`
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://www.coachingamplifier.com"
    
    const header = getEmailHeader("Congratulations!", "You've earned a new achievement badge!")
    
    const bodyContent = `
      <div style="padding: 30px 20px;">
        <div style="background: linear-gradient(135deg, ${badgeInfo.color} 0%, ${badgeInfo.color}dd 100%); padding: 30px; border-radius: 12px; margin-bottom: 25px; text-align: center;">
          <div style="font-size: 64px; margin-bottom: 10px;">${badgeInfo.emoji}</div>
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">Congratulations!</h1>
          <p style="color: white; margin: 10px 0 0 0; font-size: 18px; opacity: 0.95;">You've earned a new badge!</p>
        </div>
        
        <div style="background-color: #f8f9fa; padding: 25px; border-radius: 8px; margin-bottom: 25px; border-left: 4px solid ${badgeInfo.color};">
          <h2 style="color: ${badgeInfo.color}; margin-top: 0; font-size: 24px; font-weight: bold;">
            ${badgeInfo.name}
          </h2>
          <p style="color: #666; margin: 10px 0 0 0; font-size: 16px; line-height: 1.5;">
            ${badgeDescription || `You've completed all resources in the ${badgeCategory} category!`}
          </p>
        </div>
        
        <p style="font-size: 16px; color: #333; margin: 0 0 20px 0;">Hi ${fullName},</p>
        
        <p style="font-size: 16px; color: #333; margin: 0 0 20px 0;">
          Great job! You've successfully completed all resources in the <strong>${badgeCategory}</strong> category and earned the <strong>${badgeInfo.name}</strong> badge.
        </p>
        
        <p style="font-size: 16px; color: #333; margin: 0 0 30px 0;">
          Your dedication to learning and growth is impressive. Keep up the excellent work!
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${appUrl}" style="${getButtonStyle()}">
            View Your Badges
          </a>
        </div>
        
        <div style="background-color: #e7f5e7; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #2d5016;">
          <p style="margin: 0; font-size: 14px; color: #2d5016;">
            <strong>💡 Tip:</strong> Continue completing resources to unlock more achievements and badges!
          </p>
        </div>
        
        <p style="font-size: 16px; color: #333; margin: 30px 0 0 0;">
          Best regards,<br>
          <strong>The Coaching Amplifier Team</strong>
        </p>
      </div>
    `
    
    const footer = getEmailFooter()
    
    const htmlContent = getEmailWrapper(header + bodyContent + footer, "Badge Awarded - Coaching Amplifier")

    const textContent = `
Congratulations! You've earned a new badge!

Hi ${fullName},

Great job! You've successfully completed all resources in the ${badgeCategory} category and earned the ${badgeInfo.name} badge.

${badgeDescription || `You've completed all resources in the ${badgeCategory} category!`}

Your dedication to learning and growth is impressive. Keep up the excellent work!

View your badges: ${process.env.NEXT_PUBLIC_APP_URL || "http://www.coachingamplifier.com"}

Continue completing resources to unlock more achievements and badges!

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

