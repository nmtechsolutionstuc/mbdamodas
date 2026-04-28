import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { AuthProvider } from './context/AuthContext'
import { ErrorBoundary } from './components/layout/ErrorBoundary'
import { ToastProvider } from './context/ToastContext'
import { ProtectedRoute } from './routes/ProtectedRoute'
import { AdminRoute } from './routes/AdminRoute'
import { Navbar } from './components/layout/Navbar'
import { Footer } from './components/layout/Footer'
import { LoginPage } from './pages/auth/LoginPage'
import { RegisterPage } from './pages/auth/RegisterPage'
import { GoogleCallbackPage } from './pages/auth/GoogleCallbackPage'
import { CompletarPerfilPage } from './pages/auth/CompletarPerfilPage'
import { HomePage } from './pages/public/HomePage'
import { ItemDetailPage } from './pages/public/ItemDetailPage'
import { UserDashboardPage } from './pages/user/UserDashboardPage'
import { ProfilePage } from './pages/user/ProfilePage'
import { SubmitItemPage } from './pages/user/SubmitItemPage'
import { MySubmissionsPage } from './pages/user/MySubmissionsPage'
import { SubmissionDetailPage } from './pages/user/SubmissionDetailPage'

import { AdminDashboardPage } from './pages/admin/AdminDashboardPage'
import { AdminSubmissionsPage } from './pages/admin/AdminSubmissionsPage'
import { AdminSubmissionDetailPage } from './pages/admin/AdminSubmissionDetailPage'
import { AdminStoresPage } from './pages/admin/AdminStoresPage'
import { AdminCatalogPage } from './pages/admin/AdminCatalogPage'
import { AdminUsersPage } from './pages/admin/AdminUsersPage'
import { AdminCatalogSettingsPage } from './pages/admin/AdminCatalogSettingsPage'
import { AdminReservationsPage } from './pages/admin/AdminReservationsPage'
import { AdminMiniShopsPage } from './pages/admin/AdminMiniShopsPage'
import { AdminFeaturedPage } from './pages/admin/AdminFeaturedPage'
import { TermsPage } from './pages/public/TermsPage'
import { AboutPage } from './pages/public/AboutPage'
import { NotFoundPage } from './pages/public/NotFoundPage'
import { MyReservationsPage } from './pages/user/MyReservationsPage'
import { VoucherPage } from './pages/public/VoucherPage'
import { MiniShopsPage } from './pages/user/MiniShopsPage'
import { CreateMiniShopPage } from './pages/user/CreateMiniShopPage'
import { MiniShopPanelPage } from './pages/user/MiniShopPanelPage'
import { MiniShopProfilePage } from './pages/public/MiniShopProfilePage'
import { MiniShopProductDetailPage } from './pages/public/MiniShopProductDetailPage'
import { ShopsDirectoryPage } from './pages/public/ShopsDirectoryPage'
import { usePlatformStore, DEFAULT_MENU } from './store/platformStore'

// ── Spinner compartido ────────────────────────────────────────────────────────
function LoadingSpinner() {
  return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FAF8F3' }}>
      <div style={{ width: '36px', height: '36px', borderRadius: '50%', border: '3px solid #E8E3D5', borderTopColor: '#1E1914', animation: 'spin 0.75s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}

// ── Guard: rutas que requieren mini-tiendas activas ──────────────────────────
// Redirige a "/" si el módulo de mini-tiendas está desactivado.
// Muestra spinner hasta que llegue la respuesta del backend.
function MiniShopsRoute({ children }: { children: ReactNode }) {
  const { miniShopsEnabled, storeInfoLoaded } = usePlatformStore()
  if (!storeInfoLoaded) return <LoadingSpinner />
  if (!miniShopsEnabled) return <Navigate to="/" replace />
  return <>{children}</>
}

// ── Guard: rutas del dashboard que el admin puede ocultar ────────────────────
// Redirige a "/dashboard" si el ítem del menú está desactivado en la config.
// menuKey === 'tiendas' también verifica miniShopsEnabled.
function MenuItemRoute({ menuKey, children }: { menuKey: string; children: ReactNode }) {
  const { menuConfig, menuConfigLoaded, miniShopsEnabled, storeInfoLoaded } = usePlatformStore()
  // Esperar ambas cargas
  if (!menuConfigLoaded || !storeInfoLoaded) return <LoadingSpinner />
  // Tiendas requiere módulo activo además del permiso de menú
  if (menuKey === 'tiendas' && !miniShopsEnabled) return <Navigate to="/dashboard" replace />
  // Resolver configuración efectiva (default: activo)
  const item = { ...DEFAULT_MENU[menuKey], ...(menuConfig?.[menuKey] ?? {}) }
  if (!item.active) return <Navigate to="/dashboard" replace />
  return <>{children}</>
}

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <ToastProvider>
            <Navbar />
            <main>
            <Routes>
          {/* Públicas — sin restricción de módulo */}
          <Route path="/" element={<HomePage />} />
          <Route path="/item/:id" element={<ItemDetailPage />} />
          <Route path="/terminos-y-condiciones" element={<TermsPage />} />
          <Route path="/nosotros" element={<AboutPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/auth/callback" element={<GoogleCallbackPage />} />
          <Route path="/comprobante/:code" element={<VoucherPage />} />
          <Route path="/completar-perfil" element={<ProtectedRoute><CompletarPerfilPage /></ProtectedRoute>} />

          {/* Mini-tiendas públicas — solo si el módulo está activo */}
          <Route path="/tiendas"          element={<MiniShopsRoute><ShopsDirectoryPage /></MiniShopsRoute>} />
          <Route path="/tienda/:slug"     element={<MiniShopsRoute><MiniShopProfilePage /></MiniShopsRoute>} />
          <Route path="/producto/:slug"   element={<MiniShopsRoute><MiniShopProductDetailPage /></MiniShopsRoute>} />

          {/* Usuario autenticado — rutas básicas */}
          <Route path="/dashboard"                    element={<ProtectedRoute><UserDashboardPage /></ProtectedRoute>} />
          <Route path="/dashboard/perfil"             element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

          {/* Usuario autenticado — rutas controladas por menuConfig */}
          <Route path="/dashboard/enviar"             element={<ProtectedRoute><MenuItemRoute menuKey="enviar"><SubmitItemPage /></MenuItemRoute></ProtectedRoute>} />
          <Route path="/dashboard/mis-solicitudes"    element={<ProtectedRoute><MenuItemRoute menuKey="solicitudes"><MySubmissionsPage /></MenuItemRoute></ProtectedRoute>} />
          <Route path="/dashboard/mis-solicitudes/:id" element={<ProtectedRoute><MenuItemRoute menuKey="solicitudes"><SubmissionDetailPage /></MenuItemRoute></ProtectedRoute>} />
          <Route path="/dashboard/mis-reservas"       element={<ProtectedRoute><MenuItemRoute menuKey="reservas"><MyReservationsPage /></MenuItemRoute></ProtectedRoute>} />

          {/* Mini-tiendas usuario — requiere módulo activo + permiso de menú */}
          <Route path="/dashboard/tiendas"            element={<ProtectedRoute><MenuItemRoute menuKey="tiendas"><MiniShopsPage /></MenuItemRoute></ProtectedRoute>} />
          <Route path="/dashboard/tiendas/nueva"      element={<ProtectedRoute><MenuItemRoute menuKey="tiendas"><CreateMiniShopPage /></MenuItemRoute></ProtectedRoute>} />
          <Route path="/dashboard/tiendas/:shopId"    element={<ProtectedRoute><MenuItemRoute menuKey="tiendas"><MiniShopPanelPage /></MenuItemRoute></ProtectedRoute>} />

          {/* Admin */}
          <Route path="/admin"                        element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />
          <Route path="/admin/solicitudes"            element={<AdminRoute><AdminSubmissionsPage /></AdminRoute>} />
          <Route path="/admin/solicitudes/:id"        element={<AdminRoute><AdminSubmissionDetailPage /></AdminRoute>} />
          <Route path="/admin/catalogo"               element={<AdminRoute><AdminCatalogPage /></AdminRoute>} />
          <Route path="/admin/usuarios"               element={<AdminRoute><AdminUsersPage /></AdminRoute>} />
          <Route path="/admin/tiendas"                element={<AdminRoute><AdminStoresPage /></AdminRoute>} />
          <Route path="/admin/configuracion"          element={<AdminRoute><AdminCatalogSettingsPage /></AdminRoute>} />
          <Route path="/admin/reservas"               element={<AdminRoute><AdminReservationsPage /></AdminRoute>} />
          <Route path="/admin/mini-tiendas"           element={<AdminRoute><AdminMiniShopsPage /></AdminRoute>} />
          <Route path="/admin/destacados"             element={<AdminRoute><AdminFeaturedPage /></AdminRoute>} />

          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
            </Routes>
            </main>
            <Footer />
          </ToastProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  )
}

export default App
