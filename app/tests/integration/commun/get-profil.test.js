/**
 * Tests d'intégration - GET /profile (getProfil)
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
	app.get('/user', controller.getProfil)
	return app
}

describe('Intégration HTTP - GET /user', () => {
	let app

	beforeEach(() => {
		resetAllMocks()
		app = buildApp()
	})

	test('200 + profil formaté', async () => {
		utilsMocks.getIdInToken.mockReturnValue(5)
		dbMocks.getUserById.mockResolvedValue({
			id: 5,
			dataValues: { email: 'a@b.c' },
		})
		dbMocks.getProfileUser.mockResolvedValue({
			dataValues: {
				id: 5,
				email: 'a@b.c',
				role: 'client',
				first_name: 'John',
				last_name: 'Doe',
				likeBar: false,
				favoris: [],
				programmedMatches: [],
			},
		})

		const res = await request(app)
			.get('/user')
			.set('Authorization', 'Bearer fake.jwt')

		expect(res.status).toBe(200)
		expect(res.body).toMatchObject({
			id: 5,
			email: 'a@b.c',
			role: 'client',
			informations: { firstName: 'John', lastName: 'Doe' },
		})
	})

	test('404 si user introuvable', async () => {
		dbMocks.getUserById.mockResolvedValue(undefined)

		const res = await request(app)
			.get('/user')
			.set('Authorization', 'Bearer fake.jwt')

		expect(res.status).toBe(404)
	})

	test('500 sur exception', async () => {
		dbMocks.getUserById.mockRejectedValue(new Error('boom'))

		const res = await request(app)
			.get('/user')
			.set('Authorization', 'Bearer fake.jwt')

		expect(res.status).toBe(500)
	})
})
