// interfaces/http/routes/match.routes.ts
import { Router } from 'express'
import type { Controllers } from '../../../main/container.js'

export function makeMatchRoutes(controllers: Controllers): Router {
  const router = Router()
  router.get('/matches', controllers.getAllMatches)
  return router
}