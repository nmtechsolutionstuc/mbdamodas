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

        {/* ── Sección: Mini-tiendas (MBDA Market) ────────────────── */}
        <div style={{ marginTop: '3rem', borderTop: '2px solid #E8E3D5', paddingTop: '2.5rem' }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.5rem', fontWeight: 700, color: '#1E1914', marginBottom: '0.5rem' }}>
            Mini-tiendas en MBDA Market
          </h2>
          <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '2rem' }}>
            Condiciones aplicables a vendedores independientes que publican en la plataforma.
          </p>

          {[
            {
              title: '¿Qué son las mini-tiendas?',
              body: 'Cualquier usuario registrado puede crear una mini-tienda dentro de MBDA Market para publicar y vender sus propios productos. La creación de la tienda es inmediata y no requiere aprobación previa, pero cada producto publicado debe ser revisado y aprobado por el equipo de MBDA antes de ser visible en el catálogo.',
            },
            {
              title: 'Productos y contenido',
              body: 'No se pueden publicar productos que compitan directamente con los artículos de MBDA Modas en precio o categoría, salvo autorización expresa. La plataforma se reserva el derecho de rechazar o eliminar productos sin necesidad de dar explicaciones, y de desactivar una tienda en cualquier momento si se detecta incumplimiento de estas condiciones.',
            },
            {
              title: 'Responsabilidad del vendedor',
              body: 'Cada mini-tienda es responsable de la veracidad de la información publicada (descripción, fotos, precio, stock), de la atención al comprador, y de la gestión de sus envíos o puntos de encuentro. MBDA Market no interviene en la transacción entre comprador y mini-tienda, ni garantiza la disponibilidad de los productos.',
            },
            {
              title: 'Gestión de la tienda',
              body: 'El administrador de MBDA Market puede pausar o eliminar una tienda en cualquier momento. Al eliminar una tienda, todos sus productos se eliminan automáticamente del catálogo. La vendedora recibirá una notificación por WhatsApp ante cualquier acción sobre sus productos (aprobación o rechazo).',
            },
            {
              title: 'Destacados',
              body: 'Los productos destacados aparecen en la sección principal del catálogo por un período determinado. Para solicitar que un producto sea destacado, el vendedor debe coordinar el pago directamente con MBDA a través de WhatsApp. La activación y el vencimiento del destacado son gestionados por el administrador.',
            },
            {
              title: 'Comisiones y pagos',
              body: 'Las mini-tiendas gestionan sus ventas de forma independiente. MBDA Market no retiene comisión sobre las ventas de mini-tiendas en esta etapa. Las condiciones pueden actualizarse en el futuro, con previo aviso a las vendedoras.',
            },
          ].map((section, i) => (
            <div key={i} style={{ marginBottom: '1.75rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1E1914', marginBottom: '0.5rem', fontFamily: "'Inter', sans-serif" }}>
                {section.title}
              </h3>
              <p style={{ fontSize: '0.875rem', color: '#4b5563', lineHeight: 1.7, margin: 0 }}>
                {section.body}
              </p>
            </div>
          ))}
        </div>

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
