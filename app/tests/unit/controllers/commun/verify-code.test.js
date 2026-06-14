/**
 * Tests unitaires - verifyCode
 * ----------------------------
 * Couvre :
 *  - 401 si format de code invalide
 *  - 400 si code introuvable en DB
 *  - 400 si code expiré
 *  - 200 + id si code valide
 *  - retourne null si user inexistant (comportement actuel inhabituel)
 */

import {
	beforeEach,
	describe,
	expect,
	test,
} from 'vitest'
import { buildReqRes, dbMocks, resetAllMocks } from '../../../utils/setup.js'

const { CommunController } = await import('../../../../controllers/commun.controller.js')

describe('CommunController.verifyCode', () => {
	let controller; let req; let
		res

	beforeEach(() => {
		resetAllMocks()
		controller = new CommunController();
		({ req, res } = buildReqRes({
			body: { idUser: 5, code: '123456' },
		}))
	})

	test('401 si le code n\'est pas un nombre à 6 chiffres', async () => {
		req.body.code = '12'

		await controller.verifyCode(req, res)

		expect(res.status).toHaveBeenCalledWith(401)
		expect(res.json).toHaveBeenCalledWith({ message: 'Ce n\'est pas le bon code' })
	})

	test('200 + id quand code valide', async () => {
		dbMocks.getUserById.mockResolvedValue({ id: 5 })
		dbMocks.getCodeByNumber.mockResolvedValue({
			expiresIn: Date.now() + 600000,
		})

		await controller.verifyCode(req, res)

		expect(res.status).toHaveBeenCalledWith(200)
		expect(res.json).toHaveBeenCalledWith({ id: 5 })
	})

	test('400 si le code n\'est pas en DB', async () => {
		dbMocks.getUserById.mockResolvedValue({ id: 5 })
		dbMocks.getCodeByNumber.mockResolvedValue(null)

		await controller.verifyCode(req, res)

		expect(res.status).toHaveBeenCalledWith(400)
		expect(res.json).toHaveBeenCalledWith({ message: 'Code invalide' })
	})

	test('400 si le code est expiré', async () => {
		dbMocks.getUserById.mockResolvedValue({ id: 5 })
		dbMocks.getCodeByNumber.mockResolvedValue({
			expiresIn: Date.now() - 60_000, // expiré il y a 1 min
		})

		await controller.verifyCode(req, res)

		expect(res.status).toHaveBeenCalledWith(400)
		expect(res.json).toHaveBeenCalledWith({ message: 'Demande expiré' })
	})

	test('renvoie 404 si user inexistant', async () => {
		dbMocks.getUserById.mockResolvedValue(null)

		await controller.verifyCode(req, res)

		// Pas de res.status() appelé → res inchangé, retour `null` direct
		expect(res.status).toHaveBeenCalledWith(404)
		expect(res.json).toHaveBeenCalledWith({ message: 'Un problème est survenue' })
	})
})
