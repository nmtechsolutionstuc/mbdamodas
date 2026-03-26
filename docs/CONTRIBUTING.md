# Contribuir

## Flujo de trabajo

Usamos **GitHub Flow** con rama `develop` como integración:

```
main      ← Producción. Protegida. Auto-deploy.
develop   ← Integración. Merges desde feature branches.
feature/* ← Una rama por feature.
fix/*     ← Bug fixes.
chore/*   ← Config, deps, docs.
```

### Pasos para contribuir

1. Crear una rama desde `develop`:
   ```bash
   git checkout develop && git pull
   git checkout -b feature/nombre-descriptivo
   ```

2. Hacer commits con el formato de Conventional Commits (ver abajo)

3. Abrir un PR hacia `develop` usando el template de PR

4. Asegurarse de que el CI pase (lint + build + tests)

5. Solicitar review

---

## Conventional Commits

Formato: `type(scope): descripción en minúsculas`

| Type | Cuándo usar |
|------|------------|
| `feat` | Nueva funcionalidad |
| `fix` | Corrección de bug |
| `chore` | Config, deps, docs, CI |
| `refactor` | Refactor sin cambio de comportamiento |
| `test` | Agregar o modificar tests |
| `style` | Cambios de estilo/formato sin lógica |

**Ejemplos:**
```
feat(auth): implement Google OAuth callback
feat(submissions): add multi-item form with photo upload
fix(commission): correct rounding for prices over 10000
chore(deps): update prisma to 5.22
test(auth): add integration test for token refresh
```

### Reglas
- Descripción en español o inglés, consistente con el contexto
- Mensaje en presente ("add", "fix", "update" — no "added", "fixed")
- Máximo 72 caracteres en la línea del subject
- Body opcional para explicar el "por qué" si no es obvio

---

## Naming de ramas

```
feature/google-oauth
feature/submission-form
fix/commission-rounding
chore/update-prisma
chore/add-tests-auth
```

---

## Pull Request checklist

Antes de pedir review, verificar:

- [ ] El código compila (`npm run build` en el workspace correspondiente)
- [ ] Los tests pasan (`npm test` en backend)
- [ ] Los cambios fueron probados localmente (flujo manual completo si aplica)
- [ ] No se commitaron archivos `.env`, secrets ni binarios grandes
- [ ] Los endpoints nuevos están documentados en `docs/API.md`
- [ ] Los cambios de schema están en una nueva migración Prisma

---

## Code style

- **TypeScript strict** habilitado en ambos proyectos
- **ESLint** configurado — correr `npm run lint` antes de commitear
- **Prettier** para formato — usar el `.prettierrc` de la raíz
- Sin `any` implícito — usar tipos explícitos o `unknown`
- Funciones asíncronas siempre con manejo de errores
- Sin `console.log` en código de producción

---

## Estructura de archivos

- Un componente por archivo
- Nombre del archivo = nombre del componente (PascalCase para componentes, camelCase para utils)
- Los tipos van en `frontend/src/types/index.ts` o inline si son locales al componente
- Los endpoints nuevos van en `backend/src/routes/` y se registran en `routes/index.ts`

---

## Reporte de bugs

Abrir un issue en GitHub con:
- Descripción del comportamiento esperado vs. el actual
- Pasos para reproducir
- Entorno (SO, versión de Node, browser)
- Screenshots o logs si aplica
