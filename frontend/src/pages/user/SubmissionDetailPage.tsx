import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { fetchMySubmissionById } from '../../api/submissions'
import { StatusBadge } from '../../components/catalog/StatusBadge'
import type { Submission } from '../../types'
import { CONDITION_LABELS } from '../../types'

export function SubmissionDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [submission, setSubmission] = useState<Submission | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    fetchMySubmissionById(id)
      .then(setSubmission)
      .catch(() => setSubmission(null))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#FAF8F3', padding: '1.5rem' }}>
      <div style={{ maxWidth: '700px', margin: '0 auto' }}>
        <div style={{ height: '0.75rem', width: '100px', background: '#E8E3D5', borderRadius: '0.5rem', marginBottom: '1.5rem' }} className="mbda-shimmer" />
        <div style={{ height: '1.75rem', width: '60%', background: '#E8E3D5', borderRadius: '0.5rem', marginBottom: '0.5rem' }} className="mbda-shimmer" />
        <div style={{ height: '0.75rem', width: '40%', background: '#E8E3D5', borderRadius: '0.5rem', marginBottom: '1.5rem' }} className="mbda-shimmer" />
        {[1,2,3].map(i => (
          <div key={i} style={{ background: '#fff', border: '1px solid #E8E3D5', borderRadius: '1rem', padding: '1.25rem', marginBottom: '1rem', display: 'grid', gridTemplateColumns: '80px 1fr', gap: '1rem' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '0.75rem', background: '#E8E3D5' }} className="mbda-shimmer" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ height: '1rem', width: '70%', background: '#E8E3D5', borderRadius: '0.5rem' }} className="mbda-shimmer" />
              <div style={{ height: '0.75rem', width: '50%', background: '#E8E3D5', borderRadius: '0.5rem' }} className="mbda-shimmer" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
  if (!submission) return (
    <div style={{ padding: '2rem' }}>
      <p style={{ color: '#6b7280' }}>Solicitud no encontrada.</p>
      <Link to="/dashboard/mis-solicitudes" style={{ color: '#1E1914', fontWeight: 600 }}>← Volver</Link>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#FAF8F3', padding: '1.5rem' }}>
      <div style={{ maxWidth: '700px', margin: '0 auto' }}>
        <Link to="/dashboard/mis-solicitudes" style={{ color: '#6b7280', textDecoration: 'none', fontSize: '0.9rem', display: 'inline-block', marginBottom: '1.5rem' }}>
          ← Mis solicitudes
        </Link>

        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.75rem', fontWeight: 700, color: '#1E1914', marginBottom: '0.375rem' }}>
          Solicitud
        </h1>
        <p style={{ fontSize: '0.875rem', color: '#9ca3af', marginBottom: '1.5rem' }}>
          {new Date(submission.createdAt).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })}
          {' · '}{submission.items.length} {submission.items.length === 1 ? 'producto' : 'productos'}
        </p>

        {submission.adminNote && (
          <div style={{ background: '#fef9c3', border: '1px solid #fde047', borderRadius: '0.75rem', padding: '0.875rem 1rem', marginBottom: '1.5rem', fontSize: '0.875rem', color: '#854d0e' }}>
            <strong>Nota del administrador:</strong> {submission.adminNote}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {submission.items.map((item, i) => {
            const cover = item.photos[0]
            return (
              <div key={item.id} style={{ background: '#fff', border: '1px solid #E8E3D5', borderRadius: '1rem', padding: '1.25rem', display: 'grid', gridTemplateColumns: '80px 1fr', gap: '1rem' }}>
                {/* Foto */}
                <div style={{ width: '80px', height: '80px', borderRadius: '0.75rem', overflow: 'hidden', background: '#E8E3D5', flexShrink: 0 }}>
                  {cover ? <img src={cover.url} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : null}
                </div>

                {/* Info */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.375rem' }}>
                    <span style={{ fontWeight: 600, color: '#1E1914' }}>
                      {i + 1}. {item.title}
                    </span>
                    <StatusBadge status={item.status} />
                  </div>
                  <p style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                    {item.productType?.name ?? ''}{item.size ? ` · Talle ${item.size.name}` : ''} · {CONDITION_LABELS[item.condition]}
                  </p>
                  <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1E1914' }}>
                    ${item.desiredPrice.toLocaleString('es-AR')}
                  </p>
                  {item.adminComment && (
                    <p style={{ fontSize: '0.8rem', color: '#dc2626', marginTop: '0.375rem' }}>
                      Nota: {item.adminComment}
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
