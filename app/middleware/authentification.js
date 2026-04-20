import { db } from '@hugo38rodrigues/bdd-service-hall-e-test'
import jwt from 'jsonwebtoken'
import Logger from '../utils/logger.js'

export class Authentification {
	constructor() {
		this.logger = new Logger()
		this.jwtSecret = process.env.SECRET_JWT_KEY
		this.userInstance = db.user()

		if (!this.jwtSecret) {
			throw new Error('SECRET_JWT_KEY is not defined in environment variables')
		}
	}

	/**
	 * Crée un access token JWT signé.
	 */
	tokenCreation = (id, email) => jwt.sign({ id, email }, this.jwtSecret, {
		algorithm: 'HS256',
		expiresIn: '1h',
	})

	/**
	 * Extrait le token brut depuis un header "Bearer xxx".
	 * Retourne null si le header est absent ou mal formé.
	 */
	extractToken = (authHeader) => {
		if (!authHeader || !authHeader.startsWith('Bearer ')) return null
		const token = authHeader.slice(7).trim()
		return token || null
	}

	/**
	 * Vérifie et décode un token. Retourne le payload ou null.
	 * Ne touche pas à la réponse HTTP : c'est au middleware de décider.
	 */
	verifyToken = (token) => {
		try {
			return jwt.verify(token, this.jwtSecret, { algorithms: ['HS256'] })
		} catch (err) {
			this.logger.error('Token validation failed:', err.message)
			return null
		}
	}

	/**
	 * Extrait l'id depuis un header "Bearer xxx" en validant la signature.
	 */
	getIdFromAuthHeader = (authHeader) => {
		const token = this.extractToken(authHeader)
		if (!token) return null
		const payload = this.verifyToken(token)
		return payload?.id ?? null
	}

	/**
	 * Middleware : vérifie que le token est présent, valide et non expiré.
	 * Attache le payload décodé à req.user.
	 */
	verifyTokenMiddleware = async (req, res, next) => {
		const token = this.extractToken(req.headers.authorization)
		if (!token) {
			this.logger.error('Token manquant ou mal formé')
			return res.status(401).json({ message: 'Token manquant ou invalide' })
		}

		const payload = this.verifyToken(token)
		if (!payload) {
			return res.status(401).json({ message: 'Token invalide ou expiré' })
		}

		if (!payload.id) {
			this.logger.error('ID manquant dans le token')
			return res.status(401).json({ message: 'ID manquant dans le token' })
		}

		req.user = payload
		return next()
	}

	/**
	 * renvoie un middleware qui vérifie un rôle donné.
	 */
	requireRole = (role) => async (req, res, next) => {
		try {
			if (!req.user?.id) {
				this.logger.error('req.user manquant — verifyTokenMiddleware a-t-il été appelé avant ?')
				return res.status(401).json({ message: 'Non authentifié' })
			}

			const profil = await this.userInstance.getUserById(req.user.id)

			if (!profil) {
				this.logger.error(`Utilisateur introuvable (id=${req.user.id})`)
				return res.status(404).json({ message: 'Utilisateur introuvable' })
			}

			if (profil.role !== role) {
				this.logger.error(`Accès refusé : rôle "${profil.role}" au lieu de "${role}"`)
				return res.status(403).json({ message: 'Accès refusé : rôle non autorisé' })
			}

			req.profil = profil
			return next()
		} catch (err) {
			this.logger.error('Erreur lors de la vérification du rôle :', err.message)
			return res.status(500).json({ message: 'Erreur interne' })
		}
	}
}
