/* eslint-disable no-underscore-dangle */
/**
 * Tests de régression - addSchedulingMatchesController (Vitest)
 * --------------------------------------------------------------
 * Ces tests verrouillent des comportements précis qu'on ne souhaite
 * pas voir changer accidentellement (codes HTTP, messages d'erreur
 * exacts, ordre des appels DB, fautes d'orthographe contractuelles…).
 */

import {
	beforeEach,
	describe,
	expect,
	test,
	vi,
} from 'vitest'

vi.mock('@hugo38rodrigues/bdd-service-hall-e/main.js', () => {
	const mockGetUserById = vi.fn()
	const mockGetMatchById = vi.fn()
	const mockAddProgrammedMatch = vi.fn()
	const mockUserFactory = vi.fn(async () => ({
		getUserById: mockGetUserById,
		getMatchById: mockGetMatchById,
	}))
	const mockBarFactory = vi.fn(async () => ({
		addProgrammedMatch: mockAddProgrammedMatch,
	}))
	return {
		db: { user: mockUserFactory, bar: mockBarFactory },
		__mocks: {
			mockGetUserById,
			mockGetMatchById,
			mockAddProgrammedMatch,
			mockUserFactory,
			mockBarFactory,
		},
	}
})

vi.mock('../../../utils/constants.js', () => ({
	ERROR_SERVER: 'Erreur serveur',
}))

vi.mock('../../../utils/match-tools.js', () => ({
	computeAdditionalHours: vi.fn(() => 120),
}))

vi.mock('../../../controllers/commun.controller.js', () => ({
	CommunController: class {
		constructor() {
			this.newLogger = { info: vi.fn(), error: vi.fn(), warn: vi.fn() }
		}
	},
}))

const { BarController } = await import('../../../controllers/bar.controller.js')
const dbModule = await import('@hugo38rodrigues/bdd-service-hall-e/main.js')
const {
	mockGetUserById,
	mockGetMatchById,
	mockAddProgrammedMatch,
	mockUserFactory,
} = dbModule.__mocks

describe('REGRESSION - addSchedulingMatchesController', () => {
	let controller; let req; let
		res

	beforeEach(() => {
		vi.clearAllMocks()
		controller = new BarController()
		req = { body: { matchId: 42, barId: 7 } }
		res = {
			status: vi.fn().mockReturnThis(),
			json: vi.fn().mockReturnThis(),
		}
	})

	// ------------------------------------------------------------------
	// Contrats de message exacts (front-dépendants)
	// ------------------------------------------------------------------
	test('message succès EXACT : "Match planifié"', async () => {
		mockGetUserById.mockResolvedValue({ id: 7 })
		mockGetMatchById.mockResolvedValue({ id: 42 })
		mockAddProgrammedMatch.mockResolvedValue(true)

		await controller.addSchedulingMatchesController(req, res)
		expect(res.json).toHaveBeenCalledWith({ message: 'Match planifié' })
	})

	test('message 401 (user/match inconnu) EXACT', async () => {
		mockGetUserById.mockResolvedValue(null)
		mockGetMatchById.mockResolvedValue(null)

		await controller.addSchedulingMatchesController(req, res)
		expect(res.json).toHaveBeenCalledWith({
			message: 'Utilisateur inconnu ou match inconnu',
		})
	})

	test('message 401 (échec planif) conserve la faute "plannifié"', async () => {
		// Faute d'orthographe historique. Si on la corrige côté serveur,
		// il faut prévenir le front (i18n, tests UI…).
		mockGetUserById.mockResolvedValue({ id: 7 })
		mockGetMatchById.mockResolvedValue({ id: 42 })
		mockAddProgrammedMatch.mockResolvedValue(false)

		await controller.addSchedulingMatchesController(req, res)
		expect(res.json).toHaveBeenCalledWith({
			message: 'Impossible de plannifié le match',
		})
	})

	// ------------------------------------------------------------------
	// Codes HTTP figés
	// ------------------------------------------------------------------
	test('utilise 401 (et NON 404 ou 400) pour les ressources introuvables', async () => {
		mockGetUserById.mockResolvedValue(null)
		mockGetMatchById.mockResolvedValue({ id: 42 })

		await controller.addSchedulingMatchesController(req, res)
		expect(res.status).toHaveBeenCalledWith(401)
	})

	test('utilise 500 pour toute exception interne (jamais 200)', async () => {
		mockGetUserById.mockRejectedValue(new Error('x'))
		await controller.addSchedulingMatchesController(req, res)
		expect(res.status).toHaveBeenCalledWith(500)
		expect(res.status).not.toHaveBeenCalledWith(200)
	})

	// ------------------------------------------------------------------
	// Ordre d'appel
	// ------------------------------------------------------------------
	test('vérifie le bar AVANT le match (ordre des appels)', async () => {
		mockGetUserById.mockResolvedValue({ id: 7 })
		mockGetMatchById.mockResolvedValue({ id: 42 })
		mockAddProgrammedMatch.mockResolvedValue(true)

		await controller.addSchedulingMatchesController(req, res)

		const userOrder = mockGetUserById.mock.invocationCallOrder[0]
		const matchOrder = mockGetMatchById.mock.invocationCallOrder[0]
		const addOrder = mockAddProgrammedMatch.mock.invocationCallOrder[0]

		expect(userOrder).toBeLessThan(matchOrder)
		expect(matchOrder).toBeLessThan(addOrder)
	})

	test('REGRESSION : getMatchById est appelée sur l\'instance USER (pas sur bar)', async () => {
		// Comportement actuel inhabituel : `getMatchById` vit sur `db.user()`.
		// Si on déplace cette méthode sur `db.match()` ou `db.bar()`, il faut
		// adapter le contrôleur ET ce test.
		mockGetUserById.mockResolvedValue({ id: 7 })
		mockGetMatchById.mockResolvedValue({ id: 42 })
		mockAddProgrammedMatch.mockResolvedValue(true)

		await controller.addSchedulingMatchesController(req, res)
		expect(mockGetMatchById).toHaveBeenCalled()
		expect(mockUserFactory).toHaveBeenCalled()
	})

	// ------------------------------------------------------------------
	// Lecture du body (pas params)
	// ------------------------------------------------------------------
	test('lit matchId et barId depuis req.body (pas req.params)', async () => {
		req = {
			body: { matchId: 99, barId: 100 },
			params: { matchId: 1, barId: 2 }, // params différents → ignorés
		}
		mockGetUserById.mockResolvedValue({ id: 100 })
		mockGetMatchById.mockResolvedValue({ id: 99 })
		mockAddProgrammedMatch.mockResolvedValue(true)

		await controller.addSchedulingMatchesController(req, res)

		expect(mockGetUserById).toHaveBeenCalledWith(100)
		expect(mockGetMatchById).toHaveBeenCalledWith(99)
	})
})
