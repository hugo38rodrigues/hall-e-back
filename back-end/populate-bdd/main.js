import { Match } from "./classes/Match.js";
import { createTables } from "./config-bdd/create-tables.js";
import {GetData} from "./classes/GetData";
import { config } from 'dotenv';
config();


const dynamoDBConfig = {
  region: 'ap-euw-2',
  endpoint: "http://localhost:8000",
  accessKeyId: 'fakeMyAccessKeyId',
  secretAccessKey: 'fakeSecretAccessKe'
};
const TOKEN_API = process.env.TOKEN_API_PANDASCORE
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
const lolMatches = new Match()


const main = async () => {
  if (modDev) {
    createTables()
  }

  const getAllData = async () => {
      return {
        lolData: await getLolData.getDatas(),
        csData: await getCsData.getDatas(),
        valorantData: await getValorantData.getDatas()
      }

  }
  const createMatches = async ({lolData, csData, valorantData}) => {
      return {
        lolMatches: lolMatches.getUpComingMatches(lolData),
        csMatches: csMatches.getUpComingMatches(csData),
        valorantMatches: valorantMatches.getUpComingMatches(valorantData)
      }
  }

  try {
    await getAllData()
    await createMatches(getAllData)
  }
  catch(error) {
    console.log(error)
  }

}

await main()

