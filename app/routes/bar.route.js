import { Router } from 'express'
import { BarController } from '../controllers/bar.controller.js'
import { Jwt } from '../middleware/jwt.js'
import { RoleValidation } from '../middleware/RoleValidation.js'

const router = Router()
const bar = new BarController()
const auth = new Jwt()
const roleValidation = new RoleValidation()

router.post('/', auth.validationTokenAccess, roleValidation.requireRole('bar'), bar.addSchedulingMatchesController)
router.delete('/:barId/:matchId', bar.deleteSchedulingMatchesController)
router.get('/:barId', auth.validationTokenAccess, roleValidation.requireRole('bar'), bar.getSchedulingMatchesController)
export default router
