import {format} from 'date-fns'

export class Match {
  constructor() {
  }

  isValid = (value) => {
    return value !== null && value !== '' && value !== undefined;
  }

  createdMatches = (arrayData) => {
    const dataForMatch = arrayData.map((data) => {
      const idMatch = data.id;
      const date = format(new Date(data.begin_at), 'yyyy-MM-dd HH:mm:ss');
      const gameName = data.videogame?.slug;
      const leagueName = data.league?.name;
      const teamsName = data.opponents?.map(opponent => opponent.opponent?.acronym) || [];

      // Vérification spécifique pour teamsNames
      if (teamsName.length !== 2) {
        return null;
      }

      if (this.isValid(idMatch) && this.isValid(date) && this.isValid(gameName) && this.isValid(leagueName) && teamsName.every(this.isValid)) {
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

    return dataForMatch.filter(item => item !== null);
  }


}
