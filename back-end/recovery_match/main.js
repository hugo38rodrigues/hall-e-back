// import { CreateTables } from "./bdd-config/create-tables.js";
import {Index} from "./classes/index.js";

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

const lol = new Index(optionLol,BDD_TARGET, configBDD)
const cs = new Index( optionCs,BDD_TARGET, configBDD)
const valorant = new Index( optionValorant,BDD_TARGET, configBDD)


if (process.env.MODE_DEV) {
  console.log("Mode dev")
}
await lol.createdMatchesLol()
await cs.createdMatchesValorant()
await valorant.createdMatchesCs()



