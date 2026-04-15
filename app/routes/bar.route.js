import { Router } from 'express'
import { BarController } from '../controllers/bar.controller.js'
import { Auth } from '../middleware/auth.js'

const router = Router()
const bar = new BarController()
const auth = new Auth()

router.post('/', auth.verifyAccount, bar.addSchedulingMatchesController)
router.delete('/:matchId/:barId', auth.verifyAccount, bar.deletedSchedulingMatchesController)
router.get('/:barId', auth.verifyAccount, bar.getSchedulingMatchesController)
export default router
