import { db } from '../../db/mysql/index.js'
import { CommunService } from './commun.service.js'

export class CommunMysqlService extends CommunService{
  
  constructor () {
    super()
    this.db = db
  }

  getUser = async (ressources) => {
    const consumer = await this.db.Consumer.findOne({
      attributes: ['email', 'lastName', 'firstName', 'role'],
      include: [
        {
          model: db.Game,
          as: 'favoriteGames',  // Inclure les jeux favoris
        },
        {
          model: db.League,
          as: 'favoriteLeagues',  // Inclure les ligues favorites
        },
        {
          model: db.Team,
          as: 'favoriteTeams',  // Inclure les équipes favorites
        },
        {
          model: db.Bar,
          as: 'likedBars',
          attributes: { exclude: ['password'] }
        }
      ],
      where: {
        email: ressources.email,
        password: ressources.password,
      }
    })

    const bar = await this.db.Bar.findOne({
      attributes: ['id', 'address', 'name', 'email', 'price', 'description', 'photo', 'password', 'role'],
      include: [
        {
          model: db.Game,
          as: 'favoriteGamesBar',  // Inclure les jeux favoris
        },
        {
          model: db.League,
          as: 'favoriteLeaguesBar',  // Inclure les ligues favorites
        },
        {
          model: db.Team,
          as: 'favoriteTeamsBar',  // Inclure les équipes favorites
        }
      ],
      where: {
        email: ressources.email,
        password: ressources.password,
      }
    })

    if (consumer) {
      return consumer
    }
    if (bar) {
      return bar
    }
    return null
  }

  getUserById = async (role, id) => {
    console.log(id)
    if (role === 'consumer') {
      return await this.db.Consumer.findOne({
        attributes: ['id'],
        where: {
          id: id
        }
      })
    } else if (role === 'bar') {
      return await this.db.Bar.findOne({
        attributes: ['id'],
        where: {
          id: id
        }
      })
    } else {
      return false
    }
  }

  addUser = async (ressources) => {
    if (ressources.role === 'consumer') {
      try {
        return await this.db.Consumer.create(ressources)
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

  updateUser = async (id, ressources) => {
    
   if (ressources.role === 'consumer') {
    try {
      // Trouver la ressource par son identifiant
      const resource = await db.Consumer.findByPk(id)
     
      if (!resource) {
        // Mettre à jour les champs de la ressource
        Error('ressource not found')
        return {
          isError: true,
          message: 'ressource not found'
        }
      }

      return await resource.update(ressources)

    } catch (error){
      return error
    }
  }
    

    if (ressources.role === 'bar') {
      try {
        return await db.Bar.update(ressources, {
          where: { id: id },
        })
      } catch (error){
        return error
      }
    }
  }

  deleteUser = async (id, role) => {
    if (role === 'consumer'){
      await db.Consumer.destroy({
        where: {
          id: id
        }
      })
    }

    if (role === 'bar'){
      await db.Bar.destroy({
        where: {
          id: id
        }
      })
    }
  }

  getMatchesAndScheduledMatches = async () => {
    return await db.Match.findAll({
      attributes: { exclude: ['gameId', 'leagueId', 'team1Id', 'team2Id'] },
      include: [{
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

  getConsumer =  async (consumerId) => {
    
    return  await db.Consumer.findByPk(consumerId)
  }

  getBar =  async (barId) => {
    
    return  await db.Bar.findByPk(barId)
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

  addFavoriteGame = async (user, game, favoriteMethode) => {
    
    try {    
      const favoriteGame = await user[favoriteMethode](game)
      if (favoriteGame) {
        return favoriteGame
      }
      return false
      
    }
    catch (error){
      console.log(error)
    }
  }

  removeFavoriteGame = async (user, game, favoriteMethode) =>{
    try {    
      const favoriteGame = await user[favoriteMethode](game)
      if (favoriteGame) {
        return favoriteGame
      }
      return false
    }
    catch (error){
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
      
    }
    catch (error){
      console.log(error)
    }
  }

  removeFavoriteTeam = async (user, team, favoriteMethode) =>{
    try {    
      const favoriteTeam = await user[favoriteMethode](team)
      
      if (favoriteTeam) {
        return favoriteTeam
      }
      return false
    }
    catch (error){
      console.log(error)
    }
    
  }

  addFavoriteLeague = async (user, league, favoriteMethode) => {
    try {    
      const favoriteLeague = await user[favoriteMethode](league)
      if (favoriteLeague) {
        return favoriteLeague
      }
      return false
      
    }
    catch (error){
      console.log(error)
    }
  }

  removeFavoriteLeague = async (user, league, favoriteMethode) =>{
    try {    
      const favoriteLeague = await user[favoriteMethode](league)

      if (favoriteLeague) {
        return favoriteLeague
      }
      return false
    }
    catch (error){
      console.error(error)
       throw error
    }
  }
}