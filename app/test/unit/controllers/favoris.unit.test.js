// test/unit/controllers/favoris.unit.test.js

import { describe, it, expect, vi, beforeEach } from 'vitest'

import { databaseFactory } from '@hugo38rodrigues/bdd-service-hall-e/main.js'
import { FavorisController } from '../../../controllers/favoris.controller'

vi.mock('@hugo38rodrigues/bdd-service-hall-e/main.js', () => ({
	databaseFactory: vi.fn(),
}))

describe('FavorisController (200 OK tests)', () => {
	let controller, req, res, mockDbInstance, mockUserInstance

	beforeEach(() => {
		controller = new FavorisController()
		controller.newLogger = { error: vi.fn() }

		req = { body: {} }
		res = { status: vi.fn().mockReturnThis(), json: vi.fn() }

		mockUserInstance = {
			addFavoriteGame: vi.fn().mockResolvedValue({ gameName: 'FIFA' }),
			removeFavoriteGame: vi.fn().mockResolvedValue({ gameName: 'FIFA' }),
			addFavoriteLeague: vi.fn().mockResolvedValue({ leagueName: 'Ligue 1' }),
			removeFavoriteLeague: vi.fn().mockResolvedValue({ leagueName: 'Ligue 1' }),
			addFavoriteTeam: vi.fn().mockResolvedValue({ teams: ['Team A'] }),
			removeFavoriteTeam: vi.fn().mockResolvedValue({ teams: [] }),
			getUserById: vi.fn().mockResolvedValue({ role: 'client' }),
			addFavoriteBar: vi.fn().mockResolvedValue('Le Bar'),
			removeFavoriteBar: vi.fn().mockResolvedValue('Le Bar'),
		}

		mockDbInstance = {
			usersInstances: vi.fn().mockResolvedValue(mockUserInstance),
			connectDb: vi.fn(),
			disconnectDb: vi.fn(),
		}

		databaseFactory.mockReturnValue(mockDbInstance)
	})

	it('addFavorisGameController returns 200 with gameName', async () => {
		req.body = { idUser: 1, gameName: 'FIFA' }
		await controller.addFavorisGameController(req, res)
		expect(res.status).toHaveBeenCalledWith(200)
		expect(res.json).toHaveBeenCalledWith({ gameName: 'FIFA' })
	})

	it('deleteFavorisGameController returns 200 with gameName', async () => {
		req.body = { idUser: 1, gameName: 'FIFA' }
		await controller.deleteFavorisGameController(req, res)
		expect(res.status).toHaveBeenCalledWith(200)
		expect(res.json).toHaveBeenCalledWith({ gameName: 'FIFA' })
	})

	it('addFavorisLeagueController returns 200 with leagueName', async () => {
		req.body = { idUser: 1, leagueName: 'Ligue 1' }
		await controller.addFavorisLeagueController(req, res)
		expect(res.status).toHaveBeenCalledWith(200)
		expect(res.json).toHaveBeenCalledWith({ leagueName: 'Ligue 1' })
	})

	it('deleteFavorisLeagueController returns 200 with leagueName', async () => {
		req.body = { idUser: 1, leagueName: 'Ligue 1' }
		await controller.deleteFavorisLeagueController(req, res)
		expect(res.status).toHaveBeenCalledWith(200)
		expect(res.json).toHaveBeenCalledWith({ leagueName: 'Ligue 1' })
	})

	it('addFavorisTeamController returns 200 with teams', async () => {
		req.body = { idUser: 1, idTeam: 10 }
		await controller.addFavorisTeamController(req, res)
		expect(res.status).toHaveBeenCalledWith(200)
		expect(res.json).toHaveBeenCalledWith({ teams: ['Team A'] })
	})

	it('deleteFavorisTeamController returns 200 with teams', async () => {
		req.body = { idUser: 1, idTeam: 10 }
		await controller.deleteFavorisTeamController(req, res)
		expect(res.status).toHaveBeenCalledWith(200)
		expect(res.json).toHaveBeenCalledWith({ teams: [] })
	})

	it('addFavorisBarNameController returns 200 if user is client', async () => {
		req.body = { idUser: 1, idBar: 99 }
		await controller.addFavorisBarNameController(req, res)
		expect(res.status).toHaveBeenCalledWith(200)
		expect(res.json).toHaveBeenCalledWith({ barName: 'Le Bar' })
	})

	it('deleteFavorisBarNameController returns 200 with barName', async () => {
		req.body = { idUser: 1, idBar: 99 }
		await controller.deleteFavorisBarNameController(req, res)
		expect(res.status).toHaveBeenCalledWith(200)
		expect(res.json).toHaveBeenCalledWith({ barName: 'Le Bar' })
	})
})
