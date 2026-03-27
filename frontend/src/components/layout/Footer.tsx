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

      <div style={{ maxWidth: '1100px', margin: '2rem auto 0', paddingTop: '1.5rem', borderTop: '1px solid rgba(232,227,213,0.1)', fontSize: '0.75rem', textAlign: 'center' }}>
        © {new Date().getFullYear()} MBDA Modas — Todos los derechos reservados
      </div>
    </footer>
  )
}
