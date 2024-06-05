import { getUpComingMatchesLol, LolMatches } from "./Lol/index.js";
import { createTables } from "./config-bdd/create-tables.js";


const dynamoDBConfig = {
  region: 'ap-euw-2',
  endpoint: "http://localhost:8000",
  accessKeyId: 'fakeMyAccessKeyId',
  secretAccessKey: 'fakeSecretAccessKe'
};
const modDev = true
const lolMatches = new LolMatches

const main = async () => {
  if (modDev) {
    console.log("courocuecz")
    createTables()

  }

  try {
    await lolMatches.getUpComingMatchesLol(dynamoDBConfig)

  }
  catch (error) {
    console.log(error)
  }
}


main()

