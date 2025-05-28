import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

export class Logger {
	constructor() {
    
    
    const { combine, timestamp, printf, errors } = winston.format;
    
    // Format de log personnalisé
    const logFormat = printf(({ level, message, timestamp, stack }) => {
      return `${timestamp} [${level}]: ${message} ${stack ? '\n' + stack : ''}`;
    });
    
    // Créer le logger avec des logs rotatifs
    this.logger = winston.createLogger({
      level: 'info',  // Le niveau de log par défaut
      format: combine(
        timestamp(),
        errors({ stack: true }), // Inclure la pile des erreurs dans les logs
        logFormat
      ),
      transports: [
        new winston.transports.Console({
          level: 'info',  // Afficher les logs d'information sur la console
          format: combine(
            timestamp(),
            winston.format.simple()  // Format simple pour la console
          )
        }),
        new DailyRotateFile({
          filename: 'logs/%DATE%-combined.log', // Nom des fichiers de logs combinés
          datePattern: 'YYYY-MM-DD',
          level: 'info', // Niveau d'information à enregistrer dans ces logs
          maxFiles: '14d', // Garde les logs pendant 14 jours
        }),
        new DailyRotateFile({
          filename: 'logs/%DATE%-error.log', // Fichier pour les erreurs
          datePattern: 'YYYY-MM-DD',
          level: 'error', // Enregistrer seulement les erreurs dans ce fichier
          maxFiles: '14d', // Garde les logs d'erreurs pendant 14 jours
        })
      ]
    });
  }

  logRequest = (req, res, next) => {
    this.logger.info(`Received ${req.method} request at ${req.originalUrl}`);
    next();
  }

    // Middleware pour loguer les erreurs
  logError = (err, req, res, next) => {
    this.logger.error(`Error occurred at ${req.originalUrl}: ${err.message}`);
  }
}