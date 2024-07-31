import { router } from 'express'
import { Consumer } from '../classes/consumer'

const consumer = new Consumer()

router.get('/', consumer)
router.post('/favoris', consumer)
router.post('like', consumer)
router.post('comment', consumer)
router.delete('/:email', consumer.deleteAccount)
router.put('/', consumer.updateAccount)

