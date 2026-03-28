import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <div style={{ minHeight: '70vh', background: '#FAF8F3', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center' }}>
      <p style={{ fontSize: '5rem', fontFamily: "'Playfair Display', serif", fontWeight: 700, color: '#E8E3D5', lineHeight: 1, marginBottom: '0.5rem' }}>
        404
      </p>
      <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.5rem', fontWeight: 700, color: '#1E1914', marginBottom: '0.75rem' }}>
        Página no encontrada
      </h1>
      <p style={{ color: '#6b7280', marginBottom: '2rem', maxWidth: '320px' }}>
        La página que buscás no existe o fue movida.
      </p>
      <Link
        to="/"
        style={{ background: '#1E1914', color: '#E8E3D5', padding: '0.75rem 1.5rem', borderRadius: '0.875rem', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem' }}
      >
        Volver al catálogo
      </Link>
    </div>
  )
}
