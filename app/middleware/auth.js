import { Crypt } from '../controllers/encryption.controller.js'
import Logger from './logger.js'

export class Auth {
	constructor() {
		this.encrypt = new Crypt()
		this.logger = new Logger()
	}

	// eslint-disable-next-line consistent-return
	verifyAccount = async (req, res, next) => {
		const authHeader = req.headers.authorization
		if (!authHeader || !authHeader.startsWith('Bearer ')) {
			this.logger.error('Token manquant ou invalide')
			return res.status(401).json({ message: 'Token manquant ou invalide' })
		}

		const token = authHeader.split(' ')[1]

		try {
			const verifyToken = await this.encrypt.verifyToken(token)

			if (!verifyToken) {
				this.logger.error('Ce token est trop ancien')
				return res.status(401).json({ message: 'Ce token est trop ancien' })
			}

			next()
		} catch (err) {
			this.logger.error('Erreur de vérification du token :', err)
			return res.status(401).json({ message: 'Ce token est trop ancien' })
		}
	}
}
