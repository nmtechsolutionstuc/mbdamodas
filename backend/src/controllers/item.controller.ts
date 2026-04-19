import { Request, Response } from 'express'
import { getPublicItems, getPublicItemById } from '../services/item.service'
import { prisma } from '../config/prisma'
import { ok, notFound } from '../utils/apiResponse'

function safeInt(val: unknown, fallback: number, min = 1, max = 1000): number {
  if (val === undefined || val === null || val === '') return fallback
  const n = parseInt(val as string, 10)
  if (isNaN(n) || n < min) return fallback
  return Math.min(n, max)
}

export async function listItems(req: Request, res: Response): Promise<void> {
  const { productTypeId, sizeId, search, storeId, page, limit } = req.query

  const items = await getPublicItems({
    productTypeId: productTypeId as string | undefined,
    sizeId: sizeId as string | undefined,
    search: search as string | undefined,
    storeId: storeId as string | undefined,
    page: safeInt(page, 1, 1, 10000),
    limit: safeInt(limit, 20, 1, 50),
  })

  ok(res, items.items, {
    page: items.page,
    limit: items.limit,
    total: items.total,
  })
}

export async function listFeaturedItems(_req: Request, res: Response): Promise<void> {
  // Lazy expire featured items whose featuredUntil has passed
  const now = new Date()
  await Promise.all([
    prisma.item.updateMany({ where: { featured: true, featuredUntil: { lt: now } }, data: { featured: false } }),
    prisma.miniShopProduct.updateMany({ where: { featured: true, featuredUntil: { lt: now } }, data: { featured: false, featuredUntil: null } }),
  ])

  const [mbdaItems, minishopProducts] = await Promise.all([
    prisma.item.findMany({
      where: { featured: true, isActive: true, soldAt: null },
      orderBy: { updatedAt: 'desc' },
      include: {
        photos: { orderBy: { order: 'asc' } },
        productType: true,
        size: true,
        store: { select: { phone: true } },
      },
    }),
    prisma.miniShopProduct.findMany({
      where: { featured: true, status: 'APPROVED', miniShop: { status: 'ACTIVE' } },
      orderBy: { featuredAt: 'desc' },
      include: {
        photos: { orderBy: { order: 'asc' }, take: 1 },
        productType: { select: { id: true, name: true, code: true } },
        size: { select: { id: true, name: true } },
        miniShop: { select: { name: true, slug: true, whatsapp: true } },
      },
    }),
  ])

  const enriched = [
    ...mbdaItems.map((i: any) => ({ ...i, source: 'mbda' as const })),
    ...minishopProducts.map((p: any) => ({ ...p, source: 'minishop' as const })),
  ]
  ok(res, enriched)
}

export async function listPublicProductTypes(_req: Request, res: Response): Promise<void> {
  const productTypes = await prisma.productType.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' },
    include: {
      sizes: { where: { isActive: true }, orderBy: { order: 'asc' } },
      tags: { where: { isActive: true }, orderBy: { order: 'asc' } },
    },
  })
  ok(res, productTypes)
}

export async function getItem(req: Request, res: Response): Promise<void> {
  const item = await getPublicItemById(req.params['id'] as string)
  if (!item) {
    notFound(res, 'Prenda no encontrada')
    return
  }
  ok(res, item)
}
