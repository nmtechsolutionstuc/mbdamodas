import axiosClient from './axiosClient'
import type { Submission, ApiResponse } from '../types'

export interface SubmissionItemFormData {
  title: string
  description?: string
  condition: string
  productTypeId: string
  sizeId?: string | null
  tagIds: string[]
  quantity: number
  desiredPrice: number
  minimumPrice?: number
  photos: File[]
}

export async function createSubmission(items: SubmissionItemFormData[]): Promise<Submission> {
  const formData = new FormData()
  items.forEach((item, i) => {
    formData.append(`items[${i}][title]`, item.title)
    if (item.description) formData.append(`items[${i}][description]`, item.description)
    formData.append(`items[${i}][condition]`, item.condition)
    formData.append(`items[${i}][productTypeId]`, item.productTypeId)
    if (item.sizeId) formData.append(`items[${i}][sizeId]`, item.sizeId)
    item.tagIds.forEach(tagId => formData.append(`items[${i}][tagIds]`, tagId))
    formData.append(`items[${i}][quantity]`, String(item.quantity))
    formData.append(`items[${i}][desiredPrice]`, String(item.desiredPrice))
    if (item.minimumPrice) formData.append(`items[${i}][minimumPrice]`, String(item.minimumPrice))
    item.photos.forEach(photo => formData.append(`items[${i}][photos]`, photo))
  })

  const { data } = await axiosClient.post<ApiResponse<Submission>>('/submissions', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data.data
}

export async function fetchMySubmissions(page = 1): Promise<{ submissions: Submission[]; total: number }> {
  const { data } = await axiosClient.get<ApiResponse<Submission[]>>('/submissions/mine', { params: { page } })
  return { submissions: data.data, total: data.meta?.total ?? 0 }
}

export async function fetchMySubmissionById(id: string): Promise<Submission> {
  const { data } = await axiosClient.get<ApiResponse<Submission>>(`/submissions/mine/${id}`)
  return data.data
}

export async function cancelSubmission(id: string): Promise<void> {
  await axiosClient.delete(`/submissions/mine/${id}`)
}
