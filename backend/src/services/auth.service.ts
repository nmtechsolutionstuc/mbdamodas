import { User } from '@prisma/client'
import crypto from 'crypto'
import { prisma } from '../config/prisma'
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt'
import { env } from '../config/env'

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
