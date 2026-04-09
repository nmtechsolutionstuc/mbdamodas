import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createSubmission, type SubmissionItemFormData } from '../../api/submissions'
import type { ItemCondition } from '../../types'
import { CONDITION_LABELS } from '../../types'
import { useProductTypes } from '../../hooks/useProductTypes'

const CONDITIONS = Object.entries(CONDITION_LABELS) as [ItemCondition, string][]

const EMPTY_ITEM = (): SubmissionItemFormData => ({
  title: '',
  description: '',
  condition: 'BUEN_ESTADO',
  productTypeId: '',
  sizeId: null,
  tagIds: [],
  quantity: 1,
  desiredPrice: 0,
  minimumPrice: undefined,
  photos: [],
})

type Step = 1 | 2 | 3 | 4

const STEP_LABELS: Record<Step, string> = {
  1: 'Datos del producto',
  2: 'Condicion y precio',
  3: 'Fotos',
  4: 'Confirmacion',
}

export function SubmitItemPage() {
  const navigate = useNavigate()
  const { productTypes } = useProductTypes()
  const [items, setItems] = useState<SubmissionItemFormData[]>([EMPTY_ITEM()])
  const [currentItem, setCurrentItem] = useState(0)
  const [step, setStep] = useState<Step>(1)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [photoPreviews, setPhotoPreviews] = useState<string[][]>([[]])
  const [addBtnHover, setAddBtnHover] = useState(false)

  const item = items[currentItem]!
  const selectedProductType = productTypes.find(pt => pt.id === item.productTypeId)

  function updateItem(patch: Partial<SubmissionItemFormData>) {
    setItems(prev => prev.map((it, i) => i === currentItem ? { ...it, ...patch } : it))
  }

  function addItem() {
    setItems(prev => [...prev, EMPTY_ITEM()])
    setPhotoPreviews(prev => [...prev, []])
    setCurrentItem(items.length)
    setStep(1)
  }

  function removeItem(idx: number) {
    if (items.length === 1) return
    setItems(prev => prev.filter((_, i) => i !== idx))
    setPhotoPreviews(prev => prev.filter((_, i) => i !== idx))
    setCurrentItem(Math.max(0, currentItem - 1))
  }

  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
  const MAX_FILE_SIZE = 8 * 1024 * 1024 // 8MB (mismo límite que el backend)
  const [photoError, setPhotoError] = useState<string | null>(null)

  function handlePhotos(files: FileList | null) {
    if (!files) return
    setPhotoError(null)

    const allFiles = Array.from(files).slice(0, 5 - item.photos.length)
    const validFiles: File[] = []

    for (const file of allFiles) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        setPhotoError(`"${file.name}" no es válido. Solo se permiten JPG, PNG y WebP.`)
        return
      }
      if (file.size > MAX_FILE_SIZE) {
        setPhotoError(`"${file.name}" supera los 8MB. Reducí el tamaño de la imagen.`)
        return
      }
      validFiles.push(file)
    }

    if (validFiles.length === 0) return
    const newPreviews = validFiles.map(f => URL.createObjectURL(f))
    updateItem({ photos: [...item.photos, ...validFiles] })
    setPhotoPreviews(prev => prev.map((p, i) => i === currentItem ? [...p, ...newPreviews] : p))
  }

  function removePhoto(photoIdx: number) {
    updateItem({ photos: item.photos.filter((_, i) => i !== photoIdx) })
    setPhotoPreviews(prev => prev.map((p, i) => i === currentItem ? p.filter((_, j) => j !== photoIdx) : p))
  }

  function handleProductTypeChange(newId: string) {
    updateItem({ productTypeId: newId, sizeId: null, tagIds: [] })
  }

  function toggleTag(tagId: string) {
    const current = item.tagIds
    if (current.includes(tagId)) {
      updateItem({ tagIds: current.filter(id => id !== tagId) })
    } else {
      updateItem({ tagIds: [...current, tagId] })
    }
  }

  async function handleSubmit() {
    if (!termsAccepted) return
    setSubmitting(true)
    setError(null)
    try {
      await createSubmission(items)
      navigate('/dashboard/mis-solicitudes')
    } catch {
      setError('No se pudo enviar la solicitud. Verifica tu conexion e intenta de nuevo.')
    } finally {
      setSubmitting(false)
    }
  }

  const s = { background: '#fff', border: '1px solid #E8E3D5' }
  const inputStyle = { ...s, padding: '0.75rem 1rem', borderRadius: '0.75rem', width: '100%', fontSize: '1rem', color: '#1E1914', boxSizing: 'border-box' as const, fontFamily: "'Inter', sans-serif", outline: 'none' }
  const labelStyle = { display: 'block' as const, fontSize: '0.875rem', fontWeight: 500, color: '#1E1914', marginBottom: '0.375rem', fontFamily: "'Inter', sans-serif" }

  return (
    <div style={{ minHeight: '100vh', background: '#FAF8F3', padding: '1.5rem' }}>
      <style>{`
        .mbda-submit-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        @media (max-width: 640px) { .mbda-submit-row { grid-template-columns: 1fr; } }
      `}</style>
      <div style={{ maxWidth: '560px', margin: '0 auto' }}>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.75rem', fontWeight: 700, color: '#1E1914', marginBottom: '0.5rem' }}>
          Crear solicitud para vender
        </h1>

        {/* Tabs de productos */}
        {items.length > 1 && (
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            {items.map((it, i) => (
              <button
                key={i}
                onClick={() => { setCurrentItem(i); setStep(1) }}
                style={{
                  padding: '0.375rem 0.875rem', borderRadius: '0.75rem', fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer', border: 'none',
                  background: i === currentItem ? '#1E1914' : '#E8E3D5',
                  color: i === currentItem ? '#E8E3D5' : '#1E1914',
                  fontFamily: "'Inter', sans-serif",
                  transition: 'background 0.15s ease, color 0.15s ease',
                }}
              >
                {it.title || `Producto ${i + 1}`}
                {items.length > 1 && (
                  <span
                    onClick={e => { e.stopPropagation(); removeItem(i) }}
                    style={{ marginLeft: '0.375rem', opacity: 0.6 }}
                  >x</span>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Stepper */}
        <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '2rem', alignItems: 'flex-start' }}>
          {([1, 2, 3, 4] as Step[]).map((s, idx) => (
            <div key={s} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                {/* Connector line before */}
                {idx > 0 && (
                  <div style={{
                    flex: 1,
                    height: '2px',
                    background: s <= step ? '#1E1914' : '#E8E3D5',
                    transition: 'background 0.3s ease',
                  }} />
                )}
                {/* Step circle */}
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  fontFamily: "'Inter', sans-serif",
                  flexShrink: 0,
                  background: s === step ? '#1E1914' : s < step ? '#1E1914' : '#E8E3D5',
                  color: s <= step ? '#E8E3D5' : '#9ca3af',
                  boxShadow: s === step ? '0 0 0 3px rgba(30,25,20,0.15)' : 'none',
                  transition: 'background 0.3s ease, box-shadow 0.3s ease, color 0.3s ease',
                }}>
                  {s < step ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : s}
                </div>
                {/* Connector line after */}
                {idx < 3 && (
                  <div style={{
                    flex: 1,
                    height: '2px',
                    background: s < step ? '#1E1914' : '#E8E3D5',
                    transition: 'background 0.3s ease',
                  }} />
                )}
              </div>
              <div style={{
                fontSize: '0.65rem',
                color: s === step ? '#1E1914' : '#9ca3af',
                fontFamily: "'Inter', sans-serif",
                fontWeight: s === step ? 600 : 400,
                marginTop: '0.375rem',
                textAlign: 'center',
                transition: 'color 0.3s ease',
              }}>{STEP_LABELS[s]}</div>
            </div>
          ))}
        </div>

        {/* Step content with transition wrapper */}
        <div style={{ transition: 'opacity 0.2s ease', opacity: 1 }}>

        {/* Paso 1: Datos basicos */}
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={labelStyle}>Nombre del producto *</label>
              <input style={inputStyle} value={item.title} onChange={e => updateItem({ title: e.target.value })} placeholder="Ej: Campera de cuero negra" />
            </div>
            <div>
              <label style={labelStyle}>Descripcion (opcional)</label>
              <textarea
                style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
                value={item.description}
                onChange={e => updateItem({ description: e.target.value })}
                placeholder="Detalles adicionales..."
              />
            </div>
            <div className="mbda-submit-row">
              <div>
                <label style={labelStyle}>Tipo de producto *</label>
                <select style={inputStyle} value={item.productTypeId} onChange={e => handleProductTypeChange(e.target.value)}>
                  <option value="">Seleccionar...</option>
                  {productTypes.map(pt => <option key={pt.id} value={pt.id}>{pt.name}</option>)}
                </select>
              </div>
              {selectedProductType?.requiresSize && (selectedProductType.sizes?.length ?? 0) > 0 && (
                <div>
                  <label style={labelStyle}>Talle *</label>
                  <select style={inputStyle} value={item.sizeId ?? ''} onChange={e => updateItem({ sizeId: e.target.value || null })}>
                    <option value="">Seleccionar...</option>
                    {selectedProductType.sizes!.map(sz => <option key={sz.id} value={sz.id}>{sz.name}</option>)}
                  </select>
                </div>
              )}
            </div>
            {/* Tags */}
            {selectedProductType && (selectedProductType.tags?.length ?? 0) > 0 && (
              <div>
                <label style={labelStyle}>Etiquetas (opcional)</label>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {selectedProductType.tags!.map(tag => {
                    const selected = item.tagIds.includes(tag.id)
                    return (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => toggleTag(tag.id)}
                        style={{
                          padding: '0.375rem 0.875rem',
                          borderRadius: '999px',
                          fontSize: '0.85rem',
                          fontWeight: 500,
                          cursor: 'pointer',
                          border: selected ? '1px solid #1E1914' : '1px solid #E8E3D5',
                          background: selected ? '#1E1914' : '#fff',
                          color: selected ? '#E8E3D5' : '#1E1914',
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
            <div>
              <label style={labelStyle}>Cantidad</label>
              <input type="number" min={1} style={{ ...inputStyle, width: '120px' }} value={item.quantity} onChange={e => updateItem({ quantity: parseInt(e.target.value) || 1 })} />
            </div>
            <button
              onClick={() => setStep(2)}
              disabled={!item.title || !item.productTypeId}
              style={{
                background: '#1E1914', color: '#E8E3D5', padding: '0.875rem', borderRadius: '0.875rem',
                border: 'none', fontSize: '1rem', fontWeight: 600, fontFamily: "'Inter', sans-serif",
                cursor: item.title && item.productTypeId ? 'pointer' : 'not-allowed', opacity: item.title && item.productTypeId ? 1 : 0.5,
                transition: 'opacity 0.2s ease, transform 0.15s ease',
              }}
            >
              Siguiente
            </button>
          </div>
        )}

        {/* Paso 2: Condicion y precio */}
        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={labelStyle}>Condicion *</label>
              <select style={inputStyle} value={item.condition} onChange={e => updateItem({ condition: e.target.value as ItemCondition })}>
                {CONDITIONS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Precio de venta deseado (ARS) *</label>
              <input type="number" min={0} style={inputStyle} value={item.desiredPrice || ''} onChange={e => updateItem({ desiredPrice: parseFloat(e.target.value) || 0 })} placeholder="Ej: 5000" />
            </div>
            <div>
              <label style={labelStyle}>Precio minimo (opcional)</label>
              <p style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '0.5rem', fontFamily: "'Inter', sans-serif" }}>
                El precio minimo al que aceptarias venderla (para promociones). Solo lo ve el admin.
              </p>
              <input type="number" min={0} style={inputStyle} value={item.minimumPrice || ''} onChange={e => updateItem({ minimumPrice: parseFloat(e.target.value) || undefined })} placeholder="Ej: 3500" />
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={() => setStep(1)} style={{ flex: 1, padding: '0.875rem', borderRadius: '0.875rem', border: '1px solid #E8E3D5', background: '#fff', color: '#1E1914', fontSize: '1rem', cursor: 'pointer', fontFamily: "'Inter', sans-serif", transition: 'background 0.15s ease' }}>
                Anterior
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!item.desiredPrice}
                style={{ flex: 2, background: '#1E1914', color: '#E8E3D5', padding: '0.875rem', borderRadius: '0.875rem', border: 'none', fontSize: '1rem', fontWeight: 600, fontFamily: "'Inter', sans-serif", cursor: item.desiredPrice ? 'pointer' : 'not-allowed', opacity: item.desiredPrice ? 1 : 0.5, transition: 'opacity 0.2s ease' }}
              >
                Siguiente
              </button>
            </div>
          </div>
        )}

        {/* Paso 3: Fotos */}
        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={labelStyle}>Fotos (hasta 5) *</label>
              <p style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '0.75rem', fontFamily: "'Inter', sans-serif" }}>
                La primera foto sera la foto principal. Usa buena iluminacion natural.
              </p>

              {/* Preview fotos */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginBottom: '0.75rem' }}>
                {(photoPreviews[currentItem] ?? []).map((url, i) => (
                  <div key={i} style={{ position: 'relative', aspectRatio: '1', borderRadius: '0.75rem', overflow: 'hidden', background: '#E8E3D5' }}>
                    <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button
                      onClick={() => removePhoto(i)}
                      style={{ position: 'absolute', top: '0.25rem', right: '0.25rem', background: 'rgba(0,0,0,0.5)', color: '#fff', border: 'none', borderRadius: '50%', width: '22px', height: '22px', cursor: 'pointer', fontSize: '0.75rem' }}
                    >x</button>
                  </div>
                ))}
                {item.photos.length < 5 && (
                  <label style={{
                    aspectRatio: '1',
                    borderRadius: '0.75rem',
                    border: '2px dashed #d1cdc0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: '#9ca3af',
                    fontSize: '1.5rem',
                    background: '#fff',
                    transition: 'border-color 0.15s ease, background 0.15s ease',
                  }}>
                    +
                    <input type="file" accept="image/jpeg,image/png,image/webp" multiple style={{ display: 'none' }} onChange={e => handlePhotos(e.target.files)} />
                  </label>
                )}
              </div>
              {photoError && (
                <p style={{ fontSize: '0.8rem', color: '#dc2626', marginTop: '0.25rem', fontFamily: "'Inter', sans-serif" }}>{photoError}</p>
              )}
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={() => setStep(2)} style={{ flex: 1, padding: '0.875rem', borderRadius: '0.875rem', border: '1px solid #E8E3D5', background: '#fff', color: '#1E1914', fontSize: '1rem', cursor: 'pointer', fontFamily: "'Inter', sans-serif", transition: 'background 0.15s ease' }}>
                Anterior
              </button>
              <button
                onClick={() => setStep(4)}
                style={{ flex: 2, background: '#1E1914', color: '#E8E3D5', padding: '0.875rem', borderRadius: '0.875rem', border: 'none', fontSize: '1rem', fontWeight: 600, cursor: 'pointer', fontFamily: "'Inter', sans-serif", transition: 'transform 0.15s ease' }}
              >
                Siguiente
              </button>
            </div>
          </div>
        )}

        {/* Paso 4: Confirmacion + T&C */}
        {step === 4 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ background: '#E8E3D5', borderRadius: '1rem', padding: '1.25rem' }}>
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, color: '#1E1914', marginBottom: '0.75rem' }}>
                Resumen ({items.length} {items.length === 1 ? 'producto' : 'productos'})
              </h3>
              {items.map((it, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#1E1914', padding: '0.375rem 0', borderBottom: i < items.length - 1 ? '1px solid rgba(0,0,0,0.08)' : 'none', fontFamily: "'Inter', sans-serif" }}>
                  <span>{it.title || `Producto ${i + 1}`}</span>
                  <span style={{ fontWeight: 600 }}>${it.desiredPrice.toLocaleString('es-AR')}</span>
                </div>
              ))}
            </div>

            <button
              onClick={addItem}
              onMouseEnter={() => setAddBtnHover(true)}
              onMouseLeave={() => setAddBtnHover(false)}
              style={{
                padding: '0.875rem',
                borderRadius: '0.875rem',
                border: addBtnHover ? '2px solid #1E1914' : '2px dashed #d1cdc0',
                background: addBtnHover ? '#1E1914' : 'transparent',
                color: addBtnHover ? '#E8E3D5' : '#1E1914',
                fontSize: '0.95rem',
                cursor: 'pointer',
                fontWeight: 600,
                fontFamily: "'Inter', sans-serif",
                transition: 'all 0.2s ease',
              }}
            >
              + Agregar otro producto
            </button>

            <label style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={e => setTermsAccepted(e.target.checked)}
                style={{ marginTop: '0.125rem', width: '18px', height: '18px', cursor: 'pointer', flexShrink: 0, accentColor: '#1E1914' }}
              />
              <span style={{ fontSize: '0.875rem', color: '#4b5563', lineHeight: 1.5, fontFamily: "'Inter', sans-serif" }}>
                Lei y acepto los{' '}
                <a href="/terminos-y-condiciones" target="_blank" rel="noopener noreferrer" style={{ color: '#1E1914', fontWeight: 600, textDecoration: 'underline' }}>
                  Terminos y Condiciones
                </a>
                {' '}de consignacion de MBDA Modas.
              </span>
            </label>

            {error && (
              <p style={{ background: '#fee2e2', color: '#dc2626', padding: '0.75rem 1rem', borderRadius: '0.75rem', fontSize: '0.875rem', fontFamily: "'Inter', sans-serif" }}>
                {error}
              </p>
            )}

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={() => setStep(3)} style={{ flex: 1, padding: '0.875rem', borderRadius: '0.875rem', border: '1px solid #E8E3D5', background: '#fff', color: '#1E1914', fontSize: '1rem', cursor: 'pointer', fontFamily: "'Inter', sans-serif", transition: 'background 0.15s ease' }}>
                Anterior
              </button>
              <button
                onClick={handleSubmit}
                disabled={!termsAccepted || submitting}
                style={{
                  flex: 2, background: '#1E1914', color: '#E8E3D5', padding: '0.875rem', borderRadius: '0.875rem', border: 'none',
                  fontSize: '1rem', fontWeight: 600, fontFamily: "'Inter', sans-serif",
                  cursor: termsAccepted && !submitting ? 'pointer' : 'not-allowed',
                  opacity: termsAccepted && !submitting ? 1 : 0.5,
                  transition: 'opacity 0.2s ease',
                }}
              >
                {submitting ? 'Enviando...' : 'Enviar solicitud'}
              </button>
            </div>
          </div>
        )}

        </div>{/* end transition wrapper */}
      </div>
    </div>
  )
}
