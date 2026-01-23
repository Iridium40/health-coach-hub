import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

/**
 * Resend Webhook Events
 * Documentation: https://resend.com/docs/dashboard/webhooks/introduction
 */
interface ResendWebhookEvent {
  type: string
  created_at: string
  data: {
    created_at: string
    email_id: string
    from: string
    to: string[]
    subject: string
    // Bounce-specific fields
    bounce?: {
      message: string
      // bounceType can be: "hard" | "soft" | "undetermined"
    }
    // Complaint-specific fields
    complaint?: {
      complaintFeedbackType: string
    }
  }
}

// Resend webhook event types we care about
const BOUNCE_EVENTS = ["email.bounced", "email.complained"]
const DELIVERY_EVENTS = ["email.delivered"]

/**
 * Create Supabase admin client for webhook (bypasses RLS)
 */
function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Missing Supabase environment variables for webhook")
  }
  
  return createClient(supabaseUrl, supabaseServiceKey)
}

/**
 * Verify webhook signature (optional but recommended)
 * Resend uses svix for webhook signing
 */
async function verifyWebhookSignature(
  request: NextRequest, 
  payload: string
): Promise<boolean> {
  const webhookSecret = process.env.RESEND_WEBHOOK_SECRET
  
  // If no secret configured, skip verification (not recommended for production)
  if (!webhookSecret) {
    console.warn("RESEND_WEBHOOK_SECRET not configured - skipping signature verification")
    return true
  }
  
  try {
    const svixId = request.headers.get("svix-id")
    const svixTimestamp = request.headers.get("svix-timestamp")
    const svixSignature = request.headers.get("svix-signature")
    
    if (!svixId || !svixTimestamp || !svixSignature) {
      console.error("Missing svix headers")
      return false
    }
    
    // For full verification, you'd use the @svix/webhook package
    // For now, we'll do basic validation that headers exist
    // In production, install @svix/webhook and verify properly
    
    return true
  } catch (error) {
    console.error("Webhook signature verification failed:", error)
    return false
  }
}

/**
 * POST /api/webhooks/resend
 * Handle Resend webhook events for email bounces and delivery status
 */
export async function POST(request: NextRequest) {
  try {
    const payload = await request.text()
    
    // Verify webhook signature
    const isValid = await verifyWebhookSignature(request, payload)
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid webhook signature" },
        { status: 401 }
      )
    }
    
    const event: ResendWebhookEvent = JSON.parse(payload)
    
    console.log(`Resend webhook received: ${event.type}`, {
      email_id: event.data.email_id,
      to: event.data.to,
      subject: event.data.subject
    })
    
    // Handle bounce events
    if (BOUNCE_EVENTS.includes(event.type)) {
      await handleBounceEvent(event)
    }
    
    // Handle delivery events (optional - marks as delivered)
    if (DELIVERY_EVENTS.includes(event.type)) {
      await handleDeliveryEvent(event)
    }
    
    return NextResponse.json({ received: true })
    
  } catch (error: any) {
    console.error("Resend webhook error:", error)
    return NextResponse.json(
      { error: error.message || "Webhook processing failed" },
      { status: 500 }
    )
  }
}

/**
 * Handle email bounce events
 */
async function handleBounceEvent(event: ResendWebhookEvent) {
  const supabase = createAdminClient()
  const emailId = event.data.email_id
  const recipientEmail = event.data.to[0]?.toLowerCase()
  
  if (!recipientEmail) {
    console.error("No recipient email in bounce event")
    return
  }
  
  // Determine bounce reason
  let bounceReason = "Email bounced"
  if (event.type === "email.complained") {
    bounceReason = "Recipient marked as spam"
  } else if (event.data.bounce?.message) {
    bounceReason = event.data.bounce.message
  }
  
  const emailStatus = event.type === "email.complained" ? "complained" : "bounced"
  
  console.log(`Processing ${emailStatus} for ${recipientEmail}: ${bounceReason}`)
  
  // Update invite by resend_message_id first (most accurate)
  let updated = false
  
  if (emailId) {
    const { data, error } = await supabase
      .from("invites")
      .update({
        email_status: emailStatus,
        email_bounced_at: new Date().toISOString(),
        email_bounce_reason: bounceReason,
      })
      .eq("resend_message_id", emailId)
      .select("id")
    
    if (!error && data && data.length > 0) {
      updated = true
      console.log(`Updated invite by resend_message_id: ${emailId}`)
    }
  }
  
  // Fallback: Update by email address (finds most recent active invite)
  if (!updated && recipientEmail) {
    const { data, error } = await supabase
      .from("invites")
      .update({
        email_status: emailStatus,
        email_bounced_at: new Date().toISOString(),
        email_bounce_reason: bounceReason,
      })
      .eq("invited_email", recipientEmail)
      .eq("is_active", true)
      .is("used_by", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .select("id")
    
    if (!error && data && data.length > 0) {
      updated = true
      console.log(`Updated invite by email: ${recipientEmail}`)
    }
  }
  
  if (!updated) {
    console.warn(`No invite found to update for bounce: ${recipientEmail}`)
  }
}

/**
 * Handle email delivery events
 */
async function handleDeliveryEvent(event: ResendWebhookEvent) {
  const supabase = createAdminClient()
  const emailId = event.data.email_id
  const recipientEmail = event.data.to[0]?.toLowerCase()
  
  if (!recipientEmail) return
  
  console.log(`Processing delivery confirmation for ${recipientEmail}`)
  
  // Update invite by resend_message_id first
  let updated = false
  
  if (emailId) {
    const { data, error } = await supabase
      .from("invites")
      .update({
        email_status: "delivered",
      })
      .eq("resend_message_id", emailId)
      .eq("email_status", "sent") // Only update if still in "sent" status
      .select("id")
    
    if (!error && data && data.length > 0) {
      updated = true
    }
  }
  
  // Fallback: Update by email address
  if (!updated && recipientEmail) {
    await supabase
      .from("invites")
      .update({
        email_status: "delivered",
      })
      .eq("invited_email", recipientEmail)
      .eq("email_status", "sent")
      .eq("is_active", true)
      .is("used_by", null)
      .order("created_at", { ascending: false })
      .limit(1)
  }
}

/**
 * GET endpoint for webhook verification (Resend may ping this)
 */
export async function GET() {
  return NextResponse.json({ status: "Resend webhook endpoint active" })
}
