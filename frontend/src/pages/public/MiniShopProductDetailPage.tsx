import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { fetchCatalogProductBySlug } from '../../api/catalog'
import type { MinishopCatalogItem, MiniShopDeliveryMethods } from '../../types'

export function MiniShopProductDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const [product, setProduct] = useState<MinishopCatalogItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [currentPhoto, setCurrentPhoto] = useState(0)

  useEffect(() => {
    if (!slug) return
    fetchCatalogProductBySlug(slug)
      .then(item => {
        if (!item || item.source !== 'minishop') { setNotFound(true); return }
        setProduct(item as MinishopCatalogItem)
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#FAF8F3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#9ca3af' }}>Cargando producto...</div>
      </div>
    )
  }

  if (notFound || !product) {
    return (
      <div style={{ minHeight: '100vh', background: '#FAF8F3', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.5rem', color: '#1E1914', marginBottom: '0.5rem' }}>Producto no encontrado</h1>
        <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>Este producto no existe o no está disponible.</p>
        <Link to="/" style={{ color: '#1E1914', fontWeight: 600, textDecoration: 'underline' }}>Volver al catálogo</Link>
      </div>
    )
  }

  const shop = product.miniShop
  const delivery = (product as any).miniShop?.deliveryMethods as MiniShopDeliveryMethods | undefined

  const sizePart = product.size ? ` (Talle ${product.size.name})` : ''
  const waMsg = `Hola ${shop.name}! Me interesa el producto "${product.title}"${sizePart} · $${Number(product.price).toLocaleString('es-AR')}. ¿Está disponible?`
  const waLink = `https://wa.me/${shop.whatsapp}?text=${encodeURIComponent(waMsg)}`

  const photos = product.photos ?? []

  return (
    <div style={{ minHeight: '100vh', background: '#FAF8F3' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        {/* Breadcrumb */}
        <div style={{ fontSize: '0.8rem', color: '#9ca3af', marginBottom: '1.5rem', display: 'flex', gap: '0.4rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <Link to="/" style={{ color: '#6b7280', textDecoration: 'none' }}>Catálogo</Link>
          <span>›</span>
          <Link to={`/tienda/${shop.slug}`} style={{ color: '#6b7280', textDecoration: 'none' }}>{shop.name}</Link>
          <span>›</span>
          <span style={{ color: '#1E1914' }}>{product.title}</span>
        </div>

        <style>{`
          .product-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 2.5rem; }
          @media (max-width: 640px) { .product-layout { grid-template-columns: 1fr; } }
        `}</style>

        <div className="product-layout">
          {/* Fotos */}
          <div>
            <div style={{
              aspectRatio: '3/4',
              borderRadius: '1rem',
              overflow: 'hidden',
              background: '#E8E3D5',
              marginBottom: photos.length > 1 ? '0.75rem' : 0,
            }}>
              {photos.length > 0 ? (
                <img
                  src={photos[currentPhoto]?.url}
                  alt={product.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: '0.875rem' }}>
                  Sin foto
                </div>
              )}
            </div>
            {photos.length > 1 && (
              <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto' }}>
                {photos.map((p, i) => (
                  <button
                    key={p.id ?? i}
                    onClick={() => setCurrentPhoto(i)}
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '0.5rem',
                      overflow: 'hidden',
                      border: i === currentPhoto ? '2px solid #1E1914' : '2px solid transparent',
                      padding: 0,
                      cursor: 'pointer',
                      flexShrink: 0,
                      background: '#E8E3D5',
                    }}
                  >
                    <img src={p.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {/* Shop label */}
            <Link
              to={`/tienda/${shop.slug}`}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', marginBottom: '1rem' }}
            >
              {shop.profilePhotoUrl ? (
                <img src={shop.profilePhotoUrl} alt={shop.name} style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#1E1914', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FAF8F3', fontSize: '0.875rem', fontWeight: 700 }}>
                  {shop.name.charAt(0).toUpperCase()}
                </div>
              )}
              <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                Por: <span style={{ fontWeight: 600, color: '#1E1914' }}>{shop.name}</span>
              </span>
            </Link>

            {/* Tipo / talle */}
            {(product.productType || product.size) && (
              <p style={{ fontSize: '0.8rem', color: '#9ca3af', marginBottom: '0.5rem' }}>
                {product.productType?.name ?? ''}{product.size ? ` · Talle ${product.size.name}` : ''}
              </p>
            )}

            {/* Título */}
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.75rem', fontWeight: 700, color: '#1E1914', marginBottom: '0.75rem', lineHeight: 1.2 }}>
              {product.title}
            </h1>

            {/* Precio */}
            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#1E1914', marginBottom: '1.25rem' }}>
              ${Number(product.price).toLocaleString('es-AR')}
            </div>

            {/* Tags */}
            {(product.tags?.length ?? 0) > 0 && (
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
                {product.tags!.map(t => (
                  <span key={t.tag.id} style={{ background: '#E8E3D5', color: '#4b5563', fontSize: '0.75rem', padding: '0.25rem 0.625rem', borderRadius: '1rem', fontWeight: 500 }}>
                    {t.tag.name}
                  </span>
                ))}
              </div>
            )}

            {/* Descripción */}
            {product.description && (
              <p style={{ color: '#4b5563', fontSize: '0.95rem', lineHeight: 1.7, marginBottom: '1.5rem', whiteSpace: 'pre-line' }}>
                {product.description}
              </p>
            )}

            {/* Entrega */}
            {delivery && (delivery.meetingPoint || delivery.shipping) && (
              <div style={{ background: '#fff', border: '1px solid #E8E3D5', borderRadius: '0.75rem', padding: '0.875rem 1rem', marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#6b7280', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Entrega</div>
                <div style={{ fontSize: '0.875rem', color: '#1E1914', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  {delivery.meetingPoint && <div>📍 Punto de encuentro{delivery.address ? ` — ${delivery.address}` : ''}</div>}
                  {delivery.shipping && <div>📦 Envíos</div>}
                </div>
              </div>
            )}

            {/* CTA principal */}
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                background: '#25D366',
                color: '#fff',
                padding: '0.875rem 1.5rem',
                borderRadius: '0.75rem',
                fontSize: '1rem',
                fontWeight: 700,
                textDecoration: 'none',
                marginBottom: '0.75rem',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#fff">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Comprar por WhatsApp
            </a>

            <Link
              to={`/tienda/${shop.slug}`}
              style={{ display: 'block', textAlign: 'center', color: '#6b7280', fontSize: '0.85rem', textDecoration: 'none' }}
            >
              Ver más productos de {shop.name} →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
