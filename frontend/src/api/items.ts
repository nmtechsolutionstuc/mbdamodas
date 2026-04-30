import axiosClient from './axiosClient'
import type { Item, ProductType, ApiResponse } from '../types'

export interface ItemFilters {
  productTypeId?: string
  sizeId?: string
  tagId?: string
  search?: string
  storeId?: string
  page?: number
  limit?: number
}

export async function fetchItems(filters: ItemFilters = {}): Promise<{ items: Item[]; total: number; page: number; limit: number }> {
  const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== undefined))
  const { data } = await axiosClient.get<ApiResponse<Item[]> & { meta: { page: number; limit: number; total: number } }>('/items', { params })
  return { items: data.data, total: data.meta.total, page: data.meta.page, limit: data.meta.limit }
}

export async function fetchItemById(id: string): Promise<Item> {
  const { data } = await axiosClient.get<ApiResponse<Item>>(`/items/${id}`)
  return data.data
}

export async function fetchPublicProductTypes(): Promise<ProductType[]> {
  const { data } = await axiosClient.get<ApiResponse<ProductType[]>>('/items/product-types')
  return data.data
}

export async function fetchFeaturedItems(): Promise<any[]> {
  const { data } = await axiosClient.get<ApiResponse<any[]>>('/items/featured')
  return Array.isArray(data.data) ? data.data : []
}
