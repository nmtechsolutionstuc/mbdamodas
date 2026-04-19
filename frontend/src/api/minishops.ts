import axiosClient from './axiosClient'
import type { MiniShop, MiniShopProduct, ApiResponse } from '../types'

// ── Shop CRUD ──────────────────────────────────────────────

export interface CreateShopData {
  name: string
  description?: string
  whatsapp: string
  socialLinks?: { instagram?: string; tiktok?: string; facebook?: string; otra?: string }
  deliveryMethods: { meetingPoint: boolean; address?: string; shipping: boolean; otro?: boolean; otroText?: string }
  acceptedTerms: true
}

export interface UpdateShopData {
  name?: string
  description?: string | null
  whatsapp?: string
  socialLinks?: { instagram?: string; tiktok?: string; facebook?: string; otra?: string }
  deliveryMethods?: { meetingPoint: boolean; address?: string; shipping: boolean; otro?: boolean; otroText?: string }
}

export async function fetchMyShops(): Promise<MiniShop[]> {
  const { data } = await axiosClient.get<ApiResponse<MiniShop[]>>('/minishops')
  return data.data
}

export async function createShop(body: CreateShopData): Promise<MiniShop> {
  const { data } = await axiosClient.post<ApiResponse<MiniShop>>('/minishops', body)
  return data.data
}

export async function fetchMyShop(shopId: string): Promise<MiniShop> {
  const { data } = await axiosClient.get<ApiResponse<MiniShop>>(`/minishops/${shopId}`)
  return data.data
}

export async function updateShop(shopId: string, body: UpdateShopData): Promise<MiniShop> {
  const { data } = await axiosClient.patch<ApiResponse<MiniShop>>(`/minishops/${shopId}`, body)
  return data.data
}

export async function uploadShopPhoto(shopId: string, file: File): Promise<MiniShop> {
  const formData = new FormData()
  formData.append('photo', file)
  const { data } = await axiosClient.post<ApiResponse<MiniShop>>(`/minishops/${shopId}/photo`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data.data
}

export async function toggleShopStatus(shopId: string): Promise<MiniShop> {
  const { data } = await axiosClient.patch<ApiResponse<MiniShop>>(`/minishops/${shopId}/toggle-status`)
  return data.data
}

// ── Products ────────────────────────────────────────────────

export async function fetchShopProducts(shopId: string): Promise<MiniShopProduct[]> {
  const { data } = await axiosClient.get<ApiResponse<MiniShopProduct[]>>(`/minishops/${shopId}/products`)
  return data.data
}

export interface CreateProductData {
  title: string
  description?: string
  price: number
  productTypeId: string
  sizeId?: string
  quantity?: number
  tagIds?: string[]
  photos: File[]
}

export async function createShopProduct(shopId: string, product: CreateProductData): Promise<MiniShopProduct> {
  const formData = new FormData()
  formData.append('title', product.title)
  if (product.description) formData.append('description', product.description)
  formData.append('price', String(product.price))
  formData.append('productTypeId', product.productTypeId)
  if (product.sizeId) formData.append('sizeId', product.sizeId)
  if (product.quantity) formData.append('quantity', String(product.quantity))
  if (product.tagIds?.length) formData.append('tagIds', JSON.stringify(product.tagIds))
  product.photos.forEach(f => formData.append('photos', f))

  const { data } = await axiosClient.post<ApiResponse<MiniShopProduct>>(`/minishops/${shopId}/products`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data.data
}

export async function toggleProductStatus(shopId: string, productId: string): Promise<MiniShopProduct> {
  const { data } = await axiosClient.patch<ApiResponse<MiniShopProduct>>(`/minishops/${shopId}/products/${productId}/toggle-status`)
  return data.data
}

export async function deleteShopProduct(shopId: string, productId: string): Promise<void> {
  await axiosClient.delete(`/minishops/${shopId}/products/${productId}`)
}

export async function fetchApprovedProducts(shopId: string): Promise<MiniShopProduct[]> {
  const { data } = await axiosClient.get<ApiResponse<MiniShopProduct[]>>(`/minishops/${shopId}/products/approved`)
  return data.data
}

export async function updateProductQuantity(shopId: string, productId: string, quantity: number): Promise<MiniShopProduct> {
  const { data } = await axiosClient.patch<ApiResponse<MiniShopProduct>>(`/minishops/${shopId}/products/${productId}/quantity`, { quantity })
  return data.data
}

// ── Public ──────────────────────────────────────────────────

export async function fetchPublicShopProfile(slug: string): Promise<MiniShop> {
  const { data } = await axiosClient.get<ApiResponse<MiniShop>>(`/minishops/public/${slug}`)
  return data.data
}

export async function fetchPublicShopProducts(slug: string): Promise<MiniShopProduct[]> {
  const { data } = await axiosClient.get<ApiResponse<MiniShopProduct[]>>(`/minishops/public/${slug}/products`)
  return data.data
}
