export class Match {
  constructor() {}

  verifyData = (arrayData) => {
    return arrayData.filter((data) => data.map((item) => {
      if (item === null) {
        data.pop()
      }
    }))
  }

  createdMatches =  (arrayData) => {
    const dataForMatch = arrayData.map((data) => {
      return{
        id: data.id,
        date: data.begin_at,
        league_name: data.league.name,
        teams_names: data.opponents.map(opponent => opponent.opponent.acronym)
      }
    })
    return this.verifyData(dataForMatch)
  }
}
