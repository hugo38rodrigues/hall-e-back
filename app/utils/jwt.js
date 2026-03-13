import jwt from 'jsonwebtoken'

const jwtSecret = process.env.SECRET_JWT_KEY

export const tokenCreation = async (id, email) => {
	const accessToken = jwt.sign({ id, email }, jwtSecret, {
		algorithm: 'HS256',
		expiresIn: '1h',
	})
	return accessToken
}

export const getIdInToken = (token) => {
	try {
		if (!token) {
			throw new Error('Token manquant')
		}

		const clearToken = token.split(' ')[1]

		if (!clearToken) {
			throw new Error('Format de token invalide')
		}

		const decoded = jwt.decode(clearToken)

		if (!decoded || !decoded.id) {
			throw new Error('Token invalide ou id manquant')
		}

		return decoded.id
	} catch (error) {
		this.newLogger('Erreur lors du décodage du token:', error.message)
		return null
	}
}

export const verifyToken = async (token) => {
	try {
		const decoded = jwt.verify(
			token,
			jwtSecret,
			{ algorithms: ['HS256'] },
		)
		return decoded
	} catch (err) {
		this.newLogger.error('Token validation failed:', err.message)
		return false
	}
}
