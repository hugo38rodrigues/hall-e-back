/**
 * Tests unitaires - #createdNewProfil (méthode privée)
 * -----------------------------------------------------
 * Testée indirectement via createAccount.
 * On lit ce qui est passé à addClient/addBar.
 *
 * On vérifie le mapping de chaque champ vers le profil de DB et
 * la différence client / bar (avec géocodage).
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

describe('CommunController - #createdNewProfil (via createAccount)', () => {
	let controller; let req; let
		res

	beforeEach(() => {
		resetAllMocks()
		controller = new CommunController();
		({ req, res } = buildReqRes())
		dbMocks.getUserByEmail.mockResolvedValue(null)
		dbMocks.addClient.mockResolvedValue(true)
		dbMocks.addBar.mockResolvedValue(true)
	})

	// ------------------------------------------------------------------
	// CLIENT
	// ------------------------------------------------------------------
	test('client : maps les champs et hash le mdp', async () => {
		req.body = {
			role: 'client',
			email: 'john@doe.com',
			password: 'longenough',
			informations: { firstName: 'John', lastName: 'Doe' },
		}

		await controller.createAccount(req, res)

		expect(dbMocks.addClient).toHaveBeenCalledTimes(1)
		const profile = dbMocks.addClient.mock.calls[0][0]
		expect(profile).toEqual({
			email: 'john@doe.com',
			password: 'hashed:longenough',
			role: 'client',
			firstName: 'John',
			lastName: 'Doe',
		})
	})

	test('client : pas d\'appel au géocodage', async () => {
		req.body = {
			role: 'client',
			email: 'john@doe.com',
			password: 'longenough',
			informations: { firstName: 'John', lastName: 'Doe' },
		}

		await controller.createAccount(req, res)

		expect(utilsMocks.getCoordinatesFromAddress).not.toHaveBeenCalled()
	})

	// ------------------------------------------------------------------
	// BAR
	// ------------------------------------------------------------------
	test('bar : maps les champs, hash le mdp, ajoute lat/long', async () => {
		req.body = {
			role: 'bar',
			email: 'bar@bar.com',
			password: 'longenough',
			informations: {
				name: 'Le Bar',
				address: '12 rue X',
				description: 'Un super bar',
				price: '€€',
				pictures: ['p1.jpg'],
			},
		}
		utilsMocks.getCoordinatesFromAddress.mockResolvedValue({
			latitude: 48.85,
			longitude: 2.35,
		})

		await controller.createAccount(req, res)

		expect(dbMocks.addBar).toHaveBeenCalledTimes(1)
		const profile = dbMocks.addBar.mock.calls[0][0]
		expect(profile).toEqual({
			role: 'bar',
			email: 'bar@bar.com',
			name: 'Le Bar',
			password: 'hashed:longenough',
			address: '12 rue X',
			price: '€€',
			description: 'Un super bar',
			pictures: ['p1.jpg'],
			latitude: 48.85,
			longitude: 2.35,
		})
	})

	test('bar : géocodage appelé avec l\'adresse', async () => {
		req.body = {
			role: 'bar',
			email: 'bar@bar.com',
			password: 'longenough',
			informations: {
				name: 'Le Bar',
				address: '8 boulevard Y',
				description: 'descs',
				price: '€',
				pictures: [],
			},
		}

		await controller.createAccount(req, res)
		expect(utilsMocks.getCoordinatesFromAddress).toHaveBeenCalledWith('8 boulevard Y')
	})
})
