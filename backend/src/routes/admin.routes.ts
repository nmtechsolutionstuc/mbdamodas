import { Router } from 'express'
import { authenticate } from '../middlewares/authenticate'
import { authorize } from '../middlewares/authorize'
import {
  listSubmissions, getSubmission,
  approve, reject, markInStore, markSold, markReturned,
  editCatalogItem, softDeleteCatalogItem,
  listUsers, deactivateUser,
  getDashboardStats,
} from '../controllers/admin.controller'
import { listStores, createStore, updateStore } from '../controllers/store.controller'

const router = Router()

// Todas las rutas de admin requieren autenticación + rol ADMIN
router.use(authenticate, authorize('ADMIN'))

// Dashboard
router.get('/stats', getDashboardStats)

// Solicitudes
router.get('/submissions', listSubmissions)
router.get('/submissions/:id', getSubmission)

// Acciones sobre SubmissionItems
router.patch('/items/:itemId/approve', approve)
router.patch('/items/:itemId/reject', reject)
router.patch('/items/:itemId/mark-in-store', markInStore)
router.patch('/items/:itemId/mark-sold', markSold)
router.patch('/items/:itemId/mark-returned', markReturned)

// Catálogo (Items aprobados)
router.patch('/catalog/:id', editCatalogItem)
router.delete('/catalog/:id', softDeleteCatalogItem)

// Usuarios
router.get('/users', listUsers)
router.patch('/users/:id/deactivate', deactivateUser)

// Tiendas
router.get('/stores', listStores)
router.post('/stores', createStore)
router.patch('/stores/:id', updateStore)

export default router
