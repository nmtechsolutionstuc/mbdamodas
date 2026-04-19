import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { fetchPublicShopProfile } from '../../api/minishops'
import type { MiniShop, MiniShopSocialLinks, MiniShopDeliveryMethods } from '../../types'

export function MiniShopProfilePage() {
  const { slug } = useParams<{ slug: string }>()
  const [shop, setShop] = useState<MiniShop | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!slug) return
    fetchPublicShopProfile(slug)
      .then(setShop)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#FAF8F3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#9ca3af' }}>Cargando tienda...</div>
      </div>
    )
  }

  if (notFound || !shop) {
    return (
      <div style={{ minHeight: '100vh', background: '#FAF8F3', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.5rem', color: '#1E1914', marginBottom: '0.5rem' }}>Tienda no encontrada</h1>
        <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>Esta tienda no existe o no está disponible.</p>
        <Link to="/" style={{ color: '#1E1914', fontWeight: 600, textDecoration: 'underline' }}>Volver al inicio</Link>
      </div>
    )
  }

  const social = (shop.socialLinks ?? {}) as MiniShopSocialLinks
  const delivery = (shop.deliveryMethods ?? {}) as MiniShopDeliveryMethods
  const hasSocial = social.instagram || social.tiktok || social.facebook || social.otra

  return (
    <div style={{ minHeight: '100vh', background: '#FAF8F3' }}>
      {/* Hero */}
      <div style={{ background: '#1E1914', color: '#FAF8F3', padding: '2rem 1.5rem', textAlign: 'center' }}>
        {shop.profilePhotoUrl ? (
          <img src={shop.profilePhotoUrl} alt={shop.name} style={{ width: '96px', height: '96px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #FAF8F3', marginBottom: '1rem' }} />
        ) : (
          <div style={{ width: '96px', height: '96px', borderRadius: '50%', background: '#374151', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', marginBottom: '1rem' }}>
            {shop.name.charAt(0).toUpperCase()}
          </div>
        )}
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.75rem', fontWeight: 700, margin: '0 0 0.5rem' }}>{shop.name}</h1>
        {shop.description && <p style={{ fontSize: '0.9rem', opacity: 0.8, maxWidth: '400px', margin: '0 auto 1rem' }}>{shop.description}</p>}

        <a
          href={`https://wa.me/${shop.whatsapp}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#25D366', color: '#fff', padding: '0.625rem 1.25rem', borderRadius: '2rem', fontSize: '0.9rem', fontWeight: 600, textDecoration: 'none' }}
        >
          📱 Contactar por WhatsApp
        </a>
      </div>

      <div style={{ maxWidth: '560px', margin: '0 auto', padding: '1.5rem' }}>
        {/* Delivery + Social */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
          <div style={{ background: '#fff', border: '1px solid #E8E3D5', borderRadius: '0.75rem', padding: '0.875rem 1rem', flex: '1 1 200px' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#6b7280', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Entrega</div>
            <div style={{ fontSize: '0.875rem', color: '#1E1914', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              {delivery.meetingPoint && <div>📍 Punto de encuentro{delivery.address ? ` — ${delivery.address}` : ''}</div>}
              {delivery.shipping && <div>📦 Envíos</div>}
              {!delivery.meetingPoint && !delivery.shipping && <div style={{ color: '#9ca3af' }}>No especificado</div>}
            </div>
          </div>

          {hasSocial && (
            <div style={{ background: '#fff', border: '1px solid #E8E3D5', borderRadius: '0.75rem', padding: '0.875rem 1rem', flex: '1 1 200px' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#6b7280', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Redes sociales</div>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', fontSize: '0.875rem' }}>
                {social.instagram && <a href={social.instagram.startsWith('http') ? social.instagram : `https://instagram.com/${social.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" style={{ color: '#1E1914', textDecoration: 'none' }}>📸 Instagram</a>}
                {social.tiktok && <a href={social.tiktok.startsWith('http') ? social.tiktok : `https://tiktok.com/${social.tiktok.replace('@', '')}`} target="_blank" rel="noopener noreferrer" style={{ color: '#1E1914', textDecoration: 'none' }}>🎵 TikTok</a>}
                {social.facebook && <a href={social.facebook.startsWith('http') ? social.facebook : `https://facebook.com/${social.facebook}`} target="_blank" rel="noopener noreferrer" style={{ color: '#1E1914', textDecoration: 'none' }}>📘 Facebook</a>}
                {social.otra && <a href={social.otra.startsWith('http') ? social.otra : `https://${social.otra}`} target="_blank" rel="noopener noreferrer" style={{ color: '#1E1914', textDecoration: 'none' }}>🔗 Otra red</a>}
              </div>
            </div>
          )}
        </div>

        {/* CTA: ver productos en catálogo */}
        <Link
          to={`/?miniShopSlug=${shop.slug}`}
          style={{
            display: 'block',
            textAlign: 'center',
            padding: '1rem',
            background: '#1E1914',
            color: '#FAF8F3',
            borderRadius: '1rem',
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: '0.95rem',
          }}
        >
          🛍️ Ver productos de {shop.name} en el catálogo
        </Link>
      </div>
    </div>
  )
}
