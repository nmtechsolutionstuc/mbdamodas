import { Router } from 'express'
import { asyncHandler } from '../utils/asyncHandler'
import { listCatalog, listCatalogShops, getCatalogProductBySlug } from '../controllers/catalog.controller'

const router = Router()

router.get('/', asyncHandler(listCatalog))
router.get('/shops', asyncHandler(listCatalogShops))
router.get('/products/:slug', asyncHandler(getCatalogProductBySlug))

export default router
