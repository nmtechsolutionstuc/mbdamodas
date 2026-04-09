import { Router } from 'express'
import { authenticate } from '../middlewares/authenticate'
import {
  createReservationHandler,
  getMyReservations,
  cancelMyReservation,
  getVoucher,
} from '../controllers/reservation.controller'
import { asyncHandler } from '../utils/asyncHandler'

const router = Router()

// Public: voucher page data
router.get('/voucher/:code', asyncHandler(getVoucher))

// All other reservation routes require auth
router.use(authenticate)
router.post('/', asyncHandler(createReservationHandler))
router.get('/mine', asyncHandler(getMyReservations))
router.delete('/mine/:id', asyncHandler(cancelMyReservation))

export default router
