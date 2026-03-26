import { Request, Response } from 'express'
import { ItemCategory, ItemSize } from '@prisma/client'
import { getPublicItems, getPublicItemById } from '../services/item.service'
import { ok, notFound } from '../utils/apiResponse'

export async function listItems(req: Request, res: Response): Promise<void> {
  const { category, size, search, storeId, page, limit } = req.query

  const items = await getPublicItems({
    category: category as ItemCategory | undefined,
    size: size as ItemSize | undefined,
    search: search as string | undefined,
    storeId: storeId as string | undefined,
    page: page ? parseInt(page as string, 10) : undefined,
    limit: limit ? parseInt(limit as string, 10) : undefined,
  })

  ok(res, items.items, {
    page: items.page,
    limit: items.limit,
    total: items.total,
  })
}

export async function getItem(req: Request, res: Response): Promise<void> {
  const item = await getPublicItemById(req.params.id!)
  if (!item) {
    notFound(res, 'Prenda no encontrada')
    return
  }
  ok(res, item)
}
