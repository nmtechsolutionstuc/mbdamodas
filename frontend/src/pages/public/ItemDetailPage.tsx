import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { fetchItemById } from '../../api/items'
import { createReservation } from '../../api/reservations'
import type { Item } from '../../types'
import { useConditionConfig } from '../../hooks/useConditionConfig'
import { useAuthStore } from '../../store/authStore'

function buildWhatsAppLink(phone: string, item: Item): string {
  const sizePart = item.size ? ` (Talle ${item.size.name})` : ''
  const codePart = item.code ? ` [${item.code}]` : ''
  const msg = `Hola MBDA Market! Me interesa el producto "${item.title}"${codePart}${sizePart} · $${Number(item.price).toLocaleString('es-AR')}. ¿Está disponible? Lo vi en el catálogo online.`
  return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`
}

export function ItemDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { getLabel: getConditionLabel } = useConditionConfig()
  const [item, setItem] = useState<Item | null>(null)
  const [loading, setLoading] = useState(true)
  const [photoIndex, setPhotoIndex] = useState(0)
  const [waHovered, setWaHovered] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [reserving, setReserving] = useState(false)
  const [reservationSuccess, setReservationSuccess] = useState(false)
  const [reserveQty, setReserveQty] = useState(1)

  useEffect(() => {
    if (!id) return
    fetchItemById(id)
      .then(setItem)
      .catch(() => setItem(null))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#FAF8F3' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem 1.5rem' }}>
          <div style={{ height: '1rem', width: '120px', background: '#E8E3D5', borderRadius: '0.5rem', marginBottom: '1.5rem' }} />
          <style>{`
            .mbda-detail-loading { display: grid; grid-template-columns: 1fr 1fr; gap: 3rem; }
            @media (max-width: 640px) { .mbda-detail-loading { grid-template-columns: 1fr; gap: 1.5rem; } }
          `}</style>
          <div className="mbda-detail-loading">
            <div style={{ borderRadius: '1rem', background: '#E8E3D5', aspectRatio: '3/4' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', paddingTop: '0.5rem' }}>
              <div style={{ height: '0.75rem', width: '80px', background: '#E8E3D5', borderRadius: '0.5rem' }} />
              <div style={{ height: '1.75rem', width: '75%', background: '#E8E3D5', borderRadius: '0.5rem' }} />
              <div style={{ height: '1.75rem', width: '40%', background: '#E8E3D5', borderRadius: '0.5rem' }} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.5rem' }}>
                {[1,2].map(i => <div key={i} style={{ height: '2rem', background: '#E8E3D5', borderRadius: '0.5rem' }} />)}
              </div>
              <div style={{ height: '3rem', width: '100%', background: '#E8E3D5', borderRadius: '0.875rem', marginTop: '1rem' }} />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!item) {
    return (
      <div style={{ minHeight: '100vh', background: '#FAF8F3', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
        <p style={{ color: '#6b7280', fontFamily: "'Inter', sans-serif" }}>Producto no encontrado.</p>
        <Link to="/" style={{ color: '#1E1914', fontWeight: 600, textDecoration: 'none', fontFamily: "'Inter', sans-serif" }}>Volver al catalogo</Link>
      </div>
    )
  }

  const storePhone = item.store?.phone
  const isOwnProduct = item.isOwnProduct === true
  const available = item.availableQuantity ?? item.quantity
  const isFullyReserved = isOwnProduct && available <= 0
  const earnings = item.promoterCommissionPct && item.price
    ? Math.round(Number(item.price) * Number(item.promoterCommissionPct) / 100)
    : null
  const earningsForQty = earnings !== null ? earnings * reserveQty : null

  async function handleConfirmReservation() {
    if (!item) return
    setReserving(true)
    try {
      const result = await createReservation(item.id, reserveQty)
      setReservationSuccess(true)
      if (result.whatsappToAttendant) {
        window.open(result.whatsappToAttendant, '_blank')
      }
    } catch {
      // ignore — user sees error state
    } finally {
      setReserving(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#FAF8F3' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem 1.5rem' }}>

        {/* Breadcrumb */}
        <nav style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.85rem',
          fontFamily: "'Inter', sans-serif",
          marginBottom: '1.75rem',
          color: '#9ca3af',
        }}>
          <Link to="/" style={{ color: '#6b7280', textDecoration: 'none', transition: 'color 0.15s' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#1E1914')}
            onMouseLeave={e => (e.currentTarget.style.color = '#6b7280')}
          >
            Inicio
          </Link>
          <span style={{ color: '#d1d5db' }}>/</span>
          <Link to="/#catalogo" style={{ color: '#6b7280', textDecoration: 'none', transition: 'color 0.15s' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#1E1914')}
            onMouseLeave={e => (e.currentTarget.style.color = '#6b7280')}
          >
            Catalogo
          </Link>
          <span style={{ color: '#d1d5db' }}>/</span>
          <span style={{ color: '#1E1914', fontWeight: 500 }}>{item.title}</span>
        </nav>

        <style>{`
          .mbda-detail { display: grid; grid-template-columns: 1fr 1fr; gap: 3rem; }
          @media (max-width: 640px) { .mbda-detail { grid-template-columns: 1fr; gap: 1.5rem; } }
        `}</style>
        <div className="mbda-detail">
          {/* Fotos */}
          <div>
            <div style={{
              borderRadius: '1rem',
              overflow: 'hidden',
              background: '#E8E3D5',
              aspectRatio: '3/4',
              marginBottom: '0.75rem',
              boxShadow: '0 4px 16px rgba(30,25,20,0.08)',
            }}>
              {item.photos[photoIndex] ? (
                <img
                  src={item.photos[photoIndex]!.url}
                  alt={item.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontFamily: "'Inter', sans-serif" }}>
                  Sin foto
                </div>
              )}
            </div>
            {item.photos.length > 1 && (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {item.photos.map((p, i) => (
                  <button
                    key={p.id}
                    onClick={() => setPhotoIndex(i)}
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '0.5rem',
                      overflow: 'hidden',
                      padding: 0,
                      border: i === photoIndex ? '2px solid #1E1914' : '2px solid transparent',
                      cursor: 'pointer',
                      opacity: i === photoIndex ? 1 : 0.6,
                      transition: 'opacity 0.15s ease, border-color 0.15s ease',
                      background: 'transparent',
                    }}
                    onMouseEnter={e => { if (i !== photoIndex) e.currentTarget.style.opacity = '0.85' }}
                    onMouseLeave={e => { if (i !== photoIndex) e.currentTarget.style.opacity = '0.6' }}
                  >
                    <img src={p.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <p style={{
                fontSize: '0.75rem',
                color: '#9ca3af',
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                fontFamily: "'Inter', sans-serif",
                fontWeight: 500,
                margin: 0,
              }}>
                {item.productType?.name ?? ''}
              </p>
              {item.code && (
                <span style={{
                  background: '#f0f9ff',
                  color: '#0369a1',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  padding: '0.15rem 0.5rem',
                  borderRadius: '0.375rem',
                  fontFamily: "'Inter', sans-serif",
                  letterSpacing: '0.05em',
                }}>
                  {item.code}
                </span>
              )}
            </div>
            <h1 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: '1.85rem',
              fontWeight: 700,
              color: '#1E1914',
              marginBottom: '0.75rem',
              lineHeight: 1.25,
            }}>
              {item.title}
            </h1>
            <p style={{
              fontSize: '1.85rem',
              fontWeight: 700,
              color: '#1E1914',
              marginBottom: '1rem',
              fontFamily: "'Inter', sans-serif",
            }}>
              ${Number(item.price).toLocaleString('es-AR')}
            </p>

            {/* Tags */}
            {item.tags && item.tags.length > 0 && (
              <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                {item.tags.map(({ tag }) => (
                  <span
                    key={tag.id}
                    style={{
                      background: '#E8E3D5',
                      color: '#1E1914',
                      fontSize: '0.75rem',
                      padding: '0.2rem 0.625rem',
                      borderRadius: '999px',
                      fontWeight: 500,
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            )}

            <div style={{
              background: '#fff',
              borderRadius: '0.875rem',
              border: '1px solid #E8E3D5',
              padding: '1rem 1.25rem',
              marginBottom: '1.5rem',
            }}>
              <dl style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem 1.5rem', fontSize: '0.9rem', margin: 0 }}>
                {item.size && (
                  <div>
                    <dt style={{ color: '#9ca3af', fontFamily: "'Inter', sans-serif", fontSize: '0.8rem', marginBottom: '0.2rem' }}>Talle</dt>
                    <dd style={{ color: '#1E1914', fontWeight: 600, margin: 0, fontFamily: "'Inter', sans-serif" }}>{item.size.name}</dd>
                  </div>
                )}
                <div>
                  <dt style={{ color: '#9ca3af', fontFamily: "'Inter', sans-serif", fontSize: '0.8rem', marginBottom: '0.2rem' }}>Estado</dt>
                  <dd style={{ color: '#1E1914', fontWeight: 600, margin: 0, fontFamily: "'Inter', sans-serif" }}>{getConditionLabel(item.condition)}</dd>
                </div>
                {item.quantity > 1 && (
                  <div>
                    <dt style={{ color: '#9ca3af', fontFamily: "'Inter', sans-serif", fontSize: '0.8rem', marginBottom: '0.2rem' }}>Disponibles</dt>
                    <dd style={{ color: '#1E1914', fontWeight: 600, margin: 0, fontFamily: "'Inter', sans-serif" }}>
                      {available} de {item.quantity}
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            {item.description && (
              <p style={{ color: '#4b5563', marginBottom: '1.5rem', lineHeight: 1.7, fontFamily: "'Inter', sans-serif", fontSize: '0.95rem' }}>{item.description}</p>
            )}

            {isOwnProduct ? (
              <>
                {isFullyReserved ? (
                  <div style={{
                    width: '100%',
                    padding: '1rem',
                    borderRadius: '0.875rem',
                    background: '#E5E7EB',
                    color: '#6b7280',
                    textAlign: 'center',
                    fontWeight: 600,
                    fontSize: '0.95rem',
                    fontFamily: "'Inter', sans-serif",
                  }}>
                    Sin stock disponible para reservar
                  </div>
                ) : showConfirm ? (
                  <div style={{
                    background: '#fff',
                    border: '1px solid #E8E3D5',
                    borderRadius: '0.875rem',
                    padding: '1.25rem',
                  }}>
                    {reservationSuccess ? (
                      <p style={{ color: '#166534', fontWeight: 600, fontFamily: "'Inter', sans-serif", margin: 0 }}>
                        Reserva enviada. El equipo de MBDA Market te va a confirmar por WhatsApp.
                      </p>
                    ) : (
                      <>
                        <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.1rem', fontWeight: 700, color: '#1E1914', marginTop: 0, marginBottom: '0.5rem' }}>
                          Reservar para vender
                        </h3>
                        <p style={{ fontSize: '0.9rem', color: '#4b5563', marginBottom: '0.75rem', fontFamily: "'Inter', sans-serif" }}>
                          {item.title}{item.code ? ` · ${item.code}` : ''}
                        </p>

                        {/* Quantity selector (only if available > 1) */}
                        {available > 1 && (
                          <div style={{ marginBottom: '0.75rem' }}>
                            <label style={{ display: 'block', fontSize: '0.85rem', color: '#4b5563', marginBottom: '0.375rem', fontFamily: "'Inter', sans-serif", fontWeight: 600 }}>
                              Cantidad a reservar ({available} disponibles)
                            </label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <button
                                onClick={() => setReserveQty(q => Math.max(1, q - 1))}
                                disabled={reserveQty <= 1}
                                style={{
                                  width: '36px', height: '36px', borderRadius: '0.5rem',
                                  border: '1px solid #E8E3D5', background: '#FAF8F3',
                                  fontSize: '1.2rem', cursor: reserveQty <= 1 ? 'not-allowed' : 'pointer',
                                  color: '#1E1914', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  opacity: reserveQty <= 1 ? 0.4 : 1,
                                }}
                              >
                                −
                              </button>
                              <span style={{
                                fontSize: '1.1rem', fontWeight: 700, color: '#1E1914',
                                fontFamily: "'Inter', sans-serif", minWidth: '2rem', textAlign: 'center',
                              }}>
                                {reserveQty}
                              </span>
                              <button
                                onClick={() => setReserveQty(q => Math.min(available, q + 1))}
                                disabled={reserveQty >= available}
                                style={{
                                  width: '36px', height: '36px', borderRadius: '0.5rem',
                                  border: '1px solid #E8E3D5', background: '#FAF8F3',
                                  fontSize: '1.2rem', cursor: reserveQty >= available ? 'not-allowed' : 'pointer',
                                  color: '#1E1914', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  opacity: reserveQty >= available ? 0.4 : 1,
                                }}
                              >
                                +
                              </button>
                            </div>
                          </div>
                        )}

                        {earningsForQty !== null && (
                          <p style={{ fontSize: '0.9rem', fontWeight: 600, color: '#166534', marginBottom: '0.75rem', fontFamily: "'Inter', sans-serif" }}>
                            Tu ganancia estimada: ${earningsForQty.toLocaleString('es-AR')}{reserveQty > 1 ? ` (${reserveQty} x $${earnings!.toLocaleString('es-AR')})` : ''}
                          </p>
                        )}
                        <div style={{ background: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: '0.5rem', padding: '0.625rem 0.875rem', marginBottom: '1rem', fontSize: '0.825rem', color: '#92400E', fontFamily: "'Inter', sans-serif" }}>
                          ⚠ Tenés 24 horas desde la aprobación para traer al comprador a la tienda
                        </div>
                        <button
                          onClick={handleConfirmReservation}
                          disabled={reserving}
                          style={{
                            width: '100%',
                            padding: '0.875rem',
                            borderRadius: '0.875rem',
                            background: reserving ? '#4b4540' : '#1E1914',
                            color: '#E8E3D5',
                            border: 'none',
                            fontWeight: 600,
                            fontSize: '0.95rem',
                            fontFamily: "'Inter', sans-serif",
                            cursor: reserving ? 'not-allowed' : 'pointer',
                            marginBottom: '0.625rem',
                          }}
                        >
                          {reserving ? 'Enviando...' : `Confirmar reserva${reserveQty > 1 ? ` (${reserveQty} unidades)` : ''}`}
                        </button>
                        <button
                          onClick={() => { setShowConfirm(false); setReserveQty(1) }}
                          style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', fontSize: '0.875rem', fontFamily: "'Inter', sans-serif", display: 'block', margin: '0 auto' }}
                        >
                          Cancelar
                        </button>
                      </>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => { if (user) { setShowConfirm(true) } else { navigate('/login') } }}
                    style={{
                      width: '100%',
                      padding: '1rem',
                      borderRadius: '0.875rem',
                      background: '#1E1914',
                      color: '#E8E3D5',
                      border: 'none',
                      fontWeight: 600,
                      fontSize: '1.05rem',
                      fontFamily: "'Inter', sans-serif",
                      cursor: 'pointer',
                    }}
                  >
                    💰 Reservar para vender{available > 1 ? ` (${available} disponibles)` : ''}
                  </button>
                )}
              </>
            ) : storePhone ? (
              <a
                href={buildWhatsAppLink(storePhone, item)}
                target="_blank"
                rel="noopener noreferrer"
                onMouseEnter={() => setWaHovered(true)}
                onMouseLeave={() => setWaHovered(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.75rem',
                  width: '100%',
                  padding: '1rem',
                  borderRadius: '0.875rem',
                  background: waHovered ? '#20c157' : '#25D366',
                  color: '#fff',
                  textDecoration: 'none',
                  fontWeight: 600,
                  fontSize: '1.05rem',
                  fontFamily: "'Inter', sans-serif",
                  transition: 'background 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease',
                  transform: waHovered ? 'translateY(-2px)' : 'translateY(0)',
                  boxShadow: waHovered ? '0 8px 24px rgba(37,211,102,0.35)' : '0 3px 12px rgba(37,211,102,0.2)',
                }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Quiero este producto
              </a>
            ) : (
              <p style={{ color: '#9ca3af', fontSize: '0.875rem', fontFamily: "'Inter', sans-serif" }}>Consulta en tienda para mas informacion.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
