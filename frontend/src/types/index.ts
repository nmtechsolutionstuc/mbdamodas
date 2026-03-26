export type Role = 'USER' | 'ADMIN'

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  phone: string | null
  avatarUrl: string | null
  role: Role
}

export type SubmissionItemStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'IN_STORE'
  | 'SOLD'
  | 'RETURNED'

export type ItemSize = 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL' | 'UNICA'

export type ItemCategory =
  | 'MUJER'
  | 'HOMBRE'
  | 'NINO'
  | 'NINA'
  | 'CALZADO'
  | 'ACCESORIOS'
  | 'OTRO'

export type ItemCondition =
  | 'NUEVA_CON_ETIQUETA'
  | 'NUEVA_SIN_ETIQUETA'
  | 'COMO_NUEVA'
  | 'BUEN_ESTADO'
  | 'USO_MODERADO'
  | 'USO_INTENSO'

export const CONDITION_LABELS: Record<ItemCondition, string> = {
  NUEVA_CON_ETIQUETA: 'Nueva con etiqueta',
  NUEVA_SIN_ETIQUETA: 'Nueva sin etiqueta',
  COMO_NUEVA: 'Como nueva',
  BUEN_ESTADO: 'Buen estado',
  USO_MODERADO: 'Uso moderado',
  USO_INTENSO: 'Uso intenso',
}

export const SIZE_LABELS: Record<ItemSize, string> = {
  XS: 'XS', S: 'S', M: 'M', L: 'L', XL: 'XL', XXL: 'XXL', UNICA: 'Única',
}

export const CATEGORY_LABELS: Record<ItemCategory, string> = {
  MUJER: 'Mujer', HOMBRE: 'Hombre', NINO: 'Niño', NINA: 'Niña',
  CALZADO: 'Calzado', ACCESORIOS: 'Accesorios', OTRO: 'Otro',
}

export const STATUS_LABELS: Record<SubmissionItemStatus, string> = {
  PENDING: 'En revisión',
  APPROVED: 'Aprobada',
  REJECTED: 'No aceptada',
  IN_STORE: 'En tienda',
  SOLD: 'Vendida',
  RETURNED: 'Devuelta',
}

export interface ItemPhoto {
  id: string
  url: string
  order: number
}

export interface Item {
  id: string
  title: string
  description: string | null
  condition: ItemCondition
  size: ItemSize
  category: ItemCategory
  quantity: number
  price: number
  isActive: boolean
  photos: ItemPhoto[]
  store?: { phone: string | null; name: string }
}

export interface SubmissionItem {
  id: string
  title: string
  description: string | null
  condition: ItemCondition
  size: ItemSize
  category: ItemCategory
  quantity: number
  desiredPrice: number
  minimumPrice: number | null
  status: SubmissionItemStatus
  adminComment: string | null
  photos: { id: string; url: string; order: number }[]
}

export interface Submission {
  id: string
  createdAt: string
  adminNote: string | null
  items: SubmissionItem[]
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  meta?: { page: number; limit: number; total: number }
}
