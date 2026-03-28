import { Prisma } from '@prisma/client'
import { prisma } from '../config/prisma'

export interface ItemFilters {
  productTypeId?: string
  sizeId?: string
  search?: string
  storeId?: string
  page?: number
  limit?: number
}

export async function getPublicItems(filters: ItemFilters) {
  await prisma.reservation.updateMany({
    where: { status: 'APPROVED', expiresAt: { lt: new Date() } },
    data: { status: 'EXPIRED' },
  })

  const page = filters.page ?? 1
  const limit = Math.min(filters.limit ?? 20, 50)
  const skip = (page - 1) * limit

  const where: Prisma.ItemWhereInput = {
    isActive: true,
    ...(filters.productTypeId && { productTypeId: filters.productTypeId }),
    ...(filters.sizeId && { sizeId: filters.sizeId }),
    ...(filters.storeId && { storeId: filters.storeId }),
    ...(filters.search && {
      OR: [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ],
    }),
  }

  const [items, total] = await prisma.$transaction([
    prisma.item.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        code: true,
        title: true,
        description: true,
        condition: true,
        productTypeId: true,
        productType: { select: { id: true, name: true, code: true } },
        sizeId: true,
        size: { select: { id: true, name: true } },
        quantity: true,
        price: true,
        isActive: true,
        createdAt: true,
        photos: {
          orderBy: { order: 'asc' },
          take: 1,
          select: { id: true, url: true, order: true },
        },
        store: {
          select: { id: true, name: true, phone: true },
        },
        tags: {
          include: { tag: { select: { id: true, name: true } } },
        },
        isOwnProduct: true,
        promoterCommissionPct: true,
        reservations: {
          where: { status: { in: ['PENDING_APPROVAL', 'APPROVED'] } },
          select: { id: true, status: true, quantity: true },
        },
      },
    }),
    prisma.item.count({ where }),
  ])

  // Compute availableQuantity and filter out fully reserved items
  const enriched = items.map(item => {
    const reservedQty = item.reservations.reduce((sum, r) => sum + r.quantity, 0)
    return {
      ...item,
      reservedQuantity: reservedQty,
      availableQuantity: item.quantity - reservedQty,
    }
  }).filter(item => item.availableQuantity > 0)

  return { items: enriched, total: enriched.length < limit ? skip + enriched.length : total, page, limit }
}

export async function getPublicItemById(id: string) {
  await prisma.reservation.updateMany({
    where: { status: 'APPROVED', expiresAt: { lt: new Date() } },
    data: { status: 'EXPIRED' },
  })

  const item = await prisma.item.findFirst({
    where: { id, isActive: true },
    select: {
      id: true,
      code: true,
      title: true,
      description: true,
      condition: true,
      productTypeId: true,
      productType: { select: { id: true, name: true, code: true } },
      sizeId: true,
      size: { select: { id: true, name: true } },
      quantity: true,
      price: true,
      createdAt: true,
      photos: {
        orderBy: { order: 'asc' },
        select: { id: true, url: true, order: true },
      },
      store: {
        select: { id: true, name: true, phone: true },
      },
      tags: {
        include: { tag: { select: { id: true, name: true } } },
      },
      isOwnProduct: true,
      promoterCommissionPct: true,
      reservations: {
        where: { status: { in: ['PENDING_APPROVAL', 'APPROVED'] } },
        select: { id: true, status: true, quantity: true },
      },
    },
  })

  if (!item) return null

  const reservedQty = item.reservations.reduce((sum, r) => sum + r.quantity, 0)
  return {
    ...item,
    reservedQuantity: reservedQty,
    availableQuantity: item.quantity - reservedQty,
  }
}
