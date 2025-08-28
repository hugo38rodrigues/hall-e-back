import { databaseFactory } from '@hugo38rodrigues/bdd-service-hall-e/main.js'
import bcryptjs from 'bcryptjs'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CommunController } from '../../../controllers/commun.controller.js'
import { sendEmailResetPassword } from '../../../utils/email.js'
import { errorServer } from '../../../utils/messages.js'
import { FavorisController } from '../../../controllers/favoris.controller.js'

vi.mock('bcryptjs')
vi.mock('@hugo38rodrigues/bdd-service-hall-e/main.js', () => ({
	databaseFactory: vi.fn(),
}))
vi.mock('../../../utils/email.js', () => ({
	sendEmailResetPassword: vi.fn(),
}))
vi.mock('../../../controllers/favoris.controller.js', () => ({
	FavorisController: vi.fn(),
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
		}

		databaseFactory.mockReturnValue(mockDbInstance)
	})

	it('renvoie 401 si utilisateur non trouvé', async () => {
		mockUserInstance.getProfileUser.mockResolvedValue(null)

		await controller.connexion(req, res)

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

	// ✅ Helper pour configurer la réponse mockée de _clientAccountVerify / _barAccountVerify
	const mockAccountVerify = (method, { isValid, message = '', profile = null }) => {
		controller[method].mockResolvedValue({ isValid, message, profile })
	}

	// ✅ Helper pour préparer la DB
	const mockDatabaseUser = (user = null) => {
		mockUserInstance.getUser.mockResolvedValue(user)
	}

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

		// Mocks des méthodes privées
		controller._clientAccountVerify = vi.fn()
		controller._barAccountVerify = vi.fn()

		// Mocks DB
		mockUserInstance = {
			getUser: vi.fn(),
			addUser: vi.fn(),
		}

		mockDbInstance = {
			usersInstances: vi.fn().mockResolvedValue(mockUserInstance),
		}

		databaseFactory.mockReturnValue(mockDbInstance)
	})

	// ✅ Cas 1 : Validation échoue
	it('renvoie 401 si la validation échoue', async () => {
		mockAccountVerify('_clientAccountVerify', { isValid: false, message: 'Invalid data' })

		await controller.createAccount(req, res)

		expect(res.status).toHaveBeenCalledWith(401)
		expect(res.json).toHaveBeenCalledWith({ message: 'Invalid data' })
	})

	// ✅ Cas 2 : L'utilisateur existe déjà
	it("renvoie 401 si l'utilisateur existe déjà", async () => {
		mockAccountVerify('_clientAccountVerify', {
			isValid: true,
			profile: { email: 'user@example.com' },
		})
		mockDatabaseUser({ email: 'user@example.com' })

		await controller.createAccount(req, res)

		expect(res.status).toHaveBeenCalledWith(401)
		expect(res.json).toHaveBeenCalledWith({ message: "L'utilisateur existe déjà" })
	})

	// ✅ Cas 3 : Création utilisateur réussie
	it('crée un utilisateur et renvoie 201 si succès', async () => {
		mockAccountVerify('_clientAccountVerify', {
			isValid: true,
			profile: { email: 'user@example.com' },
		})
		mockDatabaseUser(null)

		await controller.createAccount(req, res)

		expect(mockUserInstance.addUser).toHaveBeenCalledWith({ email: 'user@example.com' })
		expect(res.status).toHaveBeenCalledWith(201)
		expect(res.json).toHaveBeenCalledWith({ message: 'Inscription réussis' })
	})

	// ✅ Cas 4 : Erreur inattendue
	it('renvoie 500 en cas d’erreur inattendue', async () => {
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
		}

		databaseFactory.mockReturnValue(mockDbInstance)
		sendEmailResetPassword.mockReset()
	})

	it('renvoie 401 si la validation de l’email échoue', async () => {
		controller._validationEmail.mockReturnValue({
			isValidCredentiel: true, // ✅ doit être true pour forcer l'erreur
			message: 'Email invalide',
		})

		await controller.forgotPassword(req, res)

		expect(res.status).toHaveBeenCalledWith(401)
		expect(res.json).toHaveBeenCalledWith({ message: 'Email invalide' })
	})

	it('renvoie 200 avec header et id si utilisateur existe', async () => {
		mockUserInstance.getProfileUser.mockResolvedValue({
			_id: 'uid123', // ✅ doit être _id
			password: 'hashed',
		})

		await controller.forgotPassword(req, res)

		expect(mockUserInstance.addCodeNumber).toHaveBeenCalledWith(
			'123456',
			expect.any(Number), // ✅ on passe expiresIn
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
		expect(res.send).not.toHaveBeenCalled() // ✅ car aucun contenu envoyé
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
	let controller, req, res, mockUserInstance, mockDbInstance

	beforeEach(() => {
		controller = new CommunController()

		req = { params: {} } // ✅ Important !
		res = { status: vi.fn().mockReturnThis(), json: vi.fn() }

		mockUserInstance = {
			getUserById: vi.fn(),
			deleteUser: vi.fn(),
		}

		mockDbInstance = {
			usersInstances: vi.fn().mockResolvedValue(mockUserInstance)
		}

		databaseFactory.mockReturnValue(mockDbInstance)
	})

	it('returns 401 if params are missing', async () => {
		req.params = undefined // ✅ simulate missing params

		await controller.deleteUser(req, res)

		expect(res.status).toHaveBeenCalledWith(401)
		expect(res.json).toHaveBeenCalledWith({
			message: 'Il manque un parametre dans votre requete',
		})
	})

	it('returns 401 if idUser is invalid', async () => {
		req.params = { idUser: '1232' } // not a valid MongoID

		await controller.deleteUser(req, res)

		expect(res.status).toHaveBeenCalledWith(401)
		expect(res.json).toHaveBeenCalledWith({
			message: 'Il manque un id utilisateur ',
		})
	})

	it('returns 401 if user is not found', async () => {
		req.params = { idUser: '689498a956abdf2b7a7d24f0' } // valid MongoID

		mockUserInstance.getUserById.mockResolvedValue(null) // simulate user not found

		await controller.deleteUser(req, res)

		expect(res.status).toHaveBeenCalledWith(401)
		expect(res.json).toHaveBeenCalledWith({
			message: 'Utilisateur un trouvable',
		})
	})

	it('returns 200 on success', async () => {
		req.params = { idUser: '689498a956abdf2b7a7d24f0' }

		mockUserInstance.getUserById.mockResolvedValue({ id: 'userId', role: 'user' })
		mockUserInstance.deleteUser.mockResolvedValue(true) // ✅ must return a promise

		await controller.deleteUser(req, res)

		expect(res.status).toHaveBeenCalledWith(200)
		expect(res.json).toHaveBeenCalledWith({ message: 'Compte supprimé' })
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
		}

		databaseFactory.mockReturnValue(mockDbInstance)
	})

	it('returns filters on success', async () => {
		await controller.getFiltersController(req, res)

		expect(res.status).toHaveBeenCalledWith(200)
		expect(res.json).toHaveBeenCalledWith({ filters: ['filter1', 'filter2'] })
	})
})
	
describe('getAllBarController', () => {
	let controller, mockDbInstance, mockUserInstance, res

	const fakeBars = [
		{
			id: 'bar1',
			name: 'Le Bar',
			description: 'Un bar sympa',
			address: 'Rue du test',
			pictures: ['img.jpg'],
			role: 'bar',
			programmedMatches: [
				{ date: new Date(Date.now() + 3600000).toISOString() }, // match dans 1h
				{ date: new Date(Date.now() - 3600000).toISOString() }, // match dans le passé
			],
			userLocation: { latitude: 45.0, longitude: 5.0 },
		},
	]

	const filteredBars = [fakeBars[0]] // résultat simulé de _filterAndSortMatches
	const formattedBars = [{ id: 'bar1', name: 'Le Bar', distance: 1 }] // résultat simulé de _formatedDataBar

	beforeEach(() => {
		res = {
			status: vi.fn().mockReturnThis(),
			json: vi.fn(),
		}

		mockUserInstance = {
			getBars: vi.fn().mockResolvedValue(fakeBars),
		}
		mockDbInstance = {
			usersInstances: vi.fn().mockResolvedValue(mockUserInstance),
		}

		databaseFactory.mockReturnValue(mockDbInstance)

		controller = new CommunController()

		// ✅ On mocke les méthodes internes pour contrôler leur sortie
		controller._filterAndSortMatches = vi.fn().mockReturnValue(filteredBars)
		controller._formatedDataBar = vi.fn().mockReturnValue(formattedBars)
	})

	it('retourne les bars correctement filtrés et formatés', async () => {
		await controller.getAllBarController({}, res)

		expect(mockUserInstance.getBars).toHaveBeenCalled()
		expect(controller._filterAndSortMatches).toHaveBeenCalledWith(fakeBars)
		expect(controller._formatedDataBar).toHaveBeenCalledWith(filteredBars)

		expect(res.status).toHaveBeenCalledWith(200)
		expect(res.json).toHaveBeenCalledWith(formattedBars) 
	})

	it('retourne une erreur 500 si un problème survient', async () => {
		databaseFactory.mockImplementation(() => {
			throw new Error('Crash')
		})

		await controller.getAllBarController({}, res)

		expect(res.status).toHaveBeenCalledWith(500)
		expect(res.json).toHaveBeenCalledWith({ message: errorServer })
	})
})

describe('FavorisController - endpoints REST addFavorites / deleteFavorites', () => {

	let controller, res, favorisMock

	beforeEach(() => {
		// ✅ Déclare favorisMock ici
		favorisMock = {
			addFavorisGameController: vi.fn().mockResolvedValue({ success: true }),
			addFavorisLeagueController: vi.fn().mockResolvedValue({ success: true }),
			addFavorisTeamController: vi.fn().mockResolvedValue({ success: true }),
			addFavorisBarNameController: vi.fn().mockResolvedValue({ success: true }),
			deleteFavorisGameController: vi.fn().mockResolvedValue({ success: true }),
			deleteFavorisLeagueController: vi.fn().mockResolvedValue({ success: true }),
			deleteFavorisTeamController: vi.fn().mockResolvedValue({ success: true }),
			deleteFavorisBarNameController: vi.fn().mockResolvedValue({ success: true }),
		}

		// ✅ On mock la classe FavorisController pour qu'elle renvoie notre mock
		FavorisController.mockImplementation(() => favorisMock)

		controller = new CommunController()
		controller.newLogger = { error: vi.fn() }

		res = { status: vi.fn().mockReturnThis(), json: vi.fn() }
	})

	it('addFavorites appelle addFavorisGameController et renvoie 200', async () => {
		const req = { body: { type: 'gameName', idUser: 1, data: 'FIFA' } }

		await controller.addFavorites(req, res)

		expect(favorisMock.addFavorisGameController).toHaveBeenCalledWith(1, 'FIFA', 'gameName')
		expect(res.status).toHaveBeenCalledWith(200)
		expect(res.json).toHaveBeenCalledWith({ success: true })
	})

	it('addFavorites renvoie 500 si addFavoris renvoie une erreur', async () => {
		favorisMock.addFavorisTeamController.mockResolvedValue({ message: errorServer })
		const req = { body: { type: 'teams', idUser: 1, data: 10 } }

		await controller.addFavorites(req, res)

		expect(res.status).toHaveBeenCalledWith(500)
		expect(res.json).toHaveBeenCalledWith({ message: errorServer })
	})

	it('deleteFavorites appelle deleteFavorisBarNameController et renvoie 200', async () => {
		const req = { body: { type: 'barName', idUser: 1, data: 99 } }

		await controller.deleteFavorites(req, res)

		expect(favorisMock.deleteFavorisBarNameController).toHaveBeenCalledWith(1, 99)
		expect(res.status).toHaveBeenCalledWith(200)
		expect(res.json).toHaveBeenCalledWith({ success: true })
	})

	it('deleteFavorites renvoie 500 si deleteFavoris renvoie une erreur', async () => {
		favorisMock.deleteFavorisLeagueController.mockResolvedValue({ message: errorServer })
		const req = { body: { type: 'leagueName', idUser: 1, data: 'Ligue 1' } }

		await controller.deleteFavorites(req, res)

		expect(res.status).toHaveBeenCalledWith(500)
		expect(res.json).toHaveBeenCalledWith({ message: errorServer })
	})
})
