// logger.js
import winston from 'winston'

const { combine, timestamp, printf, errors, splat, json } = winston.format

const customFormat = printf(({ level, message, timestamp }) => {
	// On gère ici les objets (message peut être un string ou un objet)
	const msg = typeof message === 'object' ? JSON.stringify(message, null, 2) : message

	return `[${timestamp}] ${level.toUpperCase()}: ${msg}`
})

export class Logger {
	constructor (context = '') {
		this.logger = winston.createLogger({
			level: 'info',
			format: combine(
				errors({ stack: true }), // pour logger les erreurs avec stack trace
				splat(), // pour les logs avec format style printf()
				timestamp(),
				json(), // pour assurer la sérialisation
				customFormat
			),
			transports: [
				new winston.transports.Console()
			],
		})

		this.context = context
	}

	log (level, message, meta = {}) {
		this.logger.log(level, message, meta)
	}

	info (message, meta = {}) {
		this.logger.info(message, meta)
	}

	error (message, meta = {}) {
		this.logger.error(message, meta)
	}

	warn (message, meta = {}) {
		this.logger.warn(message, meta)
	}

	debug (message, meta = {}) {
		this.logger.debug(message, meta)
	}
}
