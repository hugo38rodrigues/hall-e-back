/**
 * Tests d'intégration - DELETE /user/:idUser (deleteUser)
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
	app.delete('/user/:idUser', controller.deleteUser)
	return app
}

describe('Intégration HTTP - DELETE /user/:idUser', () => {
	let app

	beforeEach(() => {
		resetAllMocks()
		app = buildApp()
	})

	test('200 quand un client est supprimé', async () => {
		dbMocks.getUserById.mockResolvedValue({ dataValues: { role: 'client' } })
		dbMocks.deleteClient.mockResolvedValue(true)

		const res = await request(app).delete('/user/5')

		expect(res.status).toBe(200)
		expect(res.body).toEqual({ message: 'Compte supprimé' })
	})

	test('200 quand un bar est supprimé', async () => {
		dbMocks.getUserById.mockResolvedValue({ dataValues: { role: 'bar' } })
		dbMocks.deleteBar.mockResolvedValue(true)

		const res = await request(app).delete('/user/5')

		expect(res.status).toBe(200)
	})

	test('401 si idUser non numérique', async () => {
		const res = await request(app).delete('/user/abc')

		expect(res.status).toBe(401)
	})

	test('401 si user introuvable', async () => {
		dbMocks.getUserById.mockResolvedValue(null)

		const res = await request(app).delete('/user/5')

		expect(res.status).toBe(401)
		expect(res.body).toEqual({ message: 'Utilisateur introuvable' })
	})

	test('401 si la suppression échoue', async () => {
		dbMocks.getUserById.mockResolvedValue({ dataValues: { role: 'client' } })
		dbMocks.deleteClient.mockResolvedValue(false)

		const res = await request(app).delete('/user/5')

		expect(res.status).toBe(401)
	})

	test('500 sur exception DB', async () => {
		dbMocks.getUserById.mockRejectedValue(new Error('boom'))

		const res = await request(app).delete('/user/5')

		expect(res.status).toBe(500)
	})
})
