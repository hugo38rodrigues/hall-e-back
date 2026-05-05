/**
 * Tests unitaires - getMatchesController
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

const buildDbMatch = (overrides = {}) => ({
	id: 1,
	id_match: 'ext-1',
	date: new Date(),
	number_of_game: 3,
	hype_score: 80,
	stream_platform: 'Twitch',
	programmedBars: [],
	team1: {
		id: 10, name: 'A', acronym: 'A', logo_url: 'a.png',
	},
	team2: {
		id: 20, name: 'B', acronym: 'B', logo_url: 'b.png',
	},
	league: { id: 1, name: 'LEC' },
	game: { id: 1, name: 'LoL' },
	...overrides,
})

describe('CommunController.getMatchesController', () => {
	let controller; let req; let
		res

	beforeEach(() => {
		resetAllMocks()
		controller = new CommunController();
		({ req, res } = buildReqRes())
	})

	test('200 + matchs formatés', async () => {
		dbMocks.getMatches.mockResolvedValue([buildDbMatch(), buildDbMatch({ id: 2 })])

		await controller.getMatchesController(req, res)

		expect(res.status).toHaveBeenCalledWith(200)
		expect(res.send).toHaveBeenCalled()
		const payload = res.send.mock.calls[0][0]
		expect(payload).toHaveLength(2)
		expect(payload[0]).toMatchObject({
			id: 1,
			idMatch: 'ext-1',
			numberOfGame: 3,
			hypeScore: 80,
			streamPlatform: 'Twitch',
			team1: { logoUrl: 'a.png' },
			team2: { logoUrl: 'b.png' },
		})
	})

	test('renvoie [] quand aucun match', async () => {
		dbMocks.getMatches.mockResolvedValue([])

		await controller.getMatchesController(req, res)

		expect(res.status).toHaveBeenCalledWith(200)
		expect(res.send).toHaveBeenCalledWith([])
	})

	test('programmed = null si programmedBars est vide', async () => {
		dbMocks.getMatches.mockResolvedValue([buildDbMatch({ programmedBars: [] })])

		await controller.getMatchesController(req, res)

		expect(res.send.mock.calls[0][0][0].programmed).toBeNull()
	})

	test('programmed = liste si programmedBars non vide', async () => {
		const programmedBars = [{ id: 1, name: 'Bar A' }]
		dbMocks.getMatches.mockResolvedValue([buildDbMatch({ programmedBars })])

		await controller.getMatchesController(req, res)

		expect(res.send.mock.calls[0][0][0].programmed).toEqual(programmedBars)
	})

	test('500 sur exception DB', async () => {
		dbMocks.getMatches.mockRejectedValue(new Error('boom'))

		await controller.getMatchesController(req, res)

		expect(res.status).toHaveBeenCalledWith(500)
		expect(res.json).toHaveBeenCalledWith({ message: 'Erreur serveur' })
	})
})
