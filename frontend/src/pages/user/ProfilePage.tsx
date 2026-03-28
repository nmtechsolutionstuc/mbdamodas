import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuthStore } from '../../store/authStore'
import { updateProfile } from '../../api/auth'
import { useToast } from '../../context/ToastContext'

const schema = z.object({
  firstName: z.string().min(1, 'Requerido'),
  lastName: z.string().min(1, 'Requerido'),
  phone: z.string().max(20).optional().or(z.literal('')),
})

type FormData = z.infer<typeof schema>

export function ProfilePage() {
  const { user, setAuth, accessToken } = useAuthStore()
  const { toast } = useToast()
  const [error, setError] = useState<string | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<string>(user?.paymentMethod ?? 'EFECTIVO')
  const [bankAlias, setBankAlias] = useState<string>(user?.bankAlias ?? '')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: user?.firstName ?? '',
      lastName: user?.lastName ?? '',
      phone: user?.phone ?? '',
    },
  })

  const labelStyle = { display: 'block', fontSize: '0.875rem', fontWeight: 500 as const, color: '#1E1914', marginBottom: '0.25rem' }
  const inputStyle = { width: '100%', padding: '0.75rem 1rem', borderRadius: '0.75rem', border: '1px solid #E8E3D5', fontSize: '1rem', color: '#1E1914', background: '#fff', boxSizing: 'border-box' as const }

  async function onSubmit(values: FormData) {
    setError(null)
    try {
      const updated = await updateProfile({
        firstName: values.firstName,
        lastName: values.lastName,
        phone: values.phone || null,
        paymentMethod: paymentMethod || null,
        bankAlias: paymentMethod === 'TRANSFERENCIA' ? (bankAlias || null) : null,
      })
      setAuth(updated, accessToken!)
      toast('Datos guardados correctamente', 'success')
    } catch {
      setError('No se pudo guardar. Intentá de nuevo.')
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#FAF8F3', padding: '1.5rem' }}>
      <div style={{ maxWidth: '460px', margin: '0 auto' }}>
        <h1
          style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.75rem', fontWeight: 700, color: '#1E1914', marginBottom: '1.5rem' }}
        >
          Mi perfil
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={labelStyle}>Nombre</label>
            <input {...register('firstName')} style={inputStyle} />
            {errors.firstName && (
              <p style={{ fontSize: '0.8rem', color: '#ef4444', marginTop: '0.25rem' }}>{errors.firstName.message}</p>
            )}
          </div>

          <div>
            <label style={labelStyle}>Apellido</label>
            <input {...register('lastName')} style={inputStyle} />
            {errors.lastName && (
              <p style={{ fontSize: '0.8rem', color: '#ef4444', marginTop: '0.25rem' }}>{errors.lastName.message}</p>
            )}
          </div>

          {user?.dni && (
            <div>
              <label style={labelStyle}>DNI</label>
              <input
                value={user.dni}
                disabled
                style={{ ...inputStyle, background: '#f3f4f6', color: '#6b7280', cursor: 'not-allowed' }}
              />
              <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.25rem' }}>
                El DNI no se puede modificar.
              </p>
            </div>
          )}

          <div>
            <label style={labelStyle}>Número de WhatsApp</label>
            <p style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '0.5rem' }}>
              Lo usamos para avisarte cuando tu producto sea aprobado, vendido o devuelto.
            </p>
            <input
              {...register('phone')}
              placeholder="Ej: 5491112345678"
              style={inputStyle}
            />
            <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.25rem' }}>
              Formato internacional sin + ni espacios (ej: 5491112345678)
            </p>
          </div>

          {/* Método de pago */}
          <div>
            <label style={labelStyle}>¿Cómo preferís recibir tus pagos?</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.375rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem', color: '#1E1914', fontFamily: "'Inter', sans-serif" }}>
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
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem', color: '#1E1914', fontFamily: "'Inter', sans-serif" }}>
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
              <div style={{ marginTop: '0.75rem' }}>
                <label style={{ ...labelStyle, fontSize: '0.8rem' }}>Alias o CVU</label>
                <input
                  value={bankAlias}
                  onChange={e => setBankAlias(e.target.value)}
                  placeholder="Ej: mi.alias.mp"
                  style={inputStyle}
                />
              </div>
            )}
          </div>

          {error && (
            <p style={{ background: '#fee2e2', color: '#dc2626', padding: '0.75rem 1rem', borderRadius: '0.75rem', fontSize: '0.875rem' }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              padding: '0.875rem 1.5rem',
              borderRadius: '0.875rem',
              border: 'none',
              fontSize: '1rem',
              fontWeight: 600,
              background: '#1E1914',
              color: '#E8E3D5',
              opacity: isSubmitting ? 0.7 : 1,
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              marginTop: '0.5rem',
            }}
          >
            {isSubmitting ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </form>
      </div>
    </div>
  )
}
