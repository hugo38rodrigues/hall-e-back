import { Router } from 'express'
import { CommunController } from '../controllers/commun.controller.js'
import { FavorisController } from '../controllers/favoris.controller.js'
import { Authentification } from '../middleware/authentification.js'

const router = Router()
const user = new CommunController()
const auth = new Authentification()
const favoris = new FavorisController()

router.get('/', user.getMatchesController)
router.get('/filters', user.getFiltersController)
router.post('/connexion', user.connexion)
router.get('/profil', user.getProfil)
router.post('/registe', user.createAccount)
router.post('/forgot-password', auth.verifyTokenMiddleware, user.forgotPassword)
router.post('/verify-code', auth.verifyTokenMiddleware, user.verifyCode)
router.post('/reset-password', auth.verifyTokenMiddleware, user.resetPassword)
router.get('/bars', user.getAllBarController)
router.delete('/user/:idUser', auth.verifyTokenMiddleware, user.deleteUser)
router.put('/', auth.verifyTokenMiddleware, user.updateProfile)
router.post('/favoris', auth.verifyTokenMiddleware, favoris.addFavorites)
router.delete('/favoris', auth.verifyTokenMiddleware, favoris.deleteFavorites)

export default router
