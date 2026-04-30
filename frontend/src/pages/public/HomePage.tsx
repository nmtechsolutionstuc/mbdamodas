import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { CatalogCard } from '../../components/catalog/CatalogCard'
import { FeaturedCarousel } from '../../components/catalog/FeaturedCarousel'
import { ItemCardSkeleton } from '../../components/ui/Skeleton'
import { fetchCatalog, fetchCatalogShops } from '../../api/catalog'
import { fetchFeaturedItems } from '../../api/items'
import { useProductTypes } from '../../hooks/useProductTypes'
import { useAuthStore } from '../../store/authStore'
import { usePlatformStore } from '../../store/platformStore'
import { useScrollReveal } from '../../hooks/useScrollReveal'
import { HeroWords } from '../../components/ui/AnimatedText'
import axiosClient from '../../api/axiosClient'
import type { CatalogItem, CatalogShop } from '../../types'
import '../../styles/animations.css'

interface BannerData {
  buyer: { subtitle: string | null; title: string | null; description: string | null; buttonActive: boolean }
  seller: { subtitle: string | null; title: string | null; description: string | null; buttonActive: boolean; reservarButtonActive: boolean; extraButtonActive: boolean; extraButtonText: string; extraButtonUrl: string }
}

interface FeatureCardConfig {
  active: boolean
  emoji: string
  title: string
  desc: string
}

interface FeatureCardsData {
  card1?: FeatureCardConfig
  card2?: FeatureCardConfig
  card3?: FeatureCardConfig
}

const DEFAULT_FEATURE_CARDS: Required<FeatureCardsData> = {
  card1: { active: true, emoji: '\uD83D\uDC57', title: 'Ropa nueva', desc: 'Productos nuevos propios de MBDA Market, con las últimas tendencias.' },
  card2: { active: true, emoji: '\u267B\uFE0F', title: 'Ropa en consignación', desc: 'Productos seleccionados y cuidados, a precios accesibles.' },
  card3: { active: true, emoji: '\uD83D\uDCB0', title: 'Ganá vendiendo', desc: 'Reservá un producto, conseguí un comprador y llevate una comisión. Sin inversión.' },
}

const DEFAULT_MARQUEE = ['Ropa nueva', 'Consignación', 'Reservas para promotores', 'Precios accesibles', 'Tucumán', 'Calidad garantizada', 'Ropa con historia']

export function HomePage() {
  const { productTypes } = useProductTypes()
  const { user } = useAuthStore()
  const { miniShopsEnabled } = usePlatformStore()
  const [searchParams] = useSearchParams()
  const [items, setItems] = useState<CatalogItem[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [productTypeId, setProductTypeId] = useState('')
  const [sizeId, setSizeId] = useState('')
  const [tagId, setTagId] = useState('')
  const [miniShopSlug, setMiniShopSlug] = useState(() => searchParams.get('miniShopSlug') ?? '')
  const [source, setSource] = useState<'' | 'mbda'>('')
  const [sortPrice, setSortPrice] = useState<'' | 'asc' | 'desc'>('')
  const [page, setPage] = useState(1)
  const [hoveredCta, setHoveredCta] = useState<string | null>(null)
  const [banners, setBanners] = useState<BannerData | null>(null)
  const [featureCardsData, setFeatureCardsData] = useState<FeatureCardsData>({})
  const [marqueeItems, setMarqueeItems] = useState<string[]>(DEFAULT_MARQUEE)
  const [featuredItems, setFeaturedItems] = useState<any[]>([])
  const [featuredTitle, setFeaturedTitle] = useState('Destacados')
  const [videoSection, setVideoSection] = useState<{ active: boolean; title: string; videoUrl: string; description: string } | null>(null)
  const [shops, setShops] = useState<CatalogShop[]>([])

  // Scroll-reveal hooks
  const featuresReveal    = useScrollReveal(0.1)
  const videoReveal       = useScrollReveal(0.1)
  const catalogReveal     = useScrollReveal(0.08)
  const catalogGridReveal = useScrollReveal(0.05)

  const selectedProductType = (productTypes ?? []).find(pt => pt.id === productTypeId)

  useEffect(() => {
    axiosClient.get<{ data: BannerData }>('/home-banners')
      .then(r => setBanners(r.data.data))
      .catch(() => {})
    axiosClient.get<{ data: { featureCards: FeatureCardsData | null; marqueeItems: string[] | null } }>('/feature-cards')
      .then(r => {
        setFeatureCardsData(r.data.data.featureCards ?? {})
        const mi = r.data.data.marqueeItems
        if (Array.isArray(mi) && mi.length > 0) setMarqueeItems(mi)
      })
      .catch(() => {})
    fetchFeaturedItems()
      .then(items => {
        // Cuando mini-tiendas está desactivado, no mostrar productos de mini-tiendas en destacados
        setFeaturedItems(miniShopsEnabled ? items : items.filter((i: any) => i.source !== 'minishop'))
      })
      .catch(() => {})
    axiosClient.get('/store-info')
      .then(r => {
        const store = r.data?.data?.store
        if (store?.featuredSectionTitle) setFeaturedTitle(store.featuredSectionTitle)
        if (store?.videoSection) setVideoSection(store.videoSection)
      })
      .catch(() => {})
    if (miniShopsEnabled) {
      fetchCatalogShops()
        .then(setShops)
        .catch(() => {})
    }
  }, [])

  // Banner text with fallbacks
  const buyerSubtitle = banners?.buyer?.subtitle || 'Para compradores'
  const buyerTitle = banners?.buyer?.title || 'Ropa nueva y con historia a precios que sorprenden'
  const buyerDesc = banners?.buyer?.description || 'Encontra productos nuevos de la tienda y ropa seleccionada en consignacion. Calidad garantizada.'
  const buyerButtonActive = banners?.buyer?.buttonActive ?? true
  const sellerSubtitle = banners?.seller?.subtitle || 'Para vendedores y promotores'
  const sellerTitle = banners?.seller?.title || 'Gana dinero vendiendo nuestros productos'
  const sellerDesc = banners?.seller?.description || 'Reserva un producto del catalogo, consegiu un comprador y gana una comision por cada venta. Sin capital inicial, sin riesgo.'
  const sellerButtonActive = banners?.seller?.buttonActive ?? true
  const reservarButtonActive = banners?.seller?.reservarButtonActive ?? true
  const extraButtonActive = banners?.seller?.extraButtonActive ?? false
  const extraButtonText = banners?.seller?.extraButtonText || 'Ver más'
  const extraButtonUrl = banners?.seller?.extraButtonUrl || ''

  useEffect(() => {
    setLoading(true)
    fetchCatalog({
      search: search || undefined,
      productTypeId: productTypeId || undefined,
      sizeId: sizeId || undefined,
      tagId: tagId || undefined,
      miniShopSlug: miniShopsEnabled ? (miniShopSlug || undefined) : undefined,
      // Cuando mini-tiendas está desactivado, forzar solo productos MBDA
      source: !miniShopsEnabled ? 'mbda' : (source || undefined),
      sortPrice: sortPrice || undefined,
      page,
      limit: 12,
    })
      .then(r => { setItems(r.items); setTotal(r.total) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [search, productTypeId, sizeId, tagId, miniShopSlug, source, sortPrice, page, miniShopsEnabled])

  function handleProductTypeChange(newId: string) {
    setProductTypeId(newId)
    setSizeId('')
    setTagId('')
    setPage(1)
  }

  function handleMiniShopChange(slug: string) {
    setMiniShopSlug(slug)
    if (slug) setSource('')   // clear source filter when filtering by shop
    setPage(1)
  }

  function handleSourceToggle(val: '' | 'mbda') {
    setSource(val)
    if (val === 'mbda') setMiniShopSlug('')  // clear shop filter when viewing MBDA-only
    setPage(1)
  }

  function handleSortPrice(val: string) {
    setSortPrice(val as '' | 'asc' | 'desc')
    setPage(1)
  }

  const totalPages = Math.ceil(total / 12)
  const activeMarquee = marqueeItems.filter(Boolean)

  return (
    <div style={{ minHeight: '100vh', background: '#FAF8F3' }}>
      {/* ── Banner dual: Compradores | Vendedores ─────────── */}
      <style>{`
        .mbda-banner { display: grid; grid-template-columns: 1fr 1fr; }
        @media (max-width: 640px) { .mbda-banner { grid-template-columns: 1fr; } }
      `}</style>
      <section className="mbda-banner" style={{ minHeight: '480px', background: '#1E1914' }}>
        {/* Panel comprador */}
        <div
          className="mbda-buyer-clip"
          style={{
            background: '#E8E3D5',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'flex-end',
            padding: '5rem 3rem 4rem',
            textAlign: 'left',
            position: 'relative',
          }}
        >
          <p className="mbda-hero-sub" style={{ fontSize: '0.72rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#6b7280', marginBottom: '1.25rem' }}>
            {buyerSubtitle}
          </p>
          <h2
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(2.4rem, 4.5vw, 3.75rem)',
              fontWeight: 700,
              color: '#1E1914',
              lineHeight: 1.08,
              letterSpacing: '-0.02em',
              marginBottom: '1.5rem',
              margin: '0 0 1.5rem 0',
            }}
          >
            <HeroWords key={buyerTitle} text={buyerTitle} />
          </h2>
          <p className="mbda-hero-desc" style={{ color: '#4b5563', marginBottom: '2.25rem', maxWidth: '360px', lineHeight: 1.65, fontSize: '0.95rem' }}>
            {buyerDesc}
          </p>
          <div className="mbda-hero-btns" style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {buyerButtonActive && (
              <a
                href="#catalogo"
                className="mbda-hero-pulse"
                onMouseEnter={() => setHoveredCta('catalogo')}
                onMouseLeave={() => setHoveredCta(null)}
                style={{
                  background: hoveredCta === 'catalogo' ? '#352e28' : '#1E1914',
                  color: '#E8E3D5',
                  padding: '0.875rem 2rem',
                  borderRadius: '0.5rem',
                  textDecoration: 'none',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  transition: 'background 0.2s ease, transform 0.2s ease',
                  transform: hoveredCta === 'catalogo' ? 'translateY(-2px)' : 'translateY(0)',
                }}
              >
                Ver catálogo
              </a>
            )}
          </div>
        </div>

        {/* Panel vendedor / promotor */}
        <div
          style={{
            background: '#1E1914',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'flex-end',
            padding: '5rem 3rem 4rem',
            textAlign: 'left',
            borderLeft: '1px solid rgba(232,227,213,0.08)',
          }}
        >
          <p className="mbda-hero-sub" style={{ fontSize: '0.72rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(232,227,213,0.45)', marginBottom: '1.25rem' }}>
            {sellerSubtitle}
          </p>
          <h2
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(2.4rem, 4.5vw, 3.75rem)',
              fontWeight: 700,
              color: '#E8E3D5',
              lineHeight: 1.08,
              letterSpacing: '-0.02em',
              margin: '0 0 1.5rem 0',
            }}
          >
            <HeroWords key={sellerTitle} text={sellerTitle} baseDelay={0.3} />
          </h2>
          <p className="mbda-hero-desc" style={{ color: 'rgba(232,227,213,0.65)', marginBottom: sellerDesc ? '2.25rem' : '0', maxWidth: '360px', lineHeight: 1.65, fontSize: '0.95rem' }}>
            {sellerDesc}
          </p>
          <div className="mbda-hero-btns" style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {reservarButtonActive && (
              <a
                href="#catalogo"
                onMouseEnter={() => setHoveredCta('reservar')}
                onMouseLeave={() => setHoveredCta(null)}
                style={{
                  background: hoveredCta === 'reservar' ? '#f5f0e6' : '#E8E3D5',
                  color: '#1E1914',
                  padding: '0.875rem 1.75rem',
                  borderRadius: '0.5rem',
                  textDecoration: 'none',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  transition: 'background 0.2s ease, transform 0.2s ease',
                  transform: hoveredCta === 'reservar' ? 'translateY(-2px)' : 'translateY(0)',
                }}
              >
                Reservar y ganar
              </a>
            )}
            {sellerButtonActive && (
              <Link
                to={user ? '/dashboard/enviar' : '/register'}
                onMouseEnter={() => setHoveredCta('vender')}
                onMouseLeave={() => setHoveredCta(null)}
                style={{
                  background: 'transparent',
                  color: '#E8E3D5',
                  padding: '0.875rem 1.75rem',
                  borderRadius: '0.5rem',
                  textDecoration: 'none',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  border: '1px solid rgba(232, 227, 213, 0.25)',
                  transition: 'background 0.2s ease, transform 0.2s ease',
                  transform: hoveredCta === 'vender' ? 'translateY(-2px)' : 'translateY(0)',
                }}
              >
                Quiero vender
              </Link>
            )}
            {extraButtonActive && extraButtonUrl && (
              <a
                href={extraButtonUrl}
                onMouseEnter={() => setHoveredCta('extra')}
                onMouseLeave={() => setHoveredCta(null)}
                style={{
                  background: 'transparent',
                  color: '#E8E3D5',
                  padding: '0.875rem 1.75rem',
                  borderRadius: '0.5rem',
                  textDecoration: 'none',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  border: '1px solid rgba(232, 227, 213, 0.25)',
                  transition: 'background 0.2s ease, transform 0.2s ease',
                  transform: hoveredCta === 'extra' ? 'translateY(-2px)' : 'translateY(0)',
                }}
              >
                {extraButtonText}
              </a>
            )}
          </div>
        </div>
      </section>

      {/* ── Marquee strip (editable desde admin) ──────────── */}
      {activeMarquee.length > 0 && (
        <>
          <style>{`
            @keyframes mbdaMarquee { from { transform: translateX(0) } to { transform: translateX(-50%) } }
            .mbda-marquee-track { display: flex; width: max-content; animation: mbdaMarquee 28s linear infinite; }
            .mbda-marquee-track:hover { animation-play-state: paused; }
          `}</style>
          <div style={{ background: '#1E1914', overflow: 'hidden', padding: '0.9rem 0', borderTop: '1px solid rgba(232,227,213,0.07)' }}>
            <div className="mbda-marquee-track">
              {[0, 1].map(rep => (
                <span key={rep} style={{ display: 'inline-flex' }}>
                  {activeMarquee.map((item, i) => (
                    <span key={`${rep}-${i}`} style={{ padding: '0 2.5rem', fontSize: '0.7rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(232,227,213,0.35)', fontFamily: "'Inter', sans-serif", whiteSpace: 'nowrap' }}>
                      {item}&nbsp;&nbsp;<span style={{ opacity: 0.3 }}>·</span>
                    </span>
                  ))}
                </span>
              ))}
            </div>
          </div>
        </>
      )}

      {/* ── Destacados ──────────────────────────────────── */}
      {featuredItems.length > 0 && (
        <FeaturedCarousel items={featuredItems} title={featuredTitle} />
      )}

      {/* ── Sección Video ─────────────────────────────────── */}
      {videoSection?.active && videoSection.videoUrl && (
        <>
          <style>{`
            .mbda-video-section { display: grid; grid-template-columns: 1fr 1fr; gap: 2.5rem; align-items: center; }
            @media (max-width: 768px) { .mbda-video-section { grid-template-columns: 1fr; } }
          `}</style>
          <section
            ref={videoReveal.ref}
            className={`mbda-sr${videoReveal.visible ? ' mbda-sr-in' : ''}`}
            style={{ maxWidth: '1100px', margin: '0 auto', padding: '3rem 1.5rem 0' }}
          >
            {videoSection.title && (
              <h2 className="mbda-section-heading" style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(1.25rem, 3vw, 1.6rem)', fontWeight: 700, color: '#1E1914', marginBottom: '1.5rem' }}>
                {videoSection.title}
              </h2>
            )}
            <div className="mbda-video-section">
              {/* Video */}
              <div style={{ borderRadius: '1rem', overflow: 'hidden', background: '#1E1914', aspectRatio: '16/9' }}>
                {videoSection.videoUrl.includes('youtube.com') || videoSection.videoUrl.includes('youtu.be') ? (
                  <iframe
                    src={videoSection.videoUrl}
                    title={videoSection.title || 'Video'}
                    style={{ width: '100%', height: '100%', border: 'none' }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <video
                    src={videoSection.videoUrl}
                    controls
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                )}
              </div>
              {/* Descripción */}
              {videoSection.description && (
                <div>
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '1.05rem', color: '#4b5563', lineHeight: 1.75, whiteSpace: 'pre-line' }}>
                    {videoSection.description}
                  </p>
                </div>
              )}
            </div>
          </section>
        </>
      )}

      {/* ── Propuesta de valor ──────────────────────────── */}
      <style>{`
        .mbda-features { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0; }
        @media (max-width: 768px) { .mbda-features { grid-template-columns: 1fr; } }
      `}</style>
      <section
        ref={featuresReveal.ref}
        className={`mbda-section-sweep${featuresReveal.visible ? ' mbda-sweep-in' : ''}`}
        style={{ maxWidth: '1200px', margin: '0 auto', padding: '4rem 1.5rem 0', borderTop: '1px solid #E8E3D5' }}
      >
        <div className="mbda-features">
          {(['card1', 'card2', 'card3'] as (keyof FeatureCardsData)[])
            .map(key => ({ ...DEFAULT_FEATURE_CARDS[key], ...featureCardsData[key] }))
            .filter(card => card.active)
            .map((card, i) => (
              <div
                key={card.title}
                className="mbda-feature-card"
                style={{
                  padding: '2.5rem 2rem',
                  borderRight: i < 2 ? '1px solid #E8E3D5' : 'none',
                  opacity: featuresReveal.visible ? 1 : 0,
                  transform: featuresReveal.visible
                    ? 'translate(0, 0) scale(1)'
                    : i === 0 ? 'translateX(-48px)'
                    : i === 1 ? 'translateY(32px) scale(0.96)'
                    : 'translateX(48px)',
                  transition: `opacity 0.6s ease ${i * 130}ms, transform 0.6s ease ${i * 130}ms`,
                }}
              >
                <div style={{ fontSize: '2rem', marginBottom: '1.25rem', lineHeight: 1 }}>{card.emoji}</div>
                <h3 style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: 'clamp(1.1rem, 2vw, 1.35rem)',
                  fontWeight: 700,
                  color: '#1E1914',
                  marginBottom: '0.625rem',
                  letterSpacing: '-0.01em',
                }}>
                  {card.title}
                </h3>
                <p style={{
                  color: '#6b7280',
                  fontSize: '0.9rem',
                  lineHeight: 1.65,
                  margin: 0,
                }}>
                  {card.desc}
                </p>
              </div>
            ))}
        </div>
      </section>

      {/* ── Catálogo ──────────────────────────────────────── */}
      <section
        id="catalogo"
        className={`mbda-section-sweep${catalogReveal.visible ? ' mbda-sweep-in' : ''}`}
        style={{ maxWidth: '1200px', margin: '0 auto', padding: '5rem 1.5rem 3rem' }}
      >
        <div
          ref={catalogReveal.ref}
          className={`mbda-sr${catalogReveal.visible ? ' mbda-sr-in' : ''}`}
        >
          <h2
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(2.25rem, 5vw, 3.75rem)',
              fontWeight: 700,
              color: '#1E1914',
              letterSpacing: '-0.025em',
              lineHeight: 1.05,
              marginBottom: '2.5rem',
            }}
          >
            Catálogo
          </h2>
        </div>

        {/* Filtros */}
        <div style={{
          display: 'flex',
          gap: '0.75rem',
          flexWrap: 'wrap',
          marginBottom: '2rem',
          alignItems: 'center',
          padding: '1rem 1.25rem',
          background: '#fff',
          borderRadius: '1rem',
          border: '1px solid #E8E3D5',
          boxShadow: '0 1px 4px rgba(30,25,20,0.04)',
        }}>
          <div style={{ position: 'relative', flex: '1 1 200px', minWidth: '180px' }}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#9ca3af"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }}
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Buscar productos..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
              style={{
                padding: '0.625rem 1rem 0.625rem 2.25rem',
                borderRadius: '0.5rem',
                border: '1px solid #E8E3D5',
                background: '#FAF8F3',
                color: '#1E1914',
                fontFamily: "'Inter', sans-serif",
                fontSize: '0.9rem',
                width: '100%',
                boxSizing: 'border-box',
                outline: 'none',
              }}
            />
          </div>
          <select
            value={productTypeId}
            onChange={e => handleProductTypeChange(e.target.value)}
            style={{
              padding: '0.625rem 1rem',
              borderRadius: '0.5rem',
              border: '1px solid #E8E3D5',
              background: '#FAF8F3',
              color: '#1E1914',
              fontFamily: "'Inter', sans-serif",
              fontSize: '0.9rem',
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            <option value="">Todas las categorias</option>
            {(productTypes ?? []).map(pt => (
              <option key={pt.id} value={pt.id}>{pt.name}</option>
            ))}
          </select>
          {selectedProductType?.requiresSize && (selectedProductType.sizes?.length ?? 0) > 0 && (
            <select
              value={sizeId}
              onChange={e => { setSizeId(e.target.value); setPage(1) }}
              style={{
                padding: '0.625rem 1rem',
                borderRadius: '0.5rem',
                border: '1px solid #E8E3D5',
                background: '#FAF8F3',
                color: '#1E1914',
                fontFamily: "'Inter', sans-serif",
                fontSize: '0.9rem',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="">Todos los talles</option>
              {selectedProductType.sizes!.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          )}
          {selectedProductType && (selectedProductType.tags?.length ?? 0) > 0 && (
            <select
              value={tagId}
              onChange={e => { setTagId(e.target.value); setPage(1) }}
              style={{
                padding: '0.625rem 1rem',
                borderRadius: '0.5rem',
                border: '1px solid #E8E3D5',
                background: '#FAF8F3',
                color: '#1E1914',
                fontFamily: "'Inter', sans-serif",
                fontSize: '0.9rem',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="">Todas las etiquetas</option>
              {selectedProductType.tags!.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          )}
          {miniShopsEnabled && shops.length > 0 && (
            <select
              value={miniShopSlug}
              onChange={e => handleMiniShopChange(e.target.value)}
              style={{
                padding: '0.625rem 1rem',
                borderRadius: '0.5rem',
                border: miniShopSlug ? '1px solid #1E1914' : '1px solid #E8E3D5',
                background: miniShopSlug ? '#1E1914' : '#FAF8F3',
                color: miniShopSlug ? '#FAF8F3' : '#1E1914',
                fontFamily: "'Inter', sans-serif",
                fontSize: '0.9rem',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="">Todas las tiendas</option>
              {shops.map(s => (
                <option key={s.id} value={s.slug}>{s.name}</option>
              ))}
            </select>
          )}
          {/* Source toggle — solo visible cuando mini-tiendas está activo */}
          {miniShopsEnabled && (
            <div style={{ display: 'flex', gap: '0.375rem', border: '1px solid #E8E3D5', borderRadius: '0.5rem', padding: '0.25rem', background: '#FAF8F3' }}>
              {([['', 'Todos'], ['mbda', 'MBDA']] as ['' | 'mbda', string][]).map(([val, label]) => (
                <button
                  key={val}
                  onClick={() => handleSourceToggle(val)}
                  style={{
                    padding: '0.35rem 0.75rem',
                    borderRadius: '0.35rem',
                    border: 'none',
                    background: source === val ? '#1E1914' : 'transparent',
                    color: source === val ? '#FAF8F3' : '#6b7280',
                    fontSize: '0.8rem',
                    fontWeight: source === val ? 600 : 400,
                    cursor: 'pointer',
                    fontFamily: "'Inter', sans-serif",
                    transition: 'background 0.15s, color 0.15s',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          )}

          <select
            value={sortPrice}
            onChange={e => handleSortPrice(e.target.value)}
            style={{
              padding: '0.625rem 1rem',
              borderRadius: '0.5rem',
              border: '1px solid #E8E3D5',
              background: '#FAF8F3',
              color: '#1E1914',
              fontFamily: "'Inter', sans-serif",
              fontSize: '0.9rem',
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            <option value="">Precio: relevancia</option>
            <option value="asc">Precio: menor a mayor</option>
            <option value="desc">Precio: mayor a menor</option>
          </select>
        </div>

        {/* Grid */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.25rem' }}>
            {Array.from({ length: 8 }).map((_, i) => <ItemCardSkeleton key={i} />)}
          </div>
        ) : items.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '4rem 2rem',
            background: '#fff',
            borderRadius: '1.5rem',
            border: '1px solid #E8E3D5',
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.7 }}>
              👗
            </div>
            <p style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: '1.25rem',
              fontWeight: 600,
              color: '#1E1914',
              marginBottom: '0.5rem',
            }}>
              Pronto tendremos productos increibles.
            </p>
            <p style={{
              color: '#6b7280',
              fontSize: '0.95rem',
              fontFamily: "'Inter', sans-serif",
            }}>
              Volve pronto!
            </p>
          </div>
        ) : (
          <div
            ref={catalogGridReveal.ref}
            className="mbda-catalog-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: '1.25rem',
            }}
          >
            {items.map((item, i) => (
              <div
                key={item.id}
                style={{
                  opacity: catalogGridReveal.visible ? 1 : 0,
                  transform: catalogGridReveal.visible
                    ? 'translateX(0)'
                    : i % 2 === 0 ? 'translateX(-28px)' : 'translateX(28px)',
                  transition: `opacity 0.5s ease ${Math.min(i, 5) * 75}ms, transform 0.5s ease ${Math.min(i, 5) * 75}ms`,
                }}
              >
                <CatalogCard item={item} />
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
              style={{
                padding: '0.5rem 1rem', borderRadius: '0.75rem', border: '1px solid #E8E3D5',
                background: page === 1 ? '#f3f4f6' : '#fff', cursor: page === 1 ? 'not-allowed' : 'pointer',
                color: '#1E1914',
                transition: 'background 0.15s ease',
              }}
            >
              Anterior
            </button>
            <span style={{ padding: '0.5rem 1rem', color: '#6b7280', fontSize: '0.9rem', display: 'flex', alignItems: 'center' }}>
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              style={{
                padding: '0.5rem 1rem', borderRadius: '0.75rem', border: '1px solid #E8E3D5',
                background: page === totalPages ? '#f3f4f6' : '#fff', cursor: page === totalPages ? 'not-allowed' : 'pointer',
                color: '#1E1914',
                transition: 'background 0.15s ease',
              }}
            >
              Siguiente
            </button>
          </div>
        )}
      </section>
    </div>
  )
}
