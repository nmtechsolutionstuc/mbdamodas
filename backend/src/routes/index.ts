import { Router } from 'express'
import authRoutes from './auth.routes'
import userRoutes from './user.routes'
import itemRoutes from './item.routes'
import submissionRoutes from './submission.routes'
import adminRoutes from './admin.routes'
import reservationRoutes from './reservation.routes'
import { getAnnouncement, getHomeBanners, getAboutContent, getTermsContent, getMenuConfig, getFeatureCards } from '../controllers/store.controller'
import { asyncHandler } from '../utils/asyncHandler'

const router = Router()

router.use('/auth', authRoutes)
router.use('/users', userRoutes)
router.use('/items', itemRoutes)
router.use('/submissions', submissionRoutes)
router.use('/admin', adminRoutes)
router.use('/reservations', reservationRoutes)

// Public endpoints
router.get('/announcement', asyncHandler(getAnnouncement))
router.get('/home-banners', asyncHandler(getHomeBanners))
router.get('/about-content', asyncHandler(getAboutContent))
router.get('/terms-content', asyncHandler(getTermsContent))
router.get('/menu-config', asyncHandler(getMenuConfig))
router.get('/feature-cards', asyncHandler(getFeatureCards))

export default router
