import { Crypt } from '../controllers/encryption.controller.js'

export class Auth {
	constructor () {
		this.encrypt = new Crypt()
	}

	verifyAccount = (req, res, next) => {
		const authHeader = req.headers['authorization']
		 if (!authHeader || !authHeader.startsWith('Bearer ')) {
				return res.status(401).json({ message: 'Token manquant ou invalide' })
			}
		const token = authHeader.split(' ')[1]
		const verifyToken = this.encrypt.verifyToken(token)

		if (!verifyToken) {
			return res.status(401).json({ message: 'This token is obsolete' })
		}

		next()
	}
	
}
