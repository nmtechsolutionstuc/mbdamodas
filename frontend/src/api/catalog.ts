import axiosClient from './axiosClient'
import type { CatalogItem, CatalogShop, ApiResponse } from '../types'

export interface CatalogFilters {
  search?: string
  productTypeId?: string
  sizeId?: string
  tagId?: string
  source?: 'mbda'
  miniShopSlug?: string
  sortPrice?: 'asc' | 'desc'
  page?: number
  limit?: number
}

export async function fetchCatalog(filters: CatalogFilters = {}): Promise<{
  items: CatalogItem[]
  total: number
  page: number
  limit: number
}> {
  const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== undefined && v !== ''))
  const { data } = await axiosClient.get<ApiResponse<CatalogItem[]>>('/catalog', { params })
  return {
    items: Array.isArray(data.data) ? data.data : [],
    total: data.meta?.total ?? 0,
    page: data.meta?.page ?? 1,
    limit: data.meta?.limit ?? 12,
  }
}

export async function fetchCatalogShops(): Promise<CatalogShop[]> {
  const { data } = await axiosClient.get<ApiResponse<CatalogShop[]>>('/catalog/shops')
  return Array.isArray(data.data) ? data.data : []
}

export async function fetchCatalogProductBySlug(slug: string): Promise<CatalogItem | null> {
  const { data } = await axiosClient.get<ApiResponse<CatalogItem | null>>(`/catalog/products/${slug}`)
  return data.data
}
