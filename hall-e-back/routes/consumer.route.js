import { Router } from 'express'
import { ConsumerController } from '../controllers/consumer.controller.js'
import { Midleware } from '../utils/midleware.js'

const router = Router()
const consumer = new ConsumerController()
const middleware = new Midleware

router.get('/', consumer.getMatchController)
router.post('/favorite/game', middleware.verifyRoleInBody, consumer.addFavorisGameController)
router.delete('/favorite/game', middleware.verifyRoleInBody, consumer.deleteFavorisGameController)
router.post('/favorite/league',  middleware.verifyRoleInBody, consumer.addFavorisLeagueController)
router.post('/favorite/team', middleware.verifyRoleInBody,  consumer.addFavorisTeamController)
router.delete('/favorite/team', middleware.verifyRoleInBody,  consumer.deleteFavorisTeamController)
router.post('/favorite/league', middleware.verifyRoleInBody,  consumer.addFavorisLeagueController)
router.delete('/favorite/league', middleware.verifyRoleInBody,  consumer.deleteFavorisLeagueController)
router.post('/like',  middleware.verifyRoleInBody, consumer.addLikeBarController)
// router.post('/comment',  middleware.verifyRoleInBody, consumer.addCommentsController)

export default router