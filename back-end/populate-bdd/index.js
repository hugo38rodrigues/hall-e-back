const axios = require('axios');
require('dotenv').config()
const TOKEN_API = process.env.TOKEN_API_PANDASCORE

const options = {
  method: 'GET',
  url: 'https://api.pandascore.co/lol/matches/upcoming',
  headers: {
    'Accept': 'application/json',
    'Authorization': `Bearer ${TOKEN_API}`
  }
};

async function getUpComingMatchesLol() {
  try {
    const response = await axios(options);
    console.log(response.data[8].begin_at);
  } catch (error) {
    console.error('Error:', error);
  }
}

getUpComingMatchesLol();