import { Request, Response } from 'express'
import { z } from 'zod'
import { prisma } from '../config/prisma'
import { ok, created, notFound, badRequest } from '../utils/apiResponse'

const storeSchema = z.object({
  name: z.string().min(1).max(200),
  address: z.string().max(300).optional().nullable(),
  phone: z.string().max(30).optional().nullable(),
  email: z.string().email().optional().nullable(),
  description: z.string().max(1000).optional().nullable(),
  logoUrl: z.string().url().optional().nullable(),
  defaultCommission: z.number().min(0).max(100).optional(),
  isActive: z.boolean().optional(),
  storeAttendantPhone: z.string().max(30).optional().nullable(),
})

export async function listStores(_req: Request, res: Response): Promise<void> {
  const stores = await prisma.store.findMany({ orderBy: { createdAt: 'asc' } })
  ok(res, stores)
}

export async function createStore(req: Request, res: Response): Promise<void> {
  const parsed = storeSchema.safeParse(req.body)
  if (!parsed.success) { badRequest(res, 'Datos inválidos', parsed.error.errors); return }
  const store = await prisma.store.create({ data: parsed.data as Parameters<typeof prisma.store.create>[0]['data'] })
  created(res, store)
}

export async function updateStore(req: Request, res: Response): Promise<void> {
  const parsed = storeSchema.partial().safeParse(req.body)
  if (!parsed.success) { badRequest(res, 'Datos inválidos', parsed.error.errors); return }
  try {
    const store = await prisma.store.update({ where: { id: req.params.id! }, data: parsed.data })
    ok(res, store)
  } catch {
    notFound(res, 'Tienda no encontrada')
  }
}
