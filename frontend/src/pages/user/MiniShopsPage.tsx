import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { fetchMyShops } from '../../api/minishops'
import type { MiniShop } from '../../types'

export function MiniShopsPage() {
  const navigate = useNavigate()
  const [shops, setShops] = useState<MiniShop[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMyShops()
      .then(setShops)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: '#FAF8F3', padding: '1.5rem' }}>
      <div style={{ maxWidth: '560px', margin: '0 auto' }}>
        <Link to="/dashboard" style={{ color: '#6b7280', textDecoration: 'none', fontSize: '0.875rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', marginBottom: '1rem' }}>
          ← Volver al panel
        </Link>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.75rem', fontWeight: 700, color: '#1E1914', margin: 0 }}>
            Mis Tiendas
          </h1>
          <button
            onClick={() => navigate('/dashboard/tiendas/nueva')}
            style={{
              background: '#1E1914',
              color: '#FAF8F3',
              border: 'none',
              borderRadius: '0.75rem',
              padding: '0.625rem 1.25rem',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            + Crear tienda
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: '#9ca3af' }}>Cargando...</div>
        ) : shops.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', background: '#fff', borderRadius: '1rem', border: '1px solid #E8E3D5' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🏪</div>
            <p style={{ fontSize: '1rem', fontWeight: 600, color: '#1E1914', marginBottom: '0.5rem' }}>
              Todavia no tenes ninguna tienda
            </p>
            <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1.25rem' }}>
              Crea tu primera tienda y empeza a vender tus productos
            </p>
            <button
              onClick={() => navigate('/dashboard/tiendas/nueva')}
              style={{
                background: '#1E1914',
                color: '#FAF8F3',
                border: 'none',
                borderRadius: '0.75rem',
                padding: '0.75rem 1.5rem',
                fontSize: '0.9rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Crear mi primera tienda
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {shops.map(shop => (
              <div
                key={shop.id}
                onClick={() => navigate(`/dashboard/tiendas/${shop.id}`)}
                style={{
                  background: '#fff',
                  border: '1px solid #E8E3D5',
                  borderRadius: '1rem',
                  padding: '1.25rem',
                  display: 'flex',
                  gap: '1rem',
                  alignItems: 'center',
                  cursor: 'pointer',
                  transition: 'box-shadow 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.08)')}
                onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
              >
                {shop.profilePhotoUrl ? (
                  <img
                    src={shop.profilePhotoUrl}
                    alt={shop.name}
                    style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '50%', flexShrink: 0 }}
                  />
                ) : (
                  <div style={{ width: '60px', height: '60px', background: '#E8E3D5', borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', color: '#6b7280' }}>
                    🏪
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '1rem', fontWeight: 600, color: '#1E1914' }}>{shop.name}</div>
                  <div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '0.125rem' }}>
                    /{shop.slug} · {shop._count?.products ?? 0} producto{(shop._count?.products ?? 0) !== 1 ? 's' : ''}
                  </div>
                </div>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    padding: '0.25rem 0.625rem',
                    borderRadius: '2rem',
                    background: shop.status === 'ACTIVE' ? '#D1FAE5' : '#FEF3C7',
                    color: shop.status === 'ACTIVE' ? '#065F46' : '#92400E',
                    flexShrink: 0,
                  }}
                >
                  {shop.status === 'ACTIVE' ? 'Activa' : 'Pausada'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
