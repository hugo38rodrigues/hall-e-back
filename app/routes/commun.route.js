import { Router } from 'express'
import { CommunController } from '../controllers/commun.controller.js'
import { FavorisController } from '../controllers/favoris.controller.js'
import { Jwt } from '../middleware/jwt.js'
import { RoleValidation } from '../middleware/RoleValidation.js'

const router = Router()
const user = new CommunController()
const auth = new Jwt()
const roleValidation = new RoleValidation()
const favoris = new FavorisController()

router.post('/connexion', user.connexion)
router.post('/user/register', user.createAccount)
router.post('/verify-code', auth.validationTokenAccess, user.verifyCode)
router.post('/forgot-password', user.forgotPassword)
router.post('/reset-password', auth.validationTokenAccess, user.resetPassword)

router.delete('/user/:idUser', auth.validationTokenAccess, roleValidation.requireClientOrBar, user.deleteUser)
router.put('/user/update-profile', auth.validationTokenAccess, roleValidation.requireClientOrBar, user.updateProfile)
router.get('/user', auth.validationTokenAccess, roleValidation.requireClientOrBar, user.getProfil)

router.get('/matches', user.getMatchesController)
router.get('/filters', user.getFiltersController)
router.get('/bars', user.getAllBarController)
router.post('/favoris', auth.validationTokenAccess, roleValidation.requireClientOrBar, favoris.addFavorites)
router.delete('/favoris', auth.validationTokenAccess, roleValidation.requireClientOrBar, favoris.deleteFavorites)

export default router
