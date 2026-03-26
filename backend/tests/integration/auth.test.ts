import request from 'supertest'
import app from '../../src/app'

describe('Auth endpoints', () => {
  describe('GET /api/v1/auth/google', () => {
    it('redirige al flujo de OAuth de Google', async () => {
      const res = await request(app).get('/api/v1/auth/google')
      // Passport redirige a accounts.google.com
      expect(res.status).toBe(302)
      expect(res.headers.location).toContain('accounts.google.com')
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
