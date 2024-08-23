import { db } from './index.js'

export const setupAssociations = () => {
  // Une partie de la configuration de l'association entre Game et Match
  db.Game.hasMany(db.Match, { foreignKey: 'gameId' })
  
  // Une partie de la configuration de l'association entre League et Match
  db.League.hasMany(db.Match, { foreignKey: 'leagueId' })
  
  // Changé les alias pour éviter les collisions
  db.Team.hasMany(db.Match, { as: 'team1Matches', foreignKey: 'team1Id' })
  db.Team.hasMany(db.Match, { as: 'team2Matches', foreignKey: 'team2Id' })

  // Définition des associations inverses
  db.Match.belongsTo(db.Game, { foreignKey: 'gameId' })
  db.Match.belongsTo(db.League, { foreignKey: 'leagueId' })
  db.Match.belongsTo(db.Team, { as: 'team1', foreignKey: 'team1Id' })
  db.Match.belongsTo(db.Team, { as: 'team2', foreignKey: 'team2Id' })
  
}
