/**
 * Régression - deleteUser + verifyCode
 * -------------------------------------
 * Verrouille les fautes d'orthographe et comportements
 * inhabituels qu'on ne veut pas casser sans alignement.
 */

import {
	beforeEach,
	describe,
	expect,
	test,
} from 'vitest'
import { buildReqRes, dbMocks, resetAllMocks } from '../../utils/setup.js'

const { CommunController } = await import('../../../controllers/commun.controller.js')

describe('REGRESSION - deleteUser', () => {
	let controller; let req; let
		res

	beforeEach(() => {
		resetAllMocks()
		controller = new CommunController();
		({ req, res } = buildReqRes({ params: { idUser: '5' } }))
	})

	test('REGRESSION : message "Utilisateur introuvable"', async () => {
		dbMocks.getUserById.mockResolvedValue(null)

		await controller.deleteUser(req, res)

		expect(res.json).toHaveBeenCalledWith({
			message: 'Utilisateur introuvable',
		})
	})

	test('REGRESSION : message "Il manque un id utilisateur" si idUser invalide', async () => {
		req.params.idUser = 'abc'

		await controller.deleteUser(req, res)

		expect(res.json).toHaveBeenCalledWith({
			message: 'Il manque un id utilisateur',
		})
	})

	test('REGRESSION : 401 (et NON 400) pour id invalide', async () => {
		req.params.idUser = 'abc'
		await controller.deleteUser(req, res)
		expect(res.status).toHaveBeenCalledWith(401)
	})

	test('REGRESSION : 401 (et NON 404) pour user introuvable', async () => {
		dbMocks.getUserById.mockResolvedValue(null)
		await controller.deleteUser(req, res)
		expect(res.status).toHaveBeenCalledWith(401)
	})

	test('REGRESSION : ne route PAS la suppression si role ≠ "client" et ≠ "bar"', async () => {
		dbMocks.getUserById.mockResolvedValue({
			dataValues: { role: 'admin' },
		})

		await controller.deleteUser(req, res)

		expect(dbMocks.deleteClient).not.toHaveBeenCalled()
		expect(dbMocks.deleteBar).not.toHaveBeenCalled()
		// isDeleteUser reste undefined → tombe dans le 401 "Impossible de supprimer"
		expect(res.json).toHaveBeenCalledWith({
			message: 'Impossible de supprimer le compte',
		})
	})
})

describe('REGRESSION - verifyCode', () => {
	let controller; let req; let
		res

	beforeEach(() => {
		resetAllMocks()
		controller = new CommunController();
		({ req, res } = buildReqRes({
			body: { idUser: 5, code: '123456' },
		}))
	})

	test('REGRESSION : 401 (et NON 400) pour code mal formé', async () => {
		req.body.code = '12'

		await controller.verifyCode(req, res)

		expect(res.status).toHaveBeenCalledWith(401)
	})

	test('REGRESSION : retour  404 si user introuvable', async () => {
		dbMocks.getUserById.mockResolvedValue(null)

		await controller.verifyCode(req, res)

		expect(res.status).toHaveBeenCalledWith(404)
	})

	test('REGRESSION : message "Demande expiré" (faute "expiré" au lieu de "expirée")', async () => {
		dbMocks.getUserById.mockResolvedValue({ id: 5 })
		dbMocks.getCodeByNumber.mockResolvedValue({
			expiresIn: Date.now() - 60_000,
		})

		await controller.verifyCode(req, res)

		expect(res.json).toHaveBeenCalledWith({ message: 'Demande expiré' })
	})
})
