import { consumerInstance } from '../config/db.config.js'

export class ConsumerController {
  #bddTarget

  constructor () {
    this.#bddTarget = process.env.BDD_TARGET
  }    

  getMatchController= async (req, res) => {
    try {
      if (req){
        console.log(req)
        return res.status(400).json({ mesage: 'Error not use payload' })
      }

      const consumer = consumerInstance(this.#bddTarget)
      const allMatches = await consumer.getMatch()

      if (await allMatches){
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

  addFavorisMatchController = (req, res) => {}
  addFavorisGameController = (req, res) => {}
  addFavorisTeamController = (req, res) => {}
  addFavorisLeagueController = (req, res) => {}
  addLikeBarController = (req, res) => {}
  addCommentsController = (req, res) => {}

}