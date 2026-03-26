import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { fetchMySubmissions, cancelSubmission } from '../../api/submissions'
import { StatusBadge } from '../../components/catalog/StatusBadge'
import type { Submission } from '../../types'

export function MySubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMySubmissions()
      .then(r => setSubmissions(r.submissions))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  async function handleCancel(id: string) {
    if (!confirm('¿Cancelar esta solicitud? Esta acción no se puede deshacer.')) return
    try {
      await cancelSubmission(id)
      setSubmissions(prev => prev.filter(s => s.id !== id))
    } catch {
      alert('No se pudo cancelar. Solo podés cancelar solicitudes con todas las prendas en estado pendiente.')
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#FAF8F3', padding: '1.5rem' }}>
      <div style={{ maxWidth: '700px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.75rem', fontWeight: 700, color: '#1E1914' }}>
            Mis solicitudes
          </h1>
          <Link
            to="/dashboard/enviar"
            style={{ background: '#1E1914', color: '#E8E3D5', padding: '0.625rem 1.25rem', borderRadius: '0.75rem', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600 }}
          >
            + Nueva solicitud
          </Link>
        </div>

        {loading ? (
          <p style={{ color: '#9ca3af', textAlign: 'center', padding: '3rem' }}>Cargando...</p>
        ) : submissions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <p style={{ color: '#9ca3af', marginBottom: '1rem' }}>Todavía no enviaste ninguna solicitud.</p>
            <Link to="/dashboard/enviar" style={{ color: '#1E1914', fontWeight: 600 }}>Enviar mis primeras prendas →</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {submissions.map(sub => (
              <div key={sub.id} style={{ background: '#fff', border: '1px solid #E8E3D5', borderRadius: '1rem', padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.875rem' }}>
                  <div>
                    <p style={{ fontSize: '0.8rem', color: '#9ca3af' }}>
                      {new Date(sub.createdAt).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                    <p style={{ fontSize: '0.9rem', color: '#6b7280' }}>
                      {sub.items.length} {sub.items.length === 1 ? 'prenda' : 'prendas'}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <Link
                      to={`/dashboard/mis-solicitudes/${sub.id}`}
                      style={{ fontSize: '0.875rem', color: '#1E1914', fontWeight: 600, textDecoration: 'none' }}
                    >
                      Ver detalle →
                    </Link>
                  </div>
                </div>

                {/* Lista de prendas */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {sub.items.map(it => (
                    <div key={it.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderTop: '1px solid #f3f4f6' }}>
                      <span style={{ fontSize: '0.9rem', color: '#1E1914' }}>{it.title}</span>
                      <StatusBadge status={it.status} />
                    </div>
                  ))}
                </div>

                {/* Cancelar solo si todas están pendientes */}
                {sub.items.every(it => it.status === 'PENDING') && (
                  <button
                    onClick={() => handleCancel(sub.id)}
                    style={{ marginTop: '0.875rem', fontSize: '0.8rem', color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                  >
                    Cancelar solicitud
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
