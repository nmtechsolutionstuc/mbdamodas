import { Router } from 'express'
import { authenticate } from '../middlewares/authenticate'
import { upload } from '../config/multer'
import {
  createSubmissionHandler,
  listMySubmissions,
  getMySubmission,
  cancelMySubmission,
  getMyStats,
} from '../controllers/submission.controller'
import { asyncHandler } from '../utils/asyncHandler'

const router = Router()

router.use(authenticate)

// Hasta 5 fotos por producto × hasta 10 productos = 50 archivos máximo
router.post('/', upload.fields(
  Array.from({ length: 10 }, (_, i) => ({ name: `items[${i}][photos]`, maxCount: 5 }))
), asyncHandler(createSubmissionHandler))

router.get('/mine', asyncHandler(listMySubmissions))
router.get('/mine/stats', asyncHandler(getMyStats))
router.get('/mine/:id', asyncHandler(getMySubmission))
router.delete('/mine/:id', asyncHandler(cancelMySubmission))

export default router
