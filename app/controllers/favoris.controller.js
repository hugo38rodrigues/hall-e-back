import { databaseFactory } from '@hugo38rodrigues/bdd-service-hall-e/main.js'
import { Logger } from '../midleware/logger.js'
import {
	errorServer
} from '../utils/messages.js'


export class FavorisController {
	constructor () {
		this.newLogger = new Logger()
	}

	addFavorisGameController = async (idUser, gameName, type) => {
		try {
			const databaseInstance = databaseFactory()
			const userInstance = await databaseInstance.usersInstances()
			await databaseInstance.connectDb()
			const addGame = await userInstance.addFavoriteGame(idUser, gameName, type)
			await databaseInstance.disconnectDb()
		
			return addGame
		} catch (error) {
			this.newLogger.error(error)
			return errorServer
		}
	}

	deleteFavorisGameController = async (idUser, gameName, type) => {
		try {
			const databaseInstance = databaseFactory()
			const userInstance = await databaseInstance.usersInstances()
			await databaseInstance.connectDb()
			const deletedGame = await userInstance.removeFavoriteGame(idUser, gameName, type)
			await databaseInstance.disconnectDb()
			return deletedGame
		} catch (error) {
			this.newLogger.error(error)
			return  errorServer 
		}
	}

	addFavorisLeagueController = async (idUser, leagueName, type) => {
		try {
			const databaseInstance = databaseFactory()
			const userInstance = await databaseInstance.usersInstances()
			await databaseInstance.connectDb()
			const addLeague = await userInstance.addFavoriteLeague(idUser, leagueName, type)
			await databaseInstance.disconnectDb()
			return addLeague
		} catch (error) {
			this.newLogger.error(error)
			return { message: errorServer }
		}
	}

	deleteFavorisLeagueController = async (idUser, leagueName, type) => {
		try {
			const databaseInstance = databaseFactory()
			const userInstance = await databaseInstance.usersInstances()
			await databaseInstance.connectDb()
			const deleteLeague = await userInstance.removeFavoriteLeague(idUser, leagueName, type)
			await databaseInstance.disconnectDb()
			return deleteLeague
		} catch (error) {
			this.newLogger.error(error)
			return { message: errorServer }
		}
	}

	addFavorisTeamController = async (idUser, idTeam, type) => {
		try {
			const databaseInstance = databaseFactory()
			const userInstance = await databaseInstance.usersInstances()
			await databaseInstance.connectDb()
			const addTeam = await userInstance.addFavoriteTeam(idUser, idTeam, type)
			await databaseInstance.disconnectDb()
			const teams = addTeam
			return teams 
		} catch (error) {
			this.newLogger.error(error)
			return { message: errorServer }
		}
	}

	deleteFavorisTeamController = async (idUser, idTeam, type) => {
		try {
			const databaseInstance = databaseFactory()
			const userInstance = await databaseInstance.usersInstances()
			await databaseInstance.connectDb()
			const deleteTeam = await userInstance.removeFavoriteTeam(idUser, idTeam, type)
			await databaseInstance.disconnectDb()
			return deleteTeam
		} catch (error) {
			this.newLogger.error(error)
			return { message: errorServer }
		}
	}

	addFavorisBarNameController = async (idUser, idBar, type) => {
		try {
			const databaseInstance = databaseFactory()
			const userInstance = await databaseInstance.usersInstances()
		
			await databaseInstance.connectDb()
			const userInDb = await userInstance.getUserById(idUser)

			if (userInDb.role !== 'client') {
				this.newLogger.error('Has the wrong role')
				return  { message:'Vous n\'avez pas le bon rôle' }
			} 
			const addBarName = await userInstance.addFavoriteBar(idUser, idBar, type)
			await databaseInstance.disconnectDb()
			
			return addBarName
		} catch (error) {
			this.newLogger.error(error)
			return { message: errorServer }
		}
	}

	deleteFavorisBarNameController = async (idUser, idBar, type) => {
		try {
			const databaseInstance = databaseFactory()
			const userInstance = await databaseInstance.usersInstances()
			await databaseInstance.connectDb()
			const userInDb = await userInstance.getUserById(idUser)

			if (userInDb.role !== 'client') {
				this.newLogger.error('Has the wrong role')
				return { message:'Vous n\'avez pas le bon rôle' }
			} 
			const deleteBarName = await userInstance.removeFavoriteBar(idUser, idBar, type)
			await databaseInstance.disconnectDb()
			return deleteBarName
		} catch (error) {
			this.newLogger.error(error)
			return { message: errorServer }
		}
	}
}
