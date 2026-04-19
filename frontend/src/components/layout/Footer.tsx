import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axiosClient from '../../api/axiosClient'

interface SocialLink { active: boolean; url: string }
interface StoreInfo {
  name: string | null
  phone: string | null
  email: string | null
  address: string | null
  socialLinks: { whatsappGroup?: SocialLink; tiktok?: SocialLink; instagram?: SocialLink; facebook?: SocialLink } | null
  footerConfig: { tagline?: string; address?: string; showDeveloper?: boolean; showVenderLink?: boolean; venderLinkText?: string } | null
}

export function Footer() {
  const [info, setInfo] = useState<StoreInfo | null>(null)

  useEffect(() => {
    axiosClient.get<{ data: { store: StoreInfo | null } }>('/store-info')
      .then(r => setInfo(r.data.data.store))
      .catch(() => {})
  }, [])

  const tagline = info?.footerConfig?.tagline ?? 'Tienda de ropa en Concepcion, Tucuman. Productos nuevos, consignacion y comisiones para promotores.'
  const address = info?.footerConfig?.address ?? info?.address ?? 'Calle Espana 1356, Concepcion, Tucuman'
  const showDeveloper = info?.footerConfig?.showDeveloper ?? true
  const showVenderLink = info?.footerConfig?.showVenderLink ?? false
  const venderLinkText = info?.footerConfig?.venderLinkText ?? 'Quiero vender'
  const social = info?.socialLinks ?? {}

  return (
    <footer style={{ background: '#1E1914', color: 'rgba(232,227,213,0.7)', padding: '2.5rem 1.5rem' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '2rem' }}>
        {/* Marca */}
        <div>
          <p style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.1rem', fontWeight: 700, color: '#E8E3D5', marginBottom: '0.5rem' }}>
            {info?.name ?? 'MBDA Market'}
          </p>
          <p style={{ fontSize: '0.8rem', lineHeight: 1.6, marginBottom: '0.5rem' }}>{tagline}</p>
          <p style={{ fontSize: '0.8rem', lineHeight: 1.6, opacity: 0.7 }}>{address}</p>
          {info?.email && (
            <a href={`mailto:${info.email}`} style={{ display: 'block', fontSize: '0.8rem', color: 'rgba(232,227,213,0.65)', textDecoration: 'none', marginTop: '0.25rem' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#E8E3D5')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(232,227,213,0.65)')}
            >
              {info.email}
            </a>
          )}

          {/* Social links */}
          {(social.whatsappGroup?.active || social.tiktok?.active || social.instagram?.active || social.facebook?.active) && (
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.875rem' }}>
              {social.whatsappGroup?.active && social.whatsappGroup.url && (
                <a href={social.whatsappGroup.url} target="_blank" rel="noopener noreferrer"
                  style={{ background: '#25D366', color: '#fff', padding: '0.35rem 0.75rem', borderRadius: '0.5rem', textDecoration: 'none', fontSize: '0.75rem', fontWeight: 600 }}>
                  💬 WhatsApp
                </a>
              )}
              {social.instagram?.active && social.instagram.url && (
                <a href={social.instagram.url} target="_blank" rel="noopener noreferrer"
                  style={{ background: '#E1306C', color: '#fff', padding: '0.35rem 0.75rem', borderRadius: '0.5rem', textDecoration: 'none', fontSize: '0.75rem', fontWeight: 600 }}>
                  📸 Instagram
                </a>
              )}
              {social.tiktok?.active && social.tiktok.url && (
                <a href={social.tiktok.url} target="_blank" rel="noopener noreferrer"
                  style={{ background: '#010101', color: '#fff', padding: '0.35rem 0.75rem', borderRadius: '0.5rem', textDecoration: 'none', fontSize: '0.75rem', fontWeight: 600 }}>
                  🎵 TikTok
                </a>
              )}
              {social.facebook?.active && social.facebook.url && (
                <a href={social.facebook.url} target="_blank" rel="noopener noreferrer"
                  style={{ background: '#1877F2', color: '#fff', padding: '0.35rem 0.75rem', borderRadius: '0.5rem', textDecoration: 'none', fontSize: '0.75rem', fontWeight: 600 }}>
                  👍 Facebook
                </a>
              )}
            </div>
          )}
        </div>

        {/* Links */}
        <div>
          <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#E8E3D5', marginBottom: '0.75rem', fontWeight: 600 }}>
            Navegacion
          </p>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {[
              { label: 'Catalogo', to: '/', show: true },
              { label: 'Nosotros', to: '/nosotros', show: true },
              { label: venderLinkText, to: '/register', show: showVenderLink },
            ].filter(l => l.show).map(l => (
              <Link key={l.to} to={l.to} style={{ color: 'rgba(232,227,213,0.7)', textDecoration: 'none', fontSize: '0.875rem', transition: 'color 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#E8E3D5')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(232,227,213,0.7)')}
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Legal */}
        <div>
          <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#E8E3D5', marginBottom: '0.75rem', fontWeight: 600 }}>
            Legal
          </p>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <Link to="/terminos-y-condiciones" style={{ color: 'rgba(232,227,213,0.7)', textDecoration: 'none', fontSize: '0.875rem' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#E8E3D5')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(232,227,213,0.7)')}
            >
              Terminos y Condiciones
            </Link>
          </nav>
        </div>
      </div>

      {/* Desarrollador */}
      {showDeveloper && (
        <div style={{ maxWidth: '1100px', margin: '2rem auto 0', paddingTop: '1.5rem', borderTop: '1px solid rgba(232,227,213,0.1)', textAlign: 'center' }}>
          <p style={{ fontSize: '0.8rem', color: 'rgba(232,227,213,0.5)', marginBottom: '0.375rem' }}>
            Desarrollado por{' '}
            <a href="https://wa.me/543865468239?text=Hola%20Nahuel!%20Vi%20tu%20trabajo%20en%20MBDA%20Market%20y%20me%20interesa%20un%20proyecto%20similar." target="_blank" rel="noopener noreferrer"
              style={{ color: '#E8E3D5', textDecoration: 'none', fontWeight: 600 }}
              onMouseEnter={e => (e.currentTarget.style.textDecoration = 'underline')}
              onMouseLeave={e => (e.currentTarget.style.textDecoration = 'none')}
            >
              Nahuel Martinez
            </a>
            {' '}— Ing. en Sistemas · Tucuman, Argentina
          </p>
          <p style={{ fontSize: '0.7rem', color: 'rgba(232,227,213,0.35)' }}>
            Queres una app como esta para tu negocio?{' '}
            <a href="https://wa.me/543865468239?text=Hola%20Nahuel!%20Me%20interesa%20que%20desarrolles%20una%20app%20para%20mi%20negocio." target="_blank" rel="noopener noreferrer"
              style={{ color: 'rgba(232,227,213,0.55)', textDecoration: 'underline' }}
            >Contactame</a>
          </p>
          <p style={{ fontSize: '0.75rem', color: 'rgba(232,227,213,0.4)', marginTop: '1rem' }}>
            © {new Date().getFullYear()} {info?.name ?? 'MBDA Market'} — Todos los derechos reservados
          </p>
        </div>
      )}
    </footer>
  )
}
