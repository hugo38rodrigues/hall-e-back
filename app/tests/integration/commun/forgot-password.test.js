/**
 * Tests d'intégration - POST /forgot-password (forgotPassword)
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
	app.post('/forgot-password', controller.forgotPassword)
	return app
}

describe('Intégration HTTP - POST /forgot-password', () => {
	let app

	beforeEach(() => {
		resetAllMocks()
		app = buildApp()
	})

	test('200 + token + envoi mail si user existe', async () => {
		dbMocks.getProfileUser.mockResolvedValue({
			id: 5,
			dataValues: { id: 5 },
			password: 'hashed',
		})
		dbMocks.addCodeNumber.mockResolvedValue(123456)

		const res = await request(app)
			.post('/forgot-password')
			.send({ email: 'john@doe.com' })

		expect(res.status).toBe(200)
		expect(res.headers.authorization).toBe('fake.jwt.token')
		expect(res.body).toEqual({ id: 5 })
		expect(utilsMocks.sendEmailResetPassword).toHaveBeenCalled()
	})

	test('200 silencieux si user inexistant', async () => {
		dbMocks.getProfileUser.mockResolvedValue(null)

		const res = await request(app)
			.post('/forgot-password')
			.send({ email: 'unknown@x.com' })

		expect(res.status).toBe(204)
		expect(utilsMocks.sendEmailResetPassword).not.toHaveBeenCalled()
	})

	test('401 si email mal formé', async () => {
		const res = await request(app)
			.post('/forgot-password')
			.send({ email: 'pasunemail' })

		expect(res.status).toBe(401)
		expect(res.body).toEqual({ errorEmailMessage: 'Email pas au bon format' })
	})

	test('500 sur exception', async () => {
		dbMocks.getProfileUser.mockRejectedValue(new Error('boom'))

		const res = await request(app)
			.post('/forgot-password')
			.send({ email: 'john@doe.com' })

		expect(res.status).toBe(500)
	})
})
