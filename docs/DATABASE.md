# Base de datos

## Motor

PostgreSQL 15+ con Prisma ORM como query builder y migration tool.

---

## Diagrama de entidades (ASCII)

```
Store
  │
  ├── users[] (admins asignados a la tienda)
  ├── submissions[] ──► Submission
  │                        │
  │                        └── items[] ──► SubmissionItem ──► Item
  │                                            │                 │
  │                                            └── photos[]      └── photos[]
  │                                            (SubmissionItemPhoto) (ItemPhoto)
  │
  └── items[] (todos los Items aprobados de la tienda)

User ──► submissions[] ──► Submission
User ──► refreshTokens[] ──► RefreshToken
```

---

## Modelos

### Store

Entidad raíz. Todo el contenido pertenece a una tienda. Soporta multi-tienda sin cambios de estructura.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | String (cuid) | PK |
| name | String | Nombre de la tienda |
| address | String? | Dirección física |
| phone | String? | Teléfono para links WhatsApp (compradores) |
| email | String? | Email de contacto |
| description | String? | Descripción pública |
| logoUrl | String? | URL del logo |
| defaultCommission | Decimal(5,2) | % de comisión por defecto (ej: 30.00) |
| isActive | Boolean | Si la tienda está activa |

### User

Autenticación exclusivamente por Google OAuth. No hay password.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | String (cuid) | PK |
| googleId | String (unique) | ID de Google |
| email | String (unique) | Email de Google |
| firstName | String | Nombre |
| lastName | String | Apellido |
| phone | String? | Teléfono (para WhatsApp del vendedor) |
| avatarUrl | String? | Foto de Google |
| role | Role | `USER` o `ADMIN` |
| isActive | Boolean | Si el usuario está activo |
| termsAcceptedAt | DateTime? | Timestamp de aceptación de T&C |
| storeId | String? | Tienda asignada (solo admins) |

### RefreshToken

Permite revocar sesiones. Un usuario puede tener múltiples tokens activos (múltiples dispositivos).

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | String (cuid) | PK — también es el `jti` del JWT |
| token | String (unique) | El JWT refresh token completo |
| expiresAt | DateTime | Cuándo expira |
| revoked | Boolean | Si fue revocado |
| userId | String | FK → User |

### Submission

Solicitud grupal de un vendedor. Agrupa N prendas enviadas juntas.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | String (cuid) | PK |
| sellerId | String | FK → User |
| storeId | String | FK → Store |
| adminNote | String? | Nota general del admin (opcional) |
| createdAt | DateTime | Fecha de creación |
| updatedAt | DateTime | Última actualización |

> El estado de la solicitud se deriva de sus ítems. Si todos tienen estado final → solicitud completa. No se almacena status en Submission para evitar inconsistencias.

### SubmissionItem

Prenda individual dentro de una solicitud. Registro del vendedor — no se modifica después de la aprobación.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | String (cuid) | PK |
| submissionId | String | FK → Submission |
| title | String | Nombre de la prenda |
| description | String? | Descripción adicional |
| condition | ItemCondition | Condición física |
| quantity | Int (default 1) | Cantidad de unidades |
| desiredPrice | Decimal(10,2) | Precio deseado por el vendedor |
| minimumPrice | Decimal(10,2)? | Precio mínimo (solo visible para el admin) |
| size | ItemSize | Talle |
| category | ItemCategory | Categoría |
| status | SubmissionItemStatus | Estado actual de la prenda |
| adminComment | String? | Comentario/motivo del admin |
| reviewedAt | DateTime? | Cuándo fue revisada |

### SubmissionItemPhoto

Fotos de una prenda en solicitud (antes de la aprobación).

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | String (cuid) | PK |
| url | String | URL del archivo |
| order | Int | Orden para mostrar (0 = portada) |
| submissionItemId | String | FK → SubmissionItem |

### Item

Prenda aprobada, visible en el catálogo público. Creada en el momento de la aprobación, independiente del SubmissionItem.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | String (cuid) | PK |
| submissionItemId | String (unique) | FK → SubmissionItem (1:1) |
| title | String | Título (editable por admin) |
| description | String? | Descripción (editable por admin) |
| condition | ItemCondition | Copiada del SubmissionItem |
| price | Decimal(10,2) | Precio de venta (editable por admin) |
| minimumPrice | Decimal(10,2)? | Precio mínimo (copiado, solo visible para admin) |
| quantity | Int | Cantidad disponible |
| commission | Decimal(5,2) | % comisión copiado de Store.defaultCommission al aprobar |
| size | ItemSize | Talle |
| category | ItemCategory | Categoría |
| isActive | Boolean | Visible en catálogo o no |
| soldAt | DateTime? | Fecha de venta |
| returnedAt | DateTime? | Fecha de devolución |
| storeId | String | FK → Store |

### ItemPhoto

Fotos del ítem en catálogo. Copiadas desde SubmissionItemPhoto en el momento de la aprobación. Las URLs son las mismas — no se duplican archivos físicos.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | String (cuid) | PK |
| url | String | URL del archivo |
| order | Int | Orden (0 = portada) |
| itemId | String | FK → Item |

---

## Enums

### Role
```
USER   — Vendedor / comprador
ADMIN  — Administrador de tienda
```

### SubmissionItemStatus
```
PENDING   — En revisión por el admin
APPROVED  — Aprobada, esperando entrega física
REJECTED  — Rechazada por el admin
IN_STORE  — En vidriera física y catálogo
SOLD      — Vendida
RETURNED  — Devuelta al vendedor
```

### ItemSize
```
XS | S | M | L | XL | XXL | UNICA
```

### ItemCategory
```
MUJER | HOMBRE | NINO | NINA | CALZADO | ACCESORIOS | OTRO
```

### ItemCondition
```
NUEVA_CON_ETIQUETA  — Nueva, con etiqueta original
NUEVA_SIN_ETIQUETA  — Nueva, sin etiqueta
COMO_NUEVA          — Usada 1-2 veces
BUEN_ESTADO         — Signos mínimos de uso
USO_MODERADO        — Desgaste visible pero aceptable
USO_INTENSO         — Desgaste notable
```

---

## Lifecycle: SubmissionItem → Item

```
1. Vendedor envía solicitud (POST /submissions)
   → Se crean SubmissionItem(s) con status=PENDING
   → Se guardan SubmissionItemPhoto(s)

2. Admin aprueba (PATCH /admin/items/:id/approve)
   → SubmissionItem.status = APPROVED
   → Se crea Item con:
       title, description, condition, price=desiredPrice, minimumPrice,
       quantity, size, category copiados del SubmissionItem
       commission = Store.defaultCommission (snapshot en el momento)
       isActive = true
   → Se copian SubmissionItemPhoto → ItemPhoto (mismas URLs)

3. Admin marca en tienda (PATCH /admin/items/:id/mark-in-store)
   → SubmissionItem.status = IN_STORE
   → Item.isActive permanece true (visible en catálogo)

4a. Admin marca vendida (PATCH /admin/items/:id/mark-sold)
   → SubmissionItem.status = SOLD
   → Item.soldAt = now()
   → Item.isActive = false (desaparece del catálogo)

4b. Admin marca devuelta (PATCH /admin/items/:id/mark-returned)
   → SubmissionItem.status = RETURNED
   → Item.returnedAt = now()
   → Item.isActive = false
```

---

## Decisiones de diseño

### ¿Por qué SubmissionItem e Item son entidades separadas?

- `SubmissionItem` = registro inmutable del vendedor (precio original, historial de estados)
- `Item` = registro editable del admin (precio puede cambiar, comisión puede ajustarse)
- Si el admin modifica el precio del ítem en catálogo, el `desiredPrice` del vendedor queda intacto
- Permite auditar cambios sin contaminar el registro del vendedor

### ¿Por qué commission se copia al aprobar?

`Item.commission` es un snapshot de `Store.defaultCommission` en el momento de la aprobación. Si la tienda cambia su comisión después, los ítems ya aprobados mantienen la comisión pactada originalmente con el vendedor.

### ¿Por qué termsAcceptedAt está en User?

Se registra en el primer `POST /submissions`. Sirve como evidencia legal con timestamp de la aceptación de los Términos y Condiciones ante cualquier disputa.

### ¿Por qué el estado no está en Submission?

El estado de la solicitud es derivado: "completada" cuando todos sus ítems tienen estado final. Guardarlo en Submission crearía un estado duplicado propenso a inconsistencias.

---

## Comandos útiles

```bash
# Aplicar migraciones en dev
npx prisma migrate dev --name <nombre>

# Ver/editar datos en browser
npx prisma studio

# Generar el cliente después de cambiar schema.prisma
npx prisma generate

# Seed inicial (tienda + admin)
npm run db:seed --workspace=backend

# Reset completo de DB (dev only)
npx prisma migrate reset
```
