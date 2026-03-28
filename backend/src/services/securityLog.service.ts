import { prisma } from '../config/prisma'
import { Prisma } from '@prisma/client'
import { Request } from 'express'

export type SecurityEvent =
  | 'LOGIN_SUCCESS'
  | 'LOGIN_FAILED'
  | 'LOGIN_BLOCKED'
  | 'REGISTER'
  | 'LOGOUT'
  | 'TOKEN_REFRESH'
  | 'ADMIN_ACTION'
  | 'SUBMISSION_CREATE'
  | 'SUBMISSION_CANCEL'

interface LogOptions {
  event: SecurityEvent
  email?: string
  userId?: string
  req?: Request
  metadata?: Prisma.InputJsonObject
}

/**
 * Registra un evento de seguridad en la base de datos.
 * Fire-and-forget: no bloquea la respuesta si falla.
 */
export function logSecurityEvent(opts: LogOptions): void {
  const { event, email, userId, req, metadata } = opts

  const ip = req?.ip ?? req?.headers['x-forwarded-for']?.toString() ?? null
  const userAgent = req?.headers['user-agent'] ?? null

  // Fire-and-forget — no await para no bloquear la response
  prisma.securityLog
    .create({
      data: {
        event,
        email: email ?? null,
        userId: userId ?? null,
        ip,
        userAgent,
        metadata: metadata ?? undefined,
      },
    })
    .catch((err) => {
      console.error('[SecurityLog] Failed to write audit log:', err.message)
    })
}
