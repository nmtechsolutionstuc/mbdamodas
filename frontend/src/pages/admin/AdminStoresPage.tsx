import { useState, useEffect } from 'react'
import axiosClient from '../../api/axiosClient'
import { useToast } from '../../context/ToastContext'

interface Store {
  id: string
  name: string
  address: string | null
  phone: string | null
  email: string | null
  defaultCommission: number
  isActive: boolean
  storeAttendantPhone: string | null
  announcementText: string | null
  announcementActive: boolean
  bannerBuyerSubtitle: string | null
  bannerBuyerTitle: string | null
  bannerBuyerDescription: string | null
  bannerSellerSubtitle: string | null
  bannerSellerTitle: string | null
  bannerSellerDescription: string | null
  aboutContent: string | null
  termsContent: string | null
}

export function AdminStoresPage() {
  const { toast } = useToast()
  const [stores, setStores] = useState<Store[]>([])
  const [editing, setEditing] = useState<Store | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    axiosClient.get('/admin/stores')
      .then(r => setStores(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  function startEdit(store: Store) {
    setEditing({ ...store })
    setSaved(false)
  }

  async function handleSave() {
    if (!editing) return
    setSaving(true)
    try {
      const { data } = await axiosClient.patch(`/admin/stores/${editing.id}`, {
        name: editing.name,
        address: editing.address,
        phone: editing.phone,
        email: editing.email,
        defaultCommission: Number(editing.defaultCommission),
        isActive: editing.isActive,
        storeAttendantPhone: editing.storeAttendantPhone,
        announcementText: editing.announcementText,
        announcementActive: editing.announcementActive,
        bannerBuyerSubtitle: editing.bannerBuyerSubtitle,
        bannerBuyerTitle: editing.bannerBuyerTitle,
        bannerBuyerDescription: editing.bannerBuyerDescription,
        bannerSellerSubtitle: editing.bannerSellerSubtitle,
        bannerSellerTitle: editing.bannerSellerTitle,
        bannerSellerDescription: editing.bannerSellerDescription,
        aboutContent: editing.aboutContent,
        termsContent: editing.termsContent,
      })
      setStores(prev => prev.map(s => s.id === editing.id ? data.data : s))
      setEditing(null)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch {
      toast('No se pudo guardar', 'error')
    } finally {
      setSaving(false)
    }
  }

  const inp = (label: string, value: string | number, onChange: (v: string) => void, type = 'text') => (
    <div>
      <label style={{ display: 'block', fontSize: '0.8rem', color: '#6b7280', marginBottom: '0.25rem' }}>{label}</label>
      <input
        type={type}
        value={value ?? ''}
        onChange={e => onChange(e.target.value)}
        style={{ width: '100%', padding: '0.625rem', borderRadius: '0.625rem', border: '1px solid #E8E3D5', fontSize: '0.9rem', color: '#1E1914', boxSizing: 'border-box' as const }}
      />
    </div>
  )

  const txtArea = (label: string, value: string, onChange: (v: string) => void, rows = 2) => (
    <div>
      <label style={{ display: 'block', fontSize: '0.8rem', color: '#6b7280', marginBottom: '0.25rem' }}>{label}</label>
      <textarea
        value={value ?? ''}
        onChange={e => onChange(e.target.value)}
        rows={rows}
        style={{ width: '100%', padding: '0.625rem', borderRadius: '0.625rem', border: '1px solid #E8E3D5', fontSize: '0.9rem', color: '#1E1914', boxSizing: 'border-box' as const, resize: 'vertical', fontFamily: "'Inter', sans-serif" }}
      />
    </div>
  )

  const sectionTitle = (text: string) => (
    <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1E1914', marginTop: '0.5rem', marginBottom: '0.25rem', borderTop: '1px solid #E8E3D5', paddingTop: '0.75rem' }}>
      {text}
    </p>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#FAF8F3', padding: '1.5rem' }}>
      <div style={{ maxWidth: '700px', margin: '0 auto' }}>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.75rem', fontWeight: 700, color: '#1E1914', marginBottom: '1.5rem' }}>
          Tiendas
        </h1>

        {saved && (
          <div style={{ background: '#dcfce7', color: '#166534', padding: '0.75rem 1rem', borderRadius: '0.75rem', marginBottom: '1rem', fontSize: '0.875rem' }}>
            ✓ Cambios guardados
          </div>
        )}

        {loading ? (
          <p style={{ color: '#9ca3af' }}>Cargando...</p>
        ) : stores.map(store => (
          <div key={store.id} style={{ background: '#fff', border: '1px solid #E8E3D5', borderRadius: '1rem', padding: '1.25rem', marginBottom: '1rem' }}>
            {editing?.id === store.id ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                {inp('Nombre', editing.name, v => setEditing(e => e && ({ ...e, name: v })))}
                {inp('Direccion', editing.address ?? '', v => setEditing(e => e && ({ ...e, address: v })))}
                {inp('Telefono WhatsApp', editing.phone ?? '', v => setEditing(e => e && ({ ...e, phone: v })))}
                <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '-0.5rem' }}>
                  Formato sin + ni espacios: 5491112345678
                </p>
                {inp('Telefono encargado tienda', editing.storeAttendantPhone ?? '', v => setEditing(e => e && ({ ...e, storeAttendantPhone: v })))}
                <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '-0.5rem' }}>
                  Telefono del encargado para consultas de reservas (formato: 5491112345678)
                </p>
                {inp('Email', editing.email ?? '', v => setEditing(e => e && ({ ...e, email: v })))}
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                    Comision por defecto (%)
                  </label>
                  <input
                    type="number" min={0} max={100}
                    value={editing.defaultCommission}
                    onChange={e => setEditing(prev => prev && ({ ...prev, defaultCommission: parseFloat(e.target.value) }))}
                    style={{ width: '120px', padding: '0.625rem', borderRadius: '0.625rem', border: '1px solid #E8E3D5', fontSize: '0.9rem' }}
                  />
                </div>
                <label style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', cursor: 'pointer', fontSize: '0.875rem', color: '#1E1914' }}>
                  <input type="checkbox" checked={editing.isActive} onChange={e => setEditing(prev => prev && ({ ...prev, isActive: e.target.checked }))} />
                  Tienda activa
                </label>

                {/* ── Barra de anuncios ── */}
                {sectionTitle('Barra de anuncios (debajo del menu)')}
                {inp('Texto del anuncio', editing.announcementText ?? '', v => setEditing(e => e && ({ ...e, announcementText: v })))}
                <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '-0.5rem' }}>
                  Ej: "Solo por este mes gana un 15% en comisiones"
                </p>
                <label style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', cursor: 'pointer', fontSize: '0.875rem', color: '#1E1914' }}>
                  <input type="checkbox" checked={editing.announcementActive} onChange={e => setEditing(prev => prev && ({ ...prev, announcementActive: e.target.checked }))} />
                  Mostrar barra de anuncios
                </label>

                {/* ── Banner compradores (homepage) ── */}
                {sectionTitle('Banner compradores (homepage - panel izquierdo)')}
                {inp('Subtitulo', editing.bannerBuyerSubtitle ?? '', v => setEditing(e => e && ({ ...e, bannerBuyerSubtitle: v })))}
                <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '-0.5rem' }}>
                  Ej: "Para compradores"
                </p>
                {inp('Titulo', editing.bannerBuyerTitle ?? '', v => setEditing(e => e && ({ ...e, bannerBuyerTitle: v })))}
                <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '-0.5rem' }}>
                  Ej: "Ropa nueva y con historia a precios que sorprenden"
                </p>
                {txtArea('Descripcion', editing.bannerBuyerDescription ?? '', v => setEditing(e => e && ({ ...e, bannerBuyerDescription: v })))}

                {/* ── Banner vendedores/promotores (homepage) ── */}
                {sectionTitle('Banner vendedores/promotores (homepage - panel derecho)')}
                {inp('Subtitulo', editing.bannerSellerSubtitle ?? '', v => setEditing(e => e && ({ ...e, bannerSellerSubtitle: v })))}
                <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '-0.5rem' }}>
                  Ej: "Para vendedores y promotores"
                </p>
                {inp('Titulo', editing.bannerSellerTitle ?? '', v => setEditing(e => e && ({ ...e, bannerSellerTitle: v })))}
                <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '-0.5rem' }}>
                  Ej: "Gana dinero vendiendo nuestros productos"
                </p>
                {txtArea('Descripcion', editing.bannerSellerDescription ?? '', v => setEditing(e => e && ({ ...e, bannerSellerDescription: v })))}

                {/* ── Pagina Nosotros ── */}
                {sectionTitle('Pagina "Nosotros"')}
                <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '-0.25rem' }}>
                  Usa ## para titulos, ### para subtitulos, y texto normal para parrafos. Separa secciones con una linea en blanco.
                </p>
                {txtArea('Contenido de la pagina Nosotros', editing.aboutContent ?? '', v => setEditing(e => e && ({ ...e, aboutContent: v })), 10)}

                {/* ── Pagina Terminos y Condiciones ── */}
                {sectionTitle('Pagina "Terminos y Condiciones"')}
                <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '-0.25rem' }}>
                  Usa ## para titulos de articulos, ### para subtitulos, --- para separadores. Cada articulo en un parrafo separado.
                </p>
                {txtArea('Contenido de Terminos y Condiciones', editing.termsContent ?? '', v => setEditing(e => e && ({ ...e, termsContent: v })), 10)}

                <div style={{ display: 'flex', gap: '0.625rem', marginTop: '0.5rem' }}>
                  <button onClick={() => setEditing(null)} style={{ flex: 1, padding: '0.625rem', borderRadius: '0.75rem', border: '1px solid #E8E3D5', background: '#fff', cursor: 'pointer', fontSize: '0.875rem' }}>
                    Cancelar
                  </button>
                  <button onClick={handleSave} disabled={saving} style={{ flex: 2, padding: '0.625rem', borderRadius: '0.75rem', border: 'none', background: '#1E1914', color: '#E8E3D5', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' }}>
                    {saving ? 'Guardando...' : 'Guardar cambios'}
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <p style={{ fontWeight: 700, color: '#1E1914', marginBottom: '0.25rem' }}>{store.name}</p>
                  {store.phone && <p style={{ fontSize: '0.8rem', color: '#6b7280' }}>📱 {store.phone}</p>}
                  {store.address && <p style={{ fontSize: '0.8rem', color: '#6b7280' }}>📍 {store.address}</p>}
                  <p style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '0.25rem' }}>
                    Comision: <strong>{store.defaultCommission}%</strong>
                    {' · '}
                    <span style={{ color: store.isActive ? '#16a34a' : '#dc2626' }}>
                      {store.isActive ? 'Activa' : 'Inactiva'}
                    </span>
                  </p>
                  {store.announcementActive && store.announcementText && (
                    <p style={{ fontSize: '0.8rem', color: '#dc2626', marginTop: '0.25rem' }}>
                      📢 {store.announcementText}
                    </p>
                  )}
                </div>
                <button onClick={() => startEdit(store)} style={{ padding: '0.5rem 1rem', borderRadius: '0.75rem', border: '1px solid #E8E3D5', background: '#fff', cursor: 'pointer', fontSize: '0.875rem', color: '#1E1914' }}>
                  Editar
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
