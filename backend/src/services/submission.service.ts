import { prisma } from '../config/prisma'
import { ItemCategory, ItemCondition, ItemSize } from '@prisma/client'

export interface SubmissionItemInput {
  title: string
  description?: string
  condition: ItemCondition
  size: ItemSize
  category: ItemCategory
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
          title: item.title,
          description: item.description,
          condition: item.condition,
          size: item.size,
          category: item.category,
          quantity: item.quantity,
          desiredPrice: item.desiredPrice,
          minimumPrice: item.minimumPrice,
          photos: {
            create: item.photoUrls.map((url, order) => ({ url, order })),
          },
        })),
      },
    },
    include: {
      items: {
        include: { photos: true },
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
        include: { photos: { orderBy: { order: 'asc' } } },
        orderBy: { createdAt: 'asc' },
      },
    },
  })
}

export async function cancelSubmission(id: string, sellerId: string): Promise<boolean> {
  const submission = await prisma.submission.findFirst({
    where: { id, sellerId },
    include: { items: { select: { status: true } } },
  })
  if (!submission) return false

  const allPending = submission.items.every(item => item.status === 'PENDING')
  if (!allPending) return false

  await prisma.submission.delete({ where: { id } })
  return true
}
