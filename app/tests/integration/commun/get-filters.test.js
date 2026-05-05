/**
 * Tests d'intégration - GET /bars (getAllBarController)
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
	app.get('/bars', controller.getAllBarController)
	return app
}

describe('Intégration HTTP - GET /bars', () => {
	let app

	beforeEach(() => {
		resetAllMocks()
		app = buildApp()
	})

	test('200 + null si aucun bar', async () => {
		dbMocks.getBars.mockResolvedValue(null)

		const res = await request(app).get('/bars')

		expect(res.status).toBe(200)
		expect(res.body).toBeNull()
	})

	test('200 + bars formatés avec matchs filtrés', async () => {
		const future = new Date(Date.now() + 86400000)
		dbMocks.getBars.mockResolvedValue([
			{
				id: 1,
				role: 'bar',
				name: 'Le Bar',
				description: 'desc',
				address: '12 rue X',
				pictures: [],
				latitude: 45.75,
				longitude: 4.85,
				programmedMatches: [
					{
						id: 100,
						hype_score: 80,
						stream_platform: 'Twitch',
						team1: { id: 1, name: 'A' },
						team2: { id: 2, name: 'B' },
						game: { name: 'LoL' },
						league: { name: 'LEC' },
						date: future,
						numberOfGame: 3,
					},
				],
			},
		])

		const res = await request(app).get('/bars')

		expect(res.status).toBe(200)
		expect(res.body).toHaveLength(1)
		expect(res.body[0]).toMatchObject({
			id: 1,
			role: 'bar',
			informations: { name: 'Le Bar' },
			userLocation: { longitude: 4.85, latitude: 45.75 },
		})
		expect(res.body[0].programations).toHaveLength(1)
	})

	test('500 sur exception', async () => {
		dbMocks.getBars.mockRejectedValue(new Error('boom'))

		const res = await request(app).get('/bars')
		expect(res.status).toBe(500)
	})
})
