import { Request, Response } from 'express'
import { z } from 'zod'
import {
  getAdminSubmissions, getAdminSubmissionById,
  approveItem, rejectItem, markItemInStore, markItemSold, markItemReturned,
  createUser as createUserService,
  updateUser as updateUserService,
  deleteUser as deleteUserService,
  createCatalogItem as createCatalogItemService,
  listProductTypes as listProductTypesService,
  toggleProductType as toggleProductTypeService,
  createSize as createSizeService,
  toggleSize as toggleSizeService,
  createTag as createTagService,
  toggleTag as toggleTagService,
} from '../services/admin.service'
import { getPhotoUrls } from '../services/upload.service'
import { prisma } from '../config/prisma'
import { ok, created, notFound, badRequest, conflict, serverError } from '../utils/apiResponse'
import { stripHtml } from '../utils/sanitize'

export async function listSubmissions(req: Request, res: Response): Promise<void> {
  const page = req.query.page ? parseInt(req.query.page as string, 10) : 1
  const result = await getAdminSubmissions({
    storeId: req.query.storeId as string,
    status: req.query.status as string | undefined,
    page,
  })
  ok(res, result.submissions, { page: result.page, limit: result.limit, total: result.total })
}

export async function getSubmission(req: Request, res: Response): Promise<void> {
  const submission = await getAdminSubmissionById(req.params.id!)
  if (!submission) { notFound(res); return }
  ok(res, submission)
}

export async function approve(req: Request, res: Response): Promise<void> {
  const result = await approveItem(req.params.itemId!)
  if (!result) { notFound(res, 'Prenda no encontrada'); return }
  ok(res, result)
}

export async function reject(req: Request, res: Response): Promise<void> {
  const schema = z.object({ adminComment: z.string().min(1, 'Se requiere un motivo de rechazo') })
  const parsed = schema.safeParse(req.body)
  if (!parsed.success) { badRequest(res, parsed.error.errors[0]?.message ?? 'Datos inválidos'); return }

  const result = await rejectItem(req.params.itemId!, parsed.data.adminComment)
  if (!result) { notFound(res, 'Prenda no encontrada'); return }
  ok(res, result)
}

export async function markInStore(req: Request, res: Response): Promise<void> {
  const result = await markItemInStore(req.params.itemId!)
  if (!result) { notFound(res, 'Prenda no encontrada'); return }
  ok(res, result)
}

export async function markSold(req: Request, res: Response): Promise<void> {
  const result = await markItemSold(req.params.itemId!)
  if (!result) { notFound(res, 'Prenda no encontrada o sin item de catálogo asociado'); return }
  ok(res, result)
}

export async function markReturned(req: Request, res: Response): Promise<void> {
  const result = await markItemReturned(req.params.itemId!)
  if (!result) { notFound(res, 'Prenda no encontrada'); return }
  ok(res, result)
}

export async function editCatalogItem(req: Request, res: Response): Promise<void> {
  const schema = z.object({
    title: z.string().min(1).optional(),
    description: z.string().optional(),
    price: z.number().positive().optional(),
    commission: z.number().min(0).max(100).optional(),
    isActive: z.boolean().optional(),
    productTypeId: z.string().min(1).optional(),
    sizeId: z.string().min(1).optional().nullable(),
    condition: z.enum(['NUEVA_CON_ETIQUETA', 'NUEVA_SIN_ETIQUETA', 'COMO_NUEVA', 'BUEN_ESTADO', 'USO_MODERADO', 'USO_INTENSO']).optional(),
    quantity: z.number().int().positive().optional(),
    isOwnProduct: z.boolean().optional(),
    promoterCommissionPct: z.number().min(0).max(100).optional().nullable(),
  })
  const parsed = schema.safeParse(req.body)
  if (!parsed.success) { badRequest(res, 'Datos inválidos'); return }

  try {
    const sanitized = { ...parsed.data } as Record<string, any>
    if (typeof sanitized.title === 'string') sanitized.title = stripHtml(sanitized.title)
    if (typeof sanitized.description === 'string') sanitized.description = stripHtml(sanitized.description)
    const item = await prisma.item.update({ where: { id: req.params.id! }, data: sanitized })
    ok(res, item)
  } catch {
    notFound(res, 'Item no encontrado')
  }
}

export async function softDeleteCatalogItem(req: Request, res: Response): Promise<void> {
  try {
    await prisma.item.update({ where: { id: req.params.id! }, data: { isActive: false } })
    ok(res, { message: 'Item desactivado del catálogo' })
  } catch {
    notFound(res, 'Item no encontrado')
  }
}

export async function createCatalogItem(req: Request, res: Response): Promise<void> {
  const schema = z.object({
    title: z.string().min(1, 'Título requerido'),
    description: z.string().optional(),
    condition: z.enum(['NUEVA_CON_ETIQUETA', 'NUEVA_SIN_ETIQUETA', 'COMO_NUEVA', 'BUEN_ESTADO', 'USO_MODERADO', 'USO_INTENSO']),
    productTypeId: z.string().min(1, 'Tipo de producto requerido'),
    sizeId: z.string().min(1).optional().nullable(),
    tagIds: z.array(z.string().min(1)).optional().default([]),
    quantity: z.number().int().positive().optional().default(1),
    price: z.number().positive('Precio debe ser mayor a 0'),
    minimumPrice: z.number().positive().optional(),
    commission: z.number().min(0).max(100),
    storeId: z.string().min(1, 'Tienda requerida'),
    isOwnProduct: z.boolean().optional().default(false),
    promoterCommissionPct: z.number().min(0).max(100).optional().nullable(),
  })
  const parsed = schema.safeParse(req.body)
  if (!parsed.success) { badRequest(res, parsed.error.errors[0]?.message ?? 'Datos inválidos'); return }

  try {
    const sanitized = { ...parsed.data }
    sanitized.title = stripHtml(sanitized.title)
    if (sanitized.description) sanitized.description = stripHtml(sanitized.description)
    const item = await createCatalogItemService(sanitized)
    created(res, item)
  } catch {
    serverError(res)
  }
}

export async function listCatalog(req: Request, res: Response): Promise<void> {
  const page = req.query.page ? parseInt(req.query.page as string, 10) : 1
  const limit = 20
  const skip = (page - 1) * limit

  const [items, total] = await prisma.$transaction([
    prisma.item.findMany({
      skip,
      take: limit,
      orderBy: { submissionItem: { updatedAt: 'desc' } },
      include: {
        photos: { orderBy: { order: 'asc' } },
        productType: true,
        size: true,
        tags: { include: { tag: true } },
        submissionItem: {
          select: {
            status: true,
            submission: { select: { seller: { select: { firstName: true, lastName: true, phone: true } } } },
          },
        },
      },
    }),
    prisma.item.count(),
  ])
  ok(res, items, { page, limit, total })
}

export async function listUsers(req: Request, res: Response): Promise<void> {
  const page = req.query.page ? parseInt(req.query.page as string, 10) : 1
  const limit = 20
  const skip = (page - 1) * limit
  const search = req.query.search as string | undefined

  const where = search
    ? { OR: [
        { email: { contains: search, mode: 'insensitive' as const } },
        { firstName: { contains: search, mode: 'insensitive' as const } },
        { lastName: { contains: search, mode: 'insensitive' as const } },
      ] }
    : {}

  const [users, total] = await prisma.$transaction([
    prisma.user.findMany({
      where, skip, take: limit, orderBy: { createdAt: 'desc' },
      select: { id: true, email: true, firstName: true, lastName: true, phone: true, role: true, isActive: true, createdAt: true, _count: { select: { submissions: true } } },
    }),
    prisma.user.count({ where }),
  ])
  ok(res, users, { page, limit, total })
}

export async function deactivateUser(req: Request, res: Response): Promise<void> {
  try {
    await prisma.user.update({ where: { id: req.params.id! }, data: { isActive: false } })
    ok(res, { message: 'Usuario desactivado' })
  } catch {
    notFound(res, 'Usuario no encontrado')
  }
}

export async function updateUser(req: Request, res: Response): Promise<void> {
  const schema = z.object({
    firstName: z.string().min(1).optional(),
    lastName: z.string().min(1).optional(),
    email: z.string().email('Email inválido').optional(),
    phone: z.string().optional().nullable(),
    dni: z.string().optional().nullable(),
    role: z.enum(['USER', 'ADMIN']).optional(),
    isActive: z.boolean().optional(),
    password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres').optional(),
  })
  const parsed = schema.safeParse(req.body)
  if (!parsed.success) { badRequest(res, parsed.error.errors[0]?.message ?? 'Datos inválidos'); return }

  try {
    const user = await updateUserService(req.params.id!, parsed.data)
    ok(res, user)
  } catch (err: unknown) {
    const e = err as NodeJS.ErrnoException & { code?: string; meta?: { target?: string[] } }
    if (e.code === 'P2002') {
      conflict(res, 'El email ya está en uso')
      return
    }
    if (e.code === 'P2025') {
      notFound(res, 'Usuario no encontrado')
      return
    }
    serverError(res)
  }
}

export async function deleteUser(req: Request, res: Response): Promise<void> {
  try {
    await deleteUserService(req.params.id!)
    ok(res, { message: 'Usuario eliminado' })
  } catch {
    notFound(res, 'Usuario no encontrado')
  }
}

export async function deleteItemPhoto(req: Request, res: Response): Promise<void> {
  try {
    const photo = await prisma.itemPhoto.findUnique({ where: { id: req.params.photoId! } })
    if (!photo) { notFound(res, 'Foto no encontrada'); return }
    await prisma.itemPhoto.delete({ where: { id: req.params.photoId! } })
    ok(res, { deleted: true })
  } catch {
    serverError(res)
  }
}

export async function uploadCatalogItemPhotos(req: Request, res: Response): Promise<void> {
  const files = req.files as Express.Multer.File[] | undefined
  if (!files || files.length === 0) { badRequest(res, 'No se enviaron fotos'); return }
  if (files.length > 5) { badRequest(res, 'Máximo 5 fotos permitidas'); return }

  try {
    const item = await prisma.item.findUnique({ where: { id: req.params.id! }, select: { id: true } })
    if (!item) { notFound(res, 'Item no encontrado'); return }

    const urls = await getPhotoUrls(files)
    const existingCount = await prisma.itemPhoto.count({ where: { itemId: item.id } })
    const photos = await prisma.$transaction(
      urls.map((url, i) =>
        prisma.itemPhoto.create({ data: { itemId: item.id, url, order: existingCount + i } })
      )
    )
    ok(res, photos)
  } catch {
    serverError(res)
  }
}

export async function createUser(req: Request, res: Response): Promise<void> {
  const schema = z.object({
    email: z.string().email('Email inválido').toLowerCase(),
    password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
    firstName: z.string().min(1, 'Nombre requerido'),
    lastName: z.string().min(1, 'Apellido requerido'),
    phone: z.string().optional(),
    role: z.enum(['USER', 'ADMIN']),
    storeId: z.string().optional(),
  })
  const parsed = schema.safeParse(req.body)
  if (!parsed.success) { badRequest(res, parsed.error.errors[0]?.message ?? 'Datos inválidos'); return }

  try {
    const sanitized = { ...parsed.data }
    sanitized.firstName = stripHtml(sanitized.firstName)
    sanitized.lastName = stripHtml(sanitized.lastName)
    const user = await createUserService(sanitized)
    created(res, user)
  } catch (err: unknown) {
    if ((err as NodeJS.ErrnoException).code === 'EMAIL_IN_USE') {
      conflict(res, 'El email ya está registrado')
      return
    }
    serverError(res)
  }
}

export async function getDashboardStats(req: Request, res: Response): Promise<void> {
  try {
    const [pending, inStore, soldThisMonth] = await prisma.$transaction([
      prisma.submissionItem.count({ where: { status: 'PENDING' } }),
      prisma.submissionItem.count({ where: { status: 'IN_STORE' } }),
      prisma.submissionItem.count({
        where: {
          status: 'SOLD',
          updatedAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
        },
      }),
    ])
    ok(res, { pending, inStore, soldThisMonth })
  } catch {
    serverError(res)
  }
}

// ─── Product Type / Size / Tag endpoints ────────────────────

export async function listProductTypes(req: Request, res: Response): Promise<void> {
  const productTypes = await listProductTypesService()
  ok(res, productTypes)
}

export async function toggleProductType(req: Request, res: Response): Promise<void> {
  const result = await toggleProductTypeService(req.params.id!)
  if (!result) { notFound(res, 'Tipo de producto no encontrado'); return }
  ok(res, result)
}

export async function createSize(req: Request, res: Response): Promise<void> {
  const schema = z.object({
    name: z.string().min(1, 'Nombre requerido'),
    productTypeId: z.string().min(1, 'Tipo de producto requerido'),
  })
  const parsed = schema.safeParse(req.body)
  if (!parsed.success) { badRequest(res, parsed.error.errors[0]?.message ?? 'Datos inválidos'); return }

  try {
    const size = await createSizeService(parsed.data.name, parsed.data.productTypeId)
    created(res, size)
  } catch {
    conflict(res, 'El talle ya existe para este tipo de producto')
  }
}

export async function toggleSize(req: Request, res: Response): Promise<void> {
  const result = await toggleSizeService(req.params.id!)
  if (!result) { notFound(res, 'Talle no encontrado'); return }
  ok(res, result)
}

export async function createTag(req: Request, res: Response): Promise<void> {
  const schema = z.object({
    name: z.string().min(1, 'Nombre requerido'),
    productTypeId: z.string().min(1, 'Tipo de producto requerido'),
  })
  const parsed = schema.safeParse(req.body)
  if (!parsed.success) { badRequest(res, parsed.error.errors[0]?.message ?? 'Datos inválidos'); return }

  try {
    const tag = await createTagService(parsed.data.name, parsed.data.productTypeId)
    created(res, tag)
  } catch {
    conflict(res, 'La etiqueta ya existe para este tipo de producto')
  }
}

export async function toggleTag(req: Request, res: Response): Promise<void> {
  const result = await toggleTagService(req.params.id!)
  if (!result) { notFound(res, 'Etiqueta no encontrada'); return }
  ok(res, result)
}
