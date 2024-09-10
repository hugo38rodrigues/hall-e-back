import { Router } from 'express'
import { BarController } from '../controllers/bar.controller.js'

const router = Router()
const bar = new BarController()

router.get('/', bar)
router.post('/', bar)
router.post('', bar)
router.post('', bar)