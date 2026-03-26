import { Request, Response } from 'express'
import { z } from 'zod'
import { ItemCategory, ItemCondition, ItemSize } from '@prisma/client'
import { createSubmission, getSellerSubmissions, getSellerSubmissionById, cancelSubmission } from '../services/submission.service'
import { getPhotoUrls } from '../services/upload.service'
import { ok, created, badRequest, notFound, forbidden } from '../utils/apiResponse'
import { prisma } from '../config/prisma'

const itemSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  condition: z.nativeEnum(ItemCondition),
  size: z.nativeEnum(ItemSize),
  category: z.nativeEnum(ItemCategory),
  quantity: z.coerce.number().int().min(1).default(1),
  desiredPrice: z.coerce.number().positive(),
  minimumPrice: z.coerce.number().positive().optional(),
})

export async function createSubmissionHandler(req: Request, res: Response): Promise<void> {
  // El body llega como items[0][title], items[0][description], etc. (multipart/form-data)
  // multer ya parseó los campos; las fotos llegan en req.files como { 'items[0][photos]': [...] }
  const rawItems = req.body.items
  if (!rawItems || !Array.isArray(rawItems)) {
    badRequest(res, 'Se requiere al menos una prenda')
    return
  }

  const parsed = z.array(itemSchema).min(1).safeParse(rawItems)
  if (!parsed.success) {
    badRequest(res, 'Datos de prendas inválidos', parsed.error.errors)
    return
  }

  const files = req.files as { [fieldname: string]: Express.Multer.File[] }

  // Obtener la tienda activa (por ahora solo hay una)
  const store = await prisma.store.findFirst({ where: { isActive: true } })
  if (!store) {
    badRequest(res, 'No hay tiendas activas en este momento')
    return
  }

  const items = await Promise.all(
    parsed.data.map(async (item, i) => {
      const itemFiles = files?.[`items[${i}][photos]`] ?? []
      return {
        ...item,
        photoUrls: await getPhotoUrls(itemFiles),
      }
    }),
  )

  const submission = await createSubmission(
    req.user!.sub,
    store.id,
    items,
    new Date(), // termsAcceptedAt — registrado al enviar la primera solicitud
  )

  created(res, submission)
}

export async function listMySubmissions(req: Request, res: Response): Promise<void> {
  const page = req.query.page ? parseInt(req.query.page as string, 10) : 1
  const result = await getSellerSubmissions(req.user!.sub, page)
  ok(res, result.submissions, { page: result.page, limit: result.limit, total: result.total })
}

export async function getMySubmission(req: Request, res: Response): Promise<void> {
  const submission = await getSellerSubmissionById(req.params.id!, req.user!.sub)
  if (!submission) {
    notFound(res, 'Solicitud no encontrada')
    return
  }
  ok(res, submission)
}

export async function cancelMySubmission(req: Request, res: Response): Promise<void> {
  const success = await cancelSubmission(req.params.id!, req.user!.sub)
  if (!success) {
    forbidden(res, 'No podés cancelar esta solicitud. Solo se pueden cancelar solicitudes con todas las prendas en estado pendiente.')
    return
  }
  ok(res, { message: 'Solicitud cancelada' })
}
