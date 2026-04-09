import { prisma } from '../config/prisma'
import { ItemCondition } from '@prisma/client'
import { stripHtml } from '../utils/sanitize'

export interface SubmissionItemInput {
  title: string
  description?: string
  condition: ItemCondition
  productTypeId: string
  sizeId?: string | null
  tagIds?: string[]
  quantity: number
  desiredPrice: number
  minimumPrice?: number
  photoUrls: string[]
}

export async function createSubmission(
  sellerId: string,
  storeId: string,
  items: SubmissionItemInput[],
  termsAcceptedAt?: Date,
) {
  // Actualizar termsAcceptedAt si aún no fue registrado
  if (termsAcceptedAt) {
    await prisma.user.updateMany({
      where: { id: sellerId, termsAcceptedAt: null },
      data: { termsAcceptedAt },
    })
  }

  return prisma.submission.create({
    data: {
      sellerId,
      storeId,
      items: {
        create: items.map(item => ({
          title: stripHtml(item.title),
          description: item.description ? stripHtml(item.description) : undefined,
          condition: item.condition,
          productTypeId: item.productTypeId,
          sizeId: item.sizeId ?? null,
          quantity: item.quantity,
          desiredPrice: item.desiredPrice,
          minimumPrice: item.minimumPrice,
          photos: {
            create: item.photoUrls.map((url, order) => ({ url, order })),
          },
          ...(item.tagIds && item.tagIds.length > 0 && {
            tags: { create: item.tagIds.map(tagId => ({ tagId })) },
          }),
        })),
      },
    },
    include: {
      items: {
        include: {
          photos: true,
          productType: true,
          size: true,
          tags: { include: { tag: true } },
        },
      },
    },
  })
}

export async function getSellerSubmissions(sellerId: string, page = 1, limit = 10) {
  const skip = (page - 1) * limit
  const [submissions, total] = await prisma.$transaction([
    prisma.submission.findMany({
      where: { sellerId },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: {
            photos: { orderBy: { order: 'asc' }, take: 1 },
            productType: true,
            size: true,
          },
        },
      },
    }),
    prisma.submission.count({ where: { sellerId } }),
  ])
  return { submissions, total, page, limit }
}

export async function getSellerSubmissionById(id: string, sellerId: string) {
  return prisma.submission.findFirst({
    where: { id, sellerId },
    include: {
      items: {
        include: {
          photos: { orderBy: { order: 'asc' } },
          productType: true,
          size: true,
          tags: { include: { tag: true } },
        },
        orderBy: { createdAt: 'asc' },
      },
    },
  })
}

export async function cancelSubmission(id: string, sellerId: string): Promise<'ok' | 'not_found' | 'not_cancellable'> {
  const submission = await prisma.submission.findFirst({
    where: { id, sellerId },
    include: { items: { select: { status: true } } },
  })
  if (!submission) return 'not_found'

  const allPending = submission.items.every(item => item.status === 'PENDING')
  if (!allPending) return 'not_cancellable'

  await prisma.submission.delete({ where: { id } })
  return 'ok'
}
