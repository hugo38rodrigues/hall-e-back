import { databaseFactory } from '@hugo38rodrigues/bdd-service-hall-e'
import {
	beforeEach, describe, expect, it, vi,
} from 'vitest'
import { CommunController } from '../../../../controllers/commun.controller.js'

// Helpers
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

// Mocks modules
vi.mock('@hugo38rodrigues/bdd-service-hall-e', () => ({
	databaseFactory: vi.fn(),
}))

describe('verifyCode()', () => {
	let controller
	let userInstance
	let databaseInstance

	beforeEach(() => {
		vi.clearAllMocks()
		controller = new CommunController()
		controller.newLogger = { error: vi.fn(), info: vi.fn(), warn: vi.fn() }

		userInstance = {
			getUserById: vi.fn(),
			getCodeByNumber: vi.fn(),
		}
		databaseInstance = { usersInstances: vi.fn().mockResolvedValue(userInstance) }
		databaseFactory.mockReturnValue(databaseInstance)
	})

	it("401 si le code n'a pas le bon format", async () => {
		const req = makeReq({ idUser: 'u1', code: 'abc' })
		const res = makeRes()

		await controller.verifyCode(req, res)

		expect(res.status).toHaveBeenCalledWith(401)
		expect(res.json).toHaveBeenCalledWith({ message: "Ce n'est pas le bon code" })
		expect(databaseFactory).not.toHaveBeenCalled() // on ne touche pas la DB
	})

	it("return null si l'utilisateur est introuvable", async () => {
		const req = makeReq({ idUser: 'u-missing', code: '123456' })
		const res = makeRes()

		userInstance.getUserById.mockResolvedValue(null)

		const ret = await controller.verifyCode(req, res)

		expect(ret).toBeNull()
		expect(res.status).not.toHaveBeenCalled()
		expect(userInstance.getCodeByNumber).not.toHaveBeenCalled()
	})

	it('400 si le code est introuvable en base', async () => {
		const req = makeReq({ idUser: 'u1', code: '123456' })
		const res = makeRes()

		userInstance.getUserById.mockResolvedValue({ id: 'u1' })
		userInstance.getCodeByNumber.mockResolvedValue(null)

		await controller.verifyCode(req, res)

		expect(databaseFactory).toHaveBeenCalled()
		expect(databaseInstance.usersInstances).toHaveBeenCalled()
		expect(userInstance.getUserById).toHaveBeenCalledWith('u1')
		expect(userInstance.getCodeByNumber).toHaveBeenCalledWith('123456')
		expect(res.status).toHaveBeenCalledWith(400)
		expect(res.json).toHaveBeenCalledWith({ message: 'Code invalide' })
	})

	it('400 si le code est expiré', async () => {
		const req = makeReq({ idUser: 'u1', code: '123456' })
		const res = makeRes()

		userInstance.getUserById.mockResolvedValue({ id: 'u1' })
		userInstance.getCodeByNumber.mockResolvedValue({
			expiresIn: Date.now() - 1, // déjà expiré
		})

		await controller.verifyCode(req, res)

		expect(res.status).toHaveBeenCalledWith(400)
		expect(res.json).toHaveBeenCalledWith({ message: 'Demande expiré' })
	})

	it('200 avec id si code valide et non expiré', async () => {
		const req = makeReq({ idUser: 'u1', code: '123456' })
		const res = makeRes()

		userInstance.getUserById.mockResolvedValue({ id: 'u1' })
		userInstance.getCodeByNumber.mockResolvedValue({
			expiresIn: Date.now() + 60_000, // encore valide
		})

		await controller.verifyCode(req, res)

		expect(res.status).toHaveBeenCalledWith(200)
		expect(res.json).toHaveBeenCalledWith({ id: 'u1' })
	})
})
