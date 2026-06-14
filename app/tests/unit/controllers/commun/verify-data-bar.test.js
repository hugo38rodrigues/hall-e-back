/**
 * Tests unitaires - #verifyDataBar (méthode privée)
 * --------------------------------------------------
 * Testée indirectement via createAccount (role=bar).
 *
 * Codes :
 *   1 → email/mdp invalide
 *   2 → adresse invalide
 *   3 → description fournie mais invalide
 *   4 → nom invalide
 */

import {
	beforeEach,
	describe,
	expect,
	test,
} from 'vitest'
import { buildReqRes, dbMocks, resetAllMocks } from '../../../utils/setup.js'

const { CommunController } = await import('../../../../controllers/commun.controller.js')

const baseBar = () => ({
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

describe('CommunController - #verifyDataBar (via createAccount)', () => {
	let controller; let req; let
		res

	beforeEach(() => {
		resetAllMocks()
		controller = new CommunController();
		({ req, res } = buildReqRes())
		dbMocks.getUserByEmail.mockResolvedValue(null)
		dbMocks.addBar.mockResolvedValue(true)
	})

	const expectError = (status, message) => {
		expect(res.status).toHaveBeenCalledWith(status)
		expect(res.json).toHaveBeenCalledWith({ message })
	}

	test('email mal formé → 401 mdp/mail', async () => {
		req.body = { ...baseBar(), email: 'invalid' }
		await controller.createAccount(req, res)
		expectError(401, 'Votre mot de passe ou votre mail est invalide')
	})

	test('mdp trop court → 401 mdp/mail', async () => {
		req.body = { ...baseBar(), password: '123' }
		await controller.createAccount(req, res)
		expectError(401, 'Votre mot de passe ou votre mail est invalide')
	})

	test('adresse vide → 401 adresse', async () => {
		const body = baseBar()
		body.informations.address = ''
		req.body = body
		await controller.createAccount(req, res)
		expectError(401, 'Votre Addresse est invalide')
	})

	test('description fournie mais invalide → 401 description', async () => {
		const body = baseBar()
		body.informations.description = 'a' // trop court
		req.body = body
		await controller.createAccount(req, res)
		expectError(401, 'Votre description est invalide')
	})

	test('description vide → autorisée (passe à la validation suivante)', async () => {
		const body = baseBar()
		body.informations.description = ''
		req.body = body
		await controller.createAccount(req, res)
		// On ne tombe pas dans l'erreur 3, on doit passer à 201
		expect(res.status).toHaveBeenCalledWith(201)
	})

	test('nom vide → 401 nom', async () => {
		const body = baseBar()
		body.informations.name = ''
		body.informations.description = ''
		req.body = body
		await controller.createAccount(req, res)
		expectError(401, 'Votre nom est invalide')
	})

	test('tout valide → 201', async () => {
		req.body = baseBar()
		await controller.createAccount(req, res)
		expect(res.status).toHaveBeenCalledWith(201)
	})

	// ------------------------------------------------------------------
	// Précédence
	// ------------------------------------------------------------------
	test('email invalide ET adresse invalide → renvoie email/mdp en priorité', async () => {
		const body = baseBar()
		body.email = 'bad'
		body.informations.address = ''
		req.body = body
		await controller.createAccount(req, res)
		expectError(401, 'Votre mot de passe ou votre mail est invalide')
	})
})
