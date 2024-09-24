import { Router } from 'express'
import { ConsumerController } from '../controllers/consumer.controller.js'
import { Midleware } from '../utils/midleware.js'

const router = Router()
const consumer = new ConsumerController()
const middleware = new Midleware

router.get('/', consumer.getMatchController)
router.post('/like',  middleware.verifyRoleInBody, consumer.addLikeBarController)
// router.post('/comment',  middleware.verifyRoleInBody, consumer.addCommentsController)

export default router