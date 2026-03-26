import { v2 as cloudinary } from 'cloudinary'
import { env } from '../config/env'

// Configurar Cloudinary si está activo
if (env.storageProvider === 'cloudinary') {
  cloudinary.config({
    cloud_name: env.cloudinaryCloudName,
    api_key: env.cloudinaryApiKey,
    api_secret: env.cloudinaryApiSecret,
  })
}

/**
 * Sube un archivo a Cloudinary (memoria) y devuelve la URL pública.
 */
async function uploadToCloudinary(file: Express.Multer.File): Promise<string> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'mbdamodas',
        resource_type: 'image',
        transformation: [{ quality: 'auto', fetch_format: 'auto', width: 1200, crop: 'limit' }],
      },
      (error, result) => {
        if (error || !result) return reject(error ?? new Error('Cloudinary upload failed'))
        resolve(result.secure_url)
      },
    )
    stream.end(file.buffer)
  })
}

/**
 * Devuelve la URL pública de un archivo subido.
 * - local: URL relativa /uploads/:filename (multer disk storage)
 * - cloudinary: sube el buffer y devuelve la URL de Cloudinary
 */
export async function getUploadedFileUrl(file: Express.Multer.File): Promise<string> {
  if (env.storageProvider === 'cloudinary') {
    return uploadToCloudinary(file)
  }
  return `/uploads/${file.filename}`
}

/**
 * Procesa un array de archivos y devuelve sus URLs.
 * Usa Promise.all para subir en paralelo cuando es Cloudinary.
 */
export async function getPhotoUrls(files: Express.Multer.File[]): Promise<string[]> {
  return Promise.all(files.map(f => getUploadedFileUrl(f)))
}
