import { databaseFactory } from '@hugo38rodrigues/bdd-service-hall-e'
import {
	beforeEach,
	describe,
	expect,
	it,
	vi,
} from 'vitest'
import { CommunController } from '../../../../controllers/commun.controller.js'

const makeReq = (body = {}) => ({
	body, params: {}, query: {}, headers: {},
})

const makeRes = () => {
	const res = {
		header: vi.fn(), status: vi.fn(), json: vi.fn(), send: vi.fn(),
	}
	res.header.mockReturnValue(res)
	res.status.mockReturnValue(res)
	res.json.mockReturnValue(res)
	return res
}

vi.mock('@hugo38rodrigues/bdd-service-hall-e', () => ({
	databaseFactory: vi.fn(),
}))

describe('createAccount()', () => {
	let controller; let userInstance; let
		databaseInstance

	beforeEach(() => {
		vi.clearAllMocks()

		// stubs des vérifs injectées
		const clientVerifier = vi.fn().mockResolvedValue({
			isValid: true,
			profile: { email: 'new@user.com', password: 'hashed', role: 'client' },
			message: null,
		})

		controller = new CommunController({ clientVerifier })

		userInstance = {
			getUser: vi.fn(),
			addUser: vi.fn(),
		}
		databaseInstance = { usersInstances: vi.fn().mockResolvedValue(userInstance) }
		databaseFactory.mockReturnValue(databaseInstance)
	})

	it('client: 401 si email ou password manquant', async () => {
		const req = makeReq({
			role: 'client',
			email: '',
			password: '',
			informations: { firstName: 'A', lastName: 'B' },
		})
		const res = makeRes()

		await controller.createAccount(req, res)

		expect(res.status).toHaveBeenCalledWith(401)
		expect(res.json).toHaveBeenCalledWith({ message: 'Missing email or password' })
	})
	it('client: 401 si first/last name manquant', async () => {
		const req = makeReq({
			role: 'client',
			email: 'ok@mail.com',
			password: 'Ok12345!',
			informations: { firstName: '', lastName: '' },
		})
		const res = makeRes()

		await controller.createAccount(req, res)

		expect(res.status).toHaveBeenCalledWith(401)
		expect(res.json).toHaveBeenCalledWith({ message: 'Missing first name or last name' })
	})

	it('bar: 401 si email/password invalid', async () => {
		const req = makeReq({
			role: 'bar',
			email: 'nope',
			password: 'x',
			informations: { address: '1 rue', name: 'BarX', description: 'cool' },
		})
		const res = makeRes()

		await controller.createAccount(req, res)

		expect(res.status).toHaveBeenCalledWith(401)
		expect(res.json).toHaveBeenCalledWith({ message: 'password or email invalid' })
	})
	it('bar: 401 si address invalide', async () => {
		const req = makeReq({
			role: 'bar',
			email: 'bar@mail.com',
			password: 'Ok12345!',
			informations: { address: '', name: 'BarX', description: 'cool' },
		})
		const res = makeRes()

		await controller.createAccount(req, res)

		expect(res.status).toHaveBeenCalledWith(401)
		expect(res.json).toHaveBeenCalledWith({ message: 'Address is invalid' })
	})

	it('client: 201 quand profil valide et utilisateur inexistant', async () => {
		const req = makeReq({
			role: 'client',
			email: 'new@user.com',
			password: 'Ok12345!',
			informations: { firstName: 'Alice', lastName: 'Doe' },
		})
		const res = makeRes()

		databaseFactory.mockReturnValue(databaseInstance)

		userInstance.getUser.mockResolvedValue(null)
		userInstance.addUser.mockResolvedValue(undefined)

		await controller.createAccount(req, res)

		expect(userInstance.getUser).toHaveBeenCalledWith('new@user.com')
		expect(userInstance.addUser).toHaveBeenCalledWith(expect.objectContaining({ email: 'new@user.com' }))
		expect(res.status).toHaveBeenCalledWith(201)
		expect(res.json).toHaveBeenCalledWith({ message: 'Inscription réussis' })
	})
})
