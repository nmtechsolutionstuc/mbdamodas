import { Role, SubmissionItemStatus, ItemCondition } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { prisma } from '../config/prisma'
import { generateWhatsAppLink } from './whatsapp.service'
import { calculateCommission } from '../utils/commission'
import { stripHtml } from '../utils/sanitize'

export async function createUser(input: {
  email: string
  password: string
  firstName: string
  lastName: string
  phone?: string
  role: Role
  storeId?: string
}) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } })
  if (existing) {
    const err = new Error('El email ya está registrado')
    ;(err as NodeJS.ErrnoException).code = 'EMAIL_IN_USE'
    throw err
  }

  const hash = await bcrypt.hash(input.password, 12)
  const user = await prisma.user.create({
    data: {
      email: input.email,
      firstName: stripHtml(input.firstName),
      lastName: stripHtml(input.lastName),
      phone: input.phone,
      password: hash,
      role: input.role,
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
  })

  return user
}

export async function getAdminSubmissions(filters: {
  storeId?: string
  status?: string
  page?: number
  limit?: number
}) {
  const page = filters.page ?? 1
  const limit = Math.min(filters.limit ?? 20, 50)
  const skip = (page - 1) * limit

  const where = {
    ...(filters.storeId && { storeId: filters.storeId }),
    ...(filters.status && { items: { some: { status: filters.status as SubmissionItemStatus } } }),
  }

  const [submissions, total] = await prisma.$transaction([
    prisma.submission.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        seller: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
        items: {
          include: {
            photos: { orderBy: { order: 'asc' }, take: 1 },
            productType: true,
            size: true,
            tags: { include: { tag: true } },
          },
        },
      },
    }),
    prisma.submission.count({ where }),
  ])

  return { submissions, total, page, limit }
}

export async function getAdminSubmissionById(id: string) {
  return prisma.submission.findUnique({
    where: { id },
    include: {
      seller: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
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

export async function approveItem(submissionItemId: string) {
  const submissionItem = await prisma.submissionItem.findUnique({
    where: { id: submissionItemId },
    include: {
      submission: {
        include: {
          seller: { select: { firstName: true, lastName: true, phone: true } },
          store: true,
        },
      },
      photos: true,
      tags: true,
    },
  })
  if (!submissionItem) return null

  const commission = Number(submissionItem.submission.store.defaultCommission)

  // Generar código identificador único (MBDA-0001, MBDA-0002, ...)
  const code = await generateItemCode()

  // Crear el Item en catálogo (isActive=false hasta que se reciba en tienda)
  const [updatedItem, item] = await prisma.$transaction([
    prisma.submissionItem.update({
      where: { id: submissionItemId },
      data: { status: SubmissionItemStatus.APPROVED, reviewedAt: new Date() },
    }),
    prisma.item.create({
      data: {
        code,
        title: submissionItem.title,
        description: submissionItem.description,
        condition: submissionItem.condition,
        productTypeId: submissionItem.productTypeId,
        sizeId: submissionItem.sizeId,
        quantity: submissionItem.quantity,
        price: submissionItem.desiredPrice,
        minimumPrice: submissionItem.minimumPrice,
        commission,
        isActive: false, // No visible en catálogo hasta IN_STORE
        submissionItemId: submissionItem.id,
        storeId: submissionItem.submission.storeId,
        photos: {
          create: submissionItem.photos.map(p => ({ url: p.url, order: p.order })),
        },
        tags: {
          create: submissionItem.tags.map(t => ({ tagId: t.tagId })),
        },
      },
      include: { photos: true, productType: true, size: true, tags: { include: { tag: true } } },
    }),
  ])

  const seller = submissionItem.submission.seller
  const whatsappLink = generateWhatsAppLink(SubmissionItemStatus.APPROVED, {
    sellerPhone: seller.phone ?? '',
    sellerName: seller.firstName,
    itemTitle: submissionItem.title,
    itemCode: code,
    storeName: submissionItem.submission.store.name,
    commission,
  })

  return { submissionItem: updatedItem, item, whatsappLink }
}

export async function rejectItem(submissionItemId: string, adminComment: string) {
  const submissionItem = await prisma.submissionItem.findUnique({
    where: { id: submissionItemId },
    include: {
      submission: {
        include: {
          seller: { select: { firstName: true, phone: true } },
          store: { select: { name: true } },
        },
      },
    },
  })
  if (!submissionItem) return null

  const updated = await prisma.submissionItem.update({
    where: { id: submissionItemId },
    data: { status: SubmissionItemStatus.REJECTED, adminComment, reviewedAt: new Date() },
  })

  const seller = submissionItem.submission.seller
  const whatsappLink = generateWhatsAppLink(SubmissionItemStatus.REJECTED, {
    sellerPhone: seller.phone ?? '',
    sellerName: seller.firstName,
    itemTitle: submissionItem.title,
    storeName: submissionItem.submission.store.name,
    adminComment,
  })

  return { submissionItem: updated, whatsappLink }
}

export async function markItemInStore(submissionItemId: string) {
  const submissionItem = await prisma.submissionItem.findUnique({
    where: { id: submissionItemId },
    include: {
      item: true,
      submission: {
        include: {
          seller: { select: { firstName: true, phone: true, paymentMethod: true, bankAlias: true } },
          store: { select: { name: true } },
        },
      },
    },
  })
  if (!submissionItem) return null

  // Activar el item en el catálogo público al recibir en tienda
  const [updated] = await prisma.$transaction([
    prisma.submissionItem.update({
      where: { id: submissionItemId },
      data: { status: SubmissionItemStatus.IN_STORE },
    }),
    ...(submissionItem.item
      ? [prisma.item.update({ where: { id: submissionItem.item.id }, data: { isActive: true } })]
      : []),
  ])

  const seller = submissionItem.submission.seller
  const whatsappLink = generateWhatsAppLink(SubmissionItemStatus.IN_STORE, {
    sellerPhone: seller.phone ?? '',
    sellerName: seller.firstName,
    itemTitle: submissionItem.title,
    itemCode: submissionItem.item?.code ?? undefined,
    storeName: submissionItem.submission.store.name,
    paymentMethod: seller.paymentMethod,
    bankAlias: seller.bankAlias,
  })

  return { submissionItem: updated, whatsappLink }
}

export async function markItemSold(submissionItemId: string) {
  const submissionItem = await prisma.submissionItem.findUnique({
    where: { id: submissionItemId },
    include: {
      item: true,
      submission: {
        include: {
          seller: { select: { firstName: true, phone: true, paymentMethod: true, bankAlias: true } },
          store: { select: { name: true } },
        },
      },
    },
  })
  if (!submissionItem || !submissionItem.item) return null

  const item = submissionItem.item
  const commission = calculateCommission(Number(item.price), Number(item.commission))

  await prisma.$transaction([
    prisma.submissionItem.update({ where: { id: submissionItemId }, data: { status: SubmissionItemStatus.SOLD } }),
    prisma.item.update({ where: { id: item.id }, data: { isActive: false, soldAt: new Date() } }),
  ])

  const seller = submissionItem.submission.seller
  const whatsappLink = generateWhatsAppLink(SubmissionItemStatus.SOLD, {
    sellerPhone: seller.phone ?? '',
    sellerName: seller.firstName,
    itemTitle: submissionItem.title,
    itemCode: item.code ?? undefined,
    storeName: submissionItem.submission.store.name,
    sellerAmount: commission.sellerAmount,
    paymentMethod: seller.paymentMethod,
    bankAlias: seller.bankAlias,
  })

  return { commission, whatsappLink }
}

export async function markItemReturned(submissionItemId: string) {
  const submissionItem = await prisma.submissionItem.findUnique({
    where: { id: submissionItemId },
    include: {
      item: true,
      submission: {
        include: {
          seller: { select: { firstName: true, phone: true, paymentMethod: true, bankAlias: true } },
          store: { select: { name: true } },
        },
      },
    },
  })
  if (!submissionItem) return null

  await prisma.$transaction([
    prisma.submissionItem.update({ where: { id: submissionItemId }, data: { status: SubmissionItemStatus.RETURNED } }),
    ...(submissionItem.item
      ? [prisma.item.update({ where: { id: submissionItem.item.id }, data: { isActive: false, returnedAt: new Date() } })]
      : []),
  ])

  const seller = submissionItem.submission.seller
  const whatsappLink = generateWhatsAppLink(SubmissionItemStatus.RETURNED, {
    sellerPhone: seller.phone ?? '',
    sellerName: seller.firstName,
    itemTitle: submissionItem.title,
    itemCode: submissionItem.item?.code ?? undefined,
    storeName: submissionItem.submission.store.name,
    paymentMethod: seller.paymentMethod,
    bankAlias: seller.bankAlias,
  })

  return { whatsappLink }
}

export async function createCatalogItem(input: {
  title: string
  description?: string
  condition: ItemCondition
  productTypeId: string
  sizeId?: string | null
  quantity?: number
  price: number
  minimumPrice?: number
  commission: number
  storeId: string
  isActive?: boolean
  tagIds?: string[]
  isOwnProduct?: boolean
  promoterCommissionPct?: number | null
}) {
  const code = await generateItemCode()
  const item = await prisma.item.create({
    data: {
      code,
      title: stripHtml(input.title),
      description: input.description ? stripHtml(input.description) : undefined,
      condition: input.condition,
      productTypeId: input.productTypeId,
      sizeId: input.sizeId ?? null,
      quantity: input.quantity ?? 1,
      price: input.price,
      minimumPrice: input.minimumPrice,
      commission: input.commission,
      storeId: input.storeId,
      isActive: input.isActive ?? true,
      isOwnProduct: input.isOwnProduct ?? false,
      promoterCommissionPct: input.promoterCommissionPct ?? null,
      ...(input.tagIds && input.tagIds.length > 0 && {
        tags: { create: input.tagIds.map(tagId => ({ tagId })) },
      }),
    },
    include: { photos: true, productType: true, size: true, tags: { include: { tag: true } } },
  })

  return item
}

// ─── Product Type / Size / Tag management ───────────────────

export async function listProductTypes() {
  return prisma.productType.findMany({
    orderBy: { order: 'asc' },
    include: {
      sizes: { orderBy: { order: 'asc' } },
      tags: { orderBy: { order: 'asc' } },
    },
  })
}

export async function toggleProductType(id: string) {
  const pt = await prisma.productType.findUnique({ where: { id } })
  if (!pt) return null
  return prisma.productType.update({ where: { id }, data: { isActive: !pt.isActive } })
}

export async function createSize(name: string, productTypeId: string) {
  return prisma.size.create({ data: { name, productTypeId } })
}

export async function toggleSize(id: string) {
  const size = await prisma.size.findUnique({ where: { id } })
  if (!size) return null
  return prisma.size.update({ where: { id }, data: { isActive: !size.isActive } })
}

export async function createTag(name: string, productTypeId: string) {
  return prisma.tag.create({ data: { name, productTypeId } })
}

export async function toggleTag(id: string) {
  const tag = await prisma.tag.findUnique({ where: { id } })
  if (!tag) return null
  return prisma.tag.update({ where: { id }, data: { isActive: !tag.isActive } })
}

// ─── Generación de código identificador ────────────────────

async function generateItemCode(): Promise<string> {
  const lastItem = await prisma.item.findFirst({
    where: { code: { not: null } },
    orderBy: { createdAt: 'desc' },
    select: { code: true },
  })

  let nextNumber = 1
  if (lastItem?.code) {
    const match = lastItem.code.match(/MBDA-(\d+)/)
    if (match) nextNumber = parseInt(match[1], 10) + 1
  }

  return `MBDA-${String(nextNumber).padStart(4, '0')}`
}
