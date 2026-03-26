# Arquitectura

## Visión general

```
┌─────────────────────┐        ┌──────────────────────────┐
│  React + Vite       │ HTTPS  │  Express + TypeScript    │
│  (Netlify)          │◄──────►│  (Railway)               │
│  Port 5173 (dev)    │  REST  │  Port 3000               │
└─────────────────────┘        └──────────┬───────────────┘
                                          │ Prisma ORM
                                ┌─────────▼───────────────┐
                                │  PostgreSQL (Railway)    │
                                └─────────────────────────┘
```

En desarrollo, el frontend hace proxy de `/api/*` al backend local via `vite.config.ts`. En producción, Netlify redirige `/api/*` al backend en Railway.

---

## Autenticación JWT

### Flujo inicial

```
1. GET /api/v1/auth/google
   └─► Passport.js redirige a accounts.google.com

2. GET /api/v1/auth/google/callback  (Google redirige aquí)
   ├─ Passport verifica el perfil Google
   ├─ Upsert User en DB (googleId como clave)
   ├─ Emite access token (15 min) + refresh token (30 días)
   ├─ Guarda RefreshToken en DB (para revocación)
   ├─ Setea httpOnly cookie con refresh token
   └─ Redirige a /auth/callback#token=<access_token>

3. GoogleCallbackPage.tsx extrae token del hash
   ├─ Llama GET /auth/me para obtener perfil
   └─ Guarda { user, accessToken } en Zustand (memoria RAM)
```

### Renovación silenciosa

Al recargar la página, el access token en Zustand se pierde. `AuthContext` intenta renovar en el mount:

```
AuthContext mount:
  └─ Si no hay accessToken en Zustand:
      └─ POST /auth/refresh  (envía cookie httpOnly automáticamente)
          ├─ Éxito: nuevo access token → guardar en Zustand
          └─ Error: usuario sin sesión → mostrar como no autenticado
```

### Rotación de tokens

Cada llamada a `/auth/refresh` revoca el token anterior y emite uno nuevo. Si el mismo refresh token se usa dos veces (posible robo), ambos son revocados.

### Estructura del token

```
Access token (JWT, 15 min):
  { sub: userId, email, role, iat, exp }

Refresh token (JWT, 30 días):
  { sub: userId, jti: refreshTokenId, iat, exp }
  jti permite localizar el registro en DB para revocarlo
```

---

## Separación Submission / Item

El diseño mantiene dos entidades separadas intencionalmente:

```
SubmissionItem                    Item
(registro del vendedor)           (catálogo público)
──────────────────────            ────────────────────
id                                id
title                             title          ← copiado al aprobar
description                       description    ← copiado al aprobar
desiredPrice                      price          ← copiado al aprobar
condition                         condition      ← copiado al aprobar
status (PENDING→...→SOLD)         commission     ← de Store.defaultCommission
adminComment?                     isActive
photos[]                          soldAt?
                                  returnedAt?
                    1:1           photos[]       ← copiadas al aprobar
submissionItem ────────────────► item
```

**Por qué dos entidades:**
- El `SubmissionItem` es el audit trail del vendedor: precio original, historial de estados, comentarios del admin.
- El `Item` puede ser editado por el admin (precio, descripción) sin alterar el registro del vendedor.
- El admin puede ajustar la comisión por item sin cambiar la comisión global de la tienda.

---

## Ciclo de vida de una prenda

```
Vendedor envía solicitud
        │
        ▼
  PENDING ──► (admin rechaza) ──► REJECTED
        │
        ▼ (admin aprueba)
  APPROVED ──► Item creado en catálogo
        │
        ▼ (admin marca en tienda)
  IN_STORE ──────────────────────► RETURNED
        │                          (Item.returnedAt, isActive=false)
        ▼ (admin marca vendida)
    SOLD
  (Item.soldAt, isActive=false)
  Cálculo comisión visible para admin
```

Cada transición devuelve un `whatsappLink` para notificar al vendedor.

---

## Comisión

```typescript
// backend/src/utils/commission.ts
salePrice        = Item.price
commissionAmount = salePrice × (commission / 100)   // redondeo 2 decimales
sellerAmount     = salePrice - commissionAmount

// Ejemplo: $5.000 al 30%
commissionAmount = $1.500  → para la tienda
sellerAmount     = $3.500  → para el vendedor
```

La comisión se copia de `Store.defaultCommission` en el momento de la aprobación. Cambios futuros al porcentaje de la tienda no afectan ítems ya aprobados.

---

## Subida de fotos

```
STORAGE_PROVIDER=local     → multer diskStorage → /public/uploads/
STORAGE_PROVIDER=cloudinary → multer memoryStorage → Cloudinary SDK
```

Ambas opciones devuelven una URL pública. El frontend solo guarda URLs.

Al aprobar una prenda, las fotos del `SubmissionItem` son **copiadas** al `Item` (nuevos registros `ItemPhoto` con las mismas URLs). No se duplican archivos físicos.

---

## WhatsApp links

Dos flujos independientes:

### 1. Comprador interesado (frontend puro)

`ItemCard` y `ItemDetailPage` generan el link en el cliente:
```
https://wa.me/{store.phone}?text=Hola MBDA Modas! Me interesa...
```
No requiere endpoint ni autenticación.

### 2. Admin notifica al vendedor (backend)

Cada endpoint de cambio de estado devuelve:
```json
{ "whatsappLink": "https://wa.me/{seller.phone}?text=..." }
```
El admin hace clic → se abre WhatsApp con mensaje pre-escrito → lo envía manualmente.

---

## Multi-tienda

Todo pertenece a una `Store`. La arquitectura soporta múltiples tiendas sin cambios estructurales:
- `User.storeId` asigna admins a tiendas
- `Item.storeId` y `Submission.storeId` permiten filtrado por tienda
- Para activar UI multi-tienda: agregar selector de tienda en AdminDashboard

Actualmente arranca con una sola tienda ("MBDA Modas") creada en el seed.

---

## Seguridad del backend

- **Helmet**: headers HTTP de seguridad
- **CORS**: solo acepta requests desde `FRONTEND_URL`
- **Rate limiting**: 200 requests / 15 min por IP
- **JWT stateless**: no hay sesiones de servidor
- **Refresh token en httpOnly cookie**: no accesible desde JavaScript
- **Revocación de tokens**: tabla `RefreshToken` en DB con flag `revoked`
- **Zod**: validación estricta de todos los inputs
- **Multer**: límite de 8MB por archivo, solo JPEG/PNG/WebP
