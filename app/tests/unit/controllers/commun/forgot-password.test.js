/**
 * Tests unitaires - forgotPassword
 * --------------------------------
 * Couvre :
 *  - 401 si email invalide
 *  - 200 + envoi mail si user existe
 *  - 200 silencieux si user n'existe pas (pas de leak d'info)
 *  - exceptions 500
 */

import {
	beforeEach,
	describe,
	expect,
	test,
} from 'vitest'
import {
	buildReqRes,
	dbMocks,
	resetAllMocks,
	utilsMocks,
} from '../../../utils/setup.js'

const { CommunController } = await import('../../../../controllers/commun.controller.js')

describe('CommunController.forgotPassword', () => {
	let controller; let req; let
		res

	beforeEach(() => {
		resetAllMocks()
		controller = new CommunController();
		({ req, res } = buildReqRes({ body: { email: 'john@doe.com' } }))
	})

	test('401 si email mal formé', async () => {
		req.body = { email: 'pasunemail' }

		await controller.forgotPassword(req, res)

		expect(res.status).toHaveBeenCalledWith(401)
		expect(res.json).toHaveBeenCalledWith({
			errorEmailMessage: 'Email pas au bon format',
		})
	})

	test('401 si email vide', async () => {
		req.body = { email: '' }

		await controller.forgotPassword(req, res)

		expect(res.status).toHaveBeenCalledWith(401)
	})

	test('200 + envoi du mail si user existe', async () => {
		dbMocks.getProfileUser.mockResolvedValue({
			id: 5,
			password: 'hashed',
			dataValues: { id: 5 },
		})
		dbMocks.addCodeNumber.mockResolvedValue(123456)

		await controller.forgotPassword(req, res)

		expect(utilsMocks.generetedCode).toHaveBeenCalled()
		expect(dbMocks.addCodeNumber).toHaveBeenCalled()
		expect(utilsMocks.sendEmailResetPassword).toHaveBeenCalledWith(
			'john@doe.com',
			123456,
		)
		expect(res.header).toHaveBeenCalledWith('Authorization', 'fake.jwt.token')
		expect(res.status).toHaveBeenCalledWith(200)
		expect(res.send).toHaveBeenCalledWith({ id: 5 })
	})

	test('200 silencieux si user n\'existe pas', async () => {
		dbMocks.getProfileUser.mockResolvedValue(null)

		await controller.forgotPassword(req, res)

		expect(res.sendStatus).toHaveBeenCalledWith(204)
		expect(utilsMocks.sendEmailResetPassword).not.toHaveBeenCalled()
	})

	test('500 si la DB lève', async () => {
		dbMocks.getProfileUser.mockRejectedValue(new Error('DB down'))

		await controller.forgotPassword(req, res)

		expect(res.status).toHaveBeenCalledWith(500)
	})

	test('500 si l\'envoi de mail lève', async () => {
		dbMocks.getProfileUser.mockResolvedValue({
			id: 5,
			password: 'hashed',
			dataValues: { id: 5 },
		})
		dbMocks.addCodeNumber.mockResolvedValue(123456)
		utilsMocks.sendEmailResetPassword.mockRejectedValue(new Error('SMTP err'))

		await controller.forgotPassword(req, res)

		expect(res.status).toHaveBeenCalledWith(500)
	})
})
