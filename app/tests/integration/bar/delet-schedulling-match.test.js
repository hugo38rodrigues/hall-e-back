/* eslint-disable no-underscore-dangle */
/**
 * Tests d'intégration - deletedSchedulingMatchesController (Vitest)
 * ------------------------------------------------------------------
 * Vérifie le bon fonctionnement de la route DELETE,
 * incluant le passage des paramètres d'URL.
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
	const mockDeletedProgMatch = vi.fn()
	return {
		db: {
			user: vi.fn(async () => ({
				getUserById: mockGetUserById,
				getMatchById: mockGetMatchById,
			})),
			bar: vi.fn(async () => ({
				deletedProgMatch: mockDeletedProgMatch,
			})),
		},
		__mocks: { mockGetUserById, mockGetMatchById, mockDeletedProgMatch },
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
const { mockGetUserById, mockGetMatchById, mockDeletedProgMatch } = dbModule.__mocks

const buildApp = () => {
	const app = express()
	app.use(express.json())
	const controller = new BarController()
	app.delete(
		'/bar/:barId/scheduling/:matchId',
		controller.deletedSchedulingMatchesController,
	)
	return app
}

describe('Intégration HTTP - DELETE /bar/:barId/scheduling/:matchId', () => {
	let app

	beforeEach(() => {
		vi.clearAllMocks()
		app = buildApp()
	})

	test('200 quand la suppression réussit', async () => {
		mockGetUserById.mockResolvedValue({ id: 7 })
		mockGetMatchById.mockResolvedValue({ id: 42 })
		mockDeletedProgMatch.mockResolvedValue(true)

		const res = await request(app).delete('/bar/7/scheduling/42')

		expect(res.status).toBe(200)
		// Le matchId vient de req.params, donc string '42'
		expect(res.body === '42' || res.body === 42).toBe(true)
	})

	test('passe bien matchId et barId issus de req.params à la DB', async () => {
		mockGetUserById.mockResolvedValue({ id: 7 })
		mockGetMatchById.mockResolvedValue({ id: 42 })
		mockDeletedProgMatch.mockResolvedValue(true)

		await request(app).delete('/bar/7/scheduling/42')

		expect(mockDeletedProgMatch).toHaveBeenCalledWith({
			matchId: '42',
			barId: '7',
		})
	})

	test('401 si bar inexistant', async () => {
		mockGetUserById.mockResolvedValue(null)
		mockGetMatchById.mockResolvedValue({ id: 42 })

		const res = await request(app).delete('/bar/7/scheduling/42')
		expect(res.status).toBe(401)
	})

	test('401 si la suppression échoue', async () => {
		mockGetUserById.mockResolvedValue({ id: 7 })
		mockGetMatchById.mockResolvedValue({ id: 42 })
		mockDeletedProgMatch.mockResolvedValue(false)

		const res = await request(app).delete('/bar/7/scheduling/42')
		expect(res.status).toBe(401)
	})

	test('500 sur exception DB', async () => {
		mockGetUserById.mockRejectedValue(new Error('timeout'))

		const res = await request(app).delete('/bar/7/scheduling/42')
		expect(res.status).toBe(500)
		expect(res.body).toEqual({ message: 'Internal error' })
	})
})
