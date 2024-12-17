import { Router } from 'express'
import { CommunController } from '../controllers/commun.controller.js'
import { FavorisController } from '../controllers/favoris.controller.js'
import { Midleware } from '../utils/midleware.js'

const router = Router()
const user = new CommunController()
const favoris = new FavorisController()
const middleware = new Midleware()

router.post('/favorites', favoris.getFavorisController)

router.post('/favorites/game', favoris.addFavorisGameController)
router.delete('/favorites/game', favoris.deleteFavorisGameController)
router.post('/favorites/league', favoris.addFavorisLeagueController)
router.post('/favorites/team', favoris.addFavorisTeamController)
router.delete('/favorites/team', favoris.deleteFavorisTeamController)

router.post('/favorites/league', favoris.addFavorisLeagueController)
router.delete('/favorites/league', favoris.deleteFavorisLeagueController)

router.get('/', user.getMatchesController)

router.post('/connexion', user.connexion)
router.post('/sign-in', middleware.verifyRoleInBody, user.createAccount)
router.delete('/', middleware.verifyRoleInBody, user.deleteUser)
router.put('/', middleware.verifyRoleInBody, user.updateProfile)


export default router
