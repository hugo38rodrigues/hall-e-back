import jwt from 'jsonwebtoken'
import { logger } from '../utils/logger.js'

export class TokenService {
	constructor() {
		this.jwtSecret = process.env.SECRET_JWT_KEY
		if (!this.jwtSecret) {
			throw new Error('SECRET_JWT_KEY is not defined in environment variables')
		}
	}

	getIdFromAuthHeader = (authHeader) => {
		const token = this.#extractToken(authHeader)
		if (!token) return null
		const payload = this.#verifyToken(token)
		return payload?.id ?? null
	}

	/**
	 * Crée un access token Jwt signé.
	 */
	tokenCreation = (id, email) => jwt.sign({ id, email }, this.jwtSecret, {
		algorithm: 'HS256',
		expiresIn: '1h',
	})

	/**
	 * Extrait le token brut depuis un header "Bearer xxx".
	 * Retourne null si le header est absent ou mal formé.
	 */
	#extractToken = (authHeader) => {
		if (!authHeader || !authHeader.startsWith('Bearer ')) return null
		const token = authHeader.slice(7).trim()
		return token || null
	}

	/**
	 * Vérifie et décode un token. Retourne le payload ou null.
	 */
	#verifyToken = (token) => {
		try {
			return jwt.verify(token, this.jwtSecret, { algorithms: ['HS256'] })
		} catch (err) {
			logger.error('Token validation failed:', err.message)
			return null
		}
	}

	validationTokenAccess = async (req, res, next) => {
		const token = this.#extractToken(req.headers.authorization)
		if (!token) {
			logger.error('Token manquant ou mal formé')
			return res.status(401).json({ message: 'Token manquant ou invalide' })
		}

		const payload = this.#verifyToken(token)
		if (!payload) {
			return res.status(401).json({ message: 'Token invalide ou expiré' })
		}

		if (!payload.id) {
			logger.error('ID manquant dans le token')
			return res.status(401).json({ message: 'ID manquant dans le token' })
		}
		req.user = payload
		return next()
	}
}
