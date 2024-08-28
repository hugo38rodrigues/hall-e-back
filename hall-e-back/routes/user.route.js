import { Router } from 'express'
import { UserController } from '../controllers/user.controller.js'

const router = Router()
const user = new UserController()

router.post('/sign-in', user.createAccount)
router.post('/connexion', user.connexion)
router.delete('/', user.deleteUser)
router.put ('/', user.updateProfile)


export default router