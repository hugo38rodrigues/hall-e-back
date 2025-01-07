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

	// Client et ses favoris
	db.Client.belongsToMany(db.Game, {
		through: 'ClientGameFavorites',
		as: 'favoriteGames',
		foreignKey: 'clientId',
	})

	db.Game.belongsToMany(db.Client, {
		through: 'ClientGameFavorites',
		as: 'favoritedByClients',
		foreignKey: 'gameId',
	})

	db.Client.belongsToMany(db.Team, {
		through: 'ClientTeamFavorites',
		as: 'favoriteTeams',
		foreignKey: 'clientId',
	})

	db.Team.belongsToMany(db.Client, {
		through: 'ClientTeamFavorites',
		as: 'favoritedByClients',
		foreignKey: 'teamId',
	})

	db.Client.belongsToMany(db.League, {
		through: 'ClientLeagueFavorites',
		as: 'favoriteLeagues',
		foreignKey: 'clientId',
	})

	db.League.belongsToMany(db.Client, {
		through: 'ClientLeagueFavorites',
		as: 'favoritedByClients',
		foreignKey: 'leagueId',
	})

	// Bar et ses favoris
	db.Bar.belongsToMany(db.Game, {
		through: 'BarGameFavorites',
		as: 'favoritesGames',
		foreignKey: 'barId',
	})

	db.Game.belongsToMany(db.Bar, {
		through: 'BarGameFavorites',
		as: 'favoritedByBars',
		foreignKey: 'gameId',
	})

	db.Bar.belongsToMany(db.Team, {
		through: 'BarTeamFavorites',
		as: 'favoritesTeams',
		foreignKey: 'barId',
	})

	db.Team.belongsToMany(db.Bar, {
		through: 'BarTeamFavorites',
		as: 'favoritedByBars',
		foreignKey: 'teamId',
	})

	db.Bar.belongsToMany(db.League, {
		through: 'BarLeagueFavorites',
		as: 'favoritesLeagues',
		foreignKey: 'barId',
	})

	db.League.belongsToMany(db.Bar, {
		through: 'BarLeagueFavorites',
		as: 'favoritedByBars',
		foreignKey: 'leagueId',
	})

	// Relation N:M avec Client => Like
	db.Client.belongsToMany(db.Bar, {
		through: 'Likes',
		as: 'likedBars',
		foreignKey: 'clientId',
	})

	db.Bar.belongsToMany(db.Client, {
		through: 'Likes',
		as: 'likers',
		foreignKey: 'barId',
	})

	// Relation 1:N avec Comment (un client peut écrire plusieurs Comments)
	db.Bar.hasMany(db.Comment, {
		foreignKey: 'barId',
		allowNull: false,
	})

	// Relation N:1 avec Bar (un commentaire appartient à un bar)
	db.Comment.belongsTo(db.Bar, {
		foreignKey: 'barId',
		allowNull: false,
	})

	db.Client.hasMany(db.Comment, {
		foreignKey: 'clientId',
	})

	// Relation N:1 avec Client (un commentaire appartient à un client)
	db.Comment.belongsTo(db.Client, {
		foreignKey: 'clientId',
		as: 'Clients',
		allowNull: false,
	})

	// Relation N:M avec Bar et Match
	db.Bar.belongsToMany(db.Match, {
		through: 'BarMatchSchedules',
		as: 'scheduledMatches',
		foreignKey: 'barId',
	})

	db.Match.belongsToMany(db.Bar, {
		through: 'BarMatchSchedules',
		as: 'barsScheduling',
		foreignKey: 'matchId',
	})

	//Relation 1:N avec Bar et Image
	db.Bar.hasMany(db.Picture, { as: 'pictures', foreignKey: 'barId' })
	db.Picture.belongsTo(db.Bar, { as: 'bar', foreignKey: 'barId' })

	
}
