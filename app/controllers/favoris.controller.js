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
			
			const addGame = await userInstance.addFavoriteGame(idUser, gameName, type)
			
		
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
			
			const deletedGame = await userInstance.removeFavoriteGame(idUser, gameName, type)
			
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
			
			const addLeague = await userInstance.addFavoriteLeague(idUser, leagueName, type)
			
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
			
			const deleteLeague = await userInstance.removeFavoriteLeague(idUser, leagueName, type)
			
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
			
			const addTeam = await userInstance.addFavoriteTeam(idUser, idTeam, type)
			
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
			
			const deleteTeam = await userInstance.removeFavoriteTeam(idUser, idTeam, type)
			
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
		
			
			const userInDb = await userInstance.getUserById(idUser)

			if (userInDb.role !== 'client') {
				this.newLogger.error('Has the wrong role')
				return  { message:'Vous n\'avez pas le bon rôle' }
			} 
			const addBarName = await userInstance.addFavoriteBar(idUser, idBar, type)
			
			
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
			
			const userInDb = await userInstance.getUserById(idUser)

			if (userInDb.role !== 'client') {
				this.newLogger.error('Has the wrong role')
				return { message:'Vous n\'avez pas le bon rôle' }
			} 
			const deleteBarName = await userInstance.removeFavoriteBar(idUser, idBar, type)
			
			return deleteBarName
		} catch (error) {
			this.newLogger.error(error)
			return { message: errorServer }
		}
	}
}
