/**
 * Tests unitaires - addSchedulingMatchesController (Vitest)
 * ----------------------------------------------------------
 * Stratégie :
 *  - Mock complet de la couche `db` (@hugo38rodrigues/bdd-service-hall-e)
 *  - Mock du logger hérité de CommunController
 *  - Mock des objets req/res Express
 *
 * Vitest hoist `vi.mock(...)` avant les imports, donc les mocks
 * doivent être déclarés via la factory pattern + accès aux refs
 * via des helpers exportés du mock.
 */

import {
	beforeEach, describe, expect, test, vi,
} from 'vitest'

// --- Mocks (vi.mock est hoisté en haut du fichier) ---
vi.mock('@hugo38rodrigues/bdd-service-hall-e/main.js', () => {
	const mockGetUserById = vi.fn()
	const mockGetMatchById = vi.fn()
	const mockAddProgrammedMatch = vi.fn()
	return {
		db: {
			user: vi.fn(async () => ({
				getUserById: mockGetUserById,
				getMatchById: mockGetMatchById,
			})),
			bar: vi.fn(async () => ({
				addProgrammedMatch: mockAddProgrammedMatch,
			})),
		},
		// On expose les refs pour pouvoir les piloter depuis les tests
		__mocks: { mockGetUserById, mockGetMatchById, mockAddProgrammedMatch },
	}
})

vi.mock('../../../../utils/constants.js', () => ({
	ERROR_SERVER: 'Erreur serveur',
}))

vi.mock('../../../../utils/match-tools.js', () => ({
	computeAdditionalHours: vi.fn(() => 120),
}))

vi.mock('../../../../controllers/commun.controller.js', () => ({
	CommunController: class {
		constructor() {
			this.newLogger = {
				info: vi.fn(),
				error: vi.fn(),
				warn: vi.fn(),
			}
		}
	},
}))

// Imports après les mocks
const { BarController } = await import('../../../../controllers/bar.controller.js')
const dbModule = await import('@hugo38rodrigues/bdd-service-hall-e/main.js')
// eslint-disable-next-line no-underscore-dangle
const { mockGetUserById, mockGetMatchById, mockAddProgrammedMatch } = dbModule.__mocks

describe('BarController.addSchedulingMatchesController', () => {
	let controller
	let req
	let res

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
	// Cas nominal
	// ------------------------------------------------------------------
	test('retourne 200 et un message de succès quand le match est planifié', async () => {
		mockGetUserById.mockResolvedValue({ id: 7, role: 'bar' })
		mockGetMatchById.mockResolvedValue({ id: 42, date: new Date() })
		mockAddProgrammedMatch.mockResolvedValue(true)

		await controller.addSchedulingMatchesController(req, res)

		expect(mockGetUserById).toHaveBeenCalledWith(7)
		expect(mockGetMatchById).toHaveBeenCalledWith(42)
		expect(mockAddProgrammedMatch).toHaveBeenCalledWith({ barId: 7, matchId: 42 })
		expect(res.status).toHaveBeenCalledWith(200)
		expect(res.json).toHaveBeenCalledWith({ message: 'Match planifié' })
	})

	// ------------------------------------------------------------------
	// Cas d'erreur : utilisateur ou match inconnu
	// ------------------------------------------------------------------
	test('retourne 401 si le bar est introuvable', async () => {
		mockGetUserById.mockResolvedValue(null)
		mockGetMatchById.mockResolvedValue({ id: 42 })

		await controller.addSchedulingMatchesController(req, res)

		expect(res.status).toHaveBeenCalledWith(401)
		expect(res.json).toHaveBeenCalledWith({
			message: 'Utilisateur inconnu ou match inconnu',
		})
		expect(mockAddProgrammedMatch).not.toHaveBeenCalled()
		expect(controller.newLogger.error).toHaveBeenCalledWith('User or match unknow')
	})

	test('retourne 401 si le match est introuvable', async () => {
		mockGetUserById.mockResolvedValue({ id: 7 })
		mockGetMatchById.mockResolvedValue(null)

		await controller.addSchedulingMatchesController(req, res)

		expect(res.status).toHaveBeenCalledWith(401)
		expect(mockAddProgrammedMatch).not.toHaveBeenCalled()
	})

	test('retourne 401 si bar ET match sont introuvables', async () => {
		mockGetUserById.mockResolvedValue(null)
		mockGetMatchById.mockResolvedValue(null)

		await controller.addSchedulingMatchesController(req, res)

		expect(res.status).toHaveBeenCalledWith(401)
		expect(mockAddProgrammedMatch).not.toHaveBeenCalled()
	})

	// ------------------------------------------------------------------
	// Cas d'erreur : échec de la planification
	// ------------------------------------------------------------------
	test('retourne 401 si addProgrammedMatch retourne false', async () => {
		mockGetUserById.mockResolvedValue({ id: 7 })
		mockGetMatchById.mockResolvedValue({ id: 42 })
		mockAddProgrammedMatch.mockResolvedValue(false)

		await controller.addSchedulingMatchesController(req, res)

		expect(res.status).toHaveBeenCalledWith(401)
		expect(res.json).toHaveBeenCalledWith({
			message: 'Impossible de plannifié le match',
		})
		expect(controller.newLogger.error).toHaveBeenCalledWith('Impossible planned match')
	})

	test('retourne 401 si addProgrammedMatch retourne null', async () => {
		mockGetUserById.mockResolvedValue({ id: 7 })
		mockGetMatchById.mockResolvedValue({ id: 42 })
		mockAddProgrammedMatch.mockResolvedValue(null)

		await controller.addSchedulingMatchesController(req, res)

		expect(res.status).toHaveBeenCalledWith(401)
	})

	// ------------------------------------------------------------------
	// Cas d'erreur : exception serveur
	// ------------------------------------------------------------------
	test('retourne 500 quand getUserById lève une exception', async () => {
		const error = new Error('DB down')
		mockGetUserById.mockRejectedValue(error)

		await controller.addSchedulingMatchesController(req, res)

		expect(res.status).toHaveBeenCalledWith(500)
		expect(res.json).toHaveBeenCalledWith({ message: 'Erreur serveur' })
		expect(controller.newLogger.error).toHaveBeenCalledWith(error)
	})

	test('retourne 500 quand addProgrammedMatch lève une exception', async () => {
		mockGetUserById.mockResolvedValue({ id: 7 })
		mockGetMatchById.mockResolvedValue({ id: 42 })
		mockAddProgrammedMatch.mockRejectedValue(new Error('Constraint violation'))

		await controller.addSchedulingMatchesController(req, res)

		expect(res.status).toHaveBeenCalledWith(500)
		expect(res.json).toHaveBeenCalledWith({ message: 'Erreur serveur' })
	})

	// ------------------------------------------------------------------
	// Validation de l'input
	// ------------------------------------------------------------------
	test('retourne 401 quand le body est vide', async () => {
		req.body = {}
		mockGetUserById.mockResolvedValue(null)
		mockGetMatchById.mockResolvedValue(null)

		await controller.addSchedulingMatchesController(req, res)

		expect(res.status).toHaveBeenCalledWith(401)
		expect(res.json).toHaveBeenCalledWith({
			message: 'Utilisateur inconnu ou match inconnu',
		})
	})
})
