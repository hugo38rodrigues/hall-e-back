/**
 * Tests unitaires - #formatedMatch (méthode privée)
 * --------------------------------------------------
 *
*/
import {
	beforeEach, describe, expect, test,
} from 'vitest'
import { buildReqRes, dbMocks, resetAllMocks } from '../../../utils/setup.js'

const { CommunController } = await import('../../../../controllers/commun.controller.js')

describe('CommunController - #formatedMatch (via getMatchesController)', () => {
	let controller; let req; let
		res

	beforeEach(() => {
		resetAllMocks()
		controller = new CommunController();
		({ req, res } = buildReqRes())
	})

	const callWith = async (dbMatch) => {
		dbMocks.getMatches.mockResolvedValue([dbMatch])
		await controller.getMatchesController(req, res)
		return res.send.mock.calls[0][0][0]
	}

	test('mappe les champs racine snake_case → camelCase', async () => {
		const date = new Date('2027-01-01')
		const out = await callWith({
			id: 1,
			id_match: 'ext-42',
			date,
			number_of_game: 5,
			hype_score: 95,
			stream_platform: 'YouTube',
			programmedBars: [],
			team1: {
				id: 10, name: 'A', acronym: 'A', logo_url: 'a.png',
			},
			team2: {
				id: 20, name: 'B', acronym: 'B', logo_url: 'b.png',
			},
			league: { id: 1, name: 'LEC' },
			game: { id: 1, name: 'LoL' },
		})

		expect(out).toMatchObject({
			id: 1,
			idMatch: 'ext-42',
			date,
			numberOfGame: 5,
			hypeScore: 95,
			streamPlatform: 'YouTube',
		})
	})

	test('formate team1 et team2 (logo_url → logoUrl)', async () => {
		const out = await callWith({
			id: 1,
			id_match: '',
			date: new Date(),
			number_of_game: 1,
			hype_score: 0,
			stream_platform: '',
			programmedBars: [],
			team1: {
				id: 10, name: 'TeamA', acronym: 'TA', logo_url: 'a.png',
			},
			team2: {
				id: 20, name: 'TeamB', acronym: 'TB', logo_url: 'b.png',
			},
			league: {},
			game: {},
		})

		expect(out.team1).toEqual({
			id: 10, name: 'TeamA', acronym: 'TA', logoUrl: 'a.png',
		})
		expect(out.team2).toEqual({
			id: 20, name: 'TeamB', acronym: 'TB', logoUrl: 'b.png',
		})
		expect(out.team1.logo_url).toBeUndefined()
	})

	test('programmed = null si programmedBars vide', async () => {
		const out = await callWith({
			id: 1,
			id_match: '',
			date: new Date(),
			number_of_game: 1,
			hype_score: 0,
			stream_platform: '',
			programmedBars: [],
			team1: {
				id: 1, name: '', acronym: '', logo_url: '',
			},
			team2: {
				id: 2, name: '', acronym: '', logo_url: '',
			},
			league: {},
			game: {},
		})

		expect(out.programmed).toBeNull()
	})

	test('programmed = liste si programmedBars non vide', async () => {
		const programmedBars = [{ id: 1, name: 'Bar A' }, { id: 2, name: 'Bar B' }]
		const out = await callWith({
			id: 1,
			id_match: '',
			date: new Date(),
			number_of_game: 1,
			hype_score: 0,
			stream_platform: '',
			programmedBars,
			team1: {
				id: 1, name: '', acronym: '', logo_url: '',
			},
			team2: {
				id: 2, name: '', acronym: '', logo_url: '',
			},
			league: {},
			game: {},
		})

		expect(out.programmed).toEqual(programmedBars)
	})

	test('league et game sont conservés tels quels', async () => {
		const league = { id: 1, name: 'LEC', region: 'EU' }
		const game = { id: 1, name: 'LoL', genre: 'MOBA' }
		const out = await callWith({
			id: 1,
			id_match: '',
			date: new Date(),
			number_of_game: 1,
			hype_score: 0,
			stream_platform: '',
			programmedBars: [],
			team1: {
				id: 1, name: '', acronym: '', logo_url: '',
			},
			team2: {
				id: 2, name: '', acronym: '', logo_url: '',
			},
			league,
			game,
		})

		expect(out.league).toEqual(league)
		expect(out.game).toEqual(game)
	})
})
