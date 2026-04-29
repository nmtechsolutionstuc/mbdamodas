/**
 * Sanitize a phone number for use in WhatsApp wa.me links.
 * Strips everything except digits. Returns null if fewer than 7 or
 * more than 20 digits remain (clearly not a real phone number).
 *
 * This prevents injection of query parameters (e.g. "?text=…") or
 * protocol-relative URLs via a crafted phone string.
 */
export function sanitizePhoneForWA(phone: string | null | undefined): string | null {
  if (!phone) return null
  const digits = phone.replace(/\D/g, '')
  if (digits.length < 7) return null  // Too short to be real
  if (digits.length > 20) return null // Way too long — reject
  return digits
}
