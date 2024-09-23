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
  
  // Relation N:M avec Consumer => Game 
  db.Consumer.belongsToMany(db.Game, {
      through: 'ConsumerGameFavorites',
      as: 'favoriteGames',
      foreignKey: 'consumerId', // Ajout de foreignKey pour plus de clarté
  })

  db.Game.belongsToMany(db.Consumer, {
      through: 'ConsumerGameFavorites',
      as: 'favoritedByConsumers',
      foreignKey: 'gameId', // Ajout de foreignKey pour plus de clarté
  })

  // Relation N:M avec Consumer => Team
  db.Consumer.belongsToMany(db.Team, {
      through: 'ConsumerTeamFavorites',
      as: 'favoriteTeams',
      foreignKey: 'consumerId', // Ajout de foreignKey pour plus de clarté
  })

  db.Team.belongsToMany(db.Consumer, {
      through: 'ConsumerTeamFavorites',
      as: 'favoritedByConsumers',
      foreignKey: 'teamId', // Ajout de foreignKey pour plus de clarté
  })

  // Relation N:M avec Consumer => League
  db.Consumer.belongsToMany(db.League, {
      through: 'ConsumerLeagueFavorites',
      as: 'favoriteLeagues',
      foreignKey: 'consumerId', // Ajout de foreignKey pour plus de clarté
  })

  db.League.belongsToMany(db.Consumer, {
      through: 'ConsumerLeagueFavorites', // Utiliser la même table de liaison
      as: 'favoritedByConsumers', // Corrigé pour être cohérent
      foreignKey: 'leagueId', // Ajout de foreignKey pour plus de clarté
  })

  // Relation N:M avec Bar => Game 
  db.Bar.belongsToMany(db.Game, {
      through: 'BarGameFavorites',
      as: 'favoriteGamesBar',
      foreignKey: 'barId', // Ajout de foreignKey pour plus de clarté
  })

  db.Game.belongsToMany(db.Bar, {
      through: 'BarGameFavorites',
      as: 'favoritedByBars',
      foreignKey: 'gameId', // Ajout de foreignKey pour plus de clarté
  })

  // Relation N:M avec Bar => Team
  db.Bar.belongsToMany(db.Team, {
      through: 'BarTeamFavorites',
      as: 'favoriteTeamsBar',
      foreignKey: 'barId', // Ajout de foreignKey pour plus de clarté
  })

  db.Team.belongsToMany(db.Bar, {
      through: 'BarTeamFavorites',
      as: 'favoritedByBars',
      foreignKey: 'teamId', // Ajout de foreignKey pour plus de clarté
  })

  // Relation N:M avec Bar => League
  db.Bar.belongsToMany(db.League, {
      through: 'BarLeagueFavorites',
      as: 'favoriteLeaguesBar', // Corrigé pour éviter l'erreur typographique
      foreignKey: 'barId', // Ajout de foreignKey pour plus de clarté
  })

  db.League.belongsToMany(db.Bar, {
      through: 'BarLeagueFavorites', // Utiliser la même table de liaison
      as: 'favoritedByBars', // Corrigé pour être cohérent
      foreignKey: 'leagueId', // Ajout de foreignKey pour plus de clarté
  })

  // Relation N:M avec Consumer => Like
  db.Consumer.belongsToMany(db.Bar, {
    through: 'Likes',    
    as: 'likedBars',     
    foreignKey: 'consumerId' 
  })

  
  db.Bar.belongsToMany(db.Consumer, {
    through: 'Likes',   
    as: 'likers',       
    foreignKey: 'barId'
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

  db.Consumer.hasMany(db.Comment, {
    foreignKey: 'consumerId'
  })

  // Relation N:1 avec Consumer (un commentaire appartient à un consumer)
  db.Comment.belongsTo(db.Consumer, {
    foreignKey: 'consumerId',
    as: 'Consumers',
    allowNull: false
  })

  // Relation N:M avec Bar et Match
  db.Bar.belongsToMany(db.Match, { through: db.BarMatch })
  db.Match.belongsToMany(db.Bar, { through: db.BarMatch })
}
