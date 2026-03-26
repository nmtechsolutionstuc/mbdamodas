import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { fetchAdminUsers, deactivateUser } from '../../api/admin'
import { ListRowSkeleton } from '../../components/ui/Skeleton'
import { useToast } from '../../context/ToastContext'

interface AdminUser {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string | null
  role: 'USER' | 'ADMIN'
  isActive: boolean
  createdAt: string
  _count: { submissions: number }
}

export function AdminUsersPage() {
  const { toast } = useToast()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [confirmingDeactivateId, setConfirmingDeactivateId] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const limit = 20

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400)
    return () => clearTimeout(t)
  }, [search])

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch])

  useEffect(() => {
    loadUsers()
  }, [page, debouncedSearch])

  async function loadUsers() {
    setLoading(true)
    try {
      const result = await fetchAdminUsers(page, debouncedSearch)
      setUsers(result.data)
      setTotal(result.meta?.total ?? 0)
    } catch {
      toast('Error al cargar usuarios', 'error')
    } finally {
      setLoading(false)
    }
  }

  async function handleDeactivate(userId: string) {
    setActionLoading(userId)
    try {
      await deactivateUser(userId)
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, isActive: false } : u))
      toast('Usuario desactivado', 'success')
    } catch {
      toast('Error al desactivar usuario', 'error')
    } finally {
      setActionLoading(null)
      setConfirmingDeactivateId(null)
    }
  }

  const totalPages = Math.ceil(total / limit)

  return (
    <div style={{ minHeight: '100vh', background: '#FAF8F3', padding: '1.5rem' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <Link to="/admin" style={{ color: '#6b7280', textDecoration: 'none', fontSize: '0.9rem' }}>← Panel</Link>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.75rem', fontWeight: 700, color: '#1E1914' }}>
            Usuarios
          </h1>
          {total > 0 && (
            <span style={{ background: '#E8E3D5', color: '#1E1914', fontSize: '0.8rem', padding: '0.25rem 0.75rem', borderRadius: '999px', fontWeight: 600 }}>
              {total}
            </span>
          )}
        </div>

        {/* Buscador */}
        <input
          type="text"
          placeholder="Buscar por nombre o email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            width: '100%',
            border: '1px solid #E8E3D5',
            borderRadius: '0.75rem',
            padding: '0.75rem 1rem',
            fontSize: '0.9rem',
            marginBottom: '1.5rem',
            background: '#fff',
            outline: 'none',
          }}
        />

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {Array.from({ length: 5 }).map((_, i) => <ListRowSkeleton key={i} />)}
          </div>
        ) : users.length === 0 ? (
          <p style={{ color: '#9ca3af', textAlign: 'center', padding: '3rem' }}>No se encontraron usuarios.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {users.map(user => (
              <div
                key={user.id}
                style={{
                  background: '#fff',
                  border: `1px solid ${user.isActive ? '#E8E3D5' : '#f3f4f6'}`,
                  borderRadius: '1rem',
                  padding: '1rem 1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  opacity: user.isActive ? 1 : 0.55,
                }}
              >
                {/* Avatar placeholder */}
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  background: '#E8E3D5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  color: '#1E1914',
                  flexShrink: 0,
                }}>
                  {user.firstName.charAt(0).toUpperCase()}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 600, color: '#1E1914', fontSize: '0.95rem' }}>
                      {user.firstName} {user.lastName}
                    </span>
                    {user.role === 'ADMIN' && (
                      <span style={{ background: '#1E1914', color: '#E8E3D5', fontSize: '0.7rem', padding: '0.1rem 0.5rem', borderRadius: '999px', fontWeight: 600 }}>
                        ADMIN
                      </span>
                    )}
                    {!user.isActive && (
                      <span style={{ background: '#fee2e2', color: '#dc2626', fontSize: '0.7rem', padding: '0.1rem 0.5rem', borderRadius: '999px' }}>
                        inactivo
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: '0.8rem', color: '#6b7280', margin: '0.1rem 0' }}>{user.email}</p>
                  <p style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                    {user.phone ? `📱 ${user.phone}` : '📱 Sin teléfono'} · {user._count.submissions} solicitud{user._count.submissions !== 1 ? 'es' : ''} · Desde {new Date(user.createdAt).toLocaleDateString('es-AR', { month: 'short', year: 'numeric' })}
                  </p>
                </div>

                {/* Acciones */}
                <div style={{ flexShrink: 0 }}>
                  {user.isActive && user.role !== 'ADMIN' && (
                    confirmingDeactivateId === user.id ? (
                      <div style={{ display: 'flex', gap: '0.375rem' }}>
                        <button
                          onClick={() => handleDeactivate(user.id)}
                          disabled={actionLoading === user.id}
                          style={{ background: '#dc2626', color: '#fff', border: 'none', borderRadius: '0.5rem', padding: '0.375rem 0.75rem', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}
                        >
                          Sí
                        </button>
                        <button
                          onClick={() => setConfirmingDeactivateId(null)}
                          style={{ background: '#E8E3D5', color: '#1E1914', border: 'none', borderRadius: '0.5rem', padding: '0.375rem 0.75rem', cursor: 'pointer', fontSize: '0.75rem' }}
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmingDeactivateId(user.id)}
                        disabled={actionLoading === user.id}
                        style={{
                          background: 'transparent',
                          color: '#dc2626',
                          border: '1px solid #dc2626',
                          borderRadius: '0.5rem',
                          padding: '0.375rem 0.875rem',
                          cursor: 'pointer',
                          fontSize: '0.8rem',
                          fontWeight: 500,
                        }}
                      >
                        Desactivar
                      </button>
                    )
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Paginación */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '2rem' }}>
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              style={{ padding: '0.5rem 1rem', border: '1px solid #E8E3D5', borderRadius: '0.5rem', background: '#fff', cursor: 'pointer', opacity: page === 1 ? 0.4 : 1 }}
            >
              ←
            </button>
            <span style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', color: '#6b7280' }}>
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              style={{ padding: '0.5rem 1rem', border: '1px solid #E8E3D5', borderRadius: '0.5rem', background: '#fff', cursor: 'pointer', opacity: page === totalPages ? 0.4 : 1 }}
            >
              →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
