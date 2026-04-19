import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  fetchMyShop,
  fetchShopProducts,
  updateShop,
  uploadShopPhoto,
  toggleShopStatus,
  toggleProductStatus,
  deleteShopProduct,
  createShopProduct,
  fetchApprovedProducts,
  updateProductQuantity,
} from '../../api/minishops'
import type { MiniShop, MiniShopProduct } from '../../types'
import { MINISHOP_PRODUCT_STATUS_LABELS, MINISHOP_PRODUCT_STATUS_COLORS } from '../../types'
import { useProductTypes } from '../../hooks/useProductTypes'

type Tab = 'products' | 'profile' | 'featured'

export function MiniShopPanelPage() {
  const { shopId } = useParams<{ shopId: string }>()
  const navigate = useNavigate()
  const [shop, setShop] = useState<MiniShop | null>(null)
  const [products, setProducts] = useState<MiniShopProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>('products')

  useEffect(() => {
    if (!shopId) return
    Promise.all([
      fetchMyShop(shopId),
      fetchShopProducts(shopId),
    ])
      .then(([s, p]) => { setShop(s); setProducts(p) })
      .catch(() => navigate('/dashboard/tiendas'))
      .finally(() => setLoading(false))
  }, [shopId])

  if (loading) return <div style={{ minHeight: '100vh', background: '#FAF8F3', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>Cargando...</div>
  if (!shop) return null

  const tabs: { key: Tab; label: string }[] = [
    { key: 'products', label: 'Productos' },
    { key: 'profile', label: 'Editar perfil' },
    { key: 'featured', label: 'Destacar' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#FAF8F3', padding: '1.5rem' }}>
      <div style={{ maxWidth: '640px', margin: '0 auto' }}>
        <Link to="/dashboard/tiendas" style={{ color: '#6b7280', textDecoration: 'none', fontSize: '0.875rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', marginBottom: '1rem' }}>
          ← Mis tiendas
        </Link>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
          {shop.profilePhotoUrl ? (
            <img src={shop.profilePhotoUrl} alt={shop.name} style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: '48px', height: '48px', background: '#E8E3D5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>🏪</div>
          )}
          <div style={{ flex: 1 }}>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.5rem', fontWeight: 700, color: '#1E1914', margin: 0 }}>{shop.name}</h1>
            <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>/{shop.slug}</div>
          </div>
          <a
            href={`/tienda/${shop.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: '0.8rem',
              color: '#1E1914',
              textDecoration: 'underline',
            }}
          >
            Ver perfil publico
          </a>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1.5rem', borderBottom: '2px solid #E8E3D5' }}>
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                padding: '0.625rem 1rem',
                fontSize: '0.875rem',
                fontWeight: tab === t.key ? 700 : 400,
                color: tab === t.key ? '#1E1914' : '#6b7280',
                background: 'none',
                border: 'none',
                borderBottom: tab === t.key ? '2px solid #1E1914' : '2px solid transparent',
                cursor: 'pointer',
                marginBottom: '-2px',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'products' && (
          <ProductsTab shopId={shop.id} products={products} setProducts={setProducts} />
        )}
        {tab === 'profile' && (
          <ProfileTab shop={shop} setShop={setShop} />
        )}
        {tab === 'featured' && (
          <FeaturedTab shopId={shop.id} />
        )}
      </div>
    </div>
  )
}

// ── Products Tab ──────────────────────────────────────────

function ProductsTab({ shopId, products, setProducts }: {
  shopId: string
  products: MiniShopProduct[]
  setProducts: React.Dispatch<React.SetStateAction<MiniShopProduct[]>>
}) {
  const [showForm, setShowForm] = useState(false)

  async function handleToggle(productId: string) {
    try {
      const updated = await toggleProductStatus(shopId, productId)
      setProducts(prev => prev.map(p => p.id === productId ? { ...p, status: updated.status } : p))
    } catch (err: any) {
      alert(err.response?.data?.error?.message ?? 'Error al cambiar estado')
    }
  }

  async function handleDelete(productId: string) {
    if (!confirm('Seguro que queres eliminar este producto?')) return
    try {
      await deleteShopProduct(shopId, productId)
      setProducts(prev => prev.filter(p => p.id !== productId))
    } catch {
      alert('Error al eliminar producto')
    }
  }

  const pendingCount = products.filter(p => p.status === 'PENDING').length

  return (
    <div>
      {/* Pending counter banner */}
      {pendingCount > 0 && (
        <div style={{
          background: '#FEF9C3',
          border: '1px solid #FDE68A',
          borderRadius: '0.75rem',
          padding: '0.625rem 1rem',
          marginBottom: '1rem',
          fontSize: '0.85rem',
          color: '#92400E',
          fontWeight: 500,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}>
          ⏳ Tenés <strong>{pendingCount}</strong> producto{pendingCount !== 1 ? 's' : ''} pendiente{pendingCount !== 1 ? 's' : ''} de revisión.
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>{products.length} producto{products.length !== 1 ? 's' : ''}</div>
        <button
          onClick={() => setShowForm(true)}
          style={{
            background: '#1E1914',
            color: '#FAF8F3',
            border: 'none',
            borderRadius: '0.75rem',
            padding: '0.5rem 1rem',
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          + Agregar producto
        </button>
      </div>

      {showForm && (
        <AddProductForm
          shopId={shopId}
          onCreated={(p) => { setProducts(prev => [p, ...prev]); setShowForm(false) }}
          onCancel={() => setShowForm(false)}
        />
      )}

      {products.length === 0 && !showForm ? (
        <div style={{ textAlign: 'center', padding: '2rem 1rem', background: '#fff', borderRadius: '1rem', border: '1px solid #E8E3D5' }}>
          <p style={{ fontSize: '0.9rem', color: '#6b7280' }}>No hay productos todavia. Agrega tu primer producto.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {products.map(p => (
            <ProductCard
              key={p.id}
              product={p}
              shopId={shopId}
              onToggle={() => handleToggle(p.id)}
              onDelete={() => handleDelete(p.id)}
              onUpdated={(updated) => setProducts(prev => prev.map(x => x.id === updated.id ? updated : x))}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function ProductCard({ product, shopId, onToggle, onDelete, onUpdated }: {
  product: MiniShopProduct
  shopId: string
  onToggle: () => void
  onDelete: () => void
  onUpdated: (p: MiniShopProduct) => void
}) {
  const statusColor = MINISHOP_PRODUCT_STATUS_COLORS[product.status]
  const photo = product.photos?.[0]
  const [editingQty, setEditingQty] = useState(false)
  const [qtyValue, setQtyValue] = useState(String(product.quantity ?? 1))
  const [savingQty, setSavingQty] = useState(false)

  async function handleSaveQty() {
    const qty = parseInt(qtyValue)
    if (!qty || qty < 1) return
    setSavingQty(true)
    try {
      const updated = await updateProductQuantity(shopId, product.id, qty)
      onUpdated(updated)
      setEditingQty(false)
    } catch {
      alert('Error al actualizar cantidad')
    } finally {
      setSavingQty(false)
    }
  }

  return (
    <div style={{ background: '#fff', border: '1px solid #E8E3D5', borderRadius: '1rem', padding: '1rem', display: 'flex', gap: '0.875rem', alignItems: 'flex-start' }}>
      {photo ? (
        <img src={photo.url} alt={product.title} style={{ width: '70px', height: '70px', objectFit: 'cover', borderRadius: '0.75rem', flexShrink: 0 }} />
      ) : (
        <div style={{ width: '70px', height: '70px', background: '#E8E3D5', borderRadius: '0.75rem', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>📷</div>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
          <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1E1914' }}>{product.title}</div>
          <span style={{ fontSize: '0.7rem', fontWeight: 600, padding: '0.2rem 0.5rem', borderRadius: '2rem', background: statusColor.bg, color: statusColor.text, whiteSpace: 'nowrap', flexShrink: 0 }}>
            {MINISHOP_PRODUCT_STATUS_LABELS[product.status]}
          </span>
        </div>
        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1E1914', marginTop: '0.25rem' }}>
          ${product.price.toLocaleString('es-AR')}
          {product.quantity > 1 && <span style={{ fontWeight: 400, color: '#6b7280' }}> · {product.quantity} un.</span>}
        </div>
        {/* Rejection reason */}
        {product.status === 'REJECTED' && product.rejectionReason && (
          <div style={{
            marginTop: '0.375rem',
            fontSize: '0.75rem',
            color: '#991B1B',
            background: '#FEE2E2',
            borderRadius: '0.375rem',
            padding: '0.3rem 0.5rem',
            lineHeight: 1.4,
          }}>
            <strong>Motivo:</strong> {product.rejectionReason}
          </div>
        )}
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
          {(product.status === 'APPROVED' || product.status === 'PAUSED') && (
            <button onClick={onToggle} style={{ fontSize: '0.75rem', padding: '0.25rem 0.625rem', borderRadius: '0.5rem', border: '1px solid #d1d5db', background: '#fff', color: '#374151', cursor: 'pointer' }}>
              {product.status === 'APPROVED' ? 'Pausar' : 'Reactivar'}
            </button>
          )}
          {product.status === 'APPROVED' && !editingQty && (
            <button onClick={() => { setQtyValue(String(product.quantity ?? 1)); setEditingQty(true) }} style={{ fontSize: '0.75rem', padding: '0.25rem 0.625rem', borderRadius: '0.5rem', border: '1px solid #d1d5db', background: '#fff', color: '#374151', cursor: 'pointer' }}>
              ✏️ Cantidad
            </button>
          )}
          <button onClick={onDelete} style={{ fontSize: '0.75rem', padding: '0.25rem 0.625rem', borderRadius: '0.5rem', border: '1px solid #fca5a5', background: '#fff', color: '#dc2626', cursor: 'pointer' }}>
            Eliminar
          </button>
        </div>
        {editingQty && (
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.5rem' }}>
            <input type="number" min={1} max={9999} value={qtyValue} onChange={e => setQtyValue(e.target.value)} style={{ width: '80px', padding: '0.25rem 0.5rem', borderRadius: '0.375rem', border: '1px solid #d1d5db', fontSize: '0.85rem' }} />
            <button onClick={handleSaveQty} disabled={savingQty} style={{ fontSize: '0.75rem', padding: '0.25rem 0.625rem', borderRadius: '0.5rem', border: 'none', background: '#1E1914', color: '#FAF8F3', cursor: 'pointer' }}>
              {savingQty ? '...' : 'Guardar'}
            </button>
            <button onClick={() => setEditingQty(false)} style={{ fontSize: '0.75rem', padding: '0.25rem 0.625rem', borderRadius: '0.5rem', border: '1px solid #d1d5db', background: '#fff', color: '#374151', cursor: 'pointer' }}>
              Cancelar
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Add Product Form ──────────────────────────────────────

function AddProductForm({ shopId, onCreated, onCancel }: {
  shopId: string
  onCreated: (p: MiniShopProduct) => void
  onCancel: () => void
}) {
  const { productTypes } = useProductTypes()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [quantity, setQuantity] = useState('1')
  const [productTypeId, setProductTypeId] = useState('')
  const [sizeId, setSizeId] = useState('')
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])
  const [photos, setPhotos] = useState<File[]>([])
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const selectedPT = productTypes.find(pt => pt.id === productTypeId)

  function handlePhotos(files: FileList | null) {
    if (!files) return
    const allowed = ['image/jpeg', 'image/png', 'image/webp']
    const maxSize = 8 * 1024 * 1024
    const remaining = 3 - photos.length
    const newFiles: File[] = []
    const newPreviews: string[] = []

    for (let i = 0; i < Math.min(files.length, remaining); i++) {
      const f = files[i]!
      if (!allowed.includes(f.type)) { setError('Solo se permiten JPG, PNG y WebP'); return }
      if (f.size > maxSize) { setError('Cada foto debe pesar menos de 8MB'); return }
      newFiles.push(f)
      newPreviews.push(URL.createObjectURL(f))
    }
    setPhotos(prev => [...prev, ...newFiles])
    setPhotoPreviews(prev => [...prev, ...newPreviews])
    setError(null)
  }

  function removePhoto(idx: number) {
    setPhotos(prev => prev.filter((_, i) => i !== idx))
    setPhotoPreviews(prev => { URL.revokeObjectURL(prev[idx]!); return prev.filter((_, i) => i !== idx) })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !price || !productTypeId || photos.length === 0) return
    setSubmitting(true)
    setError(null)
    try {
      const product = await createShopProduct(shopId, {
        title: title.trim(),
        description: description.trim() || undefined,
        price: parseFloat(price),
        quantity: parseInt(quantity) || 1,
        productTypeId,
        sizeId: sizeId || undefined,
        tagIds: selectedTagIds.length > 0 ? selectedTagIds : undefined,
        photos,
      })
      onCreated(product)
    } catch (err: any) {
      setError(err.response?.data?.error?.message ?? 'Error al crear producto')
    } finally {
      setSubmitting(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.625rem',
    border: '1px solid #d1d5db',
    borderRadius: '0.5rem',
    fontSize: '0.85rem',
    background: '#fff',
    outline: 'none',
    boxSizing: 'border-box',
  }

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '0.8rem',
    fontWeight: 600,
    color: '#1E1914',
    marginBottom: '0.25rem',
  }

  return (
    <div style={{ background: '#fff', border: '1px solid #E8E3D5', borderRadius: '1rem', padding: '1.25rem', marginBottom: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#1E1914', margin: 0 }}>Nuevo producto</h3>
        <button onClick={onCancel} style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: '#6b7280' }}>✕</button>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '0.875rem' }}>
          <label style={labelStyle}>Titulo *</label>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)} maxLength={200} placeholder="Ej: Campera de cuero negra" style={inputStyle} />
        </div>

        <div style={{ marginBottom: '0.875rem' }}>
          <label style={labelStyle}>Descripcion</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} maxLength={2000} rows={2} placeholder="Detalle del producto..." style={{ ...inputStyle, resize: 'vertical' }} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.875rem' }}>
          <div>
            <label style={labelStyle}>Precio *</label>
            <input type="number" value={price} onChange={e => setPrice(e.target.value)} min="1" step="any" placeholder="$" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Cantidad</label>
            <input type="number" value={quantity} onChange={e => setQuantity(e.target.value)} min="1" style={inputStyle} />
          </div>
        </div>

        <div style={{ marginBottom: '0.875rem' }}>
          <label style={labelStyle}>Categoria *</label>
          <select value={productTypeId} onChange={e => { setProductTypeId(e.target.value); setSizeId(''); setSelectedTagIds([]) }} style={inputStyle}>
            <option value="">Seleccionar...</option>
            {productTypes.filter(pt => pt.isActive).sort((a, b) => a.order - b.order).map(pt => (
              <option key={pt.id} value={pt.id}>{pt.name}</option>
            ))}
          </select>
        </div>

        {selectedPT?.requiresSize && selectedPT.sizes && selectedPT.sizes.length > 0 && (
          <div style={{ marginBottom: '0.875rem' }}>
            <label style={labelStyle}>Talle</label>
            <select value={sizeId} onChange={e => setSizeId(e.target.value)} style={inputStyle}>
              <option value="">Sin talle</option>
              {selectedPT.sizes.filter(s => s.isActive).sort((a, b) => a.order - b.order).map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        )}

        {selectedPT?.tags && selectedPT.tags.length > 0 && (
          <div style={{ marginBottom: '0.875rem' }}>
            <label style={labelStyle}>Etiquetas</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
              {selectedPT.tags.filter(t => t.isActive).sort((a, b) => a.order - b.order).map(t => {
                const selected = selectedTagIds.includes(t.id)
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setSelectedTagIds(prev => selected ? prev.filter(id => id !== t.id) : [...prev, t.id])}
                    style={{
                      padding: '0.25rem 0.625rem',
                      borderRadius: '2rem',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      border: selected ? '1px solid #1E1914' : '1px solid #d1d5db',
                      background: selected ? '#1E1914' : '#fff',
                      color: selected ? '#FAF8F3' : '#374151',
                      cursor: 'pointer',
                    }}
                  >
                    {t.name}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Photos */}
        <div style={{ marginBottom: '0.875rem' }}>
          <label style={labelStyle}>Fotos * (hasta 3)</label>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {photoPreviews.map((url, i) => (
              <div key={i} style={{ position: 'relative', width: '80px', height: '80px' }}>
                <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '0.5rem' }} />
                <button
                  type="button"
                  onClick={() => removePhoto(i)}
                  style={{
                    position: 'absolute',
                    top: '-6px',
                    right: '-6px',
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    background: '#1E1914',
                    color: '#fff',
                    border: 'none',
                    fontSize: '0.7rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  ✕
                </button>
              </div>
            ))}
            {photos.length < 3 && (
              <label style={{
                width: '80px',
                height: '80px',
                border: '2px dashed #d1d5db',
                borderRadius: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '1.5rem',
                color: '#9ca3af',
              }}>
                +
                <input type="file" accept="image/jpeg,image/png,image/webp" multiple hidden onChange={e => handlePhotos(e.target.files)} />
              </label>
            )}
          </div>
        </div>

        {error && (
          <div style={{ background: '#FEE2E2', color: '#991B1B', padding: '0.5rem 0.75rem', borderRadius: '0.5rem', fontSize: '0.8rem', marginBottom: '0.75rem' }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            type="button"
            onClick={onCancel}
            style={{ flex: 1, padding: '0.625rem', border: '1px solid #d1d5db', borderRadius: '0.5rem', background: '#fff', color: '#374151', fontSize: '0.85rem', cursor: 'pointer' }}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={submitting || !title.trim() || !price || !productTypeId || photos.length === 0}
            style={{
              flex: 1,
              padding: '0.625rem',
              border: 'none',
              borderRadius: '0.5rem',
              background: submitting ? '#9ca3af' : '#1E1914',
              color: '#FAF8F3',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: submitting ? 'wait' : 'pointer',
            }}
          >
            {submitting ? 'Subiendo...' : 'Publicar producto'}
          </button>
        </div>
      </form>
    </div>
  )
}

// ── Profile Tab ──────────────────────────────────────────

function ProfileTab({ shop, setShop }: { shop: MiniShop; setShop: React.Dispatch<React.SetStateAction<MiniShop | null>> }) {
  const [name, setName] = useState(shop.name)
  const [description, setDescription] = useState(shop.description ?? '')
  const [whatsapp, setWhatsapp] = useState(shop.whatsapp)
  const [instagram, setInstagram] = useState(shop.socialLinks?.instagram ?? '')
  const [tiktok, setTiktok] = useState(shop.socialLinks?.tiktok ?? '')
  const [facebook, setFacebook] = useState(shop.socialLinks?.facebook ?? '')
  const [otra, setOtra] = useState(shop.socialLinks?.otra ?? '')
  const [meetingPoint, setMeetingPoint] = useState(shop.deliveryMethods?.meetingPoint ?? false)
  const [address, setAddress] = useState(shop.deliveryMethods?.address ?? '')
  const [shipping, setShipping] = useState(shop.deliveryMethods?.shipping ?? false)
  const [otroDelivery, setOtroDelivery] = useState(shop.deliveryMethods?.otro ?? false)
  const [otroDeliveryText, setOtroDeliveryText] = useState(shop.deliveryMethods?.otroText ?? '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)

  async function handleSave() {
    setSaving(true)
    setError(null)
    setSaved(false)
    try {
      const updated = await updateShop(shop.id, {
        name: name.trim(),
        description: description.trim() || null,
        whatsapp: whatsapp.trim(),
        socialLinks: { instagram: instagram.trim() || undefined, tiktok: tiktok.trim() || undefined, facebook: facebook.trim() || undefined, otra: otra.trim() || undefined },
        deliveryMethods: { meetingPoint, address: address.trim() || undefined, shipping, otro: otroDelivery || undefined, otroText: otroDelivery ? otroDeliveryText.trim() || undefined : undefined },
      })
      setShop(updated)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err: any) {
      setError(err.response?.data?.error?.message ?? 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  async function handlePhotoUpload(file: File) {
    setUploadingPhoto(true)
    try {
      const updated = await uploadShopPhoto(shop.id, file)
      setShop(updated)
    } catch {
      alert('Error al subir la foto')
    } finally {
      setUploadingPhoto(false)
    }
  }

  async function handleToggleStatus() {
    try {
      const updated = await toggleShopStatus(shop.id)
      setShop(updated)
    } catch {
      alert('Error al cambiar estado')
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '0.625rem', border: '1px solid #d1d5db', borderRadius: '0.5rem', fontSize: '0.85rem', background: '#fff', outline: 'none', boxSizing: 'border-box',
  }
  const labelStyle: React.CSSProperties = { display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#1E1914', marginBottom: '0.25rem' }

  return (
    <div>
      {/* Photo */}
      <div style={{ background: '#fff', border: '1px solid #E8E3D5', borderRadius: '1rem', padding: '1.25rem', marginBottom: '1rem', textAlign: 'center' }}>
        <div style={{ marginBottom: '0.75rem' }}>
          {shop.profilePhotoUrl ? (
            <img src={shop.profilePhotoUrl} alt={shop.name} style={{ width: '96px', height: '96px', borderRadius: '50%', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: '96px', height: '96px', background: '#E8E3D5', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>🏪</div>
          )}
        </div>
        <label style={{
          display: 'inline-block',
          padding: '0.5rem 1rem',
          border: '1px solid #d1d5db',
          borderRadius: '0.5rem',
          fontSize: '0.8rem',
          cursor: uploadingPhoto ? 'wait' : 'pointer',
          color: '#374151',
        }}>
          {uploadingPhoto ? 'Subiendo...' : 'Cambiar foto de perfil'}
          <input type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={e => e.target.files?.[0] && handlePhotoUpload(e.target.files[0])} disabled={uploadingPhoto} />
        </label>
      </div>

      {/* Form */}
      <div style={{ background: '#fff', border: '1px solid #E8E3D5', borderRadius: '1rem', padding: '1.25rem', marginBottom: '1rem' }}>
        <div style={{ marginBottom: '0.875rem' }}>
          <label style={labelStyle}>Nombre de la tienda</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} maxLength={100} style={inputStyle} />
        </div>
        <div style={{ marginBottom: '0.875rem' }}>
          <label style={labelStyle}>Descripcion</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} maxLength={500} rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
        </div>
        <div style={{ marginBottom: '0.875rem' }}>
          <label style={labelStyle}>WhatsApp</label>
          <input type="text" value={whatsapp} onChange={e => setWhatsapp(e.target.value)} maxLength={20} style={inputStyle} />
        </div>
        <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1E1914', marginBottom: '0.625rem' }}>Redes sociales</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.625rem', marginBottom: '0.875rem' }}>
          <div>
            <label style={labelStyle}>Instagram</label>
            <input type="text" value={instagram} onChange={e => setInstagram(e.target.value)} maxLength={200} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>TikTok</label>
            <input type="text" value={tiktok} onChange={e => setTiktok(e.target.value)} maxLength={200} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Facebook</label>
            <input type="text" value={facebook} onChange={e => setFacebook(e.target.value)} maxLength={200} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Otra red</label>
            <input type="text" value={otra} onChange={e => setOtra(e.target.value)} maxLength={200} style={inputStyle} />
          </div>
        </div>

        <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1E1914', marginBottom: '0.625rem' }}>Metodos de entrega</h3>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', cursor: 'pointer' }}>
          <input type="checkbox" checked={meetingPoint} onChange={e => setMeetingPoint(e.target.checked)} style={{ width: '16px', height: '16px', accentColor: '#1E1914' }} />
          <span style={{ fontSize: '0.85rem' }}>Punto de encuentro</span>
        </label>
        {meetingPoint && (
          <div style={{ paddingLeft: '1.5rem', marginBottom: '0.5rem' }}>
            <input type="text" value={address} onChange={e => setAddress(e.target.value)} placeholder="Direccion o zona" maxLength={300} style={inputStyle} />
          </div>
        )}
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
          <input type="checkbox" checked={shipping} onChange={e => setShipping(e.target.checked)} style={{ width: '16px', height: '16px', accentColor: '#1E1914' }} />
          <span style={{ fontSize: '0.85rem' }}>Envios</span>
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem', cursor: 'pointer' }}>
          <input type="checkbox" checked={otroDelivery} onChange={e => setOtroDelivery(e.target.checked)} style={{ width: '16px', height: '16px', accentColor: '#1E1914' }} />
          <span style={{ fontSize: '0.85rem' }}>Otro</span>
        </label>
        {otroDelivery && (
          <div style={{ paddingLeft: '1.5rem', marginTop: '0.4rem' }}>
            <textarea value={otroDeliveryText} onChange={e => setOtroDeliveryText(e.target.value)} placeholder="Describí el método..." maxLength={300} rows={2} style={{ ...inputStyle, resize: 'vertical' }} />
          </div>
        )}
      </div>

      {error && (
        <div style={{ background: '#FEE2E2', color: '#991B1B', padding: '0.5rem 0.75rem', borderRadius: '0.5rem', fontSize: '0.8rem', marginBottom: '0.75rem' }}>
          {error}
        </div>
      )}
      {saved && (
        <div style={{ background: '#D1FAE5', color: '#065F46', padding: '0.5rem 0.75rem', borderRadius: '0.5rem', fontSize: '0.8rem', marginBottom: '0.75rem' }}>
          Cambios guardados
        </div>
      )}

      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            flex: 1,
            padding: '0.75rem',
            border: 'none',
            borderRadius: '0.75rem',
            background: '#1E1914',
            color: '#FAF8F3',
            fontSize: '0.9rem',
            fontWeight: 600,
            cursor: saving ? 'wait' : 'pointer',
          }}
        >
          {saving ? 'Guardando...' : 'Guardar cambios'}
        </button>
        <button
          onClick={handleToggleStatus}
          style={{
            padding: '0.75rem 1rem',
            border: '1px solid #d1d5db',
            borderRadius: '0.75rem',
            background: '#fff',
            color: shop.status === 'ACTIVE' ? '#92400E' : '#065F46',
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          {shop.status === 'ACTIVE' ? 'Pausar tienda' : 'Activar tienda'}
        </button>
      </div>
    </div>
  )
}

// ── Featured Tab ──────────────────────────────────────────

function FeaturedTab({ shopId }: { shopId: string }) {
  const [products, setProducts] = useState<MiniShopProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [storePhone, setStorePhone] = useState<string | null>(null)

  useEffect(() => {
    fetchApprovedProducts(shopId)
      .then(setProducts)
      .catch(() => {})
      .finally(() => setLoading(false))
    import('../../api/axiosClient').then(({ default: axiosClient }) => {
      axiosClient.get('/store-info').then(r => {
        const phone = r.data?.data?.store?.phone
        if (phone) setStorePhone(phone.replace(/\D/g, ''))
      }).catch(() => {})
    })
  }, [shopId])

  function buildFeaturedWaLink(product: MiniShopProduct) {
    if (!storePhone) return ''
    const msg = `Hola MBDA Market! Me gustaría que mi producto "${product.title}" sea destacado en el catálogo. ${product.slug ? `https://mbdamodas.netlify.app/producto/${product.slug}` : ''}`
    return `https://wa.me/${storePhone}?text=${encodeURIComponent(msg)}`
  }

  if (loading) return <div style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>Cargando...</div>

  if (products.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem 1rem', background: '#fff', borderRadius: '1rem', border: '1px solid #E8E3D5' }}>
        <p style={{ fontSize: '0.9rem', color: '#6b7280' }}>No tenes productos aprobados para destacar.</p>
        <p style={{ fontSize: '0.8rem', color: '#9ca3af' }}>Cuando tus productos sean aprobados, podras destacarlos desde aca.</p>
      </div>
    )
  }

  const featuredCount = products.filter(p => p.featured).length

  return (
    <div>
      <div style={{ background: '#fef9c3', border: '1px solid #fde68a', borderRadius: '0.75rem', padding: '0.75rem 1rem', marginBottom: '1rem', fontSize: '0.85rem', color: '#92400e' }}>
        ⭐ Los productos destacados aparecen primero en el catálogo. Podés solicitar que un producto sea destacado enviando un mensaje a MBDA Market.
        {featuredCount > 0 && <span style={{ fontWeight: 600 }}> Tenés {featuredCount} producto{featuredCount > 1 ? 's' : ''} destacado{featuredCount > 1 ? 's' : ''}.</span>}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {products.map(p => {
          const photo = p.photos?.[0]
          return (
            <div key={p.id} style={{
              background: '#fff',
              border: `1px solid ${p.featured ? '#fde68a' : '#E8E3D5'}`,
              borderRadius: '0.75rem',
              padding: '0.75rem',
              display: 'flex',
              gap: '0.75rem',
              alignItems: 'center',
            }}>
              {photo ? (
                <img src={photo.url} alt={p.title} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '0.5rem' }} />
              ) : (
                <div style={{ width: '50px', height: '50px', background: '#E8E3D5', borderRadius: '0.5rem' }} />
              )}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1E1914' }}>{p.title}</span>
                  {p.featured && <span style={{ fontSize: '0.7rem', background: '#fef3c7', color: '#92400e', padding: '0.1rem 0.375rem', borderRadius: '0.25rem', fontWeight: 600 }}>⭐ Destacado</span>}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '0.375rem' }}>${Number(p.price).toLocaleString('es-AR')}</div>
                {!p.featured && storePhone && (
                  <a
                    href={buildFeaturedWaLink(p)}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', background: '#25D366', color: '#fff', padding: '0.2rem 0.5rem', borderRadius: '0.375rem', textDecoration: 'none', fontWeight: 600 }}
                  >
                    📲 Solicitar destacado
                  </a>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
