import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useToast } from '../../context/ToastContext'
import {
  fetchProductTypes,
  toggleProductType,
  createSize,
  toggleSize,
  createTag,
  toggleTag,
} from '../../api/admin'
import type { ProductType, Size, Tag } from '../../types'

export function AdminCatalogSettingsPage() {
  const { toast } = useToast()
  const [productTypes, setProductTypes] = useState<ProductType[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedPT, setExpandedPT] = useState<string | null>(null)

  // New size/tag forms
  const [newSizeName, setNewSizeName] = useState('')
  const [newTagName, setNewTagName] = useState('')
  const [creatingSizeFor, setCreatingSizeFor] = useState<string | null>(null)
  const [creatingTagFor, setCreatingTagFor] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchProductTypes()
      .then(setProductTypes)
      .catch(() => toast('Error al cargar tipos de producto', 'error'))
      .finally(() => setLoading(false))
  }, [])

  async function handleTogglePT(pt: ProductType) {
    try {
      const updated = await toggleProductType(pt.id)
      setProductTypes(prev => prev.map(p => p.id === pt.id ? { ...p, isActive: updated.isActive } : p))
      toast(updated.isActive ? `"${pt.name}" activado` : `"${pt.name}" desactivado`, 'success')
    } catch {
      toast('Error al cambiar estado', 'error')
    }
  }

  async function handleCreateSize(productTypeId: string) {
    const name = newSizeName.trim()
    if (!name) return
    setSaving(true)
    try {
      const created = await createSize({ name, productTypeId })
      setProductTypes(prev => prev.map(pt => {
        if (pt.id !== productTypeId) return pt
        return { ...pt, sizes: [...(pt.sizes ?? []), created] }
      }))
      setNewSizeName('')
      setCreatingSizeFor(null)
      toast(`Talle "${name}" creado`, 'success')
    } catch {
      toast('Error al crear talle', 'error')
    } finally {
      setSaving(false)
    }
  }

  async function handleToggleSize(size: Size) {
    try {
      const updated = await toggleSize(size.id)
      setProductTypes(prev => prev.map(pt => {
        if (pt.id !== size.productTypeId) return pt
        return { ...pt, sizes: (pt.sizes ?? []).map(s => s.id === size.id ? { ...s, isActive: updated.isActive } : s) }
      }))
    } catch {
      toast('Error al cambiar talle', 'error')
    }
  }

  async function handleCreateTag(productTypeId: string) {
    const name = newTagName.trim()
    if (!name) return
    setSaving(true)
    try {
      const created = await createTag({ name, productTypeId })
      setProductTypes(prev => prev.map(pt => {
        if (pt.id !== productTypeId) return pt
        return { ...pt, tags: [...(pt.tags ?? []), created] }
      }))
      setNewTagName('')
      setCreatingTagFor(null)
      toast(`Etiqueta "${name}" creada`, 'success')
    } catch {
      toast('Error al crear etiqueta', 'error')
    } finally {
      setSaving(false)
    }
  }

  async function handleToggleTag(tag: Tag) {
    try {
      const updated = await toggleTag(tag.id)
      setProductTypes(prev => prev.map(pt => {
        if (pt.id !== tag.productTypeId) return pt
        return { ...pt, tags: (pt.tags ?? []).map(t => t.id === tag.id ? { ...t, isActive: updated.isActive } : t) }
      }))
    } catch {
      toast('Error al cambiar etiqueta', 'error')
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#FAF8F3', padding: '1.5rem' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <div style={{ height: '1rem', width: '100px', background: '#E8E3D5', borderRadius: '0.5rem', marginBottom: '1.5rem' }} className="mbda-shimmer" />
          <div style={{ height: '1.75rem', width: '60%', background: '#E8E3D5', borderRadius: '0.5rem', marginBottom: '1.5rem' }} className="mbda-shimmer" />
          {[1, 2, 3].map(i => (
            <div key={i} style={{ background: '#fff', border: '1px solid #E8E3D5', borderRadius: '1rem', padding: '1.25rem', marginBottom: '1rem' }}>
              <div style={{ height: '1rem', width: '50%', background: '#E8E3D5', borderRadius: '0.5rem' }} className="mbda-shimmer" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#FAF8F3', padding: '1.5rem' }}>
      <div style={{ maxWidth: '700px', margin: '0 auto' }}>
        <Link to="/admin" style={{ color: '#6b7280', textDecoration: 'none', fontSize: '0.9rem', display: 'inline-block', marginBottom: '1.5rem', fontFamily: "'Inter', sans-serif" }}>
          ← Panel admin
        </Link>

        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.75rem', fontWeight: 700, color: '#1E1914', marginBottom: '0.5rem' }}>
          Tipos de producto, talles y etiquetas
        </h1>
        <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1.75rem', fontFamily: "'Inter', sans-serif" }}>
          Configura las opciones disponibles en el formulario de envio y en el catalogo.
        </p>

        {productTypes.map(pt => {
          const isExpanded = expandedPT === pt.id
          const sizes = pt.sizes ?? []
          const tags = pt.tags ?? []
          const activeSizes = sizes.filter(s => s.isActive).length
          const activeTags = tags.filter(t => t.isActive).length

          return (
            <div
              key={pt.id}
              style={{
                background: '#fff',
                border: '1px solid #E8E3D5',
                borderRadius: '1rem',
                marginBottom: '1rem',
                overflow: 'hidden',
              }}
            >
              {/* Header */}
              <div
                onClick={() => setExpandedPT(isExpanded ? null : pt.id)}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '1rem 1.25rem',
                  cursor: 'pointer',
                  transition: 'background 0.15s ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#faf8f3' }}
                onMouseLeave={e => { e.currentTarget.style.background = '#fff' }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontWeight: 700, color: '#1E1914', fontSize: '1rem', fontFamily: "'Inter', sans-serif" }}>
                      {pt.name}
                    </span>
                    <span style={{
                      fontSize: '0.7rem',
                      padding: '0.125rem 0.5rem',
                      borderRadius: '999px',
                      background: pt.isActive ? '#dcfce7' : '#fee2e2',
                      color: pt.isActive ? '#166534' : '#dc2626',
                      fontWeight: 600,
                    }}>
                      {pt.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: '#9ca3af', marginTop: '0.25rem', fontFamily: "'Inter', sans-serif" }}>
                    {pt.requiresSize ? `${activeSizes} talles` : 'Sin talles'} · {activeTags} etiquetas
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <button
                    onClick={e => { e.stopPropagation(); handleTogglePT(pt) }}
                    style={{
                      padding: '0.375rem 0.75rem',
                      borderRadius: '0.625rem',
                      border: '1px solid #E8E3D5',
                      background: '#fff',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      color: pt.isActive ? '#dc2626' : '#166534',
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    {pt.isActive ? 'Desactivar' : 'Activar'}
                  </button>
                  <span style={{ color: '#9ca3af', fontSize: '1.1rem', transition: 'transform 0.2s ease', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)' }}>
                    ▾
                  </span>
                </div>
              </div>

              {/* Expanded content */}
              {isExpanded && (
                <div style={{ borderTop: '1px solid #E8E3D5', padding: '1.25rem' }}>
                  {/* Sizes section */}
                  {pt.requiresSize && (
                    <div style={{ marginBottom: '1.5rem' }}>
                      <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1E1914', marginBottom: '0.75rem', fontFamily: "'Inter', sans-serif" }}>
                        Talles
                      </h3>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                        {sizes.length === 0 && (
                          <p style={{ fontSize: '0.8rem', color: '#9ca3af', fontFamily: "'Inter', sans-serif" }}>Sin talles configurados</p>
                        )}
                        {sizes.map(size => (
                          <button
                            key={size.id}
                            onClick={() => handleToggleSize(size)}
                            title={size.isActive ? 'Clic para desactivar' : 'Clic para activar'}
                            style={{
                              padding: '0.375rem 0.75rem',
                              borderRadius: '0.625rem',
                              border: '1px solid',
                              borderColor: size.isActive ? '#1E1914' : '#d1d5db',
                              background: size.isActive ? '#1E1914' : '#f9fafb',
                              color: size.isActive ? '#E8E3D5' : '#9ca3af',
                              fontSize: '0.85rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              fontFamily: "'Inter', sans-serif",
                              transition: 'all 0.15s ease',
                              textDecoration: size.isActive ? 'none' : 'line-through',
                            }}
                          >
                            {size.name}
                          </button>
                        ))}
                      </div>

                      {creatingSizeFor === pt.id ? (
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                          <input
                            type="text"
                            value={newSizeName}
                            onChange={e => setNewSizeName(e.target.value)}
                            placeholder="Ej: XL, 42, Unico"
                            onKeyDown={e => { if (e.key === 'Enter') handleCreateSize(pt.id) }}
                            style={{
                              flex: 1,
                              padding: '0.5rem 0.75rem',
                              borderRadius: '0.625rem',
                              border: '1px solid #E8E3D5',
                              fontSize: '0.875rem',
                              fontFamily: "'Inter', sans-serif",
                            }}
                            autoFocus
                          />
                          <button
                            onClick={() => handleCreateSize(pt.id)}
                            disabled={saving || !newSizeName.trim()}
                            style={{
                              padding: '0.5rem 1rem',
                              borderRadius: '0.625rem',
                              border: 'none',
                              background: '#1E1914',
                              color: '#E8E3D5',
                              fontWeight: 600,
                              cursor: 'pointer',
                              fontSize: '0.85rem',
                              opacity: saving || !newSizeName.trim() ? 0.5 : 1,
                            }}
                          >
                            {saving ? '...' : 'Crear'}
                          </button>
                          <button
                            onClick={() => { setCreatingSizeFor(null); setNewSizeName('') }}
                            style={{ padding: '0.5rem', background: 'transparent', border: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: '1.1rem' }}
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => { setCreatingSizeFor(pt.id); setCreatingTagFor(null); setNewSizeName('') }}
                          style={{
                            padding: '0.375rem 0.75rem',
                            borderRadius: '0.625rem',
                            border: '1px dashed #d1d5db',
                            background: 'transparent',
                            cursor: 'pointer',
                            fontSize: '0.8rem',
                            color: '#6b7280',
                            fontFamily: "'Inter', sans-serif",
                          }}
                        >
                          + Agregar talle
                        </button>
                      )}
                    </div>
                  )}

                  {/* Tags section */}
                  <div>
                    <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1E1914', marginBottom: '0.75rem', fontFamily: "'Inter', sans-serif" }}>
                      Etiquetas
                    </h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                      {tags.length === 0 && (
                        <p style={{ fontSize: '0.8rem', color: '#9ca3af', fontFamily: "'Inter', sans-serif" }}>Sin etiquetas configuradas</p>
                      )}
                      {tags.map(tag => (
                        <button
                          key={tag.id}
                          onClick={() => handleToggleTag(tag)}
                          title={tag.isActive ? 'Clic para desactivar' : 'Clic para activar'}
                          style={{
                            padding: '0.3rem 0.75rem',
                            borderRadius: '999px',
                            border: '1px solid',
                            borderColor: tag.isActive ? '#E8E3D5' : '#e5e7eb',
                            background: tag.isActive ? '#E8E3D5' : '#f9fafb',
                            color: tag.isActive ? '#1E1914' : '#9ca3af',
                            fontSize: '0.8rem',
                            fontWeight: 500,
                            cursor: 'pointer',
                            fontFamily: "'Inter', sans-serif",
                            transition: 'all 0.15s ease',
                            textDecoration: tag.isActive ? 'none' : 'line-through',
                          }}
                        >
                          {tag.name}
                        </button>
                      ))}
                    </div>

                    {creatingTagFor === pt.id ? (
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <input
                          type="text"
                          value={newTagName}
                          onChange={e => setNewTagName(e.target.value)}
                          placeholder="Ej: Deportivo, Casual, Vintage"
                          onKeyDown={e => { if (e.key === 'Enter') handleCreateTag(pt.id) }}
                          style={{
                            flex: 1,
                            padding: '0.5rem 0.75rem',
                            borderRadius: '0.625rem',
                            border: '1px solid #E8E3D5',
                            fontSize: '0.875rem',
                            fontFamily: "'Inter', sans-serif",
                          }}
                          autoFocus
                        />
                        <button
                          onClick={() => handleCreateTag(pt.id)}
                          disabled={saving || !newTagName.trim()}
                          style={{
                            padding: '0.5rem 1rem',
                            borderRadius: '0.625rem',
                            border: 'none',
                            background: '#1E1914',
                            color: '#E8E3D5',
                            fontWeight: 600,
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                            opacity: saving || !newTagName.trim() ? 0.5 : 1,
                          }}
                        >
                          {saving ? '...' : 'Crear'}
                        </button>
                        <button
                          onClick={() => { setCreatingTagFor(null); setNewTagName('') }}
                          style={{ padding: '0.5rem', background: 'transparent', border: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: '1.1rem' }}
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => { setCreatingTagFor(pt.id); setCreatingSizeFor(null); setNewTagName('') }}
                        style={{
                          padding: '0.375rem 0.75rem',
                          borderRadius: '0.625rem',
                          border: '1px dashed #d1d5db',
                          background: 'transparent',
                          cursor: 'pointer',
                          fontSize: '0.8rem',
                          color: '#6b7280',
                          fontFamily: "'Inter', sans-serif",
                        }}
                      >
                        + Agregar etiqueta
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}

        {productTypes.length === 0 && (
          <div style={{ background: '#fff', border: '1px solid #E8E3D5', borderRadius: '1rem', padding: '2rem', textAlign: 'center' }}>
            <p style={{ color: '#9ca3af', fontFamily: "'Inter', sans-serif" }}>
              No hay tipos de producto configurados. Ejecuta el seed para crear los datos iniciales.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
