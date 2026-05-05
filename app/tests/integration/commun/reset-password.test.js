/**
 * Tests d'intégration - POST /reset-password (resetPassword)
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
	app.post('/reset-password', controller.resetPassword)
	return app
}

describe('Intégration HTTP - POST /reset-password', () => {
	let app

	beforeEach(() => {
		resetAllMocks()
		app = buildApp()
	})

	test('200 quand reset OK', async () => {
		dbMocks.getUserById.mockResolvedValue({ id: 5, role: 'client' })
		dbMocks.updateUser.mockResolvedValue({ isError: false })

		const res = await request(app)
			.post('/reset-password')
			.send({ newPassword: 'newlongpass', id: 5 })

		expect(res.status).toBe(200)
		expect(res.body).toEqual({ message: 'Mot de passe changé avec succès' })
	})

	test('401 si nouveau mdp trop court', async () => {
		const res = await request(app)
			.post('/reset-password')
			.send({ newPassword: '123', id: 5 })

		expect(res.status).toBe(401)
		expect(res.body).toEqual({ message: 'Mot de passe invalide' })
	})

	test('401 si user introuvable', async () => {
		dbMocks.getUserById.mockResolvedValue(null)

		const res = await request(app)
			.post('/reset-password')
			.send({ newPassword: 'newlongpass', id: 99 })

		expect(res.status).toBe(401)
		expect(res.body).toEqual({ message: 'Utilisateur introuvable' })
	})

	test('401 si updateUser rapporte une erreur', async () => {
		dbMocks.getUserById.mockResolvedValue({ id: 5, role: 'client' })
		dbMocks.updateUser.mockResolvedValue({
			isError: true,
			errorMessage: 'Conflit',
		})

		const res = await request(app)
			.post('/reset-password')
			.send({ newPassword: 'newlongpass', id: 5 })

		expect(res.status).toBe(401)
		expect(res.body).toEqual({ message: 'Conflit' })
	})
})
