/* eslint-disable no-underscore-dangle */
/**
 * Tests d'intégration - getSchedulingMatchesController (Vitest)
 * --------------------------------------------------------------
 * Vérifie le pipeline complet : route Express → DB (mockée) →
 * formatage → filtrage → réponse JSON.
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

const { BarController } = await import('../../../controllers/bar.controller.js')

const buildApp = () => {
	const app = express()
	app.use(express.json())
	const controller = new BarController()
	app.get('/bar/:barId/scheduling', controller.getSchedulingMatchesController)
	return app
}

const buildDbMatch = (overrides = {}) => ({
	id: 1,
	hype_score: 80,
	stream_platform: 'Twitch',
	number_of_game: 3,
	team1: { id: 10, name: 'Team A', logo_url: 'a.png' },
	team2: { id: 20, name: 'Team B', logo_url: 'b.png' },
	game: { id: 1, name: 'LoL' },
	date: new Date(Date.now() + 24 * 60 * 60 * 1000),
	...overrides,
})

describe('Intégration HTTP - GET /bar/:barId/scheduling', () => {
	let app

	beforeEach(() => {
		resetAllMocks()
		app = buildApp()
	})

	test('200 + tableau JSON formaté', async () => {
		dbMocks.getProgrammedMatches.mockResolvedValue([
			buildDbMatch({ id: 1 }),
			buildDbMatch({ id: 2 }),
		])

		const res = await request(app).get('/bar/7/scheduling')

		expect(res.status).toBe(200)
		expect(Array.isArray(res.body)).toBe(true)
		expect(res.body).toHaveLength(2)
		expect(res.body[0]).toMatchObject({
			id: 1,
			hypeScore: 80,
			streamPlatform: 'Twitch',
			team1: { logoUrl: 'a.png' },
		})
	})

	test('le barId du params est bien remonté à la DB', async () => {
		dbMocks.getProgrammedMatches.mockResolvedValue([])

		await request(app).get('/bar/123/scheduling')

		expect(dbMocks.getProgrammedMatches).toHaveBeenCalledWith({ barId: '123' })
	})

	test('les Date sont sérialisées en ISO string dans la réponse', async () => {
		const date = new Date(Date.now() + 24 * 60 * 60 * 1000)
		dbMocks.getProgrammedMatches.mockResolvedValue([buildDbMatch({ date })])

		const res = await request(app).get('/bar/7/scheduling')

		expect(typeof res.body[0].date).toBe('string')
		expect(res.body[0].date).toBe(date.toISOString())
	})

	test('renvoie [] quand aucun match n\'est programmé', async () => {
		dbMocks.getProgrammedMatches.mockResolvedValue([])

		const res = await request(app).get('/bar/7/scheduling')

		expect(res.status).toBe(200)
		expect(res.body).toEqual([])
	})

	test('content-type application/json', async () => {
		dbMocks.getProgrammedMatches.mockResolvedValue([])

		const res = await request(app).get('/bar/7/scheduling')

		expect(res.headers['content-type']).toMatch(/application\/json/)
	})

	test('500 si la DB throw', async () => {
		dbMocks.getProgrammedMatches.mockRejectedValue(new Error('DB down'))

		const res = await request(app).get('/bar/7/scheduling')

		expect(res.status).toBe(500)
		expect(res.body).toEqual({ message: 'Erreur serveur' })
	})
})
