/**
 * Tests unitaires - deletedSchedulingMatchesController (Vitest)
 * --------------------------------------------------------------
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
	const mockDeletedProgMatch = vi.fn()
	return {
		db: {
			user: vi.fn(async () => ({
				getUserById: mockGetUserById,
				getMatchById: mockGetMatchById,
			})),
			bar: vi.fn(async () => ({
				deletedProgMatch: mockDeletedProgMatch,
			})),
		},
		__mocks: { mockGetUserById, mockGetMatchById, mockDeletedProgMatch },
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

const { BarController } = await import('../../../../controllers/bar.controller.js')
const dbModule = await import('@hugo38rodrigues/bdd-service-hall-e/main.js')
// eslint-disable-next-line no-underscore-dangle
const { mockGetUserById, mockGetMatchById, mockDeletedProgMatch } = dbModule.__mocks

describe('BarController.deletedSchedulingMatchesController', () => {
	let controller
	let req
	let res

	beforeEach(() => {
		vi.clearAllMocks()
		controller = new BarController()

		req = { params: { matchId: 42, barId: 7 } }
		res = {
			status: vi.fn().mockReturnThis(),
			json: vi.fn().mockReturnThis(),
		}
	})

	// ------------------------------------------------------------------
	// Cas nominal
	// ------------------------------------------------------------------
	test('retourne 200 et le matchId quand la suppression réussit', async () => {
		mockGetUserById.mockResolvedValue({ id: 7 })
		mockGetMatchById.mockResolvedValue({ id: 42 })
		mockDeletedProgMatch.mockResolvedValue(true)

		await controller.deletedSchedulingMatchesController(req, res)

		expect(mockDeletedProgMatch).toHaveBeenCalledWith({ matchId: 42, barId: 7 })
		expect(res.status).toHaveBeenCalledWith(200)
		expect(res.json).toHaveBeenCalledWith(42)
		expect(controller.newLogger.info).toHaveBeenCalledWith(true)
	})

	// ------------------------------------------------------------------
	// Utilisateur ou match inconnu
	// ------------------------------------------------------------------
	test('retourne 401 si le bar est introuvable', async () => {
		mockGetUserById.mockResolvedValue(null)
		mockGetMatchById.mockResolvedValue({ id: 42 })

		await controller.deletedSchedulingMatchesController(req, res)

		expect(res.status).toHaveBeenCalledWith(401)
		expect(res.json).toHaveBeenCalledWith({
			message: 'Utilisateur inconnu ou match inconnu',
		})
		expect(mockDeletedProgMatch).not.toHaveBeenCalled()
	})

	test('retourne 401 si le match est introuvable', async () => {
		mockGetUserById.mockResolvedValue({ id: 7 })
		mockGetMatchById.mockResolvedValue(null)

		await controller.deletedSchedulingMatchesController(req, res)

		expect(res.status).toHaveBeenCalledWith(401)
		expect(mockDeletedProgMatch).not.toHaveBeenCalled()
	})

	// ------------------------------------------------------------------
	// Échec de la suppression
	// ------------------------------------------------------------------
	test('retourne 401 si deletedProgMatch retourne false', async () => {
		mockGetUserById.mockResolvedValue({ id: 7 })
		mockGetMatchById.mockResolvedValue({ id: 42 })
		mockDeletedProgMatch.mockResolvedValue(false)

		await controller.deletedSchedulingMatchesController(req, res)

		expect(res.status).toHaveBeenCalledWith(401)
		expect(res.json).toHaveBeenCalledWith({
			message: 'Impossible de supprimé le match',
		})
		expect(controller.newLogger.error).toHaveBeenCalledWith('Impossible to deleted match')
	})

	test('retourne 401 si deletedProgMatch retourne 0 (falsy)', async () => {
		mockGetUserById.mockResolvedValue({ id: 7 })
		mockGetMatchById.mockResolvedValue({ id: 42 })
		mockDeletedProgMatch.mockResolvedValue(0)

		await controller.deletedSchedulingMatchesController(req, res)

		expect(res.status).toHaveBeenCalledWith(401)
	})

	// ------------------------------------------------------------------
	// Erreurs serveur
	// ------------------------------------------------------------------
	test('retourne 500 si une exception est levée', async () => {
		const error = new Error('Connection lost')
		mockGetUserById.mockRejectedValue(error)

		await controller.deletedSchedulingMatchesController(req, res)

		expect(res.status).toHaveBeenCalledWith(500)
		expect(res.json).toHaveBeenCalledWith({ message: 'Erreur serveur' })
		expect(controller.newLogger.error).toHaveBeenCalledWith(error)
	})

	test('retourne 500 si deletedProgMatch lève une exception', async () => {
		mockGetUserById.mockResolvedValue({ id: 7 })
		mockGetMatchById.mockResolvedValue({ id: 42 })
		mockDeletedProgMatch.mockRejectedValue(new Error('Foreign key violation'))

		await controller.deletedSchedulingMatchesController(req, res)

		expect(res.status).toHaveBeenCalledWith(500)
	})

	// ------------------------------------------------------------------
	// Cohérence des paramètres
	// ------------------------------------------------------------------
	test('passe correctement matchId et barId à deletedProgMatch (ordre des clés)', async () => {
		mockGetUserById.mockResolvedValue({ id: 7 })
		mockGetMatchById.mockResolvedValue({ id: 42 })
		mockDeletedProgMatch.mockResolvedValue(true)

		await controller.deletedSchedulingMatchesController(req, res)

		const callArg = mockDeletedProgMatch.mock.calls[0][0]
		expect(callArg).toMatchObject({ matchId: 42, barId: 7 })
	})
})
