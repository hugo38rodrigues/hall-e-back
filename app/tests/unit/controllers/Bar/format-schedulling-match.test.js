/* eslint-disable no-underscore-dangle */
/**
 * Tests unitaires - #formatedSchedulingMatches (Vitest)
 * ------------------------------------------------------
 * On ne peut pas appeler la méthode directement (champ privé `#`),
 * mais on peut la tester INDIRECTEMENT en passant un seul match
 * à getSchedulingMatchesController et en lisant la sortie JSON.
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

vi.mock('../../../../utils/constants.js', () => ({
	ERROR_SERVER: 'Erreur serveur',
}))

vi.mock('../../../../utils/match-tools.js', () => {
	const mockComputeAdditionalHours = vi.fn(() => 24 * 60)
	return {
		computeAdditionalHours: mockComputeAdditionalHours,
		__mocks: { mockComputeAdditionalHours },
	}
})

vi.mock('../../../../controllers/commun.controller.js', () => ({
	CommunController: class {
		constructor() {
			this.newLogger = { info: vi.fn(), error: vi.fn(), warn: vi.fn() }
		}
	},
}))

const { BarController } = await import('../../../../controllers/bar.controller.js')
const matchTools = await import('../../../../utils/match-tools.js')
const dbModule = await import('@hugo38rodrigues/bdd-service-hall-e/main.js')
const { mockGetProgrammedMatches } = dbModule.__mocks
const { mockComputeAdditionalHours } = matchTools.__mocks

describe('BarController - #formatedSchedulingMatches (testé via getSchedulingMatchesController)', () => {
	let controller
	let res

	beforeEach(() => {
		vi.clearAllMocks()
		mockComputeAdditionalHours.mockReturnValue(24 * 60)
		controller = new BarController()
		res = {
			status: vi.fn().mockReturnThis(),
			json: vi.fn().mockReturnThis(),
		}
	})

	const callWith = async (dbMatch) => {
		mockGetProgrammedMatches.mockResolvedValue([dbMatch])
		await controller.getSchedulingMatchesController(
			{ params: { barId: 1 } },
			res,
		)
		return res.json.mock.calls[0][0][0]
	}

	test('renomme les champs racine snake_case → camelCase', async () => {
		const out = await callWith({
			id: 99,
			hype_score: 75,
			stream_platform: 'YouTube',
			number_of_game: 2,
			team1: { id: 1, name: 'A', logo_url: 'a' },
			team2: { id: 2, name: 'B', logo_url: 'b' },
			game: { id: 1, name: 'LoL' },
			date: new Date(Date.now() + 3600_000),
		})

		expect(out.id).toBe(99)
		expect(out.hypeScore).toBe(75)
		expect(out.streamPlatform).toBe('YouTube')
		expect(out.numberOfGame).toBe(2)
	})

	test('renomme logo_url → logoUrl pour les deux équipes', async () => {
		const out = await callWith({
			id: 1,
			hype_score: 0,
			stream_platform: '',
			number_of_game: 1,
			team1: { id: 1, name: 'A', logo_url: 'urlA' },
			team2: { id: 2, name: 'B', logo_url: 'urlB' },
			game: { name: 'LoL' },
			date: new Date(Date.now() + 3600_000),
		})

		expect(out.team1.logoUrl).toBe('urlA')
		expect(out.team2.logoUrl).toBe('urlB')
		expect(out.team1.logo_url).toBeUndefined()
		expect(out.team2.logo_url).toBeUndefined()
	})

	test('conserve l\'objet game tel quel', async () => {
		const game = { id: 7, name: 'Valorant', extra: 'meta' }
		const out = await callWith({
			id: 1,
			hype_score: 0,
			stream_platform: '',
			number_of_game: 1,
			team1: { id: 1, name: 'A', logo_url: '' },
			team2: { id: 2, name: 'B', logo_url: '' },
			game,
			date: new Date(Date.now() + 3600_000),
		})

		expect(out.game).toEqual(game)
	})

	test('conserve la date sans la transformer', async () => {
		const date = new Date('2027-01-15T20:00:00Z')
		mockComputeAdditionalHours.mockReturnValue(60 * 24 * 365 * 2)

		const out = await callWith({
			id: 1,
			hype_score: 0,
			stream_platform: '',
			number_of_game: 1,
			team1: { id: 1, name: 'A', logo_url: '' },
			team2: { id: 2, name: 'B', logo_url: '' },
			game: { name: 'LoL' },
			date,
		})

		expect(out.date).toBe(date)
	})

	test('n\'expose que les clés attendues sur l\'objet racine', async () => {
		const out = await callWith({
			id: 1,
			hype_score: 0,
			stream_platform: '',
			number_of_game: 1,
			team1: { id: 1, name: 'A', logo_url: '' },
			team2: { id: 2, name: 'B', logo_url: '' },
			game: { name: 'LoL' },
			date: new Date(Date.now() + 3600_000),
			internal_field: 'secret',
			created_at: new Date(),
		})

		expect(Object.keys(out).sort()).toEqual(
			[
				'id',
				'hypeScore',
				'streamPlatform',
				'numberOfGame',
				'team1',
				'team2',
				'game',
				'league',
				'date',
			].sort(),
		)
	})
})
