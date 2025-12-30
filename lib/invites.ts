/**
 * Utility functions for handling user invites
 */

/**
 * Generate a unique invite key
 */
export function generateInviteKey(): string {
  // Generate a random string using crypto API
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('')
}

/**
 * Create an invite link URL
 */
export function createInviteLink(inviteKey: string, baseUrl?: string): string {
  const url = baseUrl || (typeof window !== 'undefined' ? window.location.origin : '')
  return `${url}/signup?invite=${inviteKey}`
}

/**
 * Extract invite key from URL
 */
export function getInviteKeyFromUrl(): string | null {
  if (typeof window === 'undefined') return null
  const params = new URLSearchParams(window.location.search)
  return params.get('invite')
}

