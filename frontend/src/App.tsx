import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute } from './routes/ProtectedRoute'
import { AdminRoute } from './routes/AdminRoute'
import { Navbar } from './components/layout/Navbar'
import { Footer } from './components/layout/Footer'
import { LoginPage } from './pages/auth/LoginPage'
import { GoogleCallbackPage } from './pages/auth/GoogleCallbackPage'
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
import { TermsPage } from './pages/public/TermsPage'
import { AboutPage } from './pages/public/AboutPage'
import { NotFoundPage } from './pages/public/NotFoundPage'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Navbar />
        <main>
        <Routes>
          {/* Públicas */}
          <Route path="/" element={<HomePage />} />
          <Route path="/item/:id" element={<ItemDetailPage />} />
          <Route path="/terminos-y-condiciones" element={<TermsPage />} />
          <Route path="/nosotros" element={<AboutPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/auth/callback" element={<GoogleCallbackPage />} />

          {/* Usuario autenticado */}
          <Route path="/dashboard" element={<ProtectedRoute><UserDashboardPage /></ProtectedRoute>} />
          <Route path="/dashboard/perfil" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/dashboard/enviar" element={<ProtectedRoute><SubmitItemPage /></ProtectedRoute>} />
          <Route path="/dashboard/mis-solicitudes" element={<ProtectedRoute><MySubmissionsPage /></ProtectedRoute>} />
          <Route path="/dashboard/mis-solicitudes/:id" element={<ProtectedRoute><SubmissionDetailPage /></ProtectedRoute>} />

          {/* Admin */}
          <Route path="/admin" element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />
          <Route path="/admin/solicitudes" element={<AdminRoute><AdminSubmissionsPage /></AdminRoute>} />
          <Route path="/admin/solicitudes/:id" element={<AdminRoute><AdminSubmissionDetailPage /></AdminRoute>} />
          <Route path="/admin/catalogo" element={<AdminRoute><AdminCatalogPage /></AdminRoute>} />
          <Route path="/admin/usuarios" element={<AdminRoute><AdminUsersPage /></AdminRoute>} />
          <Route path="/admin/tiendas" element={<AdminRoute><AdminStoresPage /></AdminRoute>} />

          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        </main>
        <Footer />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
