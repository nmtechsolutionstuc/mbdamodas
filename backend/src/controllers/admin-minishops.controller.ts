import { Request, Response } from 'express'
import { prisma } from '../config/prisma'
import { ok, notFound, badRequest } from '../utils/apiResponse'

function buildWaLink(whatsapp: string, message: string): string {
  return `https://wa.me/${whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`
}

const PRODUCT_INCLUDE = {
  photos: { orderBy: { order: 'asc' as const }, take: 1 },
  productType: { select: { id: true, name: true } },
  size: { select: { id: true, name: true } },
  miniShop: { select: { id: true, name: true, slug: true, whatsapp: true, profilePhotoUrl: true } },
}

// ── GET /admin/minishops ─────────────────────────────────────────
export async function adminListShops(req: Request, res: Response): Promise<void> {
  const { status, search, page, limit } = req.query
  const pageN = Math.max(1, parseInt(page as string) || 1)
  const limitN = Math.min(50, Math.max(1, parseInt(limit as string) || 20))
  const offset = (pageN - 1) * limitN

  const where: any = { status: { not: 'DELETED' } }
  if (status && status !== 'ALL') where.status = status
  if (search) where.name = { contains: search, mode: 'insensitive' }

  const [total, shops] = await Promise.all([
    prisma.miniShop.count({ where }),
    prisma.miniShop.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: offset,
      take: limitN,
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
        _count: { select: { products: true } },
      },
    }),
  ])

  ok(res, shops, { page: pageN, limit: limitN, total })
}

// ── PATCH /admin/minishops/:id ───────────────────────────────────
export async function adminUpdateShop(req: Request, res: Response): Promise<void> {
  const shop = await prisma.miniShop.findFirst({
    where: { id: req.params.id!, status: { not: 'DELETED' } },
  })
  if (!shop) { notFound(res, 'Tienda no encontrada'); return }

  const { status, name, description } = req.body
  const data: any = {}
  if (status && ['ACTIVE', 'PAUSED', 'DELETED'].includes(status)) data.status = status
  if (name) data.name = name
  if (description !== undefined) data.description = description

  const updated = await prisma.miniShop.update({ where: { id: shop.id }, data })
  ok(res, updated)
}

// ── GET /admin/minishops/products ────────────────────────────────
export async function adminListProducts(req: Request, res: Response): Promise<void> {
  const { status, search, miniShopId, page, limit } = req.query
  const pageN = Math.max(1, parseInt(page as string) || 1)
  const limitN = Math.min(50, Math.max(1, parseInt(limit as string) || 20))
  const offset = (pageN - 1) * limitN

  const where: any = {}
  if (status && status !== 'ALL') where.status = status
  if (miniShopId) where.miniShopId = miniShopId
  if (search) where.title = { contains: search, mode: 'insensitive' }

  const [total, products] = await Promise.all([
    prisma.miniShopProduct.count({ where }),
    prisma.miniShopProduct.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: offset,
      take: limitN,
      include: PRODUCT_INCLUDE,
    }),
  ])

  ok(res, products, { page: pageN, limit: limitN, total })
}

// ── PATCH /admin/minishops/products/:id/approve ──────────────────
export async function adminApproveProduct(req: Request, res: Response): Promise<void> {
  const product = await prisma.miniShopProduct.findUnique({
    where: { id: req.params.id! },
    include: { miniShop: { select: { name: true, whatsapp: true } } },
  })
  if (!product) { notFound(res, 'Producto no encontrado'); return }
  if (product.status !== 'PENDING') { badRequest(res, 'Solo se pueden aprobar productos pendientes'); return }

  const updated = await prisma.miniShopProduct.update({
    where: { id: product.id },
    data: { status: 'APPROVED', rejectionReason: null },
    include: PRODUCT_INCLUDE,
  })

  const shop = (product as any).miniShop
  const waMsg = `✅ ¡Hola ${shop.name}! Tu producto "${product.title}" fue aprobado y ya está visible en el catálogo de MBDA Market. ¡Felicitaciones! 🎉`
  const whatsappLink = buildWaLink(shop.whatsapp, waMsg)

  ok(res, { product: updated, whatsappLink })
}

// ── PATCH /admin/minishops/products/:id/reject ───────────────────
export async function adminRejectProduct(req: Request, res: Response): Promise<void> {
  const product = await prisma.miniShopProduct.findUnique({
    where: { id: req.params.id! },
    include: { miniShop: { select: { name: true, whatsapp: true } } },
  })
  if (!product) { notFound(res, 'Producto no encontrado'); return }
  if (product.status !== 'PENDING') { badRequest(res, 'Solo se pueden rechazar productos pendientes'); return }

  const { reason } = req.body
  if (!reason || typeof reason !== 'string' || reason.trim().length < 3) {
    badRequest(res, 'El motivo de rechazo es obligatorio'); return
  }

  const updated = await prisma.miniShopProduct.update({
    where: { id: product.id },
    data: { status: 'REJECTED', rejectionReason: reason.trim() },
    include: PRODUCT_INCLUDE,
  })

  const shop = (product as any).miniShop
  const waMsg = `❌ Hola ${shop.name}. Tu producto "${product.title}" no pudo ser aceptado en el catálogo. Motivo: ${reason.trim()}`
  const whatsappLink = buildWaLink(shop.whatsapp, waMsg)

  ok(res, { product: updated, whatsappLink })
}

// ── PATCH /admin/minishops/products/:id/toggle-featured ──────────
export async function adminToggleFeatured(req: Request, res: Response): Promise<void> {
  const product = await prisma.miniShopProduct.findUnique({ where: { id: req.params.id! } })
  if (!product) { notFound(res, 'Producto no encontrado'); return }
  if (product.status !== 'APPROVED') { badRequest(res, 'Solo se pueden destacar productos aprobados'); return }

  const newFeatured = !product.featured
  const updated = await prisma.miniShopProduct.update({
    where: { id: product.id },
    data: {
      featured: newFeatured,
      featuredAt: newFeatured ? new Date() : null,
      featuredUntil: null,
    },
    include: PRODUCT_INCLUDE,
  })
  ok(res, updated)
}

// ── GET /admin/minishops/products/pending-count ──────────────────
export async function adminPendingCount(req: Request, res: Response): Promise<void> {
  const count = await prisma.miniShopProduct.count({ where: { status: 'PENDING' } })
  ok(res, { count })
}
