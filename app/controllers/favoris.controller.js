import { db } from '@hugo38rodrigues/bdd-service-hall-e/main.js'
import { ERROR_SERVER } from '../utils/constants.js'
import { logger } from '../utils/logger.js'

const SENTINELS = {
	USER_NOT_FOUND: Symbol('USER_NOT_FOUND'),
	WRONG_ROLE: Symbol('WRONG_ROLE'),
	SERVER_ERROR: Symbol('SERVER_ERROR'),
}

const VALID_TYPES = ['game', 'league', 'teams', 'barName']

export class FavorisController {
	#formatedFavoriteBarName = (bar) => ({
		id: bar.id,
		name: bar.name,
	})

	/**
	 * Convertit un sentinel (ou une valeur de succès) en réponse HTTP.
	 */
	#sendResult = (res, result) => {
		if (result === SENTINELS.USER_NOT_FOUND) {
			return res.status(404).json({ message: 'Utilisateur introuvable' })
		}
		if (result === SENTINELS.WRONG_ROLE) {
			return res.status(403).json({ message: 'Vous n\'avez pas le bon rôle' })
		}
		if (result === SENTINELS.SERVER_ERROR) {
			return res.status(500).json({ message: ERROR_SERVER })
		}
		return res.status(200).json(result)
	}

	addFavorites = async (req, res) => {
		try {
			const { userId, type, id } = req.body ?? {}

			if (!VALID_TYPES.includes(type)) {
				return res.status(400).json({ message: 'Type de favori invalide' })
			}
			if (userId === undefined || id === undefined) {
				return res.status(400).json({ message: 'userId et id sont requis' })
			}

			let result
			switch (type) {
			case 'game':
				result = await this.addFavorisGameController({ userId, id })
				break
			case 'league':
				result = await this.addFavorisLeagueController({ userId, id })
				break
			case 'teams':
				result = await this.addFavorisTeamController({ userId, id })
				break
			case 'barName':
				result = await this.addFavorisBarNameController({ userId, id })
				break
			default:
				// Inatteignable grâce à la garde VALID_TYPES, mais on garde
				// le cas pour blinder en cas de modif future de la liste.
				return res.status(400).json({ message: 'Type de favori invalide' })
			}

			return this.#sendResult(res, result)
		} catch (error) {
			logger.error(error)
			return res.status(500).json({ message: ERROR_SERVER })
		}
	}

	deleteFavorites = async (req, res) => {
		try {
			const { userId, type, id } = req.body ?? {}

			if (!VALID_TYPES.includes(type)) {
				return res.status(400).json({ message: 'Type de favori invalide' })
			}
			if (userId === undefined || id === undefined) {
				return res.status(400).json({ message: 'userId et id sont requis' })
			}

			let result
			switch (type) {
			case 'game':
				result = await this.deleteFavorisGameController({ userId, id })
				break
			case 'league':
				result = await this.deleteFavorisLeagueController({ userId, id })
				break
			case 'teams':
				result = await this.deleteFavorisTeamController({ userId, id })
				break
			case 'barName':
				result = await this.deleteFavorisBarNameController({ userId, id })
				break
			default:
				return res.status(400).json({ message: 'Type de favori invalide' })
			}

			return this.#sendResult(res, result)
		} catch (error) {
			logger.error(error)
			return res.status(500).json({ message: ERROR_SERVER })
		}
	}

	#getUserRole = async (userId) => {
		const userInstance = await db.user()
		const userDb = await userInstance.getUserById(userId)
		if (!userDb) return { user: null, role: null }
		const role = userDb.dataValues?.role ?? userDb.role ?? null
		return { user: userDb, role }
	}

	#buildTriRoleController = ({ clientMethod, barMethod }) => async ({ userId, id }) => {
		try {
			const { user, role } = await this.#getUserRole(userId)
			if (!user) return SENTINELS.USER_NOT_FOUND

			if (role === 'client') {
				const clientInstance = await db.client()
				return await clientInstance[clientMethod]({ clientId: userId, id })
			}
			if (role === 'bar') {
				const barInstance = await db.bar()
				return await barInstance[barMethod]({ barId: userId, id })
			}
			return SENTINELS.WRONG_ROLE
		} catch (error) {
			logger.error(error)
			return SENTINELS.SERVER_ERROR
		}
	}

	addFavorisGameController = this.#buildTriRoleController({
		clientMethod: 'addFavoriteGame',
		barMethod: 'addFavoriteGame',
	})

	deleteFavorisGameController = this.#buildTriRoleController({
		clientMethod: 'removeFavoriteGame',
		barMethod: 'removeFavoriteGame',
	})

	addFavorisLeagueController = this.#buildTriRoleController({
		clientMethod: 'addFavoriteLeague',
		barMethod: 'addFavoriteLeague',
	})

	deleteFavorisLeagueController = this.#buildTriRoleController({
		clientMethod: 'removeFavoriteLeague',
		barMethod: 'removeFavoriteLeague',
	})

	addFavorisTeamController = this.#buildTriRoleController({
		clientMethod: 'addFavoriteTeam',
		barMethod: 'addFavoriteTeam',
	})

	deleteFavorisTeamController = this.#buildTriRoleController({
		clientMethod: 'removeFavoriteTeam',
		barMethod: 'removeFavoriteTeam',
	})

	addFavorisBarNameController = async ({ userId, id }) => {
		try {
			const { user, role } = await this.#getUserRole(userId)
			if (!user) return SENTINELS.USER_NOT_FOUND
			if (role !== 'client') {
				logger.error('Has the wrong role')
				return SENTINELS.WRONG_ROLE
			}

			const clientInstance = await db.client()
			const bars = await clientInstance.addFavoriteBar({ clientId: userId, barId: id })
			logger.info('SuccessFully add barName favoris')
			return bars.map((bar) => this.#formatedFavoriteBarName(bar))
		} catch (error) {
			logger.error(error)
			return SENTINELS.SERVER_ERROR
		}
	}

	deleteFavorisBarNameController = async ({ userId, id }) => {
		try {
			const { user, role } = await this.#getUserRole(userId)
			if (!user) return SENTINELS.USER_NOT_FOUND
			if (role !== 'client') {
				logger.error('Has the wrong role')
				return SENTINELS.WRONG_ROLE
			}

			const clientInstance = await db.client()
			const bars = await clientInstance.removeFavoriteBar({ clientId: userId, barId: id })
			logger.info('SuccessFully delete barName favoris')
			return bars.map((bar) => this.#formatedFavoriteBarName(bar))
		} catch (error) {
			logger.error(error)
			return SENTINELS.SERVER_ERROR
		}
	}
}
