import { setupAssociations } from './db/mysql/association.js'
import { db } from './db/mysql/index.js'
import { BDD_TARGET, DEV_MODE } from '../utils/constants.utils.js'
export const createdTables = async () => {
  

  switch (BDD_TARGET){
  case 'mysql':{
    console.log('############ START PROCESS FOR TABLES CREATION ############')
    setupAssociations()

    // Synchronisation des modèles avec la base de données
    if (DEV_MODE=== 'true'){
      await db.sequelize.sync() // Ne pas utiliser { force: true } en production !
    }

    console.log('Database initialized successfully.')
    console.log('############ END PROCESS FOR TABLES CREATION ############')
    break
  }

  case 'dynamodb':
  // console.log("############ START PROCESS FOR TABLES CREATION ############")
  // const dynamodbTable = new DynamoDbTables()
  // await dynamodbTable.createdTables()
  // console.log("############ END PROCESS FOR TABLES CREATION ############")
    break
  case 'mangodb':
  // console.log("############ START PROCESS FOR TABLES CREATION ############")
  // console.log("In progress ...")
  // console.log("############ END PROCESS FOR TABLES CREATION ############")
    break
  default:
    console.log(`############ ${BDD_TARGET} IS NOT FOUND ############`)
  }
}
