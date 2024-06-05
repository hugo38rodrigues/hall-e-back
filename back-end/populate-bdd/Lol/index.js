import axios from 'axios';
import { config } from 'dotenv';
import { DynamoDBStorage } from '../config-bdd/dynamo-db.js';
config();

export class LolMatches {
  constructor() {
    _this.TOKEN_API = process.env.TOKEN_API_PANDASCORE;
    _this.options = {
      method: 'GET',
      url: 'https://api.pandascore.co/lol/matches/upcoming',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${TOKEN_API}`
      }
    }
    _this.dataMatchesLol = []
  };


  getUpComingMatchesLol = async (config) => {
    const dynamoDb = new DynamoDBStorage(config);

    try {
      const response = await axios(this.options);
      const data = response.data.map(match => ({
        id: match.id,
        date: match.begin_at,
        leagueName: match.league.name,
        teamNames: match.opponents.map(opponent => opponent.opponent.acronym)
      }));
      dataMatchesLol.push(data);
      await dynamoDb.saveLolMatch(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };
}
