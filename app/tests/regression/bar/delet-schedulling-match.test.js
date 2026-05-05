/* eslint-disable max-len */
/* eslint-disable no-underscore-dangle */
/**
 * Tests de régression - deletedSchedulingMatchesController (Vitest)
 * ------------------------------------------------------------------
 * Verrouille les contrats spécifiques : forme du 200 (matchId brut),
 * faute d'orthographe conservée, lecture des params, etc.
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
const { mockGetUserById, mockGetMatchById, mockDeletedProgMatch } = dbModule.__mocks

describe('REGRESSION - deletedSchedulingMatchesController', () => {
	let controller; let req; let
		res

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
	// Contrat de la réponse 200 : matchId BRUT (pas un objet)
	// ------------------------------------------------------------------
	test('REGRESSION : le 200 renvoie matchId BRUT, pas un { matchId } ni { message }', async () => {
		mockGetUserById.mockResolvedValue({ id: 7 })
		mockGetMatchById.mockResolvedValue({ id: 42 })
		mockDeletedProgMatch.mockResolvedValue(true)

		await controller.deletedSchedulingMatchesController(req, res)
		expect(res.json).toHaveBeenCalledWith(42)
		expect(res.json).not.toHaveBeenCalledWith(expect.objectContaining({ matchId: 42 }))
		expect(res.json).not.toHaveBeenCalledWith(expect.objectContaining({ message: expect.any(String) }))
	})

	// ------------------------------------------------------------------
	// Messages d'erreur exacts
	// ------------------------------------------------------------------
	test('message 401 EXACT pour ressource introuvable', async () => {
		mockGetUserById.mockResolvedValue(null)
		mockGetMatchById.mockResolvedValue(null)

		await controller.deletedSchedulingMatchesController(req, res)
		expect(res.json).toHaveBeenCalledWith({
			message: 'Utilisateur inconnu ou match inconnu',
		})
	})

	test('message 401 conserve la faute "supprimé" (au lieu de "supprimer")', async () => {
		// Faute conservée intentionnellement → adapter front si correction.
		mockGetUserById.mockResolvedValue({ id: 7 })
		mockGetMatchById.mockResolvedValue({ id: 42 })
		mockDeletedProgMatch.mockResolvedValue(false)

		await controller.deletedSchedulingMatchesController(req, res)
		expect(res.json).toHaveBeenCalledWith({
			message: 'Impossible de supprimé le match',
		})
	})

	// ------------------------------------------------------------------
	// Lecture des params (pas body)
	// ------------------------------------------------------------------
	test('lit matchId et barId depuis req.params (pas req.body)', async () => {
		req = {
			params: { matchId: 'abc', barId: 'xyz' },
			body: { matchId: 999, barId: 999 },
		}
		mockGetUserById.mockResolvedValue({ id: 'xyz' })
		mockGetMatchById.mockResolvedValue({ id: 'abc' })
		mockDeletedProgMatch.mockResolvedValue(true)

		await controller.deletedSchedulingMatchesController(req, res)
		expect(mockGetUserById).toHaveBeenCalledWith('xyz')
		expect(mockGetMatchById).toHaveBeenCalledWith('abc')
	})

	// ------------------------------------------------------------------
	// Logs
	// ------------------------------------------------------------------
	test('logge en INFO le résultat de deletedProgMatch quand succès', async () => {
		mockGetUserById.mockResolvedValue({ id: 7 })
		mockGetMatchById.mockResolvedValue({ id: 42 })
		mockDeletedProgMatch.mockResolvedValue(true)

		await controller.deletedSchedulingMatchesController(req, res)
		expect(controller.newLogger.info).toHaveBeenCalledWith(true)
	})

	test('logge en ERROR avec le message "Impossible to deleted match" quand échec', async () => {
		mockGetUserById.mockResolvedValue({ id: 7 })
		mockGetMatchById.mockResolvedValue({ id: 42 })
		mockDeletedProgMatch.mockResolvedValue(false)

		await controller.deletedSchedulingMatchesController(req, res)
		expect(controller.newLogger.error).toHaveBeenCalledWith('Impossible to deleted match')
	})

	// ------------------------------------------------------------------
	// Codes HTTP
	// ------------------------------------------------------------------
	test('REGRESSION : 401 (et non 404) pour ressource introuvable', async () => {
		mockGetUserById.mockResolvedValue(null)
		mockGetMatchById.mockResolvedValue({ id: 42 })

		await controller.deletedSchedulingMatchesController(req, res)
		expect(res.status).toHaveBeenCalledWith(401)
	})
})
