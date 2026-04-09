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
