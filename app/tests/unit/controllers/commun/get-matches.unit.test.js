import { databaseFactory } from '@hugo38rodrigues/bdd-service-hall-e'
import {
	beforeEach, describe, expect, it, vi,
} from 'vitest'
import { CommunController } from '../../../../controllers/commun.controller.js'
import { ERROR_SERVER } from '../../../../utils/constants.js'

const makeReq = () => ({
	body: {}, params: {}, query: {}, headers: {},
})
const makeRes = () => {
	const res = {
		header: vi.fn(), status: vi.fn(), json: vi.fn(), send: vi.fn(),
	}
	res.header.mockReturnValue(res); res.status.mockReturnValue(res); res.json.mockReturnValue(res)
	return res
}
vi.mock('@hugo38rodrigues/bdd-service-hall-e', () => ({ databaseFactory: vi.fn() }))

describe('getMatchesController()', () => {
	let controller; let userInstance; let
		databaseInstance

	beforeEach(() => {
		vi.clearAllMocks()
		controller = new CommunController()
		controller.newLogger = { error: vi.fn(), info: vi.fn(), warn: vi.fn() }

		userInstance = { getMatches: vi.fn() }
		databaseInstance = { usersInstances: vi.fn().mockResolvedValue(userInstance) }
		databaseFactory.mockReturnValue(databaseInstance)
	})

	it('200 et envoie la liste des matchs', async () => {
		const req = makeReq()
		const res = makeRes()

		const matches = [{ id: 1 }, { id: 2 }]
		userInstance.getMatches.mockResolvedValue(matches)

		await controller.getMatchesController(req, res)

		expect(userInstance.getMatches).toHaveBeenCalled()
		expect(res.status).toHaveBeenCalledWith(200)
		expect(res.send).toHaveBeenCalledWith(matches)
	})

	it('500 si exception', async () => {
		const req = makeReq()
		const res = makeRes()

		databaseFactory.mockImplementation(() => { throw new Error('boom') })

		await controller.getMatchesController(req, res)
		expect(res.status).toHaveBeenCalledWith(500)
		expect(res.json).toHaveBeenCalledWith({ message: ERROR_SERVER })
	})
})
