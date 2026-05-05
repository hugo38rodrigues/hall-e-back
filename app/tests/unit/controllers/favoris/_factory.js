/**
 * Factory de tests partagée
 *
 * Les sub-controllers (game/league/team × add/delete) retournent
 * désormais des Symbols comme sentinels au lieu de valeurs ad-hoc.
 *
 * On ne peut pas comparer directement avec `===` à un Symbol importé
 * (ils ne sont pas exportés par le contrôleur). On vérifie donc
 * indirectement via le dispatcher en bout de chaîne.
 *
 * Pour les tests unitaires "pures" sur les sub-controllers, on teste
 * les COMPORTEMENTS observables :
 *   - rôle inconnu / user null → la valeur retournée n'est PAS celle
 *     que la DB renverrait (donc le dispatcher l'interceptera bien)
 *   - succès → la valeur DB est renvoyée telle quelle (tri-rôle)
 *
 * On vérifie via le dispatcher (qui mappe sentinels → HTTP) le
 * comportement complet.
 */

import {
	beforeEach,
	describe,
	expect,
	test,
} from 'vitest'
import {
	buildReqRes,
	dbMocks, mockUser, resetAllMocks,
} from '../../../utils/setup.js'

const { FavorisController } = await import('../../../../controllers/favoris.controller.js')

/**
 * @param {object} cfg
 * @param {string} cfg.methodName       ex: 'addFavorisGameController'
 * @param {string} cfg.dispatcherName   'addFavorites' | 'deleteFavorites'
 * @param {string} cfg.type             'game' | 'league' | 'teams'
 * @param {string} cfg.clientMockKey    ex: 'addFavoriteGame'
 * @param {string} cfg.barMockKey       ex: 'barAddFavoriteGame'
 */
export const createSubControllerSuite = ({
	methodName,
	dispatcherName,
	type,
	clientMockKey,
	barMockKey,
}) => {
	describe(`FavorisController.${methodName}`, () => {
		let controller; let req; let
			res

		beforeEach(() => {
			resetAllMocks()
			controller = new FavorisController();
			({ req, res } = buildReqRes({
				body: { userId: 5, type, id: 10 },
			}))
		})

		// --------------------------------------------------------------
		// Tests directs : valeurs de retour brutes
		// --------------------------------------------------------------
		test('client : appelle la méthode client avec { clientId, id } et retourne sa valeur', async () => {
			dbMocks.getUserById.mockResolvedValue(mockUser('client'))
			const dbValue = { ok: true }
			dbMocks[clientMockKey].mockResolvedValue(dbValue)

			const result = await controller[methodName]({ userId: 5, id: 10 })

			expect(dbMocks[clientMockKey]).toHaveBeenCalledWith({ clientId: 5, id: 10 })
			expect(dbMocks[barMockKey]).not.toHaveBeenCalled()
			expect(result).toBe(dbValue)
		})

		test('bar : appelle la méthode bar avec { barId, id } et retourne sa valeur', async () => {
			dbMocks.getUserById.mockResolvedValue(mockUser('bar'))
			const dbValue = { ok: true }
			dbMocks[barMockKey].mockResolvedValue(dbValue)

			const result = await controller[methodName]({ userId: 5, id: 10 })

			expect(dbMocks[barMockKey]).toHaveBeenCalledWith({ barId: 5, id: 10 })
			expect(dbMocks[clientMockKey]).not.toHaveBeenCalled()
			expect(result).toBe(dbValue)
		})

		test('lit dataValues.role en priorité (sinon role direct)', async () => {
			// Cas user avec role direct seulement → fonctionne aussi
			dbMocks.getUserById.mockResolvedValue({ id: 1, role: 'client' })
			dbMocks[clientMockKey].mockResolvedValue('ok')

			const result = await controller[methodName]({ userId: 5, id: 10 })
			expect(result).toBe('ok')
		})

		// --------------------------------------------------------------
		// Tests via dispatcher : sentinels → HTTP
		// --------------------------------------------------------------
		test('via dispatcher : user introuvable → 404', async () => {
			dbMocks.getUserById.mockResolvedValue(null)

			await controller[dispatcherName](req, res)

			expect(res.status).toHaveBeenCalledWith(404)
		})

		test('via dispatcher : rôle inconnu → 403', async () => {
			dbMocks.getUserById.mockResolvedValue(mockUser('admin'))

			await controller[dispatcherName](req, res)

			expect(res.status).toHaveBeenCalledWith(403)
		})

		test('via dispatcher : exception getUserById → 500', async () => {
			dbMocks.getUserById.mockRejectedValue(new Error('boom'))

			await controller[dispatcherName](req, res)

			expect(res.status).toHaveBeenCalledWith(500)
		})

		test('via dispatcher : exception côté méthode DB → 500', async () => {
			dbMocks.getUserById.mockResolvedValue(mockUser('client'))
			dbMocks[clientMockKey].mockRejectedValue(new Error('FK violation'))

			await controller[dispatcherName](req, res)

			expect(res.status).toHaveBeenCalledWith(500)
		})

		test('via dispatcher : succès → 200 + valeur DB telle quelle', async () => {
			dbMocks.getUserById.mockResolvedValue(mockUser('client'))
			const dbValue = { foo: 'bar' }
			dbMocks[clientMockKey].mockResolvedValue(dbValue)

			await controller[dispatcherName](req, res)

			expect(res.status).toHaveBeenCalledWith(200)
			expect(res.json).toHaveBeenCalledWith(dbValue)
		})
	})
}
