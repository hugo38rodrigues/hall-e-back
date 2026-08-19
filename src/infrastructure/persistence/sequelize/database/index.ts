import { createDatabase } from '../config/database';
import {LoggerPino} from '../../../pino.logging'

const logger = new LoggerPino()
export const db = await createDatabase(logger)