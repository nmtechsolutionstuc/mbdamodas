import { signAccessToken, verifyAccessToken, signRefreshToken, verifyRefreshToken } from '../../src/utils/jwt'

// Mocks de variables de entorno para tests
process.env.JWT_ACCESS_SECRET = 'test-access-secret-para-unit-tests'
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-para-unit-tests'
process.env.JWT_ACCESS_EXPIRES_IN = '15m'
process.env.JWT_REFRESH_EXPIRES_IN = '30d'

describe('JWT utils', () => {
  const payload = { sub: 'user-123', email: 'test@example.com', role: 'USER' as const }

  describe('access token', () => {
    it('firma y verifica correctamente', () => {
      const token = signAccessToken(payload)
      expect(token).toBeTruthy()
      expect(typeof token).toBe('string')

      const decoded = verifyAccessToken(token)
      expect(decoded.sub).toBe('user-123')
      expect(decoded.email).toBe('test@example.com')
      expect(decoded.role).toBe('USER')
    })

    it('lanza error con token inválido', () => {
      expect(() => verifyAccessToken('token-invalido')).toThrow()
    })

    it('lanza error con token de otro secret', () => {
      const refreshToken = signRefreshToken({ sub: 'user-123', jti: 'tok-1' })
      expect(() => verifyAccessToken(refreshToken)).toThrow()
    })
  })

  describe('refresh token', () => {
    it('firma y verifica correctamente', () => {
      const token = signRefreshToken({ sub: 'user-123', jti: 'tok-abc' })
      expect(token).toBeTruthy()

      const decoded = verifyRefreshToken(token)
      expect(decoded.sub).toBe('user-123')
      expect(decoded.jti).toBe('tok-abc')
    })

    it('lanza error con token inválido', () => {
      expect(() => verifyRefreshToken('garbage')).toThrow()
    })
  })
})
