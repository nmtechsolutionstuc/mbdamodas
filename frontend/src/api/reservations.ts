import axiosClient from './axiosClient'
import type { Reservation } from '../types'

export async function createReservation(itemId: string, quantity: number = 1) {
  const { data } = await axiosClient.post('/reservations', { itemId, quantity })
  return data.data as { reservation: Reservation; whatsappToAttendant: string | null }
}

export async function getMyReservations() {
  const { data } = await axiosClient.get('/reservations/mine')
  return data.data as Reservation[]
}

export async function cancelReservation(id: string) {
  const { data } = await axiosClient.delete(`/reservations/mine/${id}`)
  return data.data
}

export async function getVoucherData(code: string) {
  const { data } = await axiosClient.get(`/reservations/voucher/${code}`)
  return data.data as Reservation
}

export async function fetchAdminReservations(status?: string, page = 1) {
  const params = new URLSearchParams({ page: String(page) })
  if (status) params.set('status', status)
  const { data } = await axiosClient.get(`/admin/reservations?${params}`)
  return data as { data: Reservation[]; meta: { page: number; limit: number; total: number; pages: number } }
}

export async function approveAdminReservation(id: string) {
  const { data } = await axiosClient.patch(`/admin/reservations/${id}/approve`)
  return data.data as { reservation: Reservation; whatsappToPromoter: string | null; whatsappToAttendant: string | null; whatsappSendVoucher: string | null }
}

export async function rejectAdminReservation(id: string, adminNote: string) {
  const { data } = await axiosClient.patch(`/admin/reservations/${id}/reject`, { adminNote })
  return data.data as { reservation: Reservation; whatsappToPromoter: string | null }
}

export async function completeAdminReservation(id: string) {
  const { data } = await axiosClient.patch(`/admin/reservations/${id}/complete`)
  return data.data as { reservation: Reservation; whatsappToPromoter: string | null }
}

export async function extendAdminReservation(id: string) {
  const { data } = await axiosClient.patch(`/admin/reservations/${id}/extend`)
  return data.data as { reservation: Reservation; whatsappToPromoter: string | null }
}
