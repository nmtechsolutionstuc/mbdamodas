import { Router } from 'express'
import { authenticate } from '../middlewares/authenticate'
import { authorize } from '../middlewares/authorize'
import {
  listSubmissions, getSubmission,
  approve, reject, markInStore, markSold, markReturned,
  listCatalog, createCatalogItem, editCatalogItem, softDeleteCatalogItem, uploadCatalogItemPhotos, deleteItemPhoto, toggleFeatured,
  listUsers, createUser, deactivateUser, updateUser, deleteUser,
  getDashboardStats,
  listProductTypes, toggleProductType,
  createSize, toggleSize,
  createTag, toggleTag,
} from '../controllers/admin.controller'
import { upload } from '../config/multer'
import { listStores, createStore, updateStore, updateStoreContent } from '../controllers/store.controller'
import {
  listAdminReservations, approveReservationHandler, rejectReservationHandler,
  completeReservationHandler, extendReservationHandler,
  deleteAdminReservation, resendReservationWhatsapp,
} from '../controllers/reservation.controller'
import {
  adminListShops, adminUpdateShop,
  adminListProducts, adminApproveProduct, adminRejectProduct, adminToggleFeatured,
  adminPendingCount,
} from '../controllers/admin-minishops.controller'
import {
  listFeatured, setFeaturedItem, setFeaturedMiniShopProduct,
  searchProductsToFeature, adminEditProduct,
} from '../controllers/admin-featured.controller'
import { asyncHandler } from '../utils/asyncHandler'

const router = Router()

// Todas las rutas de admin requieren autenticación + rol ADMIN
router.use(authenticate, authorize('ADMIN'))

// Dashboard
router.get('/stats', asyncHandler(getDashboardStats))

// Solicitudes
router.get('/submissions', asyncHandler(listSubmissions))
router.get('/submissions/:id', asyncHandler(getSubmission))

// Acciones sobre SubmissionItems
router.patch('/items/:itemId/approve', asyncHandler(approve))
router.patch('/items/:itemId/reject', asyncHandler(reject))
router.patch('/items/:itemId/mark-in-store', asyncHandler(markInStore))
router.patch('/items/:itemId/mark-sold', asyncHandler(markSold))
router.patch('/items/:itemId/mark-returned', asyncHandler(markReturned))

// Catálogo (Items aprobados)
router.get('/catalog', asyncHandler(listCatalog))
router.post('/catalog', asyncHandler(createCatalogItem))
router.patch('/catalog/:id', asyncHandler(editCatalogItem))
router.delete('/catalog/:id', asyncHandler(softDeleteCatalogItem))
router.post('/catalog/:id/photos', upload.array('photos', 5), asyncHandler(uploadCatalogItemPhotos))
router.delete('/catalog/:id/photos/:photoId', asyncHandler(deleteItemPhoto))
router.patch('/catalog/:id/toggle-featured', asyncHandler(toggleFeatured))

// Product Types / Sizes / Tags
router.get('/product-types', asyncHandler(listProductTypes))
router.patch('/product-types/:id/toggle', asyncHandler(toggleProductType))
router.post('/sizes', asyncHandler(createSize))
router.patch('/sizes/:id/toggle', asyncHandler(toggleSize))
router.post('/tags', asyncHandler(createTag))
router.patch('/tags/:id/toggle', asyncHandler(toggleTag))

// Usuarios
router.get('/users', asyncHandler(listUsers))
router.post('/users', asyncHandler(createUser))
router.patch('/users/:id/deactivate', asyncHandler(deactivateUser))
router.patch('/users/:id', asyncHandler(updateUser))
router.delete('/users/:id', asyncHandler(deleteUser))

// Tiendas
router.get('/stores', asyncHandler(listStores))
router.post('/stores', asyncHandler(createStore))
router.patch('/stores/:id', asyncHandler(updateStore))
router.patch('/store-content', asyncHandler(updateStoreContent))

// Mini-tiendas (admin)
router.get('/minishops/products/pending-count', asyncHandler(adminPendingCount))
router.get('/minishops/products', asyncHandler(adminListProducts))
router.patch('/minishops/products/:id/approve', asyncHandler(adminApproveProduct))
router.patch('/minishops/products/:id/reject', asyncHandler(adminRejectProduct))
router.patch('/minishops/products/:id/toggle-featured', asyncHandler(adminToggleFeatured))
router.patch('/minishops/products/:id/edit', asyncHandler(adminEditProduct))
router.get('/minishops', asyncHandler(adminListShops))
router.patch('/minishops/:id', asyncHandler(adminUpdateShop))

// Gestión de Destacados
router.get('/featured', asyncHandler(listFeatured))
router.get('/featured/search', asyncHandler(searchProductsToFeature))
router.patch('/featured/item/:id', asyncHandler(setFeaturedItem))
router.patch('/featured/minishop-product/:id', asyncHandler(setFeaturedMiniShopProduct))

// Reservas
router.get('/reservations', asyncHandler(listAdminReservations))
router.patch('/reservations/:id/approve', asyncHandler(approveReservationHandler))
router.patch('/reservations/:id/reject', asyncHandler(rejectReservationHandler))
router.patch('/reservations/:id/complete', asyncHandler(completeReservationHandler))
router.patch('/reservations/:id/extend', asyncHandler(extendReservationHandler))
router.delete('/reservations/:id', asyncHandler(deleteAdminReservation))
router.get('/reservations/:id/resend-whatsapp', asyncHandler(resendReservationWhatsapp))

export default router
