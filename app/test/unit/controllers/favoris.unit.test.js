// test/unit/controllers/favoris.unit.test.js

import { describe, it, expect, vi, beforeEach } from 'vitest'

import { databaseFactory } from '@hugo38rodrigues/bdd-service-hall-e/main.js'
import { FavorisController } from '../../../controllers/favoris.controller'

vi.mock('@hugo38rodrigues/bdd-service-hall-e/main.js', () => ({
	databaseFactory: vi.fn(),
}))

describe('FavorisController - méthodes internes', () => {
	let controller, mockDbInstance, mockUserInstance

	beforeEach(() => {
		controller = new FavorisController()
		controller.newLogger = { error: vi.fn() }

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
		}

		databaseFactory.mockReturnValue(mockDbInstance)
	})

	it('addFavorisGameController retourne un objet gameName', async () => {
		const result = await controller.addFavorisGameController(1, 'FIFA', 'gameName')
		expect(result).toEqual({ gameName: 'FIFA' })
	})

	it('deleteFavorisGameController retourne un objet gameName', async () => {
		const result = await controller.deleteFavorisGameController(1, 'FIFA', 'gameName')
		expect(result).toEqual({ gameName: 'FIFA' })
	})

	it('addFavorisLeagueController retourne un objet leagueName', async () => {
		const result = await controller.addFavorisLeagueController(1, 'Ligue 1', 'leagueName')
		expect(result).toEqual({ leagueName: 'Ligue 1' })
	})

	it('deleteFavorisLeagueController retourne un objet leagueName', async () => {
		const result = await controller.deleteFavorisLeagueController(1, 'Ligue 1', 'leagueName')
		expect(result).toEqual({ leagueName: 'Ligue 1' })
	})

	it('addFavorisTeamController retourne un objet teams', async () => {
		const result = await controller.addFavorisTeamController(1, 10, 'teams')
		expect(result).toEqual({ teams: ['Team A'] })
	})

	it('deleteFavorisTeamController retourne un objet vide teams', async () => {
		const result = await controller.deleteFavorisTeamController(1, 10, 'teams')
		expect(result).toEqual({ teams: [] })
	})

	it('addFavorisBarNameController retourne "Le Bar"', async () => {
		const result = await controller.addFavorisBarNameController(1, 99, 'barName')
		expect(result).toBe('Le Bar')
	})

	it('deleteFavorisBarNameController retourne "Le Bar"', async () => {
		const result = await controller.deleteFavorisBarNameController(1, 99, 'barName')
		expect(result).toBe('Le Bar')
	})

})

