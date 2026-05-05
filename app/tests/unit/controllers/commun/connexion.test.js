/**
 * Tests unitaires - connexion
 * ---------------------------
 * Couvre :
 *  - succès 200 + header Authorization
 *  - email inconnu
 *  - mot de passe incorrect
 *  - exceptions 500
 */

import {
	beforeEach,
	describe,
	expect,
	test,
} from 'vitest'
import {
	buildReqRes,
	dbMocks,
	resetAllMocks,
	utilsMocks,
} from '../../../utils/setup.js'

const { CommunController } = await import('../../../../controllers/commun.controller.js')

describe('CommunController.connexion', () => {
	let controller; let req; let
		res

	beforeEach(() => {
		resetAllMocks()
		controller = new CommunController();
		({ req, res } = buildReqRes({
			body: { email: 'john@doe.com', password: 'mypass1234' },
		}))
	})

	test('200 + token dans le header quand login réussit', async () => {
		dbMocks.getUserByEmail.mockResolvedValue({
			id: 1,
			dataValues: { password: 'hashed' },
		})
		utilsMocks.verifyPassword.mockResolvedValue(true)

		await controller.connexion(req, res)

		expect(utilsMocks.verifyPassword).toHaveBeenCalledWith('mypass1234', 'hashed')
		expect(res.header).toHaveBeenCalledWith('Authorization', 'fake.jwt.token')
		expect(res.status).toHaveBeenCalledWith(200)
		expect(res.send).toHaveBeenCalledWith({ message: 'Connexion réussie' })
	})

	test('401 si email inconnu (getUserByEmail retourne undefined)', async () => {
		dbMocks.getUserByEmail.mockResolvedValue(undefined)

		await controller.connexion(req, res)

		expect(res.status).toHaveBeenCalledWith(401)
		expect(res.json).toHaveBeenCalledWith({
			message: 'L\'email ou le mot de passe sont invalide',
		})
	})

	test('401 si mot de passe ne matche pas', async () => {
		dbMocks.getUserByEmail.mockResolvedValue({
			id: 1,
			password: 'hashed',
			dataValues: { password: 'hashed' },
		})
		utilsMocks.verifyPassword.mockResolvedValue(false)

		await controller.connexion(req, res)

		expect(res.status).toHaveBeenCalledWith(401)
		expect(res.json).toHaveBeenCalledWith({
			message: 'L\'email ou le mot de passe sont invalide',
		})
	})

	test('500 si la DB lève une exception', async () => {
		dbMocks.getUserByEmail.mockRejectedValue(new Error('boom'))

		await controller.connexion(req, res)

		expect(res.status).toHaveBeenCalledWith(500)
		expect(res.json).toHaveBeenCalledWith({ message: 'Erreur serveur' })
	})

	test('500 si verifyPassword lève', async () => {
		dbMocks.getUserByEmail.mockResolvedValue({
			id: 1,
			dataValues: { password: 'hashed' },
		})
		utilsMocks.verifyPassword.mockRejectedValue(new Error('crypto err'))

		await controller.connexion(req, res)

		expect(res.status).toHaveBeenCalledWith(500)
	})
})
