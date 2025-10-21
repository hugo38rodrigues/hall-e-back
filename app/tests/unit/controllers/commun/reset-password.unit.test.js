import { databaseFactory } from '@hugo38rodrigues/bdd-service-hall-e'
import {
	beforeEach,
	describe,
	expect,
	it,
	vi,
} from 'vitest'
import { CommunController } from '../../../../controllers/commun.controller.js'

// helpers communs
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

// Mocks de modules
vi.mock('@hugo38rodrigues/bdd-service-hall-e', () => ({
	databaseFactory: vi.fn(),
}))
describe('resetPassword()', () => {
	let controller
	let userInstance
	let databaseInstance

	beforeEach(() => {
		vi.clearAllMocks()
		controller = new CommunController()
		userInstance = {
			getUserById: vi.fn(),
			updateUser: vi.fn(),
		}

		controller.encrypt = {
			passwordEncrypt: vi.fn().mockReturnValue('hashed-new-pass'),
		}

		databaseInstance = { usersInstances: vi.fn().mockResolvedValue(userInstance) }
		databaseFactory.mockReturnValue(databaseInstance)
	})

	it('Si le nouveau mot de passe n\'est pas valide doit retourner une 401 et un message d\'erreur', async () => {
		const req = makeReq({ newPassword: 'bad', id: '1' })
		const res = makeRes()
		await controller.resetPassword(req, res)
		expect(res.status).toHaveBeenCalledWith(401)
		expect(res.json).toHaveBeenCalledWith(
			expect.objectContaining({ message: 'Mot de passe invalide' }),
		)
	})

	it('Si l\'utilisateur n\'existe pas doit retourner une 401 et un message d\'erreur', async () => {
		const req = makeReq({ newPassword: 'd/D55555sx', id: 'undefinedId' })
		const res = makeRes()
		await controller.resetPassword(req, res)
		expect(res.status).toHaveBeenCalledWith(401)
		expect(res.json).toHaveBeenCalledWith(
			expect.objectContaining({ message: 'Utilisateur introuvable' }),
		)
	})

	it("401 si l'update renvoie une erreur", async () => {
		const req = makeReq({ id: 'u1', newPassword: 'Ok12345!' })
		const res = makeRes()

		userInstance.getUserById.mockResolvedValue({ id: 'u1', role: 'client' })
		userInstance.updateUser.mockReturnValue({ isError: true, errorMessage: 'DB error' })

		await controller.resetPassword(req, res)

		expect(controller.encrypt.passwordEncrypt).toHaveBeenCalledWith('Ok12345!')
		expect(userInstance.updateUser).toHaveBeenCalledWith('u1', {
			role: 'client',
			password: 'hashed-new-pass',
		})
		expect(res.status).toHaveBeenCalledWith(401)
		expect(res.json).toHaveBeenCalledWith({ message: 'DB error' })
	})

	it('200 si tout est OK', async () => {
		const req = makeReq({ id: 'u1', newPassword: 'Ok12345!' })
		const res = makeRes()
		const ressource = {
			role: 'bar',
			password: 'hashed-new-pass',
		}
		userInstance.getUserById.mockResolvedValue({ id: 'u1', role: 'bar' })
		userInstance.updateUser.mockReturnValue({ isError: false, errorMessage: undefined })

		await controller.resetPassword(req, res)

		expect(controller.encrypt.passwordEncrypt).toHaveBeenCalledWith('Ok12345!')
		expect(userInstance.updateUser).toHaveBeenCalledWith('u1', ressource)
		expect(res.status).toHaveBeenCalledWith(200)
		expect(res.json).toHaveBeenCalledWith({ message: 'Mot de passe changé avec succès' })
	})
})
