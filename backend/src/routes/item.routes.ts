import { Router } from 'express'
import { listItems, getItem } from '../controllers/item.controller'

const router = Router()

router.get('/', listItems)
router.get('/:id', getItem)

export default router
