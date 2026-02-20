import { Resend } from "resend"
import { NextRequest, NextResponse } from "next/server"
import { getModuleCompletionEmailTemplate } from "@/lib/email-templates"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const {
      to,
      fullName,
      completedModuleTitle,
      completedModuleNumber,
      unlockedModuleTitle,
      unlockedModuleNumber,
      unlockedModuleRank
    } = await request.json()

    if (!to || !fullName || !completedModuleTitle || !completedModuleNumber) {
      return NextResponse.json(
        { error: "Missing required fields: to, fullName, completedModuleTitle, completedModuleNumber" },
        { status: 400 }
      )
    }

    // Generate email content
    const { subject, html, text } = getModuleCompletionEmailTemplate({
      fullName,
      completedModuleTitle,
      completedModuleNumber,
      unlockedModuleTitle,
      unlockedModuleNumber,
      unlockedModuleRank
    })

    // Send email using Resend
    const { data, error } = await resend.emails.send({
      from: "Coaching Amplifier <noreply@coachingamplifier.com>",
      to: [to],
      subject: subject,
      html: html,
      text: text,
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
