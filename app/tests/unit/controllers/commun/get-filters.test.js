/**
 * Tests unitaires - getFiltersController
 * --------------------------------------
 */

import {
	beforeEach,
	describe,
	expect,
	test,
} from 'vitest'
import { buildReqRes, dbMocks, resetAllMocks } from '../../../utils/setup.js'

const { CommunController } = await import('../../../../controllers/commun.controller.js')

describe('CommunController.getFiltersController', () => {
	let controller; let req; let
		res

	beforeEach(() => {
		resetAllMocks()
		controller = new CommunController();
		({ req, res } = buildReqRes())
	})

	test('200 + filtres', async () => {
		const filters = {
			games: [{ id: 1, name: 'LoL' }],
			leagues: [{ id: 1, name: 'LEC' }],
			teams: [{ id: 1, name: 'G2' }],
		}
		dbMocks.getAllFilters.mockResolvedValue(filters)

		await controller.getFiltersController(req, res)

		expect(res.status).toHaveBeenCalledWith(200)
		expect(res.json).toHaveBeenCalledWith(filters)
	})

	test('500 sur exception DB', async () => {
		dbMocks.getAllFilters.mockRejectedValue(new Error('boom'))

		await controller.getFiltersController(req, res)

		expect(res.status).toHaveBeenCalledWith(500)
		expect(res.json).toHaveBeenCalledWith({ message: 'Erreur serveur' })
	})
})
