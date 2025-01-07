import { Router } from 'express'
import { CommunController } from '../controllers/commun.controller.js'
import { FavorisController } from '../controllers/favoris.controller.js'
import { Auth } from '../midleware/auth.js'
import { upload } from '../midleware/multer.js'

const router = Router()
const user = new CommunController()
const favoris = new FavorisController()
const middleware = new Auth()

router.post('/favorites', middleware.verifyAccount, favoris.getFavorisController)
router.post('/favorites/game', middleware.verifyAccount, favoris.addFavorisGameController)
router.delete('/favorites/game', middleware.verifyAccount,  favoris.deleteFavorisGameController)
router.post('/favorites/league', middleware.verifyAccount,  favoris.addFavorisLeagueController)
router.post('/favorites/team', middleware.verifyAccount, favoris.addFavorisTeamController)
router.delete('/favorites/team', middleware.verifyAccount, favoris.deleteFavorisTeamController)
router.post('/favorites/league', middleware.verifyAccount, favoris.addFavorisLeagueController)
router.delete('/favorites/league', middleware.verifyAccount, favoris.deleteFavorisLeagueController)

router.get('/', user.getMatchesController)

router.post('/connexion', user.connexion)
router.post('/sign-up', user.createAccount)
router.post('/forgot-password', user.forgotPassword)
router.post('/reset-password', user.resetPassword)
router.post('/verify-token', user.verifyToken)
router.delete('/', middleware.verifyAccount, user.deleteUser)
router.put('/', middleware.verifyAccount, upload.array('images', 10), user.updateProfile)

export default router
