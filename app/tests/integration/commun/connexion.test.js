/**
 * Tests d'intégration - POST /api/v1/connexion (connexion)
 */

import express from 'express'
import request from 'supertest'
import {
	beforeEach,
	describe,
	expect,
	test,
} from 'vitest'
import { dbMocks, resetAllMocks, utilsMocks } from '../../utils/setup.js'

const { CommunController } = await import('../../../controllers/commun.controller.js')

const buildApp = () => {
	const app = express()
	app.use(express.json())
	const controller = new CommunController()
	app.post('/auth/connexion', controller.connexion)
	return app
}

describe('Intégration HTTP - POST /api/v1/auth/connexion', () => {
	let app

	beforeEach(() => {
		resetAllMocks()
		app = buildApp()
	})

	test('200 + header Authorization quand connexion OK', async () => {
		dbMocks.getUserByEmail.mockResolvedValue({
			id: 1,
			password: 'hashed',
			dataValues: { password: 'hashed' },
		})
		utilsMocks.verifyPassword.mockResolvedValue(true)

		const res = await request(app)
			.post('/auth/connexion')
			.send({ email: 'a@b.c', password: 'longenough' })

		expect(res.status).toBe(200)
		expect(res.headers.authorization).toBe('fake.jwt.token')
		expect(res.body).toEqual({ message: 'Connexion réussie' })
	})

	test('401 si mail inconnu', async () => {
		dbMocks.getUserByEmail.mockResolvedValue(undefined)

		const res = await request(app)
			.post('/auth/connexion')
			.send({ email: 'unknown@x.com', password: 'longenough' })

		expect(res.status).toBe(401)
	})

	test('401 si mdp incorrect', async () => {
		dbMocks.getUserByEmail.mockResolvedValue({
			id: 1,
			dataValues: { password: 'hashed' },
		})
		utilsMocks.verifyPassword.mockResolvedValue(false)

		const res = await request(app)
			.post('/auth/connexion')
			.send({ email: 'a@b.c', password: 'wrong' })

		expect(res.status).toBe(401)
	})

	test('500 sur exception', async () => {
		dbMocks.getUserByEmail.mockRejectedValue(new Error('DB down'))

		const res = await request(app)
			.post('/auth/connexion')
			.send({ email: 'a@b.c', password: 'longenough' })

		expect(res.status).toBe(500)
	})
})
