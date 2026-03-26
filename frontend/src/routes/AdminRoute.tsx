import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

export function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuthStore()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#FAF8F3' }}>
        <span style={{ color: '#1E1914' }}>Cargando...</span>
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />
  if (user.role !== 'ADMIN') return <Navigate to="/dashboard" replace />

  return <>{children}</>
}
