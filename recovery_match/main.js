import { Match } from './classes/Match.js'
import { DynamoDB } from "./classes/bdd/dynamo-db.js"
import { MysqlDB } from "./classes/bdd/mysql-db.js"
import { MongoDb } from './classes/bdd/mongo-db.js'
import { DynamoDbTables } from './bdd-config/create-tables-dynamodb.js'
import {
  BDD_TARGET,
  optionCs,
  optionLol,
  optionValorant
} from "./utils/api.utils.js"


if (process.env.MODE_DEV === 'true') {
  if (BDD_TARGET === 'mysql') {
    console.log("############ START PROCESS FOR TABLES CREATION ############")
    const mysql = new MysqlDB()
    await mysql.createTables()
    console.log("############ END PROCESS FOR TABLES CREATION ############")
  }

  else if (BDD_TARGET === 'dynamodb') {
    console.log("############ START PROCESS FOR TABLES CREATION ############")
    const dynamodbTable = new DynamoDbTables()
    await dynamodbTable.createdTables()
    console.log("############ END PROCESS FOR TABLES CREATION ############")
  }
  else {
    console.log(`############ ${BDD_TARGET} IS NOT FOUND ############`)
    process.exit()
  }
}

console.log("############ START GET DATA ############")
const lol = new Match(optionLol)
// const cs = new Match(optionCs)
// const valorant = new Match(optionValorant)
console.log("############ END GET DATA ############")

console.log("############ START CREATED MATCH ############")
const lolMatch = await lol.createdMatch()
// const csMatch = await cs.createdMatch()
// const valorantMatch = await valorant.createdMatch()
console.log("############ END CREATED MATCH ############")

console.log("############ START SAVING MATCH ############")
//
// switch (BDD_TARGET) {
//   case 'dynamodb':
//     const dynamodb = new DynamoDB()
//     await dynamodb.savingMatches(lolMatch)
//     await dynamodb.savingMatches(csMatch)
//     await dynamodb.savingMatches(valorantMatch)
//     break;
//   case 'mysql':
    const mysql = new MysqlDB()
    await mysql.savingMatches(lolMatch)
//     await mysql.savingMatches(csMatch)
//     await mysql.savingMatches(valorantMatch)
//     break;
//   case 'mongodb':
//     const mongodb = new MongoDb()
//     await mongodb.savingMatches(lolMatch)
//     await mongodb.savingMatches(cs)
//     await mongodb.savingMatches(valorant)
//     break;
//   default:
//     console.log("Error bdd target is empty")
//     break;
// }
console.log("############ END SAVING MATCH ############")





