import { Request, Response } from 'express'
import { z } from 'zod'
import { prisma } from '../config/prisma'
import { ok, created, notFound, badRequest, forbidden, conflict } from '../utils/apiResponse'
import { getUploadedFileUrl, getPhotoUrls } from '../services/upload.service'

// Solo dígitos, espacios, +, -, (, ) — bloquea URLs y scripts inyectados
const phoneRegex = /^[\d\s+\-().]+$/

// ── Helpers ────────────────────────────────────────────────────

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

async function uniqueSlug(base: string): Promise<string> {
  let slug = slugify(base)
  if (!slug) slug = 'tienda'
  let candidate = slug
  let counter = 1
  while (await prisma.miniShop.findUnique({ where: { slug: candidate } })) {
    counter++
    candidate = `${slug}-${counter}`
  }
  return candidate
}

async function productSlug(title: string): Promise<string> {
  let slug = slugify(title)
  if (!slug) slug = 'producto'
  let candidate = slug
  let counter = 1
  while (await prisma.miniShopProduct.findUnique({ where: { slug: candidate } })) {
    counter++
    candidate = `${slug}-${counter}`
  }
  return candidate
}

// ── Schemas ────────────────────────────────────────────────────

const createShopSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().max(500).optional(),
  whatsapp: z.string().min(7).max(20).regex(phoneRegex, 'Formato de teléfono inválido'),
  socialLinks: z.object({
    instagram: z.string().max(200).optional(),
    tiktok: z.string().max(200).optional(),
    facebook: z.string().max(200).optional(),
    otra: z.string().max(200).optional(),
  }).optional(),
  deliveryMethods: z.object({
    meetingPoint: z.boolean(),
    address: z.string().max(300).optional(),
    shipping: z.boolean(),
    otro: z.boolean().optional(),
    otroText: z.string().max(300).optional(),
  }).refine(d => d.meetingPoint || d.shipping || d.otro, { message: 'Al menos un método de entrega es obligatorio' }),
  acceptedTerms: z.literal(true, { errorMap: () => ({ message: 'Debés aceptar los términos y condiciones' }) }),
})

const updateShopSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  description: z.string().max(500).optional().nullable(),
  whatsapp: z.string().min(7).max(20).regex(phoneRegex, 'Formato de teléfono inválido').optional(),
  socialLinks: z.object({
    instagram: z.string().max(200).optional(),
    tiktok: z.string().max(200).optional(),
    facebook: z.string().max(200).optional(),
    otra: z.string().max(200).optional(),
  }).optional(),
  deliveryMethods: z.object({
    meetingPoint: z.boolean(),
    address: z.string().max(300).optional(),
    shipping: z.boolean(),
    otro: z.boolean().optional(),
    otroText: z.string().max(300).optional(),
  }).optional(),
})

const createProductSchema = z.object({
  title: z.string().min(2).max(200),
  description: z.string().max(2000).optional(),
  price: z.number().positive(),
  productTypeId: z.string().uuid(),
  sizeId: z.string().uuid().optional(),
  quantity: z.number().int().min(1).optional(),
  tagIds: z.array(z.string().uuid()).optional(),
})

// ── MiniShop CRUD ──────────────────────────────────────────────

export async function listMyShops(req: Request, res: Response): Promise<void> {
  const shops = await prisma.miniShop.findMany({
    where: { userId: req.user!.sub, status: { not: 'DELETED' } },
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { products: { where: { status: 'APPROVED' } } } } },
  })
  ok(res, shops)
}

export async function createShop(req: Request, res: Response): Promise<void> {
  const parsed = createShopSchema.safeParse(req.body)
  if (!parsed.success) { badRequest(res, 'Datos inválidos', parsed.error.errors); return }

  const slug = await uniqueSlug(parsed.data.name)

  const shop = await prisma.miniShop.create({
    data: {
      name: parsed.data.name,
      slug,
      description: parsed.data.description ?? null,
      whatsapp: parsed.data.whatsapp,
      socialLinks: parsed.data.socialLinks ?? {},
      deliveryMethods: parsed.data.deliveryMethods,
      acceptedTerms: true,
      userId: req.user!.sub,
    },
  })
  created(res, shop)
}

export async function getMyShop(req: Request, res: Response): Promise<void> {
  const shop = await prisma.miniShop.findFirst({
    where: { id: req.params.shopId!, userId: req.user!.sub, status: { not: 'DELETED' } },
    include: { _count: { select: { products: true } } },
  })
  if (!shop) { notFound(res, 'Tienda no encontrada'); return }
  ok(res, shop)
}

export async function updateShop(req: Request, res: Response): Promise<void> {
  const shop = await prisma.miniShop.findFirst({
    where: { id: req.params.shopId!, userId: req.user!.sub, status: { not: 'DELETED' } },
  })
  if (!shop) { notFound(res, 'Tienda no encontrada'); return }

  const parsed = updateShopSchema.safeParse(req.body)
  if (!parsed.success) { badRequest(res, 'Datos inválidos', parsed.error.errors); return }

  const data: Record<string, unknown> = { ...parsed.data }

  // If name changed, regenerate slug
  if (parsed.data.name && parsed.data.name !== shop.name) {
    data.slug = await uniqueSlug(parsed.data.name)
  }

  const updated = await prisma.miniShop.update({ where: { id: shop.id }, data })
  ok(res, updated)
}

export async function uploadShopPhoto(req: Request, res: Response): Promise<void> {
  const shop = await prisma.miniShop.findFirst({
    where: { id: req.params.shopId!, userId: req.user!.sub, status: { not: 'DELETED' } },
  })
  if (!shop) { notFound(res, 'Tienda no encontrada'); return }
  if (!req.file) { badRequest(res, 'No se recibió imagen'); return }

  const url = await getUploadedFileUrl(req.file)
  const updated = await prisma.miniShop.update({ where: { id: shop.id }, data: { profilePhotoUrl: url } })
  ok(res, updated)
}

export async function toggleShopStatus(req: Request, res: Response): Promise<void> {
  const shop = await prisma.miniShop.findFirst({
    where: { id: req.params.shopId!, userId: req.user!.sub, status: { not: 'DELETED' } },
  })
  if (!shop) { notFound(res, 'Tienda no encontrada'); return }

  const newStatus = shop.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE'
  const updated = await prisma.miniShop.update({ where: { id: shop.id }, data: { status: newStatus } })
  ok(res, updated)
}

// ── MiniShop Products ──────────────────────────────────────────

export async function listShopProducts(req: Request, res: Response): Promise<void> {
  const shop = await prisma.miniShop.findFirst({
    where: { id: req.params.shopId!, userId: req.user!.sub, status: { not: 'DELETED' } },
  })
  if (!shop) { notFound(res, 'Tienda no encontrada'); return }

  const products = await prisma.miniShopProduct.findMany({
    where: { miniShopId: shop.id },
    orderBy: { createdAt: 'desc' },
    include: {
      photos: { orderBy: { order: 'asc' } },
      productType: true,
      size: true,
      tags: { include: { tag: true } },
    },
  })
  ok(res, products)
}

export async function createProduct(req: Request, res: Response): Promise<void> {
  const shop = await prisma.miniShop.findFirst({
    where: { id: req.params.shopId!, userId: req.user!.sub, status: { not: 'DELETED' } },
  })
  if (!shop) { notFound(res, 'Tienda no encontrada'); return }

  // Parse body from FormData (multer)
  const body = {
    ...req.body,
    price: req.body.price ? parseFloat(req.body.price) : undefined,
    quantity: req.body.quantity ? parseInt(req.body.quantity) : undefined,
    tagIds: req.body.tagIds ? (typeof req.body.tagIds === 'string' ? JSON.parse(req.body.tagIds) : req.body.tagIds) : undefined,
  }

  const parsed = createProductSchema.safeParse(body)
  if (!parsed.success) { badRequest(res, 'Datos inválidos', parsed.error.errors); return }

  const files = req.files as Express.Multer.File[] | undefined
  if (!files || files.length === 0) { badRequest(res, 'Se requiere al menos 1 foto'); return }
  if (files.length > 3) { badRequest(res, 'Máximo 3 fotos por producto'); return }

  const slug = await productSlug(parsed.data.title)

  // Upload photos
  const photoUrls = await getPhotoUrls(files)

  const product = await prisma.miniShopProduct.create({
    data: {
      title: parsed.data.title,
      slug,
      description: parsed.data.description ?? null,
      price: parsed.data.price,
      quantity: parsed.data.quantity ?? 1,
      productTypeId: parsed.data.productTypeId,
      sizeId: parsed.data.sizeId ?? null,
      miniShopId: shop.id,
      photos: {
        create: photoUrls.map((url, i) => ({ url, order: i })),
      },
      tags: parsed.data.tagIds?.length
        ? { create: parsed.data.tagIds.map(tagId => ({ tagId })) }
        : undefined,
    },
    include: {
      photos: { orderBy: { order: 'asc' } },
      productType: true,
      size: true,
      tags: { include: { tag: true } },
    },
  })

  created(res, product)
}

export async function toggleProductStatus(req: Request, res: Response): Promise<void> {
  const shop = await prisma.miniShop.findFirst({
    where: { id: req.params.shopId!, userId: req.user!.sub, status: { not: 'DELETED' } },
  })
  if (!shop) { notFound(res, 'Tienda no encontrada'); return }

  const product = await prisma.miniShopProduct.findFirst({
    where: { id: req.params.productId!, miniShopId: shop.id },
  })
  if (!product) { notFound(res, 'Producto no encontrado'); return }
  if (product.status === 'PENDING' || product.status === 'REJECTED') {
    badRequest(res, 'Solo se pueden pausar/reactivar productos aprobados'); return
  }

  const newStatus = product.status === 'APPROVED' ? 'PAUSED' : 'APPROVED'
  const updated = await prisma.miniShopProduct.update({ where: { id: product.id }, data: { status: newStatus } })
  ok(res, updated)
}

export async function deleteProduct(req: Request, res: Response): Promise<void> {
  const shop = await prisma.miniShop.findFirst({
    where: { id: req.params.shopId!, userId: req.user!.sub, status: { not: 'DELETED' } },
  })
  if (!shop) { notFound(res, 'Tienda no encontrada'); return }

  const product = await prisma.miniShopProduct.findFirst({
    where: { id: req.params.productId!, miniShopId: shop.id },
  })
  if (!product) { notFound(res, 'Producto no encontrado'); return }

  await prisma.miniShopProduct.delete({ where: { id: product.id } })
  ok(res, { deleted: true })
}

// ── Public: perfil de minitienda ───────────────────────────────

export async function getPublicShopProfile(req: Request, res: Response): Promise<void> {
  const shop = await prisma.miniShop.findFirst({
    where: { slug: req.params.slug!, status: 'ACTIVE' },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      profilePhotoUrl: true,
      whatsapp: true,
      socialLinks: true,
      deliveryMethods: true,
      createdAt: true,
    },
  })
  if (!shop) { notFound(res, 'Tienda no encontrada'); return }
  ok(res, shop)
}

export async function getPublicShopProducts(req: Request, res: Response): Promise<void> {
  const shop = await prisma.miniShop.findFirst({
    where: { slug: req.params.slug!, status: 'ACTIVE' },
    select: { id: true },
  })
  if (!shop) { notFound(res, 'Tienda no encontrada'); return }

  const products = await prisma.miniShopProduct.findMany({
    where: { miniShopId: shop.id, status: 'APPROVED' },
    orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
    include: {
      photos: { orderBy: { order: 'asc' } },
      productType: true,
      size: true,
      tags: { include: { tag: true } },
    },
  })
  ok(res, products)
}

// ── Productos aprobados de una tienda (para sección "Destacar") ─

export async function updateProductQuantity(req: Request, res: Response): Promise<void> {
  const shop = await prisma.miniShop.findFirst({
    where: { id: req.params.shopId!, userId: req.user!.sub, status: { not: 'DELETED' } },
  })
  if (!shop) { notFound(res, 'Tienda no encontrada'); return }

  const product = await prisma.miniShopProduct.findFirst({
    where: { id: req.params.productId!, miniShopId: shop.id, status: 'APPROVED' },
  })
  if (!product) { notFound(res, 'Producto no encontrado'); return }

  const quantity = parseInt(req.body.quantity)
  if (!quantity || quantity < 1 || quantity > 9999) {
    badRequest(res, 'Cantidad inválida'); return
  }

  const updated = await prisma.miniShopProduct.update({
    where: { id: product.id },
    data: { quantity },
    include: { photos: { orderBy: { order: 'asc' }, take: 1 } },
  })
  ok(res, updated)
}

export async function listApprovedProducts(req: Request, res: Response): Promise<void> {
  const shop = await prisma.miniShop.findFirst({
    where: { id: req.params.shopId!, userId: req.user!.sub, status: { not: 'DELETED' } },
  })
  if (!shop) { notFound(res, 'Tienda no encontrada'); return }

  const products = await prisma.miniShopProduct.findMany({
    where: { miniShopId: shop.id, status: 'APPROVED' },
    orderBy: { createdAt: 'desc' },
    include: {
      photos: { orderBy: { order: 'asc' }, take: 1 },
    },
  })
  ok(res, products)
}
