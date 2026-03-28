export type Role = 'USER' | 'ADMIN'

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  dni: string | null
  phone: string | null
  avatarUrl: string | null
  role: Role
  paymentMethod?: string | null
  bankAlias?: string | null
}

export type SubmissionItemStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'IN_STORE'
  | 'SOLD'
  | 'RETURNED'

export interface ProductType {
  id: string
  name: string
  code: string
  requiresSize: boolean
  isActive: boolean
  order: number
  sizes?: Size[]
  tags?: Tag[]
}

export interface Size {
  id: string
  name: string
  order: number
  isActive: boolean
  productTypeId: string
}

export interface Tag {
  id: string
  name: string
  isActive: boolean
  order: number
  productTypeId: string
}

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

export type ReservationStatus =
  | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED'
  | 'COMPLETED' | 'CANCELLED' | 'EXPIRED'

export const RESERVATION_STATUS_LABEL: Record<ReservationStatus, string> = {
  PENDING_APPROVAL: 'Esperando confirmación',
  APPROVED: 'Aprobada',
  REJECTED: 'No aprobada',
  COMPLETED: 'Completada',
  CANCELLED: 'Cancelada',
  EXPIRED: 'Vencida',
}

export const RESERVATION_STATUS_COLOR: Record<ReservationStatus, string> = {
  PENDING_APPROVAL: '#FEF3C7',
  APPROVED: '#D1FAE5',
  REJECTED: '#FEE2E2',
  COMPLETED: '#E5E7EB',
  CANCELLED: '#E5E7EB',
  EXPIRED: '#F3F4F6',
}

export interface Reservation {
  id: string
  reservationCode: string
  status: ReservationStatus
  adminNote: string | null
  extensionCount: number
  expiresAt: string | null
  completedAt: string | null
  createdAt: string
  item: {
    id: string
    code: string | null
    title: string
    price: number
    promoterCommissionPct: number | null
    isOwnProduct: boolean
    photos: { url: string; order: number }[]
    store: { name: string; phone: string | null; storeAttendantPhone?: string | null }
  }
  user?: {
    id: string
    firstName: string
    lastName: string
    dni: string | null
    phone: string | null
    paymentMethod: string | null
    bankAlias: string | null
  }
  store?: {
    name: string
    phone: string | null
    storeAttendantPhone?: string | null
  }
}

export interface Item {
  id: string
  code?: string | null
  title: string
  description: string | null
  condition: ItemCondition
  productTypeId: string
  productType?: ProductType
  sizeId?: string | null
  size?: Size | null
  tags?: { tag: Tag }[]
  quantity: number
  price: number
  isActive: boolean
  photos: ItemPhoto[]
  store?: { phone: string | null; name: string }
  isOwnProduct?: boolean
  promoterCommissionPct?: number | null
  activeReservation?: { id: string; status: ReservationStatus } | null
}

export interface SubmissionItem {
  id: string
  title: string
  description: string | null
  condition: ItemCondition
  productTypeId: string
  productType?: ProductType
  sizeId?: string | null
  size?: Size | null
  tags?: { tag: Tag }[]
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
