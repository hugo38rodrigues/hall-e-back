import { Router } from 'express'
import { BarController } from '../controllers/bar.controller.js'
import { Auth } from '../midleware/auth.js'

const router = Router()
const bar = new BarController()
const middleware = new Auth()

router.get('/', middleware.verifyAccount, bar.getMatchController)
router.post('/', middleware.verifyAccount,  bar.matchesPlanningsController)


export default router