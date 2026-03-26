import { useAuthStore } from '../../store/authStore'
import { Link } from 'react-router-dom'

export function UserDashboardPage() {
  const { user } = useAuthStore()

  return (
    <div className="min-h-screen p-6" style={{ background: '#FAF8F3' }}>
      <div className="max-w-2xl mx-auto">
        <h1
          className="text-3xl font-bold mb-1"
          style={{ fontFamily: "'Playfair Display', serif", color: '#1E1914' }}
        >
          Hola, {user?.firstName}
        </h1>
        <p className="mb-8" style={{ color: '#6b7280' }}>¿Qué querés hacer hoy?</p>

        <div className="grid gap-4">
          <Link
            to="/dashboard/enviar"
            className="block p-5 rounded-2xl text-left transition-all"
            style={{ background: '#1E1914', color: '#E8E3D5', textDecoration: 'none' }}
          >
            <div className="text-lg font-semibold mb-1">Enviar mis prendas</div>
            <div className="text-sm opacity-70">Cargá tus prendas para que las revisemos</div>
          </Link>

          <Link
            to="/dashboard/mis-solicitudes"
            className="block p-5 rounded-2xl text-left transition-all"
            style={{ background: '#E8E3D5', color: '#1E1914', textDecoration: 'none' }}
          >
            <div className="text-lg font-semibold mb-1">Mis solicitudes</div>
            <div className="text-sm opacity-70">Seguí el estado de tus prendas</div>
          </Link>

          <Link
            to="/dashboard/perfil"
            className="block p-5 rounded-2xl text-left"
            style={{ background: '#E8E3D5', color: '#1E1914', textDecoration: 'none' }}
          >
            <div className="text-lg font-semibold mb-1">Mi perfil</div>
            <div className="text-sm opacity-70">Actualizá tus datos y número de WhatsApp</div>
          </Link>
        </div>
      </div>
    </div>
  )
}
