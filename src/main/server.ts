import './env'
import { db } from '../infrastructure/persistence/sequelize/database/index.js'
import { buildContainer } from './container.js'
import { createApp } from './app.js'
import { LoggerPino } from '../infrastructure/pino.logging.js'

const logger = new LoggerPino()
const controllers = buildContainer(db)   
const app = createApp(controllers)     

const port = process.env.PORT ?? 3000

app.listen(port, () => logger.info(`Start server on ${port}`))