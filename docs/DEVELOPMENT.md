# Setup local

## Prerrequisitos

- Node.js 20+
- PostgreSQL 15+ corriendo localmente
- Cuenta de Google Cloud Console

## Google OAuth credentials

1. Ir a [console.cloud.google.com](https://console.cloud.google.com)
2. Crear proyecto → **APIs y servicios** → **Credenciales**
3. Crear **ID de cliente OAuth 2.0** (tipo: Aplicación web)
4. Authorized redirect URIs: `http://localhost:3000/api/v1/auth/google/callback`
5. Copiar **Client ID** y **Client Secret** al `.env`

## Variables de entorno

```bash
cp backend/.env.example backend/.env
```

Completar:
- `DATABASE_URL` — URL de PostgreSQL local
- `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` — cualquier string largo aleatorio
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — de Google Cloud Console

## Base de datos

```bash
# Crear la base
createdb mbdamodas

# Primera migración
cd backend && npx prisma migrate dev --name init

# Ver el esquema en el browser
npx prisma studio
```

## Seed (datos iniciales)

Antes de correr el seed, obtené tu Google ID:
1. Iniciá sesión con Google en la app
2. En Prisma Studio (`npx prisma studio`) buscá tu usuario recién creado
3. Copiá el `googleId`
4. Pegalo en `backend/prisma/seed.ts` reemplazando `REPLACE_WITH_REAL_GOOGLE_ID`
5. Completá también el `phone` de la tienda con el número de WhatsApp real

```bash
cd backend && npm run db:seed
```

## Dev servers

```bash
# Desde la raíz del monorepo
npm run dev
```

- Backend: http://localhost:3000
- Frontend: http://localhost:5173
- Health check: http://localhost:3000/health

## Convenciones de commits

```
feat(scope): descripción
fix(scope): descripción
chore(scope): descripción
```

Ejemplos:
```
feat(auth): add Google OAuth callback
fix(items): correct price decimal handling
chore(deps): update prisma to 5.22
```
