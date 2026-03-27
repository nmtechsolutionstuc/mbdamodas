import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { fetchAdminSubmissions } from '../../api/admin'
import { StatusBadge } from '../../components/catalog/StatusBadge'
import { ListRowSkeleton } from '../../components/ui/Skeleton'
import type { SubmissionItemStatus } from '../../types'

interface AdminSubmission {
  id: string
  createdAt: string
  seller: { firstName: string; lastName: string; email: string }
  items: { id: string; title: string; status: SubmissionItemStatus; photos: { url: string }[] }[]
}

type Filter = 'PENDING' | 'IN_STORE' | ''

const FILTERS: { label: string; value: Filter }[] = [
  { label: 'Pendientes', value: 'PENDING' },
  { label: 'En tienda', value: 'IN_STORE' },
  { label: 'Todas', value: '' },
]

export function AdminSubmissionsPage() {
  const [submissions, setSubmissions] = useState<AdminSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<Filter>('PENDING')

  const load = useCallback((f: Filter) => {
    setLoading(true)
    fetchAdminSubmissions(f || undefined)
      .then((r: { data: AdminSubmission[] }) => setSubmissions(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load(filter) }, [filter, load])

  return (
    <div style={{ minHeight: '100vh', background: '#FAF8F3', padding: '1.5rem' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <Link to="/admin" style={{ color: '#6b7280', textDecoration: 'none', fontSize: '0.9rem' }}>← Panel</Link>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.75rem', fontWeight: 700, color: '#1E1914' }}>
            Solicitudes
          </h1>
        </div>

        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
          {FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              style={{
                padding: '0.5rem 1.125rem',
                borderRadius: '2rem',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: 600,
                transition: 'all 0.15s',
                background: filter === f.value ? '#1E1914' : '#E8E3D5',
                color: filter === f.value ? '#E8E3D5' : '#1E1914',
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {Array.from({ length: 4 }).map((_, i) => <ListRowSkeleton key={i} />)}
          </div>
        ) : submissions.length === 0 ? (
          <p style={{ color: '#9ca3af', textAlign: 'center', padding: '3rem' }}>
            {filter === 'PENDING' ? 'No hay solicitudes pendientes. ¡Al día!' :
             filter === 'IN_STORE' ? 'No hay productos en tienda actualmente.' :
             'No hay solicitudes.'}
          </p>
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
