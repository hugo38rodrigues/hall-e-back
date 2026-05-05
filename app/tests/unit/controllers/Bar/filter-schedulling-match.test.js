/* eslint-disable no-underscore-dangle */
/**
 * Tests unitaires - #filterMatches (Vitest)
 * -------------------------------------------------
 * Méthode privée testée via getSchedulingMatchesController.
 *
 * Logique : un match est conservé si
 *   match.date + computeAdditionalHours(game.name, numberOfGame) >= maintenant
 *
 */

import {
	afterEach,
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
	const mockComputeAdditionalHours = vi.fn()
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
const dbModule = await import('@hugo38rodrigues/bdd-service-hall-e/main.js')
const { mockGetProgrammedMatches } = dbModule.__mocks
const matchTools = await import('../../../../utils/match-tools.js')
const { mockComputeAdditionalHours } = matchTools.__mocks

const buildDbMatch = (id, date, numberOfGame = 3) => ({
	id,
	hype_score: 80,
	stream_platform: 'Twitch',
	number_of_game: numberOfGame,
	team1: { id: 1, name: 'A', logo_url: '' },
	team2: { id: 2, name: 'B', logo_url: '' },
	game: { id: 1, name: 'LoL' },
	date,
})

describe('BarController - #filterMatches (testé via getSchedulingMatchesController)', () => {
	let controller
	let res

	beforeEach(() => {
		vi.clearAllMocks()
		vi.useFakeTimers()
		vi.setSystemTime(new Date('2025-01-01T12:00:00Z'))
		controller = new BarController()
		res = {
			status: vi.fn().mockReturnThis(),
			json: vi.fn().mockReturnThis(),
		}
	})

	afterEach(() => {
		vi.useRealTimers()
	})

	const runWith = async (dbMatches) => {
		mockGetProgrammedMatches.mockResolvedValue(dbMatches)
		await controller.getSchedulingMatchesController(
			{ params: { barId: 1 } },
			res,
		)
		return res.json.mock.calls[0][0]
	}

	test('un match qui se termine exactement maintenant est CONSERVÉ (>=)', async () => {
		vi.useFakeTimers()
		vi.setSystemTime(new Date('2025-01-01T12:00:00Z'))

		const startedAt = new Date(Date.now() - 60 * 60 * 1000)
		mockComputeAdditionalHours.mockReturnValue(60)

		const out = await runWith([buildDbMatch(1, startedAt)])
		expect(out).toHaveLength(1)

		vi.useRealTimers()
	})

	test('un match terminé il y a 1 minute est EXCLU', async () => {
		const startedAt = new Date(Date.now() - 61 * 60 * 1000)
		mockComputeAdditionalHours.mockReturnValue(60)

		const out = await runWith([buildDbMatch(1, startedAt)])
		expect(out).toHaveLength(0)
	})

	test('un match qui démarre dans le futur est CONSERVÉ', async () => {
		const futureStart = new Date(Date.now() + 24 * 60 * 60 * 1000)
		mockComputeAdditionalHours.mockReturnValue(120)

		const out = await runWith([buildDbMatch(1, futureStart)])
		expect(out).toHaveLength(1)
	})

	test('respecte la durée retournée par computeAdditionalHours', async () => {
		const startedAt = new Date(Date.now() - 5 * 60 * 60 * 1000)

		mockComputeAdditionalHours.mockReturnValue(6 * 60)
		let out = await runWith([buildDbMatch(1, startedAt)])
		expect(out).toHaveLength(1)

		// Reset
		vi.clearAllMocks()
		res = { status: vi.fn().mockReturnThis(), json: vi.fn().mockReturnThis() }

		mockComputeAdditionalHours.mockReturnValue(4 * 60)
		out = await runWith([buildDbMatch(1, startedAt)])
		expect(out).toHaveLength(0)
	})

	test('appelle computeAdditionalHours pour CHAQUE match', async () => {
		const future = new Date(Date.now() + 24 * 60 * 60 * 1000)
		mockComputeAdditionalHours.mockReturnValue(120)

		await runWith([
			buildDbMatch(1, future),
			buildDbMatch(2, future),
			buildDbMatch(3, future),
		])

		expect(mockComputeAdditionalHours).toHaveBeenCalledTimes(3)
	})

	test('renvoie un tableau vide si tous les matchs sont passés', async () => {
		const past = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
		mockComputeAdditionalHours.mockReturnValue(60)

		const out = await runWith([
			buildDbMatch(1, past),
			buildDbMatch(2, past),
		])
		expect(out).toEqual([])
	})

	test('gère un tableau vide en entrée', async () => {
		const out = await runWith([])
		expect(out).toEqual([])
		expect(mockComputeAdditionalHours).not.toHaveBeenCalled()
	})
})
