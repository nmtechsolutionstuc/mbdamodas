import { Router } from 'express'
import { rateLimit } from 'express-rate-limit'
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

// Todas las rutas requieren autenticación
router.use(authenticate)

// Rate limiter para crear solicitudes: 10 por hora por usuario
const submissionLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => (req as any).user?.sub ?? req.ip ?? 'unknown',
  message: { success: false, error: { code: 'TOO_MANY_REQUESTS', message: 'Demasiadas solicitudes. Intentá de nuevo en 1 hora.' } },
})

// Hasta 5 fotos por producto × hasta 10 productos = 50 archivos máximo
router.post('/', submissionLimiter, upload.fields(
  Array.from({ length: 10 }, (_, i) => ({ name: `items[${i}][photos]`, maxCount: 5 }))
), asyncHandler(createSubmissionHandler))

router.get('/mine', asyncHandler(listMySubmissions))
router.get('/mine/stats', asyncHandler(getMyStats))
router.get('/mine/:id', asyncHandler(getMySubmission))
router.delete('/mine/:id', asyncHandler(cancelMySubmission))

export default router
