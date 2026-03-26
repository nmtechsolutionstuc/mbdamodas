import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { fetchAdminCatalog, updateCatalogItem, deleteCatalogItem, markSold, markReturned } from '../../api/admin'
import { StatusBadge } from '../../components/catalog/StatusBadge'
import { useToast } from '../../context/ToastContext'
import { ListRowSkeleton } from '../../components/ui/Skeleton'
import type { ItemCategory, ItemSize, SubmissionItemStatus } from '../../types'

interface CatalogItem {
  id: string
  title: string
  description: string
  price: number
  commission: number
  size: ItemSize
  category: ItemCategory
  isActive: boolean
  soldAt: string | null
  returnedAt: string | null
  submissionItem: {
    status: SubmissionItemStatus
    submission: {
      seller: { firstName: string; lastName: string; phone: string | null }
    }
  }
  photos: { url: string; order: number }[]
}

interface EditForm {
  title: string
  description: string
  price: string
  commission: string
}

export function AdminCatalogPage() {
  const { toast } = useToast()
  const [items, setItems] = useState<CatalogItem[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<EditForm>({ title: '', description: '', price: '', commission: '' })
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const limit = 20

  useEffect(() => {
    loadItems()
  }, [page])

  async function loadItems() {
    setLoading(true)
    try {
      const result = await fetchAdminCatalog(page)
      setItems(result.data)
      setTotal(result.meta?.total ?? 0)
    } catch {
      toast('Error al cargar el catálogo', 'error')
    } finally {
      setLoading(false)
    }
  }

  function startEdit(item: CatalogItem) {
    setEditingId(item.id)
    setEditForm({
      title: item.title,
      description: item.description,
      price: String(item.price),
      commission: String(item.commission),
    })
  }

  async function saveEdit(id: string) {
    setActionLoading(id)
    try {
      const updated = await updateCatalogItem(id, {
        title: editForm.title,
        description: editForm.description,
        price: parseFloat(editForm.price),
        commission: parseFloat(editForm.commission),
      })
      setItems(prev => prev.map(it => it.id === id ? { ...it, ...updated } : it))
      setEditingId(null)
      toast('Prenda actualizada', 'success')
    } catch {
      toast('Error al actualizar', 'error')
    } finally {
      setActionLoading(null)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Desactivar esta prenda del catálogo?')) return
    setActionLoading(id)
    try {
      await deleteCatalogItem(id)
      setItems(prev => prev.map(it => it.id === id ? { ...it, isActive: false } : it))
      toast('Prenda desactivada', 'success')
    } catch {
      toast('Error al desactivar', 'error')
    } finally {
      setActionLoading(null)
    }
  }

  async function handleMarkSold(id: string) {
    setActionLoading(id)
    try {
      const result = await markSold(id)
      setItems(prev => prev.map(it => it.id === id ? { ...it, soldAt: new Date().toISOString(), isActive: false } : it))
      toast('Prenda marcada como vendida', 'success')
      if (result.whatsappLink) {
        window.open(result.whatsappLink, '_blank')
      }
    } catch {
      toast('Error al marcar como vendida', 'error')
    } finally {
      setActionLoading(null)
    }
  }

  async function handleMarkReturned(id: string) {
    setActionLoading(id)
    try {
      const result = await markReturned(id)
      setItems(prev => prev.map(it => it.id === id ? { ...it, returnedAt: new Date().toISOString(), isActive: false } : it))
      toast('Prenda marcada como devuelta', 'success')
      if (result.whatsappLink) {
        window.open(result.whatsappLink, '_blank')
      }
    } catch {
      toast('Error al marcar como devuelta', 'error')
    } finally {
      setActionLoading(null)
    }
  }

  const totalPages = Math.ceil(total / limit)

  return (
    <div style={{ minHeight: '100vh', background: '#FAF8F3', padding: '1.5rem' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <Link to="/admin" style={{ color: '#6b7280', textDecoration: 'none', fontSize: '0.9rem' }}>← Panel</Link>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.75rem', fontWeight: 700, color: '#1E1914' }}>
            Catálogo
          </h1>
          {total > 0 && (
            <span style={{ background: '#E8E3D5', color: '#1E1914', fontSize: '0.8rem', padding: '0.25rem 0.75rem', borderRadius: '999px', fontWeight: 600 }}>
              {total} prendas
            </span>
          )}
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {Array.from({ length: 5 }).map((_, i) => <ListRowSkeleton key={i} />)}
          </div>
        ) : items.length === 0 ? (
          <p style={{ color: '#9ca3af', textAlign: 'center', padding: '3rem' }}>No hay prendas en el catálogo.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {items.map(item => {
              const isEditing = editingId === item.id
              const isBusy = actionLoading === item.id
              const status = item.submissionItem.status
              const seller = item.submissionItem.submission.seller
              const coverPhoto = item.photos.sort((a, b) => a.order - b.order)[0]
              const sellerAmount = Math.round(item.price * (1 - item.commission / 100) * 100) / 100
              const commissionAmount = Math.round(item.price * (item.commission / 100) * 100) / 100

              return (
                <div
                  key={item.id}
                  style={{
                    background: '#fff',
                    border: `1px solid ${!item.isActive ? '#f3f4f6' : '#E8E3D5'}`,
                    borderRadius: '1rem',
                    padding: '1.25rem',
                    opacity: !item.isActive ? 0.6 : 1,
                  }}
                >
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                    {/* Foto */}
                    {coverPhoto ? (
                      <img
                        src={coverPhoto.url}
                        alt={item.title}
                        style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '0.75rem', flexShrink: 0 }}
                      />
                    ) : (
                      <div style={{ width: '80px', height: '80px', background: '#E8E3D5', borderRadius: '0.75rem', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                        👗
                      </div>
                    )}

                    {/* Contenido */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      {isEditing ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          <input
                            value={editForm.title}
                            onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))}
                            style={{ border: '1px solid #E8E3D5', borderRadius: '0.5rem', padding: '0.375rem 0.75rem', fontSize: '0.9rem', fontWeight: 600 }}
                          />
                          <textarea
                            value={editForm.description}
                            onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))}
                            rows={2}
                            style={{ border: '1px solid #E8E3D5', borderRadius: '0.5rem', padding: '0.375rem 0.75rem', fontSize: '0.85rem', resize: 'vertical' }}
                          />
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <div style={{ flex: 1 }}>
                              <label style={{ fontSize: '0.75rem', color: '#6b7280' }}>Precio</label>
                              <input
                                type="number"
                                value={editForm.price}
                                onChange={e => setEditForm(f => ({ ...f, price: e.target.value }))}
                                style={{ width: '100%', border: '1px solid #E8E3D5', borderRadius: '0.5rem', padding: '0.375rem 0.75rem', fontSize: '0.9rem' }}
                              />
                            </div>
                            <div style={{ flex: 1 }}>
                              <label style={{ fontSize: '0.75rem', color: '#6b7280' }}>Comisión %</label>
                              <input
                                type="number"
                                value={editForm.commission}
                                onChange={e => setEditForm(f => ({ ...f, commission: e.target.value }))}
                                style={{ width: '100%', border: '1px solid #E8E3D5', borderRadius: '0.5rem', padding: '0.375rem 0.75rem', fontSize: '0.9rem' }}
                              />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                            <span style={{ fontWeight: 600, color: '#1E1914', fontSize: '0.95rem' }}>{item.title}</span>
                            <StatusBadge status={status} />
                            {!item.isActive && <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>(inactiva)</span>}
                          </div>
                          <p style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '0.375rem' }}>
                            {item.category} · Talle {item.size}
                          </p>
                          <p style={{ fontSize: '0.8rem', color: '#9ca3af', marginBottom: '0.5rem' }}>
                            Vendedor: {seller.firstName} {seller.lastName}
                          </p>
                          <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem' }}>
                            <span style={{ fontWeight: 700, color: '#1E1914' }}>${item.price.toLocaleString('es-AR')}</span>
                            <span style={{ color: '#6b7280' }}>Comisión {item.commission}%</span>
                            <span style={{ color: '#166534' }}>→ Vendedor ${sellerAmount.toLocaleString('es-AR')}</span>
                            <span style={{ color: '#854d0e' }}>Tienda ${commissionAmount.toLocaleString('es-AR')}</span>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Acciones */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flexShrink: 0 }}>
                      {isEditing ? (
                        <>
                          <button
                            onClick={() => saveEdit(item.id)}
                            disabled={isBusy}
                            style={{ background: '#1E1914', color: '#E8E3D5', border: 'none', borderRadius: '0.5rem', padding: '0.5rem 1rem', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}
                          >
                            {isBusy ? '...' : 'Guardar'}
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            style={{ background: '#E8E3D5', color: '#1E1914', border: 'none', borderRadius: '0.5rem', padding: '0.5rem 1rem', cursor: 'pointer', fontSize: '0.8rem' }}
                          >
                            Cancelar
                          </button>
                        </>
                      ) : (
                        <>
                          {item.isActive && status === 'IN_STORE' && (
                            <>
                              <button
                                onClick={() => handleMarkSold(item.id)}
                                disabled={isBusy}
                                style={{ background: '#166534', color: '#fff', border: 'none', borderRadius: '0.5rem', padding: '0.5rem 1rem', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}
                              >
                                {isBusy ? '...' : '✓ Vendida'}
                              </button>
                              <button
                                onClick={() => handleMarkReturned(item.id)}
                                disabled={isBusy}
                                style={{ background: '#ea580c', color: '#fff', border: 'none', borderRadius: '0.5rem', padding: '0.5rem 1rem', cursor: 'pointer', fontSize: '0.8rem' }}
                              >
                                {isBusy ? '...' : 'Devuelta'}
                              </button>
                            </>
                          )}
                          {item.isActive && (
                            <>
                              <button
                                onClick={() => startEdit(item)}
                                style={{ background: '#E8E3D5', color: '#1E1914', border: 'none', borderRadius: '0.5rem', padding: '0.5rem 1rem', cursor: 'pointer', fontSize: '0.8rem' }}
                              >
                                Editar
                              </button>
                              <button
                                onClick={() => handleDelete(item.id)}
                                disabled={isBusy}
                                style={{ background: 'transparent', color: '#dc2626', border: '1px solid #dc2626', borderRadius: '0.5rem', padding: '0.5rem 1rem', cursor: 'pointer', fontSize: '0.8rem' }}
                              >
                                Desactivar
                              </button>
                            </>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Paginación */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '2rem' }}>
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              style={{ padding: '0.5rem 1rem', border: '1px solid #E8E3D5', borderRadius: '0.5rem', background: '#fff', cursor: 'pointer', opacity: page === 1 ? 0.4 : 1 }}
            >
              ←
            </button>
            <span style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', color: '#6b7280' }}>
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              style={{ padding: '0.5rem 1rem', border: '1px solid #E8E3D5', borderRadius: '0.5rem', background: '#fff', cursor: 'pointer', opacity: page === totalPages ? 0.4 : 1 }}
            >
              →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
