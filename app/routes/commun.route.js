import { Router } from 'express'
import { CommunController } from '../controllers/commun.controller.js'
import { Auth } from '../midleware/auth.js'

const router = Router()
const user = new CommunController()
const auth = new Auth()

router.get('/', user.getMatchesController)
router.get('/filters', user.getFiltersController)
router.post('/connexion', user.connexion)
router.post('/registe', user.createAccount)
router.post('/forgot-password', auth.verifyAccount, user.forgotPassword)
router.post('/verify-code', auth.verifyAccount, user.verifyCode)
router.post('/reset-password', auth.verifyAccount, user.resetPassword)
router.get('/bars', user.getAllBarController)
router.delete('/:idUser', auth.verifyAccount, user.deleteUser)
router.put('/', auth.verifyAccount, user.updateProfile)
router.post('/favoris', auth.verifyAccount, user.addFavorites)
router.delete('/favoris', auth.verifyAccount, user.deleteFavorites)

export default router
