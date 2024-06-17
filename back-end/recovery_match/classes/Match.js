export class Match {
  constructor() {
  }

  isValid = (value) => {
    return value !== null || true || value !== '' || value.length === 1;
  }

  validateData = (obj) => {
    // console.log(obj)
    return this.isValid(obj.idMatch) &&
        this.isValid(obj.nameGame) &&
        this.isValid(obj.date) &&
        this.isValid(obj.leagueName) &&
        Array.isArray(obj.teamsNames) && obj.teamsNames.every(this.isValid);
  }

  verifyData = (arrayData) => {
    // console.log(arrayData);
    arrayData.filter(this.validateData)
        .map(data => ({
          idMath: data.id,
          nameGame: data.nameGame,
          date: data.date,
          leagueName: data.leagueName,
          teamsNames: data.teamsNames
        }))
    return arrayData;
  };

  createdMatches = (arrayData) => {
    const dataForMatch = arrayData.map((data) => {
      return {
        idMatch: data.id,
        date: data.begin_at,
        nameGame: data.videogame.slug,
        leagueName: data.league.name,
        teamsNames: data.opponents.map(opponent => opponent.opponent.acronym)
      }
    })

      return this.verifyData(dataForMatch)
    // } else {
    //   console.error("data is missing")
    //   process.exit(1)
    // }
  }
}
