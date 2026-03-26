import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuthStore } from '../../store/authStore'
import { updateProfile } from '../../api/auth'

const schema = z.object({
  firstName: z.string().min(1, 'Requerido'),
  lastName: z.string().min(1, 'Requerido'),
  phone: z.string().max(20).optional().or(z.literal('')),
})

type FormData = z.infer<typeof schema>

export function ProfilePage() {
  const { user, setAuth, accessToken } = useAuthStore()
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

  async function onSubmit(values: FormData) {
    setError(null)
    try {
      const updated = await updateProfile({
        firstName: values.firstName,
        lastName: values.lastName,
        phone: values.phone || null,
      })
      setAuth(updated, accessToken!)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch {
      setError('No se pudo guardar. Intentá de nuevo.')
    }
  }

  return (
    <div className="min-h-screen p-6" style={{ background: '#FAF8F3' }}>
      <div className="max-w-md mx-auto">
        <h1
          className="text-3xl font-bold mb-6"
          style={{ fontFamily: "'Playfair Display', serif", color: '#1E1914' }}
        >
          Mi perfil
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: '#1E1914' }}>
              Nombre
            </label>
            <input
              {...register('firstName')}
              className="w-full px-4 py-3 rounded-xl border text-base"
              style={{ borderColor: '#E8E3D5', background: '#fff', color: '#1E1914' }}
            />
            {errors.firstName && (
              <p className="text-sm mt-1" style={{ color: '#ef4444' }}>{errors.firstName.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: '#1E1914' }}>
              Apellido
            </label>
            <input
              {...register('lastName')}
              className="w-full px-4 py-3 rounded-xl border text-base"
              style={{ borderColor: '#E8E3D5', background: '#fff', color: '#1E1914' }}
            />
            {errors.lastName && (
              <p className="text-sm mt-1" style={{ color: '#ef4444' }}>{errors.lastName.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: '#1E1914' }}>
              Número de WhatsApp
            </label>
            <p className="text-sm mb-2" style={{ color: '#6b7280' }}>
              Lo usamos para avisarte cuando tu prenda sea aprobada, vendida o devuelta.
            </p>
            <input
              {...register('phone')}
              placeholder="Ej: 5491112345678"
              className="w-full px-4 py-3 rounded-xl border text-base"
              style={{ borderColor: '#E8E3D5', background: '#fff', color: '#1E1914' }}
            />
            <p className="text-xs mt-1" style={{ color: '#9ca3af' }}>
              Formato internacional sin + ni espacios (ej: 5491112345678)
            </p>
          </div>

          {error && (
            <p className="text-sm p-3 rounded-lg" style={{ background: '#fee2e2', color: '#dc2626' }}>
              {error}
            </p>
          )}

          {saved && (
            <p className="text-sm p-3 rounded-lg" style={{ background: '#dcfce7', color: '#16a34a' }}>
              ✓ Datos guardados correctamente
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="py-3 px-6 rounded-xl font-medium text-base mt-2"
            style={{
              background: '#1E1914',
              color: '#E8E3D5',
              opacity: isSubmitting ? 0.7 : 1,
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              border: 'none',
            }}
          >
            {isSubmitting ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </form>
      </div>
    </div>
  )
}
