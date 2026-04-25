import { useState, useEffect } from 'react'
import axiosClient from '../../api/axiosClient'
import { renderContent } from '../../utils/renderContent'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'

export function TermsPage() {
  const { isAdmin } = useAuth()
  const { toast } = useToast()
  const [content, setContent] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [storeEmail, setStoreEmail] = useState<string | null>(null)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    axiosClient.get('/terms-content')
      .then(r => setContent(r.data.data.content))
      .catch(() => {})
      .finally(() => setLoading(false))
    axiosClient.get('/store-info')
      .then(r => { if (r.data?.data?.store?.email) setStoreEmail(r.data.data.store.email) })
      .catch(() => {})
  }, [])

  async function handleSaveTerms() {
    setSaving(true)
    try {
      await axiosClient.patch('/admin/store-content', { termsContent: draft })
      setContent(draft)
      setEditing(false)
      toast('Contenido guardado', 'success')
    } catch {
      toast('No se pudo guardar', 'error')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#FAF8F3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#9ca3af' }}>Cargando...</p>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#FAF8F3', padding: '2rem 1.5rem' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '2rem', fontWeight: 700, color: '#1E1914', marginBottom: '0.5rem' }}>
          Términos y Condiciones
        </h1>
        <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
          MBDA Market — Plataforma de comercio colaborativo · Concepción, Tucumán, Argentina.
        </p>

        {/* ── Presentación de la plataforma ── */}
        <div style={{ background: '#fff', border: '1px solid #E8E3D5', borderRadius: '1rem', padding: '1.25rem 1.5rem', marginBottom: '2rem' }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.25rem', fontWeight: 700, color: '#1E1914', marginBottom: '0.75rem' }}>
            ¿Qué es MBDA Market?
          </h2>
          <p style={{ fontSize: '0.875rem', color: '#4b5563', lineHeight: 1.75, margin: '0 0 0.75rem' }}>
            <strong>MBDA Market</strong> es una plataforma de comercio colaborativo con sede en Concepción, Tucumán, Argentina. Reúne múltiples tiendas y vendedores independientes bajo un mismo catálogo digital, permitiendo a cualquier persona comprar, vender o actuar como promotora de ventas.
          </p>
          <p style={{ fontSize: '0.875rem', color: '#4b5563', lineHeight: 1.75, margin: 0 }}>
            Dentro de MBDA Market opera <strong>MBDA Modas</strong>, una tienda física especializada en ropa y accesorios ubicada en Calle España 1356, Concepción, Tucumán. Las condiciones de consignación y reservas descritas a continuación aplican específicamente a MBDA Modas. Las condiciones de mini-tiendas aplican a todos los vendedores independientes de la plataforma.
          </p>
        </div>

        {isAdmin && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
            <button
              onClick={() => { setDraft(content ?? ''); setEditing(true) }}
              style={{ padding: '0.5rem 1rem', borderRadius: '0.75rem', border: '1px solid #E8E3D5', background: '#fff', cursor: 'pointer', fontSize: '0.8rem', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '0.375rem' }}
            >
              ✏️ Editar contenido
            </button>
          </div>
        )}

        {isAdmin && editing && (
          <div style={{ background: '#fff', border: '1px solid #E8E3D5', borderRadius: '1rem', padding: '1.25rem', marginBottom: '2rem' }}>
            <p style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '0.75rem' }}>
              Usá <strong>##</strong> para títulos, <strong>###</strong> para subtítulos. Separá secciones con línea en blanco.
            </p>
            <textarea
              value={draft}
              onChange={e => setDraft(e.target.value)}
              rows={20}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '0.625rem', border: '1px solid #E8E3D5', fontSize: '0.875rem', fontFamily: 'monospace', boxSizing: 'border-box', resize: 'vertical' }}
            />
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.75rem', justifyContent: 'flex-end' }}>
              <button onClick={() => setEditing(false)} style={{ padding: '0.5rem 1rem', borderRadius: '0.75rem', border: '1px solid #E8E3D5', background: '#fff', cursor: 'pointer', fontSize: '0.875rem' }}>
                Cancelar
              </button>
              <button
                onClick={handleSaveTerms}
                disabled={saving}
                style={{ padding: '0.5rem 1.25rem', borderRadius: '0.75rem', border: 'none', background: '#1E1914', color: '#E8E3D5', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' }}
              >
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        )}

        {/* ── Contrato de consignación: MBDA Modas ── */}
        <div style={{ borderTop: '2px solid #E8E3D5', paddingTop: '2.5rem', marginBottom: '0.5rem' }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.5rem', fontWeight: 700, color: '#1E1914', marginBottom: '0.5rem' }}>
            Contrato de Consignación — MBDA Modas
          </h2>
          <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1.75rem' }}>
            Condiciones para vendedores que entregan mercadería en consignación a la tienda física MBDA Modas.
          </p>
        </div>
        {content ? (
          renderContent(content)
        ) : (
          <p style={{ color: '#9ca3af', fontSize: '0.875rem', fontStyle: 'italic' }}>
            El administrador aún no ha cargado el contrato de consignación. Contactanos para más información.
          </p>
        )}

        {/* ── Sección: Reservas para promotores (MBDA Modas) ────────────── */}
        <div style={{ marginTop: '3rem', borderTop: '2px solid #E8E3D5', paddingTop: '2.5rem' }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.5rem', fontWeight: 700, color: '#1E1914', marginBottom: '0.5rem' }}>
            Sistema de Reservas para Promotores — MBDA Modas
          </h2>
          <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '2rem' }}>
            Condiciones aplicables a usuarios que reservan productos propios de MBDA Modas para venderlos y cobrar una comisión.
          </p>

          {[
            {
              title: '¿Qué es el sistema de reservas?',
              body: 'Cualquier usuario registrado en MBDA Market puede reservar un producto propio de la tienda MBDA Modas para conseguir un comprador y recibir una comisión por la venta. El porcentaje de comisión es informado al momento de la reserva y varía según el producto.',
            },
            {
              title: 'Requisitos para reservar',
              body: 'Para poder crear una reserva es obligatorio tener cargado el número de DNI y el número de WhatsApp en el perfil. Sin estos datos no es posible operar como promotor/a.',
            },
            {
              title: 'Vigencia de la reserva',
              body: 'Una vez aprobada por el equipo de MBDA Modas, la reserva tiene una vigencia de 24 horas. Si por razones excepcionales la tienda no puede recibir al comprador dentro de ese plazo, el administrador puede extender la vigencia. Las extensiones no tienen límite de cantidad.',
            },
            {
              title: 'Proceso de venta',
              body: 'Al ser aprobada la reserva, MBDA Market genera un comprobante digital accesible en el sitio. El/la promotor/a debe compartir ese comprobante con su comprador, quien deberá presentarlo al llegar a la tienda. La venta se concreta únicamente cuando el comprador asiste físicamente a MBDA Modas.',
            },
            {
              title: 'Comisión',
              body: 'La comisión se acredita exclusivamente si la venta se concreta dentro del plazo de vigencia de la reserva. El porcentaje es informado antes de confirmar la reserva y solo puede cambiar si se negocia previamente con el administrador. El pago se realiza en efectivo o por transferencia bancaria según el método que tenga registrado el/la promotor/a en su perfil.',
            },
            {
              title: 'Responsabilidad del promotor',
              body: 'El/la promotor/a es responsable de informar correctamente al comprador el precio, las condiciones y la ubicación de la tienda. MBDA Market y MBDA Modas no se hacen responsables de acuerdos privados entre el/la promotor/a y el comprador que difieran de lo publicado en el catálogo.',
            },
            {
              title: 'Cancelación',
              body: 'El/la promotor/a puede cancelar una reserva mientras esté en estado "Pendiente de aprobación". Una vez aprobada, solo el equipo de MBDA Modas puede cancelarla. La cancelación libera el stock del producto para nuevas reservas.',
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

        {/* ── Sección: Mini-tiendas (MBDA Market) ────────────────── */}
        <div style={{ marginTop: '3rem', borderTop: '2px solid #E8E3D5', paddingTop: '2.5rem' }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.5rem', fontWeight: 700, color: '#1E1914', marginBottom: '0.5rem' }}>
            Mini-tiendas en MBDA Market
          </h2>
          <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '2rem' }}>
            Condiciones aplicables a vendedores independientes que publican sus propios productos en la plataforma MBDA Market.
          </p>

          {[
            {
              title: '¿Qué son las mini-tiendas?',
              body: 'Cualquier usuario registrado en MBDA Market puede crear su propia mini-tienda para publicar y vender sus productos dentro de la plataforma. La creación de la tienda es inmediata y no requiere aprobación previa; sin embargo, cada producto publicado es revisado y aprobado por el equipo de MBDA Market antes de aparecer en el catálogo.',
            },
            {
              title: 'Productos y contenido',
              body: 'El/la vendedor/a es responsable de que los productos publicados sean legales, de su propiedad y estén correctamente descritos. MBDA Market se reserva el derecho de rechazar o eliminar productos que incumplan estas condiciones, violen derechos de terceros o resulten inapropiados, sin necesidad de dar explicaciones adicionales.',
            },
            {
              title: 'Responsabilidad del vendedor',
              body: 'Cada mini-tienda es responsable de la veracidad de la información publicada (descripción, fotos, precio, stock), de la atención al comprador y de la gestión de sus entregas o puntos de encuentro. MBDA Market actúa como plataforma y no interviene en la transacción entre comprador y mini-tienda, ni garantiza la disponibilidad de los productos.',
            },
            {
              title: 'Gestión y moderación',
              body: 'El equipo administrador de MBDA Market puede pausar o eliminar una tienda en cualquier momento si detecta incumplimiento de estas condiciones. Al desactivar una tienda, todos sus productos se ocultan automáticamente del catálogo. El/la vendedor/a recibirá una notificación por WhatsApp ante cualquier acción sobre sus productos.',
            },
            {
              title: 'Destacados',
              body: 'Los productos destacados aparecen en la sección principal del catálogo durante un período determinado. Para solicitar que un producto sea destacado, el/la vendedor/a debe coordinarlo directamente con el equipo de MBDA Market a través de WhatsApp. La activación y el vencimiento del destacado son gestionados por el administrador.',
            },
            {
              title: 'Comisiones y pagos',
              body: 'En la etapa actual, MBDA Market no retiene comisión sobre las ventas realizadas a través de mini-tiendas. Las condiciones comerciales pueden actualizarse en el futuro, con previo aviso a los/las vendedores/as.',
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
            Para consultas sobre estos términos y condiciones, contactanos en{' '}
            <a href={`mailto:${storeEmail}`} style={{ color: '#1E1914', fontWeight: 600 }}>
              {storeEmail}
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
