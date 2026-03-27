import { SubmissionItemStatus } from '@prisma/client'

interface WhatsAppContext {
  sellerPhone: string
  sellerName: string
  itemTitle: string
  itemCode?: string
  storeName: string
  commission?: number
  adminComment?: string
  sellerAmount?: number
  paymentMethod?: string | null
  bankAlias?: string | null
}

function buildSoldMessage(ctx: WhatsAppContext): string {
  const amount = ctx.sellerAmount?.toLocaleString('es-AR')
  const codePart = ctx.itemCode ? ` (${ctx.itemCode})` : ''

  if (ctx.paymentMethod === 'TRANSFERENCIA' && ctx.bankAlias) {
    return `Hola ${ctx.sellerName}! Tu producto "${ctx.itemTitle}"${codePart} fue vendido. El monto que te corresponde es $${amount}. Confirmás este alias/CVU: ${ctx.bankAlias}? Te hacemos la transferencia a la brevedad.`
  }

  return `Hola ${ctx.sellerName}! Tu producto "${ctx.itemTitle}"${codePart} fue vendido. El monto que te corresponde es $${amount}. Pasá por la tienda a retirar tu efectivo.`
}

export function generateWhatsAppLink(status: SubmissionItemStatus, ctx: WhatsAppContext): string | null {
  if (!ctx.sellerPhone) return null

  const codePart = ctx.itemCode ? ` (${ctx.itemCode})` : ''

  const messages: Partial<Record<SubmissionItemStatus, string>> = {
    APPROVED: `Hola ${ctx.sellerName}! Tu producto "${ctx.itemTitle}"${codePart} fue aprobado por ${ctx.storeName}. La comisión de la tienda es del ${ctx.commission}%. Te esperamos para traerlo.`,
    REJECTED: `Hola ${ctx.sellerName}! Tu producto "${ctx.itemTitle}" no pudo ser aceptado en este momento.${ctx.adminComment ? ` Motivo: ${ctx.adminComment}` : ''}`,
    IN_STORE: `Hola ${ctx.sellerName}! Tu producto "${ctx.itemTitle}"${codePart} ya está en vidriera en ${ctx.storeName}.`,
    SOLD: buildSoldMessage(ctx),
    RETURNED: `Hola ${ctx.sellerName}! Tu producto "${ctx.itemTitle}"${codePart} está disponible para que pases a retirarlo en ${ctx.storeName}.`,
  }

  const message = messages[status]
  if (!message) return null

  return `https://wa.me/${ctx.sellerPhone}?text=${encodeURIComponent(message)}`
}
