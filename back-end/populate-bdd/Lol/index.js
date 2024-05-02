import axios from 'axios';
import { config } from 'dotenv';
import { DynamoDBStorage } from '../config-bdd/dynamo-db';

config("../.env")
const TOKEN_API = process.env.TOKEN_API_PANDASCORE

const options = {
  method: 'GET',
  url: 'https://api.pandascore.co/lol/matches/upcoming',
  headers: {
    'Accept': 'application/json',
    'Authorization': `Bearer ${TOKEN_API}`
  }
};

let dataMatchesLol = []

export const getUpComingMatchesLol = async (config) => {
  const dynamoDb = new DynamoDBStorage(config)


  try {
    const response = await axios(options);
    const data = response.data.map(match => ({
      date: match.begin_at,
      league_name: match.league.name,
      opponents_acronyms: match.opponents.map(opponent => opponent.opponent.acronym)
    }));
    dataMatchesLol.push(data)
    dynamoDb.saveLolMatch(dataMatchesLol)

  } catch (error) {
    console.error('Error:', error)
  }

}

