import { db } from '@hugo38rodrigues/bdd-service-hall-e/main.js'
import Logger from '../middleware/logger.js'
import { ERROR_SERVER } from '../utils/constants.js'

export class FavorisController {
	constructor() {
		this.newLogger = new Logger()
	}

	addFavorites = async (req, res) => {
		try {
			const { type, idUser, data } = req.body
			let addFavoris
			switch (type) {
			case 'gameName':
				addFavoris = await this.addFavorisGameController(idUser, data, type)
				break
			case 'leagueName':
				addFavoris = await this.addFavorisLeagueController(idUser, data, type)
				break
			case 'teams':
				addFavoris = await this.addFavorisTeamController(idUser, data, type)
				break
			case 'barName':
				addFavoris = await this.addFavorisBarNameController(idUser, data, type)
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
			const { type, idUser, data } = req.body
			let deleteFavoris
			switch (type) {
			case 'gameName':
				deleteFavoris = await this.deleteFavorisGameController(idUser, data)
				break
			case 'leagueName':
				deleteFavoris = await this.deleteFavorisLeagueController(idUser, data)
				break
			case 'teams':
				deleteFavoris = await this.deleteFavorisTeamController(idUser, data)
				break
			case 'barName':
				deleteFavoris = await this.deleteFavorisBarNameController(idUser, data)
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

	addFavorisGameController = async (idUser, gameName, type) => {
		try {
			const userInstance = await db.usersInstances()

			const addGame = await userInstance.addFavoriteGame(idUser, gameName, type)

			return addGame
		} catch (error) {
			this.newLogger.error(error)
			return ERROR_SERVER
		}
	}

	deleteFavorisGameController = async (idUser, gameName, type) => {
		try {
			const userInstance = await db.usersInstances()

			const deletedGame = await userInstance.removeFavoriteGame(idUser, gameName, type)

			return deletedGame
		} catch (error) {
			this.newLogger.error(error)
			return ERROR_SERVER
		}
	}

	addFavorisLeagueController = async (idUser, leagueName, type) => {
		try {
			const userInstance = await db.usersInstances()

			const addLeague = await userInstance.addFavoriteLeague(idUser, leagueName, type)

			return addLeague
		} catch (error) {
			this.newLogger.error(error)
			return ERROR_SERVER
		}
	}

	deleteFavorisLeagueController = async (idUser, leagueName, type) => {
		try {
			const userInstance = await db.usersInstances()

			const deleteLeague = await userInstance.removeFavoriteLeague(idUser, leagueName, type)

			return deleteLeague
		} catch (error) {
			this.newLogger.error(error)
			return ERROR_SERVER
		}
	}

	addFavorisTeamController = async (idUser, idTeam, type) => {
		try {
			const userInstance = await db.usersInstances()

			return await userInstance.addFavoriteTeam(idUser, idTeam, type)
		} catch (error) {
			this.newLogger.error(error)
			return ERROR_SERVER
		}
	}

	deleteFavorisTeamController = async (idUser, idTeam, type) => {
		try {
			const userInstance = await db.usersInstances()

			const deleteTeam = await userInstance.removeFavoriteTeam(idUser, idTeam, type)

			return deleteTeam
		} catch (error) {
			this.newLogger.error(error)
			return ERROR_SERVER
		}
	}

	addFavorisBarNameController = async (idUser, idBar, type) => {
		try {
			const userInstance = await db.usersInstances()

			const userInDb = await userInstance.getUserById(idUser)

			if (userInDb.role !== 'client') {
				this.newLogger.error('Has the wrong role')
				return 1
			}
			const addBarName = await userInstance.addFavoriteBar(idUser, idBar, type)

			return addBarName
		} catch (error) {
			this.newLogger.error(error)
			return ERROR_SERVER
		}
	}

	deleteFavorisBarNameController = async (idUser, idBar, type) => {
		try {
			const userInstance = await db.usersInstances()

			const userInDb = await userInstance.getUserById(idUser)

			if (userInDb.role !== 'client') {
				this.newLogger.error('Has the wrong role')
				return 1
			}
			const deleteBarName = await userInstance.removeFavoriteBar(idUser, idBar, type)

			return deleteBarName
		} catch (error) {
			this.newLogger.error(error)
			return ERROR_SERVER
		}
	}
}
