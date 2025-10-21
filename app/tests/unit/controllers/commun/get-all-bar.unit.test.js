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

vi.mock('@hugo38rodrigues/bdd-service-hall-e', () => ({
	databaseFactory: vi.fn(),
}))

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

describe('getAllBarController', () => {
	let controller; let userInstance; let
		databaseInstance

	beforeEach(() => {
		controller = new CommunController()
		controller.newLogger = { error: vi.fn() }

		userInstance = { getBars: vi.fn() }
		databaseInstance = { usersInstances: vi.fn().mockResolvedValue(userInstance) }
		databaseFactory.mockReturnValue(databaseInstance)
	})

	it('renvoie 200 avec les bars formatés', async () => {
		const req = makeReq()
		const res = makeRes()

		const barList = [{ id: 1, name: 'BarTest', programmation: [] }]
		userInstance.getBars.mockResolvedValue(barList)

		await controller.getAllBarController(req, res)

		expect(res.status).toHaveBeenCalledWith(200)
		expect(res.json).toHaveBeenCalledWith(expect.any(Array))
	})

	it('renvoie 500 en cas d’erreur', async () => {
		const req = makeReq()
		const res = makeRes()
		userInstance.getBars.mockRejectedValue(new Error('boom'))

		await controller.getAllBarController(req, res)

		expect(controller.newLogger.error).toHaveBeenCalled()
		expect(res.status).toHaveBeenCalledWith(500)
		expect(res.json).toHaveBeenCalledWith({ message: ERROR_SERVER })
	})
})
