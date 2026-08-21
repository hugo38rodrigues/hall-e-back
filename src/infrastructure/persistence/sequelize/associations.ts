import type { Sequelize } from 'sequelize'
import { initBarModel } from './models/bar.model'
import { initClientModel } from './models/client.model'
import { initCodeModel } from './models/code.model'
import { initCommentModel } from './models/comment.model'
import { initFavorisModel } from './models/favoris.model'
import { initGameModel } from './models/game.model'
import { initLeagueModel } from './models/league.model'
import { initMatchModel } from './models/match.model'
import { initPictureModel } from './models/picture.model'
import { initTeamModel } from './models/team.model'

export type Models = ReturnType<typeof buildModels>

export function buildModels(sequelize: Sequelize) {
	return {
		Bar: initBarModel(sequelize),
		Team: initTeamModel(sequelize),
		Match: initMatchModel(sequelize),
		Client: initClientModel(sequelize),
		Comment: initCommentModel(sequelize),
		Game: initGameModel(sequelize),
		League: initLeagueModel(sequelize),
		Picture: initPictureModel(sequelize),
		Favoris: initFavorisModel(sequelize),
		Code: initCodeModel(sequelize),
	}
}

export function makeAssociations(models: Models) {
	const { Bar, Client, Comment, Picture, Favoris, Code, Match, Team, League, Game } = models

	// ─────────────────────────────────────────────────────────
	// Match ↔ Game / League (N:1)
	// ─────────────────────────────────────────────────────────
	Game.hasMany(Match, { foreignKey: 'game_id' })
	Match.belongsTo(Game, { as: 'game', foreignKey: 'game_id' })

	League.hasMany(Match, { foreignKey: 'league_id' })
	Match.belongsTo(League, { as: 'league', foreignKey: 'league_id' })

	// ─────────────────────────────────────────────────────────
	// Match ↔ Team (N:1 x2 — deux équipes par match)
	// ─────────────────────────────────────────────────────────
	Team.hasMany(Match, { as: 'team1Matches', foreignKey: 'team1_id' })
	Team.hasMany(Match, { as: 'team2Matches', foreignKey: 'team2_id' })
	Match.belongsTo(Team, { as: 'team1', foreignKey: 'team1_id' })
	Match.belongsTo(Team, { as: 'team2', foreignKey: 'team2_id' })

	// ─────────────────────────────────────────────────────────
	// Match ↔ Bar (N–N : un match est programmé dans plusieurs bars)
	// ─────────────────────────────────────────────────────────
	Match.belongsToMany(Bar, {
		through: 'match_bar',
		as: 'programmedBars',
		foreignKey: 'match_id',
		otherKey: 'bar_id',
	})
	Bar.belongsToMany(Match, {
		through: 'match_bar',
		as: 'programmedMatches',
		foreignKey: 'bar_id',
		otherKey: 'match_id',
	})

	// ─────────────────────────────────────────────────────────
	// Bar : 1–N Comment / Picture
	// ─────────────────────────────────────────────────────────
	Bar.hasMany(Comment, { as: 'comments', foreignKey: 'bar_id', onDelete: 'CASCADE' })
	Comment.belongsTo(Bar, { as: 'bar', foreignKey: 'bar_id' })

	Bar.hasMany(Picture, { as: 'pictures', foreignKey: 'bar_id', onDelete: 'CASCADE' })
	Picture.belongsTo(Bar, { as: 'bar', foreignKey: 'bar_id' })

	// ─────────────────────────────────────────────────────────
	// Client ↔ Bar (likes N–N)
	// ─────────────────────────────────────────────────────────
	Client.belongsToMany(Bar, {
		through: 'bar_like',
		as: 'likedBars',
		foreignKey: 'client_id',
		otherKey: 'bar_id',
	})
	Bar.belongsToMany(Client, {
		through: 'bar_like',
		as: 'likedBy',
		foreignKey: 'bar_id',
		otherKey: 'client_id',
	})

	// ═════════════════════════════════════════════════════════
	// FAVORIS
	// Un Favoris = un profil de préférences appartenant à UN
	// propriétaire exclusif : soit un Client, soit un Bar.
	//
	// -> hasOne : chaque client / bar possède UN seul favoris.
	//    Si tu veux autoriser plusieurs listes (façon playlists),
	//    remplace hasOne par hasMany ci-dessous.
	//
	// La règle "exactement un propriétaire (client_id XOR owner_bar_id)"
	// n'est pas garantie par Sequelize : à contrôler dans le domaine,
	// ou via une contrainte CHECK en base.
	// ═════════════════════════════════════════════════════════

	// Propriétaire = Client
	Client.hasOne(Favoris, { as: 'favoris', foreignKey: 'client_id' })
	Favoris.belongsTo(Client, { as: 'ownerClient', foreignKey: 'client_id', onDelete: 'CASCADE' })

	// Propriétaire = Bar
	Bar.hasOne(Favoris, { as: 'favoris', foreignKey: 'owner_bar_id' })
	Favoris.belongsTo(Bar, { as: 'ownerBar', foreignKey: 'owner_bar_id', onDelete: 'CASCADE' })

	// ─────────────────────────────────────────────────────────
	// Contenu du Favoris (commun client ET bar) : teams / games / leagues
	// ─────────────────────────────────────────────────────────
	Favoris.belongsToMany(Team, {
		through: 'favoris_team',
		as: 'teams',
		foreignKey: 'favoris_id',
		otherKey: 'team_id',
	})
	Team.belongsToMany(Favoris, {
		through: 'favoris_team',
		as: 'inTeamFavoris',
		foreignKey: 'team_id',
		otherKey: 'favoris_id',
	})

	Favoris.belongsToMany(Game, {
		through: 'favoris_game',
		as: 'games',
		foreignKey: 'favoris_id',
		otherKey: 'game_id',
	})
	Game.belongsToMany(Favoris, {
		through: 'favoris_game',
		as: 'inGameFavoris',
		foreignKey: 'game_id',
		otherKey: 'favoris_id',
	})

	Favoris.belongsToMany(League, {
		through: 'favoris_league',
		as: 'leagues',
		foreignKey: 'favoris_id',
		otherKey: 'league_id',
	})
	League.belongsToMany(Favoris, {
		through: 'favoris_league',
		as: 'inLeagueFavoris',
		foreignKey: 'league_id',
		otherKey: 'favoris_id',
	})

	// ─────────────────────────────────────────────────────────
	// Bars favoris — RÉSERVÉ aux favoris de CLIENT.
	// (Un bar ne peut pas mettre de bars en favori : cette règle
	//  se contrôle dans le use case / l'entité, pas ici.)
	// Une seule relation "favoriteBars" (l'ancien doublon
	//  bars + barNames a été fusionné).
	// ─────────────────────────────────────────────────────────
	Favoris.belongsToMany(Bar, {
		through: 'favoris_bar',
		as: 'favoriteBars',
		foreignKey: 'favoris_id',
		otherKey: 'bar_id',
	})
	Bar.belongsToMany(Favoris, {
		through: 'favoris_bar',
		as: 'inClientFavoris',
		foreignKey: 'bar_id',
		otherKey: 'favoris_id',
	})

	// ═════════════════════════════════════════════════════════
	// CODE (propriétaire exclusif : client OU bar)
	// ═════════════════════════════════════════════════════════
	Code.belongsTo(Client, { as: 'client', foreignKey: 'client_id', onDelete: 'CASCADE' })
	Client.hasOne(Code, { as: 'code', foreignKey: 'client_id' })

	Code.belongsTo(Bar, { as: 'bar', foreignKey: 'bar_id', onDelete: 'CASCADE' })
	Bar.hasOne(Code, { as: 'code', foreignKey: 'bar_id' })
}
