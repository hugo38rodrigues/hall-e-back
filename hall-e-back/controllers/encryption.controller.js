import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { readFile } from 'fs/promises'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

export class Crypt {
	constructor () {}

	tokenCreation = async (id, email) => {

		const __filename = fileURLToPath(import.meta.url)

		// Obtenir le répertoire du fichier
		const __dirname = dirname(__filename)
		const parentDir = join(__dirname, '..')
		const jwtSecret = join(parentDir, '/secrete.key') 

		const JWT_SECRET = await readFile(jwtSecret, 'utf8') // Assurez-vous que le chemin est correct
	
		const accessToken = jwt.sign(
			{ id, email },
			JWT_SECRET,
			{
				expiresIn: Math.floor(Date.now() / 1000) + 60 * 60,
			},
			{ algorithm: 'RS256' }
		)
		return accessToken
	}

	passwordEncrypt = (password) => {
		const encryptPassword = bcrypt.hashSync(password, 10)
		return encryptPassword
	}
}
