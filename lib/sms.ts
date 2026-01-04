/**
 * SMS utility functions - uses native device SMS
 */

export interface CalendarInviteSMSData {
  to: string // 10-digit phone number
  toName?: string
  fromName?: string
  eventTitle: string
  eventDescription?: string
  startDate: string // ISO string
  eventType: "check-in" | "ha"
}

/**
 * Generate an SMS message body for a calendar invite
 */
export function generateCalendarInviteSMSBody(data: CalendarInviteSMSData): string {
  const startDateTime = new Date(data.startDate)
  const dateStr = startDateTime.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  })
  const timeStr = startDateTime.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  })

  const isHA = data.eventType === "ha"
  const greeting = data.toName ? `Hi ${data.toName}! ` : ""
  const eventTypeLabel = isHA ? "Health Assessment" : "check-in"
  
  let message = `${greeting}📅 ${eventTypeLabel} scheduled!\n\n`
  message += `${data.eventTitle}\n`
  message += `📆 ${dateStr} at ${timeStr}\n`
  
  if (data.eventDescription) {
    message += `\n${data.eventDescription}\n`
  }
  
  if (data.fromName) {
    message += `\n- ${data.fromName}`
  }

  return message
}

/**
 * Generate an SMS URL that opens the device's native SMS app
 * Works on iOS, Android, and macOS with Messages
 */
export function generateSMSUrl(phone: string, body: string): string {
  const cleanPhone = phone.replace(/\D/g, '')
  const formattedPhone = `+1${cleanPhone}`
  const encodedBody = encodeURIComponent(body)
  
  // Use & for iOS/macOS compatibility, most Android browsers also support this
  // Some older Android may need ? but & works on modern devices
  return `sms:${formattedPhone}&body=${encodedBody}`
}

/**
 * Open native SMS app with pre-filled message
 */
export function openNativeSMS(data: CalendarInviteSMSData): void {
  const body = generateCalendarInviteSMSBody(data)
  const url = generateSMSUrl(data.to, body)
  window.open(url, '_self')
}

/**
 * Check if the device likely supports native SMS
 */
export function canSendNativeSMS(): boolean {
  if (typeof window === 'undefined') return false
  
  const userAgent = navigator.userAgent.toLowerCase()
  
  // Mobile devices
  const isMobile = /iphone|ipad|ipod|android|mobile/i.test(userAgent)
  
  // macOS Safari (can open Messages app)
  const isMacSafari = /macintosh/i.test(userAgent) && /safari/i.test(userAgent) && !/chrome/i.test(userAgent)
  
  // macOS with any browser may work if they have Messages configured
  const isMac = /macintosh/i.test(userAgent)
  
  return isMobile || isMacSafari || isMac
}

/**
 * Validate a US phone number (10 digits)
 */
export function isValidUSPhoneNumber(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '')
  return cleaned.length === 10
}

/**
 * Format a phone number for display
 */
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
  }
  return phone
}
