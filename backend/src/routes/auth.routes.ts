import { Router } from 'express'
import passport from '../config/passport'
import { googleCallback, refresh, logout, me } from '../controllers/auth.controller'
import { authenticate } from '../middlewares/authenticate'

const router = Router()

// Inicia el flujo OAuth con Google
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }))

// Google redirige acá luego de autorizar
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login?error=oauth' }),
  googleCallback,
)

// Renueva el access token usando el refresh token (httpOnly cookie)
router.post('/refresh', refresh)

// Revoca el refresh token y limpia la cookie
router.post('/logout', authenticate, logout)

// Devuelve los datos del usuario autenticado
router.get('/me', authenticate, me)

export default router
