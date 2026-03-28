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
                {inp('Dirección', editing.address ?? '', v => setEditing(e => e && ({ ...e, address: v })))}
                {inp('Teléfono WhatsApp', editing.phone ?? '', v => setEditing(e => e && ({ ...e, phone: v })))}
                <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '-0.5rem' }}>
                  Formato sin + ni espacios: 5491112345678
                </p>
                {inp('Teléfono encargado tienda', editing.storeAttendantPhone ?? '', v => setEditing(e => e && ({ ...e, storeAttendantPhone: v })))}
                <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '-0.5rem' }}>
                  Teléfono del encargado para consultas de reservas (formato: 5491112345678)
                </p>
                {inp('Email', editing.email ?? '', v => setEditing(e => e && ({ ...e, email: v })))}
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                    Comisión por defecto (%)
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
                <div style={{ display: 'flex', gap: '0.625rem' }}>
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
                    Comisión: <strong>{store.defaultCommission}%</strong>
                    {' · '}
                    <span style={{ color: store.isActive ? '#16a34a' : '#dc2626' }}>
                      {store.isActive ? 'Activa' : 'Inactiva'}
                    </span>
                  </p>
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
