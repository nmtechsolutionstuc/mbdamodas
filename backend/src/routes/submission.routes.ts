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

const router = Router()

// Todas las rutas requieren autenticación
router.use(authenticate)

// Hasta 5 fotos por producto × hasta 10 productos = 50 archivos máximo
router.post('/', upload.fields(
  Array.from({ length: 10 }, (_, i) => ({ name: `items[${i}][photos]`, maxCount: 5 }))
), createSubmissionHandler)

router.get('/mine', listMySubmissions)
router.get('/mine/stats', getMyStats)
router.get('/mine/:id', getMySubmission)
router.delete('/mine/:id', cancelMySubmission)

export default router
