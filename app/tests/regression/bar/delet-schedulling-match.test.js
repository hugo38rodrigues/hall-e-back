/* eslint-disable max-len */
/**
 * Tests de régression - deleteSchedulingMatchesController (Vitest)
 * ------------------------------------------------------------------
 * Verrouille les contrats spécifiques : forme du 200 (matchId brut),
 * messages d'erreur exacts, lecture des params, codes HTTP.
 *
 * NE JAMAIS supprimer un test sans comprendre l'invariant qu'il garantit.
 */

import {
	beforeEach,
	describe,
	expect,
	test,
	vi,
} from 'vitest'

import { dbMocks, resetAllMocks } from '../../utils/setup.js'

const { BarController } = await import('../../../controllers/bar.controller.js')
const { logger } = await import('../../../utils/logger.js')

describe('REGRESSION - deleteSchedulingMatchesController', () => {
	let controller
	let req
	let res

	beforeEach(() => {
		resetAllMocks()
		controller = new BarController()
		req = { params: { matchId: '42', barId: '7' } } // strings, comme Express
		res = {
			status: vi.fn().mockReturnThis(),
			json: vi.fn().mockReturnThis(),
		}
	})

	// REG-001 ----------------------------------------------------
	test('REG-001 : le 200 renvoie matchId BRUT, pas un { matchId } ni { message }', async () => {
		dbMocks.getUserById.mockResolvedValue({ id: 7 })
		dbMocks.getMatchById.mockResolvedValue({ id: 42 })
		dbMocks.deleteProgMatch.mockResolvedValue(true)

		await controller.deleteSchedulingMatchesController(req, res)

		expect(res.status).toHaveBeenCalledWith(200)
		expect(res.json).toHaveBeenCalledWith('42') // string brute, pas un objet
		expect(res.json).not.toHaveBeenCalledWith(
			expect.objectContaining({ matchId: expect.anything() }),
		)
		expect(res.json).not.toHaveBeenCalledWith(
			expect.objectContaining({ message: expect.any(String) }),
		)
	})

	// REG-002 ----------------------------------------------------
	test('REG-002 : message 401 EXACT pour ressource introuvable', async () => {
		dbMocks.getUserById.mockResolvedValue(null)
		dbMocks.getMatchById.mockResolvedValue(null)

		await controller.deleteSchedulingMatchesController(req, res)

		expect(res.json).toHaveBeenCalledWith({
			message: 'Utilisateur inconnu ou match inconnu',
		})
	})

	// REG-003 ----------------------------------------------------
	test('REG-003 : message 401 EXACT quand la suppression échoue', async () => {
		dbMocks.getUserById.mockResolvedValue({ id: 7 })
		dbMocks.getMatchById.mockResolvedValue({ id: 42 })
		dbMocks.deleteProgMatch.mockResolvedValue(false)

		await controller.deleteSchedulingMatchesController(req, res)

		expect(res.status).toHaveBeenCalledWith(401)
		expect(res.json).toHaveBeenCalledWith({
			message: 'Impossible de supprimer le match',
		})
	})

	// REG-004 ----------------------------------------------------
	test('REG-004 : lit matchId et barId depuis req.params (pas req.body)', async () => {
		req = {
			params: { matchId: 'abc', barId: 'xyz' },
			body: { matchId: '999', barId: '999' }, // doit être ignoré
		}
		dbMocks.getUserById.mockResolvedValue({ id: 'xyz' })
		dbMocks.getMatchById.mockResolvedValue({ id: 'abc' })
		dbMocks.deleteProgMatch.mockResolvedValue(true)

		await controller.deleteSchedulingMatchesController(req, res)

		expect(dbMocks.getUserById).toHaveBeenCalledWith('xyz')
		expect(dbMocks.getMatchById).toHaveBeenCalledWith('abc')
		expect(dbMocks.getUserById).not.toHaveBeenCalledWith('999')
		expect(dbMocks.getMatchById).not.toHaveBeenCalledWith('999')
	})

	// REG-005 ----------------------------------------------------
	test('REG-005 : passe { matchId, barId } à deleteProgMatch (clés exactes)', async () => {
		dbMocks.getUserById.mockResolvedValue({ id: 7 })
		dbMocks.getMatchById.mockResolvedValue({ id: 42 })
		dbMocks.deleteProgMatch.mockResolvedValue(true)

		await controller.deleteSchedulingMatchesController(req, res)

		expect(dbMocks.deleteProgMatch).toHaveBeenCalledWith({
			matchId: '42',
			barId: '7',
		})
	})

	// REG-006 ----------------------------------------------------
	test('REG-006 : logue en INFO en cas de succès', async () => {
		dbMocks.getUserById.mockResolvedValue({ id: 7 })
		dbMocks.getMatchById.mockResolvedValue({ id: 42 })
		dbMocks.deleteProgMatch.mockResolvedValue(true)

		await controller.deleteSchedulingMatchesController(req, res)

		expect(logger.info).toHaveBeenCalledWith('Match successfully deleted')
	})

	// REG-007 ----------------------------------------------------
	test('REG-007 : logue en ERROR quand user/match inconnu', async () => {
		dbMocks.getUserById.mockResolvedValue(null)
		dbMocks.getMatchById.mockResolvedValue({ id: 42 })

		await controller.deleteSchedulingMatchesController(req, res)

		expect(logger.error).toHaveBeenCalledWith('User or match unknow')
	})

	// REG-008 ----------------------------------------------------
	test('REG-008 : logue en ERROR quand la suppression échoue', async () => {
		dbMocks.getUserById.mockResolvedValue({ id: 7 })
		dbMocks.getMatchById.mockResolvedValue({ id: 42 })
		dbMocks.deleteProgMatch.mockResolvedValue(false)

		await controller.deleteSchedulingMatchesController(req, res)

		expect(logger.error).toHaveBeenCalledWith('There is no schedule')
	})

	// REG-009 ----------------------------------------------------
	test('REG-009 : 401 (et non 404) pour ressource introuvable', async () => {
		dbMocks.getUserById.mockResolvedValue(null)
		dbMocks.getMatchById.mockResolvedValue({ id: 42 })

		await controller.deleteSchedulingMatchesController(req, res)

		expect(res.status).toHaveBeenCalledWith(401)
		expect(res.status).not.toHaveBeenCalledWith(404)
	})

	// REG-010 ----------------------------------------------------
	test('REG-010 : 500 sur exception DB, message générique (pas de leak)', async () => {
		const sensitive = 'postgres://user:secret@db:5432'
		dbMocks.getUserById.mockRejectedValue(new Error(sensitive))

		await controller.deleteSchedulingMatchesController(req, res)

		expect(res.status).toHaveBeenCalledWith(500)
		const body = res.json.mock.calls[0][0]
		expect(body).toEqual({ message: 'Erreur serveur' })
		expect(JSON.stringify(body)).not.toContain('postgres')
		expect(JSON.stringify(body)).not.toContain('secret')
	})

	// REG-011 ----------------------------------------------------
	test('REG-011 : si user introuvable, deleteProgMatch n\'est PAS appelé', async () => {
		dbMocks.getUserById.mockResolvedValue(null)
		dbMocks.getMatchById.mockResolvedValue({ id: 42 })

		await controller.deleteSchedulingMatchesController(req, res)

		expect(dbMocks.deleteProgMatch).not.toHaveBeenCalled()
	})
})
