import { Request, Response } from 'express'
import { Prisma, ReservationStatus } from '@prisma/client'
import { prisma } from '../config/prisma'
import { ok } from '../utils/apiResponse'

function safeInt(val: unknown, fallback: number, min = 1, max = 10000): number {
  if (val === undefined || val === null || val === '') return fallback
  const n = parseInt(val as string, 10)
  if (isNaN(n) || n < min) return fallback
  return Math.min(n, max)
}

const MBDA_ITEM_SELECT = {
  id: true,
  code: true,
  title: true,
  description: true,
  condition: true,
  productTypeId: true,
  productType: { select: { id: true, name: true, code: true } },
  sizeId: true,
  size: { select: { id: true, name: true } },
  tags: { include: { tag: { select: { id: true, name: true } } } },
  quantity: true,
  price: true,
  isActive: true,
  isOwnProduct: true,
  promoterCommissionPct: true,
  photos: { orderBy: { order: Prisma.SortOrder.asc }, take: 1, select: { id: true, url: true, order: true } },
  store: { select: { id: true, name: true, phone: true } },
  reservations: {
    where: { status: { in: [ReservationStatus.PENDING_APPROVAL, ReservationStatus.APPROVED] } },
    select: { id: true, status: true, quantity: true },
  },
}

const MINISHOP_PRODUCT_INCLUDE = {
  photos: { orderBy: { order: Prisma.SortOrder.asc }, take: 1 },
  productType: { select: { id: true, name: true, code: true } },
  size: { select: { id: true, name: true } },
  tags: { include: { tag: { select: { id: true, name: true } } } },
  miniShop: { select: { name: true, slug: true, whatsapp: true, profilePhotoUrl: true } },
}

function enrichMbdaItem(item: any) {
  const reservedQty = (item.reservations ?? []).reduce((sum: number, r: any) => sum + r.quantity, 0)
  const activeReservation = item.reservations?.find((r: any) =>
    r.status === 'PENDING_APPROVAL' || r.status === 'APPROVED',
  ) ?? null
  return {
    ...item,
    source: 'mbda' as const,
    reservedQuantity: reservedQty,
    availableQuantity: item.quantity - reservedQty,
    activeReservation: activeReservation ? { id: activeReservation.id, status: activeReservation.status } : null,
    reservations: undefined,
  }
}

// ── GET /catalog ────────────────────────────────────────

export async function listCatalog(req: Request, res: Response): Promise<void> {
  // Lazy-expire reservations
  await prisma.reservation.updateMany({
    where: { status: 'APPROVED', expiresAt: { lt: new Date() } },
    data: { status: 'EXPIRED' },
  })

  const { search, productTypeId, sizeId, tagId, source, miniShopSlug, sortPrice, page, limit } = req.query

  const pageN = safeInt(page, 1)
  const limitN = safeInt(limit, 12, 1, 50)
  const offset = (pageN - 1) * limitN
  const priceOrder: Prisma.SortOrder | null = sortPrice === 'asc' ? Prisma.SortOrder.asc : sortPrice === 'desc' ? Prisma.SortOrder.desc : null

  // ── Filter by specific mini-shop ─────────────────────
  if (miniShopSlug && miniShopSlug !== 'mbda') {
    const shop = await prisma.miniShop.findFirst({
      where: { slug: miniShopSlug as string, status: 'ACTIVE' },
      select: { id: true },
    })
    if (!shop) { ok(res, [], { page: pageN, limit: limitN, total: 0 }); return }

    const where: any = { miniShopId: shop.id, status: 'APPROVED' }
    if (productTypeId) where.productTypeId = productTypeId
    if (sizeId) where.sizeId = sizeId
    if (tagId) where.tags = { some: { tagId } }
    if (search) where.title = { contains: search, mode: 'insensitive' }

    const orderBy: any = priceOrder ? [{ price: priceOrder }] : [{ featured: Prisma.SortOrder.desc }, { createdAt: Prisma.SortOrder.desc }]
    const [total, products] = await Promise.all([
      prisma.miniShopProduct.count({ where }),
      prisma.miniShopProduct.findMany({ where, orderBy, skip: offset, take: limitN, include: MINISHOP_PRODUCT_INCLUDE }),
    ])
    const data = products.map((p: any) => ({ ...p, source: 'minishop' as const }))
    ok(res, data, { page: pageN, limit: limitN, total })
    return
  }

  // ── Filter MBDA only ─────────────────────────────────
  if (source === 'mbda') {
    const where: any = { isActive: true, soldAt: null }
    if (productTypeId) where.productTypeId = productTypeId
    if (sizeId) where.sizeId = sizeId
    if (tagId) where.tags = { some: { tagId } }
    if (search) where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ]

    const orderBy: any = priceOrder ? [{ price: priceOrder }] : [{ createdAt: Prisma.SortOrder.desc }]
    const [total, rawItems] = await Promise.all([
      prisma.item.count({ where }),
      prisma.item.findMany({ where, orderBy, skip: offset, take: limitN, select: MBDA_ITEM_SELECT as any }),
    ])
    const data = rawItems.map(enrichMbdaItem).filter((i: any) => i.availableQuantity > 0)
    ok(res, data, { page: pageN, limit: limitN, total })
    return
  }

  // ── Combined catalog: MBDA first, then mini-shops ────
  const whereItem: any = { isActive: true, soldAt: null }
  if (productTypeId) whereItem.productTypeId = productTypeId
  if (sizeId) whereItem.sizeId = sizeId
  if (tagId) whereItem.tags = { some: { tagId } }
  if (search) whereItem.OR = [
    { title: { contains: search, mode: 'insensitive' } },
    { description: { contains: search, mode: 'insensitive' } },
  ]

  const whereMinishop: any = { status: 'APPROVED', miniShop: { status: 'ACTIVE' } }
  if (productTypeId) whereMinishop.productTypeId = productTypeId
  if (sizeId) whereMinishop.sizeId = sizeId
  if (tagId) whereMinishop.tags = { some: { tagId } }
  if (search) whereMinishop.title = { contains: search, mode: 'insensitive' }

  const [mbdaTotal, minishopTotal] = await Promise.all([
    prisma.item.count({ where: whereItem }),
    prisma.miniShopProduct.count({ where: whereMinishop }),
  ])

  const total = mbdaTotal + minishopTotal
  const mbdaSkip = Math.min(offset, mbdaTotal)
  const mbdaTake = Math.max(0, Math.min(limitN, mbdaTotal - mbdaSkip))
  const minishopSkip = Math.max(0, offset - mbdaTotal)
  const minishopTake = limitN - mbdaTake

  const mbdaOrderBy: any = priceOrder ? [{ price: priceOrder }] : [{ createdAt: Prisma.SortOrder.desc }]
  const minishopOrderBy: any = priceOrder ? [{ price: priceOrder }] : [{ featured: Prisma.SortOrder.desc }, { createdAt: Prisma.SortOrder.desc }]

  const [rawMbda, rawMinishop] = await Promise.all([
    mbdaTake > 0
      ? prisma.item.findMany({ where: whereItem, orderBy: mbdaOrderBy, skip: mbdaSkip, take: mbdaTake, select: MBDA_ITEM_SELECT as any })
      : Promise.resolve([]),
    minishopTake > 0
      ? prisma.miniShopProduct.findMany({ where: whereMinishop, orderBy: minishopOrderBy, skip: minishopSkip, take: minishopTake, include: MINISHOP_PRODUCT_INCLUDE })
      : Promise.resolve([]),
  ])

  const mbdaItems = rawMbda.map(enrichMbdaItem).filter((i: any) => i.availableQuantity > 0)
  const minishopItems = rawMinishop.map((p: any) => ({ ...p, source: 'minishop' as const }))

  ok(res, [...mbdaItems, ...minishopItems], { page: pageN, limit: limitN, total })
}

// ── GET /catalog/shops (list active mini-shops for filter dropdown) ────

export async function listCatalogShops(_req: Request, res: Response): Promise<void> {
  const shops = await prisma.miniShop.findMany({
    where: { status: 'ACTIVE' },
    select: { id: true, name: true, slug: true, profilePhotoUrl: true, description: true, _count: { select: { products: { where: { status: 'APPROVED' } } } } },
    orderBy: { createdAt: 'asc' },
  })
  ok(res, shops)
}

// ── GET /catalog/products/:slug (public mini-shop product detail) ──────

export async function getCatalogProductBySlug(req: Request, res: Response): Promise<void> {
  const product = await prisma.miniShopProduct.findFirst({
    where: { slug: req.params.slug!, status: 'APPROVED', miniShop: { status: 'ACTIVE' } },
    include: {
      photos: { orderBy: { order: 'asc' } },
      productType: true,
      size: true,
      tags: { include: { tag: true } },
      miniShop: { select: { id: true, name: true, slug: true, whatsapp: true, profilePhotoUrl: true, deliveryMethods: true } },
    },
  })
  if (!product) { ok(res, null); return }  // caller handles null
  ok(res, { ...product, source: 'minishop' as const })
}
