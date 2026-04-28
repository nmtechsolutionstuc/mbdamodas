import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { login } from '../../api/auth'
import { useAuthStore } from '../../store/authStore'
import { usePlatformStore } from '../../store/platformStore'

const schema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Ingresá tu contraseña'),
})

type FormData = z.infer<typeof schema>

export function LoginPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { setAuth } = useAuthStore()
  const { platformName } = usePlatformStore()
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  async function onSubmit(values: FormData) {
    setServerError(null)
    try {
      const { user, accessToken } = await login(values.email, values.password)
      setAuth(user, accessToken)
      navigate(user.role === 'ADMIN' ? '/admin' : '/dashboard', { replace: true })
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status
      if (status === 401) {
        setServerError('Email o contraseña incorrectos')
      } else {
        setServerError('Ocurrió un error. Intentá de nuevo.')
      }
    }
  }

  const inp = { padding: '0.75rem 1rem', borderRadius: '0.75rem', border: '1px solid #E8E3D5', width: '100%', fontSize: '1rem', color: '#1E1914', background: '#fff', boxSizing: 'border-box' as const }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', background: '#FAF8F3' }}>
      <div style={{ width: '100%', maxWidth: '380px' }}>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '2rem', fontWeight: 700, color: '#1E1914', marginBottom: '0.375rem', textAlign: 'center' }}>
          {platformName}
        </h1>
        <p style={{ color: '#6b7280', textAlign: 'center', marginBottom: '2rem' }}>
          Ingresá a tu cuenta
        </p>

        {searchParams.get('error') === 'inactivo' && (
          <div style={{ background: '#fee2e2', color: '#dc2626', padding: '0.75rem 1rem', borderRadius: '0.75rem', marginBottom: '1.25rem', fontSize: '0.875rem' }}>
            Tu cuenta fue desactivada. Contactá al administrador.
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#1E1914', marginBottom: '0.375rem' }}>
              Email
            </label>
            <input {...register('email')} type="email" autoComplete="email" placeholder="tu@email.com" style={inp} />
            {errors.email && <p style={{ fontSize: '0.8rem', color: '#dc2626', marginTop: '0.25rem' }}>{errors.email.message}</p>}
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#1E1914', marginBottom: '0.375rem' }}>
              Contraseña
            </label>
            <input {...register('password')} type="password" autoComplete="current-password" placeholder="••••••••" style={inp} />
            {errors.password && <p style={{ fontSize: '0.8rem', color: '#dc2626', marginTop: '0.25rem' }}>{errors.password.message}</p>}
          </div>

          {serverError && (
            <div style={{ background: '#fee2e2', color: '#dc2626', padding: '0.75rem 1rem', borderRadius: '0.75rem', fontSize: '0.875rem' }}>
              {serverError}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              background: '#1E1914', color: '#E8E3D5', padding: '0.875rem', borderRadius: '0.875rem',
              border: 'none', fontSize: '1rem', fontWeight: 600,
              cursor: isSubmitting ? 'not-allowed' : 'pointer', opacity: isSubmitting ? 0.7 : 1, marginTop: '0.25rem',
            }}
          >
            {isSubmitting ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: '#6b7280' }}>
          ¿No tenés cuenta?{' '}
          <Link to="/register" style={{ color: '#1E1914', fontWeight: 600, textDecoration: 'none' }}>
            Registrate
          </Link>
        </p>

        <p style={{ textAlign: 'center', marginTop: '0.75rem', fontSize: '0.75rem', color: '#9ca3af' }}>
          Al ingresar aceptás nuestros{' '}
          <Link to="/terminos-y-condiciones" style={{ color: '#6b7280', textDecoration: 'underline' }}>
            Términos y Condiciones
          </Link>
        </p>
      </div>
    </div>
  )
}
