import { Router } from 'express'
import { register, login, refresh, logout, me } from '../controllers/auth.controller'
import { authenticate } from '../middlewares/authenticate'

const router = Router()

// Registro con email + contraseña
router.post('/register', register)

// Login con email + contraseña
router.post('/login', login)

// Renueva el access token usando el refresh token (httpOnly cookie)
router.post('/refresh', refresh)

// Revoca el refresh token y limpia la cookie
router.post('/logout', authenticate, logout)

// Devuelve los datos del usuario autenticado
router.get('/me', authenticate, me)

export default router
