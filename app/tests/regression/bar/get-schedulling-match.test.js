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

vi.mock('@hugo38rodrigues/bdd-service-hall-e/main.js', () => {
	const mockGetProgrammedMatches = vi.fn()
	return {
		db: {
			user: vi.fn(async () => ({})),
			bar: vi.fn(async () => ({
				getProgrammedMatches: mockGetProgrammedMatches,
			})),
		},
		__mocks: { mockGetProgrammedMatches },
	}
})

vi.mock('../../../utils/constants.js', () => ({
	ERROR_SERVER: 'Erreur serveur',
}))

vi.mock('../../../utils/match-tools.js', () => {
	const mockComputeAdditionalHours = vi.fn(() => 120)
	return {
		computeAdditionalHours: mockComputeAdditionalHours,
		__mocks: { mockComputeAdditionalHours },
	}
})

vi.mock('../../../controllers/commun.controller.js', () => ({
	CommunController: class {
		constructor() {
			this.newLogger = { info: vi.fn(), error: vi.fn(), warn: vi.fn() }
		}
	},
}))

const { BarController } = await import('../../../controllers/bar.controller.js')
const dbModule = await import('@hugo38rodrigues/bdd-service-hall-e/main.js')
const { mockGetProgrammedMatches } = dbModule.__mocks
const matchTools = await import('../../../utils/match-tools.js')
const { mockComputeAdditionalHours } = matchTools.__mocks

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
	let controller; let
		res

	beforeEach(() => {
		vi.clearAllMocks()
		mockComputeAdditionalHours.mockReturnValue(120)
		controller = new BarController()
		res = {
			status: vi.fn().mockReturnThis(),
			json: vi.fn().mockReturnThis(),
		}
	})

	const run = async (matches, barId = 7) => {
		mockGetProgrammedMatches.mockResolvedValue(matches)
		await controller.getSchedulingMatchesController(
			{ params: { barId } },
			res,
		)
		return res.json.mock.calls[0][0]
	}

	test('REGRESSION : exactement 9 clés sur le match formaté', async () => {
		const out = await run([buildDbMatch()])
		expect(Object.keys(out[0])).toHaveLength(9)
	})

	test('REGRESSION : noms de clés exacts', async () => {
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

	test('REGRESSION : team1 et team2 ont exactement {id, name, logoUrl}', async () => {
		const out = await run([buildDbMatch()])
		expect(Object.keys(out[0].team1).sort()).toEqual(['id', 'logoUrl', 'name'])
		expect(Object.keys(out[0].team2).sort()).toEqual(['id', 'logoUrl', 'name'])
	})

	// ------------------------------------------------------------------
	// Filtre temporel : la borne est >= (incluse)
	// ------------------------------------------------------------------
	test('REGRESSION : un match dont la fin = "maintenant" est CONSERVÉ (>=)', async () => {
		const startedAt = new Date(Date.now() - 60 * 60 * 1000)
		mockComputeAdditionalHours.mockReturnValue(60)

		const out = await run([buildDbMatch({ date: startedAt })])
		expect(out).toHaveLength(1)
	})

	// ------------------------------------------------------------------
	// Code de statut figé
	// ------------------------------------------------------------------
	test('REGRESSION : retourne TOUJOURS 200 même pour une liste vide', async () => {
		const out = await run([])
		expect(res.status).toHaveBeenCalledWith(200)
		expect(out).toEqual([])
	})
})
