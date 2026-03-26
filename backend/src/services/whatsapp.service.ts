import { SubmissionItemStatus } from '@prisma/client'

interface WhatsAppContext {
  sellerPhone: string
  sellerName: string
  itemTitle: string
  storeName: string
  commission?: number
  adminComment?: string
  sellerAmount?: number
}

export function generateWhatsAppLink(status: SubmissionItemStatus, ctx: WhatsAppContext): string | null {
  if (!ctx.sellerPhone) return null

  const messages: Partial<Record<SubmissionItemStatus, string>> = {
    APPROVED: `Hola ${ctx.sellerName}! Tu prenda "${ctx.itemTitle}" fue aprobada por ${ctx.storeName}. La comisión de la tienda es del ${ctx.commission}%. Te esperamos para traerla.`,
    REJECTED: `Hola ${ctx.sellerName}! Tu prenda "${ctx.itemTitle}" no pudo ser aceptada en este momento.${ctx.adminComment ? ` Motivo: ${ctx.adminComment}` : ''}`,
    IN_STORE: `Hola ${ctx.sellerName}! Tu prenda "${ctx.itemTitle}" ya está en vidriera en ${ctx.storeName}.`,
    SOLD: `Hola ${ctx.sellerName}! Tu prenda "${ctx.itemTitle}" fue vendida. El monto que te corresponde es $${ctx.sellerAmount?.toLocaleString('es-AR')}. Pasá por la tienda a cobrar.`,
    RETURNED: `Hola ${ctx.sellerName}! Tu prenda "${ctx.itemTitle}" está disponible para que pases a retirarla en ${ctx.storeName}.`,
  }

  const message = messages[status]
  if (!message) return null

  return `https://wa.me/${ctx.sellerPhone}?text=${encodeURIComponent(message)}`
}
