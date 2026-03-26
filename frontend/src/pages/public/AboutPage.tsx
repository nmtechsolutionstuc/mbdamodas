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
            MBDA Modas es una tienda de consignación en Buenos Aires. Ayudamos a personas a vender su ropa en buen estado y a compradores a encontrar prendas únicas a precios accesibles.
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
              { n: '1', title: 'Enviás tus prendas', desc: 'Ingresás al catálogo online, completás los datos de tus prendas y subís fotos desde tu celular.' },
              { n: '2', title: 'Nosotros las revisamos', desc: 'El equipo de MBDA Modas revisa cada prenda. Si la aprobamos, la sumamos a nuestra vidriera física y al catálogo online.' },
              { n: '3', title: 'Se vende y te avisamos', desc: 'Cuando alguien compra tu prenda, te notificamos por WhatsApp con el monto que te corresponde. Pasás a buscar tu dinero.' },
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
            Cada prenda en nuestro catálogo fue revisada y seleccionada por nuestro equipo. Encontrás ropa de calidad a precios que no vas a ver en ninguna tienda nueva. Y si te interesa algo, consultás directo por WhatsApp.
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
            to="/login"
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
      </div>
    </div>
  )
}
