import { PrismaClient, Role } from '@prisma/client'
import bcrypt from 'bcryptjs'

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
      phone: '5491112345678',
      email: 'contacto@mbdamodas.com',
      description:
        'Tienda de ropa consignada. Vendé tu ropa sin esfuerzo y encontrá prendas únicas a precios accesibles.',
      defaultCommission: 30,
      isActive: true,
    },
  })

  console.log(`✅ Tienda creada: ${store.name} (id: ${store.id})`)

  // ── Tipos de producto ───────────────────────────────────────────────────
  const ropa = await prisma.productType.upsert({
    where: { code: 'ROPA' },
    update: {},
    create: {
      name: 'Ropa',
      code: 'ROPA',
      requiresSize: true,
      order: 0,
    },
  })

  const calzado = await prisma.productType.upsert({
    where: { code: 'CALZADO' },
    update: {},
    create: {
      name: 'Calzado',
      code: 'CALZADO',
      requiresSize: true,
      order: 1,
    },
  })

  const otro = await prisma.productType.upsert({
    where: { code: 'OTRO' },
    update: {},
    create: {
      name: 'Otro',
      code: 'OTRO',
      requiresSize: false,
      order: 2,
    },
  })

  console.log(`✅ Tipos de producto creados: ${ropa.name}, ${calzado.name}, ${otro.name}`)

  // ── Talles para Ropa ────────────────────────────────────────────────────
  const ropaSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Talle Único']
  for (let i = 0; i < ropaSizes.length; i++) {
    await prisma.size.upsert({
      where: { productTypeId_name: { productTypeId: ropa.id, name: ropaSizes[i] } },
      update: {},
      create: {
        name: ropaSizes[i],
        order: i,
        productTypeId: ropa.id,
      },
    })
  }

  console.log(`✅ Talles de Ropa creados: ${ropaSizes.join(', ')}`)

  // ── Talles para Calzado ─────────────────────────────────────────────────
  const calzadoSizes = ['34', '35', '36', '37', '38', '39', '40', '41', '42', '43', '44']
  for (let i = 0; i < calzadoSizes.length; i++) {
    await prisma.size.upsert({
      where: { productTypeId_name: { productTypeId: calzado.id, name: calzadoSizes[i] } },
      update: {},
      create: {
        name: calzadoSizes[i],
        order: i,
        productTypeId: calzado.id,
      },
    })
  }

  console.log(`✅ Talles de Calzado creados: ${calzadoSizes.join(', ')}`)

  // ── Tags para Ropa ──────────────────────────────────────────────────────
  const ropaTags = ['Casual', 'Formal', 'Deportivo', 'Urbano']
  for (let i = 0; i < ropaTags.length; i++) {
    await prisma.tag.upsert({
      where: { productTypeId_name: { productTypeId: ropa.id, name: ropaTags[i] } },
      update: {},
      create: {
        name: ropaTags[i],
        order: i,
        productTypeId: ropa.id,
      },
    })
  }

  console.log(`✅ Tags de Ropa creados: ${ropaTags.join(', ')}`)

  // ── Tags para Calzado ───────────────────────────────────────────────────
  const calzadoTags = ['Deportivo', 'Casual', 'Formal']
  for (let i = 0; i < calzadoTags.length; i++) {
    await prisma.tag.upsert({
      where: { productTypeId_name: { productTypeId: calzado.id, name: calzadoTags[i] } },
      update: {},
      create: {
        name: calzadoTags[i],
        order: i,
        productTypeId: calzado.id,
      },
    })
  }

  console.log(`✅ Tags de Calzado creados: ${calzadoTags.join(', ')}`)

  // ── Tags para Otro ──────────────────────────────────────────────────────
  const otroTags = ['Deportes', 'Accesorios', 'Hogar', 'Tecnología']
  for (let i = 0; i < otroTags.length; i++) {
    await prisma.tag.upsert({
      where: { productTypeId_name: { productTypeId: otro.id, name: otroTags[i] } },
      update: {},
      create: {
        name: otroTags[i],
        order: i,
        productTypeId: otro.id,
      },
    })
  }

  console.log(`✅ Tags de Otro creados: ${otroTags.join(', ')}`)

  // ── Usuario admin ─────────────────────────────────────────────────────────
  const adminPassword = await bcrypt.hash('admin1234', 12)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@mbdamodas.com' },
    update: {},
    create: {
      email: 'admin@mbdamodas.com',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'MBDA Modas',
      phone: '5491112345678',
      role: Role.ADMIN,
      storeId: store.id,
      isActive: true,
    },
  })

  console.log(`✅ Admin creado: ${admin.firstName} ${admin.lastName} (${admin.email})`)

  // ── Usuario vendedor de prueba ─────────────────────────────────────────────
  const sellerPassword = await bcrypt.hash('vendedor1234', 12)

  const seller = await prisma.user.upsert({
    where: { email: 'vendedor@test.com' },
    update: {},
    create: {
      email: 'vendedor@test.com',
      password: sellerPassword,
      firstName: 'María',
      lastName: 'García',
      phone: '5491198765432',
      role: Role.USER,
      isActive: true,
    },
  })

  console.log(`✅ Vendedor de prueba: ${seller.firstName} ${seller.lastName} (${seller.email})`)

  console.log('')
  console.log('📋 Credenciales de prueba:')
  console.log('   Admin:    admin@mbdamodas.com / admin1234')
  console.log('   Vendedor: vendedor@test.com / vendedor1234')
}

main()
  .catch(e => {
    console.error('❌ Error en seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
