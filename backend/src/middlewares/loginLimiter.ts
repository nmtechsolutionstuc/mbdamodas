import { Request, Response, NextFunction } from 'express'

// ── In-memory store de intentos fallidos de login por email ──────────────────
// Se limpia automáticamente cada CLEANUP_INTERVAL_MS para no consumir RAM

interface LoginAttempt {
  count: number
  firstAttempt: number
  lockedUntil: number | null
}

const attempts = new Map<string, LoginAttempt>()

const MAX_ATTEMPTS = 5
const WINDOW_MS = 15 * 60 * 1000      // 15 minutos
const LOCK_DURATION_MS = 15 * 60 * 1000 // Bloqueo de 15 minutos
const CLEANUP_INTERVAL_MS = 30 * 60 * 1000 // Limpiar cada 30 min

// Limpieza periódica de entradas expiradas
setInterval(() => {
  const now = Date.now()
  for (const [key, attempt] of attempts) {
    if (attempt.lockedUntil && now > attempt.lockedUntil) {
      attempts.delete(key)
    } else if (now - attempt.firstAttempt > WINDOW_MS) {
      attempts.delete(key)
    }
  }
}, CLEANUP_INTERVAL_MS)

/**
 * Middleware que bloquea login si se exceden MAX_ATTEMPTS intentos fallidos
 * para el mismo email dentro de WINDOW_MS.
 */
export function loginLimiter(req: Request, res: Response, next: NextFunction): void {
  const email = (req.body?.email ?? '').toString().toLowerCase().trim()
  if (!email) {
    next()
    return
  }

  const now = Date.now()
  const record = attempts.get(email)

  // Si está bloqueado, rechazar
  if (record?.lockedUntil && now < record.lockedUntil) {
    const retryAfterSec = Math.ceil((record.lockedUntil - now) / 1000)
    res.status(429).json({
      success: false,
      error: {
        code: 'TOO_MANY_ATTEMPTS',
        message: `Demasiados intentos fallidos. Intentá de nuevo en ${Math.ceil(retryAfterSec / 60)} minutos.`,
        retryAfter: retryAfterSec,
      },
    })
    return
  }

  // Limpiar ventana expirada
  if (record && now - record.firstAttempt > WINDOW_MS) {
    attempts.delete(email)
  }

  next()
}

/**
 * Registrar un intento fallido de login para el email dado.
 * Llamar desde el controller cuando el login falla.
 */
export function recordFailedLogin(email: string): void {
  const key = email.toLowerCase().trim()
  const now = Date.now()
  const record = attempts.get(key)

  if (!record || now - record.firstAttempt > WINDOW_MS) {
    attempts.set(key, { count: 1, firstAttempt: now, lockedUntil: null })
    return
  }

  record.count += 1
  if (record.count >= MAX_ATTEMPTS) {
    record.lockedUntil = now + LOCK_DURATION_MS
  }
}

/**
 * Limpiar intentos fallidos tras login exitoso.
 */
export function clearFailedLogins(email: string): void {
  attempts.delete(email.toLowerCase().trim())
}
