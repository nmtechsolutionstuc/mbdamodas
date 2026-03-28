import 'dotenv/config'

function required(key: string): string {
  const value = process.env[key]
  if (!value) throw new Error(`Missing required env var: ${key}`)
  return value
}

function optional(key: string, fallback: string): string {
  return process.env[key] ?? fallback
}

export const env = {
  port: parseInt(optional('PORT', '3000'), 10),
  nodeEnv: optional('NODE_ENV', 'development'),
  databaseUrl: required('DATABASE_URL'),
  jwtAccessSecret: required('JWT_ACCESS_SECRET'),
  jwtRefreshSecret: required('JWT_REFRESH_SECRET'),
  jwtAccessExpiresIn: optional('JWT_ACCESS_EXPIRES_IN', '15m'),
  jwtRefreshExpiresIn: optional('JWT_REFRESH_EXPIRES_IN', '30d'),
  // Google OAuth deshabilitado — estos campos ahora son opcionales
  googleClientId: process.env['GOOGLE_CLIENT_ID'] ?? '',
  googleClientSecret: process.env['GOOGLE_CLIENT_SECRET'] ?? '',
  googleCallbackUrl: process.env['GOOGLE_CALLBACK_URL'] ?? '',
  frontendUrl: optional('FRONTEND_URL', 'http://localhost:5173'),
  storageProvider: optional('STORAGE_PROVIDER', 'local') as 'local' | 'cloudinary' | 'supabase',
  cloudinaryCloudName: process.env['CLOUDINARY_CLOUD_NAME'],
  cloudinaryApiKey: process.env['CLOUDINARY_API_KEY'],
  cloudinaryApiSecret: process.env['CLOUDINARY_API_SECRET'],
  supabaseUrl: process.env['SUPABASE_URL'] ?? '',
  supabaseServiceKey: process.env['SUPABASE_SERVICE_ROLE_KEY'] ?? '',
  supabaseStorageBucket: optional('SUPABASE_STORAGE_BUCKET', 'photos'),
} as const
