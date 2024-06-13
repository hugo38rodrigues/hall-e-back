// import { CreateTables } from "./bdd-config/create-tables.js";
import {Index} from "./classes/index.js";

const TOKEN_API = process.env.TOKEN_API_PANDASCORE
const BDD_TARGET = process.env.BDD_TARGET
const configBDD = {
  region: process.env.BDD_REGION,
  endpoint: process.env.ENDPOINT,
  accessKeyId: process.env.ACCESS_KEY_ID,
  secretAccessKey: process.env.SECRET_ACCESS_KEY
}
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

const modDev = true
const lol = new Index(optionLol,BDD_TARGET, configBDD)
const cs = new Index( optionCs,BDD_TARGET, configBDD)
const valorant = new Index( optionValorant,BDD_TARGET, configBDD)

console.log(BDD_TARGET)

switch (BDD_TARGET) {
  case 'dynamodb':
    if (modDev) {
      // const dynamoDb = CreateTables(dynamoDBConfig, ['lol_tables', 'cs_table', 'valorant_table'])
      // dynamoDb.ge
      console.log("ouais")
    }
    await lol.createdMatchesLol()
    await cs.createdMatchesValorant()
    await valorant.CreatedMatchesCs()
    break;
  case 'mysql':
    if (modDev) {
      // const sqlDb = CreateTables(dynamoDBConfig, ['lol_tables', 'cs_table', 'valorant_table'])
      // sqlDb.ge
      console.log("sql")
    }
    await lol.createdMatchesLol()
    await cs.createdMatchesValorant()
    await valorant.CreatedMatchesCs()
    break;
  case 'Mangodb':
    if (modDev) {
      const mangoDb = CreateTables(dynamoDBConfig, ['lol_tables', 'cs_table', 'valorant_table'])
      mangoDb.ge
    }
    await lol.createdMatchesLol()
    await cs.createdMatchesValorant()
    await valorant.CreatedMatchesCs()
    break;
  default:
    console.log(`Sorry, we are out of ${BDD_TARGET}.`);
    break;
}



