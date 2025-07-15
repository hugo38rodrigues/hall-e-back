import { Router } from 'express'
import { CommunController } from '../controllers/commun.controller.js'
import { FavorisController } from '../controllers/favoris.controller.js'
import { Auth } from '../midleware/auth.js'

const router = Router()
const user = new CommunController()
const favoris = new FavorisController()
const auth = new Auth()

router.post('/favorites/game', auth.verifyAccount, favoris.addFavorisGameController)
router.delete('/favorites/game', auth.verifyAccount, favoris.deleteFavorisGameController)
router.post('/favorites/team', auth.verifyAccount, favoris.addFavorisTeamController)
router.delete('/favorites/team', auth.verifyAccount, favoris.deleteFavorisTeamController)
router.post('/favorites/league', auth.verifyAccount, favoris.addFavorisLeagueController)
router.delete('/favorites/league', auth.verifyAccount, favoris.deleteFavorisLeagueController)
router.post('/favorites/bar-name', auth.verifyAccount, favoris.addFavorisBarNameController)
router.delete('/favorites/bar-name', auth.verifyAccount, favoris.deleteFavorisBarNameController)

router.get('/', user.getMatchesController)
router.get('/filters', user.getFiltersController)

router.post('/connexion', user.connexion)
router.post('/registe', user.createAccount)
router.post('/forgot-password', auth.verifyAccount, user.forgotPassword)
router.post('/verify-code', auth.verifyAccount, user.verifyCode)
router.post('/reset-password', auth.verifyAccount, user.resetPassword)
router.get('/bars', user.getAllBarController)
router.delete('/', auth.verifyAccount, user.deleteUser)
router.put('/', auth.verifyAccount, user.updateProfile)

export default router
