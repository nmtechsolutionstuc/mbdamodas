import { Router } from 'express'
import { authenticate } from '../middlewares/authenticate'
import { updateMe } from '../controllers/user.controller'
import { asyncHandler } from '../utils/asyncHandler'

const router = Router()

router.patch('/me', authenticate, asyncHandler(updateMe))

export default router
