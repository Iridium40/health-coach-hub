/**
 * Email utility functions using Resend
 */

export interface InviteEmailData {
  to: string
  fullName: string
  coachRank: string
  inviteLink: string
  invitedBy: string
}

/**
 * Send an invite email to a coach
 */
export async function sendInviteEmail(data: InviteEmailData): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch("/api/send-invite-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    const result = await response.json()

    if (!response.ok) {
      return { success: false, error: result.error || "Failed to send email" }
    }

    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to send email" }
  }
}

