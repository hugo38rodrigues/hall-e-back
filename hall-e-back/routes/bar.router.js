import { Router } from 'express'
import { BarController } from '../controllers/bar.controller.js'
import { Midleware } from '../utils/midleware.js'

const router = Router()
const bar = new BarController()
const middleware = new Midleware()

router.get('/', middleware.verifyRoleInBody, bar.getMatchController)
router.post('/favorite/game', middleware.verifyRoleInBody, bar.addFavorisGameController)
router.delete('/favorite/game', middleware.verifyRoleInBody, bar.deleteFavorisGameController)
router.post('/favorite/league',  middleware.verifyRoleInBody, bar.addFavorisLeagueController)
router.post('/favorite/team', middleware.verifyRoleInBody,  bar.addFavorisTeamController)
router.delete('/favorite/team', middleware.verifyRoleInBody,  bar.deleteFavorisTeamController)
router.post('/favorite/league', middleware.verifyRoleInBody,  bar.addFavorisLeagueController)
router.delete('/favorite/league', middleware.verifyRoleInBody,  bar.deleteFavorisLeagueController)

export default router