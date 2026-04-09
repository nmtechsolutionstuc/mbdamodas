import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { getMyReservations, cancelReservation } from '../../api/reservations'
import type { Reservation, ReservationStatus } from '../../types'
import { RESERVATION_STATUS_LABEL, RESERVATION_STATUS_COLOR } from '../../types'

function useCountdown(expiresAt: string | null): string {
  const compute = useCallback(() => {
    if (!expiresAt) return ''
    const ms = new Date(expiresAt).getTime() - Date.now()
    if (ms <= 0) return 'Vencida'
    const h = Math.floor(ms / 3_600_000)
    const m = Math.floor((ms % 3_600_000) / 60_000)
    return `${h}h ${m}m restantes`
  }, [expiresAt])
  const [remaining, setRemaining] = useState(compute)
  useEffect(() => {
    if (!expiresAt) return
    setRemaining(compute())
    const id = setInterval(() => setRemaining(compute()), 60_000)
    return () => clearInterval(id)
  }, [expiresAt, compute])
  return remaining
}

// ─── Compact card (clickable) ───────────────────────────────────────────

function ReservationCard({ reservation, onClick }: { reservation: Reservation; onClick: () => void }) {
  const countdown = useCountdown(reservation.status === 'APPROVED' ? reservation.expiresAt : null)
  const photo = reservation.item.photos[0]
  const earnings = reservation.item.promoterCommissionPct && reservation.item.price
    ? Math.round(Number(reservation.item.price) * Number(reservation.item.promoterCommissionPct) / 100)
    : null
  const statusColor = RESERVATION_STATUS_COLOR[reservation.status]

  return (
    <div
      onClick={onClick}
      style={{
        background: '#fff',
        border: '1px solid #E8E3D5',
        borderRadius: '1rem',
        padding: '1.25rem',
        display: 'flex',
        gap: '1rem',
        alignItems: 'flex-start',
        cursor: 'pointer',
        transition: 'box-shadow 0.15s',
      }}
      onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.08)')}
      onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
    >
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
          <p style={{ fontSize: '0.8rem', color: '#92400e', fontWeight: 600, margin: '0', fontFamily: "'Inter', sans-serif" }}>
            ⏱ {countdown}
          </p>
        )}
      </div>

      <span style={{ color: '#9ca3af', fontSize: '1.25rem', flexShrink: 0, alignSelf: 'center' }}>›</span>
    </div>
  )
}

// ─── Detail modal ───────────────────────────────────────────────────────

function ReservationModal({
  reservation,
  onClose,
  onUpdate,
}: {
  reservation: Reservation
  onClose: () => void
  onUpdate: (updated: Reservation) => void
}) {
  const [cancelling, setCancelling] = useState(false)
  const countdown = useCountdown(reservation.status === 'APPROVED' ? reservation.expiresAt : null)

  const photo = reservation.item.photos[0]
  const earnings = reservation.item.promoterCommissionPct && reservation.item.price
    ? Math.round(Number(reservation.item.price) * Number(reservation.item.promoterCommissionPct) / 100)
    : null

  async function handleCancel() {
    setCancelling(true)
    try {
      await cancelReservation(reservation.id)
      onUpdate({ ...reservation, status: 'CANCELLED' as ReservationStatus })
    } catch {
      setCancelling(false)
    }
  }

  const sectionTitle: React.CSSProperties = {
    fontSize: '0.7rem',
    fontWeight: 700,
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    margin: '1.25rem 0 0.5rem',
    fontFamily: "'Inter', sans-serif",
  }

  const infoRow: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.375rem 0',
    fontSize: '0.875rem',
    fontFamily: "'Inter', sans-serif",
    color: '#1E1914',
  }

  const infoLabel: React.CSSProperties = { color: '#6b7280' }

  const btnBase: React.CSSProperties = {
    border: 'none',
    borderRadius: '0.625rem',
    padding: '0.625rem 1rem',
    fontSize: '0.85rem',
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: "'Inter', sans-serif",
    width: '100%',
    textAlign: 'center',
    display: 'block',
    textDecoration: 'none',
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.45)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#fff',
          borderRadius: '1.25rem',
          maxWidth: '480px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
        }}
      >
        {/* Header image */}
        {photo ? (
          <div style={{ position: 'relative' }}>
            <img src={photo.url} alt="" style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '1.25rem 1.25rem 0 0' }} />
            <button
              onClick={onClose}
              style={{
                position: 'absolute', top: '0.75rem', right: '0.75rem',
                background: 'rgba(0,0,0,0.5)', color: '#fff', border: 'none',
                borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer',
                fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              ✕
            </button>
          </div>
        ) : (
          <div style={{ textAlign: 'right', padding: '0.75rem 1rem 0' }}>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem', color: '#6b7280' }}>✕</button>
          </div>
        )}

        <div style={{ padding: '1.25rem' }}>
          {/* Title + status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.25rem' }}>
            {reservation.item.code && (
              <span style={{ background: '#f0f9ff', color: '#0369a1', fontSize: '0.7rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: '0.375rem', fontFamily: "'Inter', sans-serif" }}>
                {reservation.item.code}
              </span>
            )}
            <span style={{ fontWeight: 700, color: '#1E1914', fontFamily: "'Playfair Display', serif", fontSize: '1.2rem' }}>
              {reservation.item.title}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
            <span style={{
              background: RESERVATION_STATUS_COLOR[reservation.status],
              color: '#1E1914',
              fontSize: '0.75rem',
              fontWeight: 600,
              padding: '0.2rem 0.625rem',
              borderRadius: '999px',
              fontFamily: "'Inter', sans-serif",
            }}>
              {RESERVATION_STATUS_LABEL[reservation.status]}
            </span>
            <span style={{ fontSize: '0.85rem', color: '#0369a1', fontWeight: 700, fontFamily: "'Inter', sans-serif" }}>
              {reservation.reservationCode}
            </span>
            {reservation.status === 'APPROVED' && countdown && (
              <span style={{ fontSize: '0.8rem', color: '#92400e', fontWeight: 600, fontFamily: "'Inter', sans-serif" }}>
                ⏱ {countdown}
              </span>
            )}
          </div>

          {/* ─── PRODUCT INFO ─── */}
          <div style={sectionTitle}>Producto</div>
          <div style={{ background: '#FAF8F3', borderRadius: '0.75rem', padding: '0.75rem 1rem' }}>
            <div style={infoRow}>
              <span style={infoLabel}>Precio</span>
              <span style={{ fontWeight: 700 }}>${Number(reservation.item.price).toLocaleString('es-AR')}</span>
            </div>
            {reservation.quantity > 1 && (
              <div style={infoRow}>
                <span style={infoLabel}>Cantidad reservada</span>
                <span style={{ fontWeight: 700 }}>{reservation.quantity} unidades</span>
              </div>
            )}
            {reservation.item.promoterCommissionPct != null && (
              <div style={infoRow}>
                <span style={infoLabel}>Comisión</span>
                <span style={{ fontWeight: 600 }}>{reservation.item.promoterCommissionPct}%</span>
              </div>
            )}
            {earnings !== null && (
              <div style={infoRow}>
                <span style={infoLabel}>Tu ganancia estimada</span>
                <span style={{ fontWeight: 700, color: '#166534' }}>
                  ${(earnings * reservation.quantity).toLocaleString('es-AR')}
                  {reservation.quantity > 1 ? ` (${reservation.quantity} x $${earnings.toLocaleString('es-AR')})` : ''}
                </span>
              </div>
            )}
          </div>

          {/* ─── DATES ─── */}
          <div style={sectionTitle}>Fechas</div>
          <div style={{ background: '#FAF8F3', borderRadius: '0.75rem', padding: '0.75rem 1rem' }}>
            <div style={infoRow}>
              <span style={infoLabel}>Creada</span>
              <span>{new Date(reservation.createdAt).toLocaleString('es-AR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            {reservation.expiresAt && (
              <div style={infoRow}>
                <span style={infoLabel}>Vence</span>
                <span style={{ fontWeight: 600, color: '#92400e' }}>
                  {new Date(reservation.expiresAt).toLocaleString('es-AR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            )}
            {reservation.extensionCount > 0 && (
              <div style={infoRow}>
                <span style={infoLabel}>Extensiones</span>
                <span>{reservation.extensionCount} vez{reservation.extensionCount > 1 ? 'es' : ''}</span>
              </div>
            )}
            {reservation.completedAt && (
              <div style={infoRow}>
                <span style={infoLabel}>Completada</span>
                <span style={{ color: '#166534', fontWeight: 600 }}>
                  {new Date(reservation.completedAt).toLocaleString('es-AR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            )}
          </div>

          {/* Admin note */}
          {reservation.adminNote && (
            <>
              <div style={sectionTitle}>Nota</div>
              <div style={{ background: '#FEF2F2', borderRadius: '0.75rem', padding: '0.75rem 1rem', fontSize: '0.85rem', color: '#991B1B', fontFamily: "'Inter', sans-serif" }}>
                {reservation.adminNote}
              </div>
            </>
          )}

          {/* ─── VOUCHER (for APPROVED or COMPLETED) ─── */}
          {(reservation.status === 'APPROVED' || reservation.status === 'COMPLETED') && (
            <>
              <div style={sectionTitle}>Comprobante</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <a
                  href={`/comprobante/${reservation.reservationCode}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    ...btnBase,
                    background: '#1E1914',
                    color: '#E8E3D5',
                  }}
                >
                  🧾 Ver comprobante (sacale screenshot para tu comprador)
                </a>
                <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: 0, textAlign: 'center', fontFamily: "'Inter', sans-serif" }}>
                  Abrí el comprobante, sacale una captura de pantalla y enviasela a tu comprador para que lo presente en la tienda.
                </p>
              </div>
            </>
          )}

          {/* ─── ACTIONS ─── */}
          {reservation.status === 'PENDING_APPROVAL' && (
            <>
              <div style={{ borderTop: '1px solid #E8E3D5', margin: '1.25rem 0 0.75rem' }} />
              <button
                onClick={handleCancel}
                disabled={cancelling}
                style={{
                  ...btnBase,
                  background: 'transparent',
                  border: '1px solid #dc2626',
                  color: '#dc2626',
                  opacity: cancelling ? 0.6 : 1,
                  cursor: cancelling ? 'not-allowed' : 'pointer',
                }}
              >
                {cancelling ? 'Cancelando...' : 'Cancelar reserva'}
              </button>
            </>
          )}

          {/* Close button */}
          <button
            onClick={onClose}
            style={{
              ...btnBase,
              background: '#E8E3D5',
              color: '#1E1914',
              marginTop: '1rem',
            }}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main page ──────────────────────────────────────────────────────────

export function MyReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Reservation | null>(null)

  useEffect(() => {
    getMyReservations()
      .then(setReservations)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  function handleUpdate(updated: Reservation) {
    setReservations(prev => prev.map(r => r.id === updated.id ? updated : r))
    setSelected(updated)
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

        {/* CTA: ganar comisiones */}
        <Link
          to="/#catalogo"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            background: '#1E1914',
            color: '#E8E3D5',
            padding: '0.875rem 1.5rem',
            borderRadius: '0.75rem',
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: '0.95rem',
            fontFamily: "'Inter', sans-serif",
            marginBottom: '1.5rem',
            transition: 'background 0.15s ease',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = '#352e28')}
          onMouseLeave={e => (e.currentTarget.style.background = '#1E1914')}
        >
          💰 Ganar comisiones — Ver catálogo de productos
        </Link>

        {loading ? (
          <p style={{ color: '#9ca3af', fontFamily: "'Inter', sans-serif" }}>Cargando...</p>
        ) : reservations.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
            <p style={{ color: '#6b7280', fontFamily: "'Inter', sans-serif", marginBottom: '1rem' }}>
              Todavía no tenés reservas. Explorá el catálogo para encontrar productos que puedas vender y ganar una comisión.
            </p>
            <Link
              to="/"
              style={{ color: '#1E1914', fontWeight: 600, textDecoration: 'none', fontFamily: "'Inter', sans-serif" }}
            >
              Ver catálogo →
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {reservations.map(r => (
              <ReservationCard key={r.id} reservation={r} onClick={() => setSelected(r)} />
            ))}
          </div>
        )}
      </div>

      {/* Modal overlay */}
      {selected && (
        <ReservationModal
          reservation={selected}
          onClose={() => setSelected(null)}
          onUpdate={handleUpdate}
        />
      )}
    </div>
  )
}
