import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axiosClient from '../../api/axiosClient'
import { renderContent } from '../../utils/renderContent'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'

interface SocialLink { active: boolean; url: string }
interface StoreInfo {
  name: string | null
  phone: string | null
  email: string | null
  address: string | null
  socialLinks: { whatsappGroup?: SocialLink; tiktok?: SocialLink; instagram?: SocialLink; facebook?: SocialLink } | null
  aboutConfig: { showCatalogButton?: boolean; showVenderButton?: boolean; showWhatsappButton?: boolean; showEmailButton?: boolean } | null
}

export function AboutPage() {
  const { isAdmin } = useAuth()
  const { toast } = useToast()
  const [content, setContent] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [storeInfo, setStoreInfo] = useState<StoreInfo | null>(null)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    axiosClient.get('/about-content')
      .then(r => setContent(r.data.data.content))
      .catch(() => {})
      .finally(() => setLoading(false))
    axiosClient.get<{ data: { store: StoreInfo | null } }>('/store-info')
      .then(r => setStoreInfo(r.data.data.store))
      .catch(() => {})
  }, [])

  async function handleSaveAbout() {
    setSaving(true)
    try {
      await axiosClient.patch('/admin/store-content', { aboutContent: draft })
      setContent(draft)
      setEditing(false)
      toast('Contenido guardado', 'success')
    } catch {
      toast('No se pudo guardar', 'error')
    } finally {
      setSaving(false)
    }
  }

  const waLink = `https://wa.me/${storeInfo?.phone ?? ''}?text=Hola!%20Quiero%20consultar%20sobre%20MBDA%20Modas.`
  const emailDisplay = storeInfo?.email ?? 'contacto@mbdamodas.com'
  const showCatalogButton = storeInfo?.aboutConfig?.showCatalogButton ?? true
  const showVenderButton = storeInfo?.aboutConfig?.showVenderButton ?? true
  const showWhatsappButton = storeInfo?.aboutConfig?.showWhatsappButton ?? true
  const showEmailButton = storeInfo?.aboutConfig?.showEmailButton ?? true
  const social = storeInfo?.socialLinks ?? {}
  const hasSocialLinks = social.whatsappGroup?.active || social.tiktok?.active || social.instagram?.active || social.facebook?.active

  const editPanel = (
    <>
      {isAdmin && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
          <button
            onClick={() => { setDraft(content ?? ''); setEditing(true) }}
            style={{ padding: '0.5rem 1rem', borderRadius: '0.75rem', border: '1px solid #E8E3D5', background: '#fff', cursor: 'pointer', fontSize: '0.8rem', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '0.375rem' }}
          >
            ✏️ Editar contenido
          </button>
        </div>
      )}
      {isAdmin && editing && (
        <div style={{ background: '#fff', border: '1px solid #E8E3D5', borderRadius: '1rem', padding: '1.25rem', marginBottom: '2rem' }}>
          <p style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '0.75rem' }}>
            Usá <strong>##</strong> para títulos, <strong>###</strong> para subtítulos. Separá secciones con línea en blanco.
          </p>
          <textarea
            value={draft}
            onChange={e => setDraft(e.target.value)}
            rows={20}
            style={{ width: '100%', padding: '0.75rem', borderRadius: '0.625rem', border: '1px solid #E8E3D5', fontSize: '0.875rem', fontFamily: 'monospace', boxSizing: 'border-box', resize: 'vertical' }}
          />
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.75rem', justifyContent: 'flex-end' }}>
            <button onClick={() => setEditing(false)} style={{ padding: '0.5rem 1rem', borderRadius: '0.75rem', border: '1px solid #E8E3D5', background: '#fff', cursor: 'pointer', fontSize: '0.875rem' }}>
              Cancelar
            </button>
            <button
              onClick={handleSaveAbout}
              disabled={saving}
              style={{ padding: '0.5rem 1.25rem', borderRadius: '0.75rem', border: 'none', background: '#1E1914', color: '#E8E3D5', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' }}
            >
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </div>
      )}
    </>
  )

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#FAF8F3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#9ca3af' }}>Cargando...</p>
      </div>
    )
  }

  // If content from DB exists, render dynamic version
  if (content) {
    return (
      <div style={{ minHeight: '100vh', background: '#FAF8F3' }}>
        {/* Hero */}
        <div style={{ background: '#1E1914', color: '#E8E3D5', padding: '4rem 1.5rem 3rem' }}>
          <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <p style={{ fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase', opacity: 0.6, marginBottom: '1rem' }}>
              Sobre nosotros
            </p>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 700, lineHeight: 1.2, marginBottom: '1.5rem' }}>
              {extractFirstHeading(content)}
            </h1>
            <p style={{ fontSize: '1.1rem', opacity: 0.8, lineHeight: 1.7 }}>
              {extractFirstParagraph(content)}
            </p>
          </div>
        </div>

        {/* Content */}
        <div style={{ maxWidth: '700px', margin: '0 auto', padding: '3rem 1.5rem' }}>
          {editPanel}

          {renderContent(removeFirstSection(content))}

          {/* CTA buttons */}
          {(showCatalogButton || showVenderButton) && (
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '2rem', marginBottom: '2rem' }}>
              {showCatalogButton && (
                <Link
                  to="/"
                  style={{ display: 'inline-block', background: '#1E1914', color: '#E8E3D5', padding: '0.75rem 1.5rem', borderRadius: '0.875rem', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem' }}
                >
                  Ver catalogo
                </Link>
              )}
              {showVenderButton && (
                <Link
                  to="/register"
                  style={{ display: 'inline-block', background: '#E8E3D5', color: '#1E1914', padding: '0.75rem 1.5rem', borderRadius: '0.875rem', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem', border: '1px solid #d1cdc0' }}
                >
                  Empezar a vender
                </Link>
              )}
            </div>
          )}

          {/* Contact */}
          {(showWhatsappButton || showEmailButton) && (
            <section style={{ textAlign: 'center', marginTop: '2rem', marginBottom: '2rem' }}>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.25rem', fontWeight: 700, color: '#1E1914', marginBottom: '0.5rem' }}>
                Tenes preguntas?
              </h2>
              <p style={{ color: '#6b7280', marginBottom: '1rem' }}>Escribinos por WhatsApp o por email.</p>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                {showWhatsappButton && (
                  <a
                    href={waLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#25D366', color: '#fff', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem', padding: '0.625rem 1.25rem', borderRadius: '0.75rem' }}
                  >
                    WhatsApp
                  </a>
                )}
                {showEmailButton && (
                  <a
                    href={`mailto:${emailDisplay}`}
                    style={{ color: '#1E1914', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem', border: '1px solid #E8E3D5', padding: '0.625rem 1.25rem', borderRadius: '0.75rem' }}
                  >
                    {emailDisplay}
                  </a>
                )}
              </div>
            </section>
          )}

          {/* Social media links */}
          {hasSocialLinks && (
            <section style={{ textAlign: 'center', marginTop: '1.5rem', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                {social.whatsappGroup?.active && social.whatsappGroup.url && (
                  <a href={social.whatsappGroup.url} target="_blank" rel="noopener noreferrer"
                    style={{ background: '#25D366', color: '#fff', padding: '0.5rem 1rem', borderRadius: '0.625rem', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 600 }}>
                    💬 Grupo de WhatsApp
                  </a>
                )}
                {social.instagram?.active && social.instagram.url && (
                  <a href={social.instagram.url} target="_blank" rel="noopener noreferrer"
                    style={{ background: '#E1306C', color: '#fff', padding: '0.5rem 1rem', borderRadius: '0.625rem', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 600 }}>
                    📸 Instagram
                  </a>
                )}
                {social.tiktok?.active && social.tiktok.url && (
                  <a href={social.tiktok.url} target="_blank" rel="noopener noreferrer"
                    style={{ background: '#010101', color: '#fff', padding: '0.5rem 1rem', borderRadius: '0.625rem', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 600 }}>
                    🎵 TikTok
                  </a>
                )}
                {social.facebook?.active && social.facebook.url && (
                  <a href={social.facebook.url} target="_blank" rel="noopener noreferrer"
                    style={{ background: '#1877F2', color: '#fff', padding: '0.5rem 1rem', borderRadius: '0.625rem', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 600 }}>
                    👍 Facebook
                  </a>
                )}
              </div>
            </section>
          )}

          {/* Developer section */}
          <section style={{ marginTop: '3rem', borderTop: '1px solid #E8E3D5', paddingTop: '2rem' }}>
            <div style={{
              background: 'linear-gradient(135deg, #1E1914 0%, #2d2520 100%)',
              borderRadius: '1.5rem',
              padding: '2rem',
              textAlign: 'center',
            }}>
              <p style={{ fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(232,227,213,0.5)', marginBottom: '0.75rem' }}>
                Desarrollo a medida
              </p>
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.25rem', fontWeight: 700, color: '#E8E3D5', marginBottom: '0.5rem' }}>
                Queres una app como esta para tu negocio?
              </h3>
              <p style={{ color: 'rgba(232,227,213,0.7)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '0.25rem' }}>
                Esta plataforma fue desarrollada por
              </p>
              <p style={{ color: '#E8E3D5', fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.125rem' }}>
                Nahuel Martinez
              </p>
              <p style={{ color: 'rgba(232,227,213,0.6)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
                Ingeniero en Sistemas · Tucuman, Argentina
              </p>
              <a
                href="https://wa.me/543865468239?text=Hola%20Nahuel!%20Vi%20tu%20trabajo%20en%20MBDA%20Modas%20y%20me%20interesa%20un%20proyecto%20similar."
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                  background: '#25D366', color: '#fff', padding: '0.75rem 1.5rem',
                  borderRadius: '0.875rem', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem',
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Contactar a Nahuel
              </a>
              <p style={{ color: 'rgba(232,227,213,0.4)', fontSize: '0.75rem', marginTop: '1rem' }}>
                +54 3865 468239
              </p>
            </div>
          </section>
        </div>
      </div>
    )
  }

  // Fallback: no content yet
  return (
    <div style={{ minHeight: '100vh', background: '#FAF8F3', padding: '2rem 1.5rem' }}>
      <div style={{ maxWidth: '700px', margin: '0 auto' }}>
        {editPanel}
        <p style={{ color: '#9ca3af' }}>Contenido no disponible.</p>
      </div>
    </div>
  )
}

/** Extract the first ## heading text */
function extractFirstHeading(content: string): string {
  const match = content.match(/^## (.+)$/m)
  return match ? match[1]! : 'Sobre nosotros'
}

/** Extract the first paragraph after the first heading */
function extractFirstParagraph(content: string): string {
  const lines = content.split('\n')
  let pastFirstHeading = false
  for (const line of lines) {
    if (line.startsWith('## ') && !pastFirstHeading) {
      pastFirstHeading = true
      continue
    }
    if (pastFirstHeading && line.trim() !== '' && !line.startsWith('#')) {
      return line.trim()
    }
  }
  return ''
}

/** Remove the first ## heading and its first paragraph */
function removeFirstSection(content: string): string {
  const lines = content.split('\n')
  let skip = 0
  let pastHeading = false
  let pastParagraph = false
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!
    if (line.startsWith('## ') && !pastHeading) {
      pastHeading = true
      skip = i + 1
      continue
    }
    if (pastHeading && !pastParagraph && line.trim() === '') {
      skip = i + 1
      continue
    }
    if (pastHeading && !pastParagraph && line.trim() !== '') {
      pastParagraph = true
      skip = i + 1
      continue
    }
    if (pastParagraph) break
  }
  return lines.slice(skip).join('\n')
}
