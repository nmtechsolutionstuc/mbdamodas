# MBDA Modas

Plataforma de catálogo online y comunidad de venta consignada. Los vendedores envían sus prendas, el admin las revisa y las prendas aprobadas aparecen en el catálogo público. Al venderlas, la tienda retiene una comisión y notifica al vendedor por WhatsApp.

## Stack

| Capa | Tecnología |
|------|-----------|
| Frontend | React + Vite (TypeScript) + Tailwind CSS v4 |
| Backend | Node.js + Express (TypeScript) |
| Base de datos | PostgreSQL + Prisma ORM |
| Auth | Google OAuth 2.0 → JWT propio |
| Fotos | Local (dev) / Cloudinary (prod) |
| Notificaciones | Links `wa.me` (sin API de pago) |
| Deploy frontend | Netlify |
| Deploy backend | Railway |

## Quickstart

### Requisitos
- Node.js 20+
- PostgreSQL 15+
- Cuenta en Google Cloud Console (OAuth credentials)

### 1. Clonar e instalar

```bash
git clone https://github.com/tu-usuario/mbdamodas.git
cd mbdamodas
npm install --workspace=backend
npm install --workspace=frontend
```

### 2. Configurar variables de entorno

```bash
cp backend/.env.example backend/.env
# Completar DATABASE_URL, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
```

### 3. Base de datos

```bash
# Crear la DB en PostgreSQL
createdb mbdamodas

# Correr migraciones
npm run db:migrate --workspace=backend

# Seed: tienda MBDA Modas + admin inicial
# Primero actualizar el googleId en backend/prisma/seed.ts
npm run db:seed --workspace=backend
```

### 4. Levantar servidores

```bash
# Backend (puerto 3000) y Frontend (puerto 5173) en paralelo
npm run dev
```

O por separado:
```bash
npm run dev --workspace=backend   # http://localhost:3000
npm run dev --workspace=frontend  # http://localhost:5173
```

## Estructura

```
mbdamodas/
├── backend/
│   ├── prisma/          schema.prisma, migrations/, seed.ts
│   └── src/
│       ├── config/      env.ts, passport.ts, prisma.ts, multer.ts
│       ├── controllers/ auth, user, item, submission, admin, store
│       ├── middlewares/ authenticate, authorize, errorHandler
│       ├── routes/      auth, user, items, submissions, admin
│       ├── services/    auth, item, submission, admin, upload, whatsapp
│       ├── utils/       jwt, apiResponse, commission
│       ├── app.ts
│       └── server.ts
└── frontend/
    └── src/
        ├── api/         axiosClient, auth, items, submissions, admin
        ├── components/  catalog/, layout/
        ├── context/     AuthContext, ToastContext
        ├── pages/       public/, auth/, user/, admin/
        ├── routes/      AppRouter, ProtectedRoute, AdminRoute
        ├── store/       authStore (Zustand)
        └── types/
```

## Documentación

- [API Reference](docs/API.md)
- [Setup local completo](docs/DEVELOPMENT.md)
- [Deploy](docs/DEPLOYMENT.md)
- [Arquitectura](docs/ARCHITECTURE.md)

## Variables de entorno requeridas

Ver [`backend/.env.example`](backend/.env.example) para la lista completa.

## Licencia

Privado — todos los derechos reservados.
