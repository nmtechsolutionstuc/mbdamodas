import { v2 as cloudinary } from 'cloudinary'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'
import path from 'path'
import { env } from '../config/env'

// ── Cloudinary ──────────────────────────────────────────────
if (env.storageProvider === 'cloudinary') {
  cloudinary.config({
    cloud_name: env.cloudinaryCloudName,
    api_key: env.cloudinaryApiKey,
    api_secret: env.cloudinaryApiSecret,
  })
}

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

// ── Supabase Storage ────────────────────────────────────────
let supabase: ReturnType<typeof createClient> | null = null

function getSupabase() {
  if (!supabase) {
    if (!env.supabaseUrl || !env.supabaseServiceKey) {
      throw new Error('SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY son requeridos para storage Supabase')
    }
    supabase = createClient(env.supabaseUrl, env.supabaseServiceKey)
  }
  return supabase
}

async function uploadToSupabase(file: Express.Multer.File): Promise<string> {
  const sb = getSupabase()
  const ext = path.extname(file.originalname).toLowerCase() || '.jpg'
  const fileName = `${crypto.randomUUID()}${ext}`
  const filePath = `products/${fileName}`

  const { error } = await sb.storage
    .from(env.supabaseStorageBucket)
    .upload(filePath, file.buffer, {
      contentType: file.mimetype,
      cacheControl: '31536000', // 1 año
      upsert: false,
    })

  if (error) {
    throw new Error(`Supabase Storage upload failed: ${error.message}`)
  }

  const { data } = sb.storage
    .from(env.supabaseStorageBucket)
    .getPublicUrl(filePath)

  return data.publicUrl
}

// ── API pública ─────────────────────────────────────────────

/**
 * Devuelve la URL pública de un archivo subido.
 * - local: URL relativa /uploads/:filename (multer disk storage)
 * - cloudinary: sube el buffer y devuelve la URL de Cloudinary
 * - supabase: sube el buffer a Supabase Storage y devuelve la URL pública
 */
export async function getUploadedFileUrl(file: Express.Multer.File): Promise<string> {
  if (env.storageProvider === 'cloudinary') {
    return uploadToCloudinary(file)
  }
  if (env.storageProvider === 'supabase') {
    return uploadToSupabase(file)
  }
  return `/uploads/${file.filename}`
}

/**
 * Procesa un array de archivos y devuelve sus URLs.
 * Usa Promise.all para subir en paralelo.
 */
export async function getPhotoUrls(files: Express.Multer.File[]): Promise<string[]> {
  return Promise.all(files.map(f => getUploadedFileUrl(f)))
}
