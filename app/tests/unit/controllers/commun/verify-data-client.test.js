/**
 * Tests unitaires - #verifyDataClient (méthode privée)
 * -----------------------------------------------------
 * Testée indirectement via createAccount (role=client).
 * On documente les cas-limites de validation.
 *
 * Codes retournés par #verifyDataClient :
 *   1 → email ou mot de passe invalide
 *   2 → prénom ou nom invalide
 *   undefined → tout valide
 */

import {
	beforeEach,
	describe,
	expect,
	test,
} from 'vitest'
import { buildReqRes, dbMocks, resetAllMocks } from '../../../utils/setup.js'

const { CommunController } = await import('../../../../controllers/commun.controller.js')

const baseClient = () => ({
	role: 'client',
	email: 'john@doe.com',
	password: 'longenough',
	informations: { firstName: 'John', lastName: 'Doe' },
})

describe('CommunController - #verifyDataClient (via createAccount)', () => {
	let controller; let req; let
		res

	beforeEach(() => {
		resetAllMocks()
		controller = new CommunController();
		({ req, res } = buildReqRes())
		dbMocks.getUserByEmail.mockResolvedValue(null)
		dbMocks.addClient.mockResolvedValue(true)
	})

	const expectError = (status, message) => {
		expect(res.status).toHaveBeenCalledWith(status)
		expect(res.json).toHaveBeenCalledWith({ message })
	}

	// ------------------------------------------------------------------
	// Email invalide
	// ------------------------------------------------------------------
	test('email mal formé → 401 mdp/mail', async () => {
		req.body = { ...baseClient(), email: 'no-at-sign' }
		await controller.createAccount(req, res)
		expectError(401, 'Votre mot de passe ou votre mail est invalide')
	})

	test('email vide → 401 mdp/mail', async () => {
		req.body = { ...baseClient(), email: '' }
		await controller.createAccount(req, res)
		expectError(401, 'Votre mot de passe ou votre mail est invalide')
	})

	// ------------------------------------------------------------------
	// Mot de passe invalide
	// ------------------------------------------------------------------
	test('mdp trop court → 401 mdp/mail', async () => {
		req.body = { ...baseClient(), password: 'short' }
		await controller.createAccount(req, res)
		expectError(401, 'Votre mot de passe ou votre mail est invalide')
	})

	test('mdp vide → 401 mdp/mail', async () => {
		req.body = { ...baseClient(), password: '' }
		await controller.createAccount(req, res)
		expectError(401, 'Votre mot de passe ou votre mail est invalide')
	})

	// ------------------------------------------------------------------
	// Prénom / nom invalides
	// ------------------------------------------------------------------
	test('prénom vide → 401 prénom/nom', async () => {
		req.body = {
			...baseClient(),
			informations: { firstName: '', lastName: 'Doe' },
		}
		await controller.createAccount(req, res)
		expectError(401, 'Votre prénom ou nom est invalide')
	})

	test('nom vide → 401 prénom/nom', async () => {
		req.body = {
			...baseClient(),
			informations: { firstName: 'John', lastName: '' },
		}
		await controller.createAccount(req, res)
		expectError(401, 'Votre prénom ou nom est invalide')
	})

	// ------------------------------------------------------------------
	// Tout valide
	// ------------------------------------------------------------------
	test('tout valide → passe à 201', async () => {
		req.body = baseClient()
		await controller.createAccount(req, res)
		expect(res.status).toHaveBeenCalledWith(201)
	})

	// ------------------------------------------------------------------
	// Précédence : email/mdp avant prénom/nom
	// ------------------------------------------------------------------
	test('si email ET prénom invalides → renvoie l\'erreur email/mdp en premier', async () => {
		req.body = {
			...baseClient(),
			email: 'bad',
			informations: { firstName: '', lastName: '' },
		}
		await controller.createAccount(req, res)
		expectError(401, 'Votre mot de passe ou votre mail est invalide')
	})
})
