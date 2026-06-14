/**
 * Tests unitaires - addSchedulingMatchesController (Vitest)
 * ----------------------------------------------------------
 * Stratégie : tous les mocks sont centralisés dans setup.js.
 */

import {
	beforeEach,
	describe,
	expect,
	test,
	vi,
} from 'vitest'

import { dbMocks, resetAllMocks } from '../../../utils/setup.js'

const { BarController } = await import('../../../../controllers/bar.controller.js')
const { loggerMock } = await import('../../../utils/setup.js')

describe('BarController.addSchedulingMatchesController', () => {
	let controller
	let req
	let res

	beforeEach(() => {
		resetAllMocks()
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
		dbMocks.getUserById.mockResolvedValue({ id: 7, role: 'bar' })
		dbMocks.getMatchById.mockResolvedValue({ id: 42, date: new Date() })
		dbMocks.addProgrammedMatch.mockResolvedValue(true)

		await controller.addSchedulingMatchesController(req, res)

		expect(dbMocks.getUserById).toHaveBeenCalledWith(7)
		expect(dbMocks.getMatchById).toHaveBeenCalledWith(42)
		expect(dbMocks.addProgrammedMatch).toHaveBeenCalledWith({ barId: 7, matchId: 42 })
		expect(res.status).toHaveBeenCalledWith(200)
		expect(res.json).toHaveBeenCalledWith({ message: 'Match planifié' })
	})

	// ------------------------------------------------------------------
	// Cas d'erreur : utilisateur ou match inconnu
	// ------------------------------------------------------------------
	test('retourne 401 si le bar est introuvable', async () => {
		dbMocks.getUserById.mockResolvedValue(null)
		dbMocks.getMatchById.mockResolvedValue({ id: 42 })

		await controller.addSchedulingMatchesController(req, res)

		expect(res.status).toHaveBeenCalledWith(401)
		expect(res.json).toHaveBeenCalledWith({
			message: 'Utilisateur inconnu ou match inconnu',
		})
		expect(dbMocks.addProgrammedMatch).not.toHaveBeenCalled()
		expect(loggerMock.error).toHaveBeenCalledWith('User or match unknow')
	})

	test('retourne 401 si le match est introuvable', async () => {
		dbMocks.getUserById.mockResolvedValue({ id: 7 })
		dbMocks.getMatchById.mockResolvedValue(null)

		await controller.addSchedulingMatchesController(req, res)

		expect(res.status).toHaveBeenCalledWith(401)
		expect(dbMocks.addProgrammedMatch).not.toHaveBeenCalled()
	})

	test('retourne 401 si bar ET match sont introuvables', async () => {
		dbMocks.getUserById.mockResolvedValue(null)
		dbMocks.getMatchById.mockResolvedValue(null)

		await controller.addSchedulingMatchesController(req, res)

		expect(res.status).toHaveBeenCalledWith(401)
		expect(dbMocks.addProgrammedMatch).not.toHaveBeenCalled()
	})

	// ------------------------------------------------------------------
	// Cas d'erreur : échec de la planification
	// ------------------------------------------------------------------
	test('retourne 401 si addProgrammedMatch retourne false', async () => {
		dbMocks.getUserById.mockResolvedValue({ id: 7 })
		dbMocks.getMatchById.mockResolvedValue({ id: 42 })
		dbMocks.addProgrammedMatch.mockResolvedValue(false)

		await controller.addSchedulingMatchesController(req, res)

		expect(res.status).toHaveBeenCalledWith(401)
		expect(res.json).toHaveBeenCalledWith({
			message: 'Impossible de plannifié le match',
		})
		expect(loggerMock.error).toHaveBeenCalledWith('Impossible planned match')
	})

	test('retourne 401 si addProgrammedMatch retourne null', async () => {
		dbMocks.getUserById.mockResolvedValue({ id: 7 })
		dbMocks.getMatchById.mockResolvedValue({ id: 42 })
		dbMocks.addProgrammedMatch.mockResolvedValue(null)

		await controller.addSchedulingMatchesController(req, res)

		expect(res.status).toHaveBeenCalledWith(401)
	})

	// ------------------------------------------------------------------
	// Cas d'erreur : exception serveur
	// ------------------------------------------------------------------
	test('retourne 500 quand getUserById lève une exception', async () => {
		const error = new Error('DB down')
		dbMocks.getUserById.mockRejectedValue(error)

		await controller.addSchedulingMatchesController(req, res)

		expect(res.status).toHaveBeenCalledWith(500)
		expect(res.json).toHaveBeenCalledWith({ message: 'Erreur serveur' })
		expect(loggerMock.error).toHaveBeenCalled()
	})

	test('retourne 500 quand addProgrammedMatch lève une exception', async () => {
		dbMocks.getUserById.mockResolvedValue({ id: 7 })
		dbMocks.getMatchById.mockResolvedValue({ id: 42 })
		dbMocks.addProgrammedMatch.mockRejectedValue(new Error('Constraint violation'))

		await controller.addSchedulingMatchesController(req, res)

		expect(res.status).toHaveBeenCalledWith(500)
		expect(res.json).toHaveBeenCalledWith({ message: 'Erreur serveur' })
	})

	// ------------------------------------------------------------------
	// Validation de l'input
	// ------------------------------------------------------------------
	test('retourne 401 quand le body est vide', async () => {
		req.body = {}
		dbMocks.getUserById.mockResolvedValue(null)
		dbMocks.getMatchById.mockResolvedValue(null)

		await controller.addSchedulingMatchesController(req, res)

		expect(res.status).toHaveBeenCalledWith(401)
		expect(res.json).toHaveBeenCalledWith({
			message: 'Utilisateur inconnu ou match inconnu',
		})
	})
})
