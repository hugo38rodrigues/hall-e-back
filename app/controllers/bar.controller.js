import { db } from '@hugo38rodrigues/bdd-service-hall-e/main.js'
import Logger from '../middleware/logger.js'
import { ERROR_SERVER } from '../utils/constants.js'

export class BarController {
	constructor() {
		this.logger = new Logger()
	}

	addSchedulingMatchesController = async (req, res) => {
		try {
			const { matchId, barId } = req.body

			const userInstance = await db.users()
			const barInstance = await db.bar()

			const bar = await userInstance.getUserById(barId)
			const match = await userInstance.getMatchById(matchId)

			if (!bar || !match) {
				this.logger.error('User or match unknow')
				return res.status(401).json({ message: 'Utilisateur inconnu ou match inconnu' })
			}

			const addProgrammed = await barInstance.addProgrammedMatch({ barId, matchId })

			if (!addProgrammed) {
				this.logger.error('Impossible planned match')
				return res.status(401).json({ message: 'Impossible de plannifié le match' })
			}

			return res.status(200).json({ message: 'Match planifié' })
		} catch (error) {
			this.logger.error(error)
			return res.status(500).json({ message: ERROR_SERVER })
		}
	}

	deletedSchedulingMatchesController = async (req, res) => {
		try {
			const { matchId, barId } = req.body

			const userInstance = await db.users()
			const barInstance = await db.bar()

			const bar = await userInstance.getUserById(barId)
			const match = await userInstance.getMatchById(matchId)

			if (!bar || !match) {
				this.logger.error('User or match unknow')
				return res.status(401).json({ message: 'Utilisateur inconnu ou match inconnu' })
			}

			const isDeleted = await barInstance.deletedProgMatch({ matchId, barId })
			if (!isDeleted) {
				this.logger.error('Impossible to deleted match')
				return res.status(401).json({ message: 'Impossible de supprimé le match' })
			}

			this.logger.info(isDeleted)
			return res.status(200).json(matchId)
		} catch (error) {
			this.logger.error(error)
			return res.status(500).json({ message: ERROR_SERVER })
		}
	}

	getSchedulingMatchesController = async (req, res) => {
		const { barId } = req.params
		const barInstance = await db.bar()

		const matchScheduling = await barInstance.getProgrammedMatches({ barId })

		return res.status(200).json(matchScheduling)
	}
}
