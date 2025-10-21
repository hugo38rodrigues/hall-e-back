import {
	beforeEach,
	describe,
	expect,
	it,
	vi,
} from 'vitest'
import { FavorisController } from '../../../../controllers/favoris.controller.js'
import { ERROR_SERVER } from '../../../../utils/constants.js'

const makeReq = (body = {}) => ({
	body, params: {}, query: {}, headers: {},
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

describe('addFavorites()', () => {
	let controller
	let res

	beforeEach(() => {
		vi.clearAllMocks()
		controller = new FavorisController()
		res = makeRes()
	})

	it('200 pour type "gameName"', async () => {
		const req = makeReq({ type: 'gameName', idUser: 1, data: 'League of legends' })
		const data = {
			client: 1,
			barName: [],
			gameName: [
				'League of legends',
			],
			leagueName: [],
			teams: [],
			id: '68f5e532a6b9eb63ba1f7080',
		}
		const spy = vi.spyOn(controller, 'addFavorisGameController').mockResolvedValue(data)

		await controller.addFavorites(req, res)

		expect(spy).toHaveBeenCalledWith(1, 'League of legends', 'gameName')
		expect(res.status).toHaveBeenCalledWith(200)
		expect(res.json).toHaveBeenCalledWith(data)
	})

	it('200 pour type "leagueName"', async () => {
		const data = {
			client: 2,
			barName: [],
			gameName: [],
			leagueName: ['LFL'],
			teams: [],
			id: '68f5e532a6b9eb63ba1f7080',
		}
		const req = makeReq({ type: 'leagueName', idUser: 2, data: 'LFL' })
		const spy = vi.spyOn(controller, 'addFavorisLeagueController').mockResolvedValue(data)

		await controller.addFavorites(req, res)

		expect(spy).toHaveBeenCalledWith(2, 'LFL', 'leagueName')
		expect(res.status).toHaveBeenCalledWith(200)
		expect(res.json).toHaveBeenCalledWith(data)
	})

	it('200 pour type "teams"', async () => {
		const data = {
			client: 3,
			barName: [],
			gameName: [],
			leagueName: [''],
			teams: ['TEAM_ID_42'],
			id: '68f5e532a6b9eb63ba1f7080',
		}
		const req = makeReq({ type: 'teams', idUser: 3, data: 'TEAM_ID_42' })
		const spy = vi.spyOn(controller, 'addFavorisTeamController').mockResolvedValue(data)

		await controller.addFavorites(req, res)

		expect(spy).toHaveBeenCalledWith(3, 'TEAM_ID_42', 'teams')
		expect(res.status).toHaveBeenCalledWith(200)
		expect(res.json).toHaveBeenCalledWith(data)
	})

	it('200 pour type "barName"', async () => {
		const data = {
			client: 3,
			barName: ['bar-123'],
			gameName: [],
			leagueName: [''],
			teams: [''],
			id: '68f5e532a6b9eb63ba1f7080',
		}
		const req = makeReq({ type: 'barName', idUser: 4, data: 'bar-123' })
		const spy = vi.spyOn(controller, 'addFavorisBarNameController').mockResolvedValue(data)

		await controller.addFavorites(req, res)

		expect(spy).toHaveBeenCalledWith(4, 'bar-123', 'barName')
		expect(res.status).toHaveBeenCalledWith(200)
		expect(res.json).toHaveBeenCalledWith(data)
	})

	it('401 si type inconnu', async () => {
		const req = makeReq({ type: '???', idUser: 8, data: 'x' })

		await controller.addFavorites(req, res)

		expect(res.status).toHaveBeenCalledWith(401)
		expect(res.json).toHaveBeenCalledWith({ message: 'Erreur dans la requete' })
	})

	it('500 si service renvoie 1 (mauvais rôle)', async () => {
		const req = makeReq({ type: 'barName', idUser: 5, data: 'bar-999' })
		vi.spyOn(controller, 'addFavorisBarNameController').mockResolvedValue(1)

		await controller.addFavorites(req, res)

		expect(res.status).toHaveBeenCalledWith(500)
		expect(res.json).toHaveBeenCalledWith({ message: "Vous n'avez pas le bon rôle" })
	})

	it('500 si service renvoie ERROR_SERVER', async () => {
		const req = makeReq({ type: 'gameName', idUser: 6, data: 'Valorant' })
		vi.spyOn(controller, 'addFavorisGameController').mockResolvedValue(ERROR_SERVER)

		await controller.addFavorites(req, res)

		expect(res.status).toHaveBeenCalledWith(500)
		expect(res.json).toHaveBeenCalledWith({ message: ERROR_SERVER })
	})

	it('500 si exception (catch)', async () => {
		const req = makeReq({ type: 'leagueName', idUser: 7, data: 'LEC' })
		vi.spyOn(controller, 'addFavorisLeagueController').mockRejectedValue(new Error('boom'))

		await controller.addFavorites(req, res)

		expect(res.status).toHaveBeenCalledWith(500)
		expect(res.json).toHaveBeenCalledWith({ message: ERROR_SERVER })
	})
})
