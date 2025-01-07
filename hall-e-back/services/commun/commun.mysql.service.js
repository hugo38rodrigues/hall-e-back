import { db } from '../../db/mysql/index.js'
import { CommunService } from './commun.service.js'

export class CommunMysqlService extends CommunService {
	constructor () {
		super()
		this.db = db
	}

	getUserIsFound = async (email) => {
		const foundClient = await this.db.Client.findOne({ where: { email }})
		const foundBar = await this.db.Bar.findOne({ where: { email }})
		if (foundClient || foundBar) {
			return true
		}
		return false
	}

	getFavorites = async (user) => {
		const favoritesLeagues = await user.getFavoritesLeagues()
		const favoritesGames = await user.getFavoritesGames()
		const favoritesTeams = await user.getFavoritesTeams()
		return { favoritesGames, favoritesLeagues, favoritesTeams }
	}

	getProfileUser = async (email) => {
		const client = await this.db.Client.findOne({
			attributes: ['id', 'email', 'lastName', 'firstName', 'password', 'role'],
			where: {
				email: email,
			},
		})

		const bar = await this.db.Bar.findOne({
			include: [{ model: this.db.Picture, as: 'pictures' }],
			attributes: ['id', 'address', 'password', 'name', 'email', 'price', 'description', 'role'],
			where: {
				email: email,
			},
		})

		if (client) {
			return client
		} else if (bar) {
			return bar
		}
		return false
	}

	getUserById = async (id) => {
		const client = await this.db.Client.findOne({
			where: {
				id: id,
			},
		})
		const bar = await this.db.Bar.findOne({
			where: {
				id: id,
			},
		})

		if (client) {
			return client
		}

		if (bar) {
			return bar
		}

		return null
	}

	addUser = async (ressources) => {
		if (ressources.role === 'client') {
			try {
				return await this.db.Client.create(ressources)
			} catch (error) {
				return error
			}
		}

		if (ressources.role === 'bar') {
			try {
				return await this.db.Bar.create(ressources)
			} catch (error) {
				return error
			}
		}
	}

	updateUser = async ( id, profile) => {
	

		const updateModel =	profile.role === 'client' ? db.Client : profile.role === 'bar' ? db.Bar : null

		if (!updateModel) {
			return { isError: true, message: 'Rôle utilisateur invalide' }
		}
		
		try {
			// Récupérer l'objet existant depuis la base de données
			const profilInBdd = await updateModel.findByPk(id)

			if (!profilInBdd) {
				throw new Error('L’utilisateur avec cet ID est introuvable.')
			}

			// Détecter les modifications
			let hasChanges = false
			
			for (const key in profile) {

				if (profile[key] !== profilInBdd[key] && profile[key] !== undefined) {
					profilInBdd[key] = profile[key] // Met à jour les champs modifiés
					hasChanges = true
				}
			}

			// Sauvegarder uniquement s'il y a des modifications
			if (hasChanges) {
				await profilInBdd.save()
				return { isError: false, message:'Le profile a été mis à jour.' }
			}
			else {
			return { isError: false, message: 'Aucun changement' }
		}
		} catch (error) {
				console.error('Erreur lors de la mise à jour :', error.message)
				return { isError: false, message: error.message }
		}
	}
	

	deleteUser = async (id, role) => {
		if (role === 'client') {
			await db.Client.destroy({
				where: {
					id: id,
				},
			})
		}

		if (role === 'bar') {
			await db.Bar.destroy({
				where: {
					id: id,
				},
			})
		}
	}

	getMatches = async () => {
		return await db.Match.findAll({
			attributes: { exclude: ['gameId', 'leagueId', 'team1Id', 'team2Id'] },
			include: [
				{
					model: db.Bar,
					as: 'barsScheduling',
					attributes: {
						exclude: ['password'],
					},
					through: {
						attributes: ['scheduled'],
					},
				},
				{ model: db.Game },
				{ model: db.League },
				{ model: db.Team, as: 'team1' },
				{ model: db.Team, as: 'team2' },
			],
			order: [['id', 'ASC']],
		})
	}

	getGame = async (gameId) => {
		return await db.Game.findByPk(gameId)
	}

	getTeam = async (teamId) => {
		return await db.Team.findByPk(teamId)
	}

	getLeague = async (leagueId) => {
		return await db.League.findByPk(leagueId)
	}

	removeFavoriteGame = async (user, game) => {
		const favoriteGame = await user.removeFavoritesGames(game)
		if (favoriteGame) {
			return favoriteGame
		}
		return false
	}

	removeFavoriteTeam = async (user, team) => {
		const favoriteTeam = await user.removeFavoritesTeams(team)

		if (favoriteTeam) {
			return favoriteTeam
		}
		return false
	}

	removeFavoriteLeague = async (user, league) => {
		const favoriteLeague = await user.removeFavoritesLeagues(league)

		if (favoriteLeague) {
			return favoriteLeague
		}
		return false
	}

	addFavoriteGame = async (user, game, favoriteMethode) => {
		try {
			const favoriteGame = await user[favoriteMethode](game)
			if (favoriteGame) {
				return favoriteGame
			}
			return false
		} catch (error) {
			console.log(error)
		}
	}

	addFavoriteTeam = async (user, team, favoriteMethode) => {
		try {
			const favoriteTeam = await user[favoriteMethode](team)
			if (favoriteTeam) {
				return favoriteTeam
			}
			return false
		} catch (error) {
			console.log(error)
		}
	}

	addFavoriteLeague = async (user, league) => {
		try {
			const favoriteLeague = await user.addFavoriteLeagues(league)
			if (favoriteLeague) {
				return favoriteLeague
			}
			return false
		} catch (error) {
			console.log(error)
		}
	}
}
