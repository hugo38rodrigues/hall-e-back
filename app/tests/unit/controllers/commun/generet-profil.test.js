/**
 * Tests unitaires - _generateProfile (méthode protégée)
 * ------------------------------------------------------
 * Testée indirectement via getProfil.
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
	utilsMocks,
} from '../../../utils/setup.js'

const { CommunController } = await import('../../../../controllers/commun.controller.js')

describe('CommunController - _generateProfile (via getProfil)', () => {
	let controller
	let req
	let res

	beforeEach(() => {
		resetAllMocks()
		controller = new CommunController();
		({ req, res } = buildReqRes({
			headers: { authorization: 'Bearer token' },
		}))

		// Le controller utilise this.#jwt.getIdFromAuthHeader(token)
		// → on mocke la méthode de Jwt qui le renvoie
		utilsMocks.getIdInToken.mockReturnValue(5)

		dbMocks.getUserById.mockResolvedValue({
			id: 5,
			dataValues: { email: 'a@b.c' },
		})
	})

	const callWith = async (profileDataValues) => {
		dbMocks.getProfileUser.mockResolvedValue({ dataValues: profileDataValues })
		await controller.getProfil(req, res)
		return res.json.mock.calls[0][0]
	}

	// ------------------------------------------------------------------
	// CLIENT
	// ------------------------------------------------------------------
	test('client : informations contient firstName, lastName, likeBar', async () => {
		const out = await callWith({
			id: 5,
			email: 'a@b.c',
			role: 'client',
			first_name: 'John',
			last_name: 'Doe',
			likeBar: true,
			favoris: [],
		})

		expect(out.informations).toEqual({
			firstName: 'John',
			lastName: 'Doe',
			likeBar: true,
		})
	})

	test('client : favorites = null si liste vide', async () => {
		const out = await callWith({
			id: 5,
			email: 'a@b.c',
			role: 'client',
			first_name: 'John',
			last_name: 'Doe',
			likeBar: false,
			favoris: [],
		})

		expect(out.favorites).toBeNull()
	})

	test('client : favorites aplatit games/leagues/teams + inclut barNames', async () => {
		const out = await callWith({
			id: 5,
			email: 'a@b.c',
			role: 'client',
			first_name: 'John',
			last_name: 'Doe',
			likeBar: false,
			favoris: [
				{
					games: [{ id: 1, name: 'LoL' }],
					leagues: [{ id: 10, name: 'LEC' }],
					teams: [{ id: 100, name: 'G2', acronym: 'G2' }],
					barNames: [{ id: 1000, name: 'Bar A' }],
				},
				{
					games: [{ id: 2, name: 'CS2' }],
					leagues: [],
					teams: [],
					barNames: [{ id: 1001, name: 'Bar B' }],
				},
			],
		})

		expect(out.favorites.games).toEqual([
			{ id: 1, name: 'LoL' },
			{ id: 2, name: 'CS2' },
		])
		expect(out.favorites.leagues).toEqual([{ id: 10, name: 'LEC' }])
		expect(out.favorites.teams).toEqual([{ id: 100, name: 'G2', acronym: 'G2' }])
		expect(out.favorites.barName).toEqual([
			{ id: 1000, name: 'Bar A' },
			{ id: 1001, name: 'Bar B' },
		])
	})

	test('client : pas de programmedMatches ni userLocation dans la sortie', async () => {
		const out = await callWith({
			id: 5,
			email: 'a@b.c',
			role: 'client',
			first_name: 'John',
			last_name: 'Doe',
			favoris: [],
		})

		expect(out).not.toHaveProperty('programmedMatches')
		expect(out).not.toHaveProperty('userLocation')
	})

	// ------------------------------------------------------------------
	// BAR
	// ------------------------------------------------------------------
	test('bar : informations contient name, address, price, description, pictures', async () => {
		const out = await callWith({
			id: 5,
			email: 'bar@bar.com',
			role: 'bar',
			name: 'Le Bar',
			address: '12 rue X',
			price: '€€',
			description: 'desc',
			pictures: ['p.jpg'],
			longitude: '4.85',
			latitude: '45.75',
			programmedMatches: [],
			favoris: [],
		})

		expect(out.informations).toEqual({
			name: 'Le Bar',
			address: '12 rue X',
			price: '€€',
			description: 'desc',
			pictures: ['p.jpg'],
		})
	})

	test('bar : userLocation parsé en float', async () => {
		const out = await callWith({
			id: 5,
			email: 'bar@bar.com',
			role: 'bar',
			name: '',
			address: '',
			price: '',
			description: '',
			pictures: [],
			longitude: '4.85',
			latitude: '45.75',
			programmedMatches: [],
			favoris: [],
		})

		expect(out.userLocation).toEqual({ longitude: 4.85, latitude: 45.75 })
		expect(typeof out.userLocation.longitude).toBe('number')
		expect(typeof out.userLocation.latitude).toBe('number')
	})

	test('bar : programmedMatches formatés (snake_case → camelCase)', async () => {
		const programmedMatches = [
			{
				dataValues: {
					id: 1,
					hype_score: 90,
					stream_platform: 'Twitch',
					team1: { id: 1, name: 'A' },
					team2: { id: 2, name: 'B' },
					game: { name: 'LoL' },
					league: { name: 'LEC' },
					date: new Date(),
				},
			},
		]
		const out = await callWith({
			id: 5,
			email: 'bar@bar.com',
			role: 'bar',
			name: '',
			address: '',
			price: '',
			description: '',
			pictures: [],
			longitude: '0',
			latitude: '0',
			programmedMatches,
			favoris: [],
		})

		expect(out.programmedMatches).toHaveLength(1)
		expect(out.programmedMatches[0]).toMatchObject({
			id: 1,
			hypeScore: 90,
			streamPlatform: 'Twitch',
		})
	})

	test('bar : programmedMatches null si aucun match', async () => {
		const out = await callWith({
			id: 5,
			email: 'bar@bar.com',
			role: 'bar',
			name: '',
			address: '',
			price: '',
			description: '',
			pictures: [],
			longitude: '0',
			latitude: '0',
			programmedMatches: null,
			favoris: [],
		})

		expect(out.programmedMatches).toBeNull()
	})

	test('bar : barName est toujours un tableau vide (pas de barNames pour un bar)', async () => {
		const out = await callWith({
			id: 5,
			email: 'bar@bar.com',
			role: 'bar',
			name: '',
			address: '',
			price: '',
			description: '',
			pictures: [],
			longitude: '0',
			latitude: '0',
			programmedMatches: [],
			favoris: [{ games: [{ id: 1, name: 'LoL' }], leagues: [], teams: [] }],
		})

		expect(out.favorites.barName).toEqual([])
	})
})
