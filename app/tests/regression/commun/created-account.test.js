/**
 * Régression - createAccount
 * --------------------------
 * Verrouille les contrats du endpoint :
 *  - codes HTTP figés (401 partout, 201 succès, 404 role inconnu, 500 exception)
 *  - messages d'erreur exacts
 *  - typo "Inscription réussis", "Votre Addresse"
 */

import {
	beforeEach,
	describe,
	expect,
	test,
} from 'vitest'
import { buildReqRes, dbMocks, resetAllMocks } from '../../utils/setup.js'

const { CommunController } = await import('../../../controllers/commun.controller.js')

describe('REGRESSION - createAccount', () => {
	let controller; let req; let
		res

	beforeEach(() => {
		resetAllMocks()
		controller = new CommunController();
		({ req, res } = buildReqRes())
	})

	test('REGRESSION : succès → "Inscription réussis" (faute conservée : "réussis" au lieu de "réussie")', async () => {
		req.body = {
			role: 'client',
			email: 'a@b.c',
			password: 'longenough',
			informations: { firstName: 'John', lastName: 'Doe' },
		}
		dbMocks.getUserByEmail.mockResolvedValue(null)
		dbMocks.addClient.mockResolvedValue(true)

		await controller.createAccount(req, res)

		expect(res.json).toHaveBeenCalledWith({ message: 'Inscription réussis' })
	})

	test('REGRESSION : adresse invalide → "Votre Addresse est invalide" (faute "Addresse" avec deux d... non, un seul, mais avec capitale en milieu de phrase)', async () => {
		req.body = {
			role: 'bar',
			email: 'a@b.c',
			password: 'longenough',
			informations: {
				name: 'Le Bar',
				address: '',
				description: 'desc',
				price: '€',
				pictures: [],
			},
		}

		await controller.createAccount(req, res)

		expect(res.json).toHaveBeenCalledWith({ message: 'Votre Addresse est invalide' })
	})

	test('REGRESSION : "L\'utilisateur existe déjà" (apostrophe typo)', async () => {
		req.body = {
			role: 'client',
			email: 'a@b.c',
			password: 'longenough',
			informations: { firstName: 'John', lastName: 'Doe' },
		}
		dbMocks.getUserByEmail.mockResolvedValue({ id: 1 })

		await controller.createAccount(req, res)

		expect(res.json).toHaveBeenCalledWith({ message: 'L\'utilisateur existe déjà' })
	})

	test('REGRESSION : code 201 (et NON 200) en cas de succès', async () => {
		req.body = {
			role: 'client',
			email: 'a@b.c',
			password: 'longenough',
			informations: { firstName: 'John', lastName: 'Doe' },
		}
		dbMocks.getUserByEmail.mockResolvedValue(null)
		dbMocks.addClient.mockResolvedValue(true)

		await controller.createAccount(req, res)

		expect(res.status).toHaveBeenCalledWith(201)
		expect(res.status).not.toHaveBeenCalledWith(200)
	})

	test('REGRESSION : code 401 (et NON 400) pour les erreurs de validation', async () => {
		req.body = {
			role: 'client',
			email: 'bad',
			password: '',
			informations: { firstName: '', lastName: '' },
		}

		await controller.createAccount(req, res)

		expect(res.status).toHaveBeenCalledWith(401)
		expect(res.status).not.toHaveBeenCalledWith(400)
	})

	test('REGRESSION : ordre des validations bar (mail/mdp → adresse → desc → nom)', async () => {
		// Quand TOUT est invalide, on doit voir mail/mdp en premier.
		req.body = {
			role: 'bar',
			email: 'bad',
			password: '',
			informations: {
				name: '',
				address: '',
				description: 'a',
				price: '',
				pictures: [],
			},
		}

		await controller.createAccount(req, res)

		expect(res.json).toHaveBeenCalledWith({
			message: 'Votre mot de passe ou votre mail est invalide',
		})
	})
})
