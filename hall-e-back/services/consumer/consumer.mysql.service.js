import { ConsumerService } from './consumer.service.js'
import { db } from '../../db/mysql/index.js'

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
  
  addFavoritesMatch = async () => {}
  addFavoritesGame = async () => {}
  addFavoritesLeague = async () => {}
  addFavoritesTeam = async () => {}

  addLikeBar = async () => {}
  addComments = async () => {}
}