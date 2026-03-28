import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getMyReservations, cancelReservation } from '../../api/reservations'
import type { Reservation, ReservationStatus } from '../../types'
import { RESERVATION_STATUS_LABEL, RESERVATION_STATUS_COLOR } from '../../types'

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

function ReservationCard({ reservation, onCancel }: { reservation: Reservation; onCancel: (id: string) => void }) {
  const countdown = useCountdown(reservation.status === 'APPROVED' ? reservation.expiresAt : null)
  const [cancelling, setCancelling] = useState(false)
  const photo = reservation.item.photos[0]
  const earnings = reservation.item.promoterCommissionPct && reservation.item.price
    ? Math.round(Number(reservation.item.price) * Number(reservation.item.promoterCommissionPct) / 100)
    : null
  const statusColor = RESERVATION_STATUS_COLOR[reservation.status]

  async function handleCancel() {
    setCancelling(true)
    try {
      await cancelReservation(reservation.id)
      onCancel(reservation.id)
    } catch {
      setCancelling(false)
    }
  }

  return (
    <div style={{
      background: '#fff',
      border: '1px solid #E8E3D5',
      borderRadius: '1rem',
      padding: '1.25rem',
      display: 'flex',
      gap: '1rem',
      alignItems: 'flex-start',
    }}>
      {photo ? (
        <img
          src={photo.url}
          alt={reservation.item.title}
          style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '0.75rem', flexShrink: 0 }}
        />
      ) : (
        <div style={{ width: '80px', height: '80px', background: '#E8E3D5', borderRadius: '0.75rem', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
          🏪
        </div>
      )}

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
          {reservation.item.code && (
            <span style={{ background: '#f0f9ff', color: '#0369a1', fontSize: '0.7rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: '0.375rem', fontFamily: "'Inter', sans-serif" }}>
              {reservation.item.code}
            </span>
          )}
          <span style={{ fontWeight: 600, color: '#1E1914', fontFamily: "'Inter', sans-serif", fontSize: '0.95rem' }}>
            {reservation.item.title}
          </span>
        </div>

        <div style={{ marginBottom: '0.5rem' }}>
          <span style={{
            background: statusColor,
            color: '#1E1914',
            fontSize: '0.75rem',
            fontWeight: 600,
            padding: '0.2rem 0.625rem',
            borderRadius: '999px',
            fontFamily: "'Inter', sans-serif",
          }}>
            {RESERVATION_STATUS_LABEL[reservation.status]}
          </span>
        </div>

        <p style={{ fontSize: '0.8rem', color: '#6b7280', margin: '0 0 0.25rem', fontFamily: "'Inter', sans-serif" }}>
          Código: {reservation.reservationCode}
        </p>

        {(reservation.status === 'APPROVED' || reservation.status === 'PENDING_APPROVAL') && earnings !== null && (
          <p style={{ fontSize: '0.85rem', color: '#166534', fontWeight: 600, margin: '0 0 0.25rem', fontFamily: "'Inter', sans-serif" }}>
            Ganancia estimada: ${earnings.toLocaleString('es-AR')}
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

        {reservation.status === 'PENDING_APPROVAL' && (
          <button
            onClick={handleCancel}
            disabled={cancelling}
            style={{
              background: 'transparent',
              border: '1px solid #dc2626',
              color: '#dc2626',
              borderRadius: '0.5rem',
              padding: '0.375rem 0.75rem',
              fontSize: '0.8rem',
              cursor: cancelling ? 'not-allowed' : 'pointer',
              fontFamily: "'Inter', sans-serif",
              opacity: cancelling ? 0.6 : 1,
            }}
          >
            {cancelling ? 'Cancelando...' : 'Cancelar'}
          </button>
        )}
      </div>
    </div>
  )
}

export function MyReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getMyReservations()
      .then(setReservations)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  function handleCancel(id: string) {
    setReservations(prev => prev.map(r => r.id === id ? { ...r, status: 'CANCELLED' as ReservationStatus } : r))
  }

  return (
    <div style={{ minHeight: '100vh', background: '#FAF8F3', padding: '1.5rem' }}>
      <div style={{ maxWidth: '640px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <Link to="/dashboard" style={{ color: '#6b7280', textDecoration: 'none', fontSize: '0.9rem', fontFamily: "'Inter', sans-serif" }}>
            ← Panel
          </Link>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.75rem', fontWeight: 700, color: '#1E1914' }}>
            Mis reservas
          </h1>
        </div>

        {loading ? (
          <p style={{ color: '#9ca3af', fontFamily: "'Inter', sans-serif" }}>Cargando...</p>
        ) : reservations.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
            <p style={{ color: '#6b7280', fontFamily: "'Inter', sans-serif", marginBottom: '1rem' }}>
              Todavía no tenés reservas. Explorá el catálogo para encontrar productos que puedas vender.
            </p>
            <Link
              to="/"
              style={{ color: '#1E1914', fontWeight: 600, textDecoration: 'none', fontFamily: "'Inter', sans-serif" }}
            >
              Ver catálogo
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {reservations.map(r => (
              <ReservationCard key={r.id} reservation={r} onCancel={handleCancel} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
