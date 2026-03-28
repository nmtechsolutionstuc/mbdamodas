import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuthStore()

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FAF8F3' }}>
        <div style={{
          width: '36px', height: '36px', borderRadius: '50%',
          border: '3px solid #E8E3D5',
          borderTopColor: '#1E1914',
          animation: 'spin 0.75s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />

  return <>{children}</>
}
