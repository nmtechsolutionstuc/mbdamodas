import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useToast } from '../../context/ToastContext'
import {
  fetchAdminFeatured, setFeaturedItem, setFeaturedMiniShopProduct,
  searchProductsToFeature,
} from '../../api/adminFeatured'
import type { FeaturedMbdaItem, FeaturedMinishopProduct, SearchResult } from '../../api/adminFeatured'

function daysRemaining(featuredUntil: string | null): string {
  if (!featuredUntil) return 'Sin vencimiento'
  const diff = new Date(featuredUntil).getTime() - Date.now()
  if (diff <= 0) return 'Vencido'
  const hours = Math.floor(diff / (1000 * 60 * 60))
  if (hours < 24) return `${hours}h restantes`
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
  return `${days} día${days !== 1 ? 's' : ''} restante${days !== 1 ? 's' : ''}`
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleString('es-AR', {
    day: '2-digit', month: '2-digit', year: '2-digit',
    hour: '2-digit', minute: '2-digit',
  })
}

export function AdminFeaturedPage() {
  const { toast } = useToast()
  const [mbda, setMbda] = useState<FeaturedMbdaItem[]>([])
  const [minishop, setMinishop] = useState<FeaturedMinishopProduct[]>([])
  const [loading, setLoading] = useState(true)

  // Add-to-featured panel
  const [searchQ, setSearchQ] = useState('')
  const [searchSource, setSearchSource] = useState<'all' | 'mbda' | 'minishop'>('all')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const [selectedResult, setSelectedResult] = useState<SearchResult | null>(null)
  const [days, setDays] = useState<string>('7')
  const [saving, setSaving] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetchAdminFeatured()
      setMbda(res.mbda)
      setMinishop(res.minishop)
    } catch {
      toast('Error al cargar destacados', 'error')
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => { load() }, [load])

  async function handleRemoveFeatured(item: FeaturedMbdaItem | FeaturedMinishopProduct) {
    const key = `${item.source}-${item.id}`
    setSaving(key)
    try {
      if (item.source === 'mbda') {
        await setFeaturedItem(item.id, false)
      } else {
        await setFeaturedMiniShopProduct(item.id, false)
      }
      toast('Destacado desactivado', 'success')
      await load()
    } catch {
      toast('Error al desactivar destacado', 'error')
    } finally {
      setSaving(null)
    }
  }

  async function handleSearch() {
    if (searchQ.trim().length < 2) return
    setSearching(true)
    try {
      const src = searchSource === 'all' ? undefined : searchSource
      const res = await searchProductsToFeature(searchQ.trim(), src)
      setSearchResults(res)
    } catch {
      toast('Error al buscar productos', 'error')
    } finally {
      setSearching(false)
    }
  }

  async function handleAddFeatured() {
    if (!selectedResult) return
    const daysN = parseInt(days)
    setSaving(`add-${selectedResult.id}`)
    try {
      if (selectedResult.source === 'mbda') {
        await setFeaturedItem(selectedResult.id, true, isNaN(daysN) || daysN <= 0 ? undefined : daysN)
      } else {
        await setFeaturedMiniShopProduct(selectedResult.id, true, isNaN(daysN) || daysN <= 0 ? undefined : daysN)
      }
      toast('Producto destacado correctamente', 'success')
      setSelectedResult(null)
      setSearchResults([])
      setSearchQ('')
      await load()
    } catch {
      toast('Error al destacar producto', 'error')
    } finally {
      setSaving(null)
    }
  }

  const total = mbda.length + minishop.length

  return (
    <div style={{ padding: '2rem 1.5rem', maxWidth: '1000px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <Link to="/admin" style={{ color: '#6b7280', textDecoration: 'none', fontSize: '0.85rem' }}>
          ← Dashboard
        </Link>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.75rem', fontWeight: 700, color: '#1E1914', margin: 0 }}>
          ⭐ Gestión de Destacados
        </h1>
        <span style={{ background: '#FEF3C7', color: '#92400E', borderRadius: '999px', padding: '0.25rem 0.75rem', fontSize: '0.8rem', fontWeight: 600 }}>
          {total} activo{total !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Add Featured Panel */}
      <div style={{ background: '#fff', border: '1px solid #E8E3D5', borderRadius: '1rem', padding: '1.5rem', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#1E1914', marginBottom: '1rem', fontFamily: "'Inter', sans-serif" }}>
          ➕ Agregar producto destacado
        </h2>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
          <input
            type="text"
            placeholder="Buscar producto por nombre..."
            value={searchQ}
            onChange={e => setSearchQ(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            style={{ flex: 1, minWidth: '200px', padding: '0.6rem 0.875rem', borderRadius: '0.5rem', border: '1px solid #d1d5db', fontSize: '0.9rem', outline: 'none', fontFamily: "'Inter', sans-serif" }}
          />
          <select
            value={searchSource}
            onChange={e => setSearchSource(e.target.value as any)}
            style={{ padding: '0.6rem 0.875rem', borderRadius: '0.5rem', border: '1px solid #d1d5db', fontSize: '0.85rem', background: '#fff', fontFamily: "'Inter', sans-serif", cursor: 'pointer' }}
          >
            <option value="all">Todos</option>
            <option value="mbda">Solo MBDA</option>
            <option value="minishop">Solo Mini-tiendas</option>
          </select>
          <button
            onClick={handleSearch}
            disabled={searching || searchQ.trim().length < 2}
            style={{ padding: '0.6rem 1.25rem', background: '#1E1914', color: '#E8E3D5', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, fontFamily: "'Inter', sans-serif", opacity: searching ? 0.7 : 1 }}
          >
            {searching ? 'Buscando...' : 'Buscar'}
          </button>
        </div>

        {searchResults.length > 0 && (
          <div style={{ border: '1px solid #E8E3D5', borderRadius: '0.75rem', overflow: 'hidden', marginBottom: '0.75rem' }}>
            {searchResults.map(r => (
              <div
                key={`${r.source}-${r.id}`}
                onClick={() => setSelectedResult(r)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem',
                  cursor: 'pointer', background: selectedResult?.id === r.id ? '#FEF3C7' : '#fff',
                  borderBottom: '1px solid #f3f4f6', transition: 'background 0.15s',
                }}
              >
                {r.photos[0] && (
                  <img src={r.photos[0].url} alt={r.title} style={{ width: '40px', height: '40px', borderRadius: '0.375rem', objectFit: 'cover', flexShrink: 0 }} />
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1E1914', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontFamily: "'Inter', sans-serif" }}>
                    {r.title}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280', fontFamily: "'Inter', sans-serif" }}>
                    {r.source === 'mbda' ? '🏪 MBDA' : `🛍️ ${r.miniShop?.name}`} · ${r.price.toLocaleString('es-AR')}
                    {r.featured && <span style={{ marginLeft: '0.5rem', color: '#d97706' }}>⭐ Ya destacado</span>}
                  </div>
                </div>
                <div style={{ fontSize: '0.7rem', color: selectedResult?.id === r.id ? '#92400E' : '#9ca3af', fontWeight: 600 }}>
                  {selectedResult?.id === r.id ? '✓ Seleccionado' : 'Seleccionar'}
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedResult && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', background: '#FEF9EE', border: '1px solid #FDE68A', borderRadius: '0.75rem', padding: '0.875rem 1rem' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1E1914', fontFamily: "'Inter', sans-serif" }}>
              ⭐ {selectedResult.title}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.8rem', color: '#6b7280', fontFamily: "'Inter', sans-serif" }}>Días destacado:</label>
              <input
                type="number"
                value={days}
                onChange={e => setDays(e.target.value)}
                min="1"
                max="365"
                placeholder="Sin límite"
                style={{ width: '80px', padding: '0.4rem 0.5rem', borderRadius: '0.4rem', border: '1px solid #d1d5db', fontSize: '0.85rem', fontFamily: "'Inter', sans-serif", outline: 'none' }}
              />
              <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>(vacío = sin límite)</span>
            </div>
            <button
              onClick={handleAddFeatured}
              disabled={saving !== null}
              style={{ padding: '0.5rem 1.25rem', background: '#d97706', color: '#fff', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, fontFamily: "'Inter', sans-serif" }}
            >
              {saving?.startsWith('add-') ? 'Guardando...' : 'Destacar'}
            </button>
            <button
              onClick={() => { setSelectedResult(null); setSearchResults([]) }}
              style={{ padding: '0.5rem 0.875rem', background: 'transparent', border: '1px solid #d1d5db', color: '#6b7280', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', fontFamily: "'Inter', sans-serif" }}
            >
              Cancelar
            </button>
          </div>
        )}
      </div>

      {/* Currently Featured */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af', fontSize: '0.9rem' }}>Cargando...</div>
      ) : total === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', background: '#fff', borderRadius: '1rem', border: '1px solid #E8E3D5' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⭐</div>
          <p style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.1rem', color: '#1E1914', marginBottom: '0.5rem' }}>No hay productos destacados</p>
          <p style={{ color: '#9ca3af', fontSize: '0.85rem' }}>Usá el buscador de arriba para agregar productos destacados en el home.</p>
        </div>
      ) : (
        <>
          {/* MBDA Items */}
          {mbda.length > 0 && (
            <section style={{ marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1rem', fontFamily: "'Inter', sans-serif" }}>
                🏪 Productos MBDA ({mbda.length})
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {mbda.map(item => (
                  <FeaturedCard
                    key={item.id}
                    id={item.id}
                    title={item.title}
                    subtitle={item.code ?? undefined}
                    price={item.price}
                    photo={item.photos[0]?.url}
                    productType={item.productType?.name}
                    source="mbda"
                    featuredAt={item.featuredAt}
                    featuredUntil={item.featuredUntil}
                    saving={saving === `mbda-${item.id}`}
                    onRemove={() => handleRemoveFeatured(item)}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Mini-shop Products */}
          {minishop.length > 0 && (
            <section>
              <h2 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1rem', fontFamily: "'Inter', sans-serif" }}>
                🛍️ Productos de Mini-tiendas ({minishop.length})
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {minishop.map(item => (
                  <FeaturedCard
                    key={item.id}
                    id={item.id}
                    title={item.title}
                    subtitle={item.miniShop.name}
                    price={item.price}
                    photo={item.photos[0]?.url}
                    productType={item.productType?.name}
                    source="minishop"
                    featuredAt={item.featuredAt}
                    featuredUntil={item.featuredUntil}
                    saving={saving === `minishop-${item.id}`}
                    onRemove={() => handleRemoveFeatured(item)}
                  />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  )
}

interface FeaturedCardProps {
  id: string
  title: string
  subtitle?: string
  price: number
  photo?: string
  productType?: string
  source: 'mbda' | 'minishop'
  featuredAt: string | null
  featuredUntil: string | null
  saving: boolean
  onRemove: () => void
}

function FeaturedCard({ title, subtitle, price, photo, productType, source, featuredAt, featuredUntil, saving, onRemove }: FeaturedCardProps) {
  const remaining = daysRemaining(featuredUntil)
  const isExpiring = featuredUntil ? new Date(featuredUntil).getTime() - Date.now() < 24 * 60 * 60 * 1000 : false

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '1rem',
      background: '#fff', border: '1px solid #E8E3D5', borderRadius: '0.875rem',
      padding: '0.875rem 1rem', flexWrap: 'wrap',
    }}>
      {photo ? (
        <img src={photo} alt={title} style={{ width: '52px', height: '52px', borderRadius: '0.5rem', objectFit: 'cover', flexShrink: 0 }} />
      ) : (
        <div style={{ width: '52px', height: '52px', borderRadius: '0.5rem', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', flexShrink: 0 }}>
          🛍️
        </div>
      )}

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#1E1914', fontFamily: "'Inter', sans-serif" }}>{title}</span>
          <span style={{ fontSize: '0.7rem', background: source === 'mbda' ? '#EFF6FF' : '#F0FDF4', color: source === 'mbda' ? '#1d4ed8' : '#15803d', borderRadius: '999px', padding: '0.15rem 0.5rem', fontWeight: 600 }}>
            {source === 'mbda' ? 'MBDA' : subtitle}
          </span>
          {productType && <span style={{ fontSize: '0.7rem', color: '#9ca3af' }}>{productType}</span>}
        </div>
        <div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '0.125rem', fontFamily: "'Inter', sans-serif" }}>
          ${price.toLocaleString('es-AR')} · Desde: {formatDate(featuredAt)}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
        <span style={{
          fontSize: '0.75rem', fontWeight: 600, fontFamily: "'Inter', sans-serif",
          color: remaining === 'Vencido' ? '#dc2626' : isExpiring ? '#d97706' : '#059669',
          background: remaining === 'Vencido' ? '#FEE2E2' : isExpiring ? '#FEF3C7' : '#D1FAE5',
          borderRadius: '999px', padding: '0.25rem 0.625rem',
        }}>
          {remaining === 'Sin vencimiento' ? '∞ Sin límite' : remaining}
        </span>
        <button
          onClick={onRemove}
          disabled={saving}
          style={{
            padding: '0.4rem 0.875rem', background: 'transparent', border: '1px solid #fca5a5',
            color: '#dc2626', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.8rem',
            fontWeight: 600, fontFamily: "'Inter', sans-serif", opacity: saving ? 0.6 : 1,
          }}
        >
          {saving ? '...' : 'Quitar'}
        </button>
      </div>
    </div>
  )
}
