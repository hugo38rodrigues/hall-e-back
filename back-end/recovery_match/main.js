// import { CreateTables } from "./bdd-config/create-tables.js";
import { Dispatcher } from './classes/Dispatcher.js'

const TOKEN_API = process.env.TOKEN_API_PANDASCORE
const BDD_TARGET = process.env.BDD_TARGET
const optionLol = {
  method: 'GET',
  url: 'https://api.pandascore.co/lol/matches/upcoming',
  headers: {
    'Accept': 'application/json',
    'Authorization': `Bearer ${TOKEN_API}`
  }
}
const optionCs = {
  method: 'GET',
  url: 'https://api.pandascore.co/csgo/matches/upcoming',
  headers: {
    'Accept': 'application/json',
    'Authorization': `Bearer ${TOKEN_API}`
  }
}
const optionValorant = {
  method: 'GET',
  url: 'https://api.pandascore.co/valorant/matches/upcoming',
  headers: {
    'Accept': 'application/json',
    'Authorization': `Bearer ${TOKEN_API}`
  }
}
console.log(TOKEN_API)
console.log(BDD_TARGET)
const lol = new Dispatcher(optionLol, BDD_TARGET)
const cs = new Dispatcher(optionCs, BDD_TARGET)
const valorant = new Dispatcher(optionValorant, BDD_TARGET)


if (process.env.MODE_DEV) {
  console.log("Mode dev")
}
await lol.createdMatchesLol()
await cs.createdMatchesValorant()
await valorant.createdMatchesCs()



