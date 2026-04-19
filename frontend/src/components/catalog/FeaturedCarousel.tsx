import { useRef, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

// Unified featured item — can come from MBDA or mini-shop
interface FeaturedItem {
  id: string
  title: string
  price: number
  source: 'mbda' | 'minishop'
  slug?: string
  photos?: { url: string }[]
  size?: { name: string } | null
  miniShop?: { name: string; slug: string }
}

function FeaturedCard({ item }: { item: FeaturedItem }) {
  const cover = item.photos?.[0]?.url
  const [hovered, setHovered] = useState(false)
  const to = item.source === 'minishop' && item.slug ? `/producto/${item.slug}` : `/item/${item.id}`

  return (
    <Link
      to={to}
      style={{ textDecoration: 'none', flexShrink: 0, scrollSnapAlign: 'start' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{
        width: '200px',
        background: '#fff',
        borderRadius: '1rem',
        overflow: 'hidden',
        border: `1px solid ${hovered ? '#1E1914' : '#E8E3D5'}`,
        transition: 'border-color 0.2s, transform 0.2s, box-shadow 0.2s',
        transform: hovered ? 'translateY(-4px)' : 'none',
        boxShadow: hovered ? '0 8px 24px rgba(30,25,20,0.12)' : '0 1px 4px rgba(0,0,0,0.06)',
      }}>
        <div style={{ width: '100%', height: '200px', background: '#E8E3D5', overflow: 'hidden' }}>
          {cover ? (
            <img src={cover} alt={item.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s', transform: hovered ? 'scale(1.05)' : 'scale(1)' }}
            />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem' }}>👗</div>
          )}
        </div>
        <div style={{ padding: '0.75rem' }}>
          {item.source === 'minishop' && item.miniShop && (
            <p style={{ fontSize: '0.65rem', color: '#9ca3af', margin: '0 0 0.2rem', fontFamily: "'Inter', sans-serif", overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {item.miniShop.name}
            </p>
          )}
          <p style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: '0.875rem', color: '#1E1914', margin: 0, marginBottom: '0.25rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {item.title}
          </p>
          {item.size && (
            <p style={{ fontSize: '0.75rem', color: '#9ca3af', margin: 0, marginBottom: '0.25rem', fontFamily: "'Inter', sans-serif" }}>
              Talle {item.size.name}
            </p>
          )}
          <p style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: '1rem', color: '#1E1914', margin: 0 }}>
            ${Number(item.price).toLocaleString('es-AR')}
          </p>
        </div>
      </div>
    </Link>
  )
}

export function FeaturedCarousel({ items, title }: { items: FeaturedItem[]; title: string }) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [canLeft, setCanLeft] = useState(false)
  const [canRight, setCanRight] = useState(false)

  function checkScroll() {
    const el = trackRef.current
    if (!el) return
    setCanLeft(el.scrollLeft > 8)
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 8)
  }

  useEffect(() => {
    checkScroll()
    window.addEventListener('resize', checkScroll)
    return () => window.removeEventListener('resize', checkScroll)
  }, [items])

  function scroll(dir: 1 | -1) {
    trackRef.current?.scrollBy({ left: dir * 440, behavior: 'smooth' })
    setTimeout(checkScroll, 400)
  }

  if (items.length === 0) return null

  const arrowStyle = (active: boolean): React.CSSProperties => ({
    width: '38px', height: '38px', borderRadius: '50%',
    border: '1px solid #E8E3D5',
    background: active ? '#1E1914' : '#f3f0ea',
    color: active ? '#E8E3D5' : '#c9c2b4',
    cursor: active ? 'pointer' : 'default',
    fontSize: '1.2rem', lineHeight: 1,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'background 0.15s',
    flexShrink: 0,
    userSelect: 'none',
  })

  return (
    <section style={{ maxWidth: '1100px', margin: '0 auto', padding: '2.5rem 1.5rem 0.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(1.25rem, 3vw, 1.6rem)', fontWeight: 700, color: '#1E1914', margin: 0 }}>
          ⭐ {title}
        </h2>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button style={arrowStyle(canLeft)} onClick={() => canLeft && scroll(-1)} aria-label="Anterior">‹</button>
          <button style={arrowStyle(canRight)} onClick={() => canRight && scroll(1)} aria-label="Siguiente">›</button>
        </div>
      </div>

      <div
        ref={trackRef}
        onScroll={checkScroll}
        style={{
          display: 'flex', gap: '1rem',
          overflowX: 'auto', scrollSnapType: 'x mandatory',
          paddingBottom: '0.75rem', paddingTop: '0.25rem',
          scrollbarWidth: 'none',
        }}
      >
        <style>{`.feat-track::-webkit-scrollbar{display:none}`}</style>
        {items.map(item => <FeaturedCard key={`${item.source}-${item.id}`} item={item} />)}
      </div>
    </section>
  )
}
