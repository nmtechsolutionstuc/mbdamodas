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
            body: 'El presente contrato regula la relación de consignación entre MBDA Modas (en adelante "la Tienda") y el usuario vendedor (en adelante "el Consignante") para la comercialización de productos de vestir y accesorios de segunda mano a través de la plataforma digital y el local físico de la Tienda.',
          },
          {
            title: 'Art. 2 — Consignación mercantil',
            body: 'Los productos entregados en consignación continúan siendo propiedad del Consignante hasta el momento de su venta efectiva. La Tienda actúa como intermediaria y no adquiere propiedad sobre los productos consignados.',
          },
          {
            title: 'Art. 3 — Comisión',
            body: 'La Tienda retendrá el porcentaje de comisión vigente al momento de la aprobación del producto, informado en la notificación de aprobación. El monto neto correspondiente al Consignante será liquidado una vez verificada la venta. La comisión puede variar según lo determine la Tienda, siendo notificado al Consignante antes de la entrega física del producto.',
          },
          {
            title: 'Art. 4 — Proceso de admisión',
            body: 'El Consignante enviará solicitudes a través de la plataforma digital. La Tienda se reserva el derecho de aceptar o rechazar productos sin obligación de fundamentar su decisión más allá de la notificación al Consignante. Solo los productos aprobados serán incluidos en el catálogo y expuestos en el local.',
          },
          {
            title: 'Art. 5 — Estado de los productos',
            body: 'El Consignante garantiza que los productos son de su legítima propiedad, se encuentran en las condiciones declaradas en el formulario de envío y no tienen cargas, gravámenes ni restricciones legales. La Tienda podrá rechazar físicamente productos que no coincidan con la descripción digital.',
          },
          {
            title: 'Art. 6 — Precio de venta',
            body: 'El precio de venta será el declarado por el Consignante como precio deseado. La Tienda podrá, con consentimiento del Consignante expresado mediante el precio mínimo declarado, realizar descuentos o promociones dentro de ese rango. Modificaciones fuera de ese rango requerirán consulta previa.',
          },
          {
            title: 'Art. 7 — Plazo y devolución',
            body: 'Los productos permanecerán en consignación por tiempo indeterminado. El Consignante podrá solicitar la devolución de sus productos en cualquier momento, siempre que no hayan sido vendidos. La Tienda notificará la disponibilidad de retiro vía WhatsApp.',
          },
          {
            title: 'Art. 8 — Responsabilidad',
            body: 'La Tienda tomará los recaudos razonables para la custodia de los productos, pero no responde por caso fortuito, fuerza mayor, robo con violencia o siniestros. Se recomienda al Consignante no consignar productos de valor sentimental irremplazable.',
          },
          {
            title: 'Art. 9 — Notificaciones',
            body: 'Todas las notificaciones relacionadas con el estado de los productos se realizarán a través de la plataforma y/o WhatsApp al número registrado por el Consignante en su perfil. Es responsabilidad del Consignante mantener su número actualizado.',
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

        {/* Módulo de Reservas */}
        <div style={{ marginTop: '2.5rem', marginBottom: '1.75rem' }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.25rem', fontWeight: 700, color: '#1E1914', marginBottom: '1.25rem' }}>
            Módulo de Reservas para Promotores
          </h2>
          {[
            {
              title: '¿Qué es el sistema de reservas?',
              body: 'Los usuarios registrados pueden reservar productos propios de la tienda para venderlos a compradores y recibir una comisión por cada venta concretada. El promotor actúa como intermediario entre el comprador y la tienda.',
            },
            {
              title: 'Requisitos para reservar',
              body: 'Para utilizar el módulo de reservas, el usuario debe tener su DNI y número de WhatsApp cargados en su perfil. Estos datos son necesarios para la comunicación y verificación de identidad.',
            },
            {
              title: 'Vigencia de la reserva',
              body: 'Una vez aprobada por el equipo de MBDA Modas, la reserva tiene una vigencia de 24 horas para traer al comprador a la tienda. La vigencia puede extenderse a criterio de la tienda ante imprevistos debidamente comunicados.',
            },
            {
              title: 'Comisión del promotor',
              body: 'El porcentaje de comisión es informado al momento de realizar la reserva. La comisión se acredita únicamente si la venta se concreta en el plazo establecido. No se garantiza la disponibilidad del producto hasta que la reserva sea aprobada por el equipo.',
            },
            {
              title: 'Responsabilidad del promotor',
              body: 'El promotor es responsable de informar correctamente el precio de venta al comprador. No se garantiza disponibilidad del producto hasta la aprobación formal de la reserva. El promotor debe abstenerse de realizar promesas de venta antes de recibir la confirmación.',
            },
            {
              title: 'Cancelación',
              body: 'El promotor puede cancelar una reserva mientras esté en estado pendiente de aprobación. Una vez aprobada, solo el equipo de la tienda puede cancelarla. La cancelación reiterada sin motivo justificado puede resultar en la suspensión del acceso al módulo.',
            },
            {
              title: 'Pago al promotor',
              body: 'El pago de la comisión se realiza mediante el mismo método que aplica la tienda: efectivo (retiro en tienda) o transferencia bancaria al alias/CVU registrado en el perfil. El monto se acredita una vez verificada la venta por el equipo de MBDA Modas.',
            },
          ].map(({ title, body }) => (
            <div key={title} style={{ marginBottom: '1.25rem' }}>
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1rem', fontWeight: 700, color: '#1E1914', marginBottom: '0.5rem' }}>
                {title}
              </h3>
              <p style={{ color: '#4b5563', lineHeight: 1.7, fontSize: '0.95rem', margin: 0 }}>{body}</p>
            </div>
          ))}
        </div>

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
