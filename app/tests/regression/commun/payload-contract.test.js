/**
 * Régression - contrats des payloads
 * -----------------------------------
 * Verrouille la forme exacte des objets renvoyés par les endpoints
 * qui formatent des données : getMatches, getProfil, getAllBar.
 *
 * Ces tests cassent volontairement si quelqu'un :
 *   - renomme une clé
 *   - ajoute/retire un champ
 *   - change la profondeur d'un objet
 * → signal explicite pour synchroniser le front.
 */

import {
	beforeEach,
	describe,
	expect,
	test,
} from 'vitest'
import {
	buildReqRes,
	dbMocks,
	resetAllMocks,
} from '../../utils/setup.js'

const { CommunController } = await import('../../../controllers/commun.controller.js')

describe('REGRESSION - contrats des payloads', () => {
	let controller; let req; let
		res

	beforeEach(() => {
		resetAllMocks()
		controller = new CommunController();
		({ req, res } = buildReqRes())
	})

	// ------------------------------------------------------------------
	// getMatches → #formatedMatch
	// ------------------------------------------------------------------
	test('REGRESSION : payload de #formatedMatch a EXACTEMENT 11 clés', async () => {
		dbMocks.getMatches.mockResolvedValue([{
			id: 1,
			id_match: 'x',
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
		}])

		await controller.getMatchesController(req, res)
		const out = res.send.mock.calls[0][0][0]

		expect(Object.keys(out).sort()).toEqual([
			'date',
			'game',
			'hypeScore',
			'id',
			'idMatch',
			'league',
			'numberOfGame',
			'programmed',
			'streamPlatform',
			'team1',
			'team2',
		].sort())
	})

	test('REGRESSION : team1/team2 ont EXACTEMENT {id, name, acronym, logoUrl}', async () => {
		dbMocks.getMatches.mockResolvedValue([{
			id: 1,
			id_match: 'x',
			date: new Date(),
			number_of_game: 1,
			hype_score: 0,
			stream_platform: '',
			programmedBars: [],
			team1: {
				id: 1, name: 'A', acronym: 'AA', logo_url: 'a.png', extra_field: 'leak',
			},
			team2: {
				id: 2, name: 'B', acronym: 'BB', logo_url: 'b.png',
			},
			league: {},
			game: {},
		}])

		await controller.getMatchesController(req, res)
		const { team1 } = res.send.mock.calls[0][0][0]

		expect(Object.keys(team1).sort()).toEqual(['acronym', 'id', 'logoUrl', 'name'])
		// extra_field ne doit PAS fuiter
		expect(team1).not.toHaveProperty('extra_field')
		expect(team1).not.toHaveProperty('logo_url')
	})

	test('REGRESSION : programmed = null exactement (pas [] ni undefined)', async () => {
		dbMocks.getMatches.mockResolvedValue([{
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
		}])

		await controller.getMatchesController(req, res)
		const out = res.send.mock.calls[0][0][0]

		expect(out.programmed).toBeNull()
		expect(out.programmed).not.toEqual([])
	})

	// ------------------------------------------------------------------
	// getAllBar → #formatedDataBar
	// ------------------------------------------------------------------
	test('REGRESSION : payload de #formatedDataBar a EXACTEMENT 5 clés', async () => {
		dbMocks.getBars.mockResolvedValue([{
			id: 1,
			role: 'bar',
			name: '',
			description: '',
			address: '',
			pictures: [],
			latitude: 0,
			longitude: 0,
			programmedMatches: [],
		}])

		await controller.getAllBarController(req, res)
		const out = res.json.mock.calls[0][0][0]

		expect(Object.keys(out).sort()).toEqual([
			'id',
			'informations',
			'programations',
			'role',
			'userLocation',
		].sort())
	})

	test('REGRESSION : clé "programations" (et NON "programmations" — typo conservée)', async () => {
		dbMocks.getBars.mockResolvedValue([{
			id: 1,
			role: 'bar',
			name: '',
			description: '',
			address: '',
			pictures: [],
			latitude: 0,
			longitude: 0,
			programmedMatches: [],
		}])

		await controller.getAllBarController(req, res)
		const out = res.json.mock.calls[0][0][0]

		expect(out).toHaveProperty('programations')
		expect(out).not.toHaveProperty('programmations') // sans typo
	})

	test('REGRESSION : programations = null (pas []) si liste vide', async () => {
		dbMocks.getBars.mockResolvedValue([{
			id: 1,
			role: 'bar',
			name: '',
			description: '',
			address: '',
			pictures: [],
			latitude: 0,
			longitude: 0,
			programmedMatches: [],
		}])

		await controller.getAllBarController(req, res)
		expect(res.json.mock.calls[0][0][0].programations).toBeNull()
	})
})
