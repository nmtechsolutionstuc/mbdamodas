import multer from 'multer'
import path from 'path'
import crypto from 'crypto'
import { env } from './env'

const localStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, 'public/uploads'),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase()
    const name = crypto.randomUUID()
    cb(null, `${name}${ext}`)
  },
})

const memoryStorage = multer.memoryStorage()

export const upload = multer({
  storage: env.storageProvider === 'local' ? localStorage : memoryStorage, // cloudinary y supabase usan memoryStorage
  limits: { fileSize: 8 * 1024 * 1024 }, // 8 MB por foto
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp']
    if (allowed.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Solo se aceptan imágenes JPG, PNG o WebP'))
    }
  },
})
