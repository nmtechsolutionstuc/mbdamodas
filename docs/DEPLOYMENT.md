# Deploy

## Backend — Railway

1. Crear cuenta en [railway.app](https://railway.app)
2. New Project → Deploy from GitHub repo → seleccionar `mbdamodas`
3. Agregar servicio **PostgreSQL** al proyecto
4. En el servicio del backend, configurar:
   - **Root directory**: `backend`
   - **Build command**: `npm ci && npx prisma generate && npm run build`
   - **Start command**: `npx prisma migrate deploy && npm start`

### Variables de entorno en Railway

```
DATABASE_URL          → (auto-inyectado por Railway al agregar PostgreSQL)
JWT_ACCESS_SECRET     → string aleatorio largo
JWT_REFRESH_SECRET    → string aleatorio largo diferente
GOOGLE_CLIENT_ID      → de Google Cloud Console
GOOGLE_CLIENT_SECRET  → de Google Cloud Console
GOOGLE_CALLBACK_URL   → https://tu-backend.railway.app/api/v1/auth/google/callback
PORT                  → 3000
NODE_ENV              → production
FRONTEND_URL          → https://tu-sitio.netlify.app
STORAGE_PROVIDER      → cloudinary
CLOUDINARY_CLOUD_NAME → de Cloudinary
CLOUDINARY_API_KEY    → de Cloudinary
CLOUDINARY_API_SECRET → de Cloudinary
```

### Google OAuth en producción

En Google Cloud Console → Credenciales → tu app OAuth:
- Authorized redirect URIs: agregar `https://tu-backend.railway.app/api/v1/auth/google/callback`

## Frontend — Netlify

1. Crear cuenta en [netlify.com](https://netlify.com)
2. New site from Git → seleccionar repo
3. Configurar:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/dist`

### Variables de entorno en Netlify

No se necesitan variables de entorno en el frontend — la URL del backend se configura via el proxy en `vite.config.ts` para dev, y en producción el frontend llama a `/api/v1` relativo que Netlify redirige al backend.

Agregar en Netlify → Site settings → Build & deploy → **Redirects**:

```toml
# netlify.toml (en la raíz de /frontend)
[[redirects]]
  from = "/api/*"
  to = "https://tu-backend.railway.app/api/:splat"
  status = 200
  force = true

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

## GitHub Secrets (para CI/CD futuro)

```
RAILWAY_TOKEN     → API token de Railway
NETLIFY_AUTH_TOKEN → API token de Netlify
NETLIFY_SITE_ID   → ID del sitio en Netlify
```
