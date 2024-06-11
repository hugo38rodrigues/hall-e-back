import { Match } from "./classes/Match.js";
import { CreateTables } from "./bdd-config/create-tables.js";
import { GetData } from "./classes/GetData";
import { config } from 'dotenv';
import { SavingMatches } from "./classes/SavingMatches";
config();


const TOKEN_API = process.env.TOKEN_API_PANDASCORE
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
  if (modDev) {
    const createTables = CreateTables()
  }
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

await main()

