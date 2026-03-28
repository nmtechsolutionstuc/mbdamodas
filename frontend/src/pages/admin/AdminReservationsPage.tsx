import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  fetchAdminReservations,
  approveAdminReservation,
  rejectAdminReservation,
  completeAdminReservation,
  extendAdminReservation,
} from '../../api/reservations'
import type { Reservation, ReservationStatus } from '../../types'
import { RESERVATION_STATUS_LABEL, RESERVATION_STATUS_COLOR } from '../../types'

type FilterTab = 'all' | 'PENDING_APPROVAL' | 'APPROVED' | 'COMPLETED'

const tabs: { label: string; value: FilterTab }[] = [
  { label: 'Todas', value: 'all' },
  { label: 'Pendientes', value: 'PENDING_APPROVAL' },
  { label: 'Aprobadas', value: 'APPROVED' },
  { label: 'Completadas', value: 'COMPLETED' },
]

function useCountdown(expiresAt: string | null): string {
  const compute = () => {
    if (!expiresAt) return ''
    const ms = new Date(expiresAt).getTime() - Date.now()
    if (ms <= 0) return 'Vencida'
    const h = Math.floor(ms / 3_600_000)
    const m = Math.floor((ms % 3_600_000) / 60_000)
    return `${h}h ${m}m restantes`
  }
  const [remaining, setRemaining] = useState(compute)
  useEffect(() => {
    if (!expiresAt) return
    const id = setInterval(() => setRemaining(compute()), 60_000)
    return () => clearInterval(id)
  }, [expiresAt])
  return remaining
}

function ReservationAdminCard({
  reservation,
  onUpdate,
}: {
  reservation: Reservation
  onUpdate: (updated: Reservation) => void
}) {
  const [busy, setBusy] = useState(false)
  const [showRejectForm, setShowRejectForm] = useState(false)
  const [rejectNote, setRejectNote] = useState('')
  const countdown = useCountdown(reservation.status === 'APPROVED' ? reservation.expiresAt : null)
  const photo = reservation.item.photos[0]
  const earnings = reservation.item.promoterCommissionPct && reservation.item.price
    ? Math.round(Number(reservation.item.price) * Number(reservation.item.promoterCommissionPct) / 100)
    : null
  const user = reservation.user

  async function handleApprove() {
    setBusy(true)
    try {
      const result = await approveAdminReservation(reservation.id)
      onUpdate(result.reservation)
      if (result.whatsappToPromoter) window.open(result.whatsappToPromoter, '_blank')
    } catch { /* ignore */ } finally { setBusy(false) }
  }

  async function handleReject() {
    if (!rejectNote.trim()) return
    setBusy(true)
    try {
      const result = await rejectAdminReservation(reservation.id, rejectNote)
      onUpdate(result.reservation)
      if (result.whatsappToPromoter) window.open(result.whatsappToPromoter, '_blank')
    } catch { /* ignore */ } finally { setBusy(false); setShowRejectForm(false) }
  }

  async function handleComplete() {
    setBusy(true)
    try {
      const result = await completeAdminReservation(reservation.id)
      onUpdate(result.reservation)
      if (result.whatsappToPromoter) window.open(result.whatsappToPromoter, '_blank')
    } catch { /* ignore */ } finally { setBusy(false) }
  }

  async function handleExtend() {
    setBusy(true)
    try {
      const result = await extendAdminReservation(reservation.id)
      onUpdate(result.reservation)
      if (result.whatsappToPromoter) window.open(result.whatsappToPromoter, '_blank')
    } catch { /* ignore */ } finally { setBusy(false) }
  }

  function handleSendVoucher() {
    if (!user?.phone) return
    const voucherUrl = `${window.location.origin}/comprobante/${reservation.reservationCode}`
    const text = `Hola ${user.firstName}! Aquí está tu comprobante de reserva.\nEntrá al link, sacá captura de pantalla y mandásela a tu comprador:\n${voucherUrl}`
    const waLink = `https://wa.me/${user.phone}?text=${encodeURIComponent(text)}`
    window.open(waLink, '_blank')
  }

  const btnBase = {
    border: 'none',
    borderRadius: '0.5rem',
    padding: '0.5rem 0.875rem',
    fontSize: '0.8rem',
    fontWeight: 600 as const,
    cursor: busy ? 'not-allowed' as const : 'pointer' as const,
    fontFamily: "'Inter', sans-serif",
    opacity: busy ? 0.6 : 1,
  }

  return (
    <div style={{ background: '#fff', border: '1px solid #E8E3D5', borderRadius: '1rem', padding: '1.25rem' }}>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
        {photo ? (
          <img src={photo.url} alt={reservation.item.title} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '0.75rem', flexShrink: 0 }} />
        ) : (
          <div style={{ width: '80px', height: '80px', background: '#E8E3D5', borderRadius: '0.75rem', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>🏪</div>
        )}

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.25rem' }}>
            {reservation.item.code && (
              <span style={{ background: '#f0f9ff', color: '#0369a1', fontSize: '0.7rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: '0.375rem', fontFamily: "'Inter', sans-serif" }}>
                {reservation.item.code}
              </span>
            )}
            <span style={{ fontWeight: 600, color: '#1E1914', fontFamily: "'Inter', sans-serif" }}>{reservation.item.title}</span>
            <span style={{
              background: RESERVATION_STATUS_COLOR[reservation.status],
              color: '#1E1914',
              fontSize: '0.7rem',
              fontWeight: 600,
              padding: '0.15rem 0.5rem',
              borderRadius: '999px',
              fontFamily: "'Inter', sans-serif",
            }}>
              {RESERVATION_STATUS_LABEL[reservation.status]}
            </span>
          </div>

          <p style={{ fontSize: '0.8rem', color: '#6b7280', margin: '0 0 0.25rem', fontFamily: "'Inter', sans-serif" }}>
            Código: {reservation.reservationCode}
          </p>

          {user && (
            <p style={{ fontSize: '0.8rem', color: '#4b5563', margin: '0 0 0.25rem', fontFamily: "'Inter', sans-serif" }}>
              Promotor: {user.firstName} {user.lastName}
              {user.dni && ` · DNI ${user.dni}`}
              {user.phone && (
                <>
                  {' · '}
                  <a href={`https://wa.me/${user.phone}`} target="_blank" rel="noopener noreferrer" style={{ color: '#25D366', textDecoration: 'none' }}>
                    {user.phone}
                  </a>
                </>
              )}
            </p>
          )}

          {earnings !== null && (
            <p style={{ fontSize: '0.8rem', color: '#166534', fontWeight: 600, margin: '0 0 0.25rem', fontFamily: "'Inter', sans-serif" }}>
              Ganancia promotor: ${earnings.toLocaleString('es-AR')} ({reservation.item.promoterCommissionPct}%)
            </p>
          )}

          {reservation.status === 'APPROVED' && countdown && (
            <p style={{ fontSize: '0.8rem', color: '#92400e', fontWeight: 600, margin: '0 0 0.5rem', fontFamily: "'Inter', sans-serif" }}>
              ⏱ {countdown}
            </p>
          )}

          {reservation.adminNote && (
            <p style={{ fontSize: '0.8rem', color: '#9ca3af', margin: '0 0 0.5rem', fontFamily: "'Inter', sans-serif" }}>
              Nota: {reservation.adminNote}
            </p>
          )}

          {/* Action buttons */}
          {reservation.status === 'PENDING_APPROVAL' && (
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.75rem' }}>
              {reservation.store?.storeAttendantPhone && (
                <a
                  href={`https://wa.me/${reservation.store.storeAttendantPhone}?text=${encodeURIComponent(`Hola! Hay una reserva para el producto "${reservation.item.title}"${reservation.item.code ? ` (${reservation.item.code})` : ''}, código ${reservation.reservationCode}. ¿El producto está disponible? ¿La tienda abrirá en las próximas 24hs?`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ ...btnBase, background: '#E8E3D5', color: '#1E1914', textDecoration: 'none', display: 'inline-block' }}
                >
                  Consultar encargado
                </a>
              )}
              <button onClick={handleApprove} disabled={busy} style={{ ...btnBase, background: '#166534', color: '#fff' }}>
                Aprobar
              </button>
              <button
                onClick={() => setShowRejectForm(p => !p)}
                disabled={busy}
                style={{ ...btnBase, background: 'transparent', border: '1px solid #dc2626', color: '#dc2626' }}
              >
                Rechazar
              </button>
            </div>
          )}

          {reservation.status === 'PENDING_APPROVAL' && showRejectForm && (
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <input
                value={rejectNote}
                onChange={e => setRejectNote(e.target.value)}
                placeholder="Motivo del rechazo..."
                style={{ flex: 1, minWidth: '160px', border: '1px solid #E8E3D5', borderRadius: '0.5rem', padding: '0.5rem 0.75rem', fontSize: '0.85rem', fontFamily: "'Inter', sans-serif" }}
              />
              <button onClick={handleReject} disabled={busy || !rejectNote.trim()} style={{ ...btnBase, background: '#dc2626', color: '#fff' }}>
                Confirmar rechazo
              </button>
            </div>
          )}

          {reservation.status === 'APPROVED' && (
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.75rem' }}>
              <a
                href={`/comprobante/${reservation.reservationCode}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ ...btnBase, background: 'transparent', border: '1px solid #E8E3D5', color: '#1E1914', textDecoration: 'none', display: 'inline-block' }}
              >
                Ver comprobante
              </a>
              <button onClick={handleSendVoucher} style={{ ...btnBase, background: '#25D366', color: '#fff' }}>
                Enviar comprobante al promotor
              </button>
              <button onClick={handleExtend} disabled={busy} style={{ ...btnBase, background: 'transparent', border: '1px solid #1e40af', color: '#1e40af' }}>
                Extender 24hs
              </button>
              <button onClick={handleComplete} disabled={busy} style={{ ...btnBase, background: '#1E1914', color: '#E8E3D5' }}>
                Completar venta
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export function AdminReservationsPage() {
  const [activeTab, setActiveTab] = useState<FilterTab>('all')
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [meta, setMeta] = useState({ total: 0, pages: 1 })

  useEffect(() => {
    setPage(1)
  }, [activeTab])

  useEffect(() => {
    loadReservations()
  }, [activeTab, page])

  async function loadReservations() {
    setLoading(true)
    try {
      const status = activeTab === 'all' ? undefined : activeTab
      const result = await fetchAdminReservations(status, page)
      setReservations(result.data)
      setMeta({ total: result.meta.total, pages: result.meta.pages })
    } catch { /* ignore */ } finally { setLoading(false) }
  }

  function handleUpdate(updated: Reservation) {
    setReservations(prev => prev.map(r => r.id === updated.id ? updated : r))
  }

  return (
    <div style={{ minHeight: '100vh', background: '#FAF8F3', padding: '1.5rem' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <Link to="/admin" style={{ color: '#6b7280', textDecoration: 'none', fontSize: '0.9rem', fontFamily: "'Inter', sans-serif" }}>
            ← Panel
          </Link>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.75rem', fontWeight: 700, color: '#1E1914' }}>
            Reservas
          </h1>
          {meta.total > 0 && (
            <span style={{ background: '#E8E3D5', color: '#1E1914', fontSize: '0.8rem', padding: '0.25rem 0.75rem', borderRadius: '999px', fontWeight: 600 }}>
              {meta.total}
            </span>
          )}
        </div>

        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          {tabs.map(tab => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '0.75rem',
                border: '1px solid #E8E3D5',
                background: activeTab === tab.value ? '#1E1914' : '#fff',
                color: activeTab === tab.value ? '#E8E3D5' : '#1E1914',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
                fontFamily: "'Inter', sans-serif",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <p style={{ color: '#9ca3af', fontFamily: "'Inter', sans-serif" }}>Cargando...</p>
        ) : reservations.length === 0 ? (
          <p style={{ color: '#9ca3af', textAlign: 'center', padding: '3rem', fontFamily: "'Inter', sans-serif" }}>
            No hay reservas en esta categoría.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {reservations.map(r => (
              <ReservationAdminCard key={r.id} reservation={r} onUpdate={handleUpdate} />
            ))}
          </div>
        )}

        {meta.pages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '2rem' }}>
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              style={{ padding: '0.5rem 1rem', border: '1px solid #E8E3D5', borderRadius: '0.5rem', background: '#fff', cursor: 'pointer', opacity: page === 1 ? 0.4 : 1 }}
            >
              ←
            </button>
            <span style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', color: '#6b7280' }}>
              {page} / {meta.pages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(meta.pages, p + 1))}
              disabled={page === meta.pages}
              style={{ padding: '0.5rem 1rem', border: '1px solid #E8E3D5', borderRadius: '0.5rem', background: '#fff', cursor: 'pointer', opacity: page === meta.pages ? 0.4 : 1 }}
            >
              →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
