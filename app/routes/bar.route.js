import { Router } from 'express'
import { BarController } from '../controllers/bar.controller.js'
import { FavorisController } from '../controllers/favoris.controller.js'
// import { Auth } from '../middleware/auth.js'

const router = Router()
const bar = new BarController()
const favoris = new FavorisController()
// const auth = new Auth()

router.post('/', bar.addSchedulingMatchesController)
router.delete('/', bar.deletedSchedulingMatchesController)
router.get('/:barId', bar.getSchedulingMatchesController)
router.post('/favoris', favoris.addFavorites)
router.delete('/favoris', favoris.deleteFavorites)
export default router
