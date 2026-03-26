import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { fetchAdminSubmissions } from '../../api/admin'
import { StatusBadge } from '../../components/catalog/StatusBadge'
import type { SubmissionItemStatus } from '../../types'

interface AdminSubmission {
  id: string
  createdAt: string
  seller: { firstName: string; lastName: string; email: string }
  items: { id: string; title: string; status: SubmissionItemStatus; photos: { url: string }[] }[]
}

export function AdminSubmissionsPage() {
  const [submissions, setSubmissions] = useState<AdminSubmission[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAdminSubmissions()
      .then((r: { data: AdminSubmission[] }) => setSubmissions(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: '#FAF8F3', padding: '1.5rem' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <Link to="/admin" style={{ color: '#6b7280', textDecoration: 'none', fontSize: '0.9rem' }}>← Panel</Link>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.75rem', fontWeight: 700, color: '#1E1914' }}>
            Solicitudes
          </h1>
        </div>

        {loading ? (
          <p style={{ color: '#9ca3af', textAlign: 'center', padding: '3rem' }}>Cargando...</p>
        ) : submissions.length === 0 ? (
          <p style={{ color: '#9ca3af', textAlign: 'center', padding: '3rem' }}>No hay solicitudes.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {submissions.map(sub => (
              <div key={sub.id} style={{ background: '#fff', border: '1px solid #E8E3D5', borderRadius: '1rem', padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.875rem' }}>
                  <div>
                    <p style={{ fontWeight: 600, color: '#1E1914' }}>
                      {sub.seller.firstName} {sub.seller.lastName}
                    </p>
                    <p style={{ fontSize: '0.8rem', color: '#9ca3af' }}>
                      {sub.seller.email} · {new Date(sub.createdAt).toLocaleDateString('es-AR')}
                    </p>
                  </div>
                  <Link
                    to={`/admin/solicitudes/${sub.id}`}
                    style={{ background: '#1E1914', color: '#E8E3D5', padding: '0.5rem 1rem', borderRadius: '0.75rem', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 600 }}
                  >
                    Revisar
                  </Link>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {sub.items.map(it => (
                    <div key={it.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#FAF8F3', padding: '0.375rem 0.75rem', borderRadius: '0.75rem' }}>
                      {it.photos[0] && (
                        <img src={it.photos[0].url} alt="" style={{ width: '28px', height: '28px', borderRadius: '0.375rem', objectFit: 'cover' }} />
                      )}
                      <span style={{ fontSize: '0.8rem', color: '#1E1914' }}>{it.title}</span>
                      <StatusBadge status={it.status} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
