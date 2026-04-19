import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { createShop } from '../../api/minishops'

export function CreateMiniShopPage() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [instagram, setInstagram] = useState('')
  const [tiktok, setTiktok] = useState('')
  const [facebook, setFacebook] = useState('')
  const [otra, setOtra] = useState('')
  const [meetingPoint, setMeetingPoint] = useState(false)
  const [address, setAddress] = useState('')
  const [shipping, setShipping] = useState(false)
  const [otroDelivery, setOtroDelivery] = useState(false)
  const [otroDeliveryText, setOtroDeliveryText] = useState('')
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const deliveryValid = meetingPoint || shipping || otroDelivery

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !whatsapp.trim() || !deliveryValid || !acceptedTerms) return
    setSubmitting(true)
    setError(null)
    try {
      const shop = await createShop({
        name: name.trim(),
        description: description.trim() || undefined,
        whatsapp: whatsapp.trim(),
        socialLinks: {
          instagram: instagram.trim() || undefined,
          tiktok: tiktok.trim() || undefined,
          facebook: facebook.trim() || undefined,
          otra: otra.trim() || undefined,
        },
        deliveryMethods: {
          meetingPoint,
          address: address.trim() || undefined,
          shipping,
          otro: otroDelivery || undefined,
          otroText: otroDelivery ? otroDeliveryText.trim() || undefined : undefined,
        },
        acceptedTerms: true,
      })
      navigate(`/dashboard/tiendas/${shop.id}`)
    } catch (err: any) {
      setError(err.response?.data?.error?.message ?? 'Error al crear la tienda')
    } finally {
      setSubmitting(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.75rem',
    border: '1px solid #d1d5db',
    borderRadius: '0.75rem',
    fontSize: '0.9rem',
    background: '#fff',
    outline: 'none',
    boxSizing: 'border-box',
  }

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '0.85rem',
    fontWeight: 600,
    color: '#1E1914',
    marginBottom: '0.375rem',
  }

  return (
    <div style={{ minHeight: '100vh', background: '#FAF8F3', padding: '1.5rem' }}>
      <div style={{ maxWidth: '560px', margin: '0 auto' }}>
        <Link to="/dashboard/tiendas" style={{ color: '#6b7280', textDecoration: 'none', fontSize: '0.875rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', marginBottom: '1rem' }}>
          ← Volver a mis tiendas
        </Link>

        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.75rem', fontWeight: 700, color: '#1E1914', marginBottom: '1.5rem' }}>
          Crear nueva tienda
        </h1>

        <form onSubmit={handleSubmit}>
          <div style={{ background: '#fff', borderRadius: '1rem', border: '1px solid #E8E3D5', padding: '1.5rem', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 600, color: '#1E1914', marginBottom: '1rem', marginTop: 0 }}>Datos de la tienda</h2>

            <div style={{ marginBottom: '1rem' }}>
              <label style={labelStyle}>Nombre de la tienda *</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Ej: Mi Tienda de Ropa"
                maxLength={100}
                style={inputStyle}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={labelStyle}>Descripcion</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Conta un poco sobre tu tienda..."
                maxLength={500}
                rows={3}
                style={{ ...inputStyle, resize: 'vertical' }}
              />
              <div style={{ fontSize: '0.75rem', color: '#9ca3af', textAlign: 'right', marginTop: '0.25rem' }}>{description.length}/500</div>
            </div>

            <div style={{ marginBottom: '0' }}>
              <label style={labelStyle}>WhatsApp *</label>
              <input
                type="text"
                value={whatsapp}
                onChange={e => setWhatsapp(e.target.value)}
                placeholder="Ej: 5491112345678"
                maxLength={20}
                style={inputStyle}
              />
              <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.25rem' }}>Numero con codigo de pais, sin + ni espacios</div>
            </div>
          </div>

          <div style={{ background: '#fff', borderRadius: '1rem', border: '1px solid #E8E3D5', padding: '1.5rem', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 600, color: '#1E1914', marginBottom: '1rem', marginTop: 0 }}>Redes sociales (opcional)</h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={labelStyle}>Instagram</label>
                <input type="text" value={instagram} onChange={e => setInstagram(e.target.value)} placeholder="@mitienda" maxLength={200} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>TikTok</label>
                <input type="text" value={tiktok} onChange={e => setTiktok(e.target.value)} placeholder="@mitienda" maxLength={200} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Facebook</label>
                <input type="text" value={facebook} onChange={e => setFacebook(e.target.value)} placeholder="mitienda" maxLength={200} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Otra red</label>
                <input type="text" value={otra} onChange={e => setOtra(e.target.value)} placeholder="URL" maxLength={200} style={inputStyle} />
              </div>
            </div>
          </div>

          <div style={{ background: '#fff', borderRadius: '1rem', border: '1px solid #E8E3D5', padding: '1.5rem', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 600, color: '#1E1914', marginBottom: '1rem', marginTop: 0 }}>Metodos de entrega *</h2>
            <p style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '1rem', marginTop: 0 }}>Selecciona al menos un metodo de entrega</p>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={meetingPoint}
                onChange={e => setMeetingPoint(e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: '#1E1914' }}
              />
              <span style={{ fontSize: '0.9rem', color: '#1E1914' }}>Punto de encuentro</span>
            </label>

            {meetingPoint && (
              <div style={{ marginBottom: '0.75rem', paddingLeft: '1.75rem' }}>
                <input
                  type="text"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  placeholder="Direccion o zona de encuentro"
                  maxLength={300}
                  style={inputStyle}
                />
              </div>
            )}

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={shipping}
                onChange={e => setShipping(e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: '#1E1914' }}
              />
              <span style={{ fontSize: '0.9rem', color: '#1E1914' }}>Envios</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.75rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={otroDelivery}
                onChange={e => setOtroDelivery(e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: '#1E1914' }}
              />
              <span style={{ fontSize: '0.9rem', color: '#1E1914' }}>Otro</span>
            </label>

            {otroDelivery && (
              <div style={{ marginTop: '0.5rem', paddingLeft: '1.75rem' }}>
                <textarea
                  value={otroDeliveryText}
                  onChange={e => setOtroDeliveryText(e.target.value)}
                  placeholder="Describí el método de entrega..."
                  maxLength={300}
                  rows={2}
                  style={{ ...inputStyle, resize: 'vertical' }}
                />
              </div>
            )}
          </div>

          <div style={{ background: '#fff', borderRadius: '1rem', border: '1px solid #E8E3D5', padding: '1.5rem', marginBottom: '1.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={e => setAcceptedTerms(e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: '#1E1914', marginTop: '2px', flexShrink: 0 }}
              />
              <span style={{ fontSize: '0.85rem', color: '#374151' }}>
                Acepto los{' '}
                <a href="/terminos-y-condiciones" target="_blank" rel="noopener noreferrer" style={{ color: '#1E1914', fontWeight: 600 }}>
                  terminos y condiciones
                </a>{' '}
                de MBDA Market para tiendas
              </span>
            </label>
          </div>

          {error && (
            <div style={{ background: '#FEE2E2', color: '#991B1B', padding: '0.75rem 1rem', borderRadius: '0.75rem', fontSize: '0.85rem', marginBottom: '1rem' }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || !name.trim() || !whatsapp.trim() || !deliveryValid || !acceptedTerms}
            style={{
              width: '100%',
              padding: '0.875rem',
              background: submitting || !name.trim() || !whatsapp.trim() || !deliveryValid || !acceptedTerms ? '#d1d5db' : '#1E1914',
              color: '#FAF8F3',
              border: 'none',
              borderRadius: '0.75rem',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: submitting ? 'wait' : 'pointer',
            }}
          >
            {submitting ? 'Creando tienda...' : 'Crear tienda'}
          </button>
        </form>
      </div>
    </div>
  )
}
