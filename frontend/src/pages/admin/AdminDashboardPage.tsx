import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { fetchAdminStats } from '../../api/admin'

export function AdminDashboardPage() {
  const [stats, setStats] = useState({ pending: 0, inStore: 0, soldThisMonth: 0 })

  useEffect(() => {
    fetchAdminStats().then(setStats).catch(() => {})
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: '#FAF8F3', padding: '1.5rem' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '2rem', fontWeight: 700, color: '#1E1914', marginBottom: '2rem' }}>
          Panel de administración
        </h1>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2.5rem' }}>
          {[
            { label: 'Prendas en revisión', value: stats.pending, color: '#854d0e', bg: '#fef9c3', link: '/admin/solicitudes' },
            { label: 'En tienda', value: stats.inStore, color: '#1e40af', bg: '#dbeafe', link: '/admin/solicitudes' },
            { label: 'Vendidas este mes', value: stats.soldThisMonth, color: '#166534', bg: '#dcfce7', link: '/admin/catalogo' },
          ].map(stat => (
            <Link key={stat.label} to={stat.link} style={{ textDecoration: 'none' }}>
              <div style={{ background: stat.bg, borderRadius: '1rem', padding: '1.5rem', textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', fontWeight: 700, color: stat.color, fontFamily: "'Playfair Display', serif" }}>
                  {stat.value}
                </div>
                <div style={{ fontSize: '0.875rem', color: stat.color, fontWeight: 500, marginTop: '0.25rem' }}>
                  {stat.label}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Accesos rápidos */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          {[
            { label: 'Revisar solicitudes', desc: 'Aprobar o rechazar prendas de vendedores', to: '/admin/solicitudes', dark: true },
            { label: 'Catálogo', desc: 'Editar prendas aprobadas y marcar como vendidas', to: '/admin/catalogo', dark: false },
            { label: 'Usuarios', desc: 'Administrar vendedores', to: '/admin/usuarios', dark: false },
            { label: 'Tiendas', desc: 'Configurar comisiones y datos de la tienda', to: '/admin/tiendas', dark: false },
          ].map(item => (
            <Link
              key={item.label}
              to={item.to}
              style={{
                display: 'block',
                padding: '1.25rem',
                borderRadius: '1rem',
                textDecoration: 'none',
                background: item.dark ? '#1E1914' : '#E8E3D5',
                color: item.dark ? '#E8E3D5' : '#1E1914',
              }}
            >
              <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{item.label}</div>
              <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>{item.desc}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
