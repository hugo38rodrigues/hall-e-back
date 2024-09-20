import { Router } from 'express'
import { UserController } from '../controllers/user.controller.js'
import { Midleware } from '../utils/midleware.js'

const router = Router()
const user = new UserController()
const middleware = new Midleware()

router.post('/sign-in', middleware.verifyRoleInBody, user.createAccount)
router.post('/connexion', user.connexion) 
router.delete('/', middleware.verifyRoleInBody, user.deleteUser)
router.put('/', middleware.verifyRoleInBody, user.updateProfile)

export default router
