import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { getVoucherData } from '../../api/reservations'
import type { Reservation } from '../../types'

const INVALID_STATUSES = ['EXPIRED', 'REJECTED', 'CANCELLED']

export function VoucherPage() {
  const { code } = useParams<{ code: string }>()
  const [reservation, setReservation] = useState<Reservation | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!code) return
    getVoucherData(code)
      .then(setReservation)
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [code])

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#FAF8F3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#9ca3af', fontFamily: "'Inter', sans-serif" }}>Cargando comprobante...</p>
      </div>
    )
  }

  if (error || !reservation) {
    return (
      <div style={{ minHeight: '100vh', background: '#FAF8F3', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#dc2626', fontFamily: "'Inter', sans-serif", fontWeight: 600 }}>Comprobante no encontrado.</p>
        </div>
      </div>
    )
  }

  if (INVALID_STATUSES.includes(reservation.status)) {
    return (
      <div style={{ minHeight: '100vh', background: '#FAF8F3', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#dc2626', fontFamily: "'Inter', sans-serif", fontWeight: 600 }}>Este comprobante ya no es válido.</p>
        </div>
      </div>
    )
  }

  const item = reservation.item
  const photo = item.photos[0]
  const expiresStr = reservation.expiresAt
    ? new Date(reservation.expiresAt).toLocaleString('es-AR', {
        day: '2-digit', month: '2-digit', year: '2-digit',
        hour: '2-digit', minute: '2-digit',
        timeZone: 'America/Argentina/Buenos_Aires',
      })
    : null

  return (
    <div style={{ minHeight: '100vh', background: '#FAF8F3', padding: '1.5rem', display: 'flex', alignItems: 'flex-start', justifyContent: 'center' }}>
      <div style={{
        background: '#fff',
        borderRadius: '1.25rem',
        boxShadow: '0 4px 24px rgba(0,0,0,0.1)',
        maxWidth: '400px',
        width: '100%',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{ padding: '1.5rem', textAlign: 'center', borderBottom: '1px solid #E8E3D5' }}>
          {item.store && (item.store as any).logoUrl ? (
            <img src={(item.store as any).logoUrl} alt={item.store.name} style={{ height: '48px', objectFit: 'contain', marginBottom: '0.5rem' }} />
          ) : (
            <p style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.5rem', fontWeight: 700, color: '#1E1914', margin: '0 0 0.25rem' }}>
              {item.store?.name ?? 'MBDA Modas'}
            </p>
          )}
          <p style={{ fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#9ca3af', margin: 0, fontFamily: "'Inter', sans-serif" }}>
            Comprobante de Reserva
          </p>
        </div>

        {/* Product photo */}
        {photo ? (
          <div style={{ width: '100%', maxHeight: '300px', overflow: 'hidden' }}>
            <img
              src={photo.url}
              alt={item.title}
              style={{ width: '100%', height: '280px', objectFit: 'cover' }}
            />
          </div>
        ) : (
          <div style={{ width: '100%', height: '180px', background: '#E8E3D5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>
            🏪
          </div>
        )}

        {/* Product info */}
        <div style={{ padding: '1.25rem' }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.35rem', fontWeight: 700, color: '#1E1914', margin: '0 0 0.375rem' }}>
            {item.title}
          </h2>

          {item.code && (
            <span style={{ background: '#f0f9ff', color: '#0369a1', fontSize: '0.7rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: '0.375rem', fontFamily: "'Inter', sans-serif", letterSpacing: '0.05em', display: 'inline-block', marginBottom: '0.75rem' }}>
              {item.code}
            </span>
          )}

          <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1E1914', margin: '0 0 1rem', fontFamily: "'Inter', sans-serif" }}>
            ${Number(item.price).toLocaleString('es-AR')}
          </p>

          <hr style={{ border: 'none', borderTop: '1px solid #E8E3D5', margin: '0 0 0.875rem' }} />

          <p style={{ fontSize: '0.9rem', color: '#4b5563', margin: '0 0 0.375rem', fontFamily: "'Inter', sans-serif" }}>
            <strong>Código de reserva:</strong> {reservation.reservationCode}
          </p>

          {expiresStr && (
            <p style={{ fontSize: '0.9rem', color: '#4b5563', margin: '0 0 1rem', fontFamily: "'Inter', sans-serif" }}>
              <strong>Válido hasta:</strong> {expiresStr}
            </p>
          )}

          <hr style={{ border: 'none', borderTop: '1px solid #E8E3D5', margin: '0 0 0.875rem' }} />

          <div style={{ background: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: '0.75rem', padding: '0.875rem', fontSize: '0.875rem', color: '#92400E', fontFamily: "'Inter', sans-serif", lineHeight: 1.6 }}>
            ⚠ Mostrá esta pantalla al llegar a la tienda
          </div>
        </div>
      </div>
    </div>
  )
}
