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
  const [featuredItems, setFeaturedItems] = useState<any[]>([])
  const [featuredTitle, setFeaturedTitle] = useState('Destacados')
  const [videoSection, setVideoSection] = useState<{ active: boolean; title: string; videoUrl: string; description: string } | null>(null)
  const [shops, setShops] = useState<CatalogShop[]>([])

  // Scroll-reveal hooks
  const featuresReveal = useScrollReveal(0.1)
  const videoReveal    = useScrollReveal(0.1)
  const catalogReveal  = useScrollReveal(0.08)

  const selectedProductType = (productTypes ?? []).find(pt => pt.id === productTypeId)

  useEffect(() => {
    axiosClient.get<{ data: BannerData }>('/home-banners')
      .then(r => setBanners(r.data.data))
      .catch(() => {})
    axiosClient.get<{ data: { featureCards: FeatureCardsData | null } }>('/feature-cards')
      .then(r => setFeatureCardsData(r.data.data.featureCards ?? {}))
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

  return (
    <div style={{ minHeight: '100vh', background: '#FAF8F3' }}>
      {/* ── Banner dual: Compradores | Vendedores ─────────── */}
      <style>{`
        .mbda-banner { display: grid; grid-template-columns: 1fr 1fr; }
        @media (max-width: 640px) { .mbda-banner { grid-template-columns: 1fr; } }
      `}</style>
      <section className="mbda-banner" style={{ minHeight: '360px', background: '#1E1914' }}>
        {/* Panel comprador */}
        <div
          className="mbda-buyer-clip"
          style={{
            background: 'linear-gradient(160deg, #E8E3D5 0%, #d9d2c0 50%, #E8E3D5 100%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '3.5rem 2rem',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Subtle decorative circle */}
          <div style={{
            position: 'absolute',
            top: '-60px',
            right: '-60px',
            width: '200px',
            height: '200px',
            borderRadius: '50%',
            background: 'rgba(30, 25, 20, 0.03)',
          }} />
          <div style={{
            position: 'absolute',
            bottom: '-40px',
            left: '-40px',
            width: '150px',
            height: '150px',
            borderRadius: '50%',
            background: 'rgba(30, 25, 20, 0.03)',
          }} />
          <p className="mbda-hero-sub" style={{ fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#6b7280', marginBottom: '0.75rem', position: 'relative' }}>
            {buyerSubtitle}
          </p>
          <h2
            className="mbda-hero-title mbda-section-heading"
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: '2.25rem',
              fontWeight: 700,
              color: '#1E1914',
              lineHeight: 1.2,
              marginBottom: '1.25rem',
              position: 'relative',
            }}
          >
            {buyerTitle}
          </h2>
          <p className="mbda-hero-desc" style={{ color: '#4b5563', marginBottom: '2rem', maxWidth: '340px', lineHeight: 1.6, position: 'relative' }}>
            {buyerDesc}
          </p>
          <div className="mbda-hero-btns" style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center', position: 'relative' }}>
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
                  borderRadius: '0.75rem',
                  textDecoration: 'none',
                  fontWeight: 600,
                  fontSize: '1rem',
                  letterSpacing: '0.02em',
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
            background: 'linear-gradient(160deg, #1E1914 0%, #2a2420 50%, #1E1914 100%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '3.5rem 2rem',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Subtle decorative circle */}
          <div style={{
            position: 'absolute',
            top: '-50px',
            left: '-50px',
            width: '180px',
            height: '180px',
            borderRadius: '50%',
            background: 'rgba(232, 227, 213, 0.04)',
          }} />
          <div style={{
            position: 'absolute',
            bottom: '-50px',
            right: '-50px',
            width: '160px',
            height: '160px',
            borderRadius: '50%',
            background: 'rgba(232, 227, 213, 0.04)',
          }} />
          <p className="mbda-hero-sub" style={{ fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#9ca3af', marginBottom: '0.75rem', position: 'relative' }}>
            {sellerSubtitle}
          </p>
          <h2
            className="mbda-hero-title mbda-section-heading"
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: '2.25rem',
              fontWeight: 700,
              color: '#E8E3D5',
              lineHeight: 1.2,
              marginBottom: '1.25rem',
              position: 'relative',
            }}
          >
            {sellerTitle}
          </h2>
          <p className="mbda-hero-desc" style={{ color: '#d1d5db', marginBottom: sellerDesc ? '1.25rem' : '2rem', maxWidth: '340px', lineHeight: 1.6, position: 'relative' }}>
            {sellerDesc}
          </p>
          <div className="mbda-hero-btns" style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center', position: 'relative' }}>
            {reservarButtonActive && (
              <a
                href="#catalogo"
                onMouseEnter={() => setHoveredCta('reservar')}
                onMouseLeave={() => setHoveredCta(null)}
                style={{
                  background: hoveredCta === 'reservar' ? '#f5f0e6' : '#E8E3D5',
                  color: '#1E1914',
                  padding: '0.875rem 1.75rem',
                  borderRadius: '0.75rem',
                  textDecoration: 'none',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  letterSpacing: '0.02em',
                  transition: 'background 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease',
                  transform: hoveredCta === 'reservar' ? 'translateY(-2px)' : 'translateY(0)',
                  boxShadow: hoveredCta === 'reservar' ? '0 6px 20px rgba(0,0,0,0.4)' : '0 2px 8px rgba(0,0,0,0.2)',
                }}
              >
                💰 Reservar y ganar
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
                  borderRadius: '0.75rem',
                  textDecoration: 'none',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  letterSpacing: '0.02em',
                  border: '1px solid rgba(232, 227, 213, 0.3)',
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
                  borderRadius: '0.75rem',
                  textDecoration: 'none',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  letterSpacing: '0.02em',
                  border: '1px solid rgba(232, 227, 213, 0.3)',
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
        .mbda-features { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; }
        @media (max-width: 768px) { .mbda-features { grid-template-columns: 1fr; } }
      `}</style>
      <section
        ref={featuresReveal.ref}
        style={{ maxWidth: '1200px', margin: '0 auto', padding: '3rem 1.5rem 0' }}
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
                  background: '#fff',
                  border: '1px solid #E8E3D5',
                  borderRadius: '1rem',
                  padding: '2rem 1.5rem',
                  textAlign: 'center',
                  opacity: featuresReveal.visible ? 1 : 0,
                  transform: featuresReveal.visible ? 'translateY(0)' : 'translateY(22px)',
                  transition: `opacity 0.55s ease ${i * 120}ms, transform 0.55s ease ${i * 120}ms`,
                }}
              >
                <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>{card.emoji}</div>
                <h3 style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: '1.15rem',
                  fontWeight: 700,
                  color: '#1E1914',
                  marginBottom: '0.5rem',
                }}>
                  {card.title}
                </h3>
                <p style={{
                  color: '#4b5563',
                  fontSize: '0.95rem',
                  lineHeight: 1.6,
                  margin: 0,
                }}>
                  {card.desc}
                </p>
              </div>
            ))}
        </div>
      </section>

      {/* ── Catálogo ──────────────────────────────────────── */}
      <section id="catalogo" style={{ maxWidth: '1200px', margin: '0 auto', padding: '3rem 1.5rem' }}>
        <div
          ref={catalogReveal.ref}
          className={`mbda-sr${catalogReveal.visible ? ' mbda-sr-in' : ''}`}
        >
          <h2
            className="mbda-section-heading"
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: '1.75rem',
              fontWeight: 700,
              color: '#1E1914',
              marginBottom: '2rem',
            }}
          >
            Catalogo
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
            {productTypes.map(pt => (
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
            className="mbda-catalog-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: '1.25rem',
            }}
          >
            {items.map(item => (
              <CatalogCard key={item.id} item={item} />
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
