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

  // Al montar: si hay token en memoria intentar obtener el usuario;
  // si no, intentar renovar con el refresh token (httpOnly cookie)
  useEffect(() => {
    // Evitar doble ejecución en StrictMode
    if (didRun.current) return
    didRun.current = true

    if (accessToken && !user) {
      fetchMe()
        .then(u => setAuth(u, accessToken))
        .catch(() => clearAuth())
      return
    }
    if (!accessToken) {
      if (refreshInProgress) return
      refreshInProgress = true

      // Intenta renovar silenciosamente
      import('../api/axiosClient').then(({ default: axiosClient }) => {
        axiosClient
          .post('/auth/refresh')
          .then(({ data }) => {
            const newToken: string = data.data.accessToken
            // Guardar el token en el store ANTES de llamar a fetchMe
            // para que el interceptor de axiosClient lo use
            useAuthStore.getState().setLoading(true)
            useAuthStore.setState({ accessToken: newToken })
            return fetchMe().then(u => {
              setAuth(u, newToken)
            })
          })
          .catch(() => {
            // Solo limpiar si no se autenticó por otro camino (ej: register/login)
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
    } else {
      setLoading(false)
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
