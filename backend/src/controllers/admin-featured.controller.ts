import { Request, Response } from 'express'
import { prisma } from '../config/prisma'
import { ok, notFound, badRequest } from '../utils/apiResponse'

// Lazy-expire featured items whose featuredUntil has passed
async function expireFeatured(): Promise<void> {
  const now = new Date()
  await Promise.all([
    prisma.item.updateMany({
      where: { featured: true, featuredUntil: { lt: now } },
      data: { featured: false },
    }),
    prisma.miniShopProduct.updateMany({
      where: { featured: true, featuredUntil: { lt: now } },
      data: { featured: false, featuredUntil: null },
    }),
  ])
}

// ── GET /admin/featured ──────────────────────────────────────────
// Returns all currently featured items (MBDA + mini-shop)
export async function listFeatured(req: Request, res: Response): Promise<void> {
  await expireFeatured()

  const [mbdaItems, miniShopProducts] = await Promise.all([
    prisma.item.findMany({
      where: { featured: true, isActive: true, soldAt: null },
      orderBy: { featuredAt: 'desc' },
      select: {
        id: true,
        title: true,
        price: true,
        code: true,
        featured: true,
        featuredAt: true,
        featuredUntil: true,
        photos: { orderBy: { order: 'asc' }, take: 1, select: { url: true } },
        productType: { select: { name: true } },
      },
    }),
    prisma.miniShopProduct.findMany({
      where: { featured: true, status: 'APPROVED', miniShop: { status: 'ACTIVE' } },
      orderBy: { featuredAt: 'desc' },
      include: {
        photos: { orderBy: { order: 'asc' }, take: 1, select: { url: true, id: true, order: true } },
        productType: { select: { name: true } },
        miniShop: { select: { name: true, slug: true } },
      },
    }),
  ])

  const mbda = mbdaItems.map((i: any) => ({ ...i, source: 'mbda' as const }))
  const minishop = miniShopProducts.map((p: any) => ({ ...p, source: 'minishop' as const }))

  ok(res, { mbda, minishop, total: mbda.length + minishop.length })
}

// ── PATCH /admin/featured/item/:id ──────────────────────────────
// Set or remove featured on an MBDA Item, with optional duration in days
export async function setFeaturedItem(req: Request, res: Response): Promise<void> {
  const item = await prisma.item.findUnique({
    where: { id: req.params.id! },
    select: { id: true, title: true, isActive: true, soldAt: true },
  })
  if (!item) { notFound(res, 'Item no encontrado'); return }
  if (!item.isActive || item.soldAt) { badRequest(res, 'Solo se pueden destacar items activos'); return }

  const { featured, days } = req.body
  if (typeof featured !== 'boolean') { badRequest(res, 'El campo featured es requerido (boolean)'); return }

  let featuredUntil: Date | null = null
  if (featured && typeof days === 'number' && days > 0) {
    featuredUntil = new Date(Date.now() + days * 24 * 60 * 60 * 1000)
  }

  const updated = await prisma.item.update({
    where: { id: item.id },
    data: {
      featured,
      featuredAt: featured ? new Date() : null,
      featuredUntil: featured ? featuredUntil : null,
    },
  })

  ok(res, {
    id: updated.id,
    title: updated.title,
    featured: updated.featured,
    featuredAt: updated.featuredAt,
    featuredUntil: updated.featuredUntil,
  })
}

// ── PATCH /admin/featured/minishop-product/:id ──────────────────
// Set or remove featured on a MiniShopProduct, with optional duration in days
export async function setFeaturedMiniShopProduct(req: Request, res: Response): Promise<void> {
  const product = await prisma.miniShopProduct.findUnique({
    where: { id: req.params.id! },
    select: { id: true, title: true, status: true },
  })
  if (!product) { notFound(res, 'Producto no encontrado'); return }
  if (product.status !== 'APPROVED') { badRequest(res, 'Solo se pueden destacar productos aprobados'); return }

  const { featured, days } = req.body
  if (typeof featured !== 'boolean') { badRequest(res, 'El campo featured es requerido (boolean)'); return }

  let featuredUntil: Date | null = null
  if (featured && typeof days === 'number' && days > 0) {
    featuredUntil = new Date(Date.now() + days * 24 * 60 * 60 * 1000)
  }

  const updated = await prisma.miniShopProduct.update({
    where: { id: product.id },
    data: {
      featured,
      featuredAt: featured ? new Date() : null,
      featuredUntil: featured ? featuredUntil : null,
    },
  })

  ok(res, {
    id: updated.id,
    title: updated.title,
    featured: updated.featured,
    featuredAt: updated.featuredAt,
    featuredUntil: updated.featuredUntil,
  })
}

// ── GET /admin/featured/search ───────────────────────────────────
// Search products/items to feature (both MBDA and mini-shop)
export async function searchProductsToFeature(req: Request, res: Response): Promise<void> {
  const { q, source } = req.query
  if (!q || typeof q !== 'string' || q.trim().length < 2) {
    badRequest(res, 'Buscá al menos 2 caracteres'); return
  }

  const searchTerm = q.trim()
  const results: any[] = []

  if (!source || source === 'mbda') {
    const items = await prisma.item.findMany({
      where: {
        isActive: true,
        soldAt: null,
        title: { contains: searchTerm, mode: 'insensitive' },
      },
      take: 10,
      select: {
        id: true, title: true, price: true, code: true, featured: true,
        featuredUntil: true,
        photos: { orderBy: { order: 'asc' }, take: 1, select: { url: true } },
      },
    })
    items.forEach((i: any) => results.push({ ...i, source: 'mbda' }))
  }

  if (!source || source === 'minishop') {
    const products = await prisma.miniShopProduct.findMany({
      where: {
        status: 'APPROVED',
        miniShop: { status: 'ACTIVE' },
        title: { contains: searchTerm, mode: 'insensitive' },
      },
      take: 10,
      include: {
        photos: { orderBy: { order: 'asc' }, take: 1, select: { url: true, id: true, order: true } },
        miniShop: { select: { name: true } },
      },
    })
    products.forEach((p: any) => results.push({ ...p, source: 'minishop' }))
  }

  ok(res, results)
}

// ── PATCH /admin/minishops/products/:id/edit ─────────────────────
// Edit mini-shop product fields (title, price, description, productTypeId, sizeId)
export async function adminEditProduct(req: Request, res: Response): Promise<void> {
  const product = await prisma.miniShopProduct.findUnique({ where: { id: req.params.id! } })
  if (!product) { notFound(res, 'Producto no encontrado'); return }

  const { title, price, description, productTypeId, sizeId } = req.body
  const data: any = {}

  if (title && typeof title === 'string' && title.trim().length > 0) {
    data.title = title.trim()
  }
  if (price !== undefined) {
    const priceN = parseFloat(price)
    if (isNaN(priceN) || priceN < 0) { badRequest(res, 'Precio inválido'); return }
    data.price = priceN
  }
  if (description !== undefined) data.description = description?.trim() || null
  if (productTypeId !== undefined) data.productTypeId = productTypeId
  if (sizeId !== undefined) data.sizeId = sizeId || null

  if (Object.keys(data).length === 0) { badRequest(res, 'No hay cambios para aplicar'); return }

  const updated = await prisma.miniShopProduct.update({
    where: { id: product.id },
    data,
    include: {
      photos: { orderBy: { order: 'asc' }, take: 1 },
      productType: { select: { id: true, name: true } },
      size: { select: { id: true, name: true } },
      miniShop: { select: { id: true, name: true, slug: true, whatsapp: true, profilePhotoUrl: true } },
    },
  })

  ok(res, updated)
}
