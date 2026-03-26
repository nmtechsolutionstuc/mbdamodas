import { Request, Response, NextFunction } from 'express'
import { verifyAccessToken, AccessTokenPayload } from '../utils/jwt'
import { unauthorized } from '../utils/apiResponse'

declare global {
  namespace Express {
    interface Request {
      user?: AccessTokenPayload
    }
  }
}

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    unauthorized(res)
    return
  }

  const token = authHeader.slice(7)
  try {
    req.user = verifyAccessToken(token)
    next()
  } catch {
    unauthorized(res, 'Token inválido o expirado')
  }
}
