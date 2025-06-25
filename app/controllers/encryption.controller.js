import bcryptjs from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { Logger } from '../midleware/logger.js'


export class Crypt {
	#jwtSecret

	constructor () {
		this.#jwtSecret = process.env.SECRET_JWT_KEY
		this.newLogger = new Logger()
	}

	tokenCreation = async (id, email) => {
	// Assurez-vous que le chemin est correct

		const accessToken = jwt.sign({ id, email }, this.#jwtSecret, {
			algorithm: 'HS256',
			expiresIn: '1h',
		})
		return accessToken
	}

	passwordEncrypt = (password) => {
		const encryptPassword = bcryptjs.hashSync(password, 10)
		return encryptPassword
	}

	verifyToken = async (token)  => {
		try {
			const decoded = jwt.verify(
				token,
				this.#jwtSecret,
				{ algorithms: ['HS256'] } // Spécifiez l'algorithme ici
			)
			return decoded // Retournez les données décodées si le token est valide
			
		} catch (err) {
			this.newLogger.error('Token validation failed:', err.message)
			console.error('Token validation failed:', err.message)
			return false
		}
	}

	generetedCode = () => {
		const codeNumber = Math.floor(100000 + Math.random() * 900000).toString() // 6 chiffres
		const expiresIn = Date.now() + 10 * 60 * 1000 // Expiration dans 5 minutes
		return { codeNumber, expiresIn }
	}

	
}
