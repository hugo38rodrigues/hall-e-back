import { db } from '@hugo38rodrigues/bdd-service-hall-e'
import cors from 'cors'
import express from 'express'
import barRoutes from './routes/bar.route.js'
import communRoutes from './routes/commun.route.js'

import Logger from './utils/logger.js'
const logger = new Logger('Server')
const app = express()
const { PORT } = process.env

app.use(cors())
app.disable('x-powered-by')
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

try {
	const isValidHealth = await db.health()
	if (isValidHealth) {
		logger.info('DB connected')
	}
} catch (error) {
	logger.error('Error Health check', { error })
}

app.get('/dbcheck', async (_req, res) => {
	const { ok, error } = await db.health()
	logger.info(ok)
	if (ok) {
		return res.status(200).json({ ok, error })
	}
	return res.status(500).json({ ok, error })
})

app.use('/api/v1', communRoutes)
app.use('/api/v1/bar', barRoutes)

app.get('/api/v1/test', (_req, res) => res.send('Hello World!'))

app.listen(PORT, () => {
	logger.info(`Server is running on port ${PORT}`)
})
