import { Link } from 'react-router-dom'

export function Footer() {
  return (
    <footer style={{ background: '#1E1914', color: 'rgba(232,227,213,0.7)', padding: '2.5rem 1.5rem' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '2rem' }}>
        {/* Marca */}
        <div>
          <p style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.1rem', fontWeight: 700, color: '#E8E3D5', marginBottom: '0.5rem' }}>
            MBDA Modas
          </p>
          <p style={{ fontSize: '0.8rem', lineHeight: 1.6 }}>
            Tienda de consignación en Buenos Aires. Ropa con historia a precios accesibles.
          </p>
        </div>

        {/* Links */}
        <div>
          <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#E8E3D5', marginBottom: '0.75rem', fontWeight: 600 }}>
            Navegación
          </p>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {[
              { label: 'Catálogo', to: '/' },
              { label: 'Nosotros', to: '/nosotros' },
              { label: 'Vender mis productos', to: '/register' },
            ].map(l => (
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
              Términos y Condiciones
            </Link>
          </nav>
        </div>
      </div>

      {/* Desarrollador */}
      <div style={{ maxWidth: '1100px', margin: '2rem auto 0', paddingTop: '1.5rem', borderTop: '1px solid rgba(232,227,213,0.1)', textAlign: 'center' }}>
        <p style={{ fontSize: '0.8rem', color: 'rgba(232,227,213,0.5)', marginBottom: '0.375rem' }}>
          Desarrollado por{' '}
          <a
            href="https://wa.me/543865468239?text=Hola%20Nahuel!%20Vi%20tu%20trabajo%20en%20MBDA%20Modas%20y%20me%20interesa%20un%20proyecto%20similar."
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#E8E3D5', textDecoration: 'none', fontWeight: 600 }}
            onMouseEnter={e => (e.currentTarget.style.textDecoration = 'underline')}
            onMouseLeave={e => (e.currentTarget.style.textDecoration = 'none')}
          >
            Nahuel Martinez
          </a>
          {' '}— Ing. en Sistemas · Tucumán, Argentina
        </p>
        <p style={{ fontSize: '0.7rem', color: 'rgba(232,227,213,0.35)' }}>
          ¿Querés una app como esta para tu negocio?{' '}
          <a
            href="https://wa.me/543865468239?text=Hola%20Nahuel!%20Me%20interesa%20que%20desarrolles%20una%20app%20para%20mi%20negocio."
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'rgba(232,227,213,0.55)', textDecoration: 'underline' }}
          >
            Contactame
          </a>
        </p>
        <p style={{ fontSize: '0.75rem', color: 'rgba(232,227,213,0.4)', marginTop: '1rem' }}>
          © {new Date().getFullYear()} MBDA Modas — Todos los derechos reservados
        </p>
      </div>
    </footer>
  )
}
