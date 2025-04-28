import { Router } from 'express'
import { CommunController } from '../controllers/commun.controller.js'
import { FavorisController } from '../controllers/favoris.controller.js'
import { Auth } from '../midleware/auth.js'
import { upload } from '../midleware/multer.js'

const router = Router()
const user = new CommunController()
const favoris = new FavorisController()
const middleware = new Auth()

router.post('/favorites/game', favoris.addFavorisGameController)
router.delete('/favorites/game', favoris.deleteFavorisGameController)
router.post('/favorites/team', favoris.addFavorisTeamController)
router.delete('/favorites/team', favoris.deleteFavorisTeamController)
router.post('/favorites/league', favoris.addFavorisLeagueController)
router.delete('/favorites/league',  favoris.deleteFavorisLeagueController)
router.post('/favorites/bar-name', favoris.addFavorisBarNameController)
router.delete('/favorites/bar-name', favoris.deleteFavorisBarNameController)

router.get('/', user.getMatchesController)
router.get('/filters', user.getFiltersController)

router.post('/connexion', user.connexion)
router.post('/registe', user.createAccount)
router.post('/forgot-password', user.forgotPassword)
router.post('/verify-code', user.verifyCode)
router.post('/reset-password', user.resetPassword)

router.delete('/', middleware.verifyAccount, user.deleteUser)
router.put('/', middleware.verifyAccount, upload.array('images', 10), user.updateProfile)

export default router
