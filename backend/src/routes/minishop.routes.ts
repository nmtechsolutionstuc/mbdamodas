import { Router } from 'express'
import { authenticate } from '../middlewares/authenticate'
import { asyncHandler } from '../utils/asyncHandler'
import { upload } from '../config/multer'
import {
  listMyShops,
  createShop,
  getMyShop,
  updateShop,
  uploadShopPhoto,
  toggleShopStatus,
  listShopProducts,
  createProduct,
  toggleProductStatus,
  deleteProduct,
  getPublicShopProfile,
  getPublicShopProducts,
  listApprovedProducts,
  updateProductQuantity,
} from '../controllers/minishop.controller'

const router = Router()

// ── Public ─────────────────────────────────────────────────────
router.get('/public/:slug', asyncHandler(getPublicShopProfile))
router.get('/public/:slug/products', asyncHandler(getPublicShopProducts))

// ── Authenticated: My shops ────────────────────────────────────
router.use(authenticate)

router.get('/', asyncHandler(listMyShops))
router.post('/', asyncHandler(createShop))

router.get('/:shopId', asyncHandler(getMyShop))
router.patch('/:shopId', asyncHandler(updateShop))
router.post('/:shopId/photo', upload.single('photo'), asyncHandler(uploadShopPhoto))
router.patch('/:shopId/toggle-status', asyncHandler(toggleShopStatus))

// ── Products within a shop ─────────────────────────────────────
router.get('/:shopId/products', asyncHandler(listShopProducts))
router.post('/:shopId/products', upload.array('photos', 3), asyncHandler(createProduct))
router.patch('/:shopId/products/:productId/toggle-status', asyncHandler(toggleProductStatus))
router.delete('/:shopId/products/:productId', asyncHandler(deleteProduct))
router.get('/:shopId/products/approved', asyncHandler(listApprovedProducts))
router.patch('/:shopId/products/:productId/quantity', asyncHandler(updateProductQuantity))

export default router
