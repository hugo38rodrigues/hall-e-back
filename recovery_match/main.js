import { databaseFactory, connectDb, disconnectDb } from 'bdd-service-hall-e/main.js'
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
const recoveryMatchesInstance = await databaseInstance.recoveryMatchesInstance()
await connectDb()

await lol.processMatches(lolMatches, recoveryMatchesInstance)
await csGo.processMatches(csMatches, recoveryMatchesInstance)
await valorant.processMatches(valorantMatches, recoveryMatchesInstance)



await disconnectDb()


console.log('############ END SAVING MATCH ############')
process.exit(1)
