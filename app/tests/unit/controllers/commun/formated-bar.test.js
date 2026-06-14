/**
 * Tests unitaires - #formatedDataBar (méthode privée)
 * ----------------------------------------------------
 * Testée indirectement via getAllBarController.
 *
 * Vérifie le mapping bar → format API et la règle
 * `programations = null si aucun match programmé`.
 */

import {
	beforeEach,
	describe,
	expect,
	test,
} from 'vitest'
import { buildReqRes, dbMocks, resetAllMocks } from '../../../utils/setup.js'

const { CommunController } = await import('../../../../controllers/commun.controller.js')

describe('CommunController - #formatedDataBar (via getAllBarController)', () => {
	let controller; let req; let
		res

	beforeEach(() => {
		resetAllMocks()
		controller = new CommunController();
		({ req, res } = buildReqRes())
	})

	const callWith = async (bar) => {
		dbMocks.getBars.mockResolvedValue([bar])
		await controller.getAllBarController(req, res)
		return res.json.mock.calls[0][0][0]
	}

	test('regroupe les infos sous "informations"', async () => {
		const out = await callWith({
			id: 5,
			role: 'bar',
			name: 'Le Bar',
			description: 'desc',
			address: '12 rue X',
			pictures: ['a.jpg'],
			latitude: 45.75,
			longitude: 4.85,
			programmedMatches: [],
		})

		expect(out.informations).toEqual({
			name: 'Le Bar',
			description: 'desc',
			address: '12 rue X',
			pictures: ['a.jpg'],
		})
	})

	test('regroupe long/lat sous "userLocation"', async () => {
		const out = await callWith({
			id: 5,
			role: 'bar',
			name: '',
			description: '',
			address: '',
			pictures: [],
			latitude: 45.75,
			longitude: 4.85,
			programmedMatches: [],
		})

		expect(out.userLocation).toEqual({ longitude: 4.85, latitude: 45.75 })
	})

	test('programations = null si liste vide', async () => {
		const out = await callWith({
			id: 5,
			role: 'bar',
			name: '',
			description: '',
			address: '',
			pictures: [],
			latitude: 0,
			longitude: 0,
			programmedMatches: [],
		})

		expect(out.programations).toBeNull()
	})

	test('programations = liste formatée si matchs présents', async () => {
		const future = new Date(Date.now() + 86400000)
		const out = await callWith({
			id: 5,
			role: 'bar',
			name: '',
			description: '',
			address: '',
			pictures: [],
			latitude: 0,
			longitude: 0,
			programmedMatches: [
				{
					id: 1,
					hype_score: 80,
					stream_platform: 'Twitch',
					team1: { id: 1, name: 'A' },
					team2: { id: 2, name: 'B' },
					game: { name: 'LoL' },
					league: { name: 'LEC' },
					date: future,
					numberOfGame: 3,
				},
			],
		})

		expect(Array.isArray(out.programations)).toBe(true)
		expect(out.programations).toHaveLength(1)
		expect(out.programations[0]).toMatchObject({
			id: 1,
			hypeScore: 80,
			streamPlatform: 'Twitch',
		})
	})

	test('id et role conservés à la racine', async () => {
		const out = await callWith({
			id: 99,
			role: 'bar',
			name: '',
			description: '',
			address: '',
			pictures: [],
			latitude: 0,
			longitude: 0,
			programmedMatches: [],
		})

		expect(out.id).toBe(99)
		expect(out.role).toBe('bar')
	})
})
