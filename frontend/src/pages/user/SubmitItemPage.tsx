import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createSubmission, type SubmissionItemFormData } from '../../api/submissions'
import type { ItemCategory, ItemCondition, ItemSize } from '../../types'
import { CATEGORY_LABELS, SIZE_LABELS, CONDITION_LABELS } from '../../types'

const CATEGORIES = Object.entries(CATEGORY_LABELS) as [ItemCategory, string][]
const SIZES = Object.entries(SIZE_LABELS) as [ItemSize, string][]
const CONDITIONS = Object.entries(CONDITION_LABELS) as [ItemCondition, string][]

const EMPTY_ITEM = (): SubmissionItemFormData => ({
  title: '',
  description: '',
  condition: 'BUEN_ESTADO',
  size: 'M',
  category: 'MUJER',
  quantity: 1,
  desiredPrice: 0,
  minimumPrice: undefined,
  photos: [],
})

type Step = 1 | 2 | 3 | 4

const STEP_LABELS: Record<Step, string> = {
  1: 'Datos de la prenda',
  2: 'Condición y precio',
  3: 'Fotos',
  4: 'Confirmación',
}

export function SubmitItemPage() {
  const navigate = useNavigate()
  const [items, setItems] = useState<SubmissionItemFormData[]>([EMPTY_ITEM()])
  const [currentItem, setCurrentItem] = useState(0)
  const [step, setStep] = useState<Step>(1)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [photoPreviews, setPhotoPreviews] = useState<string[][]>([[]])

  const item = items[currentItem]!

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

  function handlePhotos(files: FileList | null) {
    if (!files) return
    const newFiles = Array.from(files).slice(0, 5 - item.photos.length)
    const newPreviews = newFiles.map(f => URL.createObjectURL(f))
    updateItem({ photos: [...item.photos, ...newFiles] })
    setPhotoPreviews(prev => prev.map((p, i) => i === currentItem ? [...p, ...newPreviews] : p))
  }

  function removePhoto(photoIdx: number) {
    updateItem({ photos: item.photos.filter((_, i) => i !== photoIdx) })
    setPhotoPreviews(prev => prev.map((p, i) => i === currentItem ? p.filter((_, j) => j !== photoIdx) : p))
  }

  async function handleSubmit() {
    if (!termsAccepted) return
    setSubmitting(true)
    setError(null)
    try {
      await createSubmission(items)
      navigate('/dashboard/mis-solicitudes')
    } catch {
      setError('No se pudo enviar la solicitud. Verificá tu conexión e intentá de nuevo.')
    } finally {
      setSubmitting(false)
    }
  }

  const s = { background: '#fff', border: '1px solid #E8E3D5' }
  const inputStyle = { ...s, padding: '0.75rem 1rem', borderRadius: '0.75rem', width: '100%', fontSize: '1rem', color: '#1E1914', boxSizing: 'border-box' as const }
  const labelStyle = { display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#1E1914', marginBottom: '0.375rem' }

  return (
    <div style={{ minHeight: '100vh', background: '#FAF8F3', padding: '1.5rem' }}>
      <div style={{ maxWidth: '560px', margin: '0 auto' }}>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.75rem', fontWeight: 700, color: '#1E1914', marginBottom: '0.5rem' }}>
          Enviar prendas
        </h1>

        {/* Tabs de prendas */}
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
                }}
              >
                {it.title || `Prenda ${i + 1}`}
                {items.length > 1 && (
                  <span
                    onClick={e => { e.stopPropagation(); removeItem(i) }}
                    style={{ marginLeft: '0.375rem', opacity: 0.6 }}
                  >×</span>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Stepper */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
          {([1, 2, 3, 4] as Step[]).map(s => (
            <div key={s} style={{ flex: 1, textAlign: 'center' }}>
              <div style={{
                width: '28px', height: '28px', borderRadius: '50%', margin: '0 auto 0.25rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 600,
                background: s === step ? '#1E1914' : s < step ? '#16a34a' : '#E8E3D5',
                color: s <= step ? (s === step ? '#E8E3D5' : '#fff') : '#9ca3af',
              }}>
                {s < step ? '✓' : s}
              </div>
              <div style={{ fontSize: '0.7rem', color: s === step ? '#1E1914' : '#9ca3af' }}>{STEP_LABELS[s]}</div>
            </div>
          ))}
        </div>

        {/* Paso 1: Datos básicos */}
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={labelStyle}>Nombre de la prenda *</label>
              <input style={inputStyle} value={item.title} onChange={e => updateItem({ title: e.target.value })} placeholder="Ej: Campera de cuero negra" />
            </div>
            <div>
              <label style={labelStyle}>Descripción (opcional)</label>
              <textarea
                style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
                value={item.description}
                onChange={e => updateItem({ description: e.target.value })}
                placeholder="Detalles adicionales..."
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>Categoría *</label>
                <select style={inputStyle} value={item.category} onChange={e => updateItem({ category: e.target.value as ItemCategory })}>
                  {CATEGORIES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Talle *</label>
                <select style={inputStyle} value={item.size} onChange={e => updateItem({ size: e.target.value as ItemSize })}>
                  {SIZES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label style={labelStyle}>Cantidad</label>
              <input type="number" min={1} style={{ ...inputStyle, width: '120px' }} value={item.quantity} onChange={e => updateItem({ quantity: parseInt(e.target.value) || 1 })} />
            </div>
            <button
              onClick={() => setStep(2)}
              disabled={!item.title}
              style={{ background: '#1E1914', color: '#E8E3D5', padding: '0.875rem', borderRadius: '0.875rem', border: 'none', fontSize: '1rem', fontWeight: 600, cursor: item.title ? 'pointer' : 'not-allowed', opacity: item.title ? 1 : 0.5 }}
            >
              Siguiente →
            </button>
          </div>
        )}

        {/* Paso 2: Condición y precio */}
        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={labelStyle}>Condición *</label>
              <select style={inputStyle} value={item.condition} onChange={e => updateItem({ condition: e.target.value as ItemCondition })}>
                {CONDITIONS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Precio de venta deseado (ARS) *</label>
              <input type="number" min={0} style={inputStyle} value={item.desiredPrice || ''} onChange={e => updateItem({ desiredPrice: parseFloat(e.target.value) || 0 })} placeholder="Ej: 5000" />
            </div>
            <div>
              <label style={labelStyle}>Precio mínimo (opcional)</label>
              <p style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                El precio mínimo al que aceptarías venderla (para promociones). Solo lo ve el admin.
              </p>
              <input type="number" min={0} style={inputStyle} value={item.minimumPrice || ''} onChange={e => updateItem({ minimumPrice: parseFloat(e.target.value) || undefined })} placeholder="Ej: 3500" />
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={() => setStep(1)} style={{ flex: 1, padding: '0.875rem', borderRadius: '0.875rem', border: '1px solid #E8E3D5', background: '#fff', color: '#1E1914', fontSize: '1rem', cursor: 'pointer' }}>
                ← Anterior
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!item.desiredPrice}
                style={{ flex: 2, background: '#1E1914', color: '#E8E3D5', padding: '0.875rem', borderRadius: '0.875rem', border: 'none', fontSize: '1rem', fontWeight: 600, cursor: item.desiredPrice ? 'pointer' : 'not-allowed', opacity: item.desiredPrice ? 1 : 0.5 }}
              >
                Siguiente →
              </button>
            </div>
          </div>
        )}

        {/* Paso 3: Fotos */}
        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={labelStyle}>Fotos (hasta 5) *</label>
              <p style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '0.75rem' }}>
                La primera foto será la foto principal. Usá buena iluminación natural.
              </p>

              {/* Preview fotos */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginBottom: '0.75rem' }}>
                {(photoPreviews[currentItem] ?? []).map((url, i) => (
                  <div key={i} style={{ position: 'relative', aspectRatio: '1', borderRadius: '0.75rem', overflow: 'hidden', background: '#E8E3D5' }}>
                    <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button
                      onClick={() => removePhoto(i)}
                      style={{ position: 'absolute', top: '0.25rem', right: '0.25rem', background: 'rgba(0,0,0,0.5)', color: '#fff', border: 'none', borderRadius: '50%', width: '22px', height: '22px', cursor: 'pointer', fontSize: '0.75rem' }}
                    >×</button>
                  </div>
                ))}
                {item.photos.length < 5 && (
                  <label style={{ aspectRatio: '1', borderRadius: '0.75rem', border: '2px dashed #E8E3D5', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#9ca3af', fontSize: '1.5rem' }}>
                    +
                    <input type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={e => handlePhotos(e.target.files)} />
                  </label>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={() => setStep(2)} style={{ flex: 1, padding: '0.875rem', borderRadius: '0.875rem', border: '1px solid #E8E3D5', background: '#fff', color: '#1E1914', fontSize: '1rem', cursor: 'pointer' }}>
                ← Anterior
              </button>
              <button
                onClick={() => setStep(4)}
                style={{ flex: 2, background: '#1E1914', color: '#E8E3D5', padding: '0.875rem', borderRadius: '0.875rem', border: 'none', fontSize: '1rem', fontWeight: 600, cursor: 'pointer' }}
              >
                Siguiente →
              </button>
            </div>
          </div>
        )}

        {/* Paso 4: Confirmación + T&C */}
        {step === 4 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ background: '#E8E3D5', borderRadius: '1rem', padding: '1.25rem' }}>
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, color: '#1E1914', marginBottom: '0.75rem' }}>
                Resumen ({items.length} {items.length === 1 ? 'prenda' : 'prendas'})
              </h3>
              {items.map((it, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#1E1914', padding: '0.375rem 0', borderBottom: i < items.length - 1 ? '1px solid rgba(0,0,0,0.08)' : 'none' }}>
                  <span>{it.title || `Prenda ${i + 1}`}</span>
                  <span style={{ fontWeight: 600 }}>${it.desiredPrice.toLocaleString('es-AR')}</span>
                </div>
              ))}
            </div>

            <button
              onClick={addItem}
              style={{ padding: '0.75rem', borderRadius: '0.875rem', border: '2px dashed #E8E3D5', background: 'transparent', color: '#1E1914', fontSize: '0.9rem', cursor: 'pointer', fontWeight: 500 }}
            >
              + Agregar otra prenda
            </button>

            <label style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={e => setTermsAccepted(e.target.checked)}
                style={{ marginTop: '0.125rem', width: '18px', height: '18px', cursor: 'pointer', flexShrink: 0 }}
              />
              <span style={{ fontSize: '0.875rem', color: '#4b5563', lineHeight: 1.5 }}>
                Leí y acepto los{' '}
                <a href="/terminos-y-condiciones" target="_blank" rel="noopener noreferrer" style={{ color: '#1E1914', fontWeight: 600, textDecoration: 'underline' }}>
                  Términos y Condiciones
                </a>
                {' '}de consignación de MBDA Modas.
              </span>
            </label>

            {error && (
              <p style={{ background: '#fee2e2', color: '#dc2626', padding: '0.75rem 1rem', borderRadius: '0.75rem', fontSize: '0.875rem' }}>
                {error}
              </p>
            )}

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={() => setStep(3)} style={{ flex: 1, padding: '0.875rem', borderRadius: '0.875rem', border: '1px solid #E8E3D5', background: '#fff', color: '#1E1914', fontSize: '1rem', cursor: 'pointer' }}>
                ← Anterior
              </button>
              <button
                onClick={handleSubmit}
                disabled={!termsAccepted || submitting}
                style={{
                  flex: 2, background: '#1E1914', color: '#E8E3D5', padding: '0.875rem', borderRadius: '0.875rem', border: 'none',
                  fontSize: '1rem', fontWeight: 600,
                  cursor: termsAccepted && !submitting ? 'pointer' : 'not-allowed',
                  opacity: termsAccepted && !submitting ? 1 : 0.5,
                }}
              >
                {submitting ? 'Enviando...' : 'Enviar solicitud'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
