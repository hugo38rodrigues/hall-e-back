import { Router } from 'express'
import { ConsumerController } from '../controllers/consumer.controller.js'

const router = Router()
const consumer = new ConsumerController()

router.get('/', consumer.getMatchController)
router.post('/favorite/match', consumer.getMatchController)
router.post('/favorite/game', consumer.addFavorisGameController)
router.post('/favorite/league', consumer.addFavorisLeagueController)
router.post('/favorite/team', consumer.addFavorisTeamController)
router.post('/like', consumer.addLikeBarController)
router.post('/comment', consumer.addCommentsController)

export default router