import { db } from '@hugo38rodrigues/bdd-service-hall-e/main.js'
import { ERROR_SERVER } from '../utils/constants.js'
import { computeAdditionalHours } from '../utils/match-tools.js'
import { CommunController } from './commun.controller.js'

export class BarController extends CommunController {
	#filterAndSortMatches = (matches) => {
		const today = new Date()
		const computeAdditionDurationsMatch = matches.map((match) => match).filter((match) => {
			const extraHours = computeAdditionalHours(match.game.name, match.numberoFGame)
			const cutoff = new Date(match.date.getTime() + extraHours * 60 * 1000)
			const test = cutoff >= today
			return test
		})
		return computeAdditionDurationsMatch
	}

	#formatedSchedulingMatches = (schedulingMatches) => ({
		id: schedulingMatches.id,
		hypeScore: schedulingMatches.hype_score,
		streamPlatform: schedulingMatches.stream_platform,
		numberoFGame: schedulingMatches.number_of_game,
		team1: {
			id: schedulingMatches.team1.id,
			name: schedulingMatches.team1.name,
			logoUrl: schedulingMatches.team1.logo_url,
		},
		team2: {
			id: schedulingMatches.team2.id,
			name: schedulingMatches.team2.name,
			logoUrl: schedulingMatches.team2.logo_url,
		},
		game: schedulingMatches.game,
		league: schedulingMatches.game,
		date: schedulingMatches.date,
	})

	addSchedulingMatchesController = async (req, res) => {
		try {
			const { matchId, barId } = req.body

			const userInstance = await db.user()
			const barInstance = await db.bar()

			const bar = await userInstance.getUserById(barId)
			const match = await userInstance.getMatchById(matchId)

			if (!bar || !match) {
				this.newLogger.error('User or match unknow')
				return res.status(401).json({ message: 'Utilisateur inconnu ou match inconnu' })
			}

			const addProgrammed = await barInstance.addProgrammedMatch({ barId, matchId })

			if (!addProgrammed) {
				this.newLogger.error('Impossible planned match')
				return res.status(401).json({ message: 'Impossible de plannifié le match' })
			}

			return res.status(200).json({ message: 'Match planifié' })
		} catch (error) {
			this.newLogger.error(error)
			return res.status(500).json({ message: ERROR_SERVER })
		}
	}

	deletedSchedulingMatchesController = async (req, res) => {
		try {
			const { matchId, barId } = req.body

			const userInstance = await db.user()
			const barInstance = await db.bar()

			const bar = await userInstance.getUserById(barId)
			const match = await userInstance.getMatchById(matchId)

			if (!bar || !match) {
				this.newLogger.error('User or match unknow')
				return res.status(401).json({ message: 'Utilisateur inconnu ou match inconnu' })
			}

			const isDeleted = await barInstance.deletedProgMatch({ matchId, barId })
			if (!isDeleted) {
				this.newLogger.error('Impossible to deleted match')
				return res.status(401).json({ message: 'Impossible de supprimé le match' })
			}

			this.newLogger.info(isDeleted)
			return res.status(200).json(matchId)
		} catch (error) {
			this.newLogger.error(error)
			return res.status(500).json({ message: ERROR_SERVER })
		}
	}

	getSchedulingMatchesController = async (req, res) => {
		const { barId } = req.params
		const barInstance = await db.bar()

		const matchScheduling = await barInstance.getProgrammedMatches({ barId })
		// eslint-disable-next-line max-len
		const formatedSchedulingMatches = matchScheduling.map((match) => this.#formatedSchedulingMatches(match))
		const filterSchedulingMatches = this.#filterAndSortMatches(formatedSchedulingMatches)
		return res.status(200).json(filterSchedulingMatches)
	}
}
