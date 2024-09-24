import { BarService } from './bar.service.js'
import { db } from '../../db/mysql/index.js'

export class BarMysqlService extends BarService {
  
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

  getMatchById = async (matchId) => {

    return await db.Match.findByPk(matchId)
  }
  
  getBar =  async (barId) => {

    return  await db.Bar.findByPk(barId)
  }

  matchesPlannings = async (barId, matchId) => {
    try {
      const matchPlanning = await db.barMatchSchedule.create({
      barId,
      matchId,
      scheduled: true, // Enregistre la date de planification
    })

      if (matchPlanning){
        return matchPlanning
      }

      return false
    } catch (error){
      console.error(error)
      throw error
    }
  }
}