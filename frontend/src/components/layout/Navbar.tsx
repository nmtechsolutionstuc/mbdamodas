import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { logout } from '../../api/auth'
import axiosClient from '../../api/axiosClient'

export function Navbar() {
  const { user, clearAuth } = useAuthStore()
  const navigate = useNavigate()
  const [announcement, setAnnouncement] = useState<string | null>(null)
  const [showRegisterBtn, setShowRegisterBtn] = useState(false)

  const isAdmin = user?.role === 'ADMIN'

  useEffect(() => {
    axiosClient.get('/announcement')
      .then(r => { if (r.data?.data?.text) setAnnouncement(r.data.data.text) })
      .catch(() => {})
    axiosClient.get('/store-info')
      .then(r => {
        const store = r.data?.data?.store
        // Show "Registrate" only if the seller banner button is active
        setShowRegisterBtn(store?.bannerSellerButtonActive ?? false)
      })
      .catch(() => {})
  }, [])

  async function handleLogout() {
    try { await logout() } catch { /* ignorar */ }
    clearAuth()
    navigate('/')
  }

  // "Menú" — goes to user dashboard or admin dashboard
  const menuTo = isAdmin ? '/admin' : '/dashboard'

  return (
    <>
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
          {/* Logo — always goes to homepage */}
          <Link
            to="/"
            style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
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

          {/* Right side actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            {user ? (
              <>
                {/* Nosotros link */}
                <Link
                  to="/nosotros"
                  style={{ color: '#E8E3D5', textDecoration: 'none', padding: '0.35rem 0.75rem', fontSize: '0.85rem', fontWeight: 500, opacity: 0.85, fontFamily: "'Inter', sans-serif", transition: 'opacity 0.15s ease' }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                  onMouseLeave={e => (e.currentTarget.style.opacity = '0.85')}
                >
                  Nosotros
                </Link>

                {/* Menu button — navigates to dashboard */}
                <Link
                  to={menuTo}
                  style={{
                    background: 'transparent',
                    border: '1px solid rgba(232,227,213,0.3)',
                    color: '#E8E3D5',
                    borderRadius: '0.5rem',
                    padding: '0.35rem 0.875rem',
                    textDecoration: 'none',
                    fontSize: '0.85rem',
                    fontWeight: 500,
                    fontFamily: "'Inter', sans-serif",
                    transition: 'background 0.15s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.375rem',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(232,227,213,0.12)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <line x1="3" y1="12" x2="21" y2="12" />
                    <line x1="3" y1="18" x2="21" y2="18" />
                  </svg>
                  Menu
                </Link>

                {/* Profile avatar */}
                <Link
                  to={isAdmin ? '/admin' : '/dashboard/perfil'}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', textDecoration: 'none', color: '#E8E3D5', fontSize: '0.85rem', opacity: 0.85, transition: 'opacity 0.15s ease', marginLeft: '0.25rem' }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                  onMouseLeave={e => (e.currentTarget.style.opacity = '0.85')}
                >
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#E8E3D5', color: '#1E1914', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, fontFamily: "'Inter', sans-serif" }}>
                    {user.firstName?.charAt(0)?.toUpperCase() ?? '?'}
                  </div>
                  <span style={{ maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: "'Inter', sans-serif" }} className="hide-mobile">
                    {user.firstName ?? ''}
                  </span>
                </Link>

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  style={{ background: 'transparent', border: '1px solid rgba(232,227,213,0.4)', color: '#E8E3D5', borderRadius: '0.5rem', padding: '0.25rem 0.75rem', cursor: 'pointer', fontSize: '0.8rem', opacity: 0.8, fontFamily: "'Inter', sans-serif", transition: 'opacity 0.15s ease, border-color 0.15s ease' }}
                  onMouseEnter={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.borderColor = 'rgba(232,227,213,0.7)' }}
                  onMouseLeave={e => { e.currentTarget.style.opacity = '0.8'; e.currentTarget.style.borderColor = 'rgba(232,227,213,0.4)' }}
                >
                  Salir
                </button>
              </>
            ) : (
              <div style={{ display: 'flex', gap: '0.375rem', alignItems: 'center' }}>
                <Link
                  to="/nosotros"
                  style={{ color: '#E8E3D5', textDecoration: 'none', padding: '0.375rem 0.875rem', borderRadius: '0.5rem', fontSize: '0.875rem', fontWeight: 500, opacity: 0.85, fontFamily: "'Inter', sans-serif", transition: 'opacity 0.15s ease' }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                  onMouseLeave={e => (e.currentTarget.style.opacity = '0.85')}
                >
                  Nosotros
                </Link>
                <Link
                  to="/login"
                  style={{ color: '#E8E3D5', textDecoration: 'none', padding: '0.375rem 0.875rem', borderRadius: '0.5rem', fontSize: '0.875rem', fontWeight: 500, opacity: 0.85, fontFamily: "'Inter', sans-serif", transition: 'opacity 0.15s ease' }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                  onMouseLeave={e => (e.currentTarget.style.opacity = '0.85')}
                >
                  Ingresar
                </Link>
                {showRegisterBtn && (
                  <Link
                    to="/register"
                    style={{ background: '#E8E3D5', color: '#1E1914', textDecoration: 'none', padding: '0.375rem 1rem', borderRadius: '0.5rem', fontSize: '0.875rem', fontWeight: 600, fontFamily: "'Inter', sans-serif", transition: 'background 0.15s ease' }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#f5f0e6')}
                    onMouseLeave={e => (e.currentTarget.style.background = '#E8E3D5')}
                  >
                    Registrate
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Announcement bar */}
      {announcement && (
        <div style={{
          background: 'linear-gradient(90deg, #dc2626 0%, #b91c1c 100%)',
          color: '#fff',
          textAlign: 'center',
          padding: '0.625rem 1rem',
          fontSize: '0.9rem',
          fontWeight: 600,
          fontFamily: "'Inter', sans-serif",
          letterSpacing: '0.01em',
          position: 'sticky',
          top: '56px',
          zIndex: 99,
          boxShadow: '0 2px 8px rgba(220,38,38,0.3)',
        }}>
          🔥 {announcement}
        </div>
      )}

      <style>{`
        @media (max-width: 480px) {
          .hide-mobile { display: none !important; }
        }
      `}</style>
    </>
  )
}
