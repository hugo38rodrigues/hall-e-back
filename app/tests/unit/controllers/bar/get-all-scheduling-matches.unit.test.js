import { databaseFactory } from '@hugo38rodrigues/bdd-service-hall-e'
import {
	beforeEach,
	describe,
	expect,
	it,
	vi,
} from 'vitest'
import { BarController } from '../../../../controllers/bar.controller.js'

vi.mock('@hugo38rodrigues/bdd-service-hall-e')
describe('getSchedulingMatchesController', () => {
	const makeReq = (body = {}) => ({
		body, params: { userId: 1 }, query: {}, headers: {},
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

	let barInstanceMock
	let barController

	beforeEach(() => {
		barController = new BarController()

		barInstanceMock = {
			getProgrammedMatches: vi.fn().mockResolvedValue(true),
		}

		// 👇 Configure le mock de databaseFactory
		databaseFactory.mockReturnValue({
			barInstance: vi.fn().mockResolvedValue(barInstanceMock),
		})
	})

	it('Doit retourner une 200', async () => {
		const req = makeReq()
		const res = makeRes()
		const data = [
			{
				date: '2025-09-02T17:00:00.000Z',
				hypeScore: 2,
				gameName: 'League of legends',
				streamPlatform: [
					'https://www.twitch.tv/fortuna',
				],
				leagueName: 'EBL',
				team1: {
					name: 'Crvena zvezda Esports',
					acronym: 'CZV',
					logoUrl: 'https://cdn.pandascore.co/images/team/image/3340/_.png',
					id: '68b71d6907e70c0498428c21',
				},
				team2: {
					name: 'Lenovo Legion Honvéd',
					acronym: 'LLH',
					logoUrl: 'https://cdn.pandascore.co/images/team/image/136567/lenovo_legion_honv_3_fdlogo_square.png',
					id: '68b71d6907e70c0498428c24',
				},
				id: '68b71d6907e70c0498428c26',

			}]
		barInstanceMock.getProgrammedMatches.mockResolvedValue({ programmedMatches: data })
		await barController.getSchedulingMatchesController(req, res)
		expect(res.status).toHaveBeenCalledWith(200)
		expect(res.json).toHaveBeenCalledWith(data)
	})
})
