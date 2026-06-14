/**
 * Tests unitaires - deleteSchedulingMatchesController (Vitest)
 * --------------------------------------------------------------
 */

import {
	beforeEach,
	describe,
	expect,
	test,
	vi,
} from 'vitest'

import { dbMocks, loggerMock, resetAllMocks } from '../../../utils/setup.js'

const { BarController } = await import('../../../../controllers/bar.controller.js')

describe('BarController.deleteSchedulingMatchesController', () => {
	let controller
	let req
	let res

	beforeEach(() => {
		resetAllMocks()
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
		dbMocks.getUserById.mockResolvedValue({ id: 7 })
		dbMocks.getMatchById.mockResolvedValue({ id: 42 })
		dbMocks.deleteProgMatch.mockResolvedValue(true)

		await controller.deleteSchedulingMatchesController(req, res)

		expect(dbMocks.deleteProgMatch).toHaveBeenCalledWith({ matchId: 42, barId: 7 })
		expect(res.status).toHaveBeenCalledWith(200)
		expect(res.json).toHaveBeenCalledWith(42)
		expect(loggerMock.info).toHaveBeenCalledWith('Match successfully deleted')
	})

	// ------------------------------------------------------------------
	// Utilisateur ou match inconnu
	// ------------------------------------------------------------------
	test('retourne 401 si le bar est introuvable', async () => {
		dbMocks.getUserById.mockResolvedValue(null)
		dbMocks.getMatchById.mockResolvedValue({ id: 42 })

		await controller.deleteSchedulingMatchesController(req, res)

		expect(res.status).toHaveBeenCalledWith(401)
		expect(res.json).toHaveBeenCalledWith({
			message: 'Utilisateur inconnu ou match inconnu',
		})
		expect(dbMocks.deleteProgMatch).not.toHaveBeenCalled()
		expect(loggerMock.error).toHaveBeenCalledWith('User or match unknow')
	})

	test('retourne 401 si le match est introuvable', async () => {
		dbMocks.getUserById.mockResolvedValue({ id: 7 })
		dbMocks.getMatchById.mockResolvedValue(null)

		await controller.deleteSchedulingMatchesController(req, res)

		expect(res.status).toHaveBeenCalledWith(401)
		expect(dbMocks.deleteProgMatch).not.toHaveBeenCalled()
	})

	test('retourne 401 si bar ET match sont introuvables', async () => {
		dbMocks.getUserById.mockResolvedValue(null)
		dbMocks.getMatchById.mockResolvedValue(null)

		await controller.deleteSchedulingMatchesController(req, res)

		expect(res.status).toHaveBeenCalledWith(401)
		expect(dbMocks.deleteProgMatch).not.toHaveBeenCalled()
	})

	// ------------------------------------------------------------------
	// Échec de la suppression
	// ------------------------------------------------------------------
	test('retourne 401 si deleteProgMatch retourne false', async () => {
		dbMocks.getUserById.mockResolvedValue({ id: 7 })
		dbMocks.getMatchById.mockResolvedValue({ id: 42 })
		dbMocks.deleteProgMatch.mockResolvedValue(false)

		await controller.deleteSchedulingMatchesController(req, res)

		expect(res.status).toHaveBeenCalledWith(401)
		expect(res.json).toHaveBeenCalledWith({
			message: 'Impossible de supprimer le match',
		})
		expect(loggerMock.error).toHaveBeenCalledWith('There is no schedule')
	})

	test('retourne 401 si deleteProgMatch retourne 0 (falsy)', async () => {
		dbMocks.getUserById.mockResolvedValue({ id: 7 })
		dbMocks.getMatchById.mockResolvedValue({ id: 42 })
		dbMocks.deleteProgMatch.mockResolvedValue(0)

		await controller.deleteSchedulingMatchesController(req, res)

		expect(res.status).toHaveBeenCalledWith(401)
	})

	test('retourne 401 si deleteProgMatch retourne null (falsy)', async () => {
		dbMocks.getUserById.mockResolvedValue({ id: 7 })
		dbMocks.getMatchById.mockResolvedValue({ id: 42 })
		dbMocks.deleteProgMatch.mockResolvedValue(null)

		await controller.deleteSchedulingMatchesController(req, res)

		expect(res.status).toHaveBeenCalledWith(401)
	})

	// ------------------------------------------------------------------
	// Erreurs serveur
	// ------------------------------------------------------------------
	test('retourne 500 si getUserById lève une exception', async () => {
		const error = new Error('Connection lost')
		dbMocks.getUserById.mockRejectedValue(error)

		await controller.deleteSchedulingMatchesController(req, res)

		expect(res.status).toHaveBeenCalledWith(500)
		expect(res.json).toHaveBeenCalledWith({ message: 'Erreur serveur' })
		expect(loggerMock.error).toHaveBeenCalledWith('Connection lost')
	})

	test('retourne 500 si deleteProgMatch lève une exception', async () => {
		dbMocks.getUserById.mockResolvedValue({ id: 7 })
		dbMocks.getMatchById.mockResolvedValue({ id: 42 })
		dbMocks.deleteProgMatch.mockRejectedValue(new Error('Foreign key violation'))

		await controller.deleteSchedulingMatchesController(req, res)

		expect(res.status).toHaveBeenCalledWith(500)
		expect(res.json).toHaveBeenCalledWith({ message: 'Erreur serveur' })
	})

	// ------------------------------------------------------------------
	// Cohérence des paramètres
	// ------------------------------------------------------------------
	test('passe correctement matchId et barId à deleteProgMatch', async () => {
		dbMocks.getUserById.mockResolvedValue({ id: 7 })
		dbMocks.getMatchById.mockResolvedValue({ id: 42 })
		dbMocks.deleteProgMatch.mockResolvedValue(true)

		await controller.deleteSchedulingMatchesController(req, res)

		const callArg = dbMocks.deleteProgMatch.mock.calls[0][0]
		expect(callArg).toMatchObject({ matchId: 42, barId: 7 })
	})

	test('lit matchId et barId depuis req.params (pas req.body)', async () => {
		req = {
			params: { matchId: 'abc', barId: 'xyz' },
			body: { matchId: 999, barId: 999 }, // doit être ignoré
		}
		dbMocks.getUserById.mockResolvedValue({ id: 'xyz' })
		dbMocks.getMatchById.mockResolvedValue({ id: 'abc' })
		dbMocks.deleteProgMatch.mockResolvedValue(true)

		await controller.deleteSchedulingMatchesController(req, res)

		expect(dbMocks.getUserById).toHaveBeenCalledWith('xyz')
		expect(dbMocks.getMatchById).toHaveBeenCalledWith('abc')
	})
})
