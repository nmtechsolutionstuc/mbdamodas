import { Link } from 'react-router-dom'

export function AboutPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#FAF8F3' }}>
      {/* Hero */}
      <div style={{ background: '#1E1914', color: '#E8E3D5', padding: '4rem 1.5rem 3rem' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <p style={{ fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase', opacity: 0.6, marginBottom: '1rem' }}>
            Sobre nosotros
          </p>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 700, lineHeight: 1.2, marginBottom: '1.5rem' }}>
            La tienda donde la ropa encuentra su próxima historia
          </h1>
          <p style={{ fontSize: '1.1rem', opacity: 0.8, lineHeight: 1.7 }}>
            MBDA Modas es una tienda de consignación en Buenos Aires. Ayudamos a personas a vender su ropa en buen estado y a compradores a encontrar productos únicos a precios accesibles.
          </p>
        </div>
      </div>

      {/* Contenido */}
      <div style={{ maxWidth: '700px', margin: '0 auto', padding: '3rem 1.5rem' }}>

        {/* Cómo funciona */}
        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.5rem', fontWeight: 700, color: '#1E1914', marginBottom: '1.5rem' }}>
            ¿Cómo funciona?
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {[
              { n: '1', title: 'Enviás tus productos', desc: 'Ingresás al catálogo online, completás los datos de tus productos y subís fotos desde tu celular.' },
              { n: '2', title: 'Nosotros los revisamos', desc: 'El equipo de MBDA Modas revisa cada producto. Si lo aprobamos, lo sumamos a nuestra vidriera física y al catálogo online.' },
              { n: '3', title: 'Se vende y te avisamos', desc: 'Cuando alguien compra tu producto, te notificamos por WhatsApp con el monto que te corresponde. Pasás a buscar tu dinero.' },
            ].map(step => (
              <div key={step.n} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#1E1914', color: '#E8E3D5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: 700, flexShrink: 0 }}>
                  {step.n}
                </div>
                <div>
                  <p style={{ fontWeight: 600, color: '#1E1914', marginBottom: '0.25rem' }}>{step.title}</p>
                  <p style={{ fontSize: '0.9rem', color: '#6b7280', lineHeight: 1.6 }}>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Para compradores */}
        <section style={{ background: '#E8E3D5', borderRadius: '1.5rem', padding: '2rem', marginBottom: '2rem' }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.25rem', fontWeight: 700, color: '#1E1914', marginBottom: '0.75rem' }}>
            Para compradores
          </h2>
          <p style={{ color: '#4b5563', lineHeight: 1.7, marginBottom: '1.25rem' }}>
            Cada producto en nuestro catálogo fue revisado y seleccionado por nuestro equipo. Encontrás ropa de calidad a precios que no vas a ver en ninguna tienda nueva. Y si te interesa algo, consultás directo por WhatsApp.
          </p>
          <Link
            to="/"
            style={{ display: 'inline-block', background: '#1E1914', color: '#E8E3D5', padding: '0.75rem 1.5rem', borderRadius: '0.875rem', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem' }}
          >
            Ver catálogo
          </Link>
        </section>

        {/* Para vendedores */}
        <section style={{ background: '#1E1914', borderRadius: '1.5rem', padding: '2rem', marginBottom: '3rem' }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.25rem', fontWeight: 700, color: '#E8E3D5', marginBottom: '0.75rem' }}>
            Para vendedores
          </h2>
          <p style={{ color: 'rgba(232,227,213,0.8)', lineHeight: 1.7, marginBottom: '1.25rem' }}>
            Sin capital inicial, sin esfuerzo. Vos traés la ropa, nosotros la vendemos. Al concretarse la venta te transferimos tu parte descontando la comisión acordada. Sin sorpresas.
          </p>
          <Link
            to="/register"
            style={{ display: 'inline-block', background: '#E8E3D5', color: '#1E1914', padding: '0.75rem 1.5rem', borderRadius: '0.875rem', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem' }}
          >
            Empezar a vender
          </Link>
        </section>

        {/* Contacto */}
        <section style={{ borderTop: '1px solid #E8E3D5', paddingTop: '2rem', textAlign: 'center' }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.25rem', fontWeight: 700, color: '#1E1914', marginBottom: '0.5rem' }}>
            ¿Tenés preguntas?
          </h2>
          <p style={{ color: '#6b7280', marginBottom: '1rem' }}>Escribinos por WhatsApp o por email.</p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a
              href="mailto:contacto@mbdamodas.com"
              style={{ color: '#1E1914', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem', border: '1px solid #E8E3D5', padding: '0.625rem 1.25rem', borderRadius: '0.75rem' }}
            >
              contacto@mbdamodas.com
            </a>
          </div>
        </section>

        {/* Desarrollador */}
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
              ¿Querés una app como esta para tu negocio?
            </h3>
            <p style={{ color: 'rgba(232,227,213,0.7)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '0.25rem' }}>
              Esta plataforma fue desarrollada por
            </p>
            <p style={{ color: '#E8E3D5', fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.125rem' }}>
              Nahuel Martinez
            </p>
            <p style={{ color: 'rgba(232,227,213,0.6)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
              Ingeniero en Sistemas · Tucumán, Argentina
            </p>
            <a
              href="https://wa.me/543865468239?text=Hola%20Nahuel!%20Vi%20tu%20trabajo%20en%20MBDA%20Modas%20y%20me%20interesa%20un%20proyecto%20similar."
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: '#25D366',
                color: '#fff',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.875rem',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '0.9rem',
                transition: 'opacity 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.9')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
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
