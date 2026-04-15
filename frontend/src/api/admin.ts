import axiosClient from './axiosClient'
import type { ApiResponse, ProductType, Size, Tag } from '../types'

export async function fetchAdminStats(): Promise<{ pending: number; inStore: number; soldThisMonth: number }> {
  const { data } = await axiosClient.get<ApiResponse<{ pending: number; inStore: number; soldThisMonth: number }>>('/admin/stats')
  return data.data
}

export async function fetchAdminSubmissions(status?: string) {
  const { data } = await axiosClient.get('/admin/submissions', { params: { ...(status && { status }) } })
  return data
}

export async function fetchAdminSubmissionById(id: string) {
  const { data } = await axiosClient.get(`/admin/submissions/${id}`)
  return data.data
}

export async function approveItem(itemId: string) {
  const { data } = await axiosClient.patch(`/admin/items/${itemId}/approve`)
  return data.data
}

export async function rejectItem(itemId: string, adminComment: string) {
  const { data } = await axiosClient.patch(`/admin/items/${itemId}/reject`, { adminComment })
  return data.data
}

export async function markInStore(itemId: string) {
  const { data } = await axiosClient.patch(`/admin/items/${itemId}/mark-in-store`)
  return data.data
}

export async function markSold(itemId: string) {
  const { data } = await axiosClient.patch(`/admin/items/${itemId}/mark-sold`)
  return data.data
}

export async function markReturned(itemId: string) {
  const { data } = await axiosClient.patch(`/admin/items/${itemId}/mark-returned`)
  return data.data
}

export async function createCatalogItem(body: {
  title: string
  description?: string
  condition: string
  productTypeId: string
  sizeId?: string | null
  tagIds?: string[]
  quantity?: number
  price: number
  minimumPrice?: number
  commission: number
  storeId: string
  isOwnProduct?: boolean
  promoterCommissionPct?: number | null
}): Promise<import('../types').Item> {
  const { data } = await axiosClient.post<import('../types').ApiResponse<import('../types').Item>>('/admin/catalog', body)
  return data.data
}

export async function fetchAdminCatalog(page = 1) {
  const { data } = await axiosClient.get('/admin/catalog', { params: { page } })
  return data
}

export async function updateCatalogItem(id: string, body: { title?: string; description?: string; price?: number; commission?: number; productTypeId?: string; sizeId?: string | null; condition?: string; quantity?: number; isActive?: boolean }) {
  const { data } = await axiosClient.patch(`/admin/catalog/${id}`, body)
  return data.data
}

export async function deleteCatalogItem(id: string) {
  const { data } = await axiosClient.delete(`/admin/catalog/${id}`)
  return data.data
}

export async function uploadItemPhotos(itemId: string, files: File[]) {
  const formData = new FormData()
  files.forEach(f => formData.append('photos', f))
  const { data } = await axiosClient.post(`/admin/catalog/${itemId}/photos`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data.data
}

export async function deleteItemPhoto(itemId: string, photoId: string) {
  const { data } = await axiosClient.delete(`/admin/catalog/${itemId}/photos/${photoId}`)
  return data.data
}

export async function toggleFeatured(itemId: string): Promise<{ id: string; featured: boolean }> {
  const { data } = await axiosClient.patch(`/admin/catalog/${itemId}/toggle-featured`)
  return data.data
}

export async function fetchAdminUsers(page = 1, search?: string) {
  const { data } = await axiosClient.get('/admin/users', { params: { page, search: search || undefined } })
  return data
}

export async function deactivateUser(id: string) {
  const { data } = await axiosClient.patch(`/admin/users/${id}/deactivate`)
  return data.data
}

export async function updateAdminUser(id: string, body: Partial<{ firstName: string; lastName: string; email: string; phone: string | null; dni: string | null; password: string; role: 'USER' | 'ADMIN'; isActive: boolean }>) {
  const { data } = await axiosClient.patch(`/admin/users/${id}`, body)
  return data.data
}

export async function deleteAdminUser(id: string) {
  const { data } = await axiosClient.delete(`/admin/users/${id}`)
  return data
}

export async function createUser(body: {
  email: string
  password: string
  firstName: string
  lastName: string
  phone?: string
  role: 'USER' | 'ADMIN'
}): Promise<import('../types').User> {
  const { data } = await axiosClient.post<import('../types').ApiResponse<import('../types').User>>('/admin/users', body)
  return data.data
}

// --- Product Types ---

export async function fetchProductTypes(): Promise<ProductType[]> {
  const { data } = await axiosClient.get<ApiResponse<ProductType[]>>('/admin/product-types')
  return data.data
}

export async function toggleProductType(id: string): Promise<ProductType> {
  const { data } = await axiosClient.patch<ApiResponse<ProductType>>(`/admin/product-types/${id}/toggle`)
  return data.data
}

// --- Sizes ---

export async function createSize(body: { name: string; productTypeId: string }): Promise<Size> {
  const { data } = await axiosClient.post<ApiResponse<Size>>('/admin/sizes', body)
  return data.data
}

export async function toggleSize(id: string): Promise<Size> {
  const { data } = await axiosClient.patch<ApiResponse<Size>>(`/admin/sizes/${id}/toggle`)
  return data.data
}

// --- Tags ---

export async function createTag(body: { name: string; productTypeId: string }): Promise<Tag> {
  const { data } = await axiosClient.post<ApiResponse<Tag>>('/admin/tags', body)
  return data.data
}

export async function toggleTag(id: string): Promise<Tag> {
  const { data } = await axiosClient.patch<ApiResponse<Tag>>(`/admin/tags/${id}/toggle`)
  return data.data
}

export async function deleteAdminReservation(id: string): Promise<void> {
  await axiosClient.delete(`/admin/reservations/${id}`)
}

export async function resendReservationWhatsapp(id: string): Promise<{ whatsappLink: string | null }> {
  const { data } = await axiosClient.get<{ data: { whatsappLink: string | null } }>(`/admin/reservations/${id}/resend-whatsapp`)
  return data.data
}
