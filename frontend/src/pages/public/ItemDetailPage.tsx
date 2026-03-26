import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { fetchItemById } from '../../api/items'
import type { Item } from '../../types'
import { SIZE_LABELS, CATEGORY_LABELS, CONDITION_LABELS } from '../../types'

function buildWhatsAppLink(phone: string, item: Item): string {
  const msg = `Hola MBDA Modas! Me interesa la prenda "${item.title}" (Talle ${SIZE_LABELS[item.size]} · $${Number(item.price).toLocaleString('es-AR')}). ¿Está disponible? La vi en el catálogo online.`
  return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`
}

export function ItemDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [item, setItem] = useState<Item | null>(null)
  const [loading, setLoading] = useState(true)
  const [photoIndex, setPhotoIndex] = useState(0)

  useEffect(() => {
    if (!id) return
    fetchItemById(id)
      .then(setItem)
      .catch(() => setItem(null))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#FAF8F3' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem 1.5rem' }}>
          <div style={{ height: '1rem', width: '120px', background: '#E8E3D5', borderRadius: '0.5rem', marginBottom: '1.5rem' }} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
            <div style={{ borderRadius: '1rem', background: '#E8E3D5', aspectRatio: '3/4' }} className="mbda-shimmer" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', paddingTop: '0.5rem' }}>
              <div style={{ height: '0.75rem', width: '80px', background: '#E8E3D5', borderRadius: '0.5rem' }} className="mbda-shimmer" />
              <div style={{ height: '1.75rem', width: '75%', background: '#E8E3D5', borderRadius: '0.5rem' }} className="mbda-shimmer" />
              <div style={{ height: '1.75rem', width: '40%', background: '#E8E3D5', borderRadius: '0.5rem' }} className="mbda-shimmer" />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.5rem' }}>
                {[1,2].map(i => <div key={i} style={{ height: '2rem', background: '#E8E3D5', borderRadius: '0.5rem' }} className="mbda-shimmer" />)}
              </div>
              <div style={{ height: '3rem', width: '100%', background: '#E8E3D5', borderRadius: '0.875rem', marginTop: '1rem' }} className="mbda-shimmer" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!item) {
    return (
      <div style={{ minHeight: '100vh', background: '#FAF8F3', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
        <p style={{ color: '#6b7280' }}>Prenda no encontrada.</p>
        <Link to="/" style={{ color: '#1E1914', fontWeight: 600 }}>← Volver al catálogo</Link>
      </div>
    )
  }

  const storePhone = item.store?.phone

  return (
    <div style={{ minHeight: '100vh', background: '#FAF8F3' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        <Link to="/" style={{ color: '#6b7280', textDecoration: 'none', fontSize: '0.9rem', display: 'inline-block', marginBottom: '1.5rem' }}>
          ← Volver al catálogo
        </Link>

        <style>{`
          .mbda-detail { display: grid; grid-template-columns: 1fr 1fr; gap: 3rem; }
          @media (max-width: 640px) { .mbda-detail { grid-template-columns: 1fr; gap: 1.5rem; } }
        `}</style>
        <div className="mbda-detail">
          {/* Fotos */}
          <div>
            <div style={{ borderRadius: '1rem', overflow: 'hidden', background: '#E8E3D5', aspectRatio: '3/4', marginBottom: '0.75rem' }}>
              {item.photos[photoIndex] ? (
                <img
                  src={item.photos[photoIndex]!.url}
                  alt={item.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>
                  Sin foto
                </div>
              )}
            </div>
            {item.photos.length > 1 && (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {item.photos.map((p, i) => (
                  <button
                    key={p.id}
                    onClick={() => setPhotoIndex(i)}
                    style={{
                      width: '60px', height: '60px', borderRadius: '0.5rem', overflow: 'hidden', padding: 0, border: i === photoIndex ? '2px solid #1E1914' : '2px solid transparent', cursor: 'pointer',
                    }}
                  >
                    <img src={p.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            <p style={{ fontSize: '0.75rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>
              {CATEGORY_LABELS[item.category]}
            </p>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.75rem', fontWeight: 700, color: '#1E1914', marginBottom: '0.5rem' }}>
              {item.title}
            </h1>
            <p style={{ fontSize: '1.75rem', fontWeight: 700, color: '#1E1914', marginBottom: '1.25rem' }}>
              ${Number(item.price).toLocaleString('es-AR')}
            </p>

            <dl style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem 1.5rem', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
              <div>
                <dt style={{ color: '#9ca3af' }}>Talle</dt>
                <dd style={{ color: '#1E1914', fontWeight: 600 }}>{SIZE_LABELS[item.size]}</dd>
              </div>
              <div>
                <dt style={{ color: '#9ca3af' }}>Estado</dt>
                <dd style={{ color: '#1E1914', fontWeight: 600 }}>{CONDITION_LABELS[item.condition]}</dd>
              </div>
              {item.quantity > 1 && (
                <div>
                  <dt style={{ color: '#9ca3af' }}>Cantidad disponible</dt>
                  <dd style={{ color: '#1E1914', fontWeight: 600 }}>{item.quantity}</dd>
                </div>
              )}
            </dl>

            {item.description && (
              <p style={{ color: '#4b5563', marginBottom: '1.5rem', lineHeight: 1.6 }}>{item.description}</p>
            )}

            {storePhone ? (
              <a
                href={buildWhatsAppLink(storePhone, item)}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.75rem',
                  width: '100%',
                  padding: '1rem',
                  borderRadius: '0.875rem',
                  background: '#16a34a',
                  color: '#fff',
                  textDecoration: 'none',
                  fontWeight: 600,
                  fontSize: '1.05rem',
                }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Quiero esta prenda
              </a>
            ) : (
              <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>Consultá en tienda para más información.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
