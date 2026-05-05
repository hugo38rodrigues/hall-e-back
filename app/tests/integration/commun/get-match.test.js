/**
 * Tests d'intégration - GET /matches (getMatchesController)
 */

import express from 'express'
import request from 'supertest'
import {
	beforeEach,
	describe,
	expect,
	test,
} from 'vitest'
import { dbMocks, resetAllMocks } from '../../utils/setup.js'

const { CommunController } = await import('../../../controllers/commun.controller.js')

const buildApp = () => {
	const app = express()
	app.use(express.json())
	const controller = new CommunController()
	app.get('/matches', controller.getMatchesController)
	return app
}

describe('Intégration HTTP - GET /matches', () => {
	let app

	beforeEach(() => {
		resetAllMocks()
		app = buildApp()
	})

	test('200 + matchs formatés', async () => {
		dbMocks.getMatches.mockResolvedValue([
			{
				id: 1,
				id_match: 'ext-1',
				date: new Date('2027-01-01'),
				number_of_game: 3,
				hype_score: 80,
				stream_platform: 'Twitch',
				programmedBars: [],
				team1: {
					id: 10, name: 'A', acronym: 'A', logo_url: 'a.png',
				},
				team2: {
					id: 20, name: 'B', acronym: 'B', logo_url: 'b.png',
				},
				league: { id: 1, name: 'LEC' },
				game: { id: 1, name: 'LoL' },
			},
		])

		const res = await request(app).get('/matches')

		expect(res.status).toBe(200)
		expect(res.body).toHaveLength(1)
		expect(res.body[0]).toMatchObject({
			id: 1,
			idMatch: 'ext-1',
			numberOfGame: 3,
			hypeScore: 80,
			streamPlatform: 'Twitch',
			programmed: null,
			team1: { logoUrl: 'a.png' },
		})
	})

	test('200 + [] si pas de matchs', async () => {
		dbMocks.getMatches.mockResolvedValue([])

		const res = await request(app).get('/matches')
		expect(res.status).toBe(200)
		expect(res.body).toEqual([])
	})

	test('500 sur exception', async () => {
		dbMocks.getMatches.mockRejectedValue(new Error('boom'))

		const res = await request(app).get('/matches')
		expect(res.status).toBe(500)
	})
})
