import { db } from '@hugo38rodrigues/bdd-service-hall-e/main.js'
import Logger from '../middleware/logger.js'
import { ERROR_SERVER } from '../utils/constants.js'

export class FavorisController {
	constructor() {
		this.newLogger = new Logger()
	}

	#formatedFavoriteBarName = (bar) => (
		{
			id: bar.id,
			name: bar.name,
		}
	)

	addFavorites = async (req, res) => {
		try {
			const {
				userId, type, id,
			} = req.body
			let addFavoris

			switch (type) {
			case 'game':
				addFavoris = await this.addFavorisGameController({ userId, id })
				break
			case 'league':
				addFavoris = await this.addFavorisLeagueController({ userId, id })
				break
			case 'teams':
				addFavoris = await this.addFavorisTeamController({ userId, id })
				break
			case 'barName':
				addFavoris = await this.addFavorisBarNameController({ userId, id })
				break
			default:
				return res.status(401).json({ message: 'Erreur dans la requete' })
			}

			if (addFavoris === 1) {
				return res.status(500).json({ message: 'Vous n\'avez pas le bon rôle' })
			}

			if (addFavoris === ERROR_SERVER) {
				return res.status(500).json({ message: ERROR_SERVER })
			}

			if (addFavoris === undefined) {
				return res.status(401).json({ message: 'Utilisateur introuvable' })
			}

			return res.status(200).json(addFavoris)
		} catch (error) {
			this.newLogger.error(error)
			return res.status(500).json({ message: ERROR_SERVER })
		}
	}

	deleteFavorites = async (req, res) => {
		try {
			const { type, userId, id } = req.body
			let deleteFavoris
			switch (type) {
			case 'game':
				deleteFavoris = await this.deleteFavorisGameController({ userId, id })
				break
			case 'league':
				deleteFavoris = await this.deleteFavorisLeagueController({ userId, id })
				break
			case 'teams':
				deleteFavoris = await this.deleteFavorisTeamController({ userId, id })
				break
			case 'barName':
				deleteFavoris = await this.deleteFavorisBarNameController({ userId, id })
				break
			default:
				return res.status(401).json({ message: 'Erreur dans la requete' })
			}

			if (deleteFavoris === ERROR_SERVER) {
				return res.status(500).json({ message: ERROR_SERVER })
			}
			if (deleteFavoris === 1) {
				return res.status(500).json({ message: 'Vous n\'avez pas le bon rôle' })
			}

			return res.status(200).json(deleteFavoris)
		} catch (error) {
			this.newLogger.error(error)
			return res.status(500).json({ message: ERROR_SERVER })
		}
	}

	addFavorisGameController = async ({ userId, id }) => {
		try {
			const userInstance = await db.user()
			const barInstance = await db.bar()
			const clientInstance = await db.client()
			const userDb = await userInstance.getUserById(userId)
			let addGame

			if (userDb.dataValues.role === 'client') {
				addGame = await clientInstance.addFavoriteGame({ clientId: userId, id })
			} else if (userDb.dataValues.role === 'bar') {
				addGame = await barInstance.addFavoriteGame({ barId: userId, id })
			} else {
				return undefined
			}

			return addGame
		} catch (error) {
			this.newLogger.error(error)
			return ERROR_SERVER
		}
	}

	deleteFavorisGameController = async ({ userId, id }) => {
		try {
			const userInstance = await db.user()
			const barInstance = await db.bar()
			const clientInstance = await db.client()
			const userDb = await userInstance.getUserById(userId)
			let removeGame

			if (userDb.dataValues.role === 'client') {
				removeGame = await clientInstance.removeFavoriteGame({ clientId: userId, id })
			} else if (userDb.dataValues.role === 'bar') {
				removeGame = await barInstance.removeFavoriteGame({ barId: userId, id })
			} else {
				return undefined
			}

			return removeGame
		} catch (error) {
			this.newLogger.error(error)
			return ERROR_SERVER
		}
	}

	addFavorisLeagueController = async ({ userId, id }) => {
		try {
			const userInstance = await db.user()
			const barInstance = await db.bar()
			const clientInstance = await db.client()
			const userDb = await userInstance.getUserById(userId)
			let addLeague

			if (userDb.dataValues.role === 'client') {
				addLeague = await clientInstance.addFavoriteLeague({ clientId: userId, id })
			} else if (userDb.dataValues.role === 'bar') {
				addLeague = await barInstance.addFavoriteLeague({ barId: userId, id })
			} else {
				return undefined
			}

			return addLeague
		} catch (error) {
			this.newLogger.error(error)
			return ERROR_SERVER
		}
	}

	deleteFavorisLeagueController = async ({ userId, id }) => {
		try {
			const userInstance = await db.user()
			const barInstance = await db.bar()
			const clientInstance = await db.client()
			const userDb = await userInstance.getUserById(userId)
			let removeLeague

			if (userDb.dataValues.role === 'client') {
				removeLeague = await clientInstance.removeFavoriteLeague({ clientId: userId, id })
			} else if (userDb.dataValues.role === 'bar') {
				removeLeague = await barInstance.removeFavoriteLeague({ barId: userId, id })
			} else {
				return undefined
			}

			return removeLeague
		} catch (error) {
			this.newLogger.error(error)
			return ERROR_SERVER
		}
	}

	addFavorisTeamController = async ({ userId, id }) => {
		try {
			const userInstance = await db.user()
			const barInstance = await db.bar()
			const clientInstance = await db.client()
			const userDb = await userInstance.getUserById(userId)
			let addTeam

			if (userDb.dataValues.role === 'client') {
				addTeam = await clientInstance.addFavoriteTeam({ clientId: userId, id })
			} else if (userDb.dataValues.role === 'bar') {
				addTeam = await barInstance.addFavoriteTeam({ barId: userId, id })
			} else {
				return undefined
			}

			return addTeam
		} catch (error) {
			this.newLogger.error(error)
			return ERROR_SERVER
		}
	}

	deleteFavorisTeamController = async ({ userId, id }) => {
		try {
			const userInstance = await db.user()
			const barInstance = await db.bar()
			const clientInstance = await db.client()
			const userDb = await userInstance.getUserById(userId)
			let removeTeam

			if (userDb.dataValues.role === 'client') {
				removeTeam = await clientInstance.removeFavoriteTeam({ clientId: userId, id })
			} else if (userDb.dataValues.role === 'bar') {
				removeTeam = await barInstance.removeFavoriteTeam({ barId: userId, id })
			} else {
				return undefined
			}

			return removeTeam
		} catch (error) {
			this.newLogger.error(error)
			return ERROR_SERVER
		}
	}

	addFavorisBarNameController = async ({ userId, id }) => {
		try {
			const userInstance = await db.user()
			const clientInstance = await db.client()

			const userInDb = await userInstance.getUserById(userId)

			if (userInDb.dataValues.role !== 'client') {
				this.newLogger.error('Has the wrong role')
				return 1
			}
			const addBarName = await clientInstance.addFavoriteBar({ clientId: userId, barId: id })
			const formatedBarName = addBarName.map((bars) => this.#formatedFavoriteBarName(bars))
			return { barName: formatedBarName }
		} catch (error) {
			this.newLogger.error(error)
			return ERROR_SERVER
		}
	}

	deleteFavorisBarNameController = async ({ userId, id }) => {
		try {
			const userInstance = await db.user()
			const clientInstance = await db.client()

			const userInDb = await userInstance.getUserById(userId)

			if (userInDb.role !== 'client') {
				this.newLogger.error('Has the wrong role')
				return 1
			}
			const deleteBarName = await clientInstance.removeFavoriteBar({ clientId: userId, barId: id })

			return deleteBarName
		} catch (error) {
			this.newLogger.error(error)
			return ERROR_SERVER
		}
	}
}
