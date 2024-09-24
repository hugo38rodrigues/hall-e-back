import { barInstance } from '../config/db.config.js'
import { IS_NUMBER } from '../utils/regex.js'
export class BarController {
    #bddTarget

  constructor () {
    this.#bddTarget = process.env.BDD_TARGET
  }

  getMatchController= async (req, res) => {
    try {
      const newBar = barInstance(this.#bddTarget)
      const allMatches = await newBar.getMatch()

      if (allMatches){
        return res.status(200).json({ data: allMatches })
      }
      else {
        return res.status(404).json({ message: 'Error when retrieving matches' })
      }
      
    } 
    catch (error){
      console.log(error)
      return res.status(500).json({ message: 'Internal error' })
    }
  }

  addFavorisGameController = async (req, res) => {
    try {
      const gameId = req.body.gameId
      const barId = req.body.barId
      const isvalidGameId = gameId && IS_NUMBER.test(gameId)
      const isvalidbarId = barId && IS_NUMBER.test(barId)

      if (!isvalidGameId || !isvalidbarId){
        return res.status(401).json({ message: 'The id bar or game id is not a number' })
      }

      const newBar = barInstance(this.#bddTarget)
      
      const bar = await newBar.getBar(barId)
      const game = await newBar.getGame(gameId)

      if (!bar || !game){
        return res.status(401).json({ message: 'Unknown user or unknown game' })
      }
    
      const isAddFavorisGame = await newBar.addFavoriteGame(bar, game) 
      
      if (!isAddFavorisGame) {
        return res.status(401).json({ message:  'The game already exists' })
      }

      res.status(200).json({ message: 'Games added to favorites' })
    } 
    catch (error) {
      console.log(error)
      res.status(500).json({ message: 'Internal error' })
    }
  }

  deleteFavorisGameController = async (req, res) => {
    try {
      const gameId = req.body.gameId
      const barId = req.body.barId
      const isvalidGameId = gameId && IS_NUMBER.test(gameId)
      const isvalidbarId = barId && IS_NUMBER.test(barId)

      if (!isvalidGameId || !isvalidbarId){
        return res.status(401).json({ message: 'The id bar or game id is not a number' })
      }

      const newBar = barInstance(this.#bddTarget)
      
      const bar = await newBar.getBar(barId)
      const game = await newBar.getGame(gameId)

      if (!bar || !game){
        return res.status(401).json({ message: 'Unknown user or unknown game' })
      }
    
      const isAddFavorisGame = await newBar.removeFavoriteGame(bar, game) 
      
      if (!isAddFavorisGame) {
        return res.status(401).json({ message:  'Unable to delete the game' })
      }

      res.status(200).json({ message: 'Games removed from favorites' })
    } 
    catch (error){
      console.log(error)
      res.status(500).json({ messag: 'Internal error' })
    }
  }

  addFavorisTeamController = async (req, res) => {
    try {
      const teamId = req.body.teamId
      const barId = req.body.barId
      const isvalidTeamId = teamId && IS_NUMBER.test(teamId)
      const isvalidbarId = barId && IS_NUMBER.test(barId)

      if (!isvalidTeamId || !isvalidbarId){
        return res.status(401).json({ message: 'The id bar or team id is not a number' })
      }

      const newBar = barInstance(this.#bddTarget)
      
      const bar = await newBar.getBar(barId)
      const team = await newBar.getTeam(teamId)

      if (!bar || !team){
        return res.status(401).json({ message: 'Unknown user or unknown team' })
      }
    
      const isAddFavorisTeam = await newBar.addFavoriteTeam(bar, team) 
      
      if (!isAddFavorisTeam) {
        return res.status(401).json({ message:  'The team already exists' })
      }

      res.status(200).json({ message: 'Team added to favorites' })
    } 
    catch (error) {
      console.log(error)
      res.status(500).json({ message: 'Internal error' })
    }
  }

  deleteFavorisTeamController = async (req, res) => {
    try {
      const teamId = req.body.teamId
      const barId = req.body.barId
      const isvalidGameId = teamId && IS_NUMBER.test(teamId)
      const isvalidbarId = barId && IS_NUMBER.test(barId)

      if (!isvalidGameId || !isvalidbarId){
        return res.status(401).json({ message: 'The id bar or team id is not a number' })
      }

      const newBar = barInstance(this.#bddTarget)
      
      const bar = await newBar.getBar(barId)
      const team = await newBar.getTeam(teamId)

      if (!bar || !team){
        return res.status(401).json({ message: 'Unknown user or unknown team' })
      }
    
      const isAddFavorisTeam = await newBar.removeFavoriteTeam(bar, team) 
      
      if (!isAddFavorisTeam) {
        return res.status(401).json({ message:  'Impossible to delete the team' })
      }

      res.status(200).json({ message: 'Team removed from favorites' })
    } 
    catch (error) {
      console.log(error)
      res.status(500).json({ message: 'Internal error' })
    }
  }

 
  addFavorisLeagueController = async (req, res) => {
    try {
      const leagueId = req.body.leagueId
      const barId = req.body.barId
      const isvalidLeagueId = leagueId && IS_NUMBER.test(leagueId)
      const isvalidbarId = barId && IS_NUMBER.test(barId)

      if (!isvalidLeagueId || !isvalidbarId){
        return res.status(401).json({ message: 'The bar id or league id is not a number.' })
      }

      const newBar = barInstance(this.#bddTarget)
      
      const bar = await newBar.getBar(barId)
      const league = await newBar.getLeague(leagueId)

      if (!bar || !league){
        return res.status(401).json({ message: 'Unknown user or unknown league' })
      }
    
      const isAddFavorisLeague = await newBar.addFavoriteLeague(bar, league) 
      
      if (!isAddFavorisLeague) {
        return res.status(401).json({ message:  'The league already exist' })
      }

      res.status(200).json({ message: 'League added to favorites' })
    } 
    catch (error) {
      console.log(error)
      res.status(500).json({ message: 'Internal error' })
    }
  }

  deleteFavorisLeagueController = async (req, res) => {
    try {
      const leagueId = req.body.leagueId
      const barId = req.body.barId
      const isvalidLeagueId = leagueId && IS_NUMBER.test(leagueId)
      const isvalidbarId = barId && IS_NUMBER.test(barId)

      if (!isvalidLeagueId || !isvalidbarId){
        return res.status(401).json({ message: 'The bar id or league id is not a number.' })
      }

      const newBar = barInstance(this.#bddTarget)
      
      const bar = await newBar.getBar(barId)
      const league = await newBar.getLeague(leagueId)

      if (!bar || !league){
        return res.status(401).json({ message: 'Unknown user or league' })
      }
    
      const isAddFavorisLeague = await newBar.removeFavoriteLeague(bar, league) 
      
      if (!isAddFavorisLeague) {
        return res.status(401).json({ message: 'Impossible to deleted the league' })
      }

      res.status(200).json({ message: 'League removed from favorites' })
    } 
    catch (error) {
      console.log(error)
      res.status(500).json({ message: 'Internal error' })
    }
  }

  matchesPlanningsController = async (req, res) => {
    try {
      const matchId = req.body.matchId
      const barId = req.body.barId
      const isvalidMatchId = matchId && IS_NUMBER.test(matchId)
      const isvalidbarId = barId && IS_NUMBER.test(barId)
      
      if (!isvalidMatchId || !isvalidbarId){
        return res.status(401).json({ message: 'l\'id bar ou l\'id du match n\'est pas un number' })
      }

      const newBar = barInstance(this.#bddTarget)
      
      const bar = await newBar.getBar(barId)
      const match = await newBar.getMatchById(matchId)

      if (!bar || !match){
        return res.status(401).json({ message: 'Utilisateur inconnu ou match inconnu' })
      }
    
      const isAddFavorisLeague = await newBar.matchesPlannings(barId, matchId) 
      
      if (!isAddFavorisLeague) {
        return res.status(401).json({ message: 'Impossible de plannifié le match' })
      }

      res.status(200).json({ message: 'Match planifié' })
    } 
    
    catch (error) {
      console.error(error) 
      res.status(500).json({ message: 'Internal error' }) 
    }
  }

}