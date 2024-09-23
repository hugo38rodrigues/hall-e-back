import { db } from '../../db/mysql/index.js'
import { ConsumerService } from './consumer.service.js'

export class ConsumerMysqlService extends ConsumerService {
  
  constructor (){
    super()
    this.db = db
  }
  
  getMatch = async () => {
    const matches = await db.Match.findAll({
      attributes: { exclude: ['gameId', 'leagueId', 'team1Id', 'team2Id'] },
      include: [
        { model: db.Game }, // Inclure le jeu associé
        { model: db.League }, // Inclure la ligue associée
        { model: db.Team, as: 'team1' }, // Inclure l'équipe 1
        { model: db.Team, as: 'team2' }, // Inclure l'équipe 2
        { model: db.Bar }, // Inclure les bars associés au match
      ],
    })
    return matches
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
 
  addFavoriteGame = async (consumer, game ) => {

    try {    
      const favoriteGame = await consumer.addFavoriteGame(game)
      if (favoriteGame) {
        return favoriteGame
      }
      return false
      
    }
    catch (error){
      console.log(error)
    }
  }

  removeFavoriteGame = async (consumer, game) =>{
    try {    
      const favoriteGame = await consumer.removeFavoriteGame(game)
      if (favoriteGame) {
        return favoriteGame
      }
      return false
    }
    catch (error){
      console.log(error)
    }
    
  }

  addFavoriteTeam = async (consumer, team) => {

    try {    
      const favoriteTeam = await consumer.addFavoriteTeam(team)
      if (favoriteTeam) {
        return favoriteTeam
      }
      return false
      
    }
    catch (error){
      console.log(error)
    }
  }

  removeFavoriteTeam = async (consumer, team) =>{
    try {    
      const favoriteTeam = await consumer.removeFavoriteTeam(team)
      
      if (favoriteTeam) {
        return favoriteTeam
      }
      return false
    }
    catch (error){
      console.log(error)
    }
    
  }

  addFavoriteLeague = async (consumer, league) => {
    try {    
      const favoriteLeague = await consumer.addFavoriteLeague(league)
      if (favoriteLeague) {
        return favoriteLeague
      }
      return false
      
    }
    catch (error){
      console.log(error)
    }
  }

  removeFavoriteLeague = async (consumer, league) =>{
    try {    
      const favoriteLeague = await consumer.removeFavoriteLeague(league)

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

  addLikeBar = async (consumerId, barId) => {
    try {
      const [like, createdLike] = await db.Like.findOrCreate({
        where: { 
          consumerId,
          barId
        }
      })

      if (createdLike) {
        console.log('Bar liked successfully')
        return like
      } 
      return false
    } 
    catch (error) {
      console.error('Error liking the bar:', error)
      throw error
    }
  }

  dissLikeBar = async (consumerId, barId) => {
    try {
      const remove = await db.Like.destroy({
        where: { 
          consumerId,
          barId
        }
      })

      if (remove) {
        console.log('Bar dissliked successfully')
        return true
      } 
    }
    catch (error) {
      console.error('Error liking the bar:', error)
      throw error
    }
  }

  
  

  addComments = async () => {}
}