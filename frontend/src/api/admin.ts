import axiosClient from './axiosClient'
import type { ApiResponse } from '../types'

export async function fetchAdminStats(): Promise<{ pending: number; inStore: number; soldThisMonth: number }> {
  const { data } = await axiosClient.get<ApiResponse<{ pending: number; inStore: number; soldThisMonth: number }>>('/admin/stats')
  return data.data
}

export async function fetchAdminSubmissions(page = 1) {
  const { data } = await axiosClient.get('/admin/submissions', { params: { page } })
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
