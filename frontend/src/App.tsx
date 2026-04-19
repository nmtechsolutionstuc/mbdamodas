import { BrowserRouter, Routes, Route } from 'react-router-dom'
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

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <ToastProvider>
            <Navbar />
            <main>
            <Routes>
          {/* Públicas */}
          <Route path="/" element={<HomePage />} />
          <Route path="/item/:id" element={<ItemDetailPage />} />
          <Route path="/terminos-y-condiciones" element={<TermsPage />} />
          <Route path="/nosotros" element={<AboutPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/auth/callback" element={<GoogleCallbackPage />} />
          <Route path="/comprobante/:code" element={<VoucherPage />} />
          <Route path="/tiendas" element={<ShopsDirectoryPage />} />
          <Route path="/tienda/:slug" element={<MiniShopProfilePage />} />
          <Route path="/producto/:slug" element={<MiniShopProductDetailPage />} />
          <Route path="/completar-perfil" element={<ProtectedRoute><CompletarPerfilPage /></ProtectedRoute>} />

          {/* Usuario autenticado */}
          <Route path="/dashboard" element={<ProtectedRoute><UserDashboardPage /></ProtectedRoute>} />
          <Route path="/dashboard/perfil" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/dashboard/enviar" element={<ProtectedRoute><SubmitItemPage /></ProtectedRoute>} />
          <Route path="/dashboard/mis-solicitudes" element={<ProtectedRoute><MySubmissionsPage /></ProtectedRoute>} />
          <Route path="/dashboard/mis-solicitudes/:id" element={<ProtectedRoute><SubmissionDetailPage /></ProtectedRoute>} />
          <Route path="/dashboard/mis-reservas" element={<ProtectedRoute><MyReservationsPage /></ProtectedRoute>} />
          <Route path="/dashboard/tiendas" element={<ProtectedRoute><MiniShopsPage /></ProtectedRoute>} />
          <Route path="/dashboard/tiendas/nueva" element={<ProtectedRoute><CreateMiniShopPage /></ProtectedRoute>} />
          <Route path="/dashboard/tiendas/:shopId" element={<ProtectedRoute><MiniShopPanelPage /></ProtectedRoute>} />

          {/* Admin */}
          <Route path="/admin" element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />
          <Route path="/admin/solicitudes" element={<AdminRoute><AdminSubmissionsPage /></AdminRoute>} />
          <Route path="/admin/solicitudes/:id" element={<AdminRoute><AdminSubmissionDetailPage /></AdminRoute>} />
          <Route path="/admin/catalogo" element={<AdminRoute><AdminCatalogPage /></AdminRoute>} />
          <Route path="/admin/usuarios" element={<AdminRoute><AdminUsersPage /></AdminRoute>} />
          <Route path="/admin/tiendas" element={<AdminRoute><AdminStoresPage /></AdminRoute>} />
          <Route path="/admin/configuracion" element={<AdminRoute><AdminCatalogSettingsPage /></AdminRoute>} />
          <Route path="/admin/reservas" element={<AdminRoute><AdminReservationsPage /></AdminRoute>} />
          <Route path="/admin/mini-tiendas" element={<AdminRoute><AdminMiniShopsPage /></AdminRoute>} />
          <Route path="/admin/destacados" element={<AdminRoute><AdminFeaturedPage /></AdminRoute>} />

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
