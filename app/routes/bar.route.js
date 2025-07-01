import { Router } from 'express'
import { BarController } from '../controllers/bar.controller.js'
import { Auth } from '../midleware/auth.js'

const router = Router()
const bar = new BarController()
const auth = new Auth()

router.post('/', auth.verifyAccount, bar.matchesPlanningsController)
router.delete('/', auth.verifyAccount, bar.deletedMatchProgramming)



export default router