import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { fetchCatalogShops } from '../../api/catalog'
import type { CatalogShop } from '../../types'

export function ShopsDirectoryPage() {
  const [shops, setShops] = useState<CatalogShop[]>([])
  const [filtered, setFiltered] = useState<CatalogShop[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchCatalogShops()
      .then(data => { setShops(data); setFiltered(data) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const q = search.toLowerCase().trim()
    setFiltered(q ? shops.filter(s => s.name.toLowerCase().includes(q)) : shops)
  }, [search, shops])

  return (
    <div style={{ minHeight: '100vh', background: '#FAF8F3' }}>
      {/* Hero */}
      <div style={{
        background: 'linear-gradient(160deg, #1E1914 0%, #2a2420 100%)',
        padding: '3rem 1.5rem 2.5rem',
        textAlign: 'center',
      }}>
        <p style={{ fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#9ca3af', marginBottom: '0.75rem' }}>
          Comunidad de vendedores
        </p>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(1.75rem, 5vw, 2.5rem)', fontWeight: 700, color: '#E8E3D5', marginBottom: '0.75rem', lineHeight: 1.2 }}>
          Mini-tiendas
        </h1>
        <p style={{ color: '#9ca3af', maxWidth: '480px', margin: '0 auto 2rem', fontSize: '0.95rem', lineHeight: 1.6 }}>
          Descubrí vendedores de la comunidad MBDA Market y encontrá productos únicos directamente de cada tienda.
        </p>

        {/* Buscador */}
        <div style={{ position: 'relative', maxWidth: '380px', margin: '0 auto' }}>
          <svg
            width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round"
            style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
          >
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Buscar tienda..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%',
              boxSizing: 'border-box',
              padding: '0.75rem 1rem 0.75rem 2.5rem',
              borderRadius: '0.75rem',
              border: '1px solid rgba(232,227,213,0.2)',
              background: 'rgba(255,255,255,0.08)',
              color: '#E8E3D5',
              fontSize: '0.95rem',
              outline: 'none',
              fontFamily: "'Inter', sans-serif",
            }}
          />
        </div>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2.5rem 1.5rem' }}>
        {loading ? (
          <ShopsGrid loading />
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 2rem', background: '#fff', borderRadius: '1.5rem', border: '1px solid #E8E3D5' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏪</div>
            <p style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.25rem', color: '#1E1914', marginBottom: '0.5rem' }}>
              {search ? 'No encontramos esa tienda' : 'Todavía no hay tiendas activas'}
            </p>
            <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>
              {search ? 'Probá con otro nombre.' : '¡Pronto habrá vendedores disponibles!'}
            </p>
          </div>
        ) : (
          <>
            <p style={{ fontSize: '0.85rem', color: '#9ca3af', marginBottom: '1.5rem' }}>
              {filtered.length} tienda{filtered.length !== 1 ? 's' : ''} activa{filtered.length !== 1 ? 's' : ''}
            </p>
            <ShopsGrid shops={filtered} />
          </>
        )}
      </div>
    </div>
  )
}

function ShopsGrid({ shops, loading }: { shops?: CatalogShop[]; loading?: boolean }) {
  if (loading) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.25rem' }}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} style={{ background: '#fff', border: '1px solid #E8E3D5', borderRadius: '1rem', overflow: 'hidden', height: '200px', animation: 'pulse 1.5s ease-in-out infinite' }}>
            <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}`}</style>
          </div>
        ))}
      </div>
    )
  }

  return (
    <>
      <style>{`
        .shops-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 1.25rem; }
      `}</style>
      <div className="shops-grid">
        {(shops ?? []).map(shop => <ShopCard key={shop.id} shop={shop} />)}
      </div>
    </>
  )
}

function ShopCard({ shop }: { shop: CatalogShop }) {
  const [hovered, setHovered] = useState(false)

  return (
    <Link
      to={`/tienda/${shop.slug}`}
      style={{ textDecoration: 'none' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{
        background: '#fff',
        border: `1px solid ${hovered ? '#1E1914' : '#E8E3D5'}`,
        borderRadius: '1rem',
        overflow: 'hidden',
        transition: 'border-color 0.2s, transform 0.2s, box-shadow 0.2s',
        transform: hovered ? 'translateY(-4px)' : 'none',
        boxShadow: hovered ? '0 8px 24px rgba(30,25,20,0.1)' : '0 1px 4px rgba(0,0,0,0.04)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '2rem 1.5rem',
        textAlign: 'center',
      }}>
        {/* Avatar */}
        {shop.profilePhotoUrl ? (
          <img
            src={shop.profilePhotoUrl}
            alt={shop.name}
            style={{ width: '72px', height: '72px', borderRadius: '50%', objectFit: 'cover', marginBottom: '1rem', border: '3px solid #E8E3D5' }}
          />
        ) : (
          <div style={{
            width: '72px', height: '72px', borderRadius: '50%',
            background: '#1E1914',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.75rem', fontWeight: 700, color: '#E8E3D5',
            marginBottom: '1rem',
          }}>
            {shop.name.charAt(0).toUpperCase()}
          </div>
        )}

        {/* Name */}
        <h3 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: '1.1rem',
          fontWeight: 700,
          color: '#1E1914',
          margin: '0 0 0.375rem',
          lineHeight: 1.3,
        }}>
          {shop.name}
        </h3>

        {/* Product count */}
        {shop._count && shop._count.products > 0 && (
          <span style={{ fontSize: '0.75rem', color: '#9ca3af', marginBottom: '0.5rem', fontFamily: "'Inter', sans-serif" }}>
            {shop._count.products} producto{shop._count.products !== 1 ? 's' : ''}
          </span>
        )}

        {/* Description */}
        {shop.description && (
          <p style={{
            fontSize: '0.8rem',
            color: '#6b7280',
            margin: '0 0 0.75rem',
            lineHeight: 1.5,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical' as any,
            overflow: 'hidden',
            fontFamily: "'Inter', sans-serif",
          }}>
            {shop.description}
          </p>
        )}

        {/* CTA */}
        <span style={{
          fontSize: '0.8rem',
          color: hovered ? '#1E1914' : '#9ca3af',
          fontFamily: "'Inter', sans-serif",
          transition: 'color 0.2s',
          marginTop: 'auto',
        }}>
          Ver productos →
        </span>
      </div>
    </Link>
  )
}
