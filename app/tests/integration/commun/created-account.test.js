/**
 * Tests d'intégration - POST /register (createAccount)
 * ---------------------------------------------------
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
	app.post('/auth/register', controller.createAccount)
	return app
}

describe('Intégration HTTP - POST /register', () => {
	let app

	beforeEach(() => {
		resetAllMocks()
		app = buildApp()
	})

	test('201 quand un client est créé', async () => {
		dbMocks.getUserByEmail.mockResolvedValue(null)
		dbMocks.addClient.mockResolvedValue(true)

		const res = await request(app).post('/auth/register').send({
			role: 'client',
			email: 'john@doe.com',
			password: 'longenough',
			informations: { firstName: 'John', lastName: 'Doe' },
		})

		expect(res.status).toBe(201)
		expect(res.body).toEqual({ message: 'Inscription réussis' })
	})

	test('201 quand un bar est créé', async () => {
		dbMocks.getUserByEmail.mockResolvedValue(null)
		dbMocks.addBar.mockResolvedValue(true)

		const res = await request(app).post('/auth/register').send({
			role: 'bar',
			email: 'bar@bar.com',
			password: 'longenough',
			informations: {
				name: 'Le Bar',
				address: '12 rue X',
				description: 'Un super bar',
				price: '€€',
				pictures: [],
			},
		})

		expect(res.status).toBe(201)
	})

	test('401 quand l\'utilisateur existe déjà', async () => {
		dbMocks.getUserByEmail.mockResolvedValue({ id: 1 })

		const res = await request(app).post('/auth/register').send({
			role: 'client',
			email: 'john@doe.com',
			password: 'longenough',
			informations: { firstName: 'John', lastName: 'Doe' },
		})

		expect(res.status).toBe(401)
		expect(res.body.message).toMatch(/existe déjà/)
	})

	test('401 quand le mail est invalide', async () => {
		const res = await request(app).post('/auth/register').send({
			role: 'client',
			email: 'pasunemail',
			password: 'longenough',
			informations: { firstName: 'John', lastName: 'Doe' },
		})

		expect(res.status).toBe(401)
	})

	test('500 sur exception DB', async () => {
		dbMocks.getUserByEmail.mockRejectedValue(new Error('boom'))

		const res = await request(app).post('/auth/register').send({
			role: 'client',
			email: 'john@doe.com',
			password: 'longenough',
			informations: { firstName: 'John', lastName: 'Doe' },
		})

		expect(res.status).toBe(500)
	})
})
