import { Router } from 'express'
import { authenticate } from '../middlewares/authenticate'
import { updateMe } from '../controllers/user.controller'

const router = Router()

router.patch('/me', authenticate, updateMe)

export default router
