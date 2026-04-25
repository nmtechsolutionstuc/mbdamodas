import { Link, useNavigate } from 'react-router-dom'
import type { CatalogItem, MbdaCatalogItem } from '../../types'
import { useAuth } from '../../context/AuthContext'

// ── Share helper ────────────────────────────────────────

async function shareProduct(item: CatalogItem) {
  const url = item.source === 'mbda'
    ? `${window.location.origin}/item/${item.id}`
    : `${window.location.origin}/producto/${(item as any).slug}`

  // 1. Web Share API (HTTPS / mobile)
  if (navigator.share) {
    try {
      await navigator.share({ title: item.title, url })
      return
    } catch { /* user cancelled or not supported, fall through */ }
  }

  // 2. Clipboard API (modern browsers, requires secure context)
  try {
    await navigator.clipboard.writeText(url)
    alert('¡Link copiado al portapapeles!')
    return
  } catch { /* not available on HTTP/IP, fall through */ }

  // 3. execCommand fallback (HTTP, older browsers)
  try {
    const el = document.createElement('input')
    el.value = url
    el.style.cssText = 'position:fixed;opacity:0;top:0;left:0'
    document.body.appendChild(el)
    el.focus()
    el.select()
    document.execCommand('copy')
    document.body.removeChild(el)
    alert('¡Link copiado al portapapeles!')
  } catch {
    // 4. Last resort: show the URL so the user can copy manually
    alert(`Copiá este link:\n${url}`)
  }
}

// ── WhatsApp link helpers ───────────────────────────────

function buildMbdaWaLink(phone: string, item: MbdaCatalogItem): string {
  const sizePart = item.size ? ` (Talle ${item.size.name})` : ''
  const msg = `Hola MBDA Market! Me interesa el producto "${item.title}"${sizePart} · $${Number(item.price).toLocaleString('es-AR')}. ¿Está disponible? Lo vi en el catálogo online.`
  return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`
}

function buildMinishopWaLink(whatsapp: string, item: CatalogItem, shopName: string): string {
  const sizePart = item.size ? ` (Talle ${item.size.name})` : ''
  const msg = `Hola ${shopName}! Me interesa el producto "${item.title}"${sizePart} · $${Number(item.price).toLocaleString('es-AR')}. ¿Está disponible?`
  return `https://wa.me/${whatsapp}?text=${encodeURIComponent(msg)}`
}

// ── CatalogCard ─────────────────────────────────────────

export function CatalogCard({ item }: { item: CatalogItem }) {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const photo = item.photos?.[0]

  if (item.source === 'mbda') {
    return <MbdaCard item={item} navigate={navigate} isAuthenticated={isAuthenticated} photo={photo} />
  }
  return <MinishopCard item={item} photo={photo} />
}

// ── MBDA card (same behavior as current ItemCard) ───────

function MbdaCard({ item, navigate, isAuthenticated, photo }: {
  item: MbdaCatalogItem
  navigate: ReturnType<typeof useNavigate>
  isAuthenticated: boolean
  photo: { url: string } | undefined
}) {
  const storePhone = item.store?.phone
  const available = item.availableQuantity ?? item.quantity
  const canReserve = item.isOwnProduct && available > 0

  function handleReserve(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (!isAuthenticated) { navigate('/login'); return }
    navigate(`/item/${item.id}`)
  }

  return (
    <div style={{ background: '#fff', border: '1px solid #E8E3D5', borderRadius: '1rem', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <Link to={`/item/${item.id}`} style={{ display: 'block', aspectRatio: '3/4', overflow: 'hidden', background: '#E8E3D5', position: 'relative' }}>
        {photo
          ? <img src={photo.url} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: '0.875rem' }}>Sin foto</div>
        }
        {item.quantity > 1 && (
          <span style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', background: available > 0 ? 'rgba(30,25,20,0.85)' : 'rgba(220,38,38,0.85)', color: '#fff', fontSize: '0.7rem', fontWeight: 700, padding: '0.2rem 0.5rem', borderRadius: '0.375rem' }}>
            {available > 0 ? `${available} disponible${available > 1 ? 's' : ''}` : 'Sin stock'}
          </span>
        )}
      </Link>
      <div style={{ padding: '0.875rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginBottom: '0.25rem' }}>
          {item.productType?.name ?? ''}{item.size ? ` · Talle ${item.size.name}` : ''}
        </div>
        <Link to={`/item/${item.id}`} style={{ textDecoration: 'none', color: '#1E1914', fontWeight: 600, fontSize: '0.95rem', display: 'block', marginBottom: '0.5rem' }}>
          {item.title}
        </Link>
        <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#1E1914', marginBottom: '0.75rem' }}>
          ${Number(item.price).toLocaleString('es-AR')}
        </div>
        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          {canReserve && (
            <button onClick={handleReserve} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem', fontSize: '0.8rem', color: '#fff', background: '#1E1914', border: 'none', borderRadius: '0.5rem', padding: '0.5rem 0.75rem', fontWeight: 600, cursor: 'pointer' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#352e28')} onMouseLeave={e => (e.currentTarget.style.background = '#1E1914')}>
              💰 Reservar y ganar comisión
            </button>
          )}
          {storePhone && (
            <a href={buildMbdaWaLink(storePhone, item)} target="_blank" rel="noopener noreferrer"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem', fontSize: '0.8rem', color: '#16a34a', textDecoration: 'none', fontWeight: 500 }}>
              <WaIcon /> Quiero este producto
            </a>
          )}
          <ShareButton item={item} />
        </div>
      </div>
    </div>
  )
}

// ── Mini-shop card ───────────────────────────────────────

function MinishopCard({ item, photo }: { item: Extract<CatalogItem, { source: 'minishop' }>; photo: { url: string } | undefined }) {
  const waLink = buildMinishopWaLink(item.miniShop.whatsapp, item, item.miniShop.name)

  return (
    <div style={{ background: '#fff', border: '1px solid #E8E3D5', borderRadius: '1rem', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <Link to={`/producto/${item.slug}`} style={{ display: 'block', aspectRatio: '3/4', overflow: 'hidden', background: '#E8E3D5', position: 'relative' }}>
        {photo
          ? <img src={photo.url} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: '0.875rem' }}>Sin foto</div>
        }
      </Link>
      <div style={{ padding: '0.875rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Store label */}
        <Link to={`/tienda/${item.miniShop.slug}`} style={{ fontSize: '0.7rem', color: '#6b7280', marginBottom: '0.25rem', textDecoration: 'none', display: 'block' }}
          onClick={e => e.stopPropagation()}>
          Por: <span style={{ fontWeight: 600, color: '#1E1914' }}>{item.miniShop.name}</span>
        </Link>
        <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginBottom: '0.25rem' }}>
          {item.productType?.name ?? ''}{item.size ? ` · Talle ${item.size.name}` : ''}
        </div>
        <Link to={`/producto/${item.slug}`} style={{ textDecoration: 'none', color: '#1E1914', fontWeight: 600, fontSize: '0.95rem', display: 'block', marginBottom: '0.5rem' }}>
          {item.title}
        </Link>
        <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#1E1914', marginBottom: '0.75rem' }}>
          ${Number(item.price).toLocaleString('es-AR')}
        </div>
        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <a href={waLink} target="_blank" rel="noopener noreferrer"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem', fontSize: '0.8rem', color: '#fff', background: '#25D366', textDecoration: 'none', fontWeight: 600, borderRadius: '0.5rem', padding: '0.5rem 0.75rem' }}>
            <WaIcon color="#fff" /> Comprar
          </a>
          <ShareButton item={item} />
        </div>
      </div>
    </div>
  )
}

// ── Share button ────────────────────────────────────────

function ShareButton({ item }: { item: CatalogItem }) {
  return (
    <button
      onClick={e => { e.preventDefault(); e.stopPropagation(); shareProduct(item) }}
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem', fontSize: '0.75rem', color: '#9ca3af', background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem' }}
      title="Compartir"
    >
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
      </svg>
      Compartir
    </button>
  )
}

// ── WA icon ─────────────────────────────────────────────

function WaIcon({ color = 'currentColor' }: { color?: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill={color}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  )
}
