import { Router } from 'express'
import { BarController } from '../controllers/bar.controller.js'

const router = Router()
const bar = new BarController()


router.post('/',  bar.matchesPlanningsController)
router.delete('/', bar.deletedMatchProgramming)



export default router