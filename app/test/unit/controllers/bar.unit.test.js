import { describe, it, expect, vi, beforeEach } from 'vitest'
import { databaseFactory } from '@hugo38rodrigues/bdd-service-hall-e'
import { BarController } from '../../../controllers/bar.controller'
import { errorServer } from '../../../utils/messages'


vi.mock('@hugo38rodrigues/bdd-service-hall-e')

describe('matchesPlanningsController', () => {
  let barController
	let userInstanceMock
	let barInstanceMock

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

	

	beforeEach(() => {
    barController = new BarController()
		userInstanceMock = {
			getUserById: vi.fn().mockResolvedValue({ id: 'bar456' }),
			getMatchById: vi.fn().mockResolvedValue({ id: 'match123' }),
		}

		barInstanceMock = {
			addProgrammedMatch: vi.fn().mockResolvedValue(true),
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

	it('Doit retourner 200 si tout se passe bien', async () => {
		await barController.matchesPlanningsController(req, res)

		expect(res.status).toHaveBeenCalledWith(200)
		expect(res.json).toHaveBeenCalledWith({ message: 'Match planifié' })
	})

	it('Doit retourner 401 si bar est introuvable', async () => {
		userInstanceMock.getUserById.mockResolvedValue(null)

		await barController.matchesPlanningsController(req, res)

		expect(res.status).toHaveBeenCalledWith(401)
		expect(res.json).toHaveBeenCalledWith({ message: 'Utilisateur inconnu ou match inconnu' })
	})

	it('Doit retourner 401 si match est introuvable', async () => {
		userInstanceMock.getMatchById.mockResolvedValue(null)

		await barController.matchesPlanningsController(req, res)

		expect(res.status).toHaveBeenCalledWith(401)
		expect(res.json).toHaveBeenCalledWith({ message: 'Utilisateur inconnu ou match inconnu' })
	})

	it('Doit retourner 401 si addProgrammedMatch échoue', async () => {
		barInstanceMock.addProgrammedMatch.mockResolvedValue(false)

		await barController.matchesPlanningsController(req, res)

		expect(res.status).toHaveBeenCalledWith(401)
		expect(res.json).toHaveBeenCalledWith({ message: 'Impossible de plannifié le match' })
	})

	it("Doit retourner 500 en cas d'erreur inconnue", async () => {
		databaseFactory.mockImplementation(() => {
			throw new Error('Boom')
		})

		await barController.matchesPlanningsController(req, res)

		expect(res.status).toHaveBeenCalledWith(500)
		expect(res.json).toHaveBeenCalledWith({ message: errorServer }) 
	})
})

vi.mock('@hugo38rodrigues/bdd-service-hall-e')
describe('deletedMatchProgramming', () => {

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

	it("Doit retourner 200 si le match est programmé", async () => {
		await barController.deletedMatchProgramming(req, res)
		expect(res.status).toHaveBeenCalledWith(200)
		expect(res.json).toHaveBeenCalledWith(req.body.matchId)
	})

	it("Doit retourner 401 si le match n'existe pas", async () => {
		userInstanceMock.getMatchById.mockResolvedValue(null)
		await barController.deletedMatchProgramming(req,res)
		expect(res.status).toHaveBeenCalledWith(401)
		expect(res.json).toHaveBeenCalledWith({ message: 'Utilisateur inconnu ou match inconnu' })
	})

	it("Doit retourner 401 si le bar n'existe pas", async () => {
		userInstanceMock.getUserById.mockResolvedValue(null)
		await barController.deletedMatchProgramming(req,res)
		expect(res.status).toHaveBeenCalledWith(401)
		expect(res.json).toHaveBeenCalledWith({ message: 'Utilisateur inconnu ou match inconnu' })
	})
	
	it("Doit retourner 401 si c'est impossible de supprimer le match", async () => {
		barInstanceMock.deletedProgMatch.mockResolvedValue(false)
		await barController.deletedMatchProgramming(req,res)
		expect(res.status).toHaveBeenCalledWith(401)
		expect(res.json).toHaveBeenCalledWith({ message: 'Impossible de supprimé le match' })
	})

	it("Doit retourner 500 en cas d'erreur inconnue", async () => {
		databaseFactory.mockImplementation(() => {
			throw new Error('Boom')
		})

		await barController.matchesPlanningsController(req, res)

		expect(res.status).toHaveBeenCalledWith(500)
		expect(res.json).toHaveBeenCalledWith({ message: errorServer }) 
	})

})
