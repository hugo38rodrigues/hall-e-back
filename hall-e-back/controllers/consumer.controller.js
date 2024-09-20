import { consumerInstance } from '../config/db.config.js'
import { IS_NUMBER } from '../utils/regex.js'
export class ConsumerController {
  #bddTarget

  constructor () {
    this.#bddTarget = process.env.BDD_TARGET
  }    

  getMatchController= async (req, res) => {
    try {
      const consumer = consumerInstance(this.#bddTarget)
      const allMatches = await consumer.getMatch()

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
      const consumerId = req.body.consumerId
      const isvalidGameId = gameId && IS_NUMBER.test(gameId)
      const isvalidConsumerId = consumerId && IS_NUMBER.test(consumerId)

      if (!isvalidGameId || !isvalidConsumerId){
        return res.status(401).json({ message: 'l\'id consumer ou l\'id du jeux n\'est pas un number' })
      }

      const newConsumer = consumerInstance(this.#bddTarget)
      
      const consumer = await newConsumer.getConsumer(consumerId)
      const game = await newConsumer.getGame(gameId)

      if (!consumer || !game){
        return res.status(401).json({ message: 'Utilisateur inconnu ou jeux inconnu' })
      }
    
      const isAddFavorisGame = await newConsumer.addFavoriteGame(consumer, game) 
      
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
      const consumerId = req.body.consumerId
      const isvalidGameId = gameId && IS_NUMBER.test(gameId)
      const isvalidConsumerId = consumerId && IS_NUMBER.test(consumerId)

      if (!isvalidGameId || !isvalidConsumerId){
        return res.status(401).json({ message: 'l\'id consumer ou l\'id du jeux n\'est pas un number' })
      }

      const newConsumer = consumerInstance(this.#bddTarget)
      
      const consumer = await newConsumer.getConsumer(consumerId)
      const game = await newConsumer.getGame(gameId)

      if (!consumer || !game){
        return res.status(401).json({ message: 'Utilisateur inconnu ou jeux inconnu' })
      }
    
      const isAddFavorisGame = await newConsumer.removeFavoriteGame(consumer, game) 
      
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
      const consumerId = req.body.consumerId
      const isvalidTeamId = teamId && IS_NUMBER.test(teamId)
      const isvalidConsumerId = consumerId && IS_NUMBER.test(consumerId)

      if (!isvalidTeamId || !isvalidConsumerId){
        return res.status(401).json({ message: 'l\'id consumer ou l\'id de l\'équipe n\'est pas un number' })
      }

      const newConsumer = consumerInstance(this.#bddTarget)
      
      const consumer = await newConsumer.getConsumer(consumerId)
      const team = await newConsumer.getTeam(teamId)

      if (!consumer || !team){
        return res.status(401).json({ message: 'Utilisateur inconnu ou équipe inconnu' })
      }
    
      const isAddFavorisTeam = await newConsumer.addFavoriteTeam(consumer, team) 
      
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
      const consumerId = req.body.consumerId
      const isvalidGameId = teamId && IS_NUMBER.test(teamId)
      const isvalidConsumerId = consumerId && IS_NUMBER.test(consumerId)

      if (!isvalidGameId || !isvalidConsumerId){
        return res.status(401).json({ message: 'l\'id consumer ou l\'id de l\'équipe n\'est pas un number' })
      }

      const newConsumer = consumerInstance(this.#bddTarget)
      
      const consumer = await newConsumer.getConsumer(consumerId)
      const team = await newConsumer.getTeam(teamId)

      if (!consumer || !team){
        return res.status(401).json({ message: 'Utilisateur inconnu ou équipe inconnu' })
      }
    
      const isAddFavorisTeam = await newConsumer.removeFavoriteTeam(consumer, team) 
      
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
      const consumerId = req.body.consumerId
      const isvalidLeagueId = leagueId && IS_NUMBER.test(leagueId)
      const isvalidConsumerId = consumerId && IS_NUMBER.test(consumerId)

      if (!isvalidLeagueId || !isvalidConsumerId){
        return res.status(401).json({ message: 'l\'id consumer ou l\'id de la compétition n\'est pas un number' })
      }

      const newConsumer = consumerInstance(this.#bddTarget)
      
      const consumer = await newConsumer.getConsumer(consumerId)
      const league = await newConsumer.getLeague(leagueId)

      if (!consumer || !league){
        return res.status(401).json({ message: 'Utilisateur inconnu ou compétiton inconnu' })
      }
    
      const isAddFavorisLeague = await newConsumer.addFavoriteLeague(consumer, league) 
      
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
      const consumerId = req.body.consumerId
      const isvalidLeagueId = leagueId && IS_NUMBER.test(leagueId)
      const isvalidConsumerId = consumerId && IS_NUMBER.test(consumerId)

      if (!isvalidLeagueId || !isvalidConsumerId){
        return res.status(401).json({ message: 'l\'id consumer ou l\'id de l\'équipe n\'est pas un number' })
      }

      const newConsumer = consumerInstance(this.#bddTarget)
      
      const consumer = await newConsumer.getConsumer(consumerId)
      const league = await newConsumer.getLeague(leagueId)

      if (!consumer || !league){
        return res.status(401).json({ message: 'Utilisateur inconnu ou équipe inconnu' })
      }
    
      const isAddFavorisLeague = await newConsumer.removeFavoriteLeague(consumer, league) 
      
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

  addLikeBarController = (req, res) => {}
  addCommentsController = (req, res) => {}

}