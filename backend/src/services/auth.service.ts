import { User } from '@prisma/client'
import crypto from 'crypto'
import { prisma } from '../config/prisma'
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt'
import { env } from '../config/env'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const REFRESH_TOKEN_EXPIRES_MS = parseDurationToMs(env.jwtRefreshExpiresIn)

function parseDurationToMs(duration: string): number {
  const match = duration.match(/^(\d+)([smhd])$/)
  if (!match) return 30 * 24 * 60 * 60 * 1000 // default 30d
  const value = parseInt(match[1], 10)
  const unit = match[2]
  const multipliers: Record<string, number> = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 }
  return value * (multipliers[unit] ?? 86_400_000)
}

export async function issueTokens(user: User): Promise<{ accessToken: string; refreshToken: string; refreshTokenId: string }> {
  const refreshTokenId = crypto.randomUUID()
  const rawRefreshToken = signRefreshToken({ sub: user.id, jti: refreshTokenId })

  await prisma.refreshToken.create({
    data: {
      id: refreshTokenId,
      token: rawRefreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRES_MS),
    },
  })

  const accessToken = signAccessToken({
    sub: user.id,
    email: user.email,
    role: user.role,
  })

  return { accessToken, refreshToken: rawRefreshToken, refreshTokenId }
}

export async function refreshTokens(rawToken: string): Promise<{ accessToken: string; refreshToken: string } | null> {
  let payload
  try {
    payload = verifyRefreshToken(rawToken)
  } catch {
    return null
  }

  const stored = await prisma.refreshToken.findUnique({ where: { id: payload.jti }, include: { user: true } })
  if (!stored || stored.revoked || stored.expiresAt < new Date()) return null

  // Rotar: revocar el token viejo y emitir uno nuevo
  await prisma.refreshToken.update({ where: { id: stored.id }, data: { revoked: true } })

  const { accessToken, refreshToken } = await issueTokens(stored.user)
  return { accessToken, refreshToken }
}

export async function revokeRefreshToken(rawToken: string): Promise<void> {
  await prisma.refreshToken.updateMany({
    where: { token: rawToken },
    data: { revoked: true },
  })
}

export const registerSchema = z.object({
  firstName: z.string().min(1, 'Nombre requerido').max(50),
  lastName: z.string().min(1, 'Apellido requerido').max(50),
  dni: z.string().min(7, 'DNI debe tener al menos 7 dígitos').max(10, 'DNI debe tener máximo 10 dígitos').regex(/^\d+$/, 'El DNI solo debe contener números'),
  email: z.string().email('Email inválido').toLowerCase(),
  password: z.string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
    .regex(/[a-z]/, 'Debe contener al menos una minúscula')
    .regex(/[0-9]/, 'Debe contener al menos un número'),
})

export type RegisterInput = z.infer<typeof registerSchema>

export async function registerUser(
  input: RegisterInput,
): Promise<{ user: User; accessToken: string; refreshToken: string }> {
  const existing = await prisma.user.findUnique({ where: { email: input.email } })
  if (existing) {
    const err = new Error('El email ya está registrado')
    ;(err as NodeJS.ErrnoException).code = 'EMAIL_IN_USE'
    throw err
  }

  const hash = await bcrypt.hash(input.password, 12)
  const user = await prisma.user.create({
    data: {
      email: input.email,
      firstName: input.firstName,
      lastName: input.lastName,
      dni: input.dni,
      password: hash,
    },
  })

  const { accessToken, refreshToken } = await issueTokens(user)
  return { user, accessToken, refreshToken }
}

export async function loginUser(
  email: string,
  password: string,
): Promise<{ user: User; accessToken: string; refreshToken: string } | null> {
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } })
  if (!user || !user.password || !user.isActive) return null

  const valid = await bcrypt.compare(password, user.password)
  if (!valid) return null

  const { accessToken, refreshToken } = await issueTokens(user)
  return { user, accessToken, refreshToken }
}
