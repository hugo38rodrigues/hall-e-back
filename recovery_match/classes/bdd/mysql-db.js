import dotenv from 'dotenv'
import { Storage } from '../interface/storage.js'
import { db } from '../../game-data-forge/db/mysql/index.js'

dotenv.config()

export class MysqlDB extends Storage {

  constructor () {
    super()
  }

  #insertGame = async (name) => {
    try {
      const [game, created] = await db.Game.findOrCreate({
        where: { name: name },
      })

      return game.dataValues.id
      
      
    } catch (error) {
      console.error('Error checking if game exists:', error)
      throw error
    }
  }

  #insertLeague = async (name) => {
    try {
      const [league, created] = await db.League.findOrCreate({
        where: { name: name },
        defaults: { name: name },
      })
      return league.dataValues.id

    } catch (error) {
      console.error('Error checking if league exists:', error)
      throw error
    }
  }

  #insertTeams = async (name1, name2) => {
    try {
      // Récupérer ou créer les deux équipes en une seule requête
      const teams = await Promise.all([
        db.Team.findOrCreate({ where: { name: name1 }, defaults: { name: name1 }}),
        db.Team.findOrCreate({ where: { name: name2 }, defaults: { name: name2 }}),
      ])
      
      const [team1, team2] = teams.map((team) => team[0].dataValues.id)
      
      if (team1 && team2){
        return [team1, team2]
      }
    } catch (error) {
      console.error('Error inserting teams:', error)
      throw error
    }
  }

  #insertMatch = async (matches) => {
    for (const value of matches) {
      try {
        const leagueId = await this.#insertLeague(value.leagueName)
        const gameId = await this.#insertGame(value.gameName)
        const [team1Id, team2Id] = await this.#insertTeams(value.team1, value.team2)

        const [match, create] = await db.Match.findOrCreate({
          where:{ 
            id_match: value.idMatch
          },
          defaults:{
            id_match: value.idMatch,
            date: value.date,
            gameId: gameId,
            leagueId: leagueId,
            team1Id: team1Id,
            team2Id: team2Id,
          }
        })

        if (match){
          console.log(match)
        }
        
      } catch (error) {
        console.error(`Error inserting match with id ${value.idMatch}:`, error)
      }
    }
  }

  savingMatches = async (matches) => {
    try {
      await this.#insertMatch(matches)
    } catch (error) {
      console.error('Insertion error :', error)
    }
  }
}
