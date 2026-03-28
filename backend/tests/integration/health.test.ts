import request from 'supertest'
import app from '../../src/app'

describe('GET /health', () => {
  it('responde 200 con status ok', async () => {
    const res = await request(app).get('/health')
    expect(res.status).toBe(200)
    expect(res.body.status).toBe('ok')
    expect(res.body.timestamp).toBeTruthy()
  })
})

describe('Rutas inexistentes', () => {
  it('responde 404 con error NOT_FOUND', async () => {
    const res = await request(app).get('/api/v1/ruta-que-no-existe')
    expect(res.status).toBe(404)
    expect(res.body.success).toBe(false)
    expect(res.body.error.code).toBe('NOT_FOUND')
  })
})
