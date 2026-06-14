/* eslint-disable no-underscore-dangle */
/**
 * Tests unitaires - #filterMatches (Vitest)
 * -------------------------------------------------
 * Méthode privée testée via getSchedulingMatchesController.
 *
 * Logique : un match est conservé si
 *   match.date + computeAdditionalHours(game.name, numberOfGame) >= maintenant
 */

import {
	afterEach,
	beforeEach,
	describe,
	expect,
	test,
	vi,
} from 'vitest'

import { dbMocks, resetAllMocks, utilsMocks } from '../../../utils/setup.js'

const { BarController } = await import('../../../../controllers/bar.controller.js')

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
		resetAllMocks()
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

	const runWith = async (matches) => {
		dbMocks.getProgrammedMatches.mockResolvedValue(matches)
		await controller.getSchedulingMatchesController(
			{ params: { barId: 1 } },
			res,
		)
		return res.json.mock.calls[0][0]
	}

	test('un match qui se termine exactement maintenant est CONSERVÉ (>=)', async () => {
		const startedAt = new Date(Date.now() - 60 * 60 * 1000)
		utilsMocks.computeAdditionalHours.mockReturnValue(60)

		const out = await runWith([buildDbMatch(1, startedAt)])

		expect(out).toHaveLength(1)
	})

	test('un match terminé il y a 1 minute est EXCLU', async () => {
		const startedAt = new Date(Date.now() - 61 * 60 * 1000)
		utilsMocks.computeAdditionalHours.mockReturnValue(60)

		const out = await runWith([buildDbMatch(1, startedAt)])

		expect(out).toHaveLength(0)
	})

	test('un match qui démarre dans le futur est CONSERVÉ', async () => {
		const futureStart = new Date(Date.now() + 24 * 60 * 60 * 1000)
		utilsMocks.computeAdditionalHours.mockReturnValue(120)

		const out = await runWith([buildDbMatch(1, futureStart)])

		expect(out).toHaveLength(1)
	})

	test('respecte la durée retournée par computeAdditionalHours', async () => {
		const startedAt = new Date(Date.now() - 5 * 60 * 60 * 1000)

		// 6h après démarrage → match encore en cours
		utilsMocks.computeAdditionalHours.mockReturnValue(6 * 60)
		let out = await runWith([buildDbMatch(1, startedAt)])
		expect(out).toHaveLength(1)

		// Reset propre pour la deuxième passe
		resetAllMocks()
		res = { status: vi.fn().mockReturnThis(), json: vi.fn().mockReturnThis() }

		// 4h après démarrage → match terminé
		utilsMocks.computeAdditionalHours.mockReturnValue(4 * 60)
		out = await runWith([buildDbMatch(1, startedAt)])
		expect(out).toHaveLength(0)
	})

	test('appelle computeAdditionalHours pour CHAQUE match', async () => {
		const future = new Date(Date.now() + 24 * 60 * 60 * 1000)
		utilsMocks.computeAdditionalHours.mockReturnValue(120)

		await runWith([
			buildDbMatch(1, future),
			buildDbMatch(2, future),
			buildDbMatch(3, future),
		])

		expect(utilsMocks.computeAdditionalHours).toHaveBeenCalledTimes(3)
	})

	test('renvoie un tableau vide si tous les matchs sont passés', async () => {
		const past = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
		utilsMocks.computeAdditionalHours.mockReturnValue(60)

		const out = await runWith([
			buildDbMatch(1, past),
			buildDbMatch(2, past),
		])

		expect(out).toEqual([])
	})

	test('gère un tableau vide en entrée', async () => {
		const out = await runWith([])

		expect(out).toEqual([])
		expect(utilsMocks.computeAdditionalHours).not.toHaveBeenCalled()
	})
})
