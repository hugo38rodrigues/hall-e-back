import app from './index.js'
import { Logger } from './midleware/logger.js'

const newLogger = new Logger()
const PORT = process.env.PORT
const server = app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`)
})

process.on('SIGTERM', async () => {
	server.close(async () => {
		try {
			await (await import('mongoose')).default.disconnect()
		} catch (error){ newLogger.error(error)}
		process.exit(0)
	})
})