import { databaseFactory } from '@hugo38rodrigues/bdd-service-hall-e'
import {
	beforeEach, describe, expect, it, vi,
} from 'vitest'
import { CommunController } from '../../../../controllers/commun.controller.js'
import { ERROR_SERVER } from '../../../../utils/constants.js'
import { sendEmailResetPassword } from '../../../../utils/email.js'

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
vi.mock('../../../../utils/email.js', () => ({
	sendEmailResetPassword: vi.fn(),
}))

describe('forgotPassword()', () => {
	let controller
	let userInstance
	let databaseInstance

	beforeEach(() => {
		vi.clearAllMocks()
		controller = new CommunController()

		controller.encrypt = {
			generetedCode: vi.fn().mockReturnValue({ codeNumber: '123456', expiresIn: 600 }),
			tokenCreation: vi.fn().mockResolvedValue('mockedToken'),
		}

		userInstance = {
			getProfileUser: vi.fn(),
			addCodeNumber: vi.fn(),
		}

		databaseInstance = { usersInstances: vi.fn().mockResolvedValue(userInstance) }
		databaseFactory.mockReturnValue(databaseInstance)
	})

	it('Si email invalide doit doit retourner une 401 et un message d\'erreur', async () => {
		const req = makeReq({ email: 'bad' })
		const res = makeRes()

		await controller.forgotPassword(req, res)

		expect(res.status).toHaveBeenCalledWith(401)
		expect(res.json).toHaveBeenCalledWith(
			expect.objectContaining({ errorEmailMessage: 'L\'email n\'est pas au bon format' }),
		)
		// aucune interaction DB quand validation échoue
		expect(databaseFactory).not.toHaveBeenCalled()
	})

	it('200 + Authorization header + envoi de code si user existe', async () => {
		const req = makeReq({ email: 'user@mail.com' })
		const res = makeRes()

		userInstance.getProfileUser.mockResolvedValue({ _id: 'u1', password: 'hashed' })
		userInstance.addCodeNumber.mockResolvedValue(undefined)

		await controller.forgotPassword(req, res)

		// DB & code
		expect(databaseFactory).toHaveBeenCalled()
		expect(databaseInstance.usersInstances).toHaveBeenCalled()
		expect(userInstance.getProfileUser).toHaveBeenCalledWith('user@mail.com')
		expect(controller.encrypt.generetedCode).toHaveBeenCalled()
		expect(userInstance.addCodeNumber).toHaveBeenCalledWith('123456', 600, 'u1')

		// mail
		expect(sendEmailResetPassword).toHaveBeenCalledWith('user@mail.com', '123456')

		// token
		expect(controller.encrypt.tokenCreation).toHaveBeenCalledWith('u1', 'hashed')

		// réponse
		expect(res.header).toHaveBeenCalledWith('Authorization', 'mockedToken')
		expect(res.status).toHaveBeenCalledWith(200)
		expect(res.send).toHaveBeenCalledWith({ id: 'u1' })
	})

	it('200 sans body si l\'utilisateur n\'existe pas', async () => {
		const req = makeReq({ email: 'ghost@mail.com' })
		const res = makeRes()

		userInstance.getProfileUser.mockResolvedValue(null)

		await controller.forgotPassword(req, res)

		expect(res.status).toHaveBeenCalledWith(200)
		// le code actuel ne fait pas json()/send() dans cette branche
		expect(res.send).not.toHaveBeenCalled()
		expect(res.json).not.toHaveBeenCalled()
		expect(sendEmailResetPassword).not.toHaveBeenCalled()
		expect(controller.encrypt.tokenCreation).not.toHaveBeenCalled()
	})

	it('500 si une exception est levée', async () => {
		const req = makeReq({ email: 'user@mail.com' })
		const res = makeRes()

		databaseFactory.mockImplementation(() => { throw new Error('boom') })

		await controller.forgotPassword(req, res)
		expect(res.status).toHaveBeenCalledWith(500)
		expect(res.json).toHaveBeenCalledWith({ message: ERROR_SERVER })
	})
})
