/* eslint-disable no-underscore-dangle */
/**
 * Tests de régression - getSchedulingMatchesController (Vitest)
 * --------------------------------------------------------------
 * Verrouille les contrats du payload de sortie (clés exactes,
 * typos volontaires, comportement du filtre temporel...).
 */

import {
	beforeEach,
	describe,
	expect,
	test,
	vi,
} from 'vitest'

import { dbMocks, resetAllMocks, utilsMocks } from '../../utils/setup.js'

const { BarController } = await import('../../../controllers/bar.controller.js')

const buildDbMatch = (overrides = {}) => ({
	id: 1,
	hype_score: 80,
	stream_platform: 'Twitch',
	number_of_game: 3,
	team1: { id: 10, name: 'Team A', logo_url: 'a.png' },
	team2: { id: 20, name: 'Team B', logo_url: 'b.png' },
	game: { id: 1, name: 'LoL' },
	league: { id: 1, name: 'LCK' },
	date: new Date(Date.now() + 86400000),
	...overrides,
})

describe('REGRESSION - getSchedulingMatchesController', () => {
	let controller
	let res

	beforeEach(() => {
		resetAllMocks()
		utilsMocks.computeAdditionalHours.mockReturnValue(120)
		controller = new BarController()
		res = {
			status: vi.fn().mockReturnThis(),
			json: vi.fn().mockReturnThis(),
		}
	})

	const run = async (matches, barId = 7) => {
		dbMocks.getProgrammedMatches.mockResolvedValue(matches)
		await controller.getSchedulingMatchesController(
			{ params: { barId } },
			res,
		)
		return res.json.mock.calls[0][0]
	}

	// REG-001 ----------------------------------------------------
	test('REG-001 : exactement 9 clés sur le match formaté', async () => {
		const out = await run([buildDbMatch()])
		expect(Object.keys(out[0])).toHaveLength(9)
	})

	// REG-002 ----------------------------------------------------
	test('REG-002 : noms de clés exacts', async () => {
		const out = await run([buildDbMatch()])
		expect(Object.keys(out[0]).sort()).toEqual(
			[
				'date',
				'game',
				'hypeScore',
				'id',
				'league',
				'numberOfGame',
				'streamPlatform',
				'team1',
				'team2',
			].sort(),
		)
	})

	// REG-003 ----------------------------------------------------
	test('REG-003 : team1 et team2 ont exactement {id, name, logoUrl}', async () => {
		const out = await run([buildDbMatch()])
		expect(Object.keys(out[0].team1).sort()).toEqual(['id', 'logoUrl', 'name'])
		expect(Object.keys(out[0].team2).sort()).toEqual(['id', 'logoUrl', 'name'])
	})

	// REG-004 ----------------------------------------------------
	test('REG-004 : un match dont la fin = "maintenant" est CONSERVÉ (>=)', async () => {
		const startedAt = new Date(Date.now() - 60 * 60 * 1000)
		utilsMocks.computeAdditionalHours.mockReturnValue(60)

		const out = await run([buildDbMatch({ date: startedAt })])

		expect(out).toHaveLength(1)
	})

	// REG-005 ----------------------------------------------------
	test('REG-005 : retourne TOUJOURS 200 même pour une liste vide', async () => {
		const out = await run([])

		expect(res.status).toHaveBeenCalledWith(200)
		expect(out).toEqual([])
	})

	// REG-006 ----------------------------------------------------
	test('REG-006 : 500 sur exception DB, message générique', async () => {
		dbMocks.getProgrammedMatches.mockRejectedValue(
			new Error('Connection: postgres://user:secret@db:5432'),
		)

		await controller.getSchedulingMatchesController(
			{ params: { barId: 7 } },
			res,
		)

		expect(res.status).toHaveBeenCalledWith(500)
		const body = res.json.mock.calls[0][0]
		expect(body).toEqual({ message: 'Erreur serveur' })
		expect(JSON.stringify(body)).not.toContain('postgres')
		expect(JSON.stringify(body)).not.toContain('secret')
	})

	// REG-007 ----------------------------------------------------
	test('REG-007 : computeAdditionalHours est appelé avec (game.name, numberOfGame)', async () => {
		await run([buildDbMatch({ game: { name: 'CS2' }, number_of_game: 5 })])

		expect(utilsMocks.computeAdditionalHours).toHaveBeenCalledWith('CS2', 5)
	})
})
