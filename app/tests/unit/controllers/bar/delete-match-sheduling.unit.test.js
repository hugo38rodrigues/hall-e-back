import { databaseFactory } from '@hugo38rodrigues/bdd-service-hall-e'
import {
	beforeEach,
	describe,
	expect,
	it,
	vi,
} from 'vitest'
import { BarController } from '../../../../controllers/bar.controller.js'
import { ERROR_SERVER } from '../../../../utils/constants.js'

vi.mock('@hugo38rodrigues/bdd-service-hall-e')
describe('deletedSchedulingMatchesController', () => {
	let barController

	const req = {
		body: {
			matchId: 'match123',
			barId: 'bar456',
		},
	}

	const res = {
		status: vi.fn(() => res),
		json: vi.fn(),
	}

	let userInstanceMock
	let barInstanceMock

	beforeEach(() => {
		barController = new BarController()
		userInstanceMock = {
			getUserById: vi.fn().mockResolvedValue({ id: 'bar456' }),
			getMatchById: vi.fn().mockResolvedValue({ id: 'match123' }),
		}

		barInstanceMock = {
			deletedProgMatch: vi.fn().mockResolvedValue(true),
		}

		// 👇 Configure le mock de databaseFactory
		databaseFactory.mockReturnValue({
			usersInstances: vi.fn().mockResolvedValue(userInstanceMock),
			barInstance: vi.fn().mockResolvedValue(barInstanceMock),
		})

		// reset res mocks
		res.status.mockClear()
		res.json.mockClear()
	})

	it('Doit retourner 200 si le match est programmé', async () => {
		await barController.deletedSchedulingMatchesController(req, res)
		expect(res.status).toHaveBeenCalledWith(200)
		expect(res.json).toHaveBeenCalledWith(req.body.matchId)
	})

	it('Doit retourner 401 si le match n\'existe pas', async () => {
		userInstanceMock.getMatchById.mockResolvedValue(null)
		await barController.deletedSchedulingMatchesController(req, res)
		expect(res.status).toHaveBeenCalledWith(401)
		expect(res.json).toHaveBeenCalledWith({ message: 'Utilisateur inconnu ou match inconnu' })
	})

	it('Doit retourner 401 si le bar n\'existe pas', async () => {
		userInstanceMock.getUserById.mockResolvedValue(null)
		await barController.deletedSchedulingMatchesController(req, res)
		expect(res.status).toHaveBeenCalledWith(401)
		expect(res.json).toHaveBeenCalledWith({ message: 'Utilisateur inconnu ou match inconnu' })
	})

	it('Doit retourner 401 si c\'est impossible de supprimer le match', async () => {
		barInstanceMock.deletedProgMatch.mockResolvedValue(false)
		await barController.deletedSchedulingMatchesController(req, res)
		expect(res.status).toHaveBeenCalledWith(401)
		expect(res.json).toHaveBeenCalledWith({ message: 'Impossible de supprimé le match' })
	})

	it('Doit retourner 500 en cas d\'erreur inconnue', async () => {
		databaseFactory.mockImplementation(() => {
			throw new Error('Boom')
		})

		await barController.deletedSchedulingMatchesController(req, res)

		expect(res.status).toHaveBeenCalledWith(500)
		expect(res.json).toHaveBeenCalledWith({ message: ERROR_SERVER })
	})
})
