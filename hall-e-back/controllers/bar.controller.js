import { barInstance } from '../utils/classes-instance-dispatcher.js'
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


  matchesPlanningsController = async (req, res) => {
    try {
      const matchId = req.body.matchId
      const barId = req.body.barId
      const isvalidMatchId = matchId && IS_NUMBER.test(matchId)
      const isvalidBarId = barId && IS_NUMBER.test(barId)
      
      if (!isvalidMatchId || !isvalidBarId){
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