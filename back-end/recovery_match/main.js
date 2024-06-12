import { Match } from "./classes/Match.js";
// import { CreateTables } from "./bdd-config/create-tables.js";
import { GetData } from "./classes/GetData.js";
import { SavingMatches } from "./classes/SavingMatches.js";

const TOKEN_API = process.env.TOKEN_API_PANDASCORE
const BDD_TARGET = process.env.TARGET_BDD

const dynamoDBConfig = {
  region: 'ap-euw-2',
  endpoint: "http://localhost:8000",
  accessKeyId: 'fakeMyAccessKeyId',
  secretAccessKey: 'fakeSecretAccessKe'
};
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
const getLolData = new GetData(optionLol)
const getCsData = new GetData(optionCs)
const getValorantData = new GetData(optionValorant)
const matches = new Match()
const savingMatches = new SavingMatches(dynamoDBConfig)


const main = async () => {
  const lolData = await getLolData.getDatas()
  const csData = await getCsData.getDatas()
  const valorantData = await getValorantData.getDatas()

  const lolMatches =  matches.createdMatches(lolData)
  const csMatches = matches.createdMatches(csData)
  const valorantMatches = matches.createdMatches(valorantData)

  await savingMatches.saveMatches(lolMatches,"lol_match")
  await savingMatches.saveMatches(csMatches, "cs_match")
  await savingMatches.saveMatches(valorantMatches, "valorant_match")
}

switch (BDD_TARGET) {
  case 'dynamoDb':
    if (modDev) {
      // const dynamoDb = CreateTables(dynamoDBConfig, ['lol_tables', 'cs_table', 'valorant_table'])
      // dynamoDb.ge
      console.log("ouais")
      await main()
    }
    break;
  case 'sql':
    if (modDev) {
      // const sqlDb = CreateTables(dynamoDBConfig, ['lol_tables', 'cs_table', 'valorant_table'])
      // sqlDb.ge
      console.log("sql")
      await main()
    }
    break;
  case 'MangoDb':
    if (modDev) {
      const mangoDb = CreateTables(dynamoDBConfig, ['lol_tables', 'cs_table', 'valorant_table'])
      mangoDb.ge
      await main()
    }
    break;
  default:
    console.log(`Sorry, we are out of ${BDD_TARGET}.`);
    break;
}



