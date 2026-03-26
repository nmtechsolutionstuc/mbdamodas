import { SubmissionItemStatus } from '@prisma/client'
import { prisma } from '../config/prisma'
import { generateWhatsAppLink } from './whatsapp.service'
import { calculateCommission } from '../utils/commission'

export async function getAdminSubmissions(filters: {
  storeId?: string
  status?: string
  page?: number
  limit?: number
}) {
  const page = filters.page ?? 1
  const limit = Math.min(filters.limit ?? 20, 50)
  const skip = (page - 1) * limit

  const where = {
    ...(filters.storeId && { storeId: filters.storeId }),
    ...(filters.status && { items: { some: { status: filters.status as SubmissionItemStatus } } }),
  }

  const [submissions, total] = await prisma.$transaction([
    prisma.submission.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        seller: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
        items: {
          include: { photos: { orderBy: { order: 'asc' }, take: 1 } },
        },
      },
    }),
    prisma.submission.count({ where }),
  ])

  return { submissions, total, page, limit }
}

export async function getAdminSubmissionById(id: string) {
  return prisma.submission.findUnique({
    where: { id },
    include: {
      seller: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
      items: {
        include: { photos: { orderBy: { order: 'asc' } } },
        orderBy: { createdAt: 'asc' },
      },
    },
  })
}

export async function approveItem(submissionItemId: string) {
  const submissionItem = await prisma.submissionItem.findUnique({
    where: { id: submissionItemId },
    include: {
      submission: {
        include: {
          seller: { select: { firstName: true, lastName: true, phone: true } },
          store: true,
        },
      },
      photos: true,
    },
  })
  if (!submissionItem) return null

  const commission = Number(submissionItem.submission.store.defaultCommission)

  // Crear el Item en catálogo y actualizar estado en una transacción
  const [updatedItem, item] = await prisma.$transaction([
    prisma.submissionItem.update({
      where: { id: submissionItemId },
      data: { status: SubmissionItemStatus.APPROVED, reviewedAt: new Date() },
    }),
    prisma.item.create({
      data: {
        title: submissionItem.title,
        description: submissionItem.description,
        condition: submissionItem.condition,
        size: submissionItem.size,
        category: submissionItem.category,
        quantity: submissionItem.quantity,
        price: submissionItem.desiredPrice,
        minimumPrice: submissionItem.minimumPrice,
        commission,
        submissionItemId: submissionItem.id,
        storeId: submissionItem.submission.storeId,
        photos: {
          create: submissionItem.photos.map(p => ({ url: p.url, order: p.order })),
        },
      },
      include: { photos: true },
    }),
  ])

  const seller = submissionItem.submission.seller
  const whatsappLink = generateWhatsAppLink(SubmissionItemStatus.APPROVED, {
    sellerPhone: seller.phone ?? '',
    sellerName: seller.firstName,
    itemTitle: submissionItem.title,
    storeName: submissionItem.submission.store.name,
    commission,
  })

  return { submissionItem: updatedItem, item, whatsappLink }
}

export async function rejectItem(submissionItemId: string, adminComment: string) {
  const submissionItem = await prisma.submissionItem.findUnique({
    where: { id: submissionItemId },
    include: {
      submission: {
        include: {
          seller: { select: { firstName: true, phone: true } },
          store: { select: { name: true } },
        },
      },
    },
  })
  if (!submissionItem) return null

  const updated = await prisma.submissionItem.update({
    where: { id: submissionItemId },
    data: { status: SubmissionItemStatus.REJECTED, adminComment, reviewedAt: new Date() },
  })

  const seller = submissionItem.submission.seller
  const whatsappLink = generateWhatsAppLink(SubmissionItemStatus.REJECTED, {
    sellerPhone: seller.phone ?? '',
    sellerName: seller.firstName,
    itemTitle: submissionItem.title,
    storeName: submissionItem.submission.store.name,
    adminComment,
  })

  return { submissionItem: updated, whatsappLink }
}

export async function markItemInStore(submissionItemId: string) {
  const submissionItem = await prisma.submissionItem.findUnique({
    where: { id: submissionItemId },
    include: {
      submission: {
        include: {
          seller: { select: { firstName: true, phone: true } },
          store: { select: { name: true } },
        },
      },
    },
  })
  if (!submissionItem) return null

  const updated = await prisma.submissionItem.update({
    where: { id: submissionItemId },
    data: { status: SubmissionItemStatus.IN_STORE },
  })

  const seller = submissionItem.submission.seller
  const whatsappLink = generateWhatsAppLink(SubmissionItemStatus.IN_STORE, {
    sellerPhone: seller.phone ?? '',
    sellerName: seller.firstName,
    itemTitle: submissionItem.title,
    storeName: submissionItem.submission.store.name,
  })

  return { submissionItem: updated, whatsappLink }
}

export async function markItemSold(submissionItemId: string) {
  const submissionItem = await prisma.submissionItem.findUnique({
    where: { id: submissionItemId },
    include: {
      item: true,
      submission: {
        include: {
          seller: { select: { firstName: true, phone: true } },
          store: { select: { name: true } },
        },
      },
    },
  })
  if (!submissionItem || !submissionItem.item) return null

  const item = submissionItem.item
  const commission = calculateCommission(Number(item.price), Number(item.commission))

  await prisma.$transaction([
    prisma.submissionItem.update({ where: { id: submissionItemId }, data: { status: SubmissionItemStatus.SOLD } }),
    prisma.item.update({ where: { id: item.id }, data: { isActive: false, soldAt: new Date() } }),
  ])

  const seller = submissionItem.submission.seller
  const whatsappLink = generateWhatsAppLink(SubmissionItemStatus.SOLD, {
    sellerPhone: seller.phone ?? '',
    sellerName: seller.firstName,
    itemTitle: submissionItem.title,
    storeName: submissionItem.submission.store.name,
    sellerAmount: commission.sellerAmount,
  })

  return { commission, whatsappLink }
}

export async function markItemReturned(submissionItemId: string) {
  const submissionItem = await prisma.submissionItem.findUnique({
    where: { id: submissionItemId },
    include: {
      item: true,
      submission: {
        include: {
          seller: { select: { firstName: true, phone: true } },
          store: { select: { name: true } },
        },
      },
    },
  })
  if (!submissionItem) return null

  await prisma.$transaction([
    prisma.submissionItem.update({ where: { id: submissionItemId }, data: { status: SubmissionItemStatus.RETURNED } }),
    ...(submissionItem.item
      ? [prisma.item.update({ where: { id: submissionItem.item.id }, data: { isActive: false, returnedAt: new Date() } })]
      : []),
  ])

  const seller = submissionItem.submission.seller
  const whatsappLink = generateWhatsAppLink(SubmissionItemStatus.RETURNED, {
    sellerPhone: seller.phone ?? '',
    sellerName: seller.firstName,
    itemTitle: submissionItem.title,
    storeName: submissionItem.submission.store.name,
  })

  return { whatsappLink }
}
