/**
 * Tests unitaires - getAllBarController
 * -------------------------------------
 * Couvre :
 *  - récupération + filtre temporel + formatage
 *  - 200 null si aucun bar
 *  - 500 sur exception
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

const buildBar = (overrides = {}) => ({
	id: 1,
	role: 'bar',
	name: 'Le Bar',
	description: 'desc',
	address: '12 rue X',
	pictures: [],
	longitude: 4.85,
	latitude: 45.75,
	programmedMatches: [],
	...overrides,
})

const buildProgrammedMatch = (overrides = {}) => ({
	id: 100,
	hype_score: 80,
	stream_platform: 'Twitch',
	team1: { id: 1, name: 'A' },
	team2: { id: 2, name: 'B' },
	game: { id: 1, name: 'LoL' },
	league: { id: 1, name: 'LEC' },
	date: new Date(Date.now() + 86400000),
	numberOfGame: 3,
	...overrides,
})

describe('CommunController.getAllBarController', () => {
	let controller; let req; let
		res

	beforeEach(() => {
		resetAllMocks()
		controller = new CommunController();
		({ req, res } = buildReqRes())
	})

	test('200 + null si getBars retourne falsy', async () => {
		dbMocks.getBars.mockResolvedValue(null)

		await controller.getAllBarController(req, res)

		expect(res.status).toHaveBeenCalledWith(200)
		expect(res.json).toHaveBeenCalledWith(null)
	})

	test('200 + liste de bars formatés', async () => {
		dbMocks.getBars.mockResolvedValue([buildBar()])

		await controller.getAllBarController(req, res)

		expect(res.status).toHaveBeenCalledWith(200)
		const payload = res.json.mock.calls[0][0]
		expect(payload).toHaveLength(1)
		expect(payload[0]).toMatchObject({
			id: 1,
			role: 'bar',
			informations: { name: 'Le Bar' },
			userLocation: { longitude: 4.85, latitude: 45.75 },
		})
	})

	test('programations = null si bar n\'a aucun match programmé', async () => {
		dbMocks.getBars.mockResolvedValue([buildBar({ programmedMatches: [] })])

		await controller.getAllBarController(req, res)

		expect(res.json.mock.calls[0][0][0].programations).toBeNull()
	})

	test('exclut les matchs passés du bar', async () => {
		const past = new Date(Date.now() - 24 * 60 * 60 * 1000)
		const future = new Date(Date.now() + 24 * 60 * 60 * 1000)
		utilsMocks.computeAdditionalHours.mockReturnValue(60)

		dbMocks.getBars.mockResolvedValue([
			buildBar({
				programmedMatches: [
					buildProgrammedMatch({ id: 1, date: past }),
					buildProgrammedMatch({ id: 2, date: future }),
				],
			}),
		])

		await controller.getAllBarController(req, res)

		const { programations } = res.json.mock.calls[0][0][0]
		expect(programations).toHaveLength(1)
		expect(programations[0].id).toBe(2)
	})

	test('exclut les matchs sans id (skip explicite via if (!match.id))', async () => {
		const future = new Date(Date.now() + 24 * 60 * 60 * 1000)
		dbMocks.getBars.mockResolvedValue([
			buildBar({
				programmedMatches: [
					buildProgrammedMatch({ id: null, date: future }),
					buildProgrammedMatch({ id: 2, date: future }),
				],
			}),
		])

		await controller.getAllBarController(req, res)

		const { programations } = res.json.mock.calls[0][0][0]
		expect(programations).toHaveLength(1)
		expect(programations[0].id).toBe(2)
	})

	test('500 si la DB lève', async () => {
		dbMocks.getBars.mockRejectedValue(new Error('boom'))

		await controller.getAllBarController(req, res)

		expect(res.status).toHaveBeenCalledWith(500)
	})
})
