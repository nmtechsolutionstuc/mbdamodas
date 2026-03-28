import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ItemCard } from '../../components/catalog/ItemCard'
import { ItemCardSkeleton } from '../../components/ui/Skeleton'
import { fetchItems } from '../../api/items'
import { useProductTypes } from '../../hooks/useProductTypes'
import type { Item } from '../../types'

export function HomePage() {
  const { productTypes } = useProductTypes()
  const [items, setItems] = useState<Item[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [productTypeId, setProductTypeId] = useState('')
  const [sizeId, setSizeId] = useState('')
  const [tagId, setTagId] = useState('')
  const [page, setPage] = useState(1)
  const [hoveredCta, setHoveredCta] = useState<string | null>(null)

  const selectedProductType = productTypes.find(pt => pt.id === productTypeId)

  useEffect(() => {
    setLoading(true)
    fetchItems({
      search: search || undefined,
      productTypeId: productTypeId || undefined,
      sizeId: sizeId || undefined,
      tagId: tagId || undefined,
      page,
      limit: 12,
    })
      .then(r => { setItems(r.items); setTotal(r.total) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [search, productTypeId, sizeId, tagId, page])

  function handleProductTypeChange(newId: string) {
    setProductTypeId(newId)
    setSizeId('')
    setTagId('')
    setPage(1)
  }

  const totalPages = Math.ceil(total / 12)

  return (
    <div style={{ minHeight: '100vh', background: '#FAF8F3' }}>
      {/* ── Banner dual: Compradores | Vendedores ─────────── */}
      <style>{`
        .mbda-banner { display: grid; grid-template-columns: 1fr 1fr; }
        @media (max-width: 640px) { .mbda-banner { grid-template-columns: 1fr; } }
      `}</style>
      <section className="mbda-banner" style={{ minHeight: '360px' }}>
        {/* Panel comprador */}
        <div
          style={{
            background: 'linear-gradient(160deg, #E8E3D5 0%, #d9d2c0 50%, #E8E3D5 100%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '3.5rem 2rem',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Subtle decorative circle */}
          <div style={{
            position: 'absolute',
            top: '-60px',
            right: '-60px',
            width: '200px',
            height: '200px',
            borderRadius: '50%',
            background: 'rgba(30, 25, 20, 0.03)',
          }} />
          <div style={{
            position: 'absolute',
            bottom: '-40px',
            left: '-40px',
            width: '150px',
            height: '150px',
            borderRadius: '50%',
            background: 'rgba(30, 25, 20, 0.03)',
          }} />
          <p style={{ fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#6b7280', marginBottom: '0.75rem', position: 'relative' }}>
            Para compradores
          </p>
          <h2
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: '2.25rem',
              fontWeight: 700,
              color: '#1E1914',
              lineHeight: 1.2,
              marginBottom: '1rem',
              position: 'relative',
            }}
          >
            Ropa nueva y con historia a precios que sorprenden
          </h2>
          <p style={{ color: '#4b5563', marginBottom: '2rem', maxWidth: '340px', lineHeight: 1.6, position: 'relative' }}>
            Encontrá productos nuevos de la tienda y ropa seleccionada en consignación. Calidad garantizada.
          </p>
          <a
            href="#catalogo"
            onMouseEnter={() => setHoveredCta('catalogo')}
            onMouseLeave={() => setHoveredCta(null)}
            style={{
              background: hoveredCta === 'catalogo' ? '#352e28' : '#1E1914',
              color: '#E8E3D5',
              padding: '0.875rem 2rem',
              borderRadius: '0.75rem',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '1rem',
              letterSpacing: '0.02em',
              transition: 'background 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease',
              transform: hoveredCta === 'catalogo' ? 'translateY(-2px)' : 'translateY(0)',
              boxShadow: hoveredCta === 'catalogo' ? '0 6px 20px rgba(30,25,20,0.3)' : '0 2px 8px rgba(30,25,20,0.15)',
              position: 'relative',
            }}
          >
            Ver catalogo
          </a>
        </div>

        {/* Panel vendedor / promotor */}
        <div
          style={{
            background: 'linear-gradient(160deg, #1E1914 0%, #2a2420 50%, #1E1914 100%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '3.5rem 2rem',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Subtle decorative circle */}
          <div style={{
            position: 'absolute',
            top: '-50px',
            left: '-50px',
            width: '180px',
            height: '180px',
            borderRadius: '50%',
            background: 'rgba(232, 227, 213, 0.04)',
          }} />
          <div style={{
            position: 'absolute',
            bottom: '-50px',
            right: '-50px',
            width: '160px',
            height: '160px',
            borderRadius: '50%',
            background: 'rgba(232, 227, 213, 0.04)',
          }} />
          <p style={{ fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#9ca3af', marginBottom: '0.75rem', position: 'relative' }}>
            Para vendedores y promotores
          </p>
          <h2
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: '2.25rem',
              fontWeight: 700,
              color: '#E8E3D5',
              lineHeight: 1.2,
              marginBottom: '1rem',
              position: 'relative',
            }}
          >
            Ganá dinero vendiendo nuestros productos
          </h2>
          <p style={{ color: '#d1d5db', marginBottom: '1.25rem', maxWidth: '340px', lineHeight: 1.6, position: 'relative' }}>
            Reservá un producto del catálogo, conseguí un comprador y ganá una comisión por cada venta. Sin capital inicial, sin riesgo.
          </p>
          <p style={{ color: '#d1d5db', marginBottom: '2rem', maxWidth: '340px', lineHeight: 1.6, position: 'relative', fontSize: '0.85rem', opacity: 0.8 }}>
            También podés dejar tu ropa en consignación y nosotros la vendemos por vos.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center', position: 'relative' }}>
            <a
              href="#catalogo"
              onMouseEnter={() => setHoveredCta('reservar')}
              onMouseLeave={() => setHoveredCta(null)}
              style={{
                background: hoveredCta === 'reservar' ? '#f5f0e6' : '#E8E3D5',
                color: '#1E1914',
                padding: '0.875rem 1.75rem',
                borderRadius: '0.75rem',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '0.95rem',
                letterSpacing: '0.02em',
                transition: 'background 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease',
                transform: hoveredCta === 'reservar' ? 'translateY(-2px)' : 'translateY(0)',
                boxShadow: hoveredCta === 'reservar' ? '0 6px 20px rgba(0,0,0,0.4)' : '0 2px 8px rgba(0,0,0,0.2)',
              }}
            >
              💰 Reservar y ganar
            </a>
            <Link
              to="/register"
              onMouseEnter={() => setHoveredCta('vender')}
              onMouseLeave={() => setHoveredCta(null)}
              style={{
                background: 'transparent',
                color: '#E8E3D5',
                padding: '0.875rem 1.75rem',
                borderRadius: '0.75rem',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '0.95rem',
                letterSpacing: '0.02em',
                border: '1px solid rgba(232, 227, 213, 0.3)',
                transition: 'background 0.2s ease, transform 0.2s ease',
                transform: hoveredCta === 'vender' ? 'translateY(-2px)' : 'translateY(0)',
              }}
            >
              Vender mi ropa
            </Link>
          </div>
        </div>
      </section>

      {/* ── Propuesta de valor ──────────────────────────── */}
      <style>{`
        .mbda-features { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; }
        @media (max-width: 768px) { .mbda-features { grid-template-columns: 1fr; } }
      `}</style>
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '3rem 1.5rem 0' }}>
        <div className="mbda-features">
          {[
            { emoji: '\uD83D\uDC57', title: 'Ropa nueva', desc: 'Productos nuevos propios de MBDA Modas, con las últimas tendencias.' },
            { emoji: '\u267B\uFE0F', title: 'Ropa en consignación', desc: 'Productos seleccionados y cuidados, a precios accesibles.' },
            { emoji: '\uD83D\uDCB0', title: 'Ganá vendiendo', desc: 'Reservá un producto, conseguí un comprador y llevate una comisión. Sin inversión.' },
          ].map((card) => (
            <div
              key={card.title}
              style={{
                background: '#fff',
                border: '1px solid #E8E3D5',
                borderRadius: '1rem',
                padding: '2rem 1.5rem',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>{card.emoji}</div>
              <h3 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: '1.15rem',
                fontWeight: 700,
                color: '#1E1914',
                marginBottom: '0.5rem',
              }}>
                {card.title}
              </h3>
              <p style={{
                color: '#4b5563',
                fontSize: '0.95rem',
                lineHeight: 1.6,
                margin: 0,
              }}>
                {card.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Catálogo ──────────────────────────────────────── */}
      <section id="catalogo" style={{ maxWidth: '1200px', margin: '0 auto', padding: '3rem 1.5rem' }}>
        <h2
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: '1.75rem',
            fontWeight: 700,
            color: '#1E1914',
            marginBottom: '1.5rem',
          }}
        >
          Catalogo
        </h2>

        {/* Filtros */}
        <div style={{
          display: 'flex',
          gap: '0.75rem',
          flexWrap: 'wrap',
          marginBottom: '2rem',
          alignItems: 'center',
          padding: '1rem 1.25rem',
          background: '#fff',
          borderRadius: '1rem',
          border: '1px solid #E8E3D5',
          boxShadow: '0 1px 4px rgba(30,25,20,0.04)',
        }}>
          <div style={{ position: 'relative', flex: '1 1 200px', minWidth: '180px' }}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#9ca3af"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }}
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Buscar productos..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
              style={{
                padding: '0.625rem 1rem 0.625rem 2.25rem',
                borderRadius: '0.5rem',
                border: '1px solid #E8E3D5',
                background: '#FAF8F3',
                color: '#1E1914',
                fontFamily: "'Inter', sans-serif",
                fontSize: '0.9rem',
                width: '100%',
                boxSizing: 'border-box',
                outline: 'none',
              }}
            />
          </div>
          <select
            value={productTypeId}
            onChange={e => handleProductTypeChange(e.target.value)}
            style={{
              padding: '0.625rem 1rem',
              borderRadius: '0.5rem',
              border: '1px solid #E8E3D5',
              background: '#FAF8F3',
              color: '#1E1914',
              fontFamily: "'Inter', sans-serif",
              fontSize: '0.9rem',
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            <option value="">Todas las categorias</option>
            {productTypes.map(pt => (
              <option key={pt.id} value={pt.id}>{pt.name}</option>
            ))}
          </select>
          {selectedProductType?.requiresSize && (selectedProductType.sizes?.length ?? 0) > 0 && (
            <select
              value={sizeId}
              onChange={e => { setSizeId(e.target.value); setPage(1) }}
              style={{
                padding: '0.625rem 1rem',
                borderRadius: '0.5rem',
                border: '1px solid #E8E3D5',
                background: '#FAF8F3',
                color: '#1E1914',
                fontFamily: "'Inter', sans-serif",
                fontSize: '0.9rem',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="">Todos los talles</option>
              {selectedProductType.sizes!.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          )}
          {selectedProductType && (selectedProductType.tags?.length ?? 0) > 0 && (
            <select
              value={tagId}
              onChange={e => { setTagId(e.target.value); setPage(1) }}
              style={{
                padding: '0.625rem 1rem',
                borderRadius: '0.5rem',
                border: '1px solid #E8E3D5',
                background: '#FAF8F3',
                color: '#1E1914',
                fontFamily: "'Inter', sans-serif",
                fontSize: '0.9rem',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="">Todas las etiquetas</option>
              {selectedProductType.tags!.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          )}
        </div>

        {/* Grid */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.25rem' }}>
            {Array.from({ length: 8 }).map((_, i) => <ItemCardSkeleton key={i} />)}
          </div>
        ) : items.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '4rem 2rem',
            background: '#fff',
            borderRadius: '1.5rem',
            border: '1px solid #E8E3D5',
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.7 }}>
              👗
            </div>
            <p style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: '1.25rem',
              fontWeight: 600,
              color: '#1E1914',
              marginBottom: '0.5rem',
            }}>
              Pronto tendremos productos increibles.
            </p>
            <p style={{
              color: '#6b7280',
              fontSize: '0.95rem',
              fontFamily: "'Inter', sans-serif",
            }}>
              Volve pronto!
            </p>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: '1.25rem',
            }}
          >
            {items.map(item => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        )}

        {/* Paginación */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '2rem' }}>
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              style={{
                padding: '0.5rem 1rem', borderRadius: '0.75rem', border: '1px solid #E8E3D5',
                background: page === 1 ? '#f3f4f6' : '#fff', cursor: page === 1 ? 'not-allowed' : 'pointer',
                color: '#1E1914',
                transition: 'background 0.15s ease',
              }}
            >
              Anterior
            </button>
            <span style={{ padding: '0.5rem 1rem', color: '#6b7280', fontSize: '0.9rem', display: 'flex', alignItems: 'center' }}>
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              style={{
                padding: '0.5rem 1rem', borderRadius: '0.75rem', border: '1px solid #E8E3D5',
                background: page === totalPages ? '#f3f4f6' : '#fff', cursor: page === totalPages ? 'not-allowed' : 'pointer',
                color: '#1E1914',
                transition: 'background 0.15s ease',
              }}
            >
              Siguiente
            </button>
          </div>
        )}
      </section>
    </div>
  )
}
