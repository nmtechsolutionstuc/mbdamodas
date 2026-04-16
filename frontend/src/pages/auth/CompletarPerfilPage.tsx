import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { updateProfile } from '../../api/auth'
import { useAuthStore } from '../../store/authStore'

export function CompletarPerfilPage() {
  const navigate = useNavigate()
  const { user, setAuth, accessToken } = useAuthStore()
  const [phone, setPhone] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const inp = {
    width: '100%', padding: '0.875rem 1rem', borderRadius: '0.875rem',
    border: '1px solid #E8E3D5', fontSize: '1.05rem', color: '#1E1914',
    background: '#fff', boxSizing: 'border-box' as const,
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const clean = phone.trim().replace(/\D/g, '')
    if (clean.length < 6) {
      setError('Ingresá un número válido (solo números, sin + ni espacios)')
      return
    }

    setLoading(true)
    try {
      const updated = await updateProfile({ phone: clean })
      setAuth(updated, accessToken!)
      navigate('/dashboard', { replace: true })
    } catch {
      setError('No se pudo guardar. Intentá de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', background: '#FAF8F3' }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '2rem', fontWeight: 700, color: '#1E1914', marginBottom: '0.5rem', textAlign: 'center' }}>
          ¡Hola, {user?.firstName}!
        </h1>
        <p style={{ color: '#6b7280', textAlign: 'center', marginBottom: '2rem', fontSize: '0.95rem' }}>
          Para continuar necesitamos tu número de WhatsApp. Lo usamos para avisarte cuando tu prenda sea aprobada, vendida o devuelta.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#1E1914', marginBottom: '0.5rem' }}>
              Número de WhatsApp *
            </label>
            <input
              type="tel"
              inputMode="numeric"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="Ej: 5491112345678"
              style={inp}
              autoFocus
            />
            <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.375rem' }}>
              Solo números, sin + ni espacios (ej: 5491112345678)
            </p>
          </div>

          {error && (
            <div style={{ background: '#fee2e2', color: '#dc2626', padding: '0.75rem 1rem', borderRadius: '0.875rem', fontSize: '0.875rem' }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              background: '#1E1914', color: '#E8E3D5', padding: '0.95rem',
              borderRadius: '0.875rem', border: 'none', fontSize: '1rem',
              fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1, marginTop: '0.25rem',
            }}
          >
            {loading ? 'Guardando...' : 'Continuar'}
          </button>
        </form>
      </div>
    </div>
  )
}
