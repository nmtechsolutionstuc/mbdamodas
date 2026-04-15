import { useState, useEffect } from 'react'
import axiosClient from '../../api/axiosClient'
import { useToast } from '../../context/ToastContext'
import { ALL_CONDITIONS, type ConditionConfig, type ConditionEntry, invalidateConditionCache } from '../../hooks/useConditionConfig'
import { CONDITION_LABELS } from '../../types'

interface SocialLinkConfig { active: boolean; url: string }
interface SocialLinksConfig {
  whatsappGroup?: SocialLinkConfig
  tiktok?: SocialLinkConfig
  instagram?: SocialLinkConfig
  facebook?: SocialLinkConfig
}
const DEFAULT_SOCIAL: Record<keyof SocialLinksConfig, SocialLinkConfig> = {
  whatsappGroup: { active: false, url: '' },
  tiktok: { active: false, url: '' },
  instagram: { active: false, url: '' },
  facebook: { active: false, url: '' },
}

interface MenuItemConfig {
  active: boolean
  title: string
  description: string
}

interface MenuConfig {
  enviar?: MenuItemConfig
  solicitudes?: MenuItemConfig
  reservas?: MenuItemConfig
  perfil?: MenuItemConfig
}

interface FeatureCardConfig {
  active: boolean
  emoji: string
  title: string
  desc: string
}

interface FeatureCardsConfig {
  card1?: FeatureCardConfig
  card2?: FeatureCardConfig
  card3?: FeatureCardConfig
}

const DEFAULT_FEATURE_CARDS: Record<keyof FeatureCardsConfig, FeatureCardConfig> = {
  card1: { active: true, emoji: '👗', title: 'Ropa nueva', desc: 'Productos nuevos propios de MBDA Modas, con las últimas tendencias.' },
  card2: { active: true, emoji: '♻️', title: 'Ropa en consignación', desc: 'Productos seleccionados y cuidados, a precios accesibles.' },
  card3: { active: true, emoji: '💰', title: 'Ganá vendiendo', desc: 'Reservá un producto, conseguí un comprador y llevate una comisión. Sin inversión.' },
}

const DEFAULT_MENU_ITEMS: Record<keyof MenuConfig, MenuItemConfig> = {
  enviar: { active: true, title: 'Quiero vender', description: 'Carga lo que quieras vender, nosotros lo revisamos, lo aprobamos y lo vendemos por vos!' },
  solicitudes: { active: true, title: 'Mis solicitudes de venta', description: 'Seguí el estado de las solicitudes de venta que cargaste' },
  reservas: { active: true, title: 'Mis reservas para ganar comisiones', description: 'Reservá productos de la tienda y ganá una comisión luego de completar la venta' },
  perfil: { active: true, title: 'Mi perfil', description: 'Actualizá tus datos y número de WhatsApp' },
}

interface Store {
  id: string
  name: string
  address: string | null
  phone: string | null
  email: string | null
  defaultCommission: number
  isActive: boolean
  storeAttendantPhone: string | null
  announcementText: string | null
  announcementActive: boolean
  bannerBuyerSubtitle: string | null
  bannerBuyerTitle: string | null
  bannerBuyerDescription: string | null
  bannerBuyerButtonActive: boolean
  bannerSellerSubtitle: string | null
  bannerSellerTitle: string | null
  bannerSellerDescription: string | null
  bannerSellerButtonActive: boolean
  bannerReservarButtonActive: boolean
  aboutContent: string | null
  termsContent: string | null
  menuConfig: MenuConfig | null
  featureCards: FeatureCardsConfig | null
  socialLinks: SocialLinksConfig | null
  footerConfig: { tagline?: string; address?: string; showDeveloper?: boolean; showVenderLink?: boolean; venderLinkText?: string } | null
  aboutConfig: { showCatalogButton?: boolean; showVenderButton?: boolean; showWhatsappButton?: boolean; showEmailButton?: boolean } | null
  conditionConfig: ConditionConfig | null
}

export function AdminStoresPage() {
  const { toast } = useToast()
  const [stores, setStores] = useState<Store[]>([])
  const [editing, setEditing] = useState<Store | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    axiosClient.get('/admin/stores')
      .then(r => setStores(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  function startEdit(store: Store) {
    setEditing({
      ...store,
      menuConfig: store.menuConfig ?? {},
      featureCards: store.featureCards ?? {},
      socialLinks: store.socialLinks ?? {},
      footerConfig: store.footerConfig ?? {},
      aboutConfig: store.aboutConfig ?? {},
      conditionConfig: store.conditionConfig ?? {},
      bannerReservarButtonActive: store.bannerReservarButtonActive ?? true,
    })
    setSaved(false)
  }

  function getSocialLink(key: keyof SocialLinksConfig): SocialLinkConfig {
    return { ...DEFAULT_SOCIAL[key], ...(editing?.socialLinks?.[key] ?? {}) }
  }

  function setSocialLink(key: keyof SocialLinksConfig, patch: Partial<SocialLinkConfig>) {
    setEditing(prev => {
      if (!prev) return prev
      const current = { ...DEFAULT_SOCIAL[key], ...(prev.socialLinks?.[key] ?? {}) }
      return { ...prev, socialLinks: { ...(prev.socialLinks ?? {}), [key]: { ...current, ...patch } } }
    })
  }

  function getFeatureCardEdit(key: keyof FeatureCardsConfig): FeatureCardConfig {
    return { ...DEFAULT_FEATURE_CARDS[key], ...(editing?.featureCards?.[key] ?? {}) }
  }

  function setFeatureCardEdit(key: keyof FeatureCardsConfig, patch: Partial<FeatureCardConfig>) {
    setEditing(prev => {
      if (!prev) return prev
      const current = { ...DEFAULT_FEATURE_CARDS[key], ...(prev.featureCards?.[key] ?? {}) }
      return { ...prev, featureCards: { ...(prev.featureCards ?? {}), [key]: { ...current, ...patch } } }
    })
  }

  function getMenuItemEdit(key: keyof MenuConfig): MenuItemConfig {
    return { ...DEFAULT_MENU_ITEMS[key], ...(editing?.menuConfig?.[key] ?? {}) }
  }

  function setMenuItemEdit(key: keyof MenuConfig, patch: Partial<MenuItemConfig>) {
    setEditing(prev => {
      if (!prev) return prev
      const current = { ...DEFAULT_MENU_ITEMS[key], ...(prev.menuConfig?.[key] ?? {}) }
      return { ...prev, menuConfig: { ...(prev.menuConfig ?? {}), [key]: { ...current, ...patch } } }
    })
  }

  async function handleSave() {
    if (!editing) return
    setSaving(true)
    try {
      const { data } = await axiosClient.patch(`/admin/stores/${editing.id}`, {
        name: editing.name,
        address: editing.address,
        phone: editing.phone,
        email: editing.email,
        defaultCommission: Number(editing.defaultCommission),
        isActive: editing.isActive,
        storeAttendantPhone: editing.storeAttendantPhone,
        announcementText: editing.announcementText,
        announcementActive: editing.announcementActive,
        bannerBuyerSubtitle: editing.bannerBuyerSubtitle,
        bannerBuyerTitle: editing.bannerBuyerTitle,
        bannerBuyerDescription: editing.bannerBuyerDescription,
        bannerBuyerButtonActive: editing.bannerBuyerButtonActive,
        bannerSellerSubtitle: editing.bannerSellerSubtitle,
        bannerSellerTitle: editing.bannerSellerTitle,
        bannerSellerDescription: editing.bannerSellerDescription,
        bannerSellerButtonActive: editing.bannerSellerButtonActive,
        bannerReservarButtonActive: editing.bannerReservarButtonActive,
        aboutContent: editing.aboutContent,
        termsContent: editing.termsContent,
        menuConfig: editing.menuConfig ?? {},
        featureCards: editing.featureCards ?? {},
        socialLinks: editing.socialLinks ?? {},
        footerConfig: editing.footerConfig ?? {},
        aboutConfig: editing.aboutConfig ?? {},
        conditionConfig: editing.conditionConfig ?? {},
      })
      setStores(prev => prev.map(s => s.id === editing.id ? data.data : s))
      invalidateConditionCache()
      setEditing(null)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch {
      toast('No se pudo guardar', 'error')
    } finally {
      setSaving(false)
    }
  }

  const inp = (label: string, value: string | number, onChange: (v: string) => void, type = 'text') => (
    <div>
      <label style={{ display: 'block', fontSize: '0.8rem', color: '#6b7280', marginBottom: '0.25rem' }}>{label}</label>
      <input
        type={type}
        value={value ?? ''}
        onChange={e => onChange(e.target.value)}
        style={{ width: '100%', padding: '0.625rem', borderRadius: '0.625rem', border: '1px solid #E8E3D5', fontSize: '0.9rem', color: '#1E1914', boxSizing: 'border-box' as const }}
      />
    </div>
  )

  const txtArea = (label: string, value: string, onChange: (v: string) => void, rows = 2) => (
    <div>
      <label style={{ display: 'block', fontSize: '0.8rem', color: '#6b7280', marginBottom: '0.25rem' }}>{label}</label>
      <textarea
        value={value ?? ''}
        onChange={e => onChange(e.target.value)}
        rows={rows}
        style={{ width: '100%', padding: '0.625rem', borderRadius: '0.625rem', border: '1px solid #E8E3D5', fontSize: '0.9rem', color: '#1E1914', boxSizing: 'border-box' as const, resize: 'vertical', fontFamily: "'Inter', sans-serif" }}
      />
    </div>
  )

  const sectionTitle = (text: string) => (
    <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1E1914', marginTop: '0.5rem', marginBottom: '0.25rem', borderTop: '1px solid #E8E3D5', paddingTop: '0.75rem' }}>
      {text}
    </p>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#FAF8F3', padding: '1.5rem' }}>
      <div style={{ maxWidth: '700px', margin: '0 auto' }}>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.75rem', fontWeight: 700, color: '#1E1914', marginBottom: '1.5rem' }}>
          Tiendas
        </h1>

        {saved && (
          <div style={{ background: '#dcfce7', color: '#166534', padding: '0.75rem 1rem', borderRadius: '0.75rem', marginBottom: '1rem', fontSize: '0.875rem' }}>
            ✓ Cambios guardados
          </div>
        )}

        {loading ? (
          <p style={{ color: '#9ca3af' }}>Cargando...</p>
        ) : stores.map(store => (
          <div key={store.id} style={{ background: '#fff', border: '1px solid #E8E3D5', borderRadius: '1rem', padding: '1.25rem', marginBottom: '1rem' }}>
            {editing?.id === store.id ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                {inp('Nombre', editing.name, v => setEditing(e => e && ({ ...e, name: v })))}
                {inp('Direccion', editing.address ?? '', v => setEditing(e => e && ({ ...e, address: v })))}
                {inp('Telefono WhatsApp', editing.phone ?? '', v => setEditing(e => e && ({ ...e, phone: v })))}
                <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '-0.5rem' }}>
                  Formato sin + ni espacios: 5491112345678
                </p>
                {inp('Telefono encargado tienda', editing.storeAttendantPhone ?? '', v => setEditing(e => e && ({ ...e, storeAttendantPhone: v })))}
                <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '-0.5rem' }}>
                  Telefono del encargado para consultas de reservas (formato: 5491112345678)
                </p>
                {inp('Email', editing.email ?? '', v => setEditing(e => e && ({ ...e, email: v })))}
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                    Comision por defecto (%)
                  </label>
                  <input
                    type="number" min={0} max={100}
                    value={editing.defaultCommission}
                    onChange={e => setEditing(prev => prev && ({ ...prev, defaultCommission: parseFloat(e.target.value) }))}
                    style={{ width: '120px', padding: '0.625rem', borderRadius: '0.625rem', border: '1px solid #E8E3D5', fontSize: '0.9rem' }}
                  />
                </div>
                <label style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', cursor: 'pointer', fontSize: '0.875rem', color: '#1E1914' }}>
                  <input type="checkbox" checked={editing.isActive} onChange={e => setEditing(prev => prev && ({ ...prev, isActive: e.target.checked }))} />
                  Tienda activa
                </label>

                {/* ── Barra de anuncios ── */}
                {sectionTitle('Barra de anuncios (debajo del menu)')}
                {inp('Texto del anuncio', editing.announcementText ?? '', v => setEditing(e => e && ({ ...e, announcementText: v })))}
                <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '-0.5rem' }}>
                  Ej: "Solo por este mes gana un 15% en comisiones"
                </p>
                <label style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', cursor: 'pointer', fontSize: '0.875rem', color: '#1E1914' }}>
                  <input type="checkbox" checked={editing.announcementActive} onChange={e => setEditing(prev => prev && ({ ...prev, announcementActive: e.target.checked }))} />
                  Mostrar barra de anuncios
                </label>

                {/* ── Banner compradores (homepage) ── */}
                {sectionTitle('Banner compradores (homepage - panel izquierdo)')}
                {inp('Subtitulo', editing.bannerBuyerSubtitle ?? '', v => setEditing(e => e && ({ ...e, bannerBuyerSubtitle: v })))}
                <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '-0.5rem' }}>
                  Ej: "Para compradores"
                </p>
                {inp('Titulo', editing.bannerBuyerTitle ?? '', v => setEditing(e => e && ({ ...e, bannerBuyerTitle: v })))}
                <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '-0.5rem' }}>
                  Ej: "Ropa nueva y con historia a precios que sorprenden"
                </p>
                {txtArea('Descripcion', editing.bannerBuyerDescription ?? '', v => setEditing(e => e && ({ ...e, bannerBuyerDescription: v })))}
                <label style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', cursor: 'pointer', fontSize: '0.875rem', color: '#1E1914' }}>
                  <input type="checkbox" checked={editing.bannerBuyerButtonActive ?? false} onChange={e => setEditing(prev => prev && ({ ...prev, bannerBuyerButtonActive: e.target.checked }))} />
                  Mostrar botón del panel comprador
                </label>

                {/* ── Banner vendedores/promotores (homepage) ── */}
                {sectionTitle('Banner vendedores/promotores (homepage - panel derecho)')}
                {inp('Subtitulo', editing.bannerSellerSubtitle ?? '', v => setEditing(e => e && ({ ...e, bannerSellerSubtitle: v })))}
                <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '-0.5rem' }}>
                  Ej: "Para vendedores y promotores"
                </p>
                {inp('Titulo', editing.bannerSellerTitle ?? '', v => setEditing(e => e && ({ ...e, bannerSellerTitle: v })))}
                <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '-0.5rem' }}>
                  Ej: "Gana dinero vendiendo nuestros productos"
                </p>
                {txtArea('Descripcion', editing.bannerSellerDescription ?? '', v => setEditing(e => e && ({ ...e, bannerSellerDescription: v })))}
                <label style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', cursor: 'pointer', fontSize: '0.875rem', color: '#1E1914' }}>
                  <input type="checkbox" checked={editing.bannerReservarButtonActive ?? true} onChange={e => setEditing(prev => prev && ({ ...prev, bannerReservarButtonActive: e.target.checked }))} />
                  Mostrar botón 'Reservar y ganar'
                </label>
                <label style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', cursor: 'pointer', fontSize: '0.875rem', color: '#1E1914' }}>
                  <input type="checkbox" checked={editing.bannerSellerButtonActive ?? false} onChange={e => setEditing(prev => prev && ({ ...prev, bannerSellerButtonActive: e.target.checked }))} />
                  Mostrar botón 'Quiero vender'
                </label>

                {/* ── Pagina Nosotros ── */}
                {sectionTitle('Pagina "Nosotros"')}
                <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '-0.25rem' }}>
                  Usa ## para titulos, ### para subtitulos, y texto normal para parrafos. Separa secciones con una linea en blanco.
                </p>
                {txtArea('Contenido de la pagina Nosotros', editing.aboutContent ?? '', v => setEditing(e => e && ({ ...e, aboutContent: v })), 10)}

                {/* ── Pagina Terminos y Condiciones ── */}
                {sectionTitle('Pagina "Terminos y Condiciones"')}
                <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '-0.25rem' }}>
                  Usa ## para titulos de articulos, ### para subtitulos, --- para separadores. Cada articulo en un parrafo separado.
                </p>
                {txtArea('Contenido de Terminos y Condiciones', editing.termsContent ?? '', v => setEditing(e => e && ({ ...e, termsContent: v })), 10)}

                {/* ── Cards de propuesta de valor (homepage) ── */}
                {sectionTitle('Cards de propuesta de valor (homepage)')}
                <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '-0.25rem' }}>
                  Las tres cards que aparecen debajo del banner principal. Podés editarlas, cambiar el emoji/ícono, y desactivarlas.
                </p>
                {(['card1', 'card2', 'card3'] as (keyof FeatureCardsConfig)[]).map(key => {
                  const card = getFeatureCardEdit(key)
                  const nums: Record<keyof FeatureCardsConfig, string> = { card1: 'Card 1', card2: 'Card 2', card3: 'Card 3' }
                  return (
                    <div key={key} style={{ background: '#FAF8F3', border: '1px solid #E8E3D5', borderRadius: '0.75rem', padding: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <label style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600, color: '#1E1914' }}>
                        <input
                          type="checkbox"
                          checked={card.active}
                          onChange={e => setFeatureCardEdit(key, { active: e.target.checked })}
                        />
                        {nums[key]} — {card.title}
                      </label>
                      <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '0.5rem' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>Emoji/ícono</label>
                          <input
                            type="text"
                            value={card.emoji}
                            onChange={e => setFeatureCardEdit(key, { emoji: e.target.value })}
                            style={{ width: '100%', padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid #E8E3D5', fontSize: '1.25rem', textAlign: 'center', boxSizing: 'border-box' as const }}
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>Título</label>
                          <input
                            type="text"
                            value={card.title}
                            onChange={e => setFeatureCardEdit(key, { title: e.target.value })}
                            style={{ width: '100%', padding: '0.5rem 0.625rem', borderRadius: '0.5rem', border: '1px solid #E8E3D5', fontSize: '0.875rem', color: '#1E1914', boxSizing: 'border-box' as const }}
                          />
                        </div>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>Descripción</label>
                        <textarea
                          value={card.desc}
                          onChange={e => setFeatureCardEdit(key, { desc: e.target.value })}
                          rows={2}
                          style={{ width: '100%', padding: '0.5rem 0.625rem', borderRadius: '0.5rem', border: '1px solid #E8E3D5', fontSize: '0.875rem', color: '#1E1914', boxSizing: 'border-box' as const, resize: 'vertical', fontFamily: "'Inter', sans-serif" }}
                        />
                      </div>
                    </div>
                  )
                })}

                {/* ── Menu del dashboard de usuarios ── */}
                {sectionTitle('Menú del panel de usuarios')}
                <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '-0.25rem' }}>
                  Configurá las opciones que ven los usuarios en su panel. Podés desactivar opciones, y editar sus títulos y descripciones.
                </p>
                {(['enviar', 'solicitudes', 'reservas', 'perfil'] as (keyof MenuConfig)[]).map(key => {
                  const item = getMenuItemEdit(key)
                  const labels: Record<keyof MenuConfig, string> = {
                    enviar: 'Opción "Quiero vender"',
                    solicitudes: 'Opción "Mis solicitudes"',
                    reservas: 'Opción "Mis reservas"',
                    perfil: 'Opción "Mi perfil"',
                  }
                  return (
                    <div key={key} style={{ background: '#FAF8F3', border: '1px solid #E8E3D5', borderRadius: '0.75rem', padding: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <label style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600, color: '#1E1914' }}>
                        <input
                          type="checkbox"
                          checked={item.active}
                          onChange={e => setMenuItemEdit(key, { active: e.target.checked })}
                        />
                        {labels[key]}
                      </label>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>Título</label>
                        <input
                          type="text"
                          value={item.title}
                          onChange={e => setMenuItemEdit(key, { title: e.target.value })}
                          style={{ width: '100%', padding: '0.5rem 0.625rem', borderRadius: '0.5rem', border: '1px solid #E8E3D5', fontSize: '0.875rem', color: '#1E1914', boxSizing: 'border-box' as const }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>Descripción</label>
                        <textarea
                          value={item.description}
                          onChange={e => setMenuItemEdit(key, { description: e.target.value })}
                          rows={2}
                          style={{ width: '100%', padding: '0.5rem 0.625rem', borderRadius: '0.5rem', border: '1px solid #E8E3D5', fontSize: '0.875rem', color: '#1E1914', boxSizing: 'border-box' as const, resize: 'vertical', fontFamily: "'Inter', sans-serif" }}
                        />
                      </div>
                    </div>
                  )
                })}

                {/* ── Redes sociales ── */}
                {sectionTitle('Redes sociales')}
                <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '-0.25rem' }}>
                  Configurá los links a tus redes. Solo se muestran los que están activos.
                </p>
                {([
                  { key: 'whatsappGroup' as keyof SocialLinksConfig, label: 'Grupo de WhatsApp' },
                  { key: 'tiktok' as keyof SocialLinksConfig, label: 'TikTok' },
                  { key: 'instagram' as keyof SocialLinksConfig, label: 'Instagram' },
                  { key: 'facebook' as keyof SocialLinksConfig, label: 'Facebook' },
                ]).map(({ key, label }) => {
                  const link = getSocialLink(key)
                  return (
                    <div key={key} style={{ background: '#FAF8F3', border: '1px solid #E8E3D5', borderRadius: '0.75rem', padding: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <label style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600, color: '#1E1914' }}>
                        <input
                          type="checkbox"
                          checked={link.active}
                          onChange={e => setSocialLink(key, { active: e.target.checked })}
                        />
                        {label}
                      </label>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>URL / Link</label>
                        <input
                          type="text"
                          value={link.url}
                          onChange={e => setSocialLink(key, { url: e.target.value })}
                          placeholder="https://..."
                          style={{ width: '100%', padding: '0.5rem 0.625rem', borderRadius: '0.5rem', border: '1px solid #E8E3D5', fontSize: '0.875rem', color: '#1E1914', boxSizing: 'border-box' as const }}
                        />
                      </div>
                    </div>
                  )
                })}

                {/* ── Configuración del footer ── */}
                {sectionTitle('Configuración del footer')}
                {txtArea('Descripción/tagline de la tienda', editing.footerConfig?.tagline ?? '', v => setEditing(e => e && ({ ...e, footerConfig: { ...(e.footerConfig ?? {}), tagline: v } })))}
                {inp('Dirección en footer', editing.footerConfig?.address ?? '', v => setEditing(e => e && ({ ...e, footerConfig: { ...(e.footerConfig ?? {}), address: v } })))}
                <label style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', cursor: 'pointer', fontSize: '0.875rem', color: '#1E1914', marginTop: '0.25rem' }}>
                  <input
                    type="checkbox"
                    checked={editing.footerConfig?.showDeveloper ?? true}
                    onChange={e => setEditing(prev => prev && ({ ...prev, footerConfig: { ...(prev.footerConfig ?? {}), showDeveloper: e.target.checked } }))}
                  />
                  Mostrar sección del desarrollador
                </label>
                <div style={{ border: '1px solid #E8E3D5', borderRadius: '0.75rem', padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <label style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', cursor: 'pointer', fontSize: '0.875rem', color: '#1E1914', fontWeight: 600 }}>
                    <input
                      type="checkbox"
                      checked={editing.footerConfig?.showVenderLink ?? false}
                      onChange={e => setEditing(prev => prev && ({ ...prev, footerConfig: { ...(prev.footerConfig ?? {}), showVenderLink: e.target.checked } }))}
                    />
                    Mostrar link "Quiero vender" en navegación del footer
                  </label>
                  {(editing.footerConfig?.showVenderLink ?? false) && (
                    inp('Texto del link', editing.footerConfig?.venderLinkText ?? 'Quiero vender', v => setEditing(e => e && ({ ...e, footerConfig: { ...(e.footerConfig ?? {}), venderLinkText: v } })))
                  )}
                </div>

                {/* ── Página Nosotros - botones ── */}
                {sectionTitle('Página Nosotros - botones')}
                <label style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', cursor: 'pointer', fontSize: '0.875rem', color: '#1E1914' }}>
                  <input
                    type="checkbox"
                    checked={editing.aboutConfig?.showCatalogButton ?? true}
                    onChange={e => setEditing(prev => prev && ({ ...prev, aboutConfig: { ...(prev.aboutConfig ?? {}), showCatalogButton: e.target.checked } }))}
                  />
                  Mostrar botón 'Ver catálogo'
                </label>
                <label style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', cursor: 'pointer', fontSize: '0.875rem', color: '#1E1914' }}>
                  <input
                    type="checkbox"
                    checked={editing.aboutConfig?.showVenderButton ?? true}
                    onChange={e => setEditing(prev => prev && ({ ...prev, aboutConfig: { ...(prev.aboutConfig ?? {}), showVenderButton: e.target.checked } }))}
                  />
                  Mostrar botón 'Empezar a vender'
                </label>
                <label style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', cursor: 'pointer', fontSize: '0.875rem', color: '#1E1914' }}>
                  <input
                    type="checkbox"
                    checked={editing.aboutConfig?.showWhatsappButton ?? true}
                    onChange={e => setEditing(prev => prev && ({ ...prev, aboutConfig: { ...(prev.aboutConfig ?? {}), showWhatsappButton: e.target.checked } }))}
                  />
                  Mostrar botón WhatsApp de contacto
                </label>
                <label style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', cursor: 'pointer', fontSize: '0.875rem', color: '#1E1914' }}>
                  <input
                    type="checkbox"
                    checked={editing.aboutConfig?.showEmailButton ?? true}
                    onChange={e => setEditing(prev => prev && ({ ...prev, aboutConfig: { ...(prev.aboutConfig ?? {}), showEmailButton: e.target.checked } }))}
                  />
                  Mostrar botón Email de contacto
                </label>

                {/* ── Condiciones de producto ── */}
                {sectionTitle('Condiciones de producto')}
                <p style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                  Editá el nombre visible de cada condición y desactivá las que no uses.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {ALL_CONDITIONS.map((cond, idx) => {
                    const entry: ConditionEntry = {
                      label: CONDITION_LABELS[cond],
                      active: true,
                      order: idx,
                      ...(editing.conditionConfig?.[cond] ?? {}),
                    }
                    return (
                      <div key={cond} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid #E8E3D5', borderRadius: '0.75rem', padding: '0.5rem 0.75rem', background: entry.active ? '#fff' : '#f9f9f9', opacity: entry.active ? 1 : 0.6 }}>
                        <input
                          type="checkbox"
                          checked={entry.active}
                          onChange={e => setEditing(prev => prev && ({
                            ...prev,
                            conditionConfig: { ...(prev.conditionConfig ?? {}), [cond]: { ...entry, active: e.target.checked } },
                          }))}
                          style={{ cursor: 'pointer', flexShrink: 0 }}
                        />
                        <input
                          value={entry.label}
                          onChange={e => setEditing(prev => prev && ({
                            ...prev,
                            conditionConfig: { ...(prev.conditionConfig ?? {}), [cond]: { ...entry, label: e.target.value } },
                          }))}
                          style={{ flex: 1, border: '1px solid #E8E3D5', borderRadius: '0.5rem', padding: '0.35rem 0.625rem', fontSize: '0.875rem', color: '#1E1914', background: 'transparent' }}
                        />
                        <span style={{ fontSize: '0.7rem', color: '#9ca3af', whiteSpace: 'nowrap', fontFamily: 'monospace' }}>{cond}</span>
                      </div>
                    )
                  })}
                </div>

                <div style={{ display: 'flex', gap: '0.625rem', marginTop: '0.5rem' }}>
                  <button onClick={() => setEditing(null)} style={{ flex: 1, padding: '0.625rem', borderRadius: '0.75rem', border: '1px solid #E8E3D5', background: '#fff', cursor: 'pointer', fontSize: '0.875rem' }}>
                    Cancelar
                  </button>
                  <button onClick={handleSave} disabled={saving} style={{ flex: 2, padding: '0.625rem', borderRadius: '0.75rem', border: 'none', background: '#1E1914', color: '#E8E3D5', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' }}>
                    {saving ? 'Guardando...' : 'Guardar cambios'}
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <p style={{ fontWeight: 700, color: '#1E1914', marginBottom: '0.25rem' }}>{store.name}</p>
                  {store.phone && <p style={{ fontSize: '0.8rem', color: '#6b7280' }}>📱 {store.phone}</p>}
                  {store.address && <p style={{ fontSize: '0.8rem', color: '#6b7280' }}>📍 {store.address}</p>}
                  <p style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '0.25rem' }}>
                    Comision: <strong>{store.defaultCommission}%</strong>
                    {' · '}
                    <span style={{ color: store.isActive ? '#16a34a' : '#dc2626' }}>
                      {store.isActive ? 'Activa' : 'Inactiva'}
                    </span>
                  </p>
                  {store.announcementActive && store.announcementText && (
                    <p style={{ fontSize: '0.8rem', color: '#dc2626', marginTop: '0.25rem' }}>
                      📢 {store.announcementText}
                    </p>
                  )}
                </div>
                <button onClick={() => startEdit(store)} style={{ padding: '0.5rem 1rem', borderRadius: '0.75rem', border: '1px solid #E8E3D5', background: '#fff', cursor: 'pointer', fontSize: '0.875rem', color: '#1E1914' }}>
                  Editar
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
