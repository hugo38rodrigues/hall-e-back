import { Router } from 'express'
import { CommunController } from '../controllers/commun.controller.js'
import { Midleware } from '../utils/midleware.js'

const router = Router()
const user = new CommunController()
const middleware = new Midleware()

router.post('/sign-in', middleware.verifyRoleInBody, user.createAccount)
router.post('/connexion', user.connexion)
router.get('/', user.getMatchesAndScheduledMatchesController)
router.delete('/', middleware.verifyRoleInBody, user.deleteUser)
router.put('/', middleware.verifyRoleInBody, user.updateProfile)


export default router
