export interface CommissionSummary {
  salePrice: number
  commissionPercent: number
  commissionAmount: number
  sellerAmount: number
}

export function calculateCommission(salePrice: number, commissionPercent: number): CommissionSummary {
  const commissionAmount = Math.round(salePrice * (commissionPercent / 100) * 100) / 100
  const sellerAmount = Math.round((salePrice - commissionAmount) * 100) / 100
  return { salePrice, commissionPercent, commissionAmount, sellerAmount }
}
