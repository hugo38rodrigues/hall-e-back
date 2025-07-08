import { databaseFactory } from '@hugo38rodrigues/bdd-service-hall-e/main.js'
import bcryptjs from 'bcryptjs'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CommunController } from '../../../controllers/commun.controller.js'
import { sendEmailResetPassword } from '../../../utils/email.js'
import { errorServer } from '../../../utils/messages.js'

vi.mock('bcryptjs')
vi.mock('@hugo38rodrigues/bdd-service-hall-e/main.js', () => ({
	databaseFactory: vi.fn(),
}))
vi.mock('../../../utils/email.js', () => ({
	sendEmailResetPassword: vi.fn(),
}))

describe('connexion', () => {
	let controller
	let req, res
	let mockDbInstance, mockUserInstance

	beforeEach(() => {
		req = {
			body: {
				email: 'test@example.com',
				password: 'password123',
			},
		}

		res = {
			status: vi.fn().mockReturnThis(),
			json: vi.fn(),
			header: vi.fn().mockReturnThis(),
			send: vi.fn(),
		}

		controller = new CommunController()
		controller.encrypt = {
			tokenCreation: vi.fn().mockResolvedValue('mockedToken'),
		}
		controller._getConnexionProfile = vi.fn().mockReturnValue({ id: 1, token: 'mockedToken' })

		mockUserInstance = {
			getProfileUser: vi.fn(),
		}

		mockDbInstance = {
			usersInstances: vi.fn().mockResolvedValue(mockUserInstance),
			connectDb: vi.fn(),
			disconnectDb: vi.fn(),
		}

		databaseFactory.mockReturnValue(mockDbInstance)
	})

	it('renvoie 401 si utilisateur non trouvé', async () => {
		mockUserInstance.getProfileUser.mockResolvedValue(null)

		await controller.connexion(req, res)

		expect(mockDbInstance.connectDb).toHaveBeenCalled()
		expect(mockDbInstance.disconnectDb).toHaveBeenCalled()
		expect(res.status).toHaveBeenCalledWith(401)
		expect(res.json).toHaveBeenCalledWith({ message: "L'email ou le mot de passe sont invalide" })
	})

	it('renvoie 401 si mot de passe incorrect', async () => {
		mockUserInstance.getProfileUser.mockResolvedValue({ password: 'hashedPassword' })
		bcryptjs.compare.mockResolvedValue(false)

		await controller.connexion(req, res)

		expect(bcryptjs.compare).toHaveBeenCalledWith('password123', 'hashedPassword')
		expect(res.status).toHaveBeenCalledWith(401)
		expect(res.json).toHaveBeenCalledWith({ message: "L'email ou le mot de passe sont invalide" })
	})

	it('renvoie 200 avec le profil si tout est valide', async () => {
		const user = { id: 1, password: 'hashedPassword' }
		mockUserInstance.getProfileUser.mockResolvedValue(user)
		bcryptjs.compare.mockResolvedValue(true)

		await controller.connexion(req, res)

		expect(controller.encrypt.tokenCreation).toHaveBeenCalledWith(1, 'hashedPassword')
		expect(controller._getConnexionProfile).toHaveBeenCalledWith(user)
		expect(res.header).toHaveBeenCalledWith('Authorization', 'mockedToken')
		expect(res.status).toHaveBeenCalledWith(200)
		expect(res.send).toHaveBeenCalledWith({ id: 1, token: 'mockedToken' })
	})

	it("renvoie 500 en cas d'erreur inattendue", async () => {
		mockUserInstance.getProfileUser.mockRejectedValue(new Error('Unexpected error'))

		await controller.connexion(req, res)

		expect(res.status).toHaveBeenCalledWith(500)
		expect(res.json).toHaveBeenCalledWith({ message: errorServer })
	})
})

describe('createAccount', () => {
	let controller
	let req, res
	let mockDbInstance, mockUserInstance

	beforeEach(() => {
		req = {
			body: {
				role: 'client',
				email: 'user@example.com',
				password: 'securepass',
			},
		}

		res = {
			status: vi.fn().mockReturnThis(),
			json: vi.fn(),
		}

		controller = new CommunController()

		// Mocks des méthodes privées (à adapter selon l'accessibilité réelle)
		controller._clientAccountVerify = vi.fn()
		controller._barAccountVerify = vi.fn()

		mockUserInstance = {
			getUser: vi.fn(),
			addUser: vi.fn(),
		}

		mockDbInstance = {
			usersInstances: vi.fn().mockResolvedValue(mockUserInstance),
			connectDb: vi.fn(),
			disconnectDb: vi.fn(),
		}

		databaseFactory.mockReturnValue(mockDbInstance)
	})

	it('returns 401 if validation fails', async () => {
		controller._clientAccountVerify.mockResolvedValue({
			isValid: false,
			message: 'Invalid data',
		})

		await controller.createAccount(req, res)

		expect(res.status).toHaveBeenCalledWith(401)
		expect(res.json).toHaveBeenCalledWith({ message: 'Invalid data' })
	})

	it('returns 401 if user already exists', async () => {
		controller._clientAccountVerify.mockResolvedValue({
			isValid: true,
			profil: { email: 'user@example.com' },
		})

		mockUserInstance.getUser.mockResolvedValue({ email: 'user@example.com' })

		await controller.createAccount(req, res)

		expect(res.status).toHaveBeenCalledWith(401)
		expect(res.json).toHaveBeenCalledWith({ message: "L'utilisateur existe déjà" })
	})

	it('creates user and returns 201 on success', async () => {
		controller._clientAccountVerify.mockResolvedValue({
			isValid: true,
			profil: { email: 'user@example.com' },
		})

		mockUserInstance.getUser.mockResolvedValue(null)

		await controller.createAccount(req, res)

		expect(mockUserInstance.addUser).toHaveBeenCalledWith({ email: 'user@example.com' })
		expect(res.status).toHaveBeenCalledWith(201)
		expect(res.json).toHaveBeenCalledWith({ message: 'Inscription réussis' })
	})

	it('returns 500 on unexpected error', async () => {
		controller._clientAccountVerify.mockRejectedValue(new Error('Unexpected'))

		await controller.createAccount(req, res)

		expect(res.status).toHaveBeenCalledWith(500)
		expect(res.json).toHaveBeenCalledWith({ message: errorServer })
	})
})

describe('forgotPassword', () => {
	let controller, req, res
	let mockDbInstance, mockUserInstance

	beforeEach(() => {
		req = { body: { email: 'user@example.com' } }

		res = {
			status: vi.fn().mockReturnThis(),
			json: vi.fn(),
			header: vi.fn().mockReturnThis(),
			send: vi.fn(),
		}

		controller = new CommunController()

		controller._validationEmail = vi.fn().mockReturnValue({
			isValidCredentiel: false,
			message: '',
		})

		controller.encrypt = {
			tokenCreation: vi.fn().mockResolvedValue('mockedToken'),
			generetedCode: vi.fn().mockReturnValue({
				codeNumber: '123456',
				expiresIn: Date.now() + 60000,
			}),
		}

		mockUserInstance = {
			getProfileUser: vi.fn(),
			addCodeNumber: vi.fn(),
		}

		mockDbInstance = {
			usersInstances: vi.fn().mockResolvedValue(mockUserInstance),
			connectDb: vi.fn(),
			disconnectDb: vi.fn(),
		}

		databaseFactory.mockReturnValue(mockDbInstance)
		sendEmailResetPassword.mockReset()
	})

	it('renvoie 401 si la validation de l’email échoue', async () => {
		controller._validationEmail.mockReturnValue({
			isValidCredentiel: true,
			message: 'Email invalide',
		})

		await controller.forgotPassword(req, res)

		expect(res.status).toHaveBeenCalledWith(401)
		expect(res.json).toHaveBeenCalledWith({ message: 'Email invalide' })
	})

	it('renvoie 200 avec header et id si utilisateur existe', async () => {
		mockUserInstance.getProfileUser.mockResolvedValue({
			_id: 'uid123',
			password: 'hashed',
		})

		await controller.forgotPassword(req, res)

		expect(mockUserInstance.addCodeNumber).toHaveBeenCalledWith(
			'123456',
			expect.any(Number),
			'uid123'
		)

		expect(sendEmailResetPassword).toHaveBeenCalledWith('user@example.com', '123456')

		expect(controller.encrypt.tokenCreation).toHaveBeenCalledWith('uid123', 'hashed')

		expect(res.header).toHaveBeenCalledWith('Authorization', 'mockedToken')
		expect(res.status).toHaveBeenCalledWith(200)
		expect(res.send).toHaveBeenCalledWith({ id: 'uid123' })
	})

	it('renvoie 200 sans contenu si utilisateur inexistant', async () => {
		mockUserInstance.getProfileUser.mockResolvedValue(null)

		await controller.forgotPassword(req, res)

		expect(sendEmailResetPassword).not.toHaveBeenCalled()
		expect(mockUserInstance.addCodeNumber).not.toHaveBeenCalled()
		expect(controller.encrypt.tokenCreation).not.toHaveBeenCalled()

		expect(res.status).toHaveBeenCalledWith(200)
		expect(res.send).not.toHaveBeenCalledWith({ id: expect.anything() })
		expect(res.send).not.toHaveBeenCalled() // car res.status(200) seul
	})
})

describe('verifyCode', () => {
	let controller
	let req, res
	let mockDbInstance, mockUserInstance

	beforeEach(() => {
		req = {
			body: {
				idUser: 'user123',
				code: '123456',
			},
		}

		res = {
			status: vi.fn().mockReturnThis(),
			json: vi.fn(),
		}

		controller = new CommunController()

		mockUserInstance = {
			getUserById: vi.fn(),
			getCodeByNumber: vi.fn(),
		}

		mockDbInstance = {
			usersInstances: vi.fn().mockResolvedValue(mockUserInstance),
			connectDb: vi.fn(),
			disconnectDb: vi.fn(),
		}

		databaseFactory.mockReturnValue(mockDbInstance)
	})

	it('returns 401 if code is invalid format', async () => {
		req.body.code = 'badCode'

		await controller.verifyCode(req, res)

		expect(res.status).toHaveBeenCalledWith(401)
		expect(res.json).toHaveBeenCalledWith({ message: "Ce n'est pas le bon code" })
	})

	it('returns 400 if code is not found in DB', async () => {
		mockUserInstance.getUserById.mockResolvedValue({ id: 'user123' })
		mockUserInstance.getCodeByNumber.mockResolvedValue(null)

		await controller.verifyCode(req, res)

		expect(res.status).toHaveBeenCalledWith(400)
		expect(res.json).toHaveBeenCalledWith({ message: 'Code invalide' })
	})

	it('returns 400 if code is expired', async () => {
		mockUserInstance.getUserById.mockResolvedValue({ id: 'user123' })
		mockUserInstance.getCodeByNumber.mockResolvedValue({
			expiresIn: Date.now() - 1000,
		})

		await controller.verifyCode(req, res)

		expect(res.status).toHaveBeenCalledWith(400)
		expect(res.json).toHaveBeenCalledWith({ message: 'Demande expiré' })
	})

	it('returns 200 if code is valid and not expired', async () => {
		mockUserInstance.getUserById.mockResolvedValue({ id: 'user123' })
		mockUserInstance.getCodeByNumber.mockResolvedValue({
			expiresIn: Date.now() + 10000,
		})

		await controller.verifyCode(req, res)

		expect(res.status).toHaveBeenCalledWith(200)
		expect(res.json).toHaveBeenCalledWith({ id: 'user123' })
	})
})
	

describe('resetPassword', () => {
	let controller, req, res, mockDbInstance, mockUserInstance

	beforeEach(() => {
		req = {
			body: {
				password: 'NewPassword123!',
				token: null,
				id: 'userId',
			},
		}

		res = { status: vi.fn().mockReturnThis(), json: vi.fn() }

		controller = new CommunController()

		controller._validationPassword = vi.fn().mockReturnValue({
			isValidPassword: true,
			errorPasswordMessage: '',
		})

		controller.encrypt = {
			verifyToken: vi.fn(),
			passwordEncrypt: vi.fn().mockReturnValue('encryptedPassword'),
		}

		mockUserInstance = {
			getUserById: vi.fn().mockResolvedValue({ id: 'userId', role: 'client' }),
			updateUser: vi.fn().mockReturnValue({ isError: false }),
		}

		mockDbInstance = {
			usersInstances: vi.fn().mockResolvedValue(mockUserInstance),
			connectDb: vi.fn(),
			disconnectDb: vi.fn(),
		}

		databaseFactory.mockReturnValue(mockDbInstance)
	})

	it('returns 401 if password is invalid', async () => {
		controller._validationPassword.mockReturnValue({
			isValidPassword: false,
			errorPasswordMessage: 'Invalid password',
		})

		await controller.resetPassword(req, res)

		expect(res.status).toHaveBeenCalledWith(401)
		expect(res.json).toHaveBeenCalledWith({ message: 'Invalid password' })
	})

	it('returns 401 if user is not found', async () => {
		mockUserInstance.getUserById.mockResolvedValue(null)

		await controller.resetPassword(req, res)

		expect(res.status).toHaveBeenCalledWith(401)
		expect(res.json).toHaveBeenCalledWith({ message: 'Utilisateur introuvable' })
	})

	it('returns 401 if update fails', async () => {
		mockUserInstance.updateUser.mockReturnValue({
			isError: true,
			errorMessage: 'Update failed',
		})

		await controller.resetPassword(req, res)

		expect(res.status).toHaveBeenCalledWith(401)
		expect(res.json).toHaveBeenCalledWith({ message: 'Update failed' })
	})

	it('returns 200 on success', async () => {
		await controller.resetPassword(req, res)

		expect(res.status).toHaveBeenCalledWith(200)
		expect(res.json).toHaveBeenCalledWith({ message: 'Mot de passe changé avec succès' })
	})
})

describe('deleteUser', () => {
	let controller, req, res

	beforeEach(() => {
		controller = new CommunController()

		res = { status: vi.fn().mockReturnThis(), json: vi.fn() }
	})

	it('returns 401 if body is missing', async () => {
		req = {}
		await controller.deleteUser(req, res)

		expect(res.status).toHaveBeenCalledWith(401)
		expect(res.json).toHaveBeenCalledWith({ message: 'Missing body params' })
	})

	it('returns 401 if role is invalid', async () => {
		req = { body: { role: 123, id: 1 } }


		await controller.deleteUser(req, res)

		expect(res.status).toHaveBeenCalledWith(401)
		expect(res.json).toHaveBeenCalledWith({ message: 'Role must be string' })
	})

	it('returns 401 if id is invalid', async () => {
		req = { body: { role: 'client', id: 'abc' } }

		await controller.deleteUser(req, res)

		expect(res.status).toHaveBeenCalledWith(401)
		expect(res.json).toHaveBeenCalledWith({ message: 'Id must be integer' })
	})

	it('returns 200 on success', async () => {
		req = { body: { role: 'client', id: 1 } }

		await controller.deleteUser(req, res)

		expect(res.status).toHaveBeenCalledWith(200)
		expect(res.json).toHaveBeenCalledWith({ message: 'delete user' })
	})
})

describe('updateProfile', () => {
	let controller, req, res, mockDbInstance, mockUserInstance

	beforeEach(() => {
		controller = new CommunController()

		req = {
			body: {
				userId: 'user123',
				profile: {
					password: 'NewPassword123!',
					username: 'updatedUser',
					other: 'otherField',
				},
			},
		}

		res = {
			status: vi.fn().mockReturnThis(),
			json: vi.fn(),
		}

		controller.encrypt = {
			passwordEncrypt: vi.fn().mockResolvedValue('encryptedPassword'),
		}

		mockUserInstance = {
			updateUser: vi.fn(),
		}

		mockDbInstance = {
			usersInstances: vi.fn().mockResolvedValue(mockUserInstance),
			connectDb: vi.fn(),
			disconnectDb: vi.fn(),
		}

		databaseFactory.mockReturnValue(mockDbInstance)
	})

	it('renvoie 200 avec profil mis à jour sans le mot de passe', async () => {
		const updatedUser = { username: 'updatedUser', other: 'otherField', password: 'encryptedPassword'}

		mockUserInstance.updateUser.mockResolvedValue(updatedUser)

		await controller.updateProfile(req, res)

		expect(controller.encrypt.passwordEncrypt).toHaveBeenCalledWith('NewPassword123!')
		expect(mockUserInstance.updateUser).toHaveBeenCalledWith('user123', {
			username: 'updatedUser',
			other: 'otherField',
			password: 'encryptedPassword',
		})
		expect(res.status).toHaveBeenCalledWith(200)
		expect(res.json).toHaveBeenCalledWith({	username: 'updatedUser',other: 'otherField',

		})
	})

	it('renvoie 200 même si aucun mot de passe n’est fourni', async () => {
		req.body.profile = { username: 'newName' }

		mockUserInstance.updateUser.mockResolvedValue({username: 'newName'})

		await controller.updateProfile(req, res)

		expect(controller.encrypt.passwordEncrypt).not.toHaveBeenCalled()
		expect(mockUserInstance.updateUser).toHaveBeenCalledWith('user123', {
			username: 'newName',
			password: undefined,
		})
		expect(res.status).toHaveBeenCalledWith(200)
		expect(res.json).toHaveBeenCalledWith({
				username: 'newName',
		})
	})

	it('renvoie 500 en cas d’erreur', async () => {
		mockUserInstance.updateUser.mockRejectedValue(new Error('DB error'))

		await controller.updateProfile(req, res)

		expect(res.status).toHaveBeenCalledWith(500)
		expect(res.json).toHaveBeenCalledWith({ message: errorServer })
	})
})

describe('getMatchesController', () => {
	let controller, req, res, mockDbInstance, mockUserInstance

	beforeEach(() => {
		controller = new CommunController()

		req = {}
		res = { status: vi.fn().mockReturnThis(), send: vi.fn() }

		mockUserInstance = {
			getMatches: vi.fn().mockResolvedValue([{ matchId: 1 }]),
		}

		mockDbInstance = {
			usersInstances: vi.fn().mockResolvedValue(mockUserInstance),
			connectDb: vi.fn(),
			disconnectDb: vi.fn(),
		}

		databaseFactory.mockReturnValue(mockDbInstance)
	})

	it('returns matches on success', async () => {
		await controller.getMatchesController(req, res)

		expect(res.status).toHaveBeenCalledWith(200)
		expect(res.send).toHaveBeenCalledWith([{ matchId: 1 }])
	})
})

describe('getFiltersController', () => {
	let controller, req, res, mockDbInstance, mockUserInstance

	beforeEach(() => {
		controller = new CommunController()

		req = {}
		res = { status: vi.fn().mockReturnThis(), json: vi.fn() }

		mockUserInstance = {
			getAllFilters: vi.fn().mockResolvedValue(['filter1', 'filter2']),
		}

		mockDbInstance = {
			usersInstances: vi.fn().mockResolvedValue(mockUserInstance),
			connectDb: vi.fn(),
			disconnectDb: vi.fn(),
		}

		databaseFactory.mockReturnValue(mockDbInstance)
	})

	it('returns filters on success', async () => {
		await controller.getFiltersController(req, res)

		expect(res.status).toHaveBeenCalledWith(200)
		expect(res.json).toHaveBeenCalledWith({ filters: ['filter1', 'filter2'] })
	})
})
	


