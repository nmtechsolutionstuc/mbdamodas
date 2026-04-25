import { useState, useEffect, useCallback } from 'react'
import {
  adminFetchProducts, adminApproveProduct, adminRejectProduct,
  adminToggleFeaturedProduct, adminFetchShops, adminUpdateShop, adminEditProduct,
  adminToggleProductStatus, adminDeleteProduct,
} from '../../api/adminMinishops'
import type { MiniShop, MiniShopProduct } from '../../types'
import { MINISHOP_PRODUCT_STATUS_LABELS, MINISHOP_PRODUCT_STATUS_COLORS } from '../../types'
import { useToast } from '../../context/ToastContext'

type ShowToast = (msg: string, type?: 'success' | 'error') => void

type Tab = 'products' | 'shops'
type ProductStatusFilter = 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'PAUSED'
type ShopStatusFilter = 'ALL' | 'ACTIVE' | 'PAUSED'

type ShopWithUser = MiniShop & {
  user: { id: string; firstName: string; lastName: string; email: string; phone: string | null }
  _count: { products: number }
}

export function AdminMiniShopsPage() {
  const [tab, setTab] = useState<Tab>('products')
  const { toast } = useToast()
  const showToast: ShowToast = (msg, type) => toast(msg, type)

  return (
    <div style={{ minHeight: '100vh', background: '#FAF8F3', padding: '1.5rem' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '2rem', fontWeight: 700, color: '#1E1914', marginBottom: '1.5rem' }}>
          Mini-tiendas
        </h1>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '2px solid #E8E3D5', paddingBottom: '0' }}>
          {([['products', '📦 Productos'], ['shops', '🏪 Tiendas']] as [Tab, string][]).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              style={{
                padding: '0.75rem 1.25rem',
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                fontWeight: tab === key ? 700 : 500,
                color: tab === key ? '#1E1914' : '#6b7280',
                borderBottom: tab === key ? '2px solid #1E1914' : '2px solid transparent',
                marginBottom: '-2px',
                fontSize: '0.95rem',
                fontFamily: "'Inter', sans-serif",
                transition: 'color 0.15s',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === 'products' && <ProductsTab showToast={showToast} />}
        {tab === 'shops' && <ShopsTab showToast={showToast} />}
      </div>
    </div>
  )
}

// ── Products Tab ─────────────────────────────────────────────────

function ProductsTab({ showToast }: { showToast: (msg: string, type?: 'success' | 'error') => void }) {
  const [products, setProducts] = useState<MiniShopProduct[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<ProductStatusFilter>('PENDING')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [rejectTarget, setRejectTarget] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [editTarget, setEditTarget] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ title: '', price: '', description: '' })
  const [submitting, setSubmitting] = useState<string | null>(null)
  const [waLink, setWaLink] = useState<{ productId: string; url: string } | null>(null)

  const load = useCallback(() => {
    setLoading(true)
    adminFetchProducts({ status: statusFilter === 'ALL' ? undefined : statusFilter, search: search || undefined, page, limit: 20 })
      .then(r => { setProducts(r.items); setTotal(r.total) })
      .catch(() => showToast('Error al cargar productos', 'error'))
      .finally(() => setLoading(false))
  }, [statusFilter, search, page, showToast])

  useEffect(() => { load() }, [load])

  async function handleApprove(id: string) {
    setSubmitting(id)
    try {
      const result = await adminApproveProduct(id)
      setProducts(prev => prev.map(p => p.id === id ? { ...p, ...result.product } : p))
      setWaLink({ productId: id, url: result.whatsappLink })
      showToast('Producto aprobado ✅', 'success')
      if (statusFilter === 'PENDING') setProducts(prev => prev.filter(p => p.id !== id))
    } catch { showToast('Error al aprobar', 'error') }
    finally { setSubmitting(null) }
  }

  async function handleReject(id: string) {
    if (!rejectReason.trim()) { showToast('El motivo es obligatorio', 'error'); return }
    setSubmitting(id)
    try {
      const result = await adminRejectProduct(id, rejectReason)
      setProducts(prev => prev.map(p => p.id === id ? { ...p, ...result.product } : p))
      setRejectTarget(null)
      setRejectReason('')
      setWaLink({ productId: id, url: result.whatsappLink })
      showToast('Producto rechazado', 'success')
      if (statusFilter === 'PENDING') setProducts(prev => prev.filter(p => p.id !== id))
    } catch { showToast('Error al rechazar', 'error') }
    finally { setSubmitting(null) }
  }

  async function handleToggleFeatured(id: string) {
    setSubmitting(id)
    try {
      const updated = await adminToggleFeaturedProduct(id)
      setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updated } : p))
      showToast(updated.featured ? '⭐ Destacado activado' : 'Destacado desactivado', 'success')
    } catch { showToast('Error', 'error') }
    finally { setSubmitting(null) }
  }

  function openEdit(product: MiniShopProduct) {
    setEditTarget(product.id)
    setRejectTarget(null)
    setEditForm({
      title: product.title,
      price: String(Number(product.price)),
      description: product.description ?? '',
    })
  }

  async function handleSaveEdit(id: string) {
    const payload: any = {}
    const priceN = parseFloat(editForm.price)
    if (editForm.title.trim()) payload.title = editForm.title.trim()
    if (!isNaN(priceN) && priceN >= 0) payload.price = priceN
    payload.description = editForm.description.trim() || null
    if (Object.keys(payload).length === 0) { showToast('No hay cambios', 'error'); return }
    setSubmitting(`edit-${id}`)
    try {
      const updated = await adminEditProduct(id, payload)
      setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updated } : p))
      setEditTarget(null)
      showToast('Producto actualizado ✅', 'success')
    } catch { showToast('Error al guardar', 'error') }
    finally { setSubmitting(null) }
  }

  async function handleToggleStatus(id: string, currentStatus: string) {
    setSubmitting(id)
    try {
      const result = await adminToggleProductStatus(id)
      setProducts(prev => prev.map(p => p.id === id ? { ...p, ...result.product } : p))
      setWaLink({ productId: id, url: result.whatsappLink })
      const label = currentStatus === 'APPROVED' ? 'Producto pausado ⏸' : 'Producto reactivado ✅'
      showToast(label, 'success')
      // Remove from list if we're filtered to a specific status
      if (statusFilter !== 'ALL') setProducts(prev => prev.filter(p => p.id !== id))
    } catch { showToast('Error al cambiar estado', 'error') }
    finally { setSubmitting(null) }
  }

  async function handleDeleteProduct(id: string, title: string) {
    if (!confirm(`¿Eliminar el producto "${title}"? Esta acción no se puede deshacer.`)) return
    setSubmitting(`del-${id}`)
    try {
      const result = await adminDeleteProduct(id)
      setProducts(prev => prev.filter(p => p.id !== id))
      setTotal(prev => prev - 1)
      setWaLink({ productId: id, url: result.whatsappLink })
      showToast('Producto eliminado', 'success')
    } catch { showToast('Error al eliminar', 'error') }
    finally { setSubmitting(null) }
  }

  const totalPages = Math.ceil(total / 20)

  return (
    <div>
      {/* Filtros */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.5rem', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Buscar por título..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1) }}
          style={{ padding: '0.5rem 0.875rem', borderRadius: '0.5rem', border: '1px solid #E8E3D5', background: '#fff', fontSize: '0.875rem', outline: 'none', width: '220px' }}
        />
        {(['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'PAUSED'] as ProductStatusFilter[]).map(s => (
          <button
            key={s}
            onClick={() => { setStatusFilter(s); setPage(1) }}
            style={{
              padding: '0.5rem 0.875rem',
              borderRadius: '2rem',
              border: '1px solid',
              borderColor: statusFilter === s ? '#1E1914' : '#E8E3D5',
              background: statusFilter === s ? '#1E1914' : '#fff',
              color: statusFilter === s ? '#FAF8F3' : '#6b7280',
              fontSize: '0.8rem',
              fontWeight: statusFilter === s ? 600 : 400,
              cursor: 'pointer',
            }}
          >
            {s === 'ALL' ? 'Todos' : MINISHOP_PRODUCT_STATUS_LABELS[s as keyof typeof MINISHOP_PRODUCT_STATUS_LABELS]}
          </button>
        ))}
        <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: '#9ca3af' }}>{total} producto{total !== 1 ? 's' : ''}</span>
      </div>

      {/* WA notification banner */}
      {waLink && (
        <div style={{ background: '#dcfce7', border: '1px solid #86efac', borderRadius: '0.75rem', padding: '0.75rem 1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.875rem', color: '#166534', fontWeight: 500 }}>
            ✅ Acción registrada. ¿Querés notificar al vendedor por WhatsApp?
          </span>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <a
              href={waLink.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ padding: '0.4rem 0.875rem', background: '#25D366', color: '#fff', borderRadius: '0.5rem', fontSize: '0.8rem', fontWeight: 700, textDecoration: 'none' }}
            >
              📱 Notificar por WhatsApp
            </a>
            <button
              onClick={() => setWaLink(null)}
              style={{ padding: '0.4rem 0.75rem', background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', fontSize: '0.8rem' }}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Lista */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>Cargando...</div>
      ) : products.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af', background: '#fff', borderRadius: '1rem', border: '1px solid #E8E3D5' }}>
          No hay productos en este estado.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {products.map(product => {
            const photo = product.photos?.[0]
            const statusStyle = MINISHOP_PRODUCT_STATUS_COLORS[product.status]
            const isRejecting = rejectTarget === product.id

            return (
              <div key={product.id} style={{ background: '#fff', border: '1px solid #E8E3D5', borderRadius: '1rem', overflow: 'hidden' }}>
                <div style={{ display: 'flex', gap: '1rem', padding: '1rem', alignItems: 'flex-start' }}>
                  {/* Foto */}
                  <div style={{ width: '80px', height: '80px', borderRadius: '0.5rem', overflow: 'hidden', background: '#E8E3D5', flexShrink: 0 }}>
                    {photo ? (
                      <img src={photo.url} alt={product.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: '0.75rem' }}>Sin foto</div>
                    )}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.25rem' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.95rem', color: '#1E1914' }}>{product.title}</span>
                      {product.featured && <span style={{ fontSize: '0.7rem', background: '#fef9c3', color: '#92400e', padding: '0.1rem 0.4rem', borderRadius: '0.25rem', fontWeight: 600 }}>⭐ Destacado</span>}
                      <span style={{ fontSize: '0.75rem', padding: '0.15rem 0.5rem', borderRadius: '0.25rem', fontWeight: 600, background: statusStyle.bg, color: statusStyle.text }}>
                        {MINISHOP_PRODUCT_STATUS_LABELS[product.status]}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                      {(product.miniShop as any)?.name && <span>🏪 {(product.miniShop as any).name} · </span>}
                      ${Number(product.price).toLocaleString('es-AR')}
                      {product.productType && ` · ${product.productType.name}`}
                      {product.size && ` · Talle ${product.size.name}`}
                    </div>
                    {product.rejectionReason && (
                      <div style={{ fontSize: '0.75rem', color: '#dc2626', background: '#fee2e2', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', marginTop: '0.25rem' }}>
                        Motivo: {product.rejectionReason}
                      </div>
                    )}
                    <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.25rem' }}>
                      {new Date(product.createdAt).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </div>
                  </div>

                  {/* Acciones */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', flexShrink: 0 }}>
                    {product.status === 'PENDING' && (
                      <>
                        <button
                          onClick={() => handleApprove(product.id)}
                          disabled={submitting === product.id}
                          style={{ padding: '0.4rem 0.875rem', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '0.5rem', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
                        >
                          ✓ Aprobar
                        </button>
                        <button
                          onClick={() => { setRejectTarget(product.id); setRejectReason(''); setEditTarget(null) }}
                          disabled={submitting === product.id}
                          style={{ padding: '0.4rem 0.875rem', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '0.5rem', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
                        >
                          ✗ Rechazar
                        </button>
                      </>
                    )}
                    {product.status === 'APPROVED' && (
                      <>
                        <button
                          onClick={() => handleToggleFeatured(product.id)}
                          disabled={submitting === product.id}
                          style={{ padding: '0.4rem 0.875rem', background: product.featured ? '#fef3c7' : '#fff', color: product.featured ? '#92400e' : '#6b7280', border: '1px solid', borderColor: product.featured ? '#fde68a' : '#E8E3D5', borderRadius: '0.5rem', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
                        >
                          {product.featured ? '★ Quitar destacado' : '☆ Destacar'}
                        </button>
                        <button
                          onClick={() => handleToggleStatus(product.id, product.status)}
                          disabled={submitting === product.id}
                          style={{ padding: '0.4rem 0.875rem', background: '#fef3c7', color: '#92400e', border: 'none', borderRadius: '0.5rem', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
                        >
                          ⏸ Pausar
                        </button>
                      </>
                    )}
                    {product.status === 'PAUSED' && (
                      <button
                        onClick={() => handleToggleStatus(product.id, product.status)}
                        disabled={submitting === product.id}
                        style={{ padding: '0.4rem 0.875rem', background: '#D1FAE5', color: '#065F46', border: 'none', borderRadius: '0.5rem', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
                      >
                        ▶ Activar
                      </button>
                    )}
                    {/* Edit button — available for all statuses */}
                    <button
                      onClick={() => editTarget === product.id ? setEditTarget(null) : openEdit(product)}
                      style={{ padding: '0.4rem 0.875rem', background: editTarget === product.id ? '#f3f4f6' : '#fff', color: '#1E1914', border: '1px solid #E8E3D5', borderRadius: '0.5rem', fontSize: '0.8rem', fontWeight: 500, cursor: 'pointer' }}
                    >
                      ✏️ Editar
                    </button>
                    {/* Delete button — available for all statuses */}
                    <button
                      onClick={() => handleDeleteProduct(product.id, product.title)}
                      disabled={submitting === `del-${product.id}`}
                      style={{ padding: '0.4rem 0.875rem', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '0.5rem', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
                    >
                      🗑 Eliminar
                    </button>
                  </div>
                </div>

                {/* Reject form */}
                {isRejecting && (
                  <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid #fee2e2', background: '#fff5f5' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#dc2626', marginBottom: '0.5rem' }}>Motivo del rechazo:</div>
                    <textarea
                      value={rejectReason}
                      onChange={e => setRejectReason(e.target.value)}
                      placeholder="Explicá por qué no se acepta este producto..."
                      rows={2}
                      style={{ width: '100%', padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid #fca5a5', resize: 'vertical', fontSize: '0.875rem', fontFamily: "'Inter', sans-serif", outline: 'none', boxSizing: 'border-box' }}
                    />
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                      <button
                        onClick={() => handleReject(product.id)}
                        disabled={submitting === product.id || !rejectReason.trim()}
                        style={{ padding: '0.4rem 0.875rem', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '0.5rem', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
                      >
                        Confirmar rechazo
                      </button>
                      <button
                        onClick={() => { setRejectTarget(null); setRejectReason('') }}
                        style={{ padding: '0.4rem 0.875rem', background: 'none', color: '#6b7280', border: '1px solid #E8E3D5', borderRadius: '0.5rem', fontSize: '0.8rem', cursor: 'pointer' }}
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}

                {/* Edit form */}
                {editTarget === product.id && (
                  <div style={{ padding: '0.875rem 1rem', borderTop: '1px solid #E8E3D5', background: '#FAFAF8' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1E1914', marginBottom: '0.75rem' }}>✏️ Editar producto</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.625rem' }}>
                      <div style={{ gridColumn: '1 / -1' }}>
                        <label style={{ fontSize: '0.75rem', color: '#6b7280', display: 'block', marginBottom: '0.25rem' }}>Título</label>
                        <input
                          value={editForm.title}
                          onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))}
                          style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '0.5rem', border: '1px solid #d1d5db', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box', fontFamily: "'Inter', sans-serif" }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.75rem', color: '#6b7280', display: 'block', marginBottom: '0.25rem' }}>Precio ($)</label>
                        <input
                          type="number"
                          value={editForm.price}
                          onChange={e => setEditForm(f => ({ ...f, price: e.target.value }))}
                          style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '0.5rem', border: '1px solid #d1d5db', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box', fontFamily: "'Inter', sans-serif" }}
                        />
                      </div>
                      <div style={{ gridColumn: '1 / -1' }}>
                        <label style={{ fontSize: '0.75rem', color: '#6b7280', display: 'block', marginBottom: '0.25rem' }}>Descripción</label>
                        <textarea
                          value={editForm.description}
                          onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))}
                          rows={2}
                          style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '0.5rem', border: '1px solid #d1d5db', fontSize: '0.875rem', outline: 'none', resize: 'vertical', boxSizing: 'border-box', fontFamily: "'Inter', sans-serif" }}
                        />
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.625rem' }}>
                      <button
                        onClick={() => handleSaveEdit(product.id)}
                        disabled={submitting === `edit-${product.id}`}
                        style={{ padding: '0.4rem 1rem', background: '#1E1914', color: '#FAF8F3', border: 'none', borderRadius: '0.5rem', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
                      >
                        {submitting === `edit-${product.id}` ? 'Guardando...' : 'Guardar cambios'}
                      </button>
                      <button
                        onClick={() => setEditTarget(null)}
                        style={{ padding: '0.4rem 0.875rem', background: 'none', color: '#6b7280', border: '1px solid #E8E3D5', borderRadius: '0.5rem', fontSize: '0.8rem', cursor: 'pointer' }}
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Paginación */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            style={{ padding: '0.4rem 0.875rem', borderRadius: '0.5rem', border: '1px solid #E8E3D5', background: page === 1 ? '#f3f4f6' : '#fff', cursor: page === 1 ? 'not-allowed' : 'pointer', color: '#1E1914' }}>
            Anterior
          </button>
          <span style={{ padding: '0.4rem 0.75rem', color: '#6b7280', fontSize: '0.875rem' }}>{page} / {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            style={{ padding: '0.4rem 0.875rem', borderRadius: '0.5rem', border: '1px solid #E8E3D5', background: page === totalPages ? '#f3f4f6' : '#fff', cursor: page === totalPages ? 'not-allowed' : 'pointer', color: '#1E1914' }}>
            Siguiente
          </button>
        </div>
      )}
    </div>
  )
}

// ── Shops Tab ─────────────────────────────────────────────────────

function ShopsTab({ showToast }: { showToast: (msg: string, type?: 'success' | 'error') => void }) {
  const [shops, setShops] = useState<ShopWithUser[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<ShopStatusFilter>('ALL')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [submitting, setSubmitting] = useState<string | null>(null)

  const load = useCallback(() => {
    setLoading(true)
    adminFetchShops({ status: statusFilter === 'ALL' ? undefined : statusFilter, search: search || undefined, page, limit: 20 })
      .then(r => { setShops(r.items as ShopWithUser[]); setTotal(r.total) })
      .catch(() => showToast('Error al cargar tiendas', 'error'))
      .finally(() => setLoading(false))
  }, [statusFilter, search, page, showToast])

  useEffect(() => { load() }, [load])

  async function handleToggleStatus(shop: ShopWithUser) {
    const newStatus = shop.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE'
    setSubmitting(shop.id)
    try {
      const updated = await adminUpdateShop(shop.id, { status: newStatus })
      setShops(prev => prev.map(s => s.id === shop.id ? { ...s, ...updated } : s))
      showToast(newStatus === 'ACTIVE' ? 'Tienda activada' : 'Tienda pausada', 'success')
    } catch { showToast('Error al actualizar', 'error') }
    finally { setSubmitting(null) }
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar esta tienda? Esta acción no se puede deshacer.')) return
    setSubmitting(id)
    try {
      await adminUpdateShop(id, { status: 'DELETED' })
      setShops(prev => prev.filter(s => s.id !== id))
      showToast('Tienda eliminada', 'success')
    } catch { showToast('Error al eliminar', 'error') }
    finally { setSubmitting(null) }
  }

  const totalPages = Math.ceil(total / 20)

  return (
    <div>
      {/* Filtros */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.5rem', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Buscar por nombre..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1) }}
          style={{ padding: '0.5rem 0.875rem', borderRadius: '0.5rem', border: '1px solid #E8E3D5', background: '#fff', fontSize: '0.875rem', outline: 'none', width: '220px' }}
        />
        {(['ALL', 'ACTIVE', 'PAUSED'] as ShopStatusFilter[]).map(s => (
          <button
            key={s}
            onClick={() => { setStatusFilter(s); setPage(1) }}
            style={{
              padding: '0.5rem 0.875rem',
              borderRadius: '2rem',
              border: '1px solid',
              borderColor: statusFilter === s ? '#1E1914' : '#E8E3D5',
              background: statusFilter === s ? '#1E1914' : '#fff',
              color: statusFilter === s ? '#FAF8F3' : '#6b7280',
              fontSize: '0.8rem',
              fontWeight: statusFilter === s ? 600 : 400,
              cursor: 'pointer',
            }}
          >
            {s === 'ALL' ? 'Todas' : s === 'ACTIVE' ? 'Activas' : 'Pausadas'}
          </button>
        ))}
        <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: '#9ca3af' }}>{total} tienda{total !== 1 ? 's' : ''}</span>
      </div>

      {/* Lista */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>Cargando...</div>
      ) : shops.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af', background: '#fff', borderRadius: '1rem', border: '1px solid #E8E3D5' }}>
          No hay tiendas.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {shops.map(shop => (
            <div key={shop.id} style={{ background: '#fff', border: '1px solid #E8E3D5', borderRadius: '1rem', padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              {/* Foto */}
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', overflow: 'hidden', background: '#1E1914', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {shop.profilePhotoUrl ? (
                  <img src={shop.profilePhotoUrl} alt={shop.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ color: '#FAF8F3', fontWeight: 700, fontSize: '1rem' }}>{shop.name.charAt(0).toUpperCase()}</span>
                )}
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 600, color: '#1E1914', fontSize: '0.95rem' }}>{shop.name}</span>
                  <span style={{
                    fontSize: '0.7rem', padding: '0.15rem 0.5rem', borderRadius: '0.25rem', fontWeight: 600,
                    background: shop.status === 'ACTIVE' ? '#D1FAE5' : '#E5E7EB',
                    color: shop.status === 'ACTIVE' ? '#065F46' : '#374151',
                  }}>
                    {shop.status === 'ACTIVE' ? 'Activa' : 'Pausada'}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>/{shop.slug}</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '0.2rem' }}>
                  {shop.user.firstName} {shop.user.lastName} · {shop.user.email}
                  {shop.user.phone && ` · ${shop.user.phone}`}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.2rem' }}>
                  {shop._count.products} producto{shop._count.products !== 1 ? 's' : ''} · {new Date(shop.createdAt).toLocaleDateString('es-AR')}
                </div>
              </div>

              {/* Acciones */}
              <div style={{ display: 'flex', gap: '0.375rem', flexShrink: 0 }}>
                <a
                  href={`/tienda/${shop.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ padding: '0.4rem 0.75rem', background: '#E8E3D5', color: '#1E1914', border: 'none', borderRadius: '0.5rem', fontSize: '0.8rem', textDecoration: 'none', fontWeight: 500 }}
                >
                  Ver
                </a>
                <button
                  onClick={() => handleToggleStatus(shop)}
                  disabled={submitting === shop.id}
                  style={{
                    padding: '0.4rem 0.75rem',
                    background: shop.status === 'ACTIVE' ? '#fef3c7' : '#D1FAE5',
                    color: shop.status === 'ACTIVE' ? '#92400e' : '#065F46',
                    border: 'none', borderRadius: '0.5rem', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
                  }}
                >
                  {shop.status === 'ACTIVE' ? 'Pausar' : 'Activar'}
                </button>
                <button
                  onClick={() => handleDelete(shop.id)}
                  disabled={submitting === shop.id}
                  style={{ padding: '0.4rem 0.75rem', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '0.5rem', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Paginación */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            style={{ padding: '0.4rem 0.875rem', borderRadius: '0.5rem', border: '1px solid #E8E3D5', background: page === 1 ? '#f3f4f6' : '#fff', cursor: page === 1 ? 'not-allowed' : 'pointer', color: '#1E1914' }}>
            Anterior
          </button>
          <span style={{ padding: '0.4rem 0.75rem', color: '#6b7280', fontSize: '0.875rem' }}>{page} / {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            style={{ padding: '0.4rem 0.875rem', borderRadius: '0.5rem', border: '1px solid #E8E3D5', background: page === totalPages ? '#f3f4f6' : '#fff', cursor: page === totalPages ? 'not-allowed' : 'pointer', color: '#1E1914' }}>
            Siguiente
          </button>
        </div>
      )}
    </div>
  )
}
