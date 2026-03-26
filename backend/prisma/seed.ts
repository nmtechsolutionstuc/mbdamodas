import { PrismaClient, Role } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed...')

  // ── Tienda principal ──────────────────────────────────────────────────────
  const store = await prisma.store.upsert({
    where: { id: 'store-mbda-modas' },
    update: {},
    create: {
      id: 'store-mbda-modas',
      name: 'MBDA Modas',
      address: 'Buenos Aires, Argentina',
      phone: '', // Completar con el número de WhatsApp real de la tienda
      email: 'contacto@mbdamodas.com',
      description:
        'Tienda de ropa consignada. Vendé tu ropa sin esfuerzo y encontrá prendas únicas a precios accesibles.',
      defaultCommission: 30,
      isActive: true,
    },
  })

  console.log(`✅ Tienda creada: ${store.name} (id: ${store.id})`)

  // ── Usuario admin ─────────────────────────────────────────────────────────
  // IMPORTANTE: reemplazá el googleId con el Google ID real del administrador.
  // Podés obtenerlo iniciando sesión y consultando la DB, o mediante
  // la consola de Google Cloud.
  const admin = await prisma.user.upsert({
    where: { googleId: 'REPLACE_WITH_REAL_GOOGLE_ID' },
    update: {},
    create: {
      googleId: 'REPLACE_WITH_REAL_GOOGLE_ID',
      email: 'admin@mbdamodas.com',
      firstName: 'Admin',
      lastName: 'MBDA Modas',
      role: Role.ADMIN,
      storeId: store.id,
      isActive: true,
    },
  })

  console.log(`✅ Admin creado: ${admin.firstName} ${admin.lastName} (${admin.email})`)
  console.log('')
  console.log('⚠️  RECORDATORIO: actualizá el googleId del admin en prisma/seed.ts')
  console.log('   con el ID real de tu cuenta de Google antes de hacer seed en producción.')
}

main()
  .catch(e => {
    console.error('❌ Error en seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
