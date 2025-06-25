import { databaseFactory } from '@hugo38rodrigues/bdd-service-hall-e/main.js'
import { Logger } from '../midleware/logger.js'
import {
	errorServer
} from '../utils/messages.js'


export class FavorisController {
	constructor () {
		this.newLogger = new Logger()
	}

	addFavorisGameController = async (req, res) => {
		
		try {
			const { idUser, gameName } = req.body
			const databaseInstance = databaseFactory()
			const userInstance = await databaseInstance.usersInstances()
			await databaseInstance.connectDb()
			const addGame = await userInstance.addFavoriteGame(idUser, gameName)
			await databaseInstance.disconnectDb()
			res.status(200).json({ gameName: addGame.gameName })
		} catch (error) {
			this.newLogger.error(error)
			res.status(500).json({ message: errorServer })
		}
	}

	deleteFavorisGameController = async (req, res) => {
	
		try {
			const { idUser, gameName } = req.body
			const databaseInstance = databaseFactory()
			const userInstance = await databaseInstance.usersInstances()
			await databaseInstance.connectDb()
			const deletedGame = await userInstance.removeFavoriteGame(idUser, gameName)
			await databaseInstance.disconnectDb()
			res.status(200).json({ gameName: deletedGame.gameName })
		} catch (error) {
			this.newLogger.error(error)
			return res.status(500).json({ message: errorServer })
		}
	}

	addFavorisLeagueController = async (req, res) => {
		try {
			const { idUser, leagueName } = req.body
			const databaseInstance = databaseFactory()
			const userInstance = await databaseInstance.usersInstances()
			await databaseInstance.connectDb()
			const addLeague = await userInstance.addFavoriteLeague(idUser, leagueName)
			await databaseInstance.disconnectDb()
			res.status(200).json({ leagueName: addLeague.leagueName })
		} catch (error) {
			this.newLogger.error(error)
			res.status(500).json({ message: errorServer })
		}
	}

	deleteFavorisLeagueController = async (req, res) => {
		try {
			const { idUser, leagueName } = req.body
			const databaseInstance = databaseFactory()
			const userInstance = await databaseInstance.usersInstances()
			await databaseInstance.connectDb()
			const deleteLeague = await userInstance.removeFavoriteLeague(idUser, leagueName)
			await databaseInstance.disconnectDb()
			res.status(200).json({ leagueName: deleteLeague.leagueName })
		} catch (error) {
			this.newLogger.error(error)
			return res.status(500).json({ message: errorServer })
		}
	}

	addFavorisTeamController = async (req, res) => {
		try {
			const { idUser, idTeam } = req.body
			const databaseInstance = databaseFactory()
			const userInstance = await databaseInstance.usersInstances()
			await databaseInstance.connectDb()
			const addTeam = await userInstance.addFavoriteTeam(idUser, idTeam)
			await databaseInstance.disconnectDb()
			const teams = addTeam.teams
			res.status(200).json({ teams })
		} catch (error) {
			this.newLogger.error(error)
			res.status(500).json({ message: errorServer })
		}
	}

	deleteFavorisTeamController = async (req, res) => {
		try {
			const { idUser, idTeam } = req.body
			const databaseInstance = databaseFactory()
			const userInstance = await databaseInstance.usersInstances()
			await databaseInstance.connectDb()
			const deleteTeam = await userInstance.removeFavoriteTeam(idUser, idTeam)
			await databaseInstance.disconnectDb()
			const teams = deleteTeam.teams
			res.status(200).json({ teams })
		} catch (error) {
			this.newLogger.error(error)
			return res.status(500).json({ message: errorServer })
		}
	}

	addFavorisBarNameController = async (req, res) => {
		try {
			const { idUser, idBar } = req.body
			const databaseInstance = databaseFactory()
			const userInstance = await databaseInstance.usersInstances()
		
			await databaseInstance.connectDb()
			const userInDb = await userInstance.getUserById(idUser)

			if (userInDb.role !== 'client') {
				this.newLogger.error('Has the wrong role')
				return res.status(401).json({ message: 'Vous n\'avez pas le bon rôle' })
			} 
			const addBarName = await userInstance.addFavoriteBar(idUser, idBar)
			await databaseInstance.disconnectDb()
			
			res.status(200).json({ barName: addBarName })
		} catch (error) {
			this.newLogger.error(error)
			res.status(500).json({ message: errorServer })
		}
	}

	deleteFavorisBarNameController = async (req, res) => {
		try {
			const { idUser, idBar } = req.body
			const databaseInstance = databaseFactory()
			const userInstance = await databaseInstance.usersInstances()
			await databaseInstance.connectDb()
			const deleteBarName = await userInstance.removeFavoriteBar(idUser, idBar)
			await databaseInstance.disconnectDb()
			return res.status(200).json({ barName: deleteBarName })
		} catch (error) {
			this.newLogger.error(error)
			return res.status(500).json({ message: errorServer })
		}
	}
}
