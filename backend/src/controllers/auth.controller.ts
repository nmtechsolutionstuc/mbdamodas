import { Request, Response } from 'express'
import { User } from '@prisma/client'
import { issueTokens, refreshTokens, revokeRefreshToken } from '../services/auth.service'
import { ok, unauthorized } from '../utils/apiResponse'
import { env } from '../config/env'

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.nodeEnv === 'production',
  sameSite: 'lax' as const,
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 días
}

export async function googleCallback(req: Request, res: Response): Promise<void> {
  const user = req.user as unknown as User
  const { accessToken, refreshToken } = await issueTokens(user)

  res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS)

  // Redirige al frontend con el access token en el hash (nunca llega al servidor)
  res.redirect(`${env.frontendUrl}/auth/callback#token=${accessToken}`)
}

export async function refresh(req: Request, res: Response): Promise<void> {
  const rawToken = req.cookies?.refreshToken as string | undefined
  if (!rawToken) {
    unauthorized(res, 'No hay refresh token')
    return
  }

  const result = await refreshTokens(rawToken)
  if (!result) {
    res.clearCookie('refreshToken')
    unauthorized(res, 'Refresh token inválido o expirado')
    return
  }

  res.cookie('refreshToken', result.refreshToken, COOKIE_OPTIONS)
  ok(res, { accessToken: result.accessToken })
}

export async function logout(req: Request, res: Response): Promise<void> {
  const rawToken = req.cookies?.refreshToken as string | undefined
  if (rawToken) {
    await revokeRefreshToken(rawToken)
  }
  res.clearCookie('refreshToken')
  ok(res, { message: 'Sesión cerrada' })
}

export function me(req: Request, res: Response): void {
  ok(res, req.user)
}
