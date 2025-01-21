import { connectDb, disconnectDb } from '../../config/mongo.config.js'
import { UserInstance } from '../../interfaces/user-instance.interface.js'
import Bar from '../../model/mongodb/bar.model.js'

import Client from '../../model/mongodb/client.model.js'

export class UserMongoDbService extends UserInstance  {

  constructor (config) {
    super()
    this.config = config
  }
  
  getFavorites = async (user) => {
    const favoritesLeagues = await user.getFavoritesLeagues()
    const favoritesGames = await user.getFavoritesGames()
    const favoritesTeams = await user.getFavoritesTeams()
    return { favoritesGames, favoritesLeagues, favoritesTeams }
  }

  getProfileUser = async (email) => {
     try {
				await connectDb(this.config)

				// Récupération du client avec ses bars likés
				const client = await Client.findOne({ email }).populate('likedBars') // Récupère les bars likés par le client

				// Récupération du bar avec ses commentaires, likes et photos
				const bar = await Bar.findOne({ email })
					.populate('comments') // Récupère les commentaires associés au bar
					.populate('likes') // Récupère les likes associés au bar
					.populate('pictures') // Récupère les photos associées au bar
					.exec()

				console.log({ client, bar })
			} catch (error) {
				console.error('Erreur lors de la récupération du profil utilisateur :', error)
			} finally {
				await disconnectDb(this.config)
			}
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

  addUser = async (userProfile) => {
    try {    await connectDb(this.config)
      if (userProfile.role === 'client') {
        try {
          return await Client.create(userProfile)
        } catch (error) {
          return error
        }
      }

      if (userProfile.role === 'bar') {
        try {
          return await Bar.create(userProfile)
        } catch (error) {
          return error
        }
      }
    }
    catch(error){
      console.error(error)
    } 
    finally{
      await disconnectDb(this.config)
    } 
  }

  updateUser = async (id, profile) => {
    const updateModel =
      profile.role === 'client' ? db.Client : profile.role === 'bar' ? db.Bar : null

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
        return { isError: false, message: 'Le profile a été mis à jour.' }
      } else {
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
        // {
        // 	model: db.Bar,
        // 	as: 'barsScheduling',
        // 	attributes: {
        // 		exclude: ['password'],
        // 	},
        // 	through: {
        // 		attributes: ['scheduled'],
        // 	},
        // },
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
      const favoriteLeague = await user.addFavoritesLeagues(league)
      if (favoriteLeague) {
        return favoriteLeague
      }
      return false
    } catch (error) {
      console.log(error)
    }
  }

  getGamesLeagues = async () => {
    try {
      const gameLeagues = await db.GameLeague.findAll({
        include: [
          { model: db.Game, attributes: ['id', 'name'], as: 'game' }, // Utilisez 'game' au lieu de 'games'
          { model: db.League, attributes: ['id', 'name'], as: 'league' }, // Utilisez 'league' au lieu de 'leagues'
        ],
      })
      return gameLeagues
    } catch (error) {
      console.error(error)
      return false
    }
  }

  getGamesTeams = async () => {
    try {
      const gameTeams = await db.GameTeam.findAll({
        include: [
          {
            model: db.Game,
            attributes: ['id', 'name']
          },
          {
            model: db.Team,
            as: 'team1', // Assurez-vous d'utiliser l'alias approprié pour la team1
            attributes: ['id', 'name']
          },
          {
            model: db.Team,
            as: 'team2', // Assurez-vous d'utiliser l'alias approprié pour la team2
            attributes: ['id', 'name']
          }
        ]
      })

      // Reformater les résultats pour les renvoyer sous la forme souhaitée
      const formattedGameTeams = gameTeams.map((gameTeam) => ({
        Game: gameTeam.Game,
        Team1: gameTeam.team1,
        Team2: gameTeam.team2,
      }))
      if (!gameTeams){
        return true
      }
      return formattedGameTeams
    }
    catch (error) {
      console.error(error)
    }
  }
}
