import { Router } from 'express'
import { BarController } from '../controllers/bar.controller.js'
import { Midleware } from '../utils/midleware.js'

const router = Router()
const bar = new BarController()
const middleware = new Midleware()

router.get('/', middleware.verifyRoleInBody, bar.getMatchController)
router.post('/', middleware.verifyRoleInBody,  bar.matchesPlanningsController)


export default router