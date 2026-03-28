import request from 'supertest'
import app from '../../src/app'

// Mock del cliente Prisma para no necesitar DB en CI
jest.mock('../../src/config/prisma', () => ({
  prisma: {
    item: {
      findMany: jest.fn().mockResolvedValue([]),
      findFirst: jest.fn().mockResolvedValue(null),
      findUnique: jest.fn().mockResolvedValue(null),
      count: jest.fn().mockResolvedValue(0),
    },
    $transaction: jest.fn().mockResolvedValue([[], 0]),
  },
}))

describe('GET /api/v1/items (catálogo público)', () => {
  it('responde 200 con array vacío cuando no hay items', async () => {
    const res = await request(app).get('/api/v1/items')
    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(Array.isArray(res.body.data)).toBe(true)
  })

  it('acepta parámetros de filtro sin errores', async () => {
    const res = await request(app)
      .get('/api/v1/items')
      .query({ category: 'MUJER', size: 'M', search: 'campera', page: '1' })
    expect(res.status).toBe(200)
  })
})

describe('GET /api/v1/items/:id (catálogo público)', () => {
  it('responde 404 para item inexistente', async () => {
    const res = await request(app).get('/api/v1/items/id-inexistente')
    expect(res.status).toBe(404)
    expect(res.body.success).toBe(false)
  })
})
