import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { register as registerUser } from '../../api/auth'
import { useAuthStore } from '../../store/authStore'

const schema = z.object({
  firstName: z.string().min(1, 'Requerido').max(50),
  lastName: z.string().min(1, 'Requerido').max(50),
  dni: z.string().min(7, 'Mínimo 7 dígitos').max(10, 'Máximo 10 dígitos').regex(/^\d+$/, 'Solo números'),
  phone: z.string().min(6, 'Requerido').max(20, 'Demasiado largo').regex(/^\d+$/, 'Solo números, sin + ni espacios'),
  email: z.string().email('Email inválido'),
  password: z.string()
    .min(8, 'Mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
    .regex(/[a-z]/, 'Debe contener al menos una minúscula')
    .regex(/[0-9]/, 'Debe contener al menos un número'),
  confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
})

type FormData = z.infer<typeof schema>

export function RegisterPage() {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()
  const [serverError, setServerError] = useState<string | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<string>('EFECTIVO')
  const [bankAlias, setBankAlias] = useState<string>('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  async function onSubmit(values: FormData) {
    setServerError(null)
    try {
      // NOTE: backend register does not yet accept paymentMethod/bankAlias.
      // These will be saved via updateProfile after registration if needed.
      const { user, accessToken } = await registerUser({
        firstName: values.firstName,
        lastName: values.lastName,
        dni: values.dni,
        phone: values.phone,
        email: values.email,
        password: values.password,
      })
      setAuth(user, accessToken)
      navigate('/dashboard', { replace: true })
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status
      if (status === 409) {
        setServerError('Ese email ya está registrado. ¿Querés iniciar sesión?')
      } else if (status === 400) {
        setServerError('Revisá los datos ingresados.')
      } else {
        setServerError('Ocurrió un error. Intentá de nuevo.')
      }
    }
  }

  const inp = { padding: '0.75rem 1rem', borderRadius: '0.75rem', border: '1px solid #E8E3D5', width: '100%', fontSize: '1rem', color: '#1E1914', background: '#fff', boxSizing: 'border-box' as const }
  const lbl = { display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#1E1914', marginBottom: '0.375rem' } as const
  const err = { fontSize: '0.8rem', color: '#dc2626', marginTop: '0.25rem' }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', background: '#FAF8F3' }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '2rem', fontWeight: 700, color: '#1E1914', marginBottom: '0.375rem', textAlign: 'center' }}>
          Crear cuenta
        </h1>
        <p style={{ color: '#6b7280', textAlign: 'center', marginBottom: '2rem' }}>
          Vendé tus productos en MBDA Modas
        </p>

        <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={lbl}>Nombre</label>
              <input {...register('firstName')} placeholder="Ana" style={inp} />
              {errors.firstName && <p style={err}>{errors.firstName.message}</p>}
            </div>
            <div>
              <label style={lbl}>Apellido</label>
              <input {...register('lastName')} placeholder="García" style={inp} />
              {errors.lastName && <p style={err}>{errors.lastName.message}</p>}
            </div>
          </div>

          <div>
            <label style={lbl}>DNI *</label>
            <input {...register('dni')} inputMode="numeric" placeholder="12345678" style={inp} />
            {errors.dni && <p style={err}>{errors.dni.message}</p>}
          </div>

          <div>
            <label style={lbl}>Número de WhatsApp *</label>
            <input {...register('phone')} inputMode="numeric" placeholder="Ej: 5491112345678" style={inp} />
            <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.25rem' }}>
              Solo números, sin + ni espacios (ej: 5491112345678)
            </p>
            {errors.phone && <p style={err}>{errors.phone.message}</p>}
          </div>

          <div>
            <label style={lbl}>Email</label>
            <input {...register('email')} type="email" autoComplete="email" placeholder="tu@email.com" style={inp} />
            {errors.email && <p style={err}>{errors.email.message}</p>}
          </div>

          <div>
            <label style={lbl}>Contraseña</label>
            <input {...register('password')} type="password" autoComplete="new-password" placeholder="Mín 8, mayúscula, minúscula y número" style={inp} />
            {errors.password && <p style={err}>{errors.password.message}</p>}
          </div>

          <div>
            <label style={lbl}>Confirmar contraseña</label>
            <input {...register('confirmPassword')} type="password" autoComplete="new-password" placeholder="••••••••" style={inp} />
            {errors.confirmPassword && <p style={err}>{errors.confirmPassword.message}</p>}
          </div>

          {/* Método de pago */}
          <div>
            <label style={lbl}>¿Cómo preferís recibir tus pagos?</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.25rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem', color: '#1E1914', fontFamily: "'Inter', sans-serif" }}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="EFECTIVO"
                  checked={paymentMethod === 'EFECTIVO'}
                  onChange={() => setPaymentMethod('EFECTIVO')}
                  style={{ accentColor: '#1E1914', width: '16px', height: '16px' }}
                />
                Efectivo (retirás en tienda)
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem', color: '#1E1914', fontFamily: "'Inter', sans-serif" }}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="TRANSFERENCIA"
                  checked={paymentMethod === 'TRANSFERENCIA'}
                  onChange={() => setPaymentMethod('TRANSFERENCIA')}
                  style={{ accentColor: '#1E1914', width: '16px', height: '16px' }}
                />
                Transferencia bancaria
              </label>
            </div>
            {paymentMethod === 'TRANSFERENCIA' && (
              <div style={{ marginTop: '0.5rem' }}>
                <label style={{ ...lbl, fontSize: '0.8rem' }}>Alias o CVU</label>
                <input
                  value={bankAlias}
                  onChange={e => setBankAlias(e.target.value)}
                  placeholder="Ej: mi.alias.mp"
                  style={inp}
                />
              </div>
            )}
          </div>

          {serverError && (
            <div style={{ background: '#fee2e2', color: '#dc2626', padding: '0.75rem 1rem', borderRadius: '0.75rem', fontSize: '0.875rem' }}>
              {serverError}
              {serverError.includes('¿Querés iniciar') && (
                <> <Link to="/login" style={{ color: '#991b1b', fontWeight: 600 }}>Ir al login</Link></>
              )}
            </div>
          )}

          <label style={{ display: 'flex', gap: '0.625rem', alignItems: 'flex-start', cursor: 'pointer', fontSize: '0.8rem', color: '#6b7280' }}>
            <input type="checkbox" required style={{ marginTop: '0.125rem', flexShrink: 0 }} />
            <span>
              Acepto los{' '}
              <Link to="/terminos-y-condiciones" target="_blank" style={{ color: '#1E1914', fontWeight: 600, textDecoration: 'underline' }}>
                Términos y Condiciones
              </Link>
              {' '}de consignación de MBDA Modas
            </span>
          </label>

          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              background: '#1E1914', color: '#E8E3D5', padding: '0.875rem', borderRadius: '0.875rem',
              border: 'none', fontSize: '1rem', fontWeight: 600,
              cursor: isSubmitting ? 'not-allowed' : 'pointer', opacity: isSubmitting ? 0.7 : 1,
            }}
          >
            {isSubmitting ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: '#6b7280' }}>
          ¿Ya tenés cuenta?{' '}
          <Link to="/login" style={{ color: '#1E1914', fontWeight: 600, textDecoration: 'none' }}>
            Iniciá sesión
          </Link>
        </p>
      </div>
    </div>
  )
}
