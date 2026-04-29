/**
 * Strip HTML tags from a string to prevent stored XSS.
 * Keeps only plain text content.
 */
export function stripHtml(str: string): string {
  return str.replace(/<[^>]*>/g, '').trim()
}

/**
 * Sanitize an object's string values by stripping HTML tags.
 * Only processes top-level string properties.
 */
export function sanitizeStrings<T extends Record<string, unknown>>(obj: T): T {
  const result = { ...obj }
  for (const key of Object.keys(result)) {
    if (typeof result[key] === 'string') {
      (result as Record<string, unknown>)[key] = stripHtml(result[key] as string)
    }
  }
  return result
}

/**
 * Sanitize a phone number for use in WhatsApp wa.me links.
 * Strips EVERYTHING except digits. A phone like "+54 9 (381) 123-4567"
 * becomes "5493811234567". Returns null if fewer than 7 digits remain
 * (clearly not a real phone number).
 *
 * This prevents injection of query parameters (e.g. "?text=…") or
 * protocol-relative URLs via a crafted phone string.
 */
export function sanitizePhoneForWA(phone: string | null | undefined): string | null {
  if (!phone) return null
  const digits = phone.replace(/\D/g, '')
  if (digits.length < 7) return null   // Too short to be real
  if (digits.length > 20) return null  // Way too long — reject
  return digits
}

/**
 * Validate that a URL is safe to use in <a href> or button links.
 * Blocks dangerous protocols (javascript:, data:, vbscript:, file:).
 * Allows: relative paths (/…), https://, and http://.
 * Returns null if the URL is unsafe.
 */
export function sanitizeUrl(url: string | null | undefined): string | null {
  if (!url || url.trim() === '') return null
  const trimmed = url.trim()
  // Block dangerous protocols
  if (/^(javascript|data|vbscript|file):/i.test(trimmed)) return null
  // Allow relative paths and http/https
  if (/^(https?:\/\/|\/)/i.test(trimmed)) return trimmed
  // Allow relative paths without leading slash (e.g. "nosotros")
  if (/^[a-zA-Z0-9_\-/.?=#&%+]+$/.test(trimmed)) return trimmed
  return null
}
