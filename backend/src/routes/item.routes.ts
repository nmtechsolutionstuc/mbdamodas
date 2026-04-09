import { Router } from 'express'
import { listItems, getItem, listPublicProductTypes } from '../controllers/item.controller'
import { asyncHandler } from '../utils/asyncHandler'

const router = Router()

router.get('/product-types', asyncHandler(listPublicProductTypes))
router.get('/', asyncHandler(listItems))
router.get('/:id', asyncHandler(getItem))

export default router
