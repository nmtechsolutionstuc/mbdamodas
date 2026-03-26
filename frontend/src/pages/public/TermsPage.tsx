export function TermsPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#FAF8F3', padding: '2rem 1.5rem' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '2rem', fontWeight: 700, color: '#1E1914', marginBottom: '0.5rem' }}>
          Términos y Condiciones
        </h1>
        <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '2.5rem' }}>
          Contrato de consignación mercantil — MBDA Modas, Buenos Aires, Argentina.
          Última actualización: marzo 2025.
        </p>

        {[
          {
            title: 'Art. 1 — Objeto',
            body: 'El presente contrato regula la relación de consignación entre MBDA Modas (en adelante "la Tienda") y el usuario vendedor (en adelante "el Consignante") para la comercialización de prendas de vestir y accesorios de segunda mano a través de la plataforma digital y el local físico de la Tienda.',
          },
          {
            title: 'Art. 2 — Consignación mercantil',
            body: 'Las prendas entregadas en consignación continúan siendo propiedad del Consignante hasta el momento de su venta efectiva. La Tienda actúa como intermediaria y no adquiere propiedad sobre las prendas consignadas.',
          },
          {
            title: 'Art. 3 — Comisión',
            body: 'La Tienda retendrá el porcentaje de comisión vigente al momento de la aprobación de la prenda, informado en la notificación de aprobación. El monto neto correspondiente al Consignante será liquidado una vez verificada la venta. La comisión puede variar según lo determine la Tienda, siendo notificado al Consignante antes de la entrega física de la prenda.',
          },
          {
            title: 'Art. 4 — Proceso de admisión',
            body: 'El Consignante enviará solicitudes a través de la plataforma digital. La Tienda se reserva el derecho de aceptar o rechazar prendas sin obligación de fundamentar su decisión más allá de la notificación al Consignante. Solo las prendas aprobadas serán incluidas en el catálogo y expuestas en el local.',
          },
          {
            title: 'Art. 5 — Estado de las prendas',
            body: 'El Consignante garantiza que las prendas son de su legítima propiedad, se encuentran en las condiciones declaradas en el formulario de envío y no tienen cargas, gravámenes ni restricciones legales. La Tienda podrá rechazar físicamente prendas que no coincidan con la descripción digital.',
          },
          {
            title: 'Art. 6 — Precio de venta',
            body: 'El precio de venta será el declarado por el Consignante como precio deseado. La Tienda podrá, con consentimiento del Consignante expresado mediante el precio mínimo declarado, realizar descuentos o promociones dentro de ese rango. Modificaciones fuera de ese rango requerirán consulta previa.',
          },
          {
            title: 'Art. 7 — Plazo y devolución',
            body: 'Las prendas permanecerán en consignación por tiempo indeterminado. El Consignante podrá solicitar la devolución de sus prendas en cualquier momento, siempre que no hayan sido vendidas. La Tienda notificará la disponibilidad de retiro vía WhatsApp.',
          },
          {
            title: 'Art. 8 — Responsabilidad',
            body: 'La Tienda tomará los recaudos razonables para la custodia de las prendas, pero no responde por caso fortuito, fuerza mayor, robo con violencia o siniestros. Se recomienda al Consignante no consignar prendas de valor sentimental irremplazable.',
          },
          {
            title: 'Art. 9 — Notificaciones',
            body: 'Todas las notificaciones relacionadas con el estado de las prendas se realizarán a través de la plataforma y/o WhatsApp al número registrado por el Consignante en su perfil. Es responsabilidad del Consignante mantener su número actualizado.',
          },
          {
            title: 'Art. 10 — Protección de datos',
            body: 'Los datos personales del Consignante son tratados conforme a la Ley 25.326 de Protección de Datos Personales de la República Argentina. La información es utilizada exclusivamente para la gestión del servicio de consignación y no es compartida con terceros.',
          },
          {
            title: 'Art. 11 — Aceptación y jurisdicción',
            body: 'El tildado del casillero de aceptación en la plataforma digital, junto con el timestamp registrado en la base de datos, constituye prueba suficiente de la aceptación de estos términos. Ante cualquier controversia, las partes se someten a la jurisdicción de los tribunales ordinarios de la Ciudad Autónoma de Buenos Aires, renunciando a cualquier otro fuero.',
          },
        ].map(({ title, body }) => (
          <div key={title} style={{ marginBottom: '1.75rem' }}>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.1rem', fontWeight: 700, color: '#1E1914', marginBottom: '0.5rem' }}>
              {title}
            </h2>
            <p style={{ color: '#4b5563', lineHeight: 1.7, fontSize: '0.95rem' }}>{body}</p>
          </div>
        ))}

        <div style={{ marginTop: '3rem', padding: '1.25rem', background: '#E8E3D5', borderRadius: '1rem', fontSize: '0.875rem', color: '#6b7280' }}>
          Para consultas sobre estos términos, contactanos en{' '}
          <a href="mailto:contacto@mbdamodas.com" style={{ color: '#1E1914', fontWeight: 600 }}>
            contacto@mbdamodas.com
          </a>
        </div>
      </div>
    </div>
  )
}
