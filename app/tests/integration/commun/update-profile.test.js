/**
 * Tests d'intégration - PUT /profile (updateProfile)
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
	app.put('/user/update-profil', controller.updateProfile)
	return app
}

describe('Intégration HTTP - PUT /user/update-profil', () => {
	let app

	beforeEach(() => {
		resetAllMocks()
		app = buildApp()
	})

	test('200 + retire password & favorites', async () => {
		dbMocks.updateUser.mockResolvedValue({
			dataValues: {
				id: 5,
				email: 'a@b.c',
				firstName: 'John',
				password: 'hashed',
				favorites: { games: [] },
			},
		})

		const res = await request(app)
			.put('/user/update-profil')
			.send({ userId: 5, profile: { firstName: 'John' } })

		expect(res.status).toBe(200)
		expect(res.body).not.toHaveProperty('password')
		expect(res.body).not.toHaveProperty('favorites')
	})

	test('400 si userId manquant', async () => {
		const res = await request(app)
			.put('/user/update-profil')
			.send({ profile: { firstName: 'John' } })

		expect(res.status).toBe(400)
	})

	test('400 si profile manquant', async () => {
		const res = await request(app)
			.put('/user/update-profil')
			.send({ userId: 5 })

		expect(res.status).toBe(400)
	})

	test('500 sur exception DB', async () => {
		dbMocks.updateUser.mockRejectedValue(new Error('boom'))

		const res = await request(app)
			.put('/user/update-profil')
			.send({ userId: 5, profile: { firstName: 'John' } })

		expect(res.status).toBe(500)
	})
})
