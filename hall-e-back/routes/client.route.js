import { Router } from 'express'
import { ClientController } from '../controllers/client.controller.js'
import { Midleware } from '../utils/midleware.js'

const router = Router()
const client = new ClientController()
const middleware = new Midleware()

router.get('/', client.getMatchController)
router.post('/like', middleware.verifyRoleInBody, client.addLikeBarController)
// router.post('/comment',  middleware.verifyRoleInBody, client.addCommentsController)

export default router
