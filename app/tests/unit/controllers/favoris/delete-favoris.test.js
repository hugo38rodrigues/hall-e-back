/**
 * Tests unitaires - deleteFavorites (dispatcher) — version corrigée
 *
 * Désormais SYMÉTRIQUE de addFavorites (corrigé) :
 * mêmes codes HTTP, mêmes validations, même protocole.
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

describe('FavorisController.deleteFavorites', () => {
	let controller; let req; let
		res

	beforeEach(() => {
		resetAllMocks()
		controller = new FavorisController();
		({ req, res } = buildReqRes({
			body: { userId: 5, type: 'game', id: 10 },
		}))
	})

	// ------------------------------------------------------------------
	// Routage
	// ------------------------------------------------------------------
	test('type "game" → removeFavoriteGame', async () => {
		dbMocks.getUserById.mockResolvedValue(mockUser('client'))
		dbMocks.removeFavoriteGame.mockResolvedValue({ games: [] })

		await controller.deleteFavorites(req, res)

		expect(dbMocks.removeFavoriteGame).toHaveBeenCalledWith({ clientId: 5, id: 10 })
		expect(res.status).toHaveBeenCalledWith(200)
	})

	test('type "league" → removeFavoriteLeague', async () => {
		req.body.type = 'league'
		dbMocks.getUserById.mockResolvedValue(mockUser('client'))
		dbMocks.removeFavoriteLeague.mockResolvedValue({ leagues: [] })

		await controller.deleteFavorites(req, res)

		expect(dbMocks.removeFavoriteLeague).toHaveBeenCalledWith({ clientId: 5, id: 10 })
	})

	test('type "teams" → removeFavoriteTeam', async () => {
		req.body.type = 'teams'
		dbMocks.getUserById.mockResolvedValue(mockUser('client'))
		dbMocks.removeFavoriteTeam.mockResolvedValue({ teams: [] })

		await controller.deleteFavorites(req, res)

		expect(dbMocks.removeFavoriteTeam).toHaveBeenCalledWith({ clientId: 5, id: 10 })
	})

	test('type "barName" client → removeFavoriteBar + retourne tableau formaté', async () => {
		req.body.type = 'barName'
		dbMocks.getUserById.mockResolvedValue(mockUser('client'))
		dbMocks.removeFavoriteBar.mockResolvedValue([
			{ id: 1, name: 'Bar A', address: 'leak' },
		])

		await controller.deleteFavorites(req, res)

		expect(dbMocks.removeFavoriteBar).toHaveBeenCalledWith({ clientId: 5, barId: 10 })
		// Le formatage est appliqué (correction du leak)
		expect(res.json).toHaveBeenCalledWith([{ id: 1, name: 'Bar A' }])
	})

	// ------------------------------------------------------------------
	// Validation des inputs (symétrique à add)
	// ------------------------------------------------------------------
	test('400 si type inconnu', async () => {
		req.body.type = 'unknown'

		await controller.deleteFavorites(req, res)

		expect(res.status).toHaveBeenCalledWith(400)
	})

	test('400 si userId manquant', async () => {
		delete req.body.userId

		await controller.deleteFavorites(req, res)

		expect(res.status).toHaveBeenCalledWith(400)
	})

	test('400 si id manquant', async () => {
		delete req.body.id

		await controller.deleteFavorites(req, res)

		expect(res.status).toHaveBeenCalledWith(400)
	})

	// ------------------------------------------------------------------
	// Sentinels (symétriques à add)
	// ------------------------------------------------------------------
	test('user introuvable → 404 (corrigé : avant, delete laissait passer en 200)', async () => {
		dbMocks.getUserById.mockResolvedValue(null)

		await controller.deleteFavorites(req, res)

		expect(res.status).toHaveBeenCalledWith(404)
	})

	test('mauvais rôle → 403', async () => {
		dbMocks.getUserById.mockResolvedValue(mockUser('admin'))

		await controller.deleteFavorites(req, res)

		expect(res.status).toHaveBeenCalledWith(403)
	})

	test('exception → 500', async () => {
		dbMocks.getUserById.mockRejectedValue(new Error('boom'))

		await controller.deleteFavorites(req, res)

		expect(res.status).toHaveBeenCalledWith(500)
	})
})
