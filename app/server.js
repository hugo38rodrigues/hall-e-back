import { databaseFactory } from '@hugo38rodrigues/bdd-service-hall-e'
import cors from 'cors'
import express from 'express'
import Logger from './middleware/logger.js'
import barRoutes from './routes/bar.route.js'
import communRoutes from './routes/commun.route.js'

const logger = new Logger('Server')
const app = express()

const { PORT } = process.env

app.use(cors())
app.disable('x-powered-by')
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
const databaseInstance = databaseFactory()

try {
	await databaseInstance.connectDb()
	logger.info('DB connected')
} catch (error) {
	logger.error('Database not started', { error }) // ou logger.error(error)
}

app.use('/api/v1', communRoutes)
app.use('/api/v1/bar', barRoutes)

app.get('/api/v1/test', (req, res) => res.send('Hello World!'))

app.listen(PORT, () => {
	logger.info(`Server is running on port ${PORT}`)
})

export default app
