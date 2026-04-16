import { useState, useEffect } from 'react'
import axiosClient from '../../api/axiosClient'
import { renderContent } from '../../utils/renderContent'

export function TermsPage() {
  const [content, setContent] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [storeEmail, setStoreEmail] = useState<string | null>(null)

  useEffect(() => {
    axiosClient.get('/terms-content')
      .then(r => setContent(r.data.data.content))
      .catch(() => {})
      .finally(() => setLoading(false))
    axiosClient.get('/store-info')
      .then(r => { if (r.data?.data?.store?.email) setStoreEmail(r.data.data.store.email) })
      .catch(() => {})
  }, [])

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#FAF8F3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#9ca3af' }}>Cargando...</p>
      </div>
    )
  }

  if (!content) {
    return (
      <div style={{ minHeight: '100vh', background: '#FAF8F3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#9ca3af' }}>Contenido no disponible.</p>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#FAF8F3', padding: '2rem 1.5rem' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '2rem', fontWeight: 700, color: '#1E1914', marginBottom: '0.5rem' }}>
          Terminos y Condiciones
        </h1>
        <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '2.5rem' }}>
          Contrato de consignacion mercantil — MBDA Modas, Concepcion, Tucuman, Argentina.
        </p>

        {renderContent(content)}

        {storeEmail && (
          <div style={{ marginTop: '3rem', padding: '1.25rem', background: '#E8E3D5', borderRadius: '1rem', fontSize: '0.875rem', color: '#6b7280' }}>
            Para consultas sobre estos terminos, contactanos en{' '}
            <a href={`mailto:${storeEmail}`} style={{ color: '#1E1914', fontWeight: 600 }}>
              {storeEmail}
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
