import { NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"
import { createClient } from "@supabase/supabase-js"
import { getHealthAssessmentEmailTemplate } from "@/lib/email-templates"

const resend = new Resend(process.env.RESEND_API_KEY)

// Use service role key for database operations (bypasses RLS, but we validate user_id matches)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      to,
      userId,
      coachName,
      clientName,
      clientPhone,
      clientWhy,
      clientCommitment,
      callOutcome,
      callNotes,
      checkedItems,
      notes,
      timerSeconds,
      progress,
      phaseProgress,
    } = body

    if (!to || !coachName || !userId) {
      return NextResponse.json(
        { error: "Missing required fields: to, userId, and coachName are required" },
        { status: 400 }
      )
    }

    if (!callOutcome) {
      return NextResponse.json(
        { error: "Call outcome is required" },
        { status: 400 }
      )
    }

    const emailTemplate = getHealthAssessmentEmailTemplate({
      coachName,
      clientName: clientName || "Client",
      clientPhone,
      clientWhy,
      clientCommitment,
      callOutcome: callOutcome || "not-provided",
      callNotes,
      checkedItems: checkedItems || [],
      notes: notes || {},
      timerSeconds: timerSeconds || 0,
      progress: progress || 0,
      phaseProgress: phaseProgress || [],
    })

    // Save to database first
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    const { error: dbError } = await supabase
      .from("health_assessments")
      .insert({
        user_id: userId,
        client_name: clientName || null,
        client_phone: clientPhone || null,
        client_why: clientWhy || null,
        client_commitment: clientCommitment || null,
        call_outcome: callOutcome,
        timer_seconds: timerSeconds || 0,
        progress: progress || 0,
        call_notes: callNotes || null,
      })

    if (dbError) {
      console.error("Database error:", dbError)
      // Continue to send email even if database save fails
      // But log the error for monitoring
    }

    // Send email
    const { data, error } = await resend.emails.send({
      from: "Coaching Amplifier <noreply@coachingamplifier.com>",
      to: [to],
      subject: emailTemplate.subject,
      html: emailTemplate.html,
      text: emailTemplate.text,
    })

    if (error) {
      console.error("Resend error:", error)
      return NextResponse.json(
        { error: "Failed to send email", details: error },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      data,
      savedToDatabase: !dbError 
    })
  } catch (error) {
    console.error("Error sending health assessment email:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
