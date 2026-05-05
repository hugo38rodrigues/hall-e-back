/**
 * Tests unitaires - deleteUser
 * ----------------------------
 * Couvre :
 *  - 401 si params manquants ou id invalide
 *  - 401 si user introuvable
 *  - suppression différenciée client / bar
 *  - 401 si la suppression échoue
 *  - 500 sur exception
 */

import {
	beforeEach,
	describe,
	expect,
	test,
} from 'vitest'
import { buildReqRes, dbMocks, resetAllMocks } from '../../../utils/setup.js'

const { CommunController } = await import('../../../../controllers/commun.controller.js')

describe('CommunController.deleteUser', () => {
	let controller; let req; let
		res

	beforeEach(() => {
		resetAllMocks()
		controller = new CommunController();
		({ req, res } = buildReqRes({ params: { idUser: '5' } }))
	})

	test('401 si idUser ne matche pas IS_ID', async () => {
		req.params.idUser = 'abc'

		await controller.deleteUser(req, res)

		expect(res.status).toHaveBeenCalledWith(401)
		expect(res.json).toHaveBeenCalledWith({
			message: 'Il manque un id utilisateur',
		})
	})

	test('401 si user introuvable', async () => {
		dbMocks.getUserById.mockResolvedValue(null)

		await controller.deleteUser(req, res)

		expect(res.status).toHaveBeenCalledWith(401)
		expect(res.json).toHaveBeenCalledWith({
			message: 'Utilisateur introuvable',
		})
	})

	test('200 quand un client est supprimé', async () => {
		dbMocks.getUserById.mockResolvedValue({
			dataValues: { role: 'client' },
		})
		dbMocks.deleteClient.mockResolvedValue(true)

		await controller.deleteUser(req, res)

		expect(dbMocks.deleteClient).toHaveBeenCalledWith('5')
		expect(dbMocks.deleteBar).not.toHaveBeenCalled()
		expect(res.status).toHaveBeenCalledWith(200)
		expect(res.json).toHaveBeenCalledWith({ message: 'Compte supprimé' })
	})

	test('200 quand un bar est supprimé', async () => {
		dbMocks.getUserById.mockResolvedValue({
			dataValues: { role: 'bar' },
		})
		dbMocks.deleteBar.mockResolvedValue(true)

		await controller.deleteUser(req, res)

		expect(dbMocks.deleteBar).toHaveBeenCalledWith('5')
		expect(dbMocks.deleteClient).not.toHaveBeenCalled()
		expect(res.status).toHaveBeenCalledWith(200)
	})

	test('401 si la suppression échoue', async () => {
		dbMocks.getUserById.mockResolvedValue({
			dataValues: { role: 'client' },
		})
		dbMocks.deleteClient.mockResolvedValue(false)

		await controller.deleteUser(req, res)

		expect(res.status).toHaveBeenCalledWith(401)
		expect(res.json).toHaveBeenCalledWith({
			message: 'Impossible de supprimer le compte',
		})
	})

	test('500 si la DB lève', async () => {
		dbMocks.getUserById.mockRejectedValue(new Error('boom'))

		await controller.deleteUser(req, res)

		expect(res.status).toHaveBeenCalledWith(500)
	})
})
