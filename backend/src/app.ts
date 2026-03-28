import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import morgan from 'morgan'
import compression from 'compression'
import cookieParser from 'cookie-parser'
import { rateLimit } from 'express-rate-limit'
import { env } from './config/env'

const app = express()

// ── Seguridad ─────────────────────────────────────────────────────────────────
app.use(helmet())
app.use(
  cors({
    origin: env.frontendUrl,
    credentials: true,
  }),
)
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 min
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
  }),
)

// ── Parsers ───────────────────────────────────────────────────────────────────
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(compression())

// ── Logging ───────────────────────────────────────────────────────────────────
if (env.nodeEnv !== 'test') {
  app.use(morgan('dev'))
}

// ── Archivos estáticos (fotos locales) ────────────────────────────────────────
app.use('/uploads', express.static('public/uploads'))

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// ── Rutas API ─────────────────────────────────────────────────────────────────
import apiRoutes from './routes/index'
app.use('/api/v1', apiRoutes)

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Ruta no encontrada' } })
})

// ── Error handler global ──────────────────────────────────────────────────────
import { errorHandler } from './middlewares/errorHandler'
app.use(errorHandler)

export default app
