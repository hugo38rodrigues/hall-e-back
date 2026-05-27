/* eslint-disable no-underscore-dangle */
/**
 * Tests d'intégration - deletedSchedulingMatchesController (Vitest)
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
	app.delete(
		'/bar/:barId/:matchId',
		controller.deleteSchedulingMatchesController,
	)
	return app
}

describe('Intégration HTTP - DELETE /bar/:barId/:matchId', () => {
	let app

	beforeEach(() => {
		resetAllMocks()
		app = buildApp()
	})

	test('200 quand la suppression réussit', async () => {
		dbMocks.getUserById.mockResolvedValue({ id: 7 })
		dbMocks.getMatchById.mockResolvedValue({ id: 42 })
		dbMocks.deleteProgMatch.mockResolvedValue(true)

		const res = await request(app).delete('/bar/7/42')
		expect(res.status).toBe(200)
		expect(res.body).toBe('42') // res.json(matchId) avec matchId string
	})

	test('passe bien matchId et barId issus de req.params à la DB', async () => {
		dbMocks.getUserById.mockResolvedValue({ id: 7 })
		dbMocks.getMatchById.mockResolvedValue({ id: 42 })
		dbMocks.deleteProgMatch.mockResolvedValue(true)

		await request(app).delete('/bar/7/42')

		expect(dbMocks.deleteProgMatch).toHaveBeenCalledWith({
			matchId: '42',
			barId: '7',
		})
	})

	test('401 si utilisateur (bar) inexistant', async () => {
		dbMocks.getUserById.mockResolvedValue(null)
		dbMocks.getMatchById.mockResolvedValue({ id: 42 })

		const res = await request(app).delete('/bar/7/42')

		expect(res.status).toBe(401)
		expect(res.body).toEqual({
			message: 'Utilisateur inconnu ou match inconnu',
		})
		expect(dbMocks.deleteProgMatch).not.toHaveBeenCalled()
	})

	test('401 si match inexistant', async () => {
		dbMocks.getUserById.mockResolvedValue({ id: 7 })
		dbMocks.getMatchById.mockResolvedValue(null)

		const res = await request(app).delete('/bar/7/42')

		expect(res.status).toBe(401)
		expect(dbMocks.deleteProgMatch).not.toHaveBeenCalled()
	})

	test('401 si la suppression échoue', async () => {
		dbMocks.getUserById.mockResolvedValue({ id: 7 })
		dbMocks.getMatchById.mockResolvedValue({ id: 42 })
		dbMocks.deleteProgMatch.mockResolvedValue(false)

		const res = await request(app).delete('/bar/7/42')

		expect(res.status).toBe(401)
		expect(res.body).toEqual({ message: 'Impossible de supprimer le match' })
	})

	test('500 sur exception DB', async () => {
		dbMocks.getUserById.mockRejectedValue(new Error('timeout'))

		const res = await request(app).delete('/bar/7/42')

		expect(res.status).toBe(500)
		expect(res.body).toEqual({ message: 'Erreur serveur' }) // ← valeur de setup.js
	})
})
