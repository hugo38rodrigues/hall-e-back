import { Express } from 'express'
import { makeMatchRoutes } from '../routes/match.routes.js'
import { Controllers } from '../../../main/container.js'

export function registerRoutes(app: Express, controllers: Controllers) {
  app.use('/api/v1', makeMatchRoutes(controllers))   
}