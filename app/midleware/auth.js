import { Crypt } from '../controllers/encryption.controller.js'

export class Auth {
	constructor () {
		this.encrypt = new Crypt()
	}

	verifyAccount = async (req, res, next) => {
		const authHeader = req.headers['authorization']
		if (!authHeader || !authHeader.startsWith('Bearer ')) {
			return res.status(401).json({ message: 'Token manquant ou invalide' })
		}

		const token = authHeader.split(' ')[1]

		try {
			const verifyToken = await this.encrypt.verifyToken(token)

			if (!verifyToken) {
				return res.status(401).json({ message: 'Ce token est trop ancien' })
			}

			next()
		} catch (err) {
			console.error('Erreur de vérification du token :', err)
			return res.status(401).json({ message: 'Ce token est trop ancien' })
		}
	}
}
