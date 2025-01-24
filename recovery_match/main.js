import { databaseFactory } from 'bdd-service-hall-e/main.js'
import dotenv from 'dotenv'
import { Match } from './classes/Match.js'
import { optionCs, optionLol, optionValorant } from './utils/constants.utils.js'

dotenv.config()
const lol = new Match(optionLol)
const csGo = new Match(optionCs)
const valorant = new Match(optionValorant)

console.log('############ START CREATED MATCH ############')
const lolMatches = await lol.createdMatch()
const csMatches = await csGo.createdMatch()
const valorantMatches = await valorant.createdMatch()
console.log('############ END CREATED MATCH ############')

console.log('############ START SAVING MATCH ############')

const databaseInstance = databaseFactory()
const recoveryMatches = await databaseInstance.database.recoveryMatchesInstance()
await databaseInstance.connectDb()

await lol.processMatches(lolMatches, recoveryMatches)
await csGo.processMatches(csMatches, recoveryMatches)
await valorant.processMatches(valorantMatches, recoveryMatches)



await databaseInstance.disconnectDb()


console.log('############ END SAVING MATCH ############')
process.exit(1)
