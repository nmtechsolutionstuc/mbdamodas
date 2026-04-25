import { Request, Response } from 'express'
import { z } from 'zod'
import { prisma } from '../config/prisma'
import { ok, created, notFound, badRequest } from '../utils/apiResponse'
import { stripHtml } from '../utils/sanitize'

const storeSchema = z.object({
  name: z.string().min(1).max(200),
  address: z.string().max(300).optional().nullable(),
  phone: z.string().max(30).optional().nullable(),
  email: z.union([z.string().email(), z.literal(''), z.null()]).optional().transform(v => v === '' ? null : v),
  description: z.string().max(1000).optional().nullable(),
  logoUrl: z.union([z.string().url(), z.literal(''), z.null()]).optional().transform(v => v === '' ? null : v),
  defaultCommission: z.preprocess(v => { const n = Number(v); return (v === null || v === undefined || isNaN(n)) ? undefined : n }, z.number().min(0).max(100).optional()),
  isActive: z.boolean().nullable().optional().transform(v => v ?? undefined),
  storeAttendantPhone: z.string().max(30).optional().nullable(),
  announcementText: z.string().max(500).optional().nullable(),
  announcementActive: z.boolean().nullable().optional().transform(v => v ?? undefined),
  // Banners editables de la homepage
  bannerBuyerSubtitle: z.string().max(200).optional().nullable(),
  bannerBuyerTitle: z.string().max(300).optional().nullable(),
  bannerBuyerDescription: z.string().max(500).optional().nullable(),
  bannerBuyerButtonActive: z.boolean().nullable().optional().transform(v => v ?? undefined),
  bannerSellerSubtitle: z.string().max(200).optional().nullable(),
  bannerSellerTitle: z.string().max(300).optional().nullable(),
  bannerSellerDescription: z.string().max(500).optional().nullable(),
  bannerSellerButtonActive: z.boolean().nullable().optional().transform(v => v ?? undefined),
  // Contenido de páginas
  aboutContent: z.string().max(10000).optional().nullable(),
  termsContent: z.string().max(20000).optional().nullable(),
  // Configuración del menú
  menuConfig: z.record(z.any()).optional().nullable(),
  // Cards de propuesta de valor (homepage)
  featureCards: z.record(z.any()).optional().nullable(),
  bannerReservarButtonActive: z.boolean().nullable().optional().transform(v => v ?? undefined),
  bannerExtraButtonActive: z.boolean().nullable().optional().transform(v => v ?? undefined),
  bannerExtraButtonText: z.string().max(100).optional().nullable(),
  bannerExtraButtonUrl: z.string().max(500).optional().nullable(),
  socialLinks: z.record(z.any()).optional().nullable(),
  footerConfig: z.record(z.any()).optional().nullable(),
  aboutConfig: z.record(z.any()).optional().nullable(),
  conditionConfig: z.record(z.any()).optional().nullable(),
  featuredSectionTitle: z.string().max(100).optional().nullable(),
  videoSection: z.record(z.any()).optional().nullable(),
})

export async function getAnnouncement(_req: Request, res: Response): Promise<void> {
  const store = await prisma.store.findFirst({
    where: { isActive: true, announcementActive: true },
    select: { announcementText: true },
  })
  ok(res, { text: store?.announcementText ?? null })
}

export async function getHomeBanners(_req: Request, res: Response): Promise<void> {
  const store = await prisma.store.findFirst({
    where: { isActive: true },
    select: {
      bannerBuyerSubtitle: true,
      bannerBuyerTitle: true,
      bannerBuyerDescription: true,
      bannerBuyerButtonActive: true,
      bannerSellerSubtitle: true,
      bannerSellerTitle: true,
      bannerSellerDescription: true,
      bannerSellerButtonActive: true,
      bannerReservarButtonActive: true,
      bannerExtraButtonActive: true,
      bannerExtraButtonText: true,
      bannerExtraButtonUrl: true,
    },
  })
  ok(res, {
    buyer: {
      subtitle: store?.bannerBuyerSubtitle ?? null,
      title: store?.bannerBuyerTitle ?? null,
      description: store?.bannerBuyerDescription ?? null,
      buttonActive: store?.bannerBuyerButtonActive ?? true,
    },
    seller: {
      subtitle: store?.bannerSellerSubtitle ?? null,
      title: store?.bannerSellerTitle ?? null,
      description: store?.bannerSellerDescription ?? null,
      buttonActive: store?.bannerSellerButtonActive ?? true,
      reservarButtonActive: store?.bannerReservarButtonActive ?? true,
      extraButtonActive: store?.bannerExtraButtonActive ?? false,
      extraButtonText: store?.bannerExtraButtonText ?? 'Ver más',
      extraButtonUrl: store?.bannerExtraButtonUrl ?? '',
    },
  })
}

export async function getMenuConfig(_req: Request, res: Response): Promise<void> {
  const store = await prisma.store.findFirst({
    where: { isActive: true },
    select: { menuConfig: true },
  })
  ok(res, { menuConfig: store?.menuConfig ?? null })
}

export async function getFeatureCards(_req: Request, res: Response): Promise<void> {
  const store = await prisma.store.findFirst({
    where: { isActive: true },
    select: { featureCards: true },
  })
  ok(res, { featureCards: store?.featureCards ?? null })
}

export async function getAboutContent(_req: Request, res: Response): Promise<void> {
  const store = await prisma.store.findFirst({
    where: { isActive: true },
    select: { aboutContent: true },
  })
  ok(res, { content: store?.aboutContent ?? null })
}

export async function getTermsContent(_req: Request, res: Response): Promise<void> {
  const store = await prisma.store.findFirst({
    where: { isActive: true },
    select: { termsContent: true },
  })
  ok(res, { content: store?.termsContent ?? null })
}

export async function listStores(_req: Request, res: Response): Promise<void> {
  const stores = await prisma.store.findMany({ orderBy: { createdAt: 'asc' } })
  ok(res, stores)
}

function sanitizeStoreData(data: Record<string, any>): Record<string, any> {
  const textFields = [
    'name', 'address', 'description', 'announcementText',
    'bannerBuyerTitle', 'bannerBuyerSubtitle', 'bannerBuyerDescription',
    'bannerSellerTitle', 'bannerSellerSubtitle', 'bannerSellerDescription',
    'aboutContent', 'termsContent',
  ]
  const sanitized = { ...data }
  for (const field of textFields) {
    if (typeof sanitized[field] === 'string') {
      sanitized[field] = stripHtml(sanitized[field])
    }
  }
  return sanitized
}

export async function createStore(req: Request, res: Response): Promise<void> {
  const parsed = storeSchema.safeParse(req.body)
  if (!parsed.success) { badRequest(res, 'Datos inválidos', parsed.error.errors); return }
  const store = await prisma.store.create({ data: sanitizeStoreData(parsed.data) as Parameters<typeof prisma.store.create>[0]['data'] })
  created(res, store)
}

export async function updateStore(req: Request, res: Response): Promise<void> {
  const parsed = storeSchema.partial().safeParse(req.body)
  if (!parsed.success) {
    console.error('[updateStore] Zod errors:', JSON.stringify(parsed.error.errors, null, 2))
    badRequest(res, 'Datos inválidos', parsed.error.errors)
    return
  }
  try {
    const store = await prisma.store.update({ where: { id: req.params.id! }, data: sanitizeStoreData(parsed.data) })
    ok(res, store)
  } catch {
    notFound(res, 'Tienda no encontrada')
  }
}

export async function getStoreInfo(_req: Request, res: Response): Promise<void> {
  const store = await prisma.store.findFirst({
    where: { isActive: true },
    select: { name: true, phone: true, email: true, address: true, socialLinks: true, footerConfig: true, aboutConfig: true, conditionConfig: true, bannerSellerButtonActive: true, featuredSectionTitle: true, videoSection: true },
  })
  ok(res, { store: store ?? null })
}

export async function updateStoreContent(req: Request, res: Response): Promise<void> {
  const store = await prisma.store.findFirst({ where: { isActive: true } })
  if (!store) { notFound(res, 'Tienda no encontrada'); return }
  const schema = z.object({
    termsContent: z.string().max(50000).optional().nullable(),
    aboutContent: z.string().max(50000).optional().nullable(),
  })
  const parsed = schema.safeParse(req.body)
  if (!parsed.success) { badRequest(res, 'Datos inválidos', parsed.error.errors); return }
  await prisma.store.update({ where: { id: store.id }, data: parsed.data })
  ok(res, { success: true })
}
