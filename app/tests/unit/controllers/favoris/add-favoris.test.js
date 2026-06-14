/**
 * Tests unitaires - addFavorites (dispatcher) — version corrigée
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

describe('FavorisController.addFavorites', () => {
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
	// Routage par type
	// ------------------------------------------------------------------
	test('type "game" client → addFavoriteGame', async () => {
		dbMocks.getUserById.mockResolvedValue(mockUser('client'))
		dbMocks.addFavoriteGame.mockResolvedValue({ games: [{ id: 10 }] })

		await controller.addFavorites(req, res)

		expect(dbMocks.addFavoriteGame).toHaveBeenCalledWith({ clientId: 5, id: 10 })
		expect(res.status).toHaveBeenCalledWith(200)
	})

	test('type "league" → addFavoriteLeague', async () => {
		req.body.type = 'league'
		dbMocks.getUserById.mockResolvedValue(mockUser('client'))
		dbMocks.addFavoriteLeague.mockResolvedValue({ leagues: [] })

		await controller.addFavorites(req, res)

		expect(dbMocks.addFavoriteLeague).toHaveBeenCalledWith({ clientId: 5, id: 10 })
	})

	test('type "teams" → addFavoriteTeam', async () => {
		req.body.type = 'teams'
		dbMocks.getUserById.mockResolvedValue(mockUser('client'))
		dbMocks.addFavoriteTeam.mockResolvedValue({ teams: [] })

		await controller.addFavorites(req, res)

		expect(dbMocks.addFavoriteTeam).toHaveBeenCalledWith({ clientId: 5, id: 10 })
	})

	test('type "barName" client → addFavoriteBar + retourne tableau formaté', async () => {
		req.body.type = 'barName'
		dbMocks.getUserById.mockResolvedValue(mockUser('client'))
		dbMocks.addFavoriteBar.mockResolvedValue([{ id: 1, name: 'Bar A', extra: 'leak' }])

		await controller.addFavorites(req, res)

		expect(dbMocks.addFavoriteBar).toHaveBeenCalledWith({ clientId: 5, barId: 10 })
		expect(res.status).toHaveBeenCalledWith(200)
		expect(res.json).toHaveBeenCalledWith([{ id: 1, name: 'Bar A' }])
	})

	// ------------------------------------------------------------------
	// Validation des inputs
	// ------------------------------------------------------------------
	test('400 si type inconnu', async () => {
		req.body.type = 'unknown'

		await controller.addFavorites(req, res)

		expect(res.status).toHaveBeenCalledWith(400)
		expect(res.json).toHaveBeenCalledWith({ message: 'Type de favori invalide' })
	})

	test('400 si type absent', async () => {
		delete req.body.type

		await controller.addFavorites(req, res)

		expect(res.status).toHaveBeenCalledWith(400)
	})

	test('400 si userId manquant', async () => {
		delete req.body.userId

		await controller.addFavorites(req, res)

		expect(res.status).toHaveBeenCalledWith(400)
		expect(res.json).toHaveBeenCalledWith({ message: 'userId et id sont requis' })
	})

	test('400 si id manquant', async () => {
		delete req.body.id

		await controller.addFavorites(req, res)

		expect(res.status).toHaveBeenCalledWith(400)
	})

	test('400 si body absent', async () => {
		req.body = undefined

		await controller.addFavorites(req, res)

		expect(res.status).toHaveBeenCalledWith(400)
	})

	// ------------------------------------------------------------------
	// Mapping sentinels → réponses HTTP
	// ------------------------------------------------------------------
	test('user introuvable → 404', async () => {
		dbMocks.getUserById.mockResolvedValue(null)

		await controller.addFavorites(req, res)

		expect(res.status).toHaveBeenCalledWith(404)
		expect(res.json).toHaveBeenCalledWith({ message: 'Utilisateur introuvable' })
	})

	test('mauvais rôle → 403 (game/league/team)', async () => {
		dbMocks.getUserById.mockResolvedValue(mockUser('admin'))

		await controller.addFavorites(req, res)

		expect(res.status).toHaveBeenCalledWith(403)
		expect(res.json).toHaveBeenCalledWith({
			message: 'Vous n\'avez pas le bon rôle',
		})
	})

	test('mauvais rôle → 403 (barName : bar non autorisé)', async () => {
		req.body.type = 'barName'
		dbMocks.getUserById.mockResolvedValue(mockUser('bar'))

		await controller.addFavorites(req, res)

		expect(res.status).toHaveBeenCalledWith(403)
	})

	test('exception interne sub-controller → 500', async () => {
		dbMocks.getUserById.mockRejectedValue(new Error('boom'))

		await controller.addFavorites(req, res)

		expect(res.status).toHaveBeenCalledWith(500)
		expect(res.json).toHaveBeenCalledWith({ message: 'Erreur serveur' })
	})
})
