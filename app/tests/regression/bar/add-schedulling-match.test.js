/* eslint-disable no-underscore-dangle */
/**
 * Tests d'intégration - addSchedulingMatchesController (Vitest)
 * --------------------------------------------------------------
 * On monte un mini serveur Express, on branche le contrôleur et
 * on tape dessus avec supertest.
 *
 * La couche DB reste mockée (test d'intégration "côté HTTP",
 * pas un E2E vers Postgres).
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
	app.post('/bar/scheduling', controller.addSchedulingMatchesController)
	return app
}

describe('Intégration HTTP - POST /bar/scheduling', () => {
	let app

	beforeEach(() => {
		resetAllMocks()
		app = buildApp()
	})

	test('200 quand tout est valide', async () => {
		dbMocks.getUserById.mockResolvedValue({ id: 7, role: 'bar' })
		dbMocks.getMatchById.mockResolvedValue({ id: 42 })
		dbMocks.addProgrammedMatch.mockResolvedValue(true)

		const res = await request(app)
			.post('/bar/scheduling')
			.send({ matchId: 42, barId: 7 })

		expect(res.status).toBe(200)
		expect(res.body).toEqual({ message: 'Match planifié' })
	})

	test('passe { barId, matchId } à addProgrammedMatch', async () => {
		dbMocks.getUserById.mockResolvedValue({ id: 7 })
		dbMocks.getMatchById.mockResolvedValue({ id: 42 })
		dbMocks.addProgrammedMatch.mockResolvedValue(true)

		await request(app)
			.post('/bar/scheduling')
			.send({ matchId: 42, barId: 7 })

		expect(dbMocks.addProgrammedMatch).toHaveBeenCalledWith({
			barId: 7,
			matchId: 42,
		})
	})

	test('401 si l\'utilisateur n\'existe pas', async () => {
		dbMocks.getUserById.mockResolvedValue(null)
		dbMocks.getMatchById.mockResolvedValue({ id: 42 })

		const res = await request(app)
			.post('/bar/scheduling')
			.send({ matchId: 42, barId: 7 })

		expect(res.status).toBe(401)
		expect(res.body.message).toContain('inconnu')
		expect(dbMocks.addProgrammedMatch).not.toHaveBeenCalled()
	})

	test('401 si le match n\'existe pas', async () => {
		dbMocks.getUserById.mockResolvedValue({ id: 7 })
		dbMocks.getMatchById.mockResolvedValue(null)

		const res = await request(app)
			.post('/bar/scheduling')
			.send({ matchId: 42, barId: 7 })

		expect(res.status).toBe(401)
		expect(dbMocks.addProgrammedMatch).not.toHaveBeenCalled()
	})

	test('401 si la planification échoue côté DB', async () => {
		dbMocks.getUserById.mockResolvedValue({ id: 7 })
		dbMocks.getMatchById.mockResolvedValue({ id: 42 })
		dbMocks.addProgrammedMatch.mockResolvedValue(false)

		const res = await request(app)
			.post('/bar/scheduling')
			.send({ matchId: 42, barId: 7 })

		expect(res.status).toBe(401)
		expect(res.body.message).toMatch(/plannifi/i)
	})

	test('500 si la DB lève une exception', async () => {
		dbMocks.getUserById.mockRejectedValue(new Error('boom'))

		const res = await request(app)
			.post('/bar/scheduling')
			.send({ matchId: 42, barId: 7 })

		expect(res.status).toBe(500)
		expect(res.body).toEqual({ message: 'Erreur serveur' })
	})

	test('content-type est bien application/json', async () => {
		dbMocks.getUserById.mockResolvedValue({ id: 7 })
		dbMocks.getMatchById.mockResolvedValue({ id: 42 })
		dbMocks.addProgrammedMatch.mockResolvedValue(true)

		const res = await request(app)
			.post('/bar/scheduling')
			.send({ matchId: 42, barId: 7 })

		expect(res.headers['content-type']).toMatch(/application\/json/)
	})

	test('req.body vide → 401 (user/match introuvables)', async () => {
		dbMocks.getUserById.mockResolvedValue(null)
		dbMocks.getMatchById.mockResolvedValue(null)

		const res = await request(app)
			.post('/bar/scheduling')
			.send({})

		expect(res.status).toBe(401)
	})
})
