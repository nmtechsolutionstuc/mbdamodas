import type { Request, Response } from 'express'
import { ok, created, notFound, badRequest, conflict, serverError } from '../utils/apiResponse'
import * as reservationService from '../services/reservation.service'

function handleError(res: Response, err: any) {
  if (err.status === 404) return notFound(res, err.message)
  if (err.status === 400) return badRequest(res, err.message)
  if (err.status === 409) return conflict(res, err.message)
  console.error(err)
  return serverError(res)
}

// ─── User endpoints ───────────────────────────────────────────────────────────

export async function createReservationHandler(req: Request, res: Response) {
  try {
    const { itemId, quantity } = req.body
    if (!itemId) return badRequest(res, 'itemId es requerido')
    const qty = quantity ? parseInt(quantity) : 1
    if (isNaN(qty) || qty < 1) return badRequest(res, 'La cantidad debe ser al menos 1')
    const result = await reservationService.createReservation(itemId, req.user!.sub, qty)
    return created(res, result)
  } catch (err) {
    return handleError(res, err)
  }
}

export async function getMyReservations(req: Request, res: Response) {
  try {
    const reservations = await reservationService.getUserReservations(req.user!.sub)
    return ok(res, reservations)
  } catch (err) {
    return handleError(res, err)
  }
}

export async function cancelMyReservation(req: Request, res: Response) {
  try {
    const reservation = await reservationService.cancelReservation(req.params.id!, req.user!.sub)
    return ok(res, reservation)
  } catch (err) {
    return handleError(res, err)
  }
}

export async function getVoucher(req: Request, res: Response) {
  try {
    const reservation = await reservationService.getVoucherData(req.params.code!)
    return ok(res, reservation)
  } catch (err) {
    return handleError(res, err)
  }
}

// ─── Admin endpoints ──────────────────────────────────────────────────────────

export async function listAdminReservations(req: Request, res: Response) {
  try {
    const { status, page } = req.query
    const result = await reservationService.listAdminReservations({
      status: status as string | undefined,
      page: page ? parseInt(page as string) : 1,
    })
    return ok(res, result.reservations, result.meta)
  } catch (err) {
    return handleError(res, err)
  }
}

export async function approveReservationHandler(req: Request, res: Response) {
  try {
    const result = await reservationService.approveReservation(req.params.id!)
    return ok(res, result)
  } catch (err) {
    return handleError(res, err)
  }
}

export async function rejectReservationHandler(req: Request, res: Response) {
  try {
    const { adminNote } = req.body
    if (!adminNote?.trim()) return badRequest(res, 'El motivo del rechazo es requerido')
    const result = await reservationService.rejectReservation(req.params.id!, adminNote)
    return ok(res, result)
  } catch (err) {
    return handleError(res, err)
  }
}

export async function completeReservationHandler(req: Request, res: Response) {
  try {
    const result = await reservationService.completeReservation(req.params.id!)
    return ok(res, result)
  } catch (err) {
    return handleError(res, err)
  }
}

export async function extendReservationHandler(req: Request, res: Response) {
  try {
    const result = await reservationService.extendReservation(req.params.id!)
    return ok(res, result)
  } catch (err) {
    return handleError(res, err)
  }
}
