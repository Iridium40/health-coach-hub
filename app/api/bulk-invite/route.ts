import { Resend } from "resend"
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { generateInviteKey, createInviteLink } from "@/lib/invites"
import { getEmailWrapper, getEmailHeader, getEmailFooter, getButtonStyle } from "@/lib/email-templates"

const resend = new Resend(process.env.RESEND_API_KEY)

// Resend Segment ID for Coaching Amplifier audience tracking
const RESEND_SEGMENT_ID = process.env.RESEND_SEGMENT_ID

// Default coach rank for all invited coaches
const DEFAULT_COACH_RANK = "IPD"

interface BulkInviteEntry {
  full_name: string
  email: string
  coach_rank?: string // Optional, defaults to IPD
}

interface InviteResult {
  email: string
  full_name: string
  success: boolean
  error?: string
}

// Throttle delay between emails (ms) to respect Resend rate limits
// Resend allows 2 requests/second, so we need 500ms+ between emails
const EMAIL_THROTTLE_DELAY = 550

/**
 * Sleep helper for throttling
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Add contact to Resend segment for marketing purposes
 * This allows tracking Coaching Amplifier contacts in 3rd party marketing tools
 */
async function addContactToResendSegment(
  email: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Skip if segment ID is not configured
    if (!RESEND_SEGMENT_ID) {
      console.log("Resend segment not configured, skipping contact addition")
      return { success: true }
    }

    // Add contact to segment using the SDK's built-in method
    const { data: segmentData, error: segmentError } = await resend.contacts.segments.add({
      email: email,
      segmentId: RESEND_SEGMENT_ID,
    })

    if (segmentError) {
      console.warn(`Failed to add ${email} to segment:`, segmentError.message)
      // Don't fail the invite if segment addition fails
      return { success: true }
    }

    console.log(`Successfully added ${email} to Coaching Amplifier segment`, segmentData)
    return { success: true }

  } catch (error: any) {
    console.error(`Error adding contact ${email} to segment:`, error.message)
    // Don't fail the invite process if segment addition fails
    return { success: true }
  }
}

/**
 * Validate a single invite entry
 */
function validateEntry(entry: BulkInviteEntry): string | null {
  if (!entry.full_name || entry.full_name.trim().length === 0) {
    return "Full name is required"
  }
  
  if (!entry.email || entry.email.trim().length === 0) {
    return "Email is required"
  }
  
  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(entry.email.trim())) {
    return "Invalid email format"
  }
  
  return null
}

/**
 * Generate invite email HTML content
 */
function generateInviteEmailContent(
  fullName: string,
  coachRank: string,
  inviteLink: string,
  invitedByName: string
): { subject: string; html: string; text: string } {
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
          <strong>Note:</strong> This invitation link will expire in 30 days. After setting your password, you can sign in to access Coaching Amplifier.
        </p>
      </div>
      
      <p style="font-size: 16px; color: #333; margin: 30px 0 0 0;">
        Best regards,<br>
        <strong>The Coaching Amplifier Team</strong>
      </p>
    </div>
  `
  
  const footer = getEmailFooter()
  const html = getEmailWrapper(header + bodyContent + footer, "Coaching Amplifier Invitation")

  const text = `
Welcome to Coaching Amplifier!

Hi ${fullName},

You've been invited by ${invitedByName} to join Coaching Amplifier, your hub for coaching resources, training, and support.

${coachRank ? `Your Coach Rank: ${coachRank}\n\n` : ""}
Click the link below to set your password and create your account:

${inviteLink}

This invitation link will expire in 30 days. After setting your password, you can sign in to access Coaching Amplifier.

Best regards,
The Coaching Amplifier Team
  `

  return { subject, html, text }
}

/**
 * POST /api/bulk-invite
 * Process bulk invites from CSV data
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Verify user is authenticated and is an admin
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }
    
    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("user_role, full_name")
      .eq("id", user.id)
      .single()
    
    if (profileError || profile?.user_role?.toLowerCase() !== "admin") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      )
    }
    
    const invitedByName = profile.full_name || user.email || "an admin"
    
    // Parse request body
    const body = await request.json()
    const { entries } = body as { entries: BulkInviteEntry[] }
    
    if (!entries || !Array.isArray(entries) || entries.length === 0) {
      return NextResponse.json(
        { error: "No entries provided" },
        { status: 400 }
      )
    }
    
    // Limit batch size to prevent timeout
    if (entries.length > 100) {
      return NextResponse.json(
        { error: "Maximum 100 invites per batch. Please split your CSV into smaller files." },
        { status: 400 }
      )
    }
    
    const results: InviteResult[] = []
    
    // Process each entry sequentially with throttling
    for (const entry of entries) {
      const fullName = entry.full_name?.trim() || ""
      const email = entry.email?.trim().toLowerCase() || ""
      const coachRank = entry.coach_rank?.trim() || DEFAULT_COACH_RANK
      
      // Validate entry
      const validationError = validateEntry({ full_name: fullName, email, coach_rank: coachRank })
      if (validationError) {
        results.push({
          email,
          full_name: fullName,
          success: false,
          error: validationError
        })
        continue
      }
      
      try {
        // Check if email already has an active invite
        const { data: existingInvite } = await supabase
          .from("invites")
          .select("id")
          .eq("invited_email", email)
          .eq("is_active", true)
          .maybeSingle()
        
        if (existingInvite) {
          results.push({
            email,
            full_name: fullName,
            success: false,
            error: "An active invite already exists for this email"
          })
          continue
        }
        
        // Check if user already exists with this email
        const { data: existingProfile } = await supabase
          .from("profiles")
          .select("id")
          .eq("email", email)
          .maybeSingle()
        
        if (existingProfile) {
          results.push({
            email,
            full_name: fullName,
            success: false,
            error: "A user with this email already exists"
          })
          continue
        }
        
        // Generate invite
        const inviteKey = generateInviteKey()
        const expiresAt = new Date()
        expiresAt.setDate(expiresAt.getDate() + 30) // 30 days expiration
        
        // Create invite record (is_bulk_invite = true means no sponsor_id will be set)
        const { data: inviteData, error: insertError } = await supabase
          .from("invites")
          .insert({
            invite_key: inviteKey,
            invited_by: user.id,
            invited_email: email,
            invited_full_name: fullName,
            coach_rank: coachRank,
            expires_at: expiresAt.toISOString(),
            is_active: true,
            email_status: "sent",
            is_bulk_invite: true,
          })
          .select("id")
          .single()
        
        if (insertError) {
          results.push({
            email,
            full_name: fullName,
            success: false,
            error: `Database error: ${insertError.message}`
          })
          continue
        }
        
        // Generate invite link and email content
        const inviteLink = createInviteLink(inviteKey, process.env.NEXT_PUBLIC_APP_URL)
        const { subject, html, text } = generateInviteEmailContent(
          fullName,
          coachRank,
          inviteLink,
          invitedByName
        )
        
        // Send email (disable click tracking so invite links go directly to our app)
        const { data: emailData, error: emailError } = await resend.emails.send({
          from: "Coaching Amplifier <onboarding@coachingamplifier.com>",
          to: [email],
          subject,
          html,
          text,
          headers: {
            "X-Entity-Ref-ID": inviteData?.id || inviteKey, // Prevents link rewriting
          },
        })
        
        if (emailError) {
          results.push({
            email,
            full_name: fullName,
            success: false,
            error: `Email failed: ${emailError.message}`
          })
        } else {
          // Store Resend message ID for webhook correlation
          if (emailData?.id && inviteData?.id) {
            await supabase
              .from("invites")
              .update({ resend_message_id: emailData.id })
              .eq("id", inviteData.id)
          }
          
          // Add contact to Resend segment for marketing/audience tracking
          await addContactToResendSegment(email)
          
          results.push({
            email,
            full_name: fullName,
            success: true
          })
        }
        
        // Throttle to respect rate limits
        await sleep(EMAIL_THROTTLE_DELAY)
        
      } catch (error: any) {
        results.push({
          email,
          full_name: fullName,
          success: false,
          error: error.message || "Unknown error occurred"
        })
      }
    }
    
    // Calculate summary
    const successCount = results.filter(r => r.success).length
    const failureCount = results.filter(r => !r.success).length
    
    return NextResponse.json({
      success: true,
      summary: {
        total: results.length,
        successful: successCount,
        failed: failureCount
      },
      results
    })
    
  } catch (error: any) {
    console.error("Bulk invite error:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}
