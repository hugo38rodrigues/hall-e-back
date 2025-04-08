import { connectDb, databaseFactory, disconnectDb } from 'bdd-service-hall-e/main.js'
import {
	errorServer
} from '../utils/messages.js'


export class FavorisController {
	constructor () {}

	addFavorisGameController = async (req, res) => {
		try {
			const { idUser, gameName } = req.body
			const databaseInstance = databaseFactory()
			const userInstance = await databaseInstance.usersInstances()
			await connectDb()
			await userInstance.addFavoriteGame(idUser, gameName)
			await disconnectDb()
			res.status(200).json({ isAdded: true })
		} catch (error) {
			console.log(error.message)
			res.status(500).json({ message: errorServer })
		}
	}

	deleteFavorisGameController = async (req, res) => {
		try {
			const { idUser, gameName } = req.body
			const databaseInstance = databaseFactory()
			const userInstance = await databaseInstance.usersInstances()
			await connectDb()
			await userInstance.removeFavoriteGame(idUser, gameName)
			await disconnectDb()
			return res.status(200).json({ isDeled: true })
		} catch (error) {
			console.log(error.message)
			return res.status(500).json({ message: errorServer })
		}
	}

	addFavorisLeagueController = async (req, res) => {
		try {
			const { idUser, leagueName } = req.body
			const databaseInstance = databaseFactory()
			const userInstance = await databaseInstance.usersInstances()
			await connectDb()
			await userInstance.addFavoriteLeague(idUser, leagueName)
			await disconnectDb()
			res.status(200).json({ isAdded: true })
		} catch (error) {
			console.log(error.message)
			res.status(500).json({ message: errorServer })
		}
	}

	deleteFavorisLeagueController = async (req, res) => {
		try {
			const { idUser, leagueName } = req.body
			const databaseInstance = databaseFactory()
			const userInstance = await databaseInstance.usersInstances()
			await connectDb()
			await userInstance.removeFavoriteLeague(idUser, leagueName)
			await disconnectDb()
			return res.status(200).json({ isDeled: true })
		} catch (error) {
			console.log(error.message)
			return res.status(500).json({ message: errorServer })
		}
	}

	addFavorisTeamController = async (req, res) => {
		try {
				const { idUser, idTeam } = req.body
				const databaseInstance = databaseFactory()
				const userInstance = await databaseInstance.usersInstances()
				await connectDb()
				const favoris = await userInstance.addFavoriteTeam(idUser, idTeam)
				console.log(favoris)
				await disconnectDb()
				res.status(200).json({ isAdded: true })
		} catch (error) {
			console.log(error.message)
			res.status(500).json({ message: errorServer })
		}
	}

	deleteFavorisTeamController = async (req, res) => {
		try {
			const { idUser, idTeam } = req.body
			const databaseInstance = databaseFactory()
			const userInstance = await databaseInstance.usersInstances()
			await connectDb()
			await userInstance.removeFavoriteTeam(idUser, idTeam)
			await disconnectDb()
			return res.status(200).json({ isDeled: true })
		} catch (error) {
			console.log(error.message)
			return res.status(500).json({ message: errorServer })
		}
	}
}
