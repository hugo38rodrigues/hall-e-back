import { databaseFactory } from 'bdd-service-hall-e'

export class BarController {


  constructor () {
   
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
				return res.status(401).json({ message: 'Utilisateur inconnu ou match inconnu' })
			}
     
      const addProgrammed = await barInstance.addProgrammedMatch({ barId, matchId }) 
      
      if (!addProgrammed) {
				return res.status(401).json({ message: 'Impossible de plannifié le match' })
			}

      res.status(200).json({ message: 'Match planifié' })
       await databaseInstance.disconnectDb()
    } 
    
    catch (error) {
      console.error(error) 
      res.status(500).json({ message: 'Internal error' }) 
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
			return res.status(401).json({ message: 'Utilisateur inconnu ou match inconnu' })
		}
    const isDeleted = await barInstance.deletedProgMatch({ matchId, barId })
    if (!isDeleted){
      return res.status(401).json({ message: 'Impossible de supprimé le match' })
		}
    console.log(isDeleted)
    res.status(200).json(matchId)
    await databaseInstance.disconnectDb() 
  }    
    catch (error) {
      console.error(error) 
      res.status(500).json({ message: 'Internal error' }) 
    }
  }

}

