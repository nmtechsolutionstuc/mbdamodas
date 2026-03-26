import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { fetchMe } from '../../api/auth'

export function GoogleCallbackPage() {
  const navigate = useNavigate()
  const { setAuth, clearAuth } = useAuthStore()

  useEffect(() => {
    // El access token viene en el hash para que nunca llegue al servidor
    const hash = window.location.hash.slice(1)
    const params = new URLSearchParams(hash)
    const token = params.get('token')

    if (!token) {
      clearAuth()
      navigate('/login?error=no_token', { replace: true })
      return
    }

    fetchMe()
      .then(user => {
        setAuth(user, token)
        navigate(user.role === 'ADMIN' ? '/admin' : '/dashboard', { replace: true })
      })
      .catch(() => {
        clearAuth()
        navigate('/login?error=auth_failed', { replace: true })
      })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: '#FAF8F3' }}
    >
      <p style={{ color: '#1E1914', fontFamily: 'Inter, sans-serif' }}>Iniciando sesión...</p>
    </div>
  )
}
