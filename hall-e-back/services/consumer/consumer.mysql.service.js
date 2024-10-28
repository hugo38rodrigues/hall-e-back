import { db } from '../../db/mysql/index.js'
import { ConsumerService } from './consumer.service.js'

export class ConsumerMysqlService extends ConsumerService {
	constructor () {
		super()
		this.db = db
	}

	getMatch = async () => {
		const matches = await db.Match.findAll({
			attributes: {
				exclude: [
					'gameId',
					'leagueId',
					'team1Id',
					'team2Id',
					'createdAt',
					'updatedAt',
				],
			},
			include: [
				{
					model: db.Game,
					attributes: {
						exclude: ['createdAt', 'updatedAt'],
					},
				}, // Inclure le jeu associé
				{
					model: db.League,
					attributes: {
						exclude: ['createdAt', 'updatedAt'],
					},
				}, // Inclure la ligue associée
				{
					model: db.Team,
					as: 'team1',
					attributes: {
						exclude: ['createdAt', 'updatedAt'],
					},
				}, // Inclure l'équipe 1
				{
					model: db.Team,
					as: 'team2',
					attributes: {
						exclude: ['createdAt', 'updatedAt'],
					},
				}, // Inclure l'équipe 2
				{
					model: db.Bar,
					as: 'barsScheduling',
					attributes: {
						exclude: ['password', 'role', 'createdAt', 'updatedAt'],
					}, // Exclure le champ 'password' de Bar
					through: { attributes: [] }, // Exclure la table intermédiaire 'BarMatchSchedules'
					required: false,
				}, // Inclure les bars associés au match
			],
		})
		return matches
	}

	getConsumer = async (consumerId) => {
		return await db.Consumer.findByPk(consumerId)
	}

	addLikeBar = async (consumerId, barId) => {
		try {
			const [like, createdLike] = await db.Like.findOrCreate({
				where: {
					consumerId,
					barId,
				},
			})

			if (createdLike) {
				console.log('Bar liked successfully')
				return like
			}
			return false
		} catch (error) {
			console.error('Error liking the bar:', error)
			throw error
		}
	}

	dissLikeBar = async (consumerId, barId) => {
		try {
			const remove = await db.Like.destroy({
				where: {
					consumerId,
					barId,
				},
			})

			if (remove) {
				console.log('Bar dissliked successfully')
				return true
			}
		} catch (error) {
			console.error('Error liking the bar:', error)
			throw error
		}
	}

	addComments = async () => {}
}
