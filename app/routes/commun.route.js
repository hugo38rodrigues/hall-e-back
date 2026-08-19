import { Router } from 'express'
import { CommunController } from '../controllers/commun.controller.js'
import { FavorisController } from '../controllers/favoris.controller.js'
import { RoleValidation } from '../middleware/role-validation.js'
import { TokenService } from '../middleware/token-service.js'
import { UserValidator } from '../utils/user-validator.js'

const router = Router()
const user = new CommunController({ validator: new UserValidator() })
const tokenService = new TokenService()
const roleValidation = new RoleValidation()
const favoris = new FavorisController()

router.post('/auth/connexion', user.connexion)
router.post('/auth/register', user.createAccount)
router.post('/verify-code', tokenService.validationTokenAccess, user.verifyCode)
router.post('/forgot-password', user.forgotPassword)
router.post('/reset-password', tokenService.validationTokenAccess, user.resetPassword)

router.delete('/user/:idUser', tokenService.validationTokenAccess, roleValidation.requireClientOrBar, user.deleteUser)
router.put('/user/update-profile', tokenService.validationTokenAccess, roleValidation.requireClientOrBar, user.updateProfile)
router.get('/user', tokenService.validationTokenAccess, roleValidation.requireClientOrBar, user.getProfil)

router.get('/matches', user.getMatchesController)
router.get('/filters', user.getFiltersController)
router.get('/bars', user.getAllBarController)
router.post('/favoris', tokenService.validationTokenAccess, roleValidation.requireClientOrBar, favoris.addFavorites)
router.delete('/favoris', tokenService.validationTokenAccess, roleValidation.requireClientOrBar, favoris.deleteFavorites)

export default router
