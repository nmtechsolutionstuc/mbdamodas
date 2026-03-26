import axiosClient from './axiosClient'
import type { User, ApiResponse } from '../types'

export async function fetchMe(): Promise<User> {
  const { data } = await axiosClient.get<ApiResponse<User>>('/auth/me')
  return data.data
}

export async function logout(): Promise<void> {
  await axiosClient.post('/auth/logout')
}

export async function updateProfile(payload: {
  firstName?: string
  lastName?: string
  phone?: string | null
}): Promise<User> {
  const { data } = await axiosClient.patch<ApiResponse<User>>('/users/me', payload)
  return data.data
}
