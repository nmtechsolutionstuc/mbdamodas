import axiosClient from './axiosClient'
import type { ApiResponse, MiniShop, MiniShopProduct } from '../types'

export interface AdminShopsFilters {
  status?: string
  search?: string
  page?: number
  limit?: number
}

export interface AdminProductsFilters {
  status?: string
  search?: string
  miniShopId?: string
  page?: number
  limit?: number
}

export async function adminFetchShops(filters: AdminShopsFilters = {}): Promise<{
  items: (MiniShop & { user: { id: string; firstName: string; lastName: string; email: string; phone: string | null }; _count: { products: number } })[]
  total: number
  page: number
  limit: number
}> {
  const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== undefined && v !== ''))
  const { data } = await axiosClient.get<ApiResponse<any[]>>('/admin/minishops', { params })
  return {
    items: data.data,
    total: data.meta?.total ?? 0,
    page: data.meta?.page ?? 1,
    limit: data.meta?.limit ?? 20,
  }
}

export async function adminUpdateShop(id: string, payload: { status?: string; name?: string; description?: string }): Promise<MiniShop> {
  const { data } = await axiosClient.patch<ApiResponse<MiniShop>>(`/admin/minishops/${id}`, payload)
  return data.data
}

export async function adminFetchProducts(filters: AdminProductsFilters = {}): Promise<{
  items: MiniShopProduct[]
  total: number
  page: number
  limit: number
}> {
  const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== undefined && v !== ''))
  const { data } = await axiosClient.get<ApiResponse<MiniShopProduct[]>>('/admin/minishops/products', { params })
  return {
    items: data.data,
    total: data.meta?.total ?? 0,
    page: data.meta?.page ?? 1,
    limit: data.meta?.limit ?? 20,
  }
}

export async function adminApproveProduct(id: string): Promise<{ product: MiniShopProduct; whatsappLink: string }> {
  const { data } = await axiosClient.patch<ApiResponse<{ product: MiniShopProduct; whatsappLink: string }>>(`/admin/minishops/products/${id}/approve`)
  return data.data
}

export async function adminRejectProduct(id: string, reason: string): Promise<{ product: MiniShopProduct; whatsappLink: string }> {
  const { data } = await axiosClient.patch<ApiResponse<{ product: MiniShopProduct; whatsappLink: string }>>(`/admin/minishops/products/${id}/reject`, { reason })
  return data.data
}

export async function adminToggleFeaturedProduct(id: string): Promise<MiniShopProduct> {
  const { data } = await axiosClient.patch<ApiResponse<MiniShopProduct>>(`/admin/minishops/products/${id}/toggle-featured`)
  return data.data
}

export async function adminFetchPendingCount(): Promise<number> {
  const { data } = await axiosClient.get<ApiResponse<{ count: number }>>('/admin/minishops/products/pending-count')
  return data.data.count
}

export async function adminEditProduct(id: string, payload: {
  title?: string
  price?: number
  description?: string | null
  productTypeId?: string
  sizeId?: string | null
}): Promise<MiniShopProduct> {
  const { data } = await axiosClient.patch<ApiResponse<MiniShopProduct>>(`/admin/minishops/products/${id}/edit`, payload)
  return data.data
}
