/* eslint-disable no-underscore-dangle */
/**
 * Tests unitaires - getSchedulingMatchesController (Vitest)
 * ----------------------------------------------------------
 * Cette fonction enchaîne 3 étapes :
 *   1. récup depuis la DB (getProgrammedMatches)
 *   2. formatage (méthode privée #formatedSchedulingMatches)
 *   3. filtrage temporel (#filterAndSortMatches via computeAdditionalHours)
 */

import {
	beforeEach,
	describe,
	expect,
	test,
	vi,
} from 'vitest'

import { dbMocks, resetAllMocks, utilsMocks } from '../../../utils/setup.js'

const { BarController } = await import('../../../../controllers/bar.controller.js')

const buildDbMatch = (overrides = {}) => ({
	id: 1,
	hype_score: 80,
	stream_platform: 'Twitch',
	number_of_game: 3,
	team1: { id: 10, name: 'Team A', logo_url: 'a.png' },
	team2: { id: 20, name: 'Team B', logo_url: 'b.png' },
	game: { id: 1, name: 'LoL' },
	league: { id: 1, name: 'LCK' },
	date: new Date(),
	...overrides,
})

describe('BarController.getSchedulingMatchesController', () => {
	let controller
	let req
	let res

	beforeEach(() => {
		resetAllMocks()
		utilsMocks.computeAdditionalHours.mockReturnValue(120)
		controller = new BarController()

		req = { params: { barId: 7 } }
		res = {
			status: vi.fn().mockReturnThis(),
			json: vi.fn().mockReturnThis(),
		}
	})

	// ------------------------------------------------------------------
	// Cas nominal - mapping
	// ------------------------------------------------------------------
	test('formate correctement les champs snake_case en camelCase', async () => {
		const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000)
		dbMocks.getProgrammedMatches.mockResolvedValue([buildDbMatch({ date: futureDate })])

		await controller.getSchedulingMatchesController(req, res)

		expect(dbMocks.getProgrammedMatches).toHaveBeenCalledWith({ barId: 7 })
		expect(res.status).toHaveBeenCalledWith(200)

		const payload = res.json.mock.calls[0][0]
		expect(payload).toHaveLength(1)
		expect(payload[0]).toMatchObject({
			id: 1,
			hypeScore: 80,
			streamPlatform: 'Twitch',
			numberOfGame: 3,
			team1: { id: 10, name: 'Team A', logoUrl: 'a.png' },
			team2: { id: 20, name: 'Team B', logoUrl: 'b.png' },
		})
	})

	// ------------------------------------------------------------------
	// Filtrage temporel
	// ------------------------------------------------------------------
	test('exclut les matchs entièrement passés', async () => {
		const farPast = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
		dbMocks.getProgrammedMatches.mockResolvedValue([buildDbMatch({ date: farPast })])
		utilsMocks.computeAdditionalHours.mockReturnValue(60)

		await controller.getSchedulingMatchesController(req, res)

		expect(res.json).toHaveBeenCalledWith([])
	})

	test('conserve les matchs futurs', async () => {
		const future = new Date(Date.now() + 5 * 60 * 60 * 1000)
		dbMocks.getProgrammedMatches.mockResolvedValue([buildDbMatch({ date: future })])

		await controller.getSchedulingMatchesController(req, res)

		expect(res.json.mock.calls[0][0]).toHaveLength(1)
	})

	test('conserve les matchs en cours (commencés mais pas finis)', async () => {
		const startedAgo = new Date(Date.now() - 30 * 60 * 1000)
		dbMocks.getProgrammedMatches.mockResolvedValue([buildDbMatch({ date: startedAgo })])
		utilsMocks.computeAdditionalHours.mockReturnValue(120)

		await controller.getSchedulingMatchesController(req, res)

		expect(res.json.mock.calls[0][0]).toHaveLength(1)
	})

	test('mélange : ne conserve que les matchs non terminés', async () => {
		const past = new Date(Date.now() - 10 * 60 * 60 * 1000)
		const future = new Date(Date.now() + 10 * 60 * 60 * 1000)

		dbMocks.getProgrammedMatches.mockResolvedValue([
			buildDbMatch({ id: 1, date: past }),
			buildDbMatch({ id: 2, date: future }),
			buildDbMatch({ id: 3, date: past }),
		])
		utilsMocks.computeAdditionalHours.mockReturnValue(60)

		await controller.getSchedulingMatchesController(req, res)

		const payload = res.json.mock.calls[0][0]
		expect(payload).toHaveLength(1)
		expect(payload[0].id).toBe(2)
	})

	// ------------------------------------------------------------------
	// Liste vide
	// ------------------------------------------------------------------
	test('retourne un tableau vide quand le bar n\'a aucun match programmé', async () => {
		dbMocks.getProgrammedMatches.mockResolvedValue([])

		await controller.getSchedulingMatchesController(req, res)

		expect(res.status).toHaveBeenCalledWith(200)
		expect(res.json).toHaveBeenCalledWith([])
	})

	// ------------------------------------------------------------------
	// computeAdditionalHours est bien appelé avec les bons args
	// ------------------------------------------------------------------
	test('appelle computeAdditionalHours avec game.name et numberOfGame', async () => {
		const future = new Date(Date.now() + 60 * 60 * 1000)
		dbMocks.getProgrammedMatches.mockResolvedValue([
			buildDbMatch({
				date: future,
				game: { id: 1, name: 'CS2' },
				number_of_game: 5,
			}),
		])

		await controller.getSchedulingMatchesController(req, res)

		expect(utilsMocks.computeAdditionalHours).toHaveBeenCalledWith('CS2', 5)
	})
})
