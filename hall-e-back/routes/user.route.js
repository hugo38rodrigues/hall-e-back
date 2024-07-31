import express from 'express'
import { UserController } from '../controllers/user.controller.js'


const router = express.Router()
const user = new UserController()

router.post('/sign-in', user.createAccount)
router.post('/connexion', user.connexion)
router.delete('/:id/:role', user.deleteAccount)


export default router