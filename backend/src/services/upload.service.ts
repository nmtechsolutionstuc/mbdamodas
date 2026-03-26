import { env } from '../config/env'

/**
 * Devuelve la URL pública de un archivo subido.
 * En local: URL relativa del servidor.
 * En Cloudinary: se implementaría el upload real al cloud.
 */
export function getUploadedFileUrl(filename: string): string {
  if (env.storageProvider === 'local') {
    return `/uploads/${filename}`
  }
  // TODO: implementar Cloudinary upload en producción
  return `/uploads/${filename}`
}

export function getPhotoUrls(files: Express.Multer.File[]): string[] {
  return files.map(f => getUploadedFileUrl(f.filename))
}
