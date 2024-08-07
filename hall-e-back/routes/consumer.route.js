import { Router } from 'express'
import { Consumer } from '../controllers/consumer.controller.js'

const router = Router()
const consumer = new Consumer()

router.get('/', consumer.getMatch)
router.post('/favorite', consumer.addFavoritesMatch)
router.post('/like', consumer.addLikeBar)
router.post('/comment', consumer.addComments)


