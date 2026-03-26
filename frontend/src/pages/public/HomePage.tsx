import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ItemCard } from '../../components/catalog/ItemCard'
import { fetchItems } from '../../api/items'
import type { Item, ItemCategory, ItemSize } from '../../types'
import { CATEGORY_LABELS, SIZE_LABELS } from '../../types'

const CATEGORIES = Object.entries(CATEGORY_LABELS) as [ItemCategory, string][]
const SIZES = Object.entries(SIZE_LABELS) as [ItemSize, string][]

export function HomePage() {
  const [items, setItems] = useState<Item[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<ItemCategory | ''>('')
  const [size, setSize] = useState<ItemSize | ''>('')
  const [page, setPage] = useState(1)

  useEffect(() => {
    setLoading(true)
    fetchItems({
      search: search || undefined,
      category: category || undefined,
      size: size || undefined,
      page,
      limit: 12,
    })
      .then(r => { setItems(r.items); setTotal(r.total) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [search, category, size, page])

  function handleFilter(newSearch: string, newCategory: ItemCategory | '', newSize: ItemSize | '') {
    setSearch(newSearch)
    setCategory(newCategory)
    setSize(newSize)
    setPage(1)
  }

  const totalPages = Math.ceil(total / 12)

  return (
    <div style={{ minHeight: '100vh', background: '#FAF8F3' }}>
      {/* ── Banner dual: Compradores | Vendedores ─────────── */}
      <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: '320px' }}>
        {/* Panel comprador */}
        <div
          style={{
            background: '#E8E3D5',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '3rem 2rem',
            textAlign: 'center',
          }}
        >
          <p style={{ fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#6b7280', marginBottom: '0.75rem' }}>
            Para compradores
          </p>
          <h2
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: '2rem',
              fontWeight: 700,
              color: '#1E1914',
              lineHeight: 1.2,
              marginBottom: '1rem',
            }}
          >
            Prendas únicas a precios que sorprenden
          </h2>
          <p style={{ color: '#4b5563', marginBottom: '1.5rem', maxWidth: '280px' }}>
            Ropa con historia, cuidada y seleccionada. Encontrá tu próxima favorita.
          </p>
          <a href="#catalogo" style={{ background: '#1E1914', color: '#E8E3D5', padding: '0.75rem 1.5rem', borderRadius: '0.75rem', textDecoration: 'none', fontWeight: 600 }}>
            Ver catálogo
          </a>
        </div>

        {/* Panel vendedor */}
        <div
          style={{
            background: '#1E1914',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '3rem 2rem',
            textAlign: 'center',
          }}
        >
          <p style={{ fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#9ca3af', marginBottom: '0.75rem' }}>
            Para vendedores
          </p>
          <h2
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: '2rem',
              fontWeight: 700,
              color: '#E8E3D5',
              lineHeight: 1.2,
              marginBottom: '1rem',
            }}
          >
            Convertí tu ropa en dinero sin esfuerzo
          </h2>
          <p style={{ color: '#d1d5db', marginBottom: '1.5rem', maxWidth: '280px' }}>
            Nosotros la vendemos por vos. Sin capital inicial, sin complicaciones.
          </p>
          <Link
            to="/login"
            style={{ background: '#E8E3D5', color: '#1E1914', padding: '0.75rem 1.5rem', borderRadius: '0.75rem', textDecoration: 'none', fontWeight: 600 }}
          >
            Quiero vender mis prendas
          </Link>
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
          Catálogo
        </h2>

        {/* Filtros */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
          <input
            type="text"
            placeholder="Buscar..."
            value={search}
            onChange={e => handleFilter(e.target.value, category, size)}
            style={{
              padding: '0.625rem 1rem',
              borderRadius: '0.75rem',
              border: '1px solid #E8E3D5',
              background: '#fff',
              color: '#1E1914',
              fontSize: '0.9rem',
              minWidth: '200px',
            }}
          />
          <select
            value={category}
            onChange={e => handleFilter(search, e.target.value as ItemCategory | '', size)}
            style={{
              padding: '0.625rem 1rem',
              borderRadius: '0.75rem',
              border: '1px solid #E8E3D5',
              background: '#fff',
              color: '#1E1914',
              fontSize: '0.9rem',
            }}
          >
            <option value="">Todas las categorías</option>
            {CATEGORIES.map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
          <select
            value={size}
            onChange={e => handleFilter(search, category, e.target.value as ItemSize | '')}
            style={{
              padding: '0.625rem 1rem',
              borderRadius: '0.75rem',
              border: '1px solid #E8E3D5',
              background: '#fff',
              color: '#1E1914',
              fontSize: '0.9rem',
            }}
          >
            <option value="">Todos los talles</option>
            {SIZES.map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
        </div>

        {/* Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>Cargando...</div>
        ) : items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>
            No hay prendas disponibles en este momento.
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
              }}
            >
              ← Anterior
            </button>
            <span style={{ padding: '0.5rem 1rem', color: '#6b7280', fontSize: '0.9rem' }}>
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              style={{
                padding: '0.5rem 1rem', borderRadius: '0.75rem', border: '1px solid #E8E3D5',
                background: page === totalPages ? '#f3f4f6' : '#fff', cursor: page === totalPages ? 'not-allowed' : 'pointer',
                color: '#1E1914',
              }}
            >
              Siguiente →
            </button>
          </div>
        )}
      </section>
    </div>
  )
}
