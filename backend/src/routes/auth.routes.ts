import { Router } from 'express'
import { rateLimit } from 'express-rate-limit'
import { register, login, refresh, logout, me } from '../controllers/auth.controller'
import { authenticate } from '../middlewares/authenticate'
import { loginLimiter } from '../middlewares/loginLimiter'
import { asyncHandler } from '../utils/asyncHandler'

const router = Router()

// Rate limiter para registro: 5 intentos por IP cada hora
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { code: 'TOO_MANY_REQUESTS', message: 'Demasiados registros. Intentá de nuevo en 1 hora.' } },
})

// Rate limiter para login: 10 intentos por IP cada 15 min (+ brute force por email en loginLimiter)
const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { code: 'TOO_MANY_REQUESTS', message: 'Demasiados intentos de login. Intentá de nuevo en 15 minutos.' } },
})

// Registro con email + contraseña
router.post('/register', registerLimiter, asyncHandler(register))

// Login con email + contraseña (doble protección: IP rate limit + email brute force)
router.post('/login', loginRateLimiter, loginLimiter, asyncHandler(login))

// Renueva el access token usando el refresh token (httpOnly cookie)
router.post('/refresh', asyncHandler(refresh))

// Revoca el refresh token y limpia la cookie
router.post('/logout', authenticate, asyncHandler(logout))

// Devuelve los datos del usuario autenticado
router.get('/me', authenticate, asyncHandler(me))

export default router
