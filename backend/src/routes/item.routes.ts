import { Router } from 'express'
import { listItems, getItem, listPublicProductTypes } from '../controllers/item.controller'

const router = Router()

router.get('/product-types', listPublicProductTypes)
router.get('/', listItems)
router.get('/:id', getItem)

export default router
