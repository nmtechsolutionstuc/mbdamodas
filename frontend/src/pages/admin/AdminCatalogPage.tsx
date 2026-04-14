import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { fetchAdminCatalog, updateCatalogItem, deleteCatalogItem, markSold, markReturned, createCatalogItem, fetchProductTypes, uploadItemPhotos, deleteItemPhoto } from '../../api/admin'
import { StatusBadge } from '../../components/catalog/StatusBadge'
import { useToast } from '../../context/ToastContext'
import { ListRowSkeleton } from '../../components/ui/Skeleton'
import type { ItemCondition, SubmissionItemStatus, ProductType } from '../../types'
import { CONDITION_LABELS } from '../../types'

interface CatalogItem {
  id: string
  code?: string | null
  title: string
  description: string
  price: number
  commission: number
  productTypeId: string
  productType?: { id: string; name: string; requiresSize: boolean }
  sizeId?: string | null
  size?: { id: string; name: string } | null
  tags?: { tag: { id: string; name: string } }[]
  condition: ItemCondition
  quantity: number
  isActive: boolean
  soldAt: string | null
  returnedAt: string | null
  submissionItemId: string | null
  submissionItem: {
    status: SubmissionItemStatus
    submission: {
      seller: { firstName: string; lastName: string; phone: string | null }
    }
  } | null
  photos: { id: string; url: string; order: number }[]
}

interface EditForm {
  title: string
  description: string
  price: string
  commission: string
  productTypeId: string
  sizeId: string
  condition: ItemCondition
  quantity: string
  isActive: boolean
}

const inputStyle = {
  width: '100%',
  border: '1px solid #E8E3D5',
  borderRadius: '0.75rem',
  padding: '0.75rem 1rem',
  fontSize: '0.9rem',
  background: '#fff',
  outline: 'none',
  boxSizing: 'border-box' as const,
  fontFamily: "'Inter', sans-serif",
}

const labelStyle = {
  display: 'block' as const,
  fontSize: '0.8rem',
  fontWeight: 600,
  color: '#1E1914',
  marginBottom: '0.375rem',
  fontFamily: "'Inter', sans-serif",
}

const badgeStyle = (bg: string, color: string) => ({
  background: bg,
  color,
  fontSize: '0.7rem',
  padding: '0.15rem 0.5rem',
  borderRadius: '999px',
  fontWeight: 600,
  whiteSpace: 'nowrap' as const,
})

export function AdminCatalogPage() {
  const { toast } = useToast()
  const [items, setItems] = useState<CatalogItem[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<EditForm>({ title: '', description: '', price: '', commission: '', productTypeId: '', sizeId: '', condition: 'BUEN_ESTADO', quantity: '1', isActive: true })
  // Create form photo state
  const [newItemPhotos, setNewItemPhotos] = useState<File[]>([])
  const [newItemPhotoPreviews, setNewItemPhotoPreviews] = useState<string[]>([])
  // Edit form photo state
  const [editPhotos, setEditPhotos] = useState<File[]>([])
  const [editPhotoPreviews, setEditPhotoPreviews] = useState<string[]>([])
  const [deletedPhotoIds, setDeletedPhotoIds] = useState<string[]>([])
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [confirmingDeactivateId, setConfirmingDeactivateId] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const limit = 20

  // Product types
  const [productTypes, setProductTypes] = useState<ProductType[]>([])

  // Create form state
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [createLoading, setCreateLoading] = useState(false)
  const [newItem, setNewItem] = useState({
    title: '',
    description: '',
    productTypeId: '',
    sizeId: '',
    tagIds: [] as string[],
    condition: 'BUEN_ESTADO' as ItemCondition,
    quantity: '1',
    price: '',
    commission: '30',
    isOwnProduct: false,
    promoterCommissionPct: '',
  })

  useEffect(() => {
    fetchProductTypes().then(setProductTypes).catch(() => {})
  }, [])

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

  const newItemProductType = productTypes.find(pt => pt.id === newItem.productTypeId)
  const editProductType = productTypes.find(pt => pt.id === editForm.productTypeId)

  function startEdit(item: CatalogItem) {
    setEditingId(item.id)
    setEditForm({
      title: item.title,
      description: item.description,
      price: String(item.price),
      commission: String(item.commission),
      productTypeId: item.productTypeId,
      sizeId: item.sizeId ?? '',
      condition: item.condition,
      quantity: String(item.quantity ?? 1),
      isActive: item.isActive,
    })
    setEditPhotos([])
    setEditPhotoPreviews([])
    setDeletedPhotoIds([])
  }

  async function saveEdit(id: string) {
    setActionLoading(id)
    try {
      const updated = await updateCatalogItem(id, {
        title: editForm.title,
        description: editForm.description,
        price: parseFloat(editForm.price),
        commission: parseFloat(editForm.commission),
        productTypeId: editForm.productTypeId,
        sizeId: editForm.sizeId || null,
        condition: editForm.condition,
        quantity: parseInt(editForm.quantity, 10),
        isActive: editForm.isActive,
      })
      // Delete removed photos
      for (const photoId of deletedPhotoIds) {
        try { await deleteItemPhoto(id, photoId) } catch { /* ignore individual errors */ }
      }
      // Upload new photos
      if (editPhotos.length > 0) {
        try { await uploadItemPhotos(id, editPhotos) } catch { /* ignore upload errors */ }
      }
      setItems(prev => prev.map(it => it.id === id ? { ...it, ...updated } : it))
      setEditingId(null)
      setEditPhotos([])
      setEditPhotoPreviews([])
      setDeletedPhotoIds([])
      toast('Producto actualizado', 'success')
      // Reload to get updated photos
      loadItems()
    } catch {
      toast('Error al actualizar', 'error')
    } finally {
      setActionLoading(null)
    }
  }

  async function handleDelete(id: string) {
    setActionLoading(id)
    try {
      await deleteCatalogItem(id)
      setItems(prev => prev.map(it => it.id === id ? { ...it, isActive: false } : it))
      toast('Producto desactivado', 'success')
    } catch {
      toast('Error al desactivar', 'error')
    } finally {
      setActionLoading(null)
      setConfirmingDeactivateId(null)
    }
  }

  async function handleMarkSold(id: string) {
    setActionLoading(id)
    try {
      const result = await markSold(id)
      setItems(prev => prev.map(it => it.id === id ? { ...it, soldAt: new Date().toISOString(), isActive: false } : it))
      toast('Producto marcado como vendido', 'success')
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
      toast('Producto marcado como devuelto', 'success')
      if (result.whatsappLink) {
        window.open(result.whatsappLink, '_blank')
      }
    } catch {
      toast('Error al marcar como devuelta', 'error')
    } finally {
      setActionLoading(null)
    }
  }

  function toggleNewItemTag(tagId: string) {
    setNewItem(p => ({
      ...p,
      tagIds: p.tagIds.includes(tagId) ? p.tagIds.filter(id => id !== tagId) : [...p.tagIds, tagId],
    }))
  }

  function handlePhotoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []).slice(0, 5)
    setNewItemPhotos(files)
    const previews = files.map(f => URL.createObjectURL(f))
    setNewItemPhotoPreviews(previews)
  }

  async function handleCreateItem(e: React.FormEvent) {
    e.preventDefault()
    setCreateLoading(true)
    try {
      const created = await createCatalogItem({
        title: newItem.title.trim(),
        description: newItem.description.trim() || undefined,
        productTypeId: newItem.productTypeId,
        sizeId: newItem.sizeId || null,
        tagIds: newItem.tagIds.length > 0 ? newItem.tagIds : undefined,
        condition: newItem.condition,
        quantity: parseInt(newItem.quantity, 10) || 1,
        price: parseFloat(newItem.price),
        commission: parseFloat(newItem.commission),
        storeId: 'store-mbda-modas',
        isOwnProduct: newItem.isOwnProduct,
        promoterCommissionPct: newItem.isOwnProduct && newItem.promoterCommissionPct ? parseFloat(newItem.promoterCommissionPct) : null,
      })
      if (newItemPhotos.length > 0) {
        try {
          await uploadItemPhotos(created.id, newItemPhotos)
        } catch {
          toast('Producto creado pero no se pudieron subir las fotos', 'error')
        }
      }
      toast('Producto creado correctamente', 'success')
      setShowCreateForm(false)
      setNewItem({ title: '', description: '', productTypeId: '', sizeId: '', tagIds: [], condition: 'BUEN_ESTADO', quantity: '1', price: '', commission: '30', isOwnProduct: false, promoterCommissionPct: '' })
      setNewItemPhotos([])
      setNewItemPhotoPreviews([])
      loadItems()
    } catch {
      toast('No se pudo crear el producto', 'error')
    } finally {
      setCreateLoading(false)
    }
  }

  function resetCreateForm() {
    setShowCreateForm(false)
    setNewItem({ title: '', description: '', productTypeId: '', sizeId: '', tagIds: [], condition: 'BUEN_ESTADO', quantity: '1', price: '', commission: '30', isOwnProduct: false, promoterCommissionPct: '' })
    setNewItemPhotos([])
    setNewItemPhotoPreviews([])
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
              {total} productos
            </span>
          )}
          <div style={{ marginLeft: 'auto' }}>
            <button
              onClick={() => setShowCreateForm(true)}
              style={{
                background: '#1E1914',
                color: '#E8E3D5',
                border: 'none',
                borderRadius: '0.875rem',
                padding: '0.625rem 1.25rem',
                fontSize: '0.9rem',
                fontWeight: 600,
                fontFamily: "'Inter', sans-serif",
                cursor: 'pointer',
              }}
            >
              + Crear producto
            </button>
          </div>
        </div>

        {/* Formulario de creación */}
        {showCreateForm && (
          <form
            onSubmit={handleCreateItem}
            style={{
              background: '#fff',
              borderRadius: '1rem',
              padding: '1.5rem',
              marginBottom: '1.5rem',
              boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
              border: '1px solid #E8E3D5',
            }}
          >
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.2rem', fontWeight: 700, color: '#1E1914', marginTop: 0, marginBottom: '1.25rem' }}>
              Nuevo producto
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>Título</label>
                <input
                  required
                  type="text"
                  value={newItem.title}
                  onChange={e => setNewItem(p => ({ ...p, title: e.target.value }))}
                  style={inputStyle}
                  placeholder="Ej: Vestido floral largo"
                />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>Descripción (opcional)</label>
                <textarea
                  value={newItem.description}
                  onChange={e => setNewItem(p => ({ ...p, description: e.target.value }))}
                  rows={2}
                  style={{ ...inputStyle, resize: 'vertical' }}
                  placeholder="Detalles adicionales del producto..."
                />
              </div>
              <div>
                <label style={labelStyle}>Tipo de producto</label>
                <select
                  required
                  value={newItem.productTypeId}
                  onChange={e => setNewItem(p => ({ ...p, productTypeId: e.target.value, sizeId: '', tagIds: [] }))}
                  style={{ ...inputStyle, cursor: 'pointer' }}
                >
                  <option value="">Seleccionar...</option>
                  {productTypes.map(pt => (
                    <option key={pt.id} value={pt.id}>{pt.name}</option>
                  ))}
                </select>
              </div>
              {newItemProductType?.requiresSize && (newItemProductType.sizes?.length ?? 0) > 0 && (
                <div>
                  <label style={labelStyle}>Talle</label>
                  <select
                    value={newItem.sizeId}
                    onChange={e => setNewItem(p => ({ ...p, sizeId: e.target.value }))}
                    style={{ ...inputStyle, cursor: 'pointer' }}
                  >
                    <option value="">Seleccionar...</option>
                    {newItemProductType.sizes!.map(sz => (
                      <option key={sz.id} value={sz.id}>{sz.name}</option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label style={labelStyle}>Condición</label>
                <select
                  value={newItem.condition}
                  onChange={e => setNewItem(p => ({ ...p, condition: e.target.value as ItemCondition }))}
                  style={{ ...inputStyle, cursor: 'pointer' }}
                >
                  {(Object.entries(CONDITION_LABELS) as [ItemCondition, string][]).map(([val, label]) => (
                    <option key={val} value={val}>{label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Cantidad</label>
                <input
                  type="number"
                  min={1}
                  value={newItem.quantity}
                  onChange={e => setNewItem(p => ({ ...p, quantity: e.target.value }))}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Precio de venta (ARS)</label>
                <input
                  required
                  type="number"
                  min={0}
                  step="0.01"
                  value={newItem.price}
                  onChange={e => setNewItem(p => ({ ...p, price: e.target.value }))}
                  style={inputStyle}
                  placeholder="0.00"
                />
              </div>
              {!newItem.isOwnProduct && (
                <div>
                  <label style={labelStyle}>Comisión tienda (%)</label>
                  <input
                    required
                    type="number"
                    min={0}
                    max={100}
                    value={newItem.commission}
                    onChange={e => setNewItem(p => ({ ...p, commission: e.target.value }))}
                    style={inputStyle}
                  />
                </div>
              )}
              <div>
                <label style={labelStyle}>Tipo de producto</label>
                <select
                  value={newItem.isOwnProduct ? 'own' : 'consignment'}
                  onChange={e => setNewItem(p => ({ ...p, isOwnProduct: e.target.value === 'own', promoterCommissionPct: '' }))}
                  style={{ ...inputStyle, cursor: 'pointer' }}
                >
                  <option value="consignment">Consignación</option>
                  <option value="own">Stock propio - Reservable</option>
                </select>
              </div>
              {newItem.isOwnProduct && (
                <div>
                  <label style={labelStyle}>Comisión promotor (%)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step="0.01"
                    value={newItem.promoterCommissionPct}
                    onChange={e => setNewItem(p => ({ ...p, promoterCommissionPct: e.target.value }))}
                    style={inputStyle}
                    placeholder="Ej: 15"
                  />
                </div>
              )}
            </div>

            {/* Tags for create form */}
            {newItemProductType && (newItemProductType.tags?.length ?? 0) > 0 && (
              <div style={{ marginTop: '1rem' }}>
                <label style={labelStyle}>Etiquetas (opcional)</label>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {newItemProductType.tags!.map(tag => {
                    const sel = newItem.tagIds.includes(tag.id)
                    return (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => toggleNewItemTag(tag.id)}
                        style={{
                          padding: '0.3rem 0.75rem',
                          borderRadius: '999px',
                          fontSize: '0.8rem',
                          fontWeight: 500,
                          cursor: 'pointer',
                          border: sel ? '1px solid #1E1914' : '1px solid #E8E3D5',
                          background: sel ? '#1E1914' : '#fff',
                          color: sel ? '#E8E3D5' : '#1E1914',
                          fontFamily: "'Inter', sans-serif",
                          transition: 'all 0.15s ease',
                        }}
                      >
                        {tag.name}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Photo upload */}
            <div style={{ marginTop: '1rem' }}>
              <label style={labelStyle}>Fotos (opcional, máx. 5)</label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handlePhotoSelect}
                style={{ display: 'block', marginBottom: '0.75rem', fontSize: '0.85rem', fontFamily: "'Inter', sans-serif" }}
              />
              {newItemPhotoPreviews.length > 0 && (
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {newItemPhotoPreviews.map((src, i) => (
                    <img
                      key={i}
                      src={src}
                      alt={`preview-${i}`}
                      style={{ width: '72px', height: '72px', objectFit: 'cover', borderRadius: '0.5rem', border: '1px solid #E8E3D5' }}
                    />
                  ))}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={resetCreateForm}
                style={{
                  background: '#E8E3D5',
                  color: '#1E1914',
                  border: 'none',
                  borderRadius: '0.875rem',
                  padding: '0.625rem 1.25rem',
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  fontFamily: "'Inter', sans-serif",
                  cursor: 'pointer',
                }}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={createLoading}
                style={{
                  background: '#1E1914',
                  color: '#E8E3D5',
                  border: 'none',
                  borderRadius: '0.875rem',
                  padding: '0.625rem 1.25rem',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  fontFamily: "'Inter', sans-serif",
                  cursor: createLoading ? 'not-allowed' : 'pointer',
                  opacity: createLoading ? 0.6 : 1,
                }}
              >
                {createLoading ? 'Creando...' : 'Crear producto'}
              </button>
            </div>
          </form>
        )}

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {Array.from({ length: 5 }).map((_, i) => <ListRowSkeleton key={i} />)}
          </div>
        ) : items.length === 0 ? (
          <p style={{ color: '#9ca3af', textAlign: 'center', padding: '3rem' }}>No hay productos en el catálogo.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {items.map(item => {
              const isEditing = editingId === item.id
              const isBusy = actionLoading === item.id
              const status = item.submissionItem?.status ?? 'IN_STORE'
              const seller = item.submissionItem?.submission?.seller
              const coverPhoto = item.photos.sort((a, b) => a.order - b.order)[0]
              const sellerAmount = Math.round(item.price * (1 - item.commission / 100) * 100) / 100
              const commissionAmount = Math.round(item.price * (item.commission / 100) * 100) / 100
              const isFromSubmission = !!item.submissionItemId

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
                        {isFromSubmission ? '\uD83D\uDC57' : '\uD83C\uDFEA'}
                      </div>
                    )}

                    {/* Contenido */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      {isEditing ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          <input
                            value={editForm.title}
                            onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))}
                            style={{ border: '1px solid #E8E3D5', borderRadius: '0.75rem', padding: '0.75rem 1rem', fontSize: '0.9rem', fontWeight: 600 }}
                          />
                          <textarea
                            value={editForm.description}
                            onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))}
                            rows={2}
                            style={{ border: '1px solid #E8E3D5', borderRadius: '0.75rem', padding: '0.75rem 1rem', fontSize: '0.85rem', resize: 'vertical' }}
                          />
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                            <div>
                              <label style={{ fontSize: '0.75rem', color: '#6b7280' }}>Tipo</label>
                              <select
                                value={editForm.productTypeId}
                                onChange={e => setEditForm(f => ({ ...f, productTypeId: e.target.value, sizeId: '' }))}
                                style={{ width: '100%', border: '1px solid #E8E3D5', borderRadius: '0.75rem', padding: '0.5rem 0.75rem', fontSize: '0.85rem', cursor: 'pointer' }}
                              >
                                <option value="">Seleccionar...</option>
                                {productTypes.map(pt => (
                                  <option key={pt.id} value={pt.id}>{pt.name}</option>
                                ))}
                              </select>
                            </div>
                            {editProductType?.requiresSize && (editProductType.sizes?.length ?? 0) > 0 && (
                              <div>
                                <label style={{ fontSize: '0.75rem', color: '#6b7280' }}>Talle</label>
                                <select
                                  value={editForm.sizeId}
                                  onChange={e => setEditForm(f => ({ ...f, sizeId: e.target.value }))}
                                  style={{ width: '100%', border: '1px solid #E8E3D5', borderRadius: '0.75rem', padding: '0.5rem 0.75rem', fontSize: '0.85rem', cursor: 'pointer' }}
                                >
                                  <option value="">Sin talle</option>
                                  {editProductType.sizes!.map(sz => (
                                    <option key={sz.id} value={sz.id}>{sz.name}</option>
                                  ))}
                                </select>
                              </div>
                            )}
                            <div>
                              <label style={{ fontSize: '0.75rem', color: '#6b7280' }}>Condición</label>
                              <select
                                value={editForm.condition}
                                onChange={e => setEditForm(f => ({ ...f, condition: e.target.value as ItemCondition }))}
                                style={{ width: '100%', border: '1px solid #E8E3D5', borderRadius: '0.75rem', padding: '0.5rem 0.75rem', fontSize: '0.85rem', cursor: 'pointer' }}
                              >
                                {(Object.entries(CONDITION_LABELS) as [ItemCondition, string][]).map(([val, label]) => (
                                  <option key={val} value={val}>{label}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <div style={{ flex: 1 }}>
                              <label style={{ fontSize: '0.75rem', color: '#6b7280' }}>Precio</label>
                              <input
                                type="number"
                                value={editForm.price}
                                onChange={e => setEditForm(f => ({ ...f, price: e.target.value }))}
                                style={{ width: '100%', border: '1px solid #E8E3D5', borderRadius: '0.75rem', padding: '0.5rem 0.75rem', fontSize: '0.9rem' }}
                              />
                            </div>
                            <div style={{ flex: 1 }}>
                              <label style={{ fontSize: '0.75rem', color: '#6b7280' }}>Comisión %</label>
                              <input
                                type="number"
                                value={editForm.commission}
                                onChange={e => setEditForm(f => ({ ...f, commission: e.target.value }))}
                                style={{ width: '100%', border: '1px solid #E8E3D5', borderRadius: '0.75rem', padding: '0.5rem 0.75rem', fontSize: '0.9rem' }}
                              />
                            </div>
                            <div style={{ flex: 1 }}>
                              <label style={{ fontSize: '0.75rem', color: '#6b7280' }}>Cantidad</label>
                              <input
                                type="number"
                                min={1}
                                value={editForm.quantity}
                                onChange={e => setEditForm(f => ({ ...f, quantity: e.target.value }))}
                                style={{ width: '100%', border: '1px solid #E8E3D5', borderRadius: '0.75rem', padding: '0.5rem 0.75rem', fontSize: '0.9rem' }}
                              />
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                            <input
                              type="checkbox"
                              id={`isActive-${item.id}`}
                              checked={editForm.isActive}
                              onChange={e => setEditForm(f => ({ ...f, isActive: e.target.checked }))}
                              style={{ cursor: 'pointer' }}
                            />
                            <label htmlFor={`isActive-${item.id}`} style={{ fontSize: '0.8rem', color: '#1E1914', cursor: 'pointer', fontFamily: "'Inter', sans-serif" }}>
                              Activo (visible en catálogo)
                            </label>
                          </div>

                          {/* Fotos */}
                          <div style={{ marginTop: '0.5rem' }}>
                            <label style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600, display: 'block', marginBottom: '0.375rem' }}>Fotos actuales</label>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
                              {item.photos
                                .filter(p => !deletedPhotoIds.includes(p.id))
                                .sort((a, b) => a.order - b.order)
                                .map(photo => (
                                  <div key={photo.id} style={{ position: 'relative' }}>
                                    <img
                                      src={photo.url}
                                      alt=""
                                      style={{ width: '64px', height: '64px', objectFit: 'cover', borderRadius: '0.5rem', border: '1px solid #E8E3D5' }}
                                    />
                                    <button
                                      type="button"
                                      onClick={() => setDeletedPhotoIds(prev => [...prev, photo.id])}
                                      style={{
                                        position: 'absolute', top: '-6px', right: '-6px',
                                        background: '#ef4444', color: '#fff', border: 'none',
                                        borderRadius: '50%', width: '18px', height: '18px',
                                        fontSize: '0.65rem', cursor: 'pointer', display: 'flex',
                                        alignItems: 'center', justifyContent: 'center', fontWeight: 700, lineHeight: 1,
                                      }}
                                    >✕</button>
                                  </div>
                                ))}
                              {item.photos.filter(p => !deletedPhotoIds.includes(p.id)).length === 0 && (
                                <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Sin fotos</span>
                              )}
                            </div>
                            {editPhotoPreviews.length > 0 && (
                              <>
                                <label style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600, display: 'block', marginBottom: '0.375rem' }}>Nuevas fotos</label>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                  {editPhotoPreviews.map((src, idx) => (
                                    <div key={idx} style={{ position: 'relative' }}>
                                      <img src={src} alt="" style={{ width: '64px', height: '64px', objectFit: 'cover', borderRadius: '0.5rem', border: '1px solid #E8E3D5' }} />
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setEditPhotos(prev => prev.filter((_, i) => i !== idx))
                                          setEditPhotoPreviews(prev => prev.filter((_, i) => i !== idx))
                                        }}
                                        style={{
                                          position: 'absolute', top: '-6px', right: '-6px',
                                          background: '#ef4444', color: '#fff', border: 'none',
                                          borderRadius: '50%', width: '18px', height: '18px',
                                          fontSize: '0.65rem', cursor: 'pointer', display: 'flex',
                                          alignItems: 'center', justifyContent: 'center', fontWeight: 700, lineHeight: 1,
                                        }}
                                      >✕</button>
                                    </div>
                                  ))}
                                </div>
                              </>
                            )}
                            <label
                              style={{
                                display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
                                fontSize: '0.8rem', color: '#6b7280', cursor: 'pointer',
                                border: '1px dashed #E8E3D5', borderRadius: '0.5rem',
                                padding: '0.375rem 0.75rem', background: '#fafaf9',
                              }}
                            >
                              📷 Agregar fotos
                              <input
                                type="file"
                                accept="image/*"
                                multiple
                                style={{ display: 'none' }}
                                onChange={e => {
                                  const files = Array.from(e.target.files ?? [])
                                  setEditPhotos(prev => [...prev, ...files].slice(0, 5))
                                  const previews = files.map(f => URL.createObjectURL(f))
                                  setEditPhotoPreviews(prev => [...prev, ...previews].slice(0, 5))
                                  e.target.value = ''
                                }}
                              />
                            </label>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
                            {item.code && (
                              <span style={{ background: '#f0f9ff', color: '#0369a1', fontSize: '0.7rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: '0.375rem', fontFamily: "'Inter', sans-serif", letterSpacing: '0.05em' }}>
                                {item.code}
                              </span>
                            )}
                            <span style={{ fontWeight: 600, color: '#1E1914', fontSize: '0.95rem' }}>{item.title}</span>
                            <StatusBadge status={status} />
                            {!item.isActive && <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>(inactivo)</span>}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.375rem', flexWrap: 'wrap' }}>
                            <span style={badgeStyle('#E8E3D5', '#1E1914')}>{item.productType?.name ?? ''}</span>
                            {item.size && (
                              <span style={badgeStyle('#E8E3D5', '#1E1914')}>Talle {item.size.name}</span>
                            )}
                            <span style={badgeStyle('#f3f4f6', '#6b7280')}>{CONDITION_LABELS[item.condition] ?? item.condition}</span>
                            {item.quantity > 1 && (
                              <span style={badgeStyle('#dbeafe', '#1e40af')}>x{item.quantity}</span>
                            )}
                            <span style={badgeStyle(isFromSubmission ? '#fef3c7' : '#d1fae5', isFromSubmission ? '#92400e' : '#065f46')}>
                              {isFromSubmission ? 'Consignación' : 'Stock tienda'}
                            </span>
                            {item.tags && item.tags.map(({ tag }) => (
                              <span key={tag.id} style={badgeStyle('#ede9fe', '#5b21b6')}>{tag.name}</span>
                            ))}
                          </div>
                          {seller && (
                            <p style={{ fontSize: '0.8rem', color: '#9ca3af', marginBottom: '0.5rem' }}>
                              Vendedor: {seller.firstName} {seller.lastName}
                            </p>
                          )}
                          <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem', flexWrap: 'wrap' }}>
                            <span style={{ fontWeight: 700, color: '#1E1914' }}>${item.price.toLocaleString('es-AR')}</span>
                            <span style={{ color: '#6b7280' }}>Comisión {item.commission}%</span>
                            {isFromSubmission && (
                              <>
                                <span style={{ color: '#166534' }}>→ Vendedor ${sellerAmount.toLocaleString('es-AR')}</span>
                                <span style={{ color: '#854d0e' }}>Tienda ${commissionAmount.toLocaleString('es-AR')}</span>
                              </>
                            )}
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
                                {isBusy ? '...' : 'Vendida'}
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
                          <>
                            <button
                              onClick={() => startEdit(item)}
                              style={{ background: '#E8E3D5', color: '#1E1914', border: 'none', borderRadius: '0.5rem', padding: '0.5rem 1rem', cursor: 'pointer', fontSize: '0.8rem' }}
                            >
                              Editar
                            </button>
                            {item.isActive && (
                              confirmingDeactivateId === item.id ? (
                                <div style={{ display: 'flex', gap: '0.375rem' }}>
                                  <button
                                    onClick={() => handleDelete(item.id)}
                                    disabled={isBusy}
                                    style={{ background: '#dc2626', color: '#fff', border: 'none', borderRadius: '0.5rem', padding: '0.375rem 0.75rem', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}
                                  >
                                    Si
                                  </button>
                                  <button
                                    onClick={() => setConfirmingDeactivateId(null)}
                                    style={{ background: '#E8E3D5', color: '#1E1914', border: 'none', borderRadius: '0.5rem', padding: '0.375rem 0.75rem', cursor: 'pointer', fontSize: '0.75rem' }}
                                  >
                                    No
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setConfirmingDeactivateId(item.id)}
                                  disabled={isBusy}
                                  style={{ background: 'transparent', color: '#dc2626', border: '1px solid #dc2626', borderRadius: '0.5rem', padding: '0.5rem 1rem', cursor: 'pointer', fontSize: '0.8rem' }}
                                >
                                  Desactivar
                                </button>
                              )
                            )}
                          </>
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
