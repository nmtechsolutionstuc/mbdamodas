import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  fetchAdminSubmissionById, approveItem, rejectItem,
  markInStore, markSold, markReturned,
} from '../../api/admin'
import { StatusBadge } from '../../components/catalog/StatusBadge'
import { useToast } from '../../context/ToastContext'
import type { SubmissionItemStatus } from '../../types'
import { CONDITION_LABELS } from '../../types'

interface AdminItem {
  id: string
  title: string
  description: string | null
  condition: string
  productType?: { id: string; name: string }
  size?: { id: string; name: string } | null
  tags?: { tag: { id: string; name: string } }[]
  quantity: number
  desiredPrice: number
  minimumPrice: number | null
  status: SubmissionItemStatus
  adminComment: string | null
  photos: { id: string; url: string; order: number }[]
}

interface AdminSubmissionDetail {
  id: string
  createdAt: string
  seller: { firstName: string; lastName: string; email: string; phone: string | null }
  items: AdminItem[]
}

export function AdminSubmissionDetailPage() {
  const { toast } = useToast()
  const { id } = useParams<{ id: string }>()
  const [submission, setSubmission] = useState<AdminSubmissionDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [rejectComment, setRejectComment] = useState<{ [itemId: string]: string }>({})
  const [whatsappLinks, setWhatsappLinks] = useState<{ [itemId: string]: string | null }>({})
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [commissionResult, setCommissionResult] = useState<{ [itemId: string]: { salePrice: number; commissionAmount: number; sellerAmount: number } }>({})
  const [itemCodes, setItemCodes] = useState<{ [itemId: string]: string }>({})

  useEffect(() => {
    if (!id) return
    fetchAdminSubmissionById(id).then(setSubmission).catch(() => {}).finally(() => setLoading(false))
  }, [id])

  async function doAction(itemId: string, action: () => Promise<{ whatsappLink?: string; commission?: { salePrice: number; commissionAmount: number; sellerAmount: number }; item?: { code?: string } }>) {
    setActionLoading(itemId)
    try {
      const result = await action()
      if (result.whatsappLink) setWhatsappLinks(prev => ({ ...prev, [itemId]: result.whatsappLink ?? null }))
      if (result.commission) setCommissionResult(prev => ({ ...prev, [itemId]: result.commission! }))
      if (result.item?.code) setItemCodes(prev => ({ ...prev, [itemId]: result.item!.code! }))
      // Recargar la solicitud para ver el estado actualizado
      const updated = await fetchAdminSubmissionById(id!)
      setSubmission(updated)
    } catch {
      toast('Error al ejecutar la acción', 'error')
    } finally {
      setActionLoading(null)
    }
  }

  if (loading) return <div style={{ padding: '2rem', color: '#9ca3af' }}>Cargando...</div>
  if (!submission) return <div style={{ padding: '2rem' }}><Link to="/admin/solicitudes" style={{ color: '#1E1914' }}>← Volver</Link></div>

  const inp = (v: string, onChange: (v: string) => void) => (
    <textarea
      value={v}
      onChange={e => onChange(e.target.value)}
      placeholder="Motivo del rechazo..."
      style={{ width: '100%', padding: '0.625rem', borderRadius: '0.625rem', border: '1px solid #E8E3D5', fontSize: '0.875rem', resize: 'vertical', minHeight: '64px', boxSizing: 'border-box' as const }}
    />
  )

  return (
    <div style={{ minHeight: '100vh', background: '#FAF8F3', padding: '1.5rem' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <Link to="/admin/solicitudes" style={{ color: '#6b7280', textDecoration: 'none', fontSize: '0.9rem', display: 'inline-block', marginBottom: '1.5rem' }}>
          ← Solicitudes
        </Link>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.75rem', fontWeight: 700, color: '#1E1914', marginBottom: '0.375rem' }}>
          Solicitud de {submission.seller.firstName} {submission.seller.lastName}
        </h1>
        <p style={{ fontSize: '0.875rem', color: '#9ca3af', marginBottom: '0.25rem' }}>{submission.seller.email}</p>
        {submission.seller.phone && (
          <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1.5rem' }}>
            WhatsApp: <a href={`https://wa.me/${submission.seller.phone}`} target="_blank" rel="noopener noreferrer" style={{ color: '#16a34a' }}>{submission.seller.phone}</a>
          </p>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {submission.items.map((item, idx) => (
            <div key={item.id} style={{ background: '#fff', border: '1px solid #E8E3D5', borderRadius: '1rem', padding: '1.25rem' }}>
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ fontWeight: 700, color: '#1E1914', marginBottom: '0.25rem' }}>{idx + 1}. {item.title}</h3>
                  <p style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                    {item.productType?.name ?? ''}{item.size ? ` · Talle ${item.size.name}` : ''} · {CONDITION_LABELS[item.condition as keyof typeof CONDITION_LABELS]}
                    {item.quantity > 1 && ` · ${item.quantity} unidades`}
                  </p>
                  {item.tags && item.tags.length > 0 && (
                    <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap', marginTop: '0.375rem' }}>
                      {item.tags.map(({ tag }) => (
                        <span key={tag.id} style={{ background: '#E8E3D5', color: '#1E1914', fontSize: '0.7rem', padding: '0.1rem 0.5rem', borderRadius: '999px', fontWeight: 500 }}>
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  )}
                  <p style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1E1914', marginTop: '0.25rem' }}>
                    Precio deseado: ${item.desiredPrice.toLocaleString('es-AR')}
                    {item.minimumPrice && <span style={{ color: '#9ca3af', fontWeight: 400, marginLeft: '0.75rem', fontSize: '0.8rem' }}>(mínimo: ${item.minimumPrice.toLocaleString('es-AR')})</span>}
                  </p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.375rem' }}>
                  <StatusBadge status={item.status} />
                  {itemCodes[item.id] && (
                    <span style={{
                      background: '#f0f9ff',
                      color: '#0369a1',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      padding: '0.2rem 0.625rem',
                      borderRadius: '0.375rem',
                      fontFamily: "'Inter', sans-serif",
                      letterSpacing: '0.05em',
                    }}>
                      {itemCodes[item.id]}
                    </span>
                  )}
                </div>
              </div>

              {/* Fotos */}
              {item.photos.length > 0 && (
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', overflowX: 'auto' }}>
                  {item.photos.map(p => (
                    <img key={p.id} src={p.url} alt="" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '0.625rem', flexShrink: 0 }} />
                  ))}
                </div>
              )}

              {/* Resumen comisión al vender */}
              {commissionResult[item.id] && (
                <div style={{ background: '#dcfce7', borderRadius: '0.75rem', padding: '0.75rem 1rem', marginBottom: '1rem', fontSize: '0.875rem', color: '#166534' }}>
                  💰 Venta: ${commissionResult[item.id]!.salePrice.toLocaleString('es-AR')} →
                  Tienda: ${commissionResult[item.id]!.commissionAmount.toLocaleString('es-AR')} /
                  Vendedor: ${commissionResult[item.id]!.sellerAmount.toLocaleString('es-AR')}
                </div>
              )}

              {/* Botón WhatsApp */}
              {whatsappLinks[item.id] && (
                <a
                  href={whatsappLinks[item.id]!}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#16a34a', color: '#fff', padding: '0.625rem 1rem', borderRadius: '0.75rem', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 600, marginBottom: '1rem', width: 'fit-content' }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  Notificar vendedor por WhatsApp
                </a>
              )}

              {/* Acciones según estado */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                {item.status === 'PENDING' && (
                  <>
                    <div style={{ display: 'flex', gap: '0.625rem' }}>
                      <button
                        onClick={() => doAction(item.id, () => approveItem(item.id))}
                        disabled={actionLoading === item.id}
                        style={{ flex: 1, padding: '0.625rem', borderRadius: '0.75rem', border: 'none', background: '#dcfce7', color: '#166534', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' }}
                      >
                        ✓ Aprobar
                      </button>
                      <button
                        onClick={() => doAction(item.id, () => rejectItem(item.id, rejectComment[item.id] ?? ''))}
                        disabled={actionLoading === item.id || !rejectComment[item.id]}
                        style={{ flex: 1, padding: '0.625rem', borderRadius: '0.75rem', border: 'none', background: '#fee2e2', color: '#991b1b', fontWeight: 600, cursor: rejectComment[item.id] ? 'pointer' : 'not-allowed', fontSize: '0.875rem', opacity: rejectComment[item.id] ? 1 : 0.5 }}
                      >
                        ✕ Rechazar
                      </button>
                    </div>
                    {inp(rejectComment[item.id] ?? '', v => setRejectComment(p => ({ ...p, [item.id]: v })))}
                  </>
                )}
                {item.status === 'APPROVED' && (
                  <button
                    onClick={() => doAction(item.id, () => markInStore(item.id))}
                    disabled={actionLoading === item.id}
                    style={{ padding: '0.625rem', borderRadius: '0.75rem', border: 'none', background: '#dbeafe', color: '#1e40af', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' }}
                  >
                    Marcar en tienda
                  </button>
                )}
                {item.status === 'IN_STORE' && (
                  <div style={{ display: 'flex', gap: '0.625rem' }}>
                    <button
                      onClick={() => doAction(item.id, () => markSold(item.id))}
                      disabled={actionLoading === item.id}
                      style={{ flex: 1, padding: '0.625rem', borderRadius: '0.75rem', border: 'none', background: '#1E1914', color: '#E8E3D5', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' }}
                    >
                      Marcar vendida
                    </button>
                    <button
                      onClick={() => doAction(item.id, () => markReturned(item.id))}
                      disabled={actionLoading === item.id}
                      style={{ flex: 1, padding: '0.625rem', borderRadius: '0.75rem', border: 'none', background: '#ffedd5', color: '#9a3412', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' }}
                    >
                      Devolver
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
