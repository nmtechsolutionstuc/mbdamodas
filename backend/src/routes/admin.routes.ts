import { Router } from 'express'
import { authenticate } from '../middlewares/authenticate'
import { authorize } from '../middlewares/authorize'
import {
  listSubmissions, getSubmission,
  approve, reject, markInStore, markSold, markReturned,
  listCatalog, createCatalogItem, editCatalogItem, softDeleteCatalogItem,
  listUsers, createUser, deactivateUser,
  getDashboardStats,
  listProductTypes, toggleProductType,
  createSize, toggleSize,
  createTag, toggleTag,
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
router.get('/catalog', listCatalog)
router.post('/catalog', createCatalogItem)
router.patch('/catalog/:id', editCatalogItem)
router.delete('/catalog/:id', softDeleteCatalogItem)

// Product Types / Sizes / Tags
router.get('/product-types', listProductTypes)
router.patch('/product-types/:id/toggle', toggleProductType)
router.post('/sizes', createSize)
router.patch('/sizes/:id/toggle', toggleSize)
router.post('/tags', createTag)
router.patch('/tags/:id/toggle', toggleTag)

// Usuarios
router.get('/users', listUsers)
router.post('/users', createUser)
router.patch('/users/:id/deactivate', deactivateUser)

// Tiendas
router.get('/stores', listStores)
router.post('/stores', createStore)
router.patch('/stores/:id', updateStore)

export default router
