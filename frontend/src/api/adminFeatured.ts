import axiosClient from './axiosClient'
import type { ApiResponse } from '../types'

export interface FeaturedMbdaItem {
  id: string
  title: string
  price: number
  code: string | null
  featured: boolean
  featuredAt: string | null
  featuredUntil: string | null
  photos: { url: string }[]
  productType: { name: string } | null
  source: 'mbda'
}

export interface FeaturedMinishopProduct {
  id: string
  title: string
  price: number
  slug: string
  featured: boolean
  featuredAt: string | null
  featuredUntil: string | null
  photos: { url: string }[]
  productType: { name: string } | null
  miniShop: { name: string; slug: string }
  source: 'minishop'
}

export type FeaturedEntry = FeaturedMbdaItem | FeaturedMinishopProduct

export interface FeaturedListResponse {
  mbda: FeaturedMbdaItem[]
  minishop: FeaturedMinishopProduct[]
  total: number
}

export interface SearchResult {
  id: string
  title: string
  price: number
  featured: boolean
  featuredUntil: string | null
  photos: { url: string }[]
  source: 'mbda' | 'minishop'
  miniShop?: { name: string }
  code?: string | null
}

export async function fetchAdminFeatured(): Promise<FeaturedListResponse> {
  const { data } = await axiosClient.get<ApiResponse<FeaturedListResponse>>('/admin/featured')
  return data.data
}

export async function setFeaturedItem(id: string, featured: boolean, days?: number): Promise<void> {
  await axiosClient.patch(`/admin/featured/item/${id}`, { featured, ...(days ? { days } : {}) })
}

export async function setFeaturedMiniShopProduct(id: string, featured: boolean, days?: number): Promise<void> {
  await axiosClient.patch(`/admin/featured/minishop-product/${id}`, { featured, ...(days ? { days } : {}) })
}

export async function searchProductsToFeature(q: string, source?: 'mbda' | 'minishop'): Promise<SearchResult[]> {
  const params: any = { q }
  if (source) params.source = source
  const { data } = await axiosClient.get<ApiResponse<SearchResult[]>>('/admin/featured/search', { params })
  return data.data
}
