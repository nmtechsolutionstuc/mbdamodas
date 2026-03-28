# API Reference

Base URL: `/api/v1`

Todas las respuestas siguen el formato:
```json
{ "success": true, "data": {...}, "meta": { "page": 1, "limit": 20, "total": 45 } }
{ "success": false, "error": { "code": "VALIDATION_ERROR", "message": "...", "details": [] } }
```

---

## Auth

### `GET /auth/google`
Inicia el flujo OAuth con Google. Redirige a `accounts.google.com`.

### `GET /auth/google/callback`
Callback de Google. Emite JWT y redirige al frontend con el access token en el hash de la URL:
```
{FRONTEND_URL}/auth/callback#token=<access_token>
```
También setea una httpOnly cookie con el refresh token.

### `POST /auth/refresh`
Renueva el access token usando el refresh token de la cookie.

**Response:**
```json
{ "success": true, "data": { "accessToken": "eyJ..." } }
```

### `POST /auth/logout`
Revoca el refresh token activo. Requiere `Authorization: Bearer <token>`.

### `GET /auth/me`
Devuelve el usuario autenticado. Requiere Bearer token.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "...", "email": "...", "firstName": "Ana", "lastName": "García",
    "phone": "+5491112345678", "role": "USER", "avatarUrl": "...", "isActive": true
  }
}
```

---

## Usuarios

### `PATCH /users/me`
Actualiza perfil del usuario autenticado.

**Body:** `{ firstName?, lastName?, phone? }`

---

## Catálogo (público)

### `GET /items`
Lista prendas activas del catálogo.

**Query params:** `category`, `size`, `search`, `storeId`, `page` (default 1), `limit` (default 20)

**Response data:** array de items con `photos[]`, `store.phone`

### `GET /items/:id`
Detalle de prenda. Incluye `store.phone` para el link de WhatsApp del comprador.

---

## Solicitudes (vendedor autenticado)

### `POST /submissions`
Crea una solicitud con N prendas. `multipart/form-data`.

**Campos:**
```
items[0][title]         string
items[0][description]   string
items[0][desiredPrice]  number
items[0][minimumPrice]  number (opcional)
items[0][size]          XS|S|M|L|XL|XXL|UNICA
items[0][category]      MUJER|HOMBRE|NINO|NINA|CALZADO|ACCESORIOS|OTRO
items[0][condition]     NUEVA_CON_ETIQUETA|NUEVA_SIN_ETIQUETA|COMO_NUEVA|BUEN_ESTADO|USO_MODERADO|USO_INTENSO
items[0][quantity]      number (default 1)
items[0][photos]        File[] (hasta 5 por prenda)
items[1][title]         ...
```

**Response:** `201 Created` con la solicitud creada.

### `GET /submissions/mine`
Lista solicitudes del usuario autenticado con sus ítems.

### `GET /submissions/mine/:id`
Detalle de una solicitud propia con todas las prendas y fotos.

### `DELETE /submissions/mine/:id`
Cancela una solicitud. Solo funciona si todas las prendas están en `PENDING`.

---

## Admin — Solicitudes

### `GET /admin/submissions`
Lista todas las solicitudes. **Query:** `page`, `storeId`.

### `GET /admin/submissions/:id`
Detalle de una solicitud con vendedor + prendas + fotos.

### `PATCH /admin/items/:itemId/approve`
Aprueba una prenda. Crea el `Item` en catálogo con `commission` copiada de `Store.defaultCommission`.

**Response:**
```json
{
  "success": true,
  "data": {
    "item": { ...catalogItem },
    "whatsappLink": "https://wa.me/...",
    "commission": { "salePrice": 5000, "commissionPercent": 30, "commissionAmount": 1500, "sellerAmount": 3500 }
  }
}
```

### `PATCH /admin/items/:itemId/reject`
Rechaza una prenda.

**Body:** `{ "adminComment": "Motivo del rechazo" }`

**Response:** incluye `whatsappLink`.

### `PATCH /admin/items/:itemId/mark-in-store`
Marca la prenda como en tienda física. Incluye `whatsappLink`.

### `PATCH /admin/items/:itemId/mark-sold`
Marca como vendida. Calcula comisión.

**Response:** incluye `commission.sellerAmount`, `commission.commissionAmount`, `whatsappLink`.

### `PATCH /admin/items/:itemId/mark-returned`
Marca como devuelta. Incluye `whatsappLink`.

---

## Admin — Catálogo

### `GET /admin/catalog`
Lista todos los items del catálogo (activos e inactivos). **Query:** `page`.

### `PATCH /admin/catalog/:id`
Edita un item del catálogo.

**Body:** `{ title?, description?, price?, commission?, isActive? }`

### `DELETE /admin/catalog/:id`
Soft-delete: setea `isActive = false`.

---

## Admin — Usuarios

### `GET /admin/users`
Lista usuarios. **Query:** `page`, `search` (nombre o email).

### `PATCH /admin/users/:id/deactivate`
Desactiva un usuario.

---

## Admin — Tiendas

### `GET /admin/stores`
Lista tiendas.

### `POST /admin/stores`
Crea una tienda.

**Body:** `{ name, address?, phone?, email?, description?, logoUrl?, defaultCommission? }`

### `PATCH /admin/stores/:id`
Actualiza una tienda.

---

## Admin — Dashboard

### `GET /admin/stats`
Devuelve conteos para el dashboard.

**Response:**
```json
{ "success": true, "data": { "pending": 12, "inStore": 8, "soldThisMonth": 3 } }
```

---

## Códigos de error

| Código | HTTP | Descripción |
|--------|------|-------------|
| `VALIDATION_ERROR` | 400 | Datos inválidos (Zod) |
| `UNAUTHORIZED` | 401 | Sin token o token inválido/expirado |
| `FORBIDDEN` | 403 | Sin permisos (rol incorrecto) |
| `NOT_FOUND` | 404 | Recurso no encontrado |
| `CONFLICT` | 409 | Conflicto (ej: email duplicado) |
| `INTERNAL_ERROR` | 500 | Error interno del servidor |
