import { Router } from 'express'
import { CommunController } from '../controllers/commun.controller.js'
import { FavorisController } from '../controllers/favoris.controller.js'
import { Authentification } from '../middleware/authentification.js'

const router = Router()
const user = new CommunController()
const auth = new Authentification()
const favoris = new FavorisController()

router.post('/connexion', user.connexion)
router.post('/user/register', user.createAccount)
router.delete('/user/:idUser', auth.verifyTokenMiddleware, user.deleteUser)
router.post('/verify-code', auth.verifyTokenMiddleware, user.verifyCode)
router.post('/forgot-password', auth.verifyTokenMiddleware, user.forgotPassword)
router.post('/reset-password', auth.verifyTokenMiddleware, user.resetPassword)
router.put('/user/update-profil', auth.verifyTokenMiddleware, user.updateProfile)
router.get('/user', auth.verifyTokenMiddleware, user.getProfil)

router.get('/matches', user.getMatchesController)
router.get('/filters', user.getFiltersController)
router.get('/bars', user.getAllBarController)
router.post('/favoris', auth.verifyTokenMiddleware, favoris.addFavorites)
router.delete('/favoris', auth.verifyTokenMiddleware, favoris.deleteFavorites)

export default router
