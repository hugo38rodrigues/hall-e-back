// eslint-disable-next-line import/no-extraneous-dependencies
import type { Logger as PinoLogger} from 'pino';
import {pino} from 'pino'
import type { Logger } from '../shared/logger'

export class LoggerPino implements Logger{
	private logger: PinoLogger

	constructor(){
		const isDev = process.env.NODE_ENV === 'dev'
		this.logger = pino({
			level: process.env.LOG_LEVEL || 'info', // Niveau minimum
			...(isDev && {transport: {
				target: 'pino-pretty', // Pour un affichage lisible
				options: {
					colorize: true,
					translateTime: 'SYS:standard',
				},
			}})
		})
	}
	info(msg: string, meta?: string): void {
		return this.logger.info(meta ?? {}, msg)
	}
	warn(msg: string, meta?: string): void {
		return this.logger.warn(meta ?? {}, msg)
	}
	error(msg: string, meta?: string): void {
		return this.logger.error(meta ?? {}, msg)
	}
	debug?(msg: string, meta?: string): void {
		return this.logger.debug(meta ?? {}, msg)
	}

}


