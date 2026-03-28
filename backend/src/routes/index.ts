import { Router } from 'express'
import authRoutes from './auth.routes'
import userRoutes from './user.routes'
import itemRoutes from './item.routes'
import submissionRoutes from './submission.routes'
import adminRoutes from './admin.routes'
import reservationRoutes from './reservation.routes'

const router = Router()

router.use('/auth', authRoutes)
router.use('/users', userRoutes)
router.use('/items', itemRoutes)
router.use('/submissions', submissionRoutes)
router.use('/admin', adminRoutes)
router.use('/reservations', reservationRoutes)

export default router
