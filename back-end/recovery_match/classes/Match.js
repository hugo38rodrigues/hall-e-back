export class Match {
  constructor() {
  }

  isValid = (value) => {
    return value !== null && value !== '' && value !== undefined;
  }

  createdMatches = (arrayData) => {
    const dataForMatch = arrayData.map((data) => {
      const idMatch = data.id;
      const date = data.begin_at;
      const nameGame = data.videogame?.slug;
      const leagueName = data.league?.name;
      const teamsNames = data.opponents?.map(opponent => opponent.opponent?.acronym) || [];

      // Vérification spécifique pour teamsNames
      if (teamsNames.length !== 2) {
        return null;
      }

      if (this.isValid(idMatch) && this.isValid(date) && this.isValid(nameGame) && this.isValid(leagueName) && teamsNames.every(this.isValid)) {
        return {
          idMatch,
          date,
          nameGame,
          leagueName,
          teamsNames
        };
      } else {
        return null; // ou toute autre valeur par défaut indiquant une validation échouée
      }
    });

    // Filtrer les éléments nuls si nécessaire
    return dataForMatch.filter(item => item !== null);
  }


}
