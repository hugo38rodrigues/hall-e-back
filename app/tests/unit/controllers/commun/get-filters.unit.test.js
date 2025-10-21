import { databaseFactory } from '@hugo38rodrigues/bdd-service-hall-e'
import {
	beforeEach,
	describe,
	expect,
	it,
	vi,
} from 'vitest'
import { CommunController } from '../../../../controllers/commun.controller.js'
import { ERROR_SERVER } from '../../../../utils/constants.js'

const makeReq = (body = {}, extra = {}) => ({
	body,
	params: {},
	query: {},
	headers: {},
	...extra,
})

const makeRes = () => {
	const res = {
		header: vi.fn(), status: vi.fn(), json: vi.fn(), send: vi.fn(),
	}
	res.header.mockReturnValue(res)
	res.status.mockReturnValue(res)
	res.json.mockReturnValue(res)
	return res
}

vi.mock('@hugo38rodrigues/bdd-service-hall-e', () => ({
	databaseFactory: vi.fn(),
}))

describe('getFiltersController', () => {
	let controller; let userInstance; let
		databaseInstance

	beforeEach(() => {
		controller = new CommunController()

		userInstance = { getAllFilters: vi.fn() }
		databaseInstance = { usersInstances: vi.fn().mockResolvedValue(userInstance) }
		databaseFactory.mockReturnValue(databaseInstance)
	})

	it('renvoie 200 avec les filtres', async () => {
		const req = makeReq()
		const res = makeRes()
		const filters = { games: ['CS2'] }
		userInstance.getAllFilters.mockResolvedValue(filters)

		await controller.getFiltersController(req, res)

		expect(res.status).toHaveBeenCalledWith(200)
		expect(res.json).toHaveBeenCalledWith({ filters })
	})

	it('renvoie 500 en cas d’erreur', async () => {
		const req = makeReq()
		const res = makeRes()
		userInstance.getAllFilters.mockRejectedValue(new Error('fail'))

		await controller.getFiltersController(req, res)

		expect(res.status).toHaveBeenCalledWith(500)
		expect(res.json).toHaveBeenCalledWith({ message: ERROR_SERVER })
	})
})
