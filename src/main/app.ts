import express from 'express'
import cors from 'cors'
import { errorHandler } from '../interfaces/http/middleware/error-handler.js'
import { registerRoutes } from '../interfaces/http/routes/index.js'
import type { Controllers } from './container.js'

export function createApp(controllers: Controllers) {
  const app = express()

  app.use(express.json())
  app.use(cors())
  app.disable('x-powered-by')
  app.use(express.urlencoded({ extended: true }))

  registerRoutes(app, controllers)   
  app.use(errorHandler)

  return app
}