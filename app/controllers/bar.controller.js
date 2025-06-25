import { databaseFactory } from '@hugo38rodrigues/bdd-service-hall-e'
import { Logger } from '../midleware/logger.js'
import { errorServer } from '../utils/messages.js'

export class BarController {


  constructor () {
   this.newLogger = new Logger()
  }

  matchesPlanningsController = async (req, res) => {
    try {
      const { matchId, barId } = req.body

      const databaseInstance = databaseFactory()
      const userInstance = await databaseInstance.usersInstances()
      const barInstance = await databaseInstance.barInstance()

      await databaseInstance.connectDb()
      const bar = await userInstance.getUserById(barId)
			const match = await userInstance.getMatchById(matchId)

      if (!bar || !match) {
        this.newLogger.error('User or match unknow')
				return res.status(401).json({ message: 'Utilisateur inconnu ou match inconnu' })
			}
     
      const addProgrammed = await barInstance.addProgrammedMatch({ barId, matchId }) 
      
      if (!addProgrammed) {
        this.newLogger.error('Impossible planned match')
				return res.status(401).json({ message: 'Impossible de plannifié le match' })
			}

      res.status(200).json({ message: 'Match planifié' })
      await databaseInstance.disconnectDb()
    } 
    
    catch (error) {
      this.newLogger.error(error)
      res.status(500).json({ message: errorServer  }) 
    }
  }

  deletedMatchProgramming = async (req, res) => {
    try {
    const { matchId, barId } = req.body
    const databaseInstance = databaseFactory()

		const userInstance = await databaseInstance.usersInstances()
		const barInstance = await databaseInstance.barInstance()

		await databaseInstance.connectDb()
		const bar = await userInstance.getUserById(barId)
		const match = await userInstance.getMatchById(matchId)

		if (!bar || !match) {
      this.newLogger.error('User or match unknow')
			return res.status(401).json({ message: 'Utilisateur inconnu ou match inconnu' })
		}

    const isDeleted = await barInstance.deletedProgMatch({ matchId, barId })
    if (!isDeleted){
      this.newLogger.error('Impossible to deleted match')
      return res.status(401).json({ message: 'Impossible de supprimé le match' })
		}
    
    this.newLogger.info(isDeleted)
    res.status(200).json(matchId)
    await databaseInstance.disconnectDb() 
  }    
    catch (error) {
      this.newLogger.error(error)
      res.status(500).json({ message: errorServer  }) 
    }
  }

}

