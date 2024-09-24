import { Router } from 'express'
import { CommunController } from '../controllers/commun.controller.js'
import { Midleware } from '../utils/midleware.js'

const router = Router()
const user = new CommunController()
const middleware = new Midleware()

router.post('/favorite/game', middleware.verifyRoleInBody, user.addFavorisGameController)
router.delete('/favorite/game', middleware.verifyRoleInBody, user.deleteFavorisGameController)
router.post('/favorite/league',  middleware.verifyRoleInBody, user.addFavorisLeagueController)
router.post('/favorite/team', middleware.verifyRoleInBody,  user.addFavorisTeamController)
router.delete('/favorite/team', middleware.verifyRoleInBody,  user.deleteFavorisTeamController)
router.post('/favorite/league', middleware.verifyRoleInBody,  user.addFavorisLeagueController)
router.delete('/favorite/league', middleware.verifyRoleInBody,  user.deleteFavorisLeagueController)
router.get('/', user.getMatchesAndScheduledMatchesController)

router.post('/connexion', user.connexion)
router.post('/sign-in', middleware.verifyRoleInBody, user.createAccount)
router.delete('/', middleware.verifyRoleInBody, user.deleteUser)
router.put('/', middleware.verifyRoleInBody, user.updateProfile)


export default router
