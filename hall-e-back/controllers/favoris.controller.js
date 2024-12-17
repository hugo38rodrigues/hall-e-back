import { communInstance } from '../utils/classes-instance-dispatcher.js'
import { IS_NUMBER } from '../utils/regex.js'

export class FavorisController {
	#bddTarget

	constructor() {
		this.#bddTarget = process.env.BDD_TARGET
	}

	getFavorisController = async (req, res) => {
		try {
			const idUser = req.body.userId
			const user = communInstance(this.#bddTarget)
			const userFound = await user.getUserById(idUser)
			if (userFound) {
				const { favoritesGames, favoritesLeagues, favoritesTeams } = await user.getFavorites(userFound)
				return res.status(200).json({ favoritesGames, favoritesLeagues, favoritesTeams })
			}
			return res.status(401).json({ message: 'Utilisateur un trouvable' })
		} catch (err) {
			console.error(err)
			return res.status(500).json({ message: 'Erreur Server' })
		}
	}

	addFavorisGameController = async (req, res) => {
		try {
			const gameId = req.body.gameId
			const userId = req.body.userId
			const role = req.body.role
			const isvalidGameId = gameId && IS_NUMBER.test(gameId)
			const isvalidUserId = userId && IS_NUMBER.test(userId)

			if (!isvalidGameId || !isvalidUserId) {
				return res
					.status(401)
					.json({ message: 'The id bar or game id is not a number' })
			}

			const newUser = communInstance(this.#bddTarget)

			const userIsFound =
				role === 'client'
					? await newUser.getClient(userId)
					: await newUser.getBar(userId)
			const favoriteMethode =
				role === 'client' ? 'addFavoriteGame' : 'addFavoriteGamesBar'

			const game = await newUser.getGame(gameId)

			if (!userIsFound || !game) {
				return res.status(401).json({ message: 'Unknown user or unknown game' })
			}

			const isAddFavorisGame = await newUser.addFavoriteGame(
				userIsFound,
				game,
				favoriteMethode
			)

			if (!isAddFavorisGame) {
				return res.status(401).json({ message: 'The game already exists' })
			}

			res.status(200).json({ message: 'Games added to favorites' })
		} catch (error) {
			console.log(error)
			res.status(500).json({ message: 'Internal error' })
		}
	}

	deleteFavorisGameController = async (req, res) => {
		try {
			const gameId = req.body.gameId
			const userId = req.body.userId
			const isvalidGameId = gameId && IS_NUMBER.test(gameId)
			const isvalidUserId = userId && IS_NUMBER.test(userId)

			if (!isvalidGameId || !isvalidUserId) {
				return res
					.status(401)
					.json({ message: 'The id user or game id is not a number' })
			}

			const newUser = communInstance(this.#bddTarget)

			const userIsFound = await newUser.getUserById(userId)
			const game = await newUser.getGame(gameId)

			if (!userIsFound || !game) {
				return res.status(401).json({ message: 'Unknown user or unknown game' })
			}

			const isAddFavorisGame = await newUser.removeFavoriteGame(userIsFound, game )

			if (!isAddFavorisGame) {
				return res.status(401).json({ message: 'Unable to delete the game' })
			}

			res.status(200).json({ message: 'Games removed from favorites' })
		} catch (error) {
			console.log(error)
			res.status(500).json({ messag: 'Internal error' })
		}
	}

	addFavorisTeamController = async (req, res) => {
		try {
			const teamId = req.body.teamId
			const userId = req.body.userId
			const role = req.body.role
			const isvalidTeamId = teamId && IS_NUMBER.test(teamId)
			const isvalidUserId = userId && IS_NUMBER.test(userId)

			if (!isvalidTeamId || !isvalidUserId) {
				return res
					.status(401)
					.json({ message: 'The id bar or team id is not a number' })
			}

			const newUser = communInstance(this.#bddTarget)

			const userIsFound =
				role === 'client'
					? await newUser.getClient(userId)
					: await newUser.getBar(userId)
			const favoriteMethode =
				role === 'client' ? 'addFavoriteTeam' : 'addFavoriteTeamsBar'

			const team = await newUser.getTeam(teamId)

			if (!userIsFound || !team) {
				return res.status(401).json({ message: 'Unknown user or unknown team' })
			}

			const isAddFavorisTeam = await newUser.addFavoriteTeam(
				userIsFound,
				team,
				favoriteMethode
			)

			if (!isAddFavorisTeam) {
				return res.status(401).json({ message: 'The team already exists' })
			}

			res.status(200).json({ message: 'Team added to favorites' })
		} catch (error) {
			console.log(error)
			res.status(500).json({ message: 'Internal error' })
		}
	}

	deleteFavorisTeamController = async (req, res) => {
		try {
			const teamId = req.body.teamId
			const userId = req.body.userId
			const isvalidGameId = teamId && IS_NUMBER.test(teamId)
			const isvalidUserId = userId && IS_NUMBER.test(userId)

			if (!isvalidGameId || !isvalidUserId) {
				return res
					.status(401)
					.json({ message: 'The id user or team id is not a number' })
			}

			const newUser = communInstance(this.#bddTarget)

			const userIsFound = await newUser.getUserById(userId)
			
			const team = await newUser.getTeam(teamId)

			if (!userIsFound || !team) {
				return res.status(401).json({ message: 'Unknown user or unknown team' })
			}

			const isAddFavorisTeam = await newUser.removeFavoriteTeam(
				userIsFound,
				team
			)

			if (!isAddFavorisTeam) {
				return res
					.status(401)
					.json({ message: 'Impossible to delete the team' })
			}

			res.status(200).json({ message: 'Team removed from favorites' })
		} catch (error) {
			console.log(error)
			res.status(500).json({ message: 'Internal error' })
		}
	}

	addFavorisLeagueController = async (req, res) => {
		try {
			const leagueId = req.body.leagueId
			const userId = req.body.userId
			const isvalidLeagueId = leagueId && IS_NUMBER.test(leagueId)
			const isvalidUserId = userId && IS_NUMBER.test(userId)

			if (!isvalidLeagueId || !isvalidUserId) {
				return res
					.status(401)
					.json({ message: 'The user id or league id is not a number.' })
			}

			const newUser = communInstance(this.#bddTarget)

			const userIsFound = newUser.getUserById(userId)
				
			const league = await newUser.getLeague(leagueId)

			if (!userIsFound || !league) {
				return res
					.status(401)
					.json({ message: 'Unknown user or unknown league' })
			}

			const isAddFavorisLeague = await newUser.addFavoriteLeague(
				userIsFound,
				league		
			)

			if (!isAddFavorisLeague) {
				return res.status(401).json({ message: 'The league already exist' })
			}

			res.status(200).json({ message: 'League added to favorites' })
		} catch (error) {
			console.log(error)
			res.status(500).json({ message: 'Internal error' })
		}
	}

	deleteFavorisLeagueController = async (req, res) => {
		try {
			const leagueId = req.body.leagueId
			const userId = req.body.userId
			
			const isvalidLeagueId = leagueId && IS_NUMBER.test(leagueId)
			const isvalidUserId = userId && IS_NUMBER.test(userId)

			if (!isvalidLeagueId || !isvalidUserId) {
				return res
					.status(401)
					.json({ message: 'The user id or league id is not a number.' })
			}

			const newUser = communInstance(this.#bddTarget)

			const userIsFound = await newUser.getUserById(userId)
			const league = await newUser.getLeague(leagueId)

			if (!userIsFound || !league) {
				return res.status(401).json({ message: 'Unknown user or league' })
			}

			const isFavorisLeague = await newUser.removeFavoriteLeague(
				userIsFound,
				league
			)

			if (!isFavorisLeague) {
				return res
					.status(401)
					.json({ message: 'Impossible to deleted the league' })
			}

			res.status(200).json({ message: 'League removed from favorites' })
		} catch (error) {
			console.log(error)
			res.status(500).json({ message: 'Internal error' })
		}
	}
}
