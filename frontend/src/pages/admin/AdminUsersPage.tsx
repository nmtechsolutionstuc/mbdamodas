import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { fetchAdminUsers, deactivateUser, createUser, updateAdminUser, deleteAdminUser } from '../../api/admin'
import type { AxiosError } from 'axios'
import { ListRowSkeleton } from '../../components/ui/Skeleton'
import { useToast } from '../../context/ToastContext'

interface AdminUser {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string | null
  dni?: string | null
  role: 'USER' | 'ADMIN'
  isActive: boolean
  createdAt: string
  _count: { submissions: number }
}

interface EditUserForm {
  firstName: string
  lastName: string
  email: string
  phone: string
  dni: string
  role: 'USER' | 'ADMIN'
  isActive: boolean
  password: string
}

export function AdminUsersPage() {
  const { toast } = useToast()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [confirmingDeactivateId, setConfirmingDeactivateId] = useState<string | null>(null)
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null)
  const [editingUserId, setEditingUserId] = useState<string | null>(null)
  const [editUserForm, setEditUserForm] = useState<EditUserForm>({ firstName: '', lastName: '', email: '', phone: '', dni: '', role: 'USER', isActive: true, password: '' })
  const [editUserLoading, setEditUserLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const limit = 20

  // Create user form state
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [createLoading, setCreateLoading] = useState(false)
  const [newUser, setNewUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    role: 'USER' as 'USER' | 'ADMIN',
  })

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

  async function handleCreateUser(e: React.FormEvent) {
    e.preventDefault()
    setCreateLoading(true)
    try {
      await createUser({
        firstName: newUser.firstName.trim(),
        lastName: newUser.lastName.trim(),
        email: newUser.email.trim(),
        password: newUser.password,
        phone: newUser.phone.trim() || undefined,
        role: newUser.role,
      })
      toast('Usuario creado correctamente', 'success')
      setShowCreateForm(false)
      setNewUser({ firstName: '', lastName: '', email: '', password: '', phone: '', role: 'USER' })
      loadUsers()
    } catch (err) {
      const axiosErr = err as AxiosError
      if (axiosErr.response?.status === 409) {
        toast('El email ya está registrado', 'error')
      } else {
        toast('No se pudo crear el usuario', 'error')
      }
    } finally {
      setCreateLoading(false)
    }
  }

  function resetCreateForm() {
    setShowCreateForm(false)
    setNewUser({ firstName: '', lastName: '', email: '', password: '', phone: '', role: 'USER' })
  }

  function startEditUser(user: AdminUser) {
    setEditingUserId(user.id)
    setEditUserForm({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone ?? '',
      dni: user.dni ?? '',
      role: user.role,
      isActive: user.isActive,
      password: '',
    })
  }

  function cancelEditUser() {
    setEditingUserId(null)
    setEditUserForm({ firstName: '', lastName: '', email: '', phone: '', dni: '', role: 'USER', isActive: true, password: '' })
  }

  async function handleEditUser(userId: string) {
    setEditUserLoading(true)
    try {
      const payload: Parameters<typeof updateAdminUser>[1] = {
        firstName: editUserForm.firstName.trim(),
        lastName: editUserForm.lastName.trim(),
        email: editUserForm.email.trim(),
        phone: editUserForm.phone.trim() || null,
        dni: editUserForm.dni.trim() || null,
        role: editUserForm.role,
        isActive: editUserForm.isActive,
      }
      if (editUserForm.password.trim()) {
        payload.password = editUserForm.password
      }
      const updated = await updateAdminUser(userId, payload)
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...updated } : u))
      toast('Usuario actualizado', 'success')
      cancelEditUser()
    } catch (err) {
      const axiosErr = err as AxiosError
      if (axiosErr.response?.status === 409) {
        toast('El email ya está en uso', 'error')
      } else {
        toast('Error al actualizar usuario', 'error')
      }
    } finally {
      setEditUserLoading(false)
    }
  }

  async function handleDeleteUser(userId: string) {
    setActionLoading(userId)
    try {
      await deleteAdminUser(userId)
      setUsers(prev => prev.filter(u => u.id !== userId))
      setTotal(prev => prev - 1)
      toast('Usuario eliminado', 'success')
    } catch {
      toast('Error al eliminar usuario', 'error')
    } finally {
      setActionLoading(null)
      setConfirmingDeleteId(null)
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
          <div style={{ marginLeft: 'auto' }}>
            <button
              onClick={() => setShowCreateForm(true)}
              style={{
                background: '#1E1914',
                color: '#E8E3D5',
                border: 'none',
                borderRadius: '0.875rem',
                padding: '0.625rem 1.25rem',
                fontSize: '0.9rem',
                fontWeight: 600,
                fontFamily: "'Inter', sans-serif",
                cursor: 'pointer',
              }}
            >
              + Crear usuario
            </button>
          </div>
        </div>

        {/* Formulario de creación */}
        {showCreateForm && (
          <form
            onSubmit={handleCreateUser}
            style={{
              background: '#fff',
              borderRadius: '1rem',
              padding: '1.5rem',
              marginBottom: '1.5rem',
              boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
              border: '1px solid #E8E3D5',
            }}
          >
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.2rem', fontWeight: 700, color: '#1E1914', marginTop: 0, marginBottom: '1.25rem' }}>
              Nuevo usuario
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#1E1914', marginBottom: '0.375rem', fontFamily: "'Inter', sans-serif" }}>Nombre</label>
                <input
                  required
                  type="text"
                  value={newUser.firstName}
                  onChange={e => setNewUser(p => ({ ...p, firstName: e.target.value }))}
                  style={{ width: '100%', border: '1px solid #E8E3D5', borderRadius: '0.75rem', padding: '0.75rem 1rem', fontSize: '0.9rem', background: '#fff', outline: 'none', boxSizing: 'border-box', fontFamily: "'Inter', sans-serif" }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#1E1914', marginBottom: '0.375rem', fontFamily: "'Inter', sans-serif" }}>Apellido</label>
                <input
                  required
                  type="text"
                  value={newUser.lastName}
                  onChange={e => setNewUser(p => ({ ...p, lastName: e.target.value }))}
                  style={{ width: '100%', border: '1px solid #E8E3D5', borderRadius: '0.75rem', padding: '0.75rem 1rem', fontSize: '0.9rem', background: '#fff', outline: 'none', boxSizing: 'border-box', fontFamily: "'Inter', sans-serif" }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#1E1914', marginBottom: '0.375rem', fontFamily: "'Inter', sans-serif" }}>Email</label>
                <input
                  required
                  type="email"
                  value={newUser.email}
                  onChange={e => setNewUser(p => ({ ...p, email: e.target.value }))}
                  style={{ width: '100%', border: '1px solid #E8E3D5', borderRadius: '0.75rem', padding: '0.75rem 1rem', fontSize: '0.9rem', background: '#fff', outline: 'none', boxSizing: 'border-box', fontFamily: "'Inter', sans-serif" }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#1E1914', marginBottom: '0.375rem', fontFamily: "'Inter', sans-serif" }}>Contraseña</label>
                <input
                  required
                  type="password"
                  value={newUser.password}
                  onChange={e => setNewUser(p => ({ ...p, password: e.target.value }))}
                  style={{ width: '100%', border: '1px solid #E8E3D5', borderRadius: '0.75rem', padding: '0.75rem 1rem', fontSize: '0.9rem', background: '#fff', outline: 'none', boxSizing: 'border-box', fontFamily: "'Inter', sans-serif" }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#1E1914', marginBottom: '0.375rem', fontFamily: "'Inter', sans-serif" }}>Teléfono (opcional)</label>
                <input
                  type="text"
                  value={newUser.phone}
                  onChange={e => setNewUser(p => ({ ...p, phone: e.target.value }))}
                  style={{ width: '100%', border: '1px solid #E8E3D5', borderRadius: '0.75rem', padding: '0.75rem 1rem', fontSize: '0.9rem', background: '#fff', outline: 'none', boxSizing: 'border-box', fontFamily: "'Inter', sans-serif" }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#1E1914', marginBottom: '0.375rem', fontFamily: "'Inter', sans-serif" }}>Rol</label>
                <select
                  value={newUser.role}
                  onChange={e => setNewUser(p => ({ ...p, role: e.target.value as 'USER' | 'ADMIN' }))}
                  style={{ width: '100%', border: '1px solid #E8E3D5', borderRadius: '0.75rem', padding: '0.75rem 1rem', fontSize: '0.9rem', background: '#fff', outline: 'none', boxSizing: 'border-box', fontFamily: "'Inter', sans-serif", cursor: 'pointer' }}
                >
                  <option value="USER">Vendedor</option>
                  <option value="ADMIN">Administrador</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={resetCreateForm}
                style={{
                  background: '#E8E3D5',
                  color: '#1E1914',
                  border: 'none',
                  borderRadius: '0.875rem',
                  padding: '0.625rem 1.25rem',
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  fontFamily: "'Inter', sans-serif",
                  cursor: 'pointer',
                }}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={createLoading}
                style={{
                  background: '#1E1914',
                  color: '#E8E3D5',
                  border: 'none',
                  borderRadius: '0.875rem',
                  padding: '0.625rem 1.25rem',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  fontFamily: "'Inter', sans-serif",
                  cursor: createLoading ? 'not-allowed' : 'pointer',
                  opacity: createLoading ? 0.6 : 1,
                }}
              >
                {createLoading ? 'Creando...' : 'Crear'}
              </button>
            </div>
          </form>
        )}

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
            {users.map(user => {
              const isEditingThis = editingUserId === user.id
              const isBusy = actionLoading === user.id

              return (
                <div
                  key={user.id}
                  style={{
                    background: '#fff',
                    border: `1px solid ${user.isActive ? '#E8E3D5' : '#f3f4f6'}`,
                    borderRadius: '1rem',
                    padding: '1rem 1.25rem',
                    opacity: user.isActive ? 1 : 0.7,
                  }}
                >
                  {isEditingThis ? (
                    /* ── Inline edit form ── */
                    <div>
                      <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1rem', fontWeight: 700, color: '#1E1914', marginTop: 0, marginBottom: '1rem' }}>
                        Editar: {user.firstName} {user.lastName}
                      </h3>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#1E1914', marginBottom: '0.25rem', fontFamily: "'Inter', sans-serif" }}>Nombre</label>
                          <input
                            type="text"
                            value={editUserForm.firstName}
                            onChange={e => setEditUserForm(f => ({ ...f, firstName: e.target.value }))}
                            style={{ width: '100%', border: '1px solid #E8E3D5', borderRadius: '0.75rem', padding: '0.5rem 0.75rem', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box', fontFamily: "'Inter', sans-serif" }}
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#1E1914', marginBottom: '0.25rem', fontFamily: "'Inter', sans-serif" }}>Apellido</label>
                          <input
                            type="text"
                            value={editUserForm.lastName}
                            onChange={e => setEditUserForm(f => ({ ...f, lastName: e.target.value }))}
                            style={{ width: '100%', border: '1px solid #E8E3D5', borderRadius: '0.75rem', padding: '0.5rem 0.75rem', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box', fontFamily: "'Inter', sans-serif" }}
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#1E1914', marginBottom: '0.25rem', fontFamily: "'Inter', sans-serif" }}>Email</label>
                          <input
                            type="email"
                            value={editUserForm.email}
                            onChange={e => setEditUserForm(f => ({ ...f, email: e.target.value }))}
                            style={{ width: '100%', border: '1px solid #E8E3D5', borderRadius: '0.75rem', padding: '0.5rem 0.75rem', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box', fontFamily: "'Inter', sans-serif" }}
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#1E1914', marginBottom: '0.25rem', fontFamily: "'Inter', sans-serif" }}>Teléfono</label>
                          <input
                            type="text"
                            value={editUserForm.phone}
                            onChange={e => setEditUserForm(f => ({ ...f, phone: e.target.value }))}
                            style={{ width: '100%', border: '1px solid #E8E3D5', borderRadius: '0.75rem', padding: '0.5rem 0.75rem', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box', fontFamily: "'Inter', sans-serif" }}
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#1E1914', marginBottom: '0.25rem', fontFamily: "'Inter', sans-serif" }}>DNI</label>
                          <input
                            type="text"
                            value={editUserForm.dni}
                            onChange={e => setEditUserForm(f => ({ ...f, dni: e.target.value }))}
                            style={{ width: '100%', border: '1px solid #E8E3D5', borderRadius: '0.75rem', padding: '0.5rem 0.75rem', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box', fontFamily: "'Inter', sans-serif" }}
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#1E1914', marginBottom: '0.25rem', fontFamily: "'Inter', sans-serif" }}>Rol</label>
                          <select
                            value={editUserForm.role}
                            onChange={e => setEditUserForm(f => ({ ...f, role: e.target.value as 'USER' | 'ADMIN' }))}
                            style={{ width: '100%', border: '1px solid #E8E3D5', borderRadius: '0.75rem', padding: '0.5rem 0.75rem', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box', fontFamily: "'Inter', sans-serif", cursor: 'pointer', background: '#fff' }}
                          >
                            <option value="USER">Vendedor</option>
                            <option value="ADMIN">Administrador</option>
                          </select>
                        </div>
                        <div style={{ gridColumn: '1 / -1' }}>
                          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#1E1914', marginBottom: '0.25rem', fontFamily: "'Inter', sans-serif" }}>Nueva contraseña (dejar vacío para no cambiar)</label>
                          <input
                            type="password"
                            value={editUserForm.password}
                            onChange={e => setEditUserForm(f => ({ ...f, password: e.target.value }))}
                            placeholder="••••••••"
                            style={{ width: '100%', border: '1px solid #E8E3D5', borderRadius: '0.75rem', padding: '0.5rem 0.75rem', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box', fontFamily: "'Inter', sans-serif" }}
                          />
                        </div>
                        <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <input
                            type="checkbox"
                            id={`isActive-user-${user.id}`}
                            checked={editUserForm.isActive}
                            onChange={e => setEditUserForm(f => ({ ...f, isActive: e.target.checked }))}
                            style={{ cursor: 'pointer' }}
                          />
                          <label htmlFor={`isActive-user-${user.id}`} style={{ fontSize: '0.8rem', color: '#1E1914', cursor: 'pointer', fontFamily: "'Inter', sans-serif" }}>
                            Usuario activo
                          </label>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', justifyContent: 'flex-end' }}>
                        <button
                          type="button"
                          onClick={cancelEditUser}
                          style={{ background: '#E8E3D5', color: '#1E1914', border: 'none', borderRadius: '0.875rem', padding: '0.5rem 1.25rem', fontSize: '0.875rem', fontWeight: 500, fontFamily: "'Inter', sans-serif", cursor: 'pointer' }}
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleEditUser(user.id)}
                          disabled={editUserLoading}
                          style={{ background: '#1E1914', color: '#E8E3D5', border: 'none', borderRadius: '0.875rem', padding: '0.5rem 1.25rem', fontSize: '0.875rem', fontWeight: 600, fontFamily: "'Inter', sans-serif", cursor: editUserLoading ? 'not-allowed' : 'pointer', opacity: editUserLoading ? 0.6 : 1 }}
                        >
                          {editUserLoading ? 'Guardando...' : 'Guardar'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* ── Normal row view ── */
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      {/* Avatar */}
                      <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#E8E3D5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', fontWeight: 700, color: '#1E1914', flexShrink: 0 }}>
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
                          {user.phone ? `${user.phone}` : 'Sin teléfono'} · {user._count.submissions} solicitud{user._count.submissions !== 1 ? 'es' : ''} · Desde {new Date(user.createdAt).toLocaleDateString('es-AR', { month: 'short', year: 'numeric' })}
                        </p>
                      </div>

                      {/* Acciones */}
                      <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '0.375rem', alignItems: 'flex-end' }}>
                        <button
                          onClick={() => startEditUser(user)}
                          disabled={isBusy}
                          style={{ background: '#E8E3D5', color: '#1E1914', border: 'none', borderRadius: '0.5rem', padding: '0.375rem 0.875rem', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 500, fontFamily: "'Inter', sans-serif" }}
                        >
                          Editar
                        </button>
                        {user.isActive && user.role !== 'ADMIN' && (
                          confirmingDeactivateId === user.id ? (
                            <div style={{ display: 'flex', gap: '0.375rem' }}>
                              <button onClick={() => handleDeactivate(user.id)} disabled={isBusy} style={{ background: '#dc2626', color: '#fff', border: 'none', borderRadius: '0.5rem', padding: '0.375rem 0.5rem', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}>Sí</button>
                              <button onClick={() => setConfirmingDeactivateId(null)} style={{ background: '#E8E3D5', color: '#1E1914', border: 'none', borderRadius: '0.5rem', padding: '0.375rem 0.5rem', cursor: 'pointer', fontSize: '0.75rem' }}>No</button>
                            </div>
                          ) : (
                            <button onClick={() => setConfirmingDeactivateId(user.id)} disabled={isBusy} style={{ background: 'transparent', color: '#dc2626', border: '1px solid #dc2626', borderRadius: '0.5rem', padding: '0.375rem 0.875rem', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 500, fontFamily: "'Inter', sans-serif" }}>
                              Desactivar
                            </button>
                          )
                        )}
                        {confirmingDeleteId === user.id ? (
                          <div style={{ display: 'flex', gap: '0.375rem' }}>
                            <button onClick={() => handleDeleteUser(user.id)} disabled={isBusy} style={{ background: '#7f1d1d', color: '#fff', border: 'none', borderRadius: '0.5rem', padding: '0.375rem 0.5rem', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}>Eliminar</button>
                            <button onClick={() => setConfirmingDeleteId(null)} style={{ background: '#E8E3D5', color: '#1E1914', border: 'none', borderRadius: '0.5rem', padding: '0.375rem 0.5rem', cursor: 'pointer', fontSize: '0.75rem' }}>No</button>
                          </div>
                        ) : (
                          <button onClick={() => setConfirmingDeleteId(user.id)} disabled={isBusy} style={{ background: 'transparent', color: '#6b7280', border: '1px solid #d1d5db', borderRadius: '0.5rem', padding: '0.375rem 0.875rem', cursor: 'pointer', fontSize: '0.75rem', fontFamily: "'Inter', sans-serif" }}>
                            Eliminar
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
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
