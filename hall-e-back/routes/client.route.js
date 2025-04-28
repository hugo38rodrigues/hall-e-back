import { Router } from 'express'
import { ClientController } from '../controllers/client.controller.js'

const router = Router()
const client = new ClientController()

router.get('/', client.getAllBarController)
// router.post('/like', middleware.verifyAccount, client.addLikeBarController)
// router.post('/comment',  middleware.verifyRoleInBody, client.addCommentsController)

export default router
