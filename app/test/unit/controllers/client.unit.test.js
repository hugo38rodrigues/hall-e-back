import { describe, it, expect, vi, beforeEach } from 'vitest'

// 👇 Import ENTIER du module pour accéder à databaseFactory comme propriété
import * as dbFactoryModule from '@hugo38rodrigues/bdd-service-hall-e'
import { ClientController } from '../../../controllers/client.controller'

// 👇 Mock de databaseFactory
vi.mock('@hugo38rodrigues/bdd-service-hall-e', () => ({
	databaseFactory: vi.fn(),
}))

describe('ClientController - getAllBarController', () => {
	let clientController
	const res = {
		status: vi.fn(() => res),
		json: vi.fn(),
	}

	const fakeBars = [
		{
			_id: 'bar1',
			name: 'Le Bar',
			description: 'Un bar sympa',
			address: 'Rue du test',
			pictures: ['img.jpg'],
			latitude: 45.0,
			longitude: 5.0,
			role: 'bar',
			programmedMatches: [
				{ date: new Date(Date.now() + 3600000).toISOString() }, // match dans 1h
				{ date: new Date(Date.now() - 3600000).toISOString() }, // match dans le passé
			],
		},
	]

	let connectDbMock, disconnectDbMock, getBarsMock

	beforeEach(() => {
		res.status.mockClear()
		res.json.mockClear()

		connectDbMock = vi.fn()
		disconnectDbMock = vi.fn()
		getBarsMock = vi.fn().mockResolvedValue(fakeBars)

		dbFactoryModule.databaseFactory.mockReturnValue({
			connectDb: connectDbMock,
			disconnectDb: disconnectDbMock,
			clientInstance: vi.fn().mockResolvedValue({
				getBars: getBarsMock,
			}),
		})

		clientController = new ClientController()
	})

	it('retourne les bars correctement filtrés et formatés', async () => {
		await clientController.getAllBarController(res)

		expect(connectDbMock).toHaveBeenCalled()
		expect(disconnectDbMock).toHaveBeenCalled()
		expect(getBarsMock).toHaveBeenCalled()

		expect(res.status).toHaveBeenCalledWith(200)
		expect(res.json).toHaveBeenCalledWith([
			{
				id: 'bar1',
				role: 'bar',
				informations: {
					name: 'Le Bar',
					description: 'Un bar sympa',
					address: 'Rue du test',
					pictures: ['img.jpg'],
					longitude: 5.0,
					latitude: 45.0,
				},
				programmedMatches: [
					{ date: expect.any(String) }, // seul le match futur doit rester
				],
			},
		])
	})

	it('retourne une erreur 500 si un problème survient', async () => {
		dbFactoryModule.databaseFactory.mockImplementation(() => {
			throw new Error('Crash')
		})

		await clientController.getAllBarController(res)

		expect(res.status).toHaveBeenCalledWith(500)
		expect(res.json).toHaveBeenCalledWith({ message: 'Erreur Serveur' })
	})
})
