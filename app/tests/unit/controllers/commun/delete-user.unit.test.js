import { databaseFactory } from '@hugo38rodrigues/bdd-service-hall-e'
import {
	beforeEach, describe, expect, it, vi,
} from 'vitest'
import { CommunController } from '../../../../controllers/commun.controller.js'
import { ERROR_SERVER } from '../../../../utils/constants.js'

// Helpers
const makeReq = ({
	body = {}, params, query = {}, headers = {},
} = {}) => ({
	body,
	// Permettre params undefined pour simuler "pas de params"
	...(params !== undefined ? { params } : {}),
	query,
	headers,
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

// Mock de la factory DB (même chemin que dans le controller)
vi.mock('@hugo38rodrigues/bdd-service-hall-e', () => ({
	databaseFactory: vi.fn(),
}))

describe('deleteUser()', () => {
	let controller
	let userInstance
	let databaseInstance

	// Un ID Mongo valide (24 hex)
	const VALID_MONGO_ID = '651234567890abcdef123456'

	beforeEach(() => {
		vi.clearAllMocks()

		controller = new CommunController()
		controller.newLogger = { error: vi.fn(), info: vi.fn(), warn: vi.fn() }

		userInstance = {
			getUserById: vi.fn(),
			deleteUser: vi.fn(),
		}
		databaseInstance = { usersInstances: vi.fn().mockResolvedValue(userInstance) }
		databaseFactory.mockReturnValue(databaseInstance)
	})

	it('401 si params manquants', async () => {
		const req = makeReq()
		const res = makeRes()

		await controller.deleteUser(req, res)

		expect(res.status).toHaveBeenCalledWith(401)
		expect(res.json).toHaveBeenCalledWith({
			message: 'Il manque un parametre dans votre requete',
		})
		expect(databaseFactory).not.toHaveBeenCalled()
	})

	it("401 si l'id n'est pas un MongoID valide", async () => {
		const req = makeReq({ params: { idUser: 'abc' } }) // invalide
		const res = makeRes()

		await controller.deleteUser(req, res)

		expect(res.status).toHaveBeenCalledWith(401)
		expect(res.json).toHaveBeenCalledWith({
			message: 'Il manque un id utilisateur ',
		})
		expect(databaseFactory).not.toHaveBeenCalled()
	})

	it("401 si l'utilisateur est introuvable", async () => {
		const req = makeReq({ params: { idUser: VALID_MONGO_ID } })
		const res = makeRes()

		userInstance.getUserById.mockResolvedValue(null)

		await controller.deleteUser(req, res)

		expect(databaseFactory).toHaveBeenCalled()
		expect(databaseInstance.usersInstances).toHaveBeenCalled()
		expect(userInstance.getUserById).toHaveBeenCalledWith(VALID_MONGO_ID)

		expect(res.status).toHaveBeenCalledWith(401)
		expect(res.json).toHaveBeenCalledWith({ message: 'Utilisateur un trouvable' })
	})

	it('401 si deleteUser renvoie false (échec suppression)', async () => {
		const req = makeReq({ params: { idUser: VALID_MONGO_ID } })
		const res = makeRes()

		userInstance.getUserById.mockResolvedValue({ id: VALID_MONGO_ID, role: 'client' })
		userInstance.deleteUser.mockResolvedValue(false)

		await controller.deleteUser(req, res)

		expect(userInstance.deleteUser).toHaveBeenCalledWith(VALID_MONGO_ID, 'client')
		expect(res.status).toHaveBeenCalledWith(401)
		expect(res.json).toHaveBeenCalledWith({ message: 'Impossible de supprimer le compte' })
	})

	it('200 si suppression OK', async () => {
		const req = makeReq({ params: { idUser: VALID_MONGO_ID } })
		const res = makeRes()

		userInstance.getUserById.mockResolvedValue({ id: VALID_MONGO_ID, role: 'bar' })
		userInstance.deleteUser.mockResolvedValue(true)

		await controller.deleteUser(req, res)

		expect(userInstance.deleteUser).toHaveBeenCalledWith(VALID_MONGO_ID, 'bar')
		expect(res.status).toHaveBeenCalledWith(200)
		expect(res.json).toHaveBeenCalledWith({ message: 'Compte supprimé' })
	})

	it('500 si une exception est levée', async () => {
		const req = makeReq({ params: { idUser: VALID_MONGO_ID } })
		const res = makeRes()

		databaseFactory.mockImplementation(() => { throw new Error('boom') })

		await controller.deleteUser(req, res)

		expect(res.status).toHaveBeenCalledWith(500)
		expect(res.json).toHaveBeenCalledWith({ message: ERROR_SERVER })
	})
})
