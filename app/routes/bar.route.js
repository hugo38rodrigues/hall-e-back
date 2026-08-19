import { Router } from 'express'
import { BarController } from '../controllers/bar.controller.js'
import { RoleValidation } from '../middleware/role-validation.js'
import { TokenService } from '../middleware/token-service.js'

const router = Router()
const bar = new BarController()
const auth = new TokenService()
const roleValidation = new RoleValidation()

router.post('/', auth.validationTokenAccess, roleValidation.requireRole('bar'), bar.addSchedulingMatchesController)
router.delete('/:barId/:matchId', bar.deleteSchedulingMatchesController)
router.get('/:barId', auth.validationTokenAccess, roleValidation.requireRole('bar'), bar.getSchedulingMatchesController)
export default router
