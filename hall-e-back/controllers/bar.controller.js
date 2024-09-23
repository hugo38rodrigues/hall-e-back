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
      return res.status(500).json({ message: 'Internal Error' })
    }
  }

  addFavorisGameController = async (req, res) => {
    try {
      const gameId = req.body.gameId
      const barId = req.body.barId
      const isvalidGameId = gameId && IS_NUMBER.test(gameId)
      const isvalidbarId = barId && IS_NUMBER.test(barId)

      if (!isvalidGameId || !isvalidbarId){
        return res.status(401).json({ message: 'l\'id bar ou l\'id du jeux n\'est pas un number' })
      }

      const newBar = barInstance(this.#bddTarget)
      
      const bar = await newBar.getBar(barId)
      const game = await newBar.getGame(gameId)

      if (!bar || !game){
        return res.status(401).json({ message: 'Utilisateur inconnu ou jeux inconnu' })
      }
    
      const isAddFavorisGame = await newBar.addFavoriteGame(bar, game) 
      
      if (!isAddFavorisGame) {
        return res.status(401).json({ message:  'Le jeux existe déjà' })
      }

      res.status(200).json({ message: 'Jeux ajouté au favoris' })
    } 
    catch (error) {
      console.log(error)
      res.status(500).json({ message: 'Internal Error' })
    }
  }

  deleteFavorisGameController = async (req, res) => {
    try {
      const gameId = req.body.gameId
      const barId = req.body.barId
      const isvalidGameId = gameId && IS_NUMBER.test(gameId)
      const isvalidbarId = barId && IS_NUMBER.test(barId)

      if (!isvalidGameId || !isvalidbarId){
        return res.status(401).json({ message: 'l\'id bar ou l\'id du jeux n\'est pas un number' })
      }

      const newBar = barInstance(this.#bddTarget)
      
      const bar = await newBar.getBar(barId)
      const game = await newBar.getGame(gameId)

      if (!bar || !game){
        return res.status(401).json({ message: 'Utilisateur inconnu ou jeux inconnu' })
      }
    
      const isAddFavorisGame = await newBar.removeFavoriteGame(bar, game) 
      
      if (!isAddFavorisGame) {
        return res.status(401).json({ message:  'Impossible de supprimer le jeux' })
      }

      res.status(200).json({ message: 'Jeux supprimé des favoris' })
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
        return res.status(401).json({ message: 'l\'id bar ou l\'id de l\'équipe n\'est pas un number' })
      }

      const newBar = barInstance(this.#bddTarget)
      
      const bar = await newBar.getBar(barId)
      const team = await newBar.getTeam(teamId)

      if (!bar || !team){
        return res.status(401).json({ message: 'Utilisateur inconnu ou équipe inconnu' })
      }
    
      const isAddFavorisTeam = await newBar.addFavoriteTeam(bar, team) 
      
      if (!isAddFavorisTeam) {
        return res.status(401).json({ message:  'L\'équipe existe déjà' })
      }

      res.status(200).json({ message: 'Équipe ajouté au favoris' })
    } 
    catch (error) {
      console.log(error)
      res.status(500).json({ message: 'Internal Error' })
    }
  }

  deleteFavorisTeamController = async (req, res) => {
    try {
      const teamId = req.body.teamId
      const barId = req.body.barId
      const isvalidGameId = teamId && IS_NUMBER.test(teamId)
      const isvalidbarId = barId && IS_NUMBER.test(barId)

      if (!isvalidGameId || !isvalidbarId){
        return res.status(401).json({ message: 'l\'id bar ou l\'id de l\'équipe n\'est pas un number' })
      }

      const newBar = barInstance(this.#bddTarget)
      
      const bar = await newBar.getBar(barId)
      const team = await newBar.getTeam(teamId)

      if (!bar || !team){
        return res.status(401).json({ message: 'Utilisateur inconnu ou équipe inconnu' })
      }
    
      const isAddFavorisTeam = await newBar.removeFavoriteTeam(bar, team) 
      
      if (!isAddFavorisTeam) {
        return res.status(401).json({ message:  'Impossible de supprimé l\'équipe' })
      }

      res.status(200).json({ message: 'Équipe supprimé au favoris' })
    } 
    catch (error) {
      console.log(error)
      res.status(500).json({ message: 'Internal Error' })
    }
  }

 
  addFavorisLeagueController = async (req, res) => {
    try {
      const leagueId = req.body.leagueId
      const barId = req.body.barId
      const isvalidLeagueId = leagueId && IS_NUMBER.test(leagueId)
      const isvalidbarId = barId && IS_NUMBER.test(barId)

      if (!isvalidLeagueId || !isvalidbarId){
        return res.status(401).json({ message: 'l\'id bar ou l\'id de la compétition n\'est pas un number' })
      }

      const newBar = barInstance(this.#bddTarget)
      
      const bar = await newBar.getBar(barId)
      const league = await newBar.getLeague(leagueId)

      if (!bar || !league){
        return res.status(401).json({ message: 'Utilisateur inconnu ou compétiton inconnu' })
      }
    
      const isAddFavorisLeague = await newBar.addFavoriteLeague(bar, league) 
      
      if (!isAddFavorisLeague) {
        return res.status(401).json({ message:  'La compétition existe déjà' })
      }

      res.status(200).json({ message: 'Compétiton ajouté au favoris' })
    } 
    catch (error) {
      console.log(error)
      res.status(500).json({ message: 'Internal Error' })
    }
  }

  deleteFavorisLeagueController = async (req, res) => {
    try {
      const leagueId = req.body.leagueId
      const barId = req.body.barId
      const isvalidLeagueId = leagueId && IS_NUMBER.test(leagueId)
      const isvalidbarId = barId && IS_NUMBER.test(barId)

      if (!isvalidLeagueId || !isvalidbarId){
        return res.status(401).json({ message: 'l\'id bar ou l\'id de l\'équipe n\'est pas un number' })
      }

      const newBar = barInstance(this.#bddTarget)
      
      const bar = await newBar.getBar(barId)
      const league = await newBar.getLeague(leagueId)

      if (!bar || !league){
        return res.status(401).json({ message: 'Utilisateur inconnu ou équipe inconnu' })
      }
    
      const isAddFavorisLeague = await newBar.removeFavoriteLeague(bar, league) 
      
      if (!isAddFavorisLeague) {
        return res.status(401).json({ message: 'Impossible de supprimé la compétition' })
      }

      res.status(200).json({ message: 'Compétition supprimé au favoris' })
    } 
    catch (error) {
      console.log(error)
      res.status(500).json({ message: 'Internal Error' })
    }
  }
}