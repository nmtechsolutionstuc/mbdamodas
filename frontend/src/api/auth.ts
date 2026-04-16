import axiosClient from './axiosClient'
import type { User, ApiResponse } from '../types'

interface AuthResponse {
  user: User
  accessToken: string
}

export async function register(data: {
  firstName: string
  lastName: string
  dni: string
  phone: string
  email: string
  password: string
}): Promise<AuthResponse> {
  const { data: res } = await axiosClient.post<ApiResponse<AuthResponse>>('/auth/register', data)
  return res.data
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const { data: res } = await axiosClient.post<ApiResponse<AuthResponse>>('/auth/login', { email, password })
  return res.data
}

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
  paymentMethod?: string | null
  bankAlias?: string | null
}): Promise<User> {
  const { data } = await axiosClient.patch<ApiResponse<User>>('/users/me', payload)
  return data.data
}
