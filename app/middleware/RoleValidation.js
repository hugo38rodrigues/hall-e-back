import { db } from '@hugo38rodrigues/bdd-service-hall-e/main.js'
import { logger } from '../utils/logger.js'

const ALLOWED_CLIENT_OR_BAR = ['bar', 'client']

export class RoleValidation {
	#fetchProfil = async (userId) => {
		const userInstance = await db.user()
		return userInstance.getUserById(userId)
	}

	requireClientOrBar = async (req, res, next) => {
		try {
			const profil = await this.#fetchProfil(req.user.id)

			if (!profil) {
				logger.error(`Utilisateur introuvable (id=${req.user.id})`)
				return res.status(404).json({ message: 'Utilisateur introuvable' })
			}

			if (!ALLOWED_CLIENT_OR_BAR.includes(profil.role)) {
				logger.error(`Accès refusé : rôle "${profil.role}" non autorisé`)
				return res.status(403).json({ message: 'Accès refusé : rôle non autorisé' })
			}

			req.profil = profil
			return next()
		} catch (err) {
			logger.error(`Erreur lors de la vérification du rôle : ${err.message}`)
			return res.status(500).json({ message: 'Erreur interne' })
		}
	}

	requireRole = (role) => async (req, res, next) => {
		try {
			const profil = await this.#fetchProfil(req.user.id)

			if (!profil) {
				logger.error(`Utilisateur introuvable (id=${req.user.id})`)
				return res.status(404).json({ message: 'Utilisateur introuvable' })
			}

			if (profil.role !== role) {
				logger.error(`Accès refusé : rôle "${profil.role}" au lieu de "${role}"`)
				return res.status(403).json({ message: 'Accès refusé : rôle non autorisé' })
			}

			req.profil = profil
			return next()
		} catch (err) {
			logger.error(`Erreur lors de la vérification du rôle : ${err.message}`)
			return res.status(500).json({ message: 'Erreur interne' })
		}
	}
}
