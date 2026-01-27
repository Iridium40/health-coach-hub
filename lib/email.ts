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

export interface BadgeEmailData {
  to: string
  fullName: string
  badgeName: string
  badgeCategory: string
  badgeDescription: string
}

export interface WelcomeEmailData {
  to: string
  fullName: string
}

export interface AnnouncementEmailData {
  to: string
  fullName: string
  announcementTitle: string
  announcementContent: string
  priority?: string
}

export interface MeetingEmailData {
  to: string
  fullName: string
  meetingTitle: string
  meetingDescription?: string
  meetingDate: string
  meetingTime: string
  durationMinutes: number
  callType: "coach_only" | "with_clients"
  zoomLink?: string
  zoomMeetingId?: string
  zoomPasscode?: string
  isRecurring?: boolean
  recurrencePattern?: string
}

export interface HealthAssessmentEmailData {
  to: string
  coachName: string
  clientFirstName: string
  clientLastName: string
  clientEmail: string
  assessmentData: Record<string, any>
}

export interface CalendarInviteEmailData {
  to: string
  toName?: string
  fromEmail: string
  fromName?: string
  eventTitle: string
  eventDescription?: string
  startDate: string // ISO string
  endDate: string // ISO string
  eventType: "check-in" | "ha"
}

export interface NewCoachWelcomeEmailData {
  to: string
  fullName: string
  coachRank?: string
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

/**
 * Send a badge award email to a user
 */
export async function sendBadgeEmail(data: BadgeEmailData): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch("/api/send-badge-email", {
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

/**
 * Send a welcome email to a new user
 */
export async function sendWelcomeEmail(data: WelcomeEmailData): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch("/api/send-welcome-email", {
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

/**
 * Send an announcement email to a user
 */
export async function sendAnnouncementEmail(data: AnnouncementEmailData): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch("/api/send-announcement-email", {
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

/**
 * Send a meeting/event notification email to a user
 */
export async function sendMeetingEmail(data: MeetingEmailData): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch("/api/send-meeting-email", {
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

/**
 * Send a new coach welcome email with onboarding resources
 */
export async function sendNewCoachWelcomeEmail(data: NewCoachWelcomeEmailData): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch("/api/send-new-coach-welcome-email", {
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

/**
 * Send a health assessment email to a coach
 */
export async function sendHealthAssessmentEmail(data: HealthAssessmentEmailData): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch("/api/send-health-assessment-email", {
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

/**
 * Send a calendar invite email with ICS attachment
 */
export async function sendCalendarInviteEmail(data: CalendarInviteEmailData): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch("/api/send-calendar-invite", {
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
