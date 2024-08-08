import axios from "axios"
import { format } from 'date-fns'

export class Match {

  #urlConnection

  constructor(urlConnection) {
    this.#urlConnection = urlConnection
  }

  #checkedData = (value) => {
    return value === null || value === '' || value === undefined;
  }

  #formatedDate = (date) => {
    const curentYears = new Date().getFullYear()
    const formatedDate = format(new Date(date), 'yyyy-MM-dd HH:mm:ss')
    const dateObj = new Date(formatedDate.replace(' ', 'T'));
    if (dateObj.getFullYear() === curentYears) {
      return formatedDate
    } else {
      return null
    }
  }

  #getData = async (urlConnection) => {
    try {
      const response = await axios(urlConnection);
      if (response.status === 200) {
        return response.data;
      }
      else {
        console.log(`Error while retrieving data from api ${response}`)
        process.exit()
      }

    } catch (error) {
      console.error('Error:', error);
      process.exit()
    }
  }

  createdMatch = async () => {
    const responseData = await this.#getData(this.#urlConnection)
    const matches = responseData.map((data) => {
      const idMatch = data.id;
      const date = this.#formatedDate(data.begin_at)
      const gameName = data.videogame.slug;
      const leagueName = data.league.name;
      let [team1, team2] = data.opponents.map(opponent => opponent.opponent.acronym) || []
      const isNotEmptyData = this.#checkedData(idMatch) && this.#checkedData(date) && this.#checkedData(gameName) && this.#checkedData(leagueName) && this.#checkedData(team1) && this.#checkedData(team2)

      if (isNotEmptyData ) {
        return null;
      }

      return {
        idMatch,
        date,
        gameName,
        team1,
        team2
      };
    });

    return matches.filter(item => item !== null);
  }
}
