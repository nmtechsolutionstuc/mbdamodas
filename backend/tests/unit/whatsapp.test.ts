import { generateWhatsAppLink } from '../../src/services/whatsapp.service'

const baseCtx = {
  sellerPhone: '5491112345678',
  sellerName: 'Ana García',
  itemTitle: 'Campera de cuero',
  storeName: 'MBDA Modas',
}

describe('generateWhatsAppLink', () => {
  it('devuelve null si no hay teléfono del vendedor', () => {
    const result = generateWhatsAppLink('APPROVED', { ...baseCtx, sellerPhone: '' })
    expect(result).toBeNull()
  })

  it('genera link correcto para APPROVED', () => {
    const result = generateWhatsAppLink('APPROVED', { ...baseCtx, commission: 30 })
    expect(result).toMatch(/^https:\/\/wa\.me\/5491112345678\?text=/)
    expect(result).toContain('Campera%20de%20cuero')
    expect(result).toContain('30%25')
  })

  it('genera link para REJECTED con motivo', () => {
    const result = generateWhatsAppLink('REJECTED', { ...baseCtx, adminComment: 'Manchas visibles' })
    expect(result).toContain('Manchas%20visibles')
  })

  it('genera link para REJECTED sin motivo', () => {
    const result = generateWhatsAppLink('REJECTED', baseCtx)
    expect(result).not.toBeNull()
    expect(result).toMatch(/wa\.me/)
  })

  it('genera link para IN_STORE', () => {
    const result = generateWhatsAppLink('IN_STORE', baseCtx)
    expect(result).toContain('vidriera')
  })

  it('genera link para SOLD con monto', () => {
    const result = generateWhatsAppLink('SOLD', { ...baseCtx, sellerAmount: 3500 })
    expect(result).toContain('3.500')
    expect(result).toContain('cobrar')
  })

  it('genera link para RETURNED', () => {
    const result = generateWhatsAppLink('RETURNED', baseCtx)
    expect(result).toContain('retirarla')
  })

  it('devuelve null para estado sin mensaje (PENDING)', () => {
    const result = generateWhatsAppLink('PENDING', baseCtx)
    expect(result).toBeNull()
  })

  it('el link contiene el número de teléfono correctamente', () => {
    const result = generateWhatsAppLink('IN_STORE', baseCtx)
    expect(result).toMatch(/wa\.me\/5491112345678/)
  })
})
