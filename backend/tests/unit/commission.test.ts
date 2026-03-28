import { calculateCommission } from '../../src/utils/commission'

describe('calculateCommission', () => {
  it('calcula correctamente con comisión del 30%', () => {
    const result = calculateCommission(5000, 30)
    expect(result.salePrice).toBe(5000)
    expect(result.commissionPercent).toBe(30)
    expect(result.commissionAmount).toBe(1500)
    expect(result.sellerAmount).toBe(3500)
  })

  it('calcula correctamente con comisión del 0%', () => {
    const result = calculateCommission(1000, 0)
    expect(result.commissionAmount).toBe(0)
    expect(result.sellerAmount).toBe(1000)
  })

  it('calcula correctamente con comisión del 100%', () => {
    const result = calculateCommission(1000, 100)
    expect(result.commissionAmount).toBe(1000)
    expect(result.sellerAmount).toBe(0)
  })

  it('redondea a 2 decimales', () => {
    const result = calculateCommission(999, 33)
    expect(result.commissionAmount).toBe(329.67)
    expect(result.sellerAmount).toBe(669.33)
    // Los montos deben sumar el precio de venta
    expect(+(result.commissionAmount + result.sellerAmount).toFixed(2)).toBe(999)
  })

  it('maneja precios con decimales', () => {
    const result = calculateCommission(1500.50, 20)
    expect(result.commissionAmount).toBe(300.1)
    expect(result.sellerAmount).toBe(1200.4)
  })
})
