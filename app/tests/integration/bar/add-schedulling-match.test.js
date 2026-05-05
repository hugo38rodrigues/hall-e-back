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
	vi,
} from 'vitest'

vi.mock('@hugo38rodrigues/bdd-service-hall-e/main.js', () => {
	const mockGetUserById = vi.fn()
	const mockGetMatchById = vi.fn()
	const mockAddProgrammedMatch = vi.fn()
	return {
		db: {
			user: vi.fn(async () => ({
				getUserById: mockGetUserById,
				getMatchById: mockGetMatchById,
			})),
			bar: vi.fn(async () => ({
				addProgrammedMatch: mockAddProgrammedMatch,
			})),
		},
		__mocks: { mockGetUserById, mockGetMatchById, mockAddProgrammedMatch },
	}
})

vi.mock('../../utils/constants.js', () => ({
	ERROR_SERVER: 'Erreur serveur',
}))

vi.mock('../../utils/match-tools.js', () => ({
	computeAdditionalHours: vi.fn(() => 120),
}))

vi.mock('../../controllers/commun.controller.js', () => ({
	CommunController: class {
		constructor() {
			this.newLogger = { info: vi.fn(), error: vi.fn(), warn: vi.fn() }
		}
	},
}))

const { BarController } = await import('../../../controllers/bar.controller.js')
const dbModule = await import('@hugo38rodrigues/bdd-service-hall-e/main.js')
const { mockGetUserById, mockGetMatchById, mockAddProgrammedMatch } = dbModule.__mocks

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
		vi.clearAllMocks()
		app = buildApp()
	})

	test('200 quand tout est valide', async () => {
		mockGetUserById.mockResolvedValue({ id: 7, role: 'bar' })
		mockGetMatchById.mockResolvedValue({ id: 42 })
		mockAddProgrammedMatch.mockResolvedValue(true)

		const res = await request(app)
			.post('/bar/scheduling')
			.send({ matchId: 42, barId: 7 })

		expect(res.status).toBe(200)
		expect(res.body).toEqual({ message: 'Match planifié' })
	})

	test('401 si l\'utilisateur n\'existe pas', async () => {
		mockGetUserById.mockResolvedValue(null)
		mockGetMatchById.mockResolvedValue({ id: 42 })

		const res = await request(app)
			.post('/bar/scheduling')
			.send({ matchId: 42, barId: 7 })

		expect(res.status).toBe(401)
		expect(res.body.message).toContain('inconnu')
	})

	test('401 si la planification échoue côté DB', async () => {
		mockGetUserById.mockResolvedValue({ id: 7 })
		mockGetMatchById.mockResolvedValue({ id: 42 })
		mockAddProgrammedMatch.mockResolvedValue(false)

		const res = await request(app)
			.post('/bar/scheduling')
			.send({ matchId: 42, barId: 7 })

		expect(res.status).toBe(401)
		expect(res.body.message).toMatch(/plannifi/i)
	})

	test('500 si la DB lève une exception', async () => {
		mockGetUserById.mockRejectedValue(new Error('boom'))

		const res = await request(app)
			.post('/bar/scheduling')
			.send({ matchId: 42, barId: 7 })

		expect(res.status).toBe(500)
		expect(res.body).toEqual({ message: 'Internal error' })
	})

	test('content-type est bien application/json', async () => {
		mockGetUserById.mockResolvedValue({ id: 7 })
		mockGetMatchById.mockResolvedValue({ id: 42 })
		mockAddProgrammedMatch.mockResolvedValue(true)

		const res = await request(app)
			.post('/bar/scheduling')
			.send({ matchId: 42, barId: 7 })

		expect(res.headers['content-type']).toMatch(/application\/json/)
	})

	test('req.body est bien parsé même si envoyé en POST sans body explicite', async () => {
		mockGetUserById.mockResolvedValue(null)
		mockGetMatchById.mockResolvedValue(null)

		const res = await request(app)
			.post('/bar/scheduling')
			.send({})

		expect(res.status).toBe(401)
	})
})
