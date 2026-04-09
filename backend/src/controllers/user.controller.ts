import { Request, Response } from 'express'
import { z } from 'zod'
import { prisma } from '../config/prisma'
import { ok, badRequest } from '../utils/apiResponse'
import { sanitizeStrings } from '../utils/sanitize'

const updateMeSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  phone: z.string().max(20).optional().nullable(),
  paymentMethod: z.enum(['EFECTIVO', 'TRANSFERENCIA']).optional().nullable(),
  bankAlias: z.string().max(100).optional().nullable(),
})

export async function updateMe(req: Request, res: Response): Promise<void> {
  const parsed = updateMeSchema.safeParse(req.body)
  if (!parsed.success) {
    badRequest(res, 'Datos inválidos', parsed.error.errors)
    return
  }

  const user = await prisma.user.update({
    where: { id: req.user!.sub },
    data: sanitizeStrings(parsed.data),
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      dni: true,
      phone: true,
      avatarUrl: true,
      role: true,
      paymentMethod: true,
      bankAlias: true,
    },
  })

  ok(res, user)
}
