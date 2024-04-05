const axios = require('axios');

const options = {
  method: 'GET',
  url: 'https://api.pandascore.co/lol/matches/upcoming',
  headers: {
    'Accept': 'application/json',
    'Authorization': 'Bearer d4IuV4C2nQrDTvlPjKSXIoJqNP6B4ySOwqoqcVORoGlEk7wmBo0'
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