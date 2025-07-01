import { Router } from 'express'
import { ClientController } from '../controllers/client.controller.js'
import { Auth } from '../midleware/auth.js'

const router = Router()
const client = new ClientController()
const auth = new Auth()

router.get('/', auth.verifyAccount, client.getAllBarController)
// router.post('/like', middleware.verifyAccount, client.addLikeBarController)
// router.post('/comment',  middleware.verifyRoleInBody, client.addCommentsController)

export default router
