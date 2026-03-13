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
		})

	addFavorites = async (req, res) => {
		try {
			const {
				idUser, favorisType, idBarName, idGame, idLeague, idTeam,
			} = req.body
			let addFavoris

			switch (favorisType) {
			case 'gameName':
				addFavoris = await this.addFavorisGameController(idUser, idGame)
				break
			case 'leagueName':
				addFavoris = await this.addFavorisLeagueController(idUser, idLeague)
				break
			case 'teams':
				addFavoris = await this.addFavorisTeamController(idUser, idTeam)
				break
			case 'barName':
				addFavoris = await this.addFavorisBarNameController(idUser, idBarName)
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
			const { favorisType, idUser, data } = req.body
			let deleteFavoris
			switch (favorisType) {
			case 'game':
				deleteFavoris = await this.deleteFavorisGameController(idUser, data)
				break
			case 'league':
				deleteFavoris = await this.deleteFavorisLeagueController(idUser, data)
				break
			case 'teams':
				deleteFavoris = await this.deleteFavorisTeamController(idUser, data)
				break
			case 'bar':
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

	addFavorisGameController = async (idUser, gameId) => {
		try {
			const userInstance = await db.user()
			const barInstance = await db.bar()
			const clientInstance = await db.client()
			const userDb = await userInstance.getUserById(idUser)
			let addGame

			if (userDb.dataValues.role === 'client') {
				addGame = await clientInstance.addFavoriteGame({ clientId: idUser, gameId })
			} else if (userDb.dataValues.role === 'bar') {
				addGame = await barInstance.addFavoriteGame({ barId: idUser, gameId })
			} else {
				return undefined
			}

			return addGame
		} catch (error) {
			this.newLogger.error(error)
			return ERROR_SERVER
		}
	}

	deleteFavorisGameController = async (idUser, gameId) => {
		try {
			const userInstance = await db.user()
			const barInstance = await db.bar()
			const clientInstance = await db.client()
			const userDb = await userInstance.getUserById(idUser)
			let removeGame

			if (userDb.dataValues.role === 'client') {
				removeGame = await clientInstance.removeFavoriteGame({ clientId: idUser, gameId })
			} else if (userDb.dataValues.role === 'bar') {
				removeGame = await barInstance.removeFavoriteGame({ barId: idUser, gameId })
			} else {
				return undefined
			}

			return removeGame
		} catch (error) {
			this.newLogger.error(error)
			return ERROR_SERVER
		}
	}

	addFavorisLeagueController = async (idUser, leagueId) => {
		try {
			const userInstance = await db.user()
			const barInstance = await db.bar()
			const clientInstance = await db.client()
			const userDb = await userInstance.getUserById(idUser)
			let addLeague

			if (userDb.dataValues.role === 'client') {
				addLeague = await clientInstance.addFavoriteLeague({ clientId: idUser, leagueId })
			} else if (userDb.dataValues.role === 'bar') {
				addLeague = await barInstance.addFavoriteLeague({ barId: idUser, leagueId })
			} else {
				return undefined
			}

			return addLeague
		} catch (error) {
			this.newLogger.error(error)
			return ERROR_SERVER
		}
	}

	deleteFavorisLeagueController = async (idUser, leagueId) => {
		try {
			const userInstance = await db.user()
			const barInstance = await db.bar()
			const clientInstance = await db.client()
			const userDb = await userInstance.getUserById(idUser)
			let removeLeague

			if (userDb.dataValues.role === 'client') {
				removeLeague = await clientInstance.removeFavoriteLeague({ clientId: idUser, leagueId })
			} else if (userDb.dataValues.role === 'bar') {
				removeLeague = await barInstance.removeFavoriteLeague({ barId: idUser, leagueId })
			} else {
				return undefined
			}

			return removeLeague
		} catch (error) {
			this.newLogger.error(error)
			return ERROR_SERVER
		}
	}

	addFavorisTeamController = async (idUser, teamId) => {
		try {
			const userInstance = await db.user()
			const barInstance = await db.bar()
			const clientInstance = await db.client()
			const userDb = await userInstance.getUserById(idUser)
			let addTeam

			if (userDb.dataValues.role === 'client') {
				addTeam = await clientInstance.addFavoriteTeam({ clientId: idUser, teamId })
			} else if (userDb.dataValues.role === 'bar') {
				addTeam = await barInstance.addFavoriteTeam({ barId: idUser, teamId })
			} else {
				return undefined
			}

			return addTeam
		} catch (error) {
			this.newLogger.error(error)
			return ERROR_SERVER
		}
	}

	deleteFavorisTeamController = async (idUser, teamId) => {
		try {
			const userInstance = await db.user()
			const barInstance = await db.bar()
			const clientInstance = await db.client()
			const userDb = await userInstance.getUserById(idUser)
			let removeTeam

			if (userDb.dataValues.role === 'client') {
				removeTeam = await clientInstance.removeFavoriteTeam({ clientId: idUser, teamId })
			} else if (userDb.dataValues.role === 'bar') {
				removeTeam = await barInstance.removeFavoriteTeam({ barId: idUser, teamId })
			} else {
				return undefined
			}

			return removeTeam
		} catch (error) {
			this.newLogger.error(error)
			return ERROR_SERVER
		}
	}

	addFavorisBarNameController = async (idUser, idBar) => {
		try {
			const userInstance = await db.user()
			const clientInstance = await db.client()

			const userInDb = await userInstance.getUserById(idUser)

			if (userInDb.dataValues.role !== 'client') {
				this.newLogger.error('Has the wrong role')
				return 1
			}
			const addBarName = await clientInstance.addFavoriteBar({ clientId: idUser, barId: idBar })
			const formatedBarName = addBarName.map((bars) => this.#formatedFavoriteBarName(bars))
			return { barName: formatedBarName }
		} catch (error) {
			this.newLogger.error(error)
			return ERROR_SERVER
		}
	}

	deleteFavorisBarNameController = async (idUser, idBar) => {
		try {
			const userInstance = await db.user()

			const userInDb = await userInstance.getUserById(idUser)

			if (userInDb.role !== 'client') {
				this.newLogger.error('Has the wrong role')
				return 1
			}
			const deleteBarName = await userInstance.removeFavoriteBar({ clientId: idUser, barId: idBar })

			return deleteBarName
		} catch (error) {
			this.newLogger.error(error)
			return ERROR_SERVER
		}
	}
}
