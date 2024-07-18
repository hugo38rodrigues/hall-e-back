import axios from "axios"
import { format } from 'date-fns'

export class Match {

  #urlConnection

  constructor(urlConnection) {
    this.#urlConnection = urlConnection
  }

  #checkedData = (match) => {
    return match !== null && match !== '' && match !== undefined;
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
      const gameName = data.videogame?.slug;
      const leagueName = data.league?.name;
      const teamsName = data.opponents?.map(opponent => opponent.opponent?.acronym) || [];

      // Vérification spécifique pour teamsNames
      if (teamsName.length !== 2) {
        return null;
      }

      if (this.#checkedData(idMatch) && this.#checkedData(date) && this.#checkedData(gameName) && this.#checkedData(leagueName) && teamsName.every(this.#checkedData)) {
        return {
          idMatch,
          date,
          gameName,
          leagueName,
          teamsName
        };
      } else {
        return null;
      }
    });

    return matches.filter(item => item !== null);
  }
}
