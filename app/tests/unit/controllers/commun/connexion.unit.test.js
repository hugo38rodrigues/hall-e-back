import { databaseFactory } from '@hugo38rodrigues/bdd-service-hall-e'
import bcryptjs from 'bcryptjs'
import {
	beforeEach,
	describe,
	expect,
	it,
	vi,
} from 'vitest'
import { CommunController } from '../../../../controllers/commun.controller.js'

const makeReq = (body = {}) => ({ body })

const makeRes = () => {
	const res = {
		header: vi.fn(),
		status: vi.fn(),
		json: vi.fn(),
		send: vi.fn(),
	}
	// chainage Express
	res.header.mockReturnValue(res)
	res.status.mockReturnValue(res)
	return res
}
// Mocks de modules
vi.mock('@hugo38rodrigues/bdd-service-hall-e', () => ({
	databaseFactory: vi.fn(),
}))

vi.mock('bcryptjs', () => ({
	default: {
		compare: vi.fn(),
	},
}))

describe('connexion()', () => {
	let controller
	let userInstance
	let databaseInstance

	beforeEach(() => {
		vi.clearAllMocks()

		// instancie le contrôleur
		controller = new CommunController()

		// mock encrypt
		controller.encrypt = {
			tokenCreation: vi.fn().mockReturnValue('mockedToken'),
		}

		// mock DB chain
		userInstance = { getProfileUser: vi.fn() }
		databaseInstance = { usersInstances: vi.fn().mockResolvedValue(userInstance) }
		databaseFactory.mockReturnValue(databaseInstance)
	})

	it('renvoie 200 + Authorization header + profil (cas OK - client)', async () => {
		const req = makeReq({ email: 'user@mail.com', password: 'plain' })
		const res = makeRes()

		userInstance.getProfileUser.mockResolvedValue({
			_id: 1,
			id: 1,
			password: 'hashed',
			email: 'user@mail.com',
			role: 'client',
			favorites: {
				gameName: [],
				leagueName: [],
				teams: [],
				barName: ['Mon Bar'],
			},
			firstName: 'Jean',
			lastName: 'Dupont',
			likeBar: false,
		})

		bcryptjs.compare.mockResolvedValue(true)
		controller.encrypt.tokenCreation.mockReturnValue('mockedToken')

		await controller.connexion(req, res)

		// appels critiques
		expect(databaseFactory).toHaveBeenCalled()
		expect(databaseInstance.usersInstances).toHaveBeenCalled()
		expect(userInstance.getProfileUser).toHaveBeenCalledWith('user@mail.com')
		expect(bcryptjs.compare).toHaveBeenCalledWith('plain', 'hashed')
		expect(controller.encrypt.tokenCreation).toHaveBeenCalledWith(1, 'hashed')

		// réponse
		expect(res.header).toHaveBeenCalledWith('Authorization', 'mockedToken')
		expect(res.status).toHaveBeenCalledWith(200)

		const payload = res.send.mock.calls[0][0]

		expect(payload).toEqual(
			expect.objectContaining({
				id: 1,
				email: 'user@mail.com',
				role: 'client',
				favorites: {
					gameName: [],
					leagueName: [],
					teams: [],
					barName: ['Mon Bar'],
				},
				informations: {
					firstName: 'Jean',
					lastName: 'Dupont',
					likeBar: false,
				},
				userLocation: null,
			}),
		)
		// pas de fuite d'infos sensibles
		expect(payload).not.toHaveProperty('password')
	})

	it('renvoie 200 + profil (cas OK - bar)', async () => {
		const req = makeReq({ email: 'bar@mail.com', password: 'plain' })
		const res = makeRes()

		userInstance.getProfileUser.mockResolvedValue({
			_id: 2,
			id: 2,
			password: 'hashed2',
			email: 'bar@mail.com',
			role: 'bar',
			favorites: {
				gameName: ['LoL'],
				leagueName: [],
				teams: [],
			},
			name: 'Le Bar du Coin',
			address: '1 rue de la Paix',
			price: '$$',
			description: 'Happy hour',
			pictures: ['p1.jpg'],
			longitude: 2.35,
			latitude: 48.86,
		})

		bcryptjs.compare.mockResolvedValue(true)
		controller.encrypt.tokenCreation.mockReturnValue('mockedToken2')

		await controller.connexion(req, res)
		expect(databaseFactory).toHaveBeenCalled()
		expect(databaseInstance.usersInstances).toHaveBeenCalled()
		expect(userInstance.getProfileUser).toHaveBeenCalledWith('bar@mail.com')
		expect(bcryptjs.compare).toHaveBeenCalledWith('plain', 'hashed2')
		expect(controller.encrypt.tokenCreation).toHaveBeenCalledWith(2, 'hashed2')
		expect(res.header).toHaveBeenCalledWith('Authorization', 'mockedToken2')
		expect(res.status).toHaveBeenCalledWith(200)
		const payload = res.send.mock.calls[0][0]

		expect(payload).toEqual(
			expect.objectContaining({
				id: 2,
				email: 'bar@mail.com',
				role: 'bar',
				favorites: {
					gameName: ['LoL'],
					leagueName: [],
					teams: [],
					barName: [], // forcé à [] car role === 'bar'
				},
				informations: {
					name: 'Le Bar du Coin',
					address: '1 rue de la Paix',
					price: '$$',
					description: 'Happy hour',
					pictures: ['p1.jpg'],
				},
				userLocation: { longitude: 2.35, latitude: 48.86 }, // bar => coordonnées
			}),
		)
	})

	it('renvoie 401 si email inconnu', async () => {
		const req = makeReq({ email: 'wrong@mail.com', password: 'x' })
		const res = makeRes()

		userInstance.getProfileUser.mockResolvedValue(null)

		await controller.connexion(req, res)

		expect(res.status).toHaveBeenCalledWith(401)
		expect(res.json).toHaveBeenCalledWith({
			message: "L'email ou le mot de passe sont invalide",
		})
		expect(res.send).not.toHaveBeenCalled()
	})

	it('renvoie 401 si mot de passe incorrect', async () => {
		const req = makeReq({ email: 'user@mail.com', password: 'bad' })
		const res = makeRes()

		userInstance.getProfileUser.mockResolvedValue({ id: 1, password: 'hashed' })
		bcryptjs.compare.mockResolvedValue(false)

		await controller.connexion(req, res)

		expect(res.status).toHaveBeenCalledWith(401)
		expect(res.json).toHaveBeenCalledWith({
			message: "L'email ou le mot de passe sont invalide",
		})
		expect(res.send).not.toHaveBeenCalled()
	})
})
