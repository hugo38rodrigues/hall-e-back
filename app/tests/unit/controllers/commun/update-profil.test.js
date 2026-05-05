/**
 * Tests unitaires - updateProfile
 * -------------------------------
 * Couvre :
 *  - 400 si userId ou profile manquant
 *  - encryption du mdp si fourni
 *  - filtrage des champs vides/null via #filterProfile
 *  - retrait des champs sensibles (password, favorites) du retour
 *  - 500 sur exception
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

describe('CommunController.updateProfile', () => {
	let controller; let req; let
		res

	beforeEach(() => {
		resetAllMocks()
		controller = new CommunController();
		({ req, res } = buildReqRes())
	})

	test('400 si userId manquant', async () => {
		req.body = { profile: { firstName: 'John' } }

		await controller.updateProfile(req, res)

		expect(res.status).toHaveBeenCalledWith(400)
		expect(res.json).toHaveBeenCalledWith({
			message: 'Il manque un id ou vos informations.',
		})
	})

	test('400 si profile manquant', async () => {
		req.body = { userId: 5 }

		await controller.updateProfile(req, res)

		expect(res.status).toHaveBeenCalledWith(400)
	})

	test('200 + retire password & favorites du retour', async () => {
		req.body = { userId: 5, profile: { firstName: 'John' } }
		dbMocks.updateUser.mockResolvedValue({
			dataValues: {
				id: 5,
				email: 'a@b.c',
				firstName: 'John',
				password: 'hashed',
				favorites: { games: [] },
			},
		})

		await controller.updateProfile(req, res)

		expect(res.status).toHaveBeenCalledWith(200)
		const payload = res.json.mock.calls[0][0]
		expect(payload).not.toHaveProperty('password')
		expect(payload).not.toHaveProperty('favorites')
		expect(payload).toMatchObject({
			id: 5,
			email: 'a@b.c',
			firstName: 'John',
		})
	})

	test('encrypte le mot de passe si fourni', async () => {
		req.body = {
			userId: 5,
			profile: { firstName: 'John', password: 'newpassword' },
		}
		dbMocks.updateUser.mockResolvedValue({
			dataValues: { id: 5 },
		})

		await controller.updateProfile(req, res)

		expect(utilsMocks.passwordEncrypt).toHaveBeenCalledWith('newpassword')
		const passed = dbMocks.updateUser.mock.calls[0][1]
		expect(passed.password).toBe('hashed:newpassword')
	})

	test('filtre les champs null et vides via #filterProfile', async () => {
		req.body = {
			userId: 5,
			profile: {
				firstName: 'John',
				lastName: '',
				description: null,
				price: '€€',
			},
		}
		dbMocks.updateUser.mockResolvedValue({ dataValues: { id: 5 } })

		await controller.updateProfile(req, res)

		const filtered = dbMocks.updateUser.mock.calls[0][1]
		expect(filtered).toEqual({ firstName: 'John', price: '€€' })
		expect(filtered).not.toHaveProperty('lastName')
		expect(filtered).not.toHaveProperty('description')
	})

	test('500 si la DB lève', async () => {
		req.body = { userId: 5, profile: { firstName: 'John' } }
		dbMocks.updateUser.mockRejectedValue(new Error('boom'))

		await controller.updateProfile(req, res)

		expect(res.status).toHaveBeenCalledWith(500)
	})
})
