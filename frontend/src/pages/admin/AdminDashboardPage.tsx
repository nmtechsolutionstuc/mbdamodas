import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { fetchAdminStats } from '../../api/admin'

export function AdminDashboardPage() {
  const [stats, setStats] = useState({ pending: 0, inStore: 0, soldThisMonth: 0 })
  const [hoveredLink, setHoveredLink] = useState<string | null>(null)

  useEffect(() => {
    fetchAdminStats().then(setStats).catch(() => {})
  }, [])

  const statCards = [
    { label: 'Productos en revisión', value: stats.pending, icon: '📋', color: '#854d0e', bg: 'linear-gradient(135deg, #fef9c3 0%, #fef3c7 100%)', link: '/admin/solicitudes' },
    { label: 'En tienda', value: stats.inStore, icon: '🏪', color: '#1e40af', bg: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)', link: '/admin/solicitudes' },
    { label: 'Vendidas este mes', value: stats.soldThisMonth, icon: '✨', color: '#166534', bg: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)', link: '/admin/catalogo' },
  ]

  const quickLinks = [
    { label: 'Revisar solicitudes', desc: 'Aprobar o rechazar productos de vendedores', to: '/admin/solicitudes', dark: true, icon: '📝' },
    { label: 'Catálogo', desc: 'Editar productos aprobados y marcar como vendidos', to: '/admin/catalogo', dark: false, icon: '👗' },
    { label: 'Usuarios', desc: 'Administrar vendedores y crear cuentas', to: '/admin/usuarios', dark: false, icon: '👥' },
    { label: 'Tiendas', desc: 'Configurar comisiones y datos de la tienda', to: '/admin/tiendas', dark: false, icon: '🏬' },
    { label: 'Configuracion', desc: 'Tipos de producto, talles y etiquetas', to: '/admin/configuracion', dark: false, icon: '⚙️' },
    { label: 'Gestionar Reservas', desc: 'Aprobar, rechazar y completar reservas de promotores', to: '/admin/reservas', dark: false, icon: '🔖' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#FAF8F3', padding: '1.5rem' }}>
      <style>{`
        .mbda-admin-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 2.5rem; }
        .mbda-admin-links { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        @media (max-width: 640px) {
          .mbda-admin-stats { grid-template-columns: 1fr; }
          .mbda-admin-links { grid-template-columns: 1fr; }
        }
      `}</style>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '2rem', fontWeight: 700, color: '#1E1914', marginBottom: '2rem' }}>
          Panel de administración
        </h1>

        {/* Stats */}
        <div className="mbda-admin-stats">
          {statCards.map(stat => (
            <Link key={stat.label} to={stat.link} style={{ textDecoration: 'none' }}>
              <div
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)' }}
                style={{
                  background: stat.bg,
                  borderRadius: '1rem',
                  padding: '1.5rem',
                  textAlign: 'center',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                }}
              >
                <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>{stat.icon}</div>
                <div style={{ fontSize: '2.5rem', fontWeight: 700, color: stat.color, fontFamily: "'Playfair Display', serif", lineHeight: 1.1 }}>
                  {stat.value}
                </div>
                <div style={{ fontSize: '0.875rem', color: stat.color, fontWeight: 500, marginTop: '0.375rem', fontFamily: "'Inter', sans-serif" }}>
                  {stat.label}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Accesos rápidos */}
        <div className="mbda-admin-links">
          {quickLinks.map(item => (
            <Link
              key={item.label}
              to={item.to}
              onMouseEnter={() => setHoveredLink(item.label)}
              onMouseLeave={() => setHoveredLink(null)}
              style={{
                display: 'block',
                padding: '1.25rem 1.5rem',
                borderRadius: '1rem',
                textDecoration: 'none',
                background: item.dark
                  ? (hoveredLink === item.label ? '#2a2420' : '#1E1914')
                  : (hoveredLink === item.label ? '#d9d2c0' : '#E8E3D5'),
                color: item.dark ? '#E8E3D5' : '#1E1914',
                transition: 'background 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease',
                transform: hoveredLink === item.label ? 'translateY(-2px)' : 'translateY(0)',
                boxShadow: hoveredLink === item.label ? '0 6px 20px rgba(0,0,0,0.12)' : '0 1px 4px rgba(0,0,0,0.04)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.375rem' }}>
                <span style={{ fontSize: '1.1rem' }}>{item.icon}</span>
                <span style={{ fontWeight: 600, fontSize: '1rem', fontFamily: "'Inter', sans-serif" }}>{item.label}</span>
              </div>
              <div style={{ fontSize: '0.8rem', opacity: 0.7, fontFamily: "'Inter', sans-serif", paddingLeft: '1.6rem' }}>{item.desc}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
