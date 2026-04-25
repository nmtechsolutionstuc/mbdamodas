import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  fetchAdminReservations,
  approveAdminReservation,
  rejectAdminReservation,
  completeAdminReservation,
  extendAdminReservation,
} from '../../api/reservations'
import { deleteAdminReservation, resendReservationWhatsapp } from '../../api/admin'
import type { Reservation } from '../../types'
import { RESERVATION_STATUS_LABEL, RESERVATION_STATUS_COLOR } from '../../types'

type FilterTab = 'all' | 'PENDING_APPROVAL' | 'APPROVED' | 'COMPLETED'

const tabs: { label: string; value: FilterTab }[] = [
  { label: 'Todas', value: 'all' },
  { label: 'Pendientes', value: 'PENDING_APPROVAL' },
  { label: 'Aprobadas', value: 'APPROVED' },
  { label: 'Completadas', value: 'COMPLETED' },
]

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

// ─── Compact card (list view) ───────────────────────────────────────────

function ReservationCard({
  reservation,
  onClick,
}: {
  reservation: Reservation
  onClick: () => void
}) {
  const photo = reservation.item.photos[0]
  const countdown = useCountdown(reservation.status === 'APPROVED' ? reservation.expiresAt : null)
  const user = reservation.user

  return (
    <div
      onClick={onClick}
      style={{
        background: '#fff',
        border: '1px solid #E8E3D5',
        borderRadius: '1rem',
        padding: '1rem 1.25rem',
        cursor: 'pointer',
        transition: 'box-shadow 0.15s',
      }}
      onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.08)')}
      onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
    >
      <div style={{ display: 'flex', gap: '0.875rem', alignItems: 'center' }}>
        {photo ? (
          <img src={photo.url} alt="" style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '0.625rem', flexShrink: 0 }} />
        ) : (
          <div style={{ width: '60px', height: '60px', background: '#E8E3D5', borderRadius: '0.625rem', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>🏪</div>
        )}

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.2rem' }}>
            <span style={{ fontWeight: 600, color: '#1E1914', fontFamily: "'Inter', sans-serif", fontSize: '0.95rem' }}>
              {reservation.item.title}
            </span>
            <span style={{
              background: RESERVATION_STATUS_COLOR[reservation.status],
              color: '#1E1914',
              fontSize: '0.65rem',
              fontWeight: 600,
              padding: '0.125rem 0.5rem',
              borderRadius: '999px',
              fontFamily: "'Inter', sans-serif",
            }}>
              {RESERVATION_STATUS_LABEL[reservation.status]}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.8rem', color: '#6b7280', fontFamily: "'Inter', sans-serif" }}>
            <span style={{ fontWeight: 600, color: '#0369a1' }}>{reservation.reservationCode}</span>
            {user && <span>{user.firstName} {user.lastName}</span>}
            {reservation.status === 'APPROVED' && countdown && (
              <span style={{ color: '#92400e', fontWeight: 600 }}>⏱ {countdown}</span>
            )}
          </div>
        </div>

        <span style={{ color: '#9ca3af', fontSize: '1.25rem', flexShrink: 0 }}>›</span>
      </div>
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
  const [busy, setBusy] = useState(false)
  const [showRejectForm, setShowRejectForm] = useState(false)
  const [rejectNote, setRejectNote] = useState('')
  const [actionDone, setActionDone] = useState<string | null>(null)
  const [whatsappLinks, setWhatsappLinks] = useState<{
    toPromoter?: string
    toAttendant?: string
    sendVoucher?: string
  } | null>(null)
  const countdown = useCountdown(reservation.status === 'APPROVED' ? reservation.expiresAt : null)

  const photo = reservation.item.photos[0]
  const user = reservation.user
  const store = reservation.store
  const unitEarnings = reservation.item.promoterCommissionPct && reservation.item.price
    ? Math.round(Number(reservation.item.price) * Number(reservation.item.promoterCommissionPct) / 100)
    : null
  const earnings = unitEarnings !== null ? unitEarnings * reservation.quantity : null

  const attendantPhone = store?.storeAttendantPhone
  const waAttendantLink = attendantPhone
    ? `https://wa.me/${attendantPhone}?text=${encodeURIComponent(`Hola! Hay una reserva para el producto "${reservation.item.title}"${reservation.item.code ? ` (${reservation.item.code})` : ''}, código ${reservation.reservationCode}. ¿El producto está disponible? ¿La tienda abrirá en las próximas 24hs?`)}`
    : null

  async function handleApprove() {
    setBusy(true)
    try {
      const result = await approveAdminReservation(reservation.id)
      onUpdate(result.reservation)
      setActionDone('approved')
      const links: typeof whatsappLinks = {}
      if (result.whatsappToPromoter) links.toPromoter = result.whatsappToPromoter
      if (result.whatsappToAttendant) links.toAttendant = result.whatsappToAttendant
      if (user?.phone) {
        const voucherUrl = `${window.location.origin}/comprobante/${reservation.reservationCode}`
        const text = `Hola ${user.firstName}! Aquí está tu comprobante de reserva.\nEntrá al link, sacá captura de pantalla y mandásela a tu comprador:\n${voucherUrl}`
        links.sendVoucher = `https://wa.me/${user.phone}?text=${encodeURIComponent(text)}`
      }
      setWhatsappLinks(links)
    } catch { /* ignore */ } finally { setBusy(false) }
  }

  async function handleReject() {
    if (!rejectNote.trim()) return
    setBusy(true)
    try {
      const result = await rejectAdminReservation(reservation.id, rejectNote)
      onUpdate(result.reservation)
      setActionDone('rejected')
      if (result.whatsappToPromoter) setWhatsappLinks({ toPromoter: result.whatsappToPromoter })
    } catch { /* ignore */ } finally { setBusy(false) }
  }

  async function handleComplete() {
    setBusy(true)
    try {
      const result = await completeAdminReservation(reservation.id)
      onUpdate(result.reservation)
      setActionDone('completed')
      if (result.whatsappToPromoter) setWhatsappLinks({ toPromoter: result.whatsappToPromoter })
    } catch { /* ignore */ } finally { setBusy(false) }
  }

  async function handleExtend() {
    setBusy(true)
    try {
      const result = await extendAdminReservation(reservation.id)
      onUpdate(result.reservation)
      setActionDone('extended')
      if (result.whatsappToPromoter) setWhatsappLinks({ toPromoter: result.whatsappToPromoter })
    } catch { /* ignore */ } finally { setBusy(false) }
  }

  const btnBase: React.CSSProperties = {
    border: 'none',
    borderRadius: '0.625rem',
    padding: '0.625rem 1rem',
    fontSize: '0.85rem',
    fontWeight: 600,
    cursor: busy ? 'not-allowed' : 'pointer',
    fontFamily: "'Inter', sans-serif",
    opacity: busy ? 0.6 : 1,
    width: '100%',
    textAlign: 'center',
    display: 'block',
    textDecoration: 'none',
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

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
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

          {/* Action done success */}
          {actionDone && (
            <div style={{
              background: actionDone === 'rejected' ? '#FEF2F2' : '#F0FDF4',
              border: `1px solid ${actionDone === 'rejected' ? '#FECACA' : '#BBF7D0'}`,
              borderRadius: '0.75rem',
              padding: '0.75rem 1rem',
              marginBottom: whatsappLinks ? '0.5rem' : '1rem',
              fontSize: '0.85rem',
              fontFamily: "'Inter', sans-serif",
              color: actionDone === 'rejected' ? '#991B1B' : '#166534',
              fontWeight: 600,
            }}>
              {actionDone === 'approved' && '✅ Reserva aprobada. Usá los botones de abajo para notificar por WhatsApp.'}
              {actionDone === 'rejected' && '❌ Reserva rechazada. Usá el botón de abajo para notificar al promotor.'}
              {actionDone === 'completed' && '🎉 Venta completada. Usá el botón de abajo para enviar los datos de pago.'}
              {actionDone === 'extended' && '⏱ Vigencia extendida 24hs. Usá el botón de abajo para avisar al promotor.'}
            </div>
          )}

          {/* WhatsApp link buttons (shown after action) */}
          {whatsappLinks && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
              {whatsappLinks.toPromoter && (
                <a
                  href={whatsappLinks.toPromoter}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    ...btnBase,
                    background: '#25D366',
                    color: '#fff',
                    textDecoration: 'none',
                  }}
                >
                  📱 Enviar WhatsApp al promotor
                </a>
              )}
              {whatsappLinks.toAttendant && (
                <a
                  href={whatsappLinks.toAttendant}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    ...btnBase,
                    background: '#25D366',
                    color: '#fff',
                    textDecoration: 'none',
                  }}
                >
                  📱 Consultar al encargado
                </a>
              )}
              {whatsappLinks.sendVoucher && (
                <a
                  href={whatsappLinks.sendVoucher}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    ...btnBase,
                    background: '#25D366',
                    color: '#fff',
                    textDecoration: 'none',
                  }}
                >
                  🎫 Enviar comprobante
                </a>
              )}
            </div>
          )}

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
                <span style={infoLabel}>Comisión promotor</span>
                <span style={{ fontWeight: 600 }}>{reservation.item.promoterCommissionPct}%</span>
              </div>
            )}
            {earnings !== null && (
              <div style={infoRow}>
                <span style={infoLabel}>Ganancia promotor</span>
                <span style={{ fontWeight: 700, color: '#166534' }}>
                  ${earnings.toLocaleString('es-AR')}
                  {reservation.quantity > 1 && unitEarnings !== null && (
                    <span style={{ fontWeight: 400, color: '#6b7280', fontSize: '0.8rem' }}>
                      {' '}({reservation.quantity} x ${unitEarnings.toLocaleString('es-AR')})
                    </span>
                  )}
                </span>
              </div>
            )}
          </div>

          {/* ─── PROMOTOR INFO ─── */}
          {user && (
            <>
              <div style={sectionTitle}>Promotor</div>
              <div style={{ background: '#FAF8F3', borderRadius: '0.75rem', padding: '0.75rem 1rem' }}>
                <div style={infoRow}>
                  <span style={infoLabel}>Nombre</span>
                  <span style={{ fontWeight: 600 }}>{user.firstName} {user.lastName}</span>
                </div>
                {user.dni && (
                  <div style={infoRow}>
                    <span style={infoLabel}>DNI</span>
                    <span style={{ fontWeight: 600 }}>{user.dni}</span>
                  </div>
                )}
                {user.phone && (
                  <div style={infoRow}>
                    <span style={infoLabel}>WhatsApp</span>
                    <a href={`https://wa.me/${user.phone}`} target="_blank" rel="noopener noreferrer" style={{ color: '#25D366', fontWeight: 600, textDecoration: 'none' }}>
                      {user.phone}
                    </a>
                  </div>
                )}
                {user.paymentMethod && (
                  <div style={infoRow}>
                    <span style={infoLabel}>Método de pago</span>
                    <span>{user.paymentMethod === 'TRANSFERENCIA' ? `Transferencia (${user.bankAlias ?? 'sin alias'})` : 'Efectivo'}</span>
                  </div>
                )}
              </div>
            </>
          )}

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
              <div style={sectionTitle}>Nota del admin</div>
              <div style={{ background: '#FEF2F2', borderRadius: '0.75rem', padding: '0.75rem 1rem', fontSize: '0.85rem', color: '#991B1B', fontFamily: "'Inter', sans-serif" }}>
                {reservation.adminNote}
              </div>
            </>
          )}

          {/* ─── ACTIONS ─── */}
          {(reservation.status === 'PENDING_APPROVAL' || reservation.status === 'APPROVED') && !actionDone && (
            <>
              <div style={sectionTitle}>Acciones</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>

                {/* ── PENDING_APPROVAL ── */}
                {reservation.status === 'PENDING_APPROVAL' && (
                  <>
                    {/* Consultar encargado — ALWAYS FIRST AND PROMINENT */}
                    {waAttendantLink ? (
                      <a
                        href={waAttendantLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          ...btnBase,
                          background: '#25D366',
                          color: '#fff',
                          fontSize: '0.9rem',
                          padding: '0.75rem 1rem',
                        }}
                      >
                        📱 Consultar encargado de la tienda
                      </a>
                    ) : (
                      <div style={{
                        background: '#FEF3C7',
                        border: '1px solid #FDE68A',
                        borderRadius: '0.625rem',
                        padding: '0.625rem 1rem',
                        fontSize: '0.8rem',
                        color: '#92400E',
                        fontFamily: "'Inter', sans-serif",
                        textAlign: 'center',
                      }}>
                        ⚠ Para consultar al encargado, agregá su teléfono en{' '}
                        <Link to="/admin/tiendas" style={{ color: '#92400E', fontWeight: 700 }}>Tiendas</Link>
                      </div>
                    )}

                    <div style={{ borderTop: '1px solid #E8E3D5', margin: '0.25rem 0' }} />

                    <button onClick={handleApprove} disabled={busy} style={{ ...btnBase, background: '#166534', color: '#fff' }}>
                      ✅ Aprobar reserva
                    </button>

                    {!showRejectForm ? (
                      <button
                        onClick={() => setShowRejectForm(true)}
                        disabled={busy}
                        style={{ ...btnBase, background: 'transparent', border: '1px solid #dc2626', color: '#dc2626' }}
                      >
                        Rechazar
                      </button>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <input
                          value={rejectNote}
                          onChange={e => setRejectNote(e.target.value)}
                          placeholder="Motivo del rechazo..."
                          autoFocus
                          style={{
                            border: '1px solid #E8E3D5',
                            borderRadius: '0.625rem',
                            padding: '0.625rem 0.875rem',
                            fontSize: '0.85rem',
                            fontFamily: "'Inter', sans-serif",
                            width: '100%',
                            boxSizing: 'border-box',
                          }}
                        />
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            onClick={() => { setShowRejectForm(false); setRejectNote('') }}
                            style={{ ...btnBase, background: '#E8E3D5', color: '#1E1914', flex: 1 }}
                          >
                            Cancelar
                          </button>
                          <button
                            onClick={handleReject}
                            disabled={busy || !rejectNote.trim()}
                            style={{ ...btnBase, background: '#dc2626', color: '#fff', flex: 1, opacity: (!rejectNote.trim() || busy) ? 0.5 : 1 }}
                          >
                            Confirmar rechazo
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* ── APPROVED ── */}
                {reservation.status === 'APPROVED' && (
                  <>
                    <a
                      href={`/comprobante/${reservation.reservationCode}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ ...btnBase, background: '#E8E3D5', color: '#1E1914' }}
                    >
                      🧾 Ver comprobante
                    </a>

                    {user?.phone ? (
                      <a
                        href={`https://wa.me/${user.phone}?text=${encodeURIComponent(`Hola ${user.firstName}! Aquí está tu comprobante de reserva.\nEntrá al link, sacá captura de pantalla y mandásela a tu comprador:\n${window.location.origin}/comprobante/${reservation.reservationCode}`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ ...btnBase, background: '#25D366', color: '#fff', textDecoration: 'none' }}
                      >
                        📱 Enviar comprobante al promotor
                      </a>
                    ) : (
                      <button disabled style={{ ...btnBase, background: '#25D366', color: '#fff', opacity: 0.5 }}>
                        📱 Enviar comprobante al promotor
                      </button>
                    )}

                    <div style={{ borderTop: '1px solid #E8E3D5', margin: '0.25rem 0' }} />

                    <button onClick={handleExtend} disabled={busy} style={{ ...btnBase, background: 'transparent', border: '1px solid #1e40af', color: '#1e40af' }}>
                      ⏱ Extender vigencia 24hs
                    </button>

                    <button onClick={handleComplete} disabled={busy} style={{ ...btnBase, background: '#1E1914', color: '#E8E3D5', fontSize: '0.9rem', padding: '0.75rem 1rem' }}>
                      🎉 Completar venta
                    </button>
                  </>
                )}
              </div>
            </>
          )}

          {/* Close button at bottom for completed/rejected/etc */}
          {(actionDone || reservation.status === 'COMPLETED' || reservation.status === 'REJECTED' || reservation.status === 'EXPIRED' || reservation.status === 'CANCELLED') && (
            <button
              onClick={onClose}
              style={{
                ...btnBase,
                background: '#E8E3D5',
                color: '#1E1914',
                marginTop: '1.25rem',
              }}
            >
              Cerrar
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Main page ──────────────────────────────────────────────────────────

export function AdminReservationsPage() {
  const [activeTab, setActiveTab] = useState<FilterTab>('all')
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [meta, setMeta] = useState({ total: 0, pages: 1 })
  const [selected, setSelected] = useState<Reservation | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [resendLinks, setResendLinks] = useState<Record<string, string>>({})

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
    setSelected(updated)
  }

  async function handleDelete(id: string) {
    try {
      await deleteAdminReservation(id)
      setReservations(prev => prev.filter(r => r.id !== id))
      setDeletingId(null)
    } catch { /* ignore */ }
  }

  async function handleResendWhatsapp(id: string) {
    try {
      const result = await resendReservationWhatsapp(id)
      if (result.whatsappLink) {
        setResendLinks(prev => ({ ...prev, [id]: result.whatsappLink! }))
      }
    } catch { /* ignore */ }
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {reservations.map(r => {
              const isDeletable = r.status === 'COMPLETED' || r.status === 'REJECTED' || r.status === 'EXPIRED' || r.status === 'CANCELLED'
              const isCompleted = r.status === 'COMPLETED'
              const resendLink = resendLinks[r.id]
              return (
                <div key={r.id}>
                  <ReservationCard reservation={r} onClick={() => setSelected(r)} />
                  {(isDeletable || isCompleted) && (
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.375rem', paddingLeft: '0.25rem', flexWrap: 'wrap' }}>
                      {isCompleted && (
                        resendLink ? (
                          <a
                            href={resendLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ display: 'inline-block', background: '#25D366', color: '#fff', padding: '0.375rem 0.75rem', borderRadius: '0.5rem', textDecoration: 'none', fontSize: '0.75rem', fontWeight: 600 }}
                          >
                            📲 Abrir WhatsApp
                          </a>
                        ) : (
                          <button
                            onClick={() => handleResendWhatsapp(r.id)}
                            style={{ background: '#dcfce7', color: '#166534', border: '1px solid #bbf7d0', borderRadius: '0.5rem', padding: '0.375rem 0.75rem', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                          >
                            📲 Notificar pago
                          </button>
                        )
                      )}
                      {isDeletable && (
                        deletingId === r.id ? (
                          <div style={{ display: 'flex', gap: '0.375rem', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.75rem', color: '#dc2626', fontWeight: 600 }}>¿Eliminar?</span>
                            <button
                              onClick={() => handleDelete(r.id)}
                              style={{ background: '#dc2626', color: '#fff', border: 'none', borderRadius: '0.5rem', padding: '0.375rem 0.625rem', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                            >
                              Confirmar
                            </button>
                            <button
                              onClick={() => setDeletingId(null)}
                              style={{ background: '#E8E3D5', color: '#1E1914', border: 'none', borderRadius: '0.5rem', padding: '0.375rem 0.625rem', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                            >
                              Cancelar
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeletingId(r.id)}
                            style={{ background: '#fee2e2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '0.5rem', padding: '0.375rem 0.75rem', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                          >
                            🗑 Eliminar
                          </button>
                        )
                      )}
                    </div>
                  )}
                </div>
              )
            })}
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
