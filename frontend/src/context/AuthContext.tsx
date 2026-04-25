import { createContext, useContext, useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { useAuthStore } from '../store/authStore'
import { fetchMe } from '../api/auth'

interface AuthContextValue {
  isAuthenticated: boolean
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextValue>({ isAuthenticated: false, isAdmin: false })

// Flag a nivel de módulo para evitar refresh concurrentes (StrictMode ejecuta useEffect 2 veces)
let refreshInProgress = false

export function AuthProvider({ children }: { children: ReactNode }) {
  const { accessToken, user, setAuth, clearAuth, setLoading } = useAuthStore()
  const didRun = useRef(false)

  // Al montar:
  // 1. Si hay token + user en localStorage (via Zustand persist) → listos, solo detener loader
  // 2. Si hay token pero no user (inconsistencia) → pedir /me
  // 3. Si no hay token → intentar refresh silencioso con la cookie httpOnly
  useEffect(() => {
    // Evitar doble ejecución en StrictMode
    if (didRun.current) return
    didRun.current = true

    // Caso 1: estado completo restaurado desde localStorage
    if (accessToken && user) {
      setLoading(false)
      return
    }

    // Caso 2: token en memoria pero sin datos de usuario (raro, por consistencia)
    if (accessToken && !user) {
      fetchMe()
        .then(u => setAuth(u, accessToken))
        .catch(() => clearAuth())
      return
    }

    // Caso 3: sin token → intentar renovar silenciosamente con la cookie
    if (!accessToken) {
      if (refreshInProgress) return
      refreshInProgress = true

      import('../api/axiosClient').then(({ default: axiosClient }) => {
        axiosClient
          .post('/auth/refresh')
          .then(({ data }) => {
            const newToken: string = data.data.accessToken
            useAuthStore.getState().setLoading(true)
            useAuthStore.setState({ accessToken: newToken })
            return fetchMe().then(u => setAuth(u, newToken))
          })
          .catch(() => {
            if (!useAuthStore.getState().user) {
              clearAuth()
            } else {
              setLoading(false)
            }
          })
          .finally(() => {
            refreshInProgress = false
          })
      })
    }
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
