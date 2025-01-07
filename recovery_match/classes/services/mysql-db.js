import dotenv from 'dotenv'
import { db } from '../../db/mysql/index.js'
import { Storage } from '../interface/storage.js'

dotenv.config()

export class MysqlDB extends Storage {
	constructor () {
		super()
	}

	#insertGame = async (name) => {
		try {
			const [game, created] = await db.Game.findOrCreate({
				where: { name: name },
			})

			if (created) {
				console.log(`Game created with this name: ${name}`)
			}

			return game.dataValues.id
		} catch (error) {
			console.error('Error checking if game exists:', error)
			throw error
		}
	}

	#insertLeague = async (name) => {
		try {
			const [league, created] = await db.League.findOrCreate({
				where: { name: name },
				defaults: { name: name },
			})

			if (created) {
				console.log(`League created with this name: ${name}`)
			}

			return league.dataValues.id
		} catch (error) {
			console.error('Error checking if league exists:', error)
			throw error
		}
	}

	#insertTeams = async (name1, name2, acronym1, acronym2, logo1, logo2) => {
		try {
			// Trouver ou créer les deux équipes
			const [team1] = await db.Team.findOrCreate({
				where: { name: name1, acronym: acronym1, logo_url: logo1 },
				defaults: { name: name1, acronym: acronym1, logo_url: logo1 },
			})

			const [team2] = await db.Team.findOrCreate({
				where: { name: name2, acronym: acronym2, logo_url: logo2 },
				defaults: { name: name2, acronym: acronym2, logo_url: logo2 },
			})

			if (team1 && team2) {
				return [team1.id, team2.id]
			}
		} catch (error) {
			console.error('Error inserting teams:', error)
			throw error
		}
	}

	#insertMatch = async (matches) => {
		for (const match of matches) {
			try {
				const leagueId = await this.#insertLeague(match.leagueName)
				const gameId = await this.#insertGame(match.gameName)
				const [team1Id, team2Id] = await this.#insertTeams(
					match.team1Name,
					match.team2Name,
					match.team1Acronym,
					match.team2Acronym,
					match.team1Logo,
					match.team2Logo
				)

				const [value, create] = await db.Match.findOrCreate({
					where: {
						id_match: match.idMatch,
					},
					defaults: {
						id_match: match.idMatch,
						date: match.date,
						gameId: gameId,
						leagueId: leagueId,
						team1Id: team1Id,
						team2Id: team2Id,
					},
				})

				if (create) {
					console.log(`Match created with ${match.idMatch}`)
				}
			} catch (error) {
				console.error(`Error inserting match with id ${match.idMatch}:`, error)
			}
		}
	}

	savingMatches = async (matches) => {
		try {
			await this.#insertMatch(matches)
		} catch (error) {
			console.error('Insertion error :', error)
		}
	}
}
