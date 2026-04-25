import { Router } from 'express'
import { register, login, refresh, logout, me } from '../controllers/auth.controller'
import { authenticate } from '../middlewares/authenticate'
import { asyncHandler } from '../utils/asyncHandler'

const router = Router()

router.post('/register', asyncHandler(register))
router.post('/login', asyncHandler(login))
router.post('/refresh', asyncHandler(refresh))
router.post('/logout', authenticate, asyncHandler(logout))
router.get('/me', authenticate, asyncHandler(me))

export default router
