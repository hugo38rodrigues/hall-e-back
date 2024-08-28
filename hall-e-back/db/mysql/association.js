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
   db.Consumer.hasMany(db.Comment, {
    foreignKey: 'consumerId'
  })

  db.Consumer.belongsToMany(db.Game, {
    through: 'ConsumerGameFavorites',
    as: 'favoriteGames',
    allowNull: false
  })

  // Relation N:M avec League (favorites)
  db.Consumer.belongsToMany(db.League, {
    through: 'ConsumerLeagueFavorites',
    as: 'favoriteLeagues',
  })

  // Relation N:M avec Team (favorites)
  db.Consumer.belongsToMany(db.Team, {
    through: 'ConsumerTeamFavorites',
    as: 'favoriteTeams',
    allowNull: false
  })

  // Relation 1:N avec Comment (un consumer peut écrire plusieurs Comments)
 

   db.Bar.hasMany(db.Comment, {
      foreignKey: 'barId',
      allowNull: false
    })

    
    // Relation N:1 avec Bar (un commentaire appartient à un bar)
    db.Comment.belongsTo(db.Bar, {
      foreignKey: 'barId',
      allowNull: false
    })

    // Relation N:1 avec Consumer (un commentaire appartient à un consumer)
    db.Comment.belongsTo(db.Consumer, {
      foreignKey: 'consumerId',
      as: 'Consumers',
      allowNull: false
    })

    db.League.belongsToMany(db.Consumer, {
      through: 'ConsumerLeagueFavorites',
      as: 'favoritedByConsumers',
      allowNull: false
    })

    db.Game.belongsToMany(db.Consumer, {
      through: 'ConsumerGameFavorites',
      as: 'favoritedByConsumers',
      allowNull: false
    })


    // Relation N:M avec Consumer (favoris)
    db.Team.belongsToMany(db.Consumer, {
      through: 'ConsumerTeamFavorites',
      as: 'favoritedByConsumers',
      allowNull: false
    })
}
