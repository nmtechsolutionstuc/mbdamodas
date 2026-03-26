import { Request, Response } from 'express'
import { z } from 'zod'
import {
  issueTokens, refreshTokens, revokeRefreshToken,
  registerUser, loginUser, registerSchema,
} from '../services/auth.service'
import { ok, created, badRequest, unauthorized, conflict, serverError } from '../utils/apiResponse'
import { env } from '../config/env'

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.nodeEnv === 'production',
  sameSite: 'lax' as const,
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 días
}

export async function register(req: Request, res: Response): Promise<void> {
  const parsed = registerSchema.safeParse(req.body)
  if (!parsed.success) {
    badRequest(res, parsed.error.errors[0]?.message ?? 'Datos inválidos')
    return
  }

  try {
    const { user, accessToken, refreshToken } = await registerUser(parsed.data)
    res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS)
    created(res, {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        avatarUrl: user.avatarUrl,
        role: user.role,
        isActive: user.isActive,
      },
      accessToken,
    })
  } catch (err) {
    const code = (err as NodeJS.ErrnoException).code
    if (code === 'EMAIL_IN_USE') {
      conflict(res, 'El email ya está registrado')
    } else {
      serverError(res)
    }
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  const schema = z.object({
    email: z.string().email('Email inválido'),
    password: z.string().min(1, 'Contraseña requerida'),
  })
  const parsed = schema.safeParse(req.body)
  if (!parsed.success) {
    badRequest(res, parsed.error.errors[0]?.message ?? 'Datos inválidos')
    return
  }

  const result = await loginUser(parsed.data.email, parsed.data.password)
  if (!result) {
    unauthorized(res, 'Email o contraseña incorrectos')
    return
  }

  const { user, accessToken, refreshToken } = result
  res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS)
  ok(res, {
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      avatarUrl: user.avatarUrl,
      role: user.role,
      isActive: user.isActive,
    },
    accessToken,
  })
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
