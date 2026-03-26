import request from 'supertest'
import app from '../../src/app'
import { prisma } from '../../src/config/prisma'

// Mock Prisma to avoid real DB connections
jest.mock('../../src/config/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn().mockResolvedValue(null),
      create: jest.fn(),
    },
    refreshToken: {
      create: jest.fn().mockResolvedValue({}),
      findUnique: jest.fn().mockResolvedValue(null),
      updateMany: jest.fn().mockResolvedValue({}),
    },
  },
}))

const mockPrisma = prisma as jest.Mocked<typeof prisma>

describe('Auth endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('POST /api/v1/auth/register', () => {
    it('responde 400 si faltan campos', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({ email: 'test@test.com' })
      expect(res.status).toBe(400)
      expect(res.body.success).toBe(false)
    })

    it('responde 400 si la contraseña es muy corta', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({ firstName: 'Ana', lastName: 'García', email: 'ana@test.com', password: '123' })
      expect(res.status).toBe(400)
    })

    it('responde 409 si el email ya existe', async () => {
      ;(mockPrisma.user.findUnique as jest.Mock).mockResolvedValueOnce({
        id: '1', email: 'existing@test.com', isActive: true,
      })
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({ firstName: 'Ana', lastName: 'García', email: 'existing@test.com', password: 'password123' })
      expect(res.status).toBe(409)
    })
  })

  describe('POST /api/v1/auth/login', () => {
    it('responde 401 con credenciales inexistentes', async () => {
      ;(mockPrisma.user.findUnique as jest.Mock).mockResolvedValueOnce(null)
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'noexiste@test.com', password: 'cualquiera' })
      expect(res.status).toBe(401)
    })

    it('responde 400 si falta el email', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ password: 'algo' })
      expect(res.status).toBe(400)
    })
  })

  describe('POST /api/v1/auth/refresh', () => {
    it('responde 401 sin cookie de refresh token', async () => {
      const res = await request(app).post('/api/v1/auth/refresh')
      expect(res.status).toBe(401)
      expect(res.body.success).toBe(false)
    })
  })

  describe('POST /api/v1/auth/logout', () => {
    it('responde 401 sin Bearer token', async () => {
      const res = await request(app).post('/api/v1/auth/logout')
      expect(res.status).toBe(401)
    })
  })

  describe('GET /api/v1/auth/me', () => {
    it('responde 401 sin token', async () => {
      const res = await request(app).get('/api/v1/auth/me')
      expect(res.status).toBe(401)
    })

    it('responde 401 con token malformado', async () => {
      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', 'Bearer token-invalido')
      expect(res.status).toBe(401)
    })
  })
})
