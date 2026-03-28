import { prisma } from '../config/prisma'
import { generateReservationWALink, type ReservationWAContext } from './whatsapp.service'

// Reusable include matching the shape the frontend expects
const fullReservationInclude = {
  item: { include: { photos: { orderBy: { order: 'asc' as const }, take: 1 } } },
  user: { select: { id: true, firstName: true, lastName: true, dni: true, phone: true, paymentMethod: true, bankAlias: true } },
  store: { select: { name: true, phone: true, storeAttendantPhone: true } },
}

// Lazy expiration helper — inlined to avoid circular imports
async function expireStaleReservations(): Promise<void> {
  await prisma.reservation.updateMany({
    where: { status: 'APPROVED', expiresAt: { lt: new Date() } },
    data: { status: 'EXPIRED' },
  })
}

function generateCode(): string {
  const digits = Math.floor(1000 + Math.random() * 9000)
  return `RES-${digits}`
}

async function getUniqueCode(): Promise<string> {
  let code: string
  let attempts = 0
  do {
    code = generateCode()
    const existing = await prisma.reservation.findUnique({ where: { reservationCode: code } })
    if (!existing) return code
    attempts++
  } while (attempts < 10)
  throw new Error('No se pudo generar un código único para la reserva')
}

function buildVoucherUrl(reservationCode: string): string {
  const base = process.env.FRONTEND_URL ?? 'http://localhost:5173'
  return `${base}/comprobante/${reservationCode}`
}

export async function createReservation(itemId: string, userId: string) {
  await expireStaleReservations()

  const [item, user] = await Promise.all([
    prisma.item.findUnique({
      where: { id: itemId },
      include: {
        store: true,
        photos: { orderBy: { order: 'asc' }, take: 1 },
      },
    }),
    prisma.user.findUnique({ where: { id: userId } }),
  ])

  if (!item || !item.isActive || !item.isOwnProduct) {
    throw { status: 404, message: 'Producto no disponible para reserva' }
  }
  if (!user?.phone || !user?.dni) {
    throw { status: 400, message: 'Necesitás cargar tu DNI y número de WhatsApp en tu perfil antes de reservar' }
  }

  const activeReservation = await prisma.reservation.findFirst({
    where: { itemId, status: { in: ['PENDING_APPROVAL', 'APPROVED'] } },
  })
  if (activeReservation) {
    throw { status: 409, message: 'Este producto ya tiene una reserva activa' }
  }

  const reservationCode = await getUniqueCode()

  const reservation = await prisma.reservation.create({
    data: {
      reservationCode,
      itemId,
      userId,
      storeId: item.storeId,
    },
    include: { item: { include: { photos: { take: 1, orderBy: { order: 'asc' } }, store: true } }, user: true },
  })

  const ctx: ReservationWAContext = {
    storeName: item.store.name,
    storeAttendantPhone: item.store.storeAttendantPhone,
    promoterPhone: user.phone!,
    promoterName: `${user.firstName} ${user.lastName}`,
    promoterDni: user.dni,
    itemTitle: item.title,
    itemCode: item.code,
    reservationCode,
    voucherUrl: buildVoucherUrl(reservationCode),
  }

  const whatsappToAttendant = generateReservationWALink('QUERY_ATTENDANT', ctx)

  return { reservation, whatsappToAttendant }
}

export async function getUserReservations(userId: string) {
  await expireStaleReservations()
  return prisma.reservation.findMany({
    where: { userId },
    include: {
      item: {
        include: {
          photos: { orderBy: { order: 'asc' }, take: 1 },
          store: { select: { name: true, phone: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })
}

export async function cancelReservation(reservationId: string, userId: string) {
  const reservation = await prisma.reservation.findUnique({ where: { id: reservationId } })
  if (!reservation || reservation.userId !== userId) {
    throw { status: 404, message: 'Reserva no encontrada' }
  }
  if (reservation.status !== 'PENDING_APPROVAL') {
    throw { status: 400, message: 'Solo podés cancelar una reserva que está pendiente de aprobación' }
  }
  return prisma.reservation.update({
    where: { id: reservationId },
    data: { status: 'CANCELLED' },
  })
}

export async function listAdminReservations(filters: { status?: string; page?: number }) {
  await expireStaleReservations()
  const page = filters.page ?? 1
  const limit = 20
  const skip = (page - 1) * limit
  const where = filters.status ? { status: filters.status as any } : {}

  const [reservations, total] = await Promise.all([
    prisma.reservation.findMany({
      where,
      include: {
        item: { include: { photos: { orderBy: { order: 'asc' }, take: 1 } } },
        user: { select: { id: true, firstName: true, lastName: true, dni: true, phone: true, paymentMethod: true, bankAlias: true } },
        store: { select: { name: true, phone: true, storeAttendantPhone: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.reservation.count({ where }),
  ])

  return { reservations, meta: { page, limit, total, pages: Math.ceil(total / limit) } }
}

export async function getVoucherData(reservationCode: string) {
  const reservation = await prisma.reservation.findUnique({
    where: { reservationCode },
    include: {
      item: {
        include: {
          photos: { orderBy: { order: 'asc' }, take: 1 },
          store: { select: { name: true, logoUrl: true } },
        },
      },
    },
  })
  if (!reservation) throw { status: 404, message: 'Comprobante no encontrado' }
  return reservation
}

export async function approveReservation(reservationId: string) {
  await expireStaleReservations()
  const reservation = await prisma.reservation.findUnique({
    where: { id: reservationId },
    include: {
      item: { include: { photos: { take: 1, orderBy: { order: 'asc' } }, store: true } },
      user: true,
    },
  })
  if (!reservation) throw { status: 404, message: 'Reserva no encontrada' }
  if (reservation.status !== 'PENDING_APPROVAL') {
    throw { status: 400, message: 'Solo se pueden aprobar reservas pendientes' }
  }

  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)
  await prisma.reservation.update({
    where: { id: reservationId },
    data: { status: 'APPROVED', expiresAt },
  })

  // Re-fetch with full includes for the frontend
  const updated = await prisma.reservation.findUniqueOrThrow({
    where: { id: reservationId },
    include: fullReservationInclude,
  })

  const earnings = reservation.item.price && reservation.item.promoterCommissionPct
    ? Number(reservation.item.price) * Number(reservation.item.promoterCommissionPct) / 100
    : undefined

  const ctx: ReservationWAContext = {
    storeName: reservation.item.store.name,
    storeAttendantPhone: reservation.item.store.storeAttendantPhone,
    promoterPhone: reservation.user.phone ?? '',
    promoterName: `${reservation.user.firstName} ${reservation.user.lastName}`,
    promoterDni: reservation.user.dni,
    itemTitle: reservation.item.title,
    itemCode: reservation.item.code,
    reservationCode: reservation.reservationCode,
    earnings,
    expiresAt,
    voucherUrl: buildVoucherUrl(reservation.reservationCode),
  }

  const whatsappToPromoter = generateReservationWALink('APPROVED_TO_PROMOTER', ctx)
  const whatsappToAttendant = generateReservationWALink('QUERY_ATTENDANT', ctx)
  const whatsappSendVoucher = generateReservationWALink('SEND_VOUCHER', ctx)

  return { reservation: updated, whatsappToPromoter, whatsappToAttendant, whatsappSendVoucher }
}

export async function rejectReservation(reservationId: string, adminNote: string) {
  const reservation = await prisma.reservation.findUnique({
    where: { id: reservationId },
    include: { item: { include: { store: true } }, user: true },
  })
  if (!reservation) throw { status: 404, message: 'Reserva no encontrada' }
  if (reservation.status !== 'PENDING_APPROVAL') {
    throw { status: 400, message: 'Solo se pueden rechazar reservas pendientes' }
  }

  await prisma.reservation.update({
    where: { id: reservationId },
    data: { status: 'REJECTED', adminNote },
  })

  const updated = await prisma.reservation.findUniqueOrThrow({
    where: { id: reservationId },
    include: fullReservationInclude,
  })

  const ctx: ReservationWAContext = {
    storeName: reservation.item.store.name,
    storeAttendantPhone: reservation.item.store.storeAttendantPhone,
    promoterPhone: reservation.user.phone ?? '',
    promoterName: `${reservation.user.firstName} ${reservation.user.lastName}`,
    itemTitle: reservation.item.title,
    itemCode: reservation.item.code,
    reservationCode: reservation.reservationCode,
    adminNote,
  }

  const whatsappToPromoter = generateReservationWALink('REJECTED_TO_PROMOTER', ctx)
  return { reservation: updated, whatsappToPromoter }
}

export async function completeReservation(reservationId: string) {
  await expireStaleReservations()
  const reservation = await prisma.reservation.findUnique({
    where: { id: reservationId },
    include: { item: { include: { store: true } }, user: true },
  })
  if (!reservation) throw { status: 404, message: 'Reserva no encontrada' }
  if (reservation.status !== 'APPROVED') {
    throw { status: 400, message: 'Solo se pueden completar reservas aprobadas y vigentes' }
  }

  await prisma.$transaction([
    prisma.reservation.update({
      where: { id: reservationId },
      data: { status: 'COMPLETED', completedAt: new Date() },
    }),
    prisma.item.update({
      where: { id: reservation.itemId },
      data: { isActive: false },
    }),
  ])

  const updated = await prisma.reservation.findUniqueOrThrow({
    where: { id: reservationId },
    include: fullReservationInclude,
  })

  const earnings = reservation.item.price && reservation.item.promoterCommissionPct
    ? Number(reservation.item.price) * Number(reservation.item.promoterCommissionPct) / 100
    : undefined

  const ctx: ReservationWAContext = {
    storeName: reservation.item.store.name,
    promoterPhone: reservation.user.phone ?? '',
    promoterName: `${reservation.user.firstName} ${reservation.user.lastName}`,
    itemTitle: reservation.item.title,
    itemCode: reservation.item.code,
    reservationCode: reservation.reservationCode,
    earnings,
    paymentMethod: reservation.user.paymentMethod,
    bankAlias: reservation.user.bankAlias,
  }

  const isTransfer = reservation.user.paymentMethod === 'TRANSFERENCIA' && reservation.user.bankAlias
  const whatsappToPromoter = generateReservationWALink(
    isTransfer ? 'COMPLETED_TRANSFER' : 'COMPLETED_CASH',
    ctx
  )

  return { reservation: updated, whatsappToPromoter }
}

export async function extendReservation(reservationId: string) {
  await expireStaleReservations()
  const reservation = await prisma.reservation.findUnique({
    where: { id: reservationId },
    include: { item: { include: { store: true } }, user: true },
  })
  if (!reservation) throw { status: 404, message: 'Reserva no encontrada' }
  if (reservation.status !== 'APPROVED') {
    throw { status: 400, message: 'Solo se pueden extender reservas aprobadas y vigentes' }
  }

  const currentExpiry = reservation.expiresAt ?? new Date()
  const newExpiry = new Date(currentExpiry.getTime() + 24 * 60 * 60 * 1000)

  await prisma.reservation.update({
    where: { id: reservationId },
    data: { expiresAt: newExpiry, extensionCount: { increment: 1 } },
  })

  const updated = await prisma.reservation.findUniqueOrThrow({
    where: { id: reservationId },
    include: fullReservationInclude,
  })

  const ctx: ReservationWAContext = {
    storeName: reservation.item.store.name,
    promoterPhone: reservation.user.phone ?? '',
    promoterName: `${reservation.user.firstName} ${reservation.user.lastName}`,
    itemTitle: reservation.item.title,
    itemCode: reservation.item.code,
    reservationCode: reservation.reservationCode,
    expiresAt: newExpiry,
  }

  const whatsappToPromoter = generateReservationWALink('EXTENDED_TO_PROMOTER', ctx)
  return { reservation: updated, whatsappToPromoter }
}
