import { Router } from 'express'
import { authenticate } from '../middlewares/authenticate'
import {
  createReservationHandler,
  getMyReservations,
  cancelMyReservation,
  getVoucher,
} from '../controllers/reservation.controller'

const router = Router()

// Public: voucher page data
router.get('/voucher/:code', getVoucher)

// All other reservation routes require auth
router.use(authenticate)
router.post('/', createReservationHandler)
router.get('/mine', getMyReservations)
router.delete('/mine/:id', cancelMyReservation)

export default router
