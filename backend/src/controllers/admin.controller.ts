import { Request, Response } from 'express'
import { z } from 'zod'
import {
  getAdminSubmissions, getAdminSubmissionById,
  approveItem, rejectItem, markItemInStore, markItemSold, markItemReturned,
} from '../services/admin.service'
import { prisma } from '../config/prisma'
import { ok, notFound, badRequest, serverError } from '../utils/apiResponse'

export async function listSubmissions(req: Request, res: Response): Promise<void> {
  const page = req.query.page ? parseInt(req.query.page as string, 10) : 1
  const result = await getAdminSubmissions({ storeId: req.query.storeId as string, page })
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
  })
  const parsed = schema.safeParse(req.body)
  if (!parsed.success) { badRequest(res, 'Datos inválidos'); return }

  try {
    const item = await prisma.item.update({ where: { id: req.params.id! }, data: parsed.data })
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
    prisma.user.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' }, select: { id: true, email: true, firstName: true, lastName: true, phone: true, role: true, isActive: true, createdAt: true } }),
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
