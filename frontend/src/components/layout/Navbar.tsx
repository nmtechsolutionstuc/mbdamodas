import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { logout } from '../../api/auth'

export function Navbar() {
  const { user, clearAuth } = useAuthStore()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  async function handleLogout() {
    try { await logout() } catch { /* ignorar */ }
    clearAuth()
    navigate('/')
    setMenuOpen(false)
  }

  const isAdmin = user?.role === 'ADMIN'

  // Links segun rol
  const links = isAdmin
    ? [
        { label: 'Solicitudes', to: '/admin/solicitudes' },
        { label: 'Catalogo', to: '/admin/catalogo' },
        { label: 'Usuarios', to: '/admin/usuarios' },
        { label: 'Tiendas', to: '/admin/tiendas' },
      ]
    : user
    ? [
        { label: 'Catalogo', to: '/' },
        { label: 'Mis solicitudes', to: '/dashboard/mis-solicitudes' },
        { label: 'Vender productos', to: '/dashboard/enviar' },
      ]
    : [
        { label: 'Catalogo', to: '/' },
        { label: 'Nosotros', to: '/nosotros' },
        { label: 'Vender mis productos', to: '/register' },
      ]

  return (
    <nav style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      background: '#1E1914',
      color: '#E8E3D5',
      boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
    }}>
      <div style={{
        maxWidth: '1100px',
        margin: '0 auto',
        padding: '0 1rem',
        height: '56px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        {/* Logo */}
        <Link
          to={isAdmin ? '/admin' : user ? '/dashboard' : '/'}
          style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          onClick={() => setMenuOpen(false)}
        >
          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.25rem', fontWeight: 700, color: '#E8E3D5', letterSpacing: '0.03em' }}>
            MBDA Modas
          </span>
          {isAdmin && (
            <span style={{
              fontSize: '0.6rem',
              background: 'linear-gradient(135deg, #E8E3D5 0%, #d9d2c0 100%)',
              color: '#1E1914',
              padding: '0.15rem 0.5rem',
              borderRadius: '999px',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
            }}>
              ADMIN
            </span>
          )}
        </Link>

        {/* Desktop links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }} className="desktop-nav">
          {links.map(l => (
            <Link
              key={l.to}
              to={l.to}
              style={{
                color: '#E8E3D5',
                textDecoration: 'none',
                padding: '0.375rem 0.75rem',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: 500,
                fontFamily: "'Inter', sans-serif",
                opacity: 0.85,
                transition: 'opacity 0.15s ease, background 0.15s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.background = 'rgba(232,227,213,0.08)' }}
              onMouseLeave={e => { e.currentTarget.style.opacity = '0.85'; e.currentTarget.style.background = 'transparent' }}
            >
              {l.label}
            </Link>
          ))}

          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: '0.5rem' }}>
              <Link
                to={isAdmin ? '/admin' : '/dashboard/perfil'}
                style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', textDecoration: 'none', color: '#E8E3D5', fontSize: '0.875rem', opacity: 0.85, transition: 'opacity 0.15s ease' }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '0.85')}
              >
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#E8E3D5', color: '#1E1914', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, fontFamily: "'Inter', sans-serif" }}>
                  {user.firstName?.charAt(0)?.toUpperCase() ?? '?'}
                </div>
                <span style={{ maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: "'Inter', sans-serif" }}>
                  {user.firstName ?? ''}
                </span>
              </Link>
              <button
                onClick={handleLogout}
                style={{ background: 'transparent', border: '1px solid rgba(232,227,213,0.4)', color: '#E8E3D5', borderRadius: '0.5rem', padding: '0.25rem 0.75rem', cursor: 'pointer', fontSize: '0.8rem', opacity: 0.8, fontFamily: "'Inter', sans-serif", transition: 'opacity 0.15s ease, border-color 0.15s ease' }}
                onMouseEnter={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.borderColor = 'rgba(232,227,213,0.7)' }}
                onMouseLeave={e => { e.currentTarget.style.opacity = '0.8'; e.currentTarget.style.borderColor = 'rgba(232,227,213,0.4)' }}
              >
                Salir
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '0.375rem', marginLeft: '0.5rem' }}>
              <Link
                to="/login"
                style={{ color: '#E8E3D5', textDecoration: 'none', padding: '0.375rem 0.875rem', borderRadius: '0.5rem', fontSize: '0.875rem', fontWeight: 500, opacity: 0.85, fontFamily: "'Inter', sans-serif", transition: 'opacity 0.15s ease' }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '0.85')}
              >
                Ingresar
              </Link>
              <Link
                to="/register"
                style={{ background: '#E8E3D5', color: '#1E1914', textDecoration: 'none', padding: '0.375rem 1rem', borderRadius: '0.5rem', fontSize: '0.875rem', fontWeight: 600, fontFamily: "'Inter', sans-serif", transition: 'background 0.15s ease' }}
                onMouseEnter={e => (e.currentTarget.style.background = '#f5f0e6')}
                onMouseLeave={e => (e.currentTarget.style.background = '#E8E3D5')}
              >
                Registrate
              </Link>
            </div>
          )}
        </div>

        {/* Hamburger (mobile) */}
        <button
          onClick={() => setMenuOpen(v => !v)}
          aria-label="Abrir menu"
          style={{ background: 'transparent', border: 'none', color: '#E8E3D5', cursor: 'pointer', padding: '0.375rem', display: 'none' }}
          className="hamburger-btn"
        >
          <span style={{
            display: 'block', width: '22px', height: '2px', background: '#E8E3D5', borderRadius: '2px',
            transition: 'transform 0.25s ease, opacity 0.25s ease',
            transform: menuOpen ? 'rotate(45deg) translate(3.5px, 3.5px)' : 'none',
            marginBottom: menuOpen ? '0' : '5px',
          }} />
          <span style={{
            display: 'block', width: '22px', height: '2px', background: '#E8E3D5', borderRadius: '2px',
            transition: 'opacity 0.2s ease',
            opacity: menuOpen ? 0 : 1,
            marginBottom: menuOpen ? '0' : '5px',
          }} />
          <span style={{
            display: 'block', width: '22px', height: '2px', background: '#E8E3D5', borderRadius: '2px',
            transition: 'transform 0.25s ease, opacity 0.25s ease',
            transform: menuOpen ? 'rotate(-45deg) translate(3.5px, -3.5px)' : 'none',
          }} />
        </button>
      </div>

      {/* Mobile menu - always rendered, controlled by max-height transition */}
      <div
        style={{
          background: '#2a2420',
          borderTop: '1px solid rgba(232,227,213,0.1)',
          display: 'none',
          overflow: 'hidden',
          maxHeight: menuOpen ? '500px' : '0',
          transition: 'max-height 0.3s ease-in-out',
          padding: menuOpen ? '0.75rem 1rem 1rem' : '0 1rem',
        }}
        className="mobile-menu"
      >
        {links.map(l => (
          <Link
            key={l.to}
            to={l.to}
            onClick={() => setMenuOpen(false)}
            style={{ display: 'block', color: '#E8E3D5', textDecoration: 'none', padding: '0.75rem 0', fontSize: '1rem', borderBottom: '1px solid rgba(232,227,213,0.08)', fontFamily: "'Inter', sans-serif" }}
          >
            {l.label}
          </Link>
        ))}
        {user ? (
          <>
            <Link
              to={isAdmin ? '/admin' : '/dashboard/perfil'}
              onClick={() => setMenuOpen(false)}
              style={{ display: 'block', color: '#E8E3D5', textDecoration: 'none', padding: '0.75rem 0', fontSize: '1rem', borderBottom: '1px solid rgba(232,227,213,0.08)', fontFamily: "'Inter', sans-serif" }}
            >
              Mi perfil ({user.firstName ?? ''})
            </Link>
            <button
              onClick={handleLogout}
              style={{ display: 'block', width: '100%', textAlign: 'left', background: 'transparent', border: 'none', color: '#fca5a5', padding: '0.75rem 0', fontSize: '1rem', cursor: 'pointer', marginTop: '0.25rem', fontFamily: "'Inter', sans-serif" }}
            >
              Cerrar sesion
            </button>
          </>
        ) : (
          <>
            <Link
              to="/login"
              onClick={() => setMenuOpen(false)}
              style={{ display: 'block', color: '#E8E3D5', textDecoration: 'none', padding: '0.75rem 0', fontSize: '1rem', borderBottom: '1px solid rgba(232,227,213,0.08)', fontFamily: "'Inter', sans-serif" }}
            >
              Ingresar
            </Link>
            <Link
              to="/register"
              onClick={() => setMenuOpen(false)}
              style={{ display: 'block', color: '#1E1914', background: '#E8E3D5', textDecoration: 'none', padding: '0.625rem 1rem', borderRadius: '0.75rem', fontSize: '1rem', fontWeight: 600, marginTop: '0.5rem', textAlign: 'center', fontFamily: "'Inter', sans-serif" }}
            >
              Registrate
            </Link>
          </>
        )}
      </div>

      {/* Responsive styles */}
      <style>{`
        @media (max-width: 640px) {
          .desktop-nav { display: none !important; }
          .hamburger-btn { display: block !important; }
          .mobile-menu { display: block !important; }
        }
      `}</style>
    </nav>
  )
}
