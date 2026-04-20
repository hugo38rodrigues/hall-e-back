import { Router } from 'express'
import { BarController } from '../controllers/bar.controller.js'
import { Authentification } from '../middleware/authentification.js'

const router = Router()
const bar = new BarController()
const auth = new Authentification()
const requireBar = auth.requireRole('bar')

router.post('/', auth.verifyTokenMiddleware, requireBar, bar.addSchedulingMatchesController)
router.delete('/:matchId/:barId', auth.verifyTokenMiddleware, requireBar, bar.deletedSchedulingMatchesController)
router.get('/:barId', auth.verifyTokenMiddleware, requireBar, bar.getSchedulingMatchesController)
export default router
