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

describe('deleteFavorites()', () => {
	let controller
	let res

	beforeEach(() => {
		vi.clearAllMocks()
		controller = new FavorisController()
		res = makeRes()
	})

	it('200 pour "gameName"', async () => {
		const data = {
			client: 10,
			barName: [
				'bar-123',
			],
			gameName: [],
			leagueName: [
				'LFL',
			],
			teams: [
				{
					name: 'Crvena zvezda Esports',
					id: '68b71d6907e70c0498428c21',
				},
			],
			id: '1',
		}
		const req = makeReq({ type: 'gameName', idUser: 10, data: 'League of legends' })
		const spy = vi.spyOn(controller, 'deleteFavorisGameController').mockResolvedValue(data)

		await controller.deleteFavorites(req, res)

		expect(spy).toHaveBeenCalledWith(10, 'League of legends')
		expect(res.status).toHaveBeenCalledWith(200)
		expect(res.json).toHaveBeenCalledWith(data)
	})

	it('200 pour "leagueName"', async () => {
		const req = makeReq({ type: 'leagueName', idUser: 11, data: 'LFL' })
		const data = {
			client: 11,
			barName: [
				'bar-123',
			],
			gameName: [],
			leagueName: [
				'LFL',
			],
			teams: [
				{
					name: 'Crvena zvezda Esports',
					id: '68b71d6907e70c0498428c21',
				},
			],
			id: '1',
		}
		const spy = vi.spyOn(controller, 'deleteFavorisLeagueController').mockResolvedValue(data)

		await controller.deleteFavorites(req, res)

		expect(spy).toHaveBeenCalledWith(11, 'LFL')
		expect(res.status).toHaveBeenCalledWith(200)
		expect(res.json).toHaveBeenCalledWith(data)
	})

	it('200 pour "teams"', async () => {
		const data = {
			client: 12,
			barName: [
				'bar-123',
			],
			gameName: [],
			leagueName: [
				'LFL',
			],
			teams: [
				{
					name: 'Crvena zvezda Esports',
					id: 'TEAM_ID_42',
				},
			],
			id: '1',
		}
		const req = makeReq({ type: 'teams', idUser: 12, data: 'TEAM_ID_42' })
		const spy = vi.spyOn(controller, 'deleteFavorisTeamController').mockResolvedValue(data)

		await controller.deleteFavorites(req, res)

		expect(spy).toHaveBeenCalledWith(12, 'TEAM_ID_42')
		expect(res.status).toHaveBeenCalledWith(200)
		expect(res.json).toHaveBeenCalledWith(data)
	})

	it('200 pour "barName"', async () => {
		const data = {
			client: 12,
			barName: [
				'bar-123',
			],
			gameName: [],
			leagueName: [
				'LFL',
			],
			teams: [
				{
					name: 'Crvena zvezda Esports',
					id: 'TEAM_ID_42',
				},
			],
			id: '1',
		}
		const req = makeReq({ type: 'barName', idUser: 13, data: 'bar-123' })
		const spy = vi.spyOn(controller, 'deleteFavorisBarNameController').mockResolvedValue(data)

		await controller.deleteFavorites(req, res)

		expect(spy).toHaveBeenCalledWith(13, 'bar-123')
		expect(res.status).toHaveBeenCalledWith(200)
		expect(res.json).toHaveBeenCalledWith(data)
	})

	it('200 avec undefined si type inconnu (branche default)', async () => {
		const req = makeReq({ type: '???', idUser: 17, data: 'X' })

		await controller.deleteFavorites(req, res)

		expect(res.status).toHaveBeenCalledWith(401)
		expect(res.json).toHaveBeenCalledWith({ message: 'Erreur dans la requete' })
	})

	it('500 si service renvoie ERROR_SERVER', async () => {
		const req = makeReq({ type: 'teams', idUser: 14, data: 'TEAM_ID_99' })
		vi.spyOn(controller, 'deleteFavorisTeamController').mockResolvedValue(ERROR_SERVER)

		await controller.deleteFavorites(req, res)

		expect(res.status).toHaveBeenCalledWith(500)
		expect(res.json).toHaveBeenCalledWith({ message: ERROR_SERVER })
	})

	it('500 si service renvoie 1 (mauvais rôle, message avec espace)', async () => {
		const req = makeReq({ type: 'barName', idUser: 15, data: 'bar-xyz' })
		vi.spyOn(controller, 'deleteFavorisBarNameController').mockResolvedValue(1)

		await controller.deleteFavorites(req, res)

		expect(res.status).toHaveBeenCalledWith(500)
		// le code contient un espace final dans le message
		expect(res.json).toHaveBeenCalledWith({ message: "Vous n'avez pas le bon rôle" })
	})

	it('500 si exception (catch)', async () => {
		const req = makeReq({ type: 'leagueName', idUser: 16, data: 'LEC' })
		vi.spyOn(controller, 'deleteFavorisLeagueController').mockRejectedValue(new Error('boom'))

		await controller.deleteFavorites(req, res)

		expect(res.status).toHaveBeenCalledWith(500)
		expect(res.json).toHaveBeenCalledWith({ message: ERROR_SERVER })
	})
})
