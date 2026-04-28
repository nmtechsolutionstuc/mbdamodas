import { useState, useEffect } from 'react'
import { useAuthStore } from '../../store/authStore'
import { usePlatformStore } from '../../store/platformStore'
import { Link } from 'react-router-dom'
import axiosClient from '../../api/axiosClient'

interface Stats {
  PENDING: number
  APPROVED: number
  IN_STORE: number
  SOLD: number
  REJECTED: number
  RETURNED: number
}

interface MenuItemConfig {
  active: boolean
  title: string
  description: string
}

interface MenuConfig {
  enviar?: MenuItemConfig
  solicitudes?: MenuItemConfig
  reservas?: MenuItemConfig
  tiendas?: MenuItemConfig
  perfil?: MenuItemConfig
}

const DEFAULT_MENU: Required<MenuConfig> = {
  enviar: { active: true, title: 'Quiero vender', description: 'Carga lo que quieras vender, nosotros lo revisamos, lo aprobamos y lo vendemos por vos!' },
  solicitudes: { active: true, title: 'Mis solicitudes de venta', description: 'Seguí el estado de las solicitudes de venta que cargaste' },
  reservas: { active: true, title: 'Mis reservas para ganar comisiones', description: 'Reservá productos de la tienda y ganá una comisión luego de completar la venta' },
  tiendas: { active: true, title: 'Mis tiendas', description: 'Crea tu propia tienda dentro de nuestra plataforma y vende tus productos directamente' },
  perfil: { active: true, title: 'Mi perfil', description: 'Actualizá tus datos y número de WhatsApp' },
}

export function UserDashboardPage() {
  const { user } = useAuthStore()
  const [stats, setStats] = useState<Stats | null>(null)
  const [menuConfig, setMenuConfig] = useState<MenuConfig>({})
  const { miniShopsEnabled } = usePlatformStore()

  useEffect(() => {
    axiosClient.get<{ data: Stats }>('/submissions/mine/stats')
      .then(r => setStats(r.data.data))
      .catch(() => {})
    axiosClient.get<{ data: { menuConfig: MenuConfig | null } }>('/menu-config')
      .then(r => setMenuConfig(r.data.data.menuConfig ?? {}))
      .catch(() => {})
  }, [])

  function getMenuItem(key: keyof MenuConfig): MenuItemConfig {
    return { ...DEFAULT_MENU[key], ...menuConfig[key] }
  }

  const hasActivity = stats && (stats.PENDING + stats.APPROVED + stats.IN_STORE + stats.SOLD + stats.REJECTED + stats.RETURNED) > 0

  return (
    <div style={{ minHeight: '100vh', background: '#FAF8F3', padding: '1.5rem' }}>
      <div style={{ maxWidth: '560px', margin: '0 auto' }}>
        <h1
          style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.75rem', fontWeight: 700, color: '#1E1914', marginBottom: '0.25rem' }}
        >
          Hola, {user?.firstName}
        </h1>
        <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>¿Qué querés hacer hoy?</p>

        {/* Stats strip */}
        {hasActivity && (
          <div style={{ display: 'flex', gap: '0.625rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
            {stats!.PENDING > 0 && (
              <span style={{ background: '#fef9c3', color: '#854d0e', fontSize: '0.8rem', fontWeight: 600, padding: '0.375rem 0.75rem', borderRadius: '2rem' }}>
                {stats!.PENDING} pendiente{stats!.PENDING !== 1 ? 's' : ''}
              </span>
            )}
            {stats!.APPROVED > 0 && (
              <span style={{ background: '#dbeafe', color: '#1e40af', fontSize: '0.8rem', fontWeight: 600, padding: '0.375rem 0.75rem', borderRadius: '2rem' }}>
                {stats!.APPROVED} aprobada{stats!.APPROVED !== 1 ? 's' : ''}
              </span>
            )}
            {stats!.IN_STORE > 0 && (
              <span style={{ background: '#dcfce7', color: '#166534', fontSize: '0.8rem', fontWeight: 600, padding: '0.375rem 0.75rem', borderRadius: '2rem' }}>
                {stats!.IN_STORE} en tienda
              </span>
            )}
            {stats!.SOLD > 0 && (
              <span style={{ background: '#1E1914', color: '#E8E3D5', fontSize: '0.8rem', fontWeight: 600, padding: '0.375rem 0.75rem', borderRadius: '2rem' }}>
                {stats!.SOLD} vendida{stats!.SOLD !== 1 ? 's' : ''}
              </span>
            )}
            {stats!.REJECTED > 0 && (
              <span style={{ background: '#fee2e2', color: '#991b1b', fontSize: '0.8rem', fontWeight: 600, padding: '0.375rem 0.75rem', borderRadius: '2rem' }}>
                {stats!.REJECTED} rechazada{stats!.REJECTED !== 1 ? 's' : ''}
              </span>
            )}
            {stats!.RETURNED > 0 && (
              <span style={{ background: '#ffedd5', color: '#9a3412', fontSize: '0.8rem', fontWeight: 600, padding: '0.375rem 0.75rem', borderRadius: '2rem' }}>
                {stats!.RETURNED} devuelta{stats!.RETURNED !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          {getMenuItem('enviar').active && (
            <Link to="/dashboard/enviar" style={{ display: 'block', padding: '1.25rem', borderRadius: '1rem', textDecoration: 'none', background: '#1E1914', color: '#E8E3D5' }}>
              <div style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.25rem' }}>{getMenuItem('enviar').title}</div>
              <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>{getMenuItem('enviar').description}</div>
            </Link>
          )}
          {getMenuItem('solicitudes').active && (
            <Link to="/dashboard/mis-solicitudes" style={{ display: 'block', padding: '1.25rem', borderRadius: '1rem', textDecoration: 'none', background: '#E8E3D5', color: '#1E1914' }}>
              <div style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.25rem' }}>{getMenuItem('solicitudes').title}</div>
              <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>{getMenuItem('solicitudes').description}</div>
            </Link>
          )}
          {getMenuItem('reservas').active && (
            <Link to="/dashboard/mis-reservas" style={{ display: 'block', padding: '1.25rem', borderRadius: '1rem', textDecoration: 'none', background: '#E8E3D5', color: '#1E1914' }}>
              <div style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.25rem' }}>{getMenuItem('reservas').title}</div>
              <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>{getMenuItem('reservas').description}</div>
            </Link>
          )}
          {miniShopsEnabled && getMenuItem('tiendas').active && (
            <Link to="/dashboard/tiendas" style={{ display: 'block', padding: '1.25rem', borderRadius: '1rem', textDecoration: 'none', background: '#E8E3D5', color: '#1E1914' }}>
              <div style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.25rem' }}>{getMenuItem('tiendas').title}</div>
              <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>{getMenuItem('tiendas').description}</div>
            </Link>
          )}
          {getMenuItem('perfil').active && (
            <Link to="/dashboard/perfil" style={{ display: 'block', padding: '1.25rem', borderRadius: '1rem', textDecoration: 'none', background: '#E8E3D5', color: '#1E1914' }}>
              <div style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.25rem' }}>{getMenuItem('perfil').title}</div>
              <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>{getMenuItem('perfil').description}</div>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
