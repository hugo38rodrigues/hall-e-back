import bcrypt from 'bcrypt'
import { readFile } from 'fs/promises'
import jwt from 'jsonwebtoken'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

export class Crypt {
	#jwtSecret

	constructor () {
		this.#jwtSecret = this.#configToken()
	}

	#configToken = () => {
		const __filename = fileURLToPath(import.meta.url)
		const __dirname = dirname(__filename)
		const parentDir = join(__dirname, '..')
		const jwtSecret = join(parentDir, '/secret.key')
		return jwtSecret
	}

	tokenCreation = async (id, email) => {
		const JWT_SECRET = await readFile(this.#jwtSecret, 'utf8') // Assurez-vous que le chemin est correct

		const accessToken = jwt.sign({ id, email }, JWT_SECRET, {
			algorithm: 'HS256',
			expiresIn: '1h',
		})
		return accessToken
	}

	passwordEncrypt = (password) => {
		const encryptPassword = bcrypt.hashSync(password, 10)
		return encryptPassword
	}

	verifyToken = async (token)  => {
		try {
			const JWT_SECRET = await readFile(this.#jwtSecret, 'utf8')
			const decoded = jwt.verify(
				token,
				JWT_SECRET,
				{ algorithms: ['HS256'] } // Spécifiez l'algorithme ici
			)
			return decoded // Retournez les données décodées si le token est valide
			
		} catch (err) {
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
