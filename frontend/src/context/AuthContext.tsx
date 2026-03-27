import { createContext, useContext, useEffect } from 'react'
import type { ReactNode } from 'react'
import { useAuthStore } from '../store/authStore'
import { fetchMe } from '../api/auth'

interface AuthContextValue {
  isAuthenticated: boolean
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextValue>({ isAuthenticated: false, isAdmin: false })

export function AuthProvider({ children }: { children: ReactNode }) {
  const { accessToken, user, setAuth, clearAuth, setLoading } = useAuthStore()

  // Al montar: si hay token en memoria intentar obtener el usuario;
  // si no, intentar renovar con el refresh token (httpOnly cookie)
  useEffect(() => {
    let cancelled = false

    if (accessToken && !user) {
      fetchMe()
        .then(u => { if (!cancelled) setAuth(u, accessToken) })
        .catch(() => { if (!cancelled) clearAuth() })
      return () => { cancelled = true }
    }
    if (!accessToken) {
      // Intenta renovar silenciosamente
      import('../api/axiosClient').then(({ default: axiosClient }) => {
        axiosClient
          .post('/auth/refresh')
          .then(({ data }) => {
            const newToken: string = data.data.accessToken
            return fetchMe().then(u => {
              if (!cancelled) setAuth(u, newToken)
            })
          })
          .catch(() => {
            // Solo limpiar si no se autenticó por otro camino (ej: register/login)
            if (!cancelled && !useAuthStore.getState().user) {
              clearAuth()
            } else if (!cancelled) {
              setLoading(false)
            }
          })
      })
    } else {
      setLoading(false)
    }

    return () => { cancelled = true }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const value: AuthContextValue = {
    isAuthenticated: !!user,
    isAdmin: user?.role === 'ADMIN',
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
