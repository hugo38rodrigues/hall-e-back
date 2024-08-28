import { db } from './index.js'

export const setupAssociations = () => {
 
  db.Game.hasMany(db.Match, { foreignKey: 'gameId' })

  db.League.hasMany(db.Match, { foreignKey: 'leagueId' })
  
  db.Team.hasMany(db.Match, { as: 'team1Matches', foreignKey: 'team1Id' })
  db.Team.hasMany(db.Match, { as: 'team2Matches', foreignKey: 'team2Id' })

  db.Match.belongsTo(db.Game, { foreignKey: 'gameId' })
  db.Match.belongsTo(db.League, { foreignKey: 'leagueId' })
  db.Match.belongsTo(db.Team, { as: 'team1', foreignKey: 'team1Id' })
  db.Match.belongsTo(db.Team, { as: 'team2', foreignKey: 'team2Id' })
  
}
