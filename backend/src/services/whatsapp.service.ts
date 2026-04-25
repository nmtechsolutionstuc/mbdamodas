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

// ─── Reservation WhatsApp Messages ───────────────────────────────────────────

export type ReservationMessageType =
  | 'QUERY_ATTENDANT'       // Admin → store attendant: is product available?
  | 'APPROVED_TO_PROMOTER'  // System → promoter: approved + voucher link
  | 'REJECTED_TO_PROMOTER'  // System → promoter: rejected with reason
  | 'EXTENDED_TO_PROMOTER'  // System → promoter: reservation extended
  | 'COMPLETED_TRANSFER'    // System → promoter: payment via transfer
  | 'COMPLETED_CASH'        // System → promoter: payment in cash
  | 'SEND_VOUCHER'          // Admin → promoter: reminder to get voucher

export interface ReservationWAContext {
  storeName: string
  storeAttendantPhone?: string | null
  promoterPhone: string
  promoterName: string
  promoterDni?: string | null
  itemTitle: string
  itemCode?: string | null
  reservationCode: string
  quantity?: number
  earnings?: number
  expiresAt?: Date | null
  adminNote?: string | null
  paymentMethod?: string | null
  bankAlias?: string | null
  voucherUrl?: string
  itemPrice?: number
}

export function generateReservationWALink(
  type: ReservationMessageType,
  ctx: ReservationWAContext
): string | null {
  const codePart = ctx.itemCode ? ` (${ctx.itemCode})` : ''
  const expiresStr = ctx.expiresAt
    ? new Date(ctx.expiresAt).toLocaleString('es-AR', {
        day: '2-digit', month: '2-digit',
        hour: '2-digit', minute: '2-digit',
        timeZone: 'America/Argentina/Buenos_Aires',
      })
    : '?'

  let phone: string
  let text: string

  switch (type) {
    case 'QUERY_ATTENDANT': {
      if (!ctx.storeAttendantPhone) return null
      phone = ctx.storeAttendantPhone
      const formatPrice = ctx.itemPrice != null ? ctx.itemPrice.toLocaleString('es-AR') : null
      const pricePart = formatPrice != null ? `, precio de venta $${formatPrice}` : ''
      const qtyPart = ctx.quantity && ctx.quantity > 1 ? `, cantidad solicitada: ${ctx.quantity}` : ''
      text = `Hola! Hay una reserva para el producto "${ctx.itemTitle}"${codePart}, código ${ctx.reservationCode}${pricePart}${qtyPart}. ¿El producto está disponible? ¿La tienda abrirá en las próximas 24hs?`
      break
    }

    case 'APPROVED_TO_PROMOTER': {
      phone = ctx.promoterPhone
      const earningsTotal = ctx.earnings != null ? `$${ctx.earnings.toLocaleString('es-AR')}` : '?'
      const qtyNote = ctx.quantity && ctx.quantity > 1 ? ` (${ctx.quantity} unidades)` : ''
      text = `✅ ¡Tu reserva fue aprobada!\n\nProducto: ${ctx.itemTitle}${codePart}\nCódigo: ${ctx.reservationCode}\nTu ganancia estimada: ${earningsTotal}${qtyNote}\nVálido hasta: ${expiresStr}\n\n---\nEn el sitio se generó un comprobante al que debés sacar captura y enviar a tu comprador para ser presentado en la tienda y se efectúe la venta correctamente.\n${ctx.voucherUrl ?? ''}`
      break
    }

    case 'REJECTED_TO_PROMOTER':
      phone = ctx.promoterPhone
      text = `Lo sentimos, tu reserva para "${ctx.itemTitle}"${codePart} (${ctx.reservationCode}) no pudo ser aprobada.${ctx.adminNote ? `\nMotivo: ${ctx.adminNote}` : ''}`
      break

    case 'EXTENDED_TO_PROMOTER':
      phone = ctx.promoterPhone
      text = `Tu reserva para "${ctx.itemTitle}"${codePart} (${ctx.reservationCode}) fue extendida.\nNuevo vencimiento: ${expiresStr}. ¡Gracias por tu paciencia!`
      break

    case 'COMPLETED_TRANSFER': {
      phone = ctx.promoterPhone
      const gain1 = ctx.earnings != null ? `$${ctx.earnings.toLocaleString('es-AR')}` : '?'
      const qty1 = ctx.quantity && ctx.quantity > 1 ? ` (${ctx.quantity} unidades)` : ''
      text = `🎉 ¡Venta completada! "${ctx.itemTitle}"${codePart}\nTu ganancia: ${gain1}${qty1}.\nConfirmás este alias/CVU: ${ctx.bankAlias ?? '?'}? Te hacemos la transferencia a la brevedad.`
      break
    }

    case 'COMPLETED_CASH': {
      phone = ctx.promoterPhone
      const gain2 = ctx.earnings != null ? `$${ctx.earnings.toLocaleString('es-AR')}` : '?'
      const qty2 = ctx.quantity && ctx.quantity > 1 ? ` (${ctx.quantity} unidades)` : ''
      text = `🎉 ¡Venta completada! "${ctx.itemTitle}"${codePart}\nTu ganancia: ${gain2}${qty2}.\nPasá por ${ctx.storeName} a retirar tu efectivo.`
      break
    }

    case 'SEND_VOUCHER':
      phone = ctx.promoterPhone
      text = `Hola ${ctx.promoterName}! Aquí está tu comprobante de reserva.\nEntrá al link, sacá captura de pantalla y mandásela a tu comprador:\n${ctx.voucherUrl ?? ''}`
      break

    default:
      return null
  }

  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`
}
