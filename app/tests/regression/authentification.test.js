/**
 * Régression - connexion + forgotPassword
 * ----------------------------------------
 * Endpoints liés à l'authentification : on verrouille les messages
 * (qui sont vus par le user final) et le comportement silencieux du
 * forgotPassword (sécurité : pas de leak d'existence d'email).
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
} from '../utils/setup.js'

const { CommunController } = await import('../../controllers/commun.controller.js')

describe('REGRESSION - connexion', () => {
	let controller; let req; let
		res

	beforeEach(() => {
		resetAllMocks()
		controller = new CommunController();
		({ req, res } = buildReqRes({
			body: { email: 'a@b.c', password: 'longenough' },
		}))
	})

	test('REGRESSION : message d\'erreur unique pour email ET mdp invalides (pas de leak)', async () => {
		// Sécurité : qu'on tape un email inexistant ou un bon email + mauvais mdp,
		// on doit voir le MÊME message → impossible de savoir si l'email existe.
		dbMocks.getUserByEmail.mockResolvedValue(undefined)

		await controller.connexion(req, res)
		expect(res.json).toHaveBeenCalledWith({
			message: 'L\'email ou le mot de passe sont invalide',
		})

		// Reset puis cas mdp incorrect
		resetAllMocks();
		({ req, res } = buildReqRes({
			body: { email: 'a@b.c', password: 'wrong' },
		}))
		dbMocks.getUserByEmail.mockResolvedValue({
			id: 1,
			dataValues: { password: 'hashed' },
		})
		utilsMocks.verifyPassword.mockResolvedValue(false)

		await controller.connexion(req, res)
		expect(res.json).toHaveBeenCalledWith({
			message: 'L\'email ou le mot de passe sont invalide',
		})
	})

	test('REGRESSION : message succès = "Connexion réussie" (féminin, contrairement à inscription)', async () => {
		dbMocks.getUserByEmail.mockResolvedValue({
			id: 1,
			dataValues: { password: 'hashed' },
		})
		utilsMocks.verifyPassword.mockResolvedValue(true)

		await controller.connexion(req, res)

		expect(res.send).toHaveBeenCalledWith({ message: 'Connexion réussie' })
	})

	test('REGRESSION : token est passé dans le header Authorization (pas dans le body)', async () => {
		dbMocks.getUserByEmail.mockResolvedValue({
			id: 1,
			dataValues: { password: 'hashed' },
		})
		utilsMocks.verifyPassword.mockResolvedValue(true)

		await controller.connexion(req, res)

		expect(res.header).toHaveBeenCalledWith('Authorization', 'fake.jwt.token')
	})
})

describe('REGRESSION - forgotPassword', () => {
	let controller; let req; let
		res

	beforeEach(() => {
		resetAllMocks()
		controller = new CommunController();
		({ req, res } = buildReqRes({ body: { email: 'a@b.c' } }))
	})

	test('REGRESSION : 200 silencieux si user inexistant', async () => {
		dbMocks.getProfileUser.mockResolvedValue(null)

		await controller.forgotPassword(req, res)

		expect(res.sendStatus).toHaveBeenCalledWith(204)
		expect(utilsMocks.sendEmailResetPassword).not.toHaveBeenCalled()
	})

	test('REGRESSION : key "errorEmailMessage" (pas "message") quand email invalide', async () => {
		req.body.email = 'bad'

		await controller.forgotPassword(req, res)

		expect(res.json).toHaveBeenCalledWith({
			errorEmailMessage: 'Email pas au bon format',
		})
	})
})
