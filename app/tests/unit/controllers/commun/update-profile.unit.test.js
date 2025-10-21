import { databaseFactory } from '@hugo38rodrigues/bdd-service-hall-e'
import {
	beforeEach, describe, expect, it, vi,
} from 'vitest'
import { CommunController } from '../../../../controllers/commun.controller.js'
import { ERROR_SERVER } from '../../../../utils/constants.js'

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

// Mocks
vi.mock('@hugo38rodrigues/bdd-service-hall-e', () => ({ databaseFactory: vi.fn() }))

describe('updateProfile()', () => {
	let controller
	let userInstance
	let databaseInstance

	beforeEach(() => {
		vi.clearAllMocks()
		controller = new CommunController()
		controller.newLogger = { error: vi.fn(), info: vi.fn(), warn: vi.fn() }
		controller.encrypt = { passwordEncrypt: vi.fn().mockResolvedValue('hashed-pass') }

		userInstance = { updateUser: vi.fn() }
		databaseInstance = { usersInstances: vi.fn().mockResolvedValue(userInstance) }
		databaseFactory.mockReturnValue(databaseInstance)
	})

	it('400 si userId ou profile manquent', async () => {
		const req = makeReq({ userId: null, profile: null })
		const res = makeRes()

		await controller.updateProfile(req, res)

		expect(res.status).toHaveBeenCalledWith(400)
		expect(res.json).toHaveBeenCalledWith({ message: 'userId et profile sont requis.' })
		expect(databaseFactory).not.toHaveBeenCalled()
	})

	it('hash le mot de passe si fourni et supprime password/favorites à la réponse', async () => {
		const req = makeReq({
			userId: 'u1',
			profile: { password: 'Plain123!', nickname: 'Foo', favorites: ['x'] },
		})
		const res = makeRes()

		// L’instance renvoie l’objet “persisté” complet (le controller doit le nettoyer)
		userInstance.updateUser.mockResolvedValue({
			id: 'u1',
			nickname: 'Foo',
			role: 'client',
			password: 'hashed-pass',
			favorites: ['a', 'b'],
		})

		await controller.updateProfile(req, res)

		expect(databaseFactory).toHaveBeenCalled()
		expect(databaseInstance.usersInstances).toHaveBeenCalled()

		// passwordEncrypt a bien été appelé
		expect(controller.encrypt.passwordEncrypt).toHaveBeenCalledWith('Plain123!')

		// updateUser reçoit l’objet filtré (#filterProfile s’applique, on ne teste pas son interne)
		expect(userInstance.updateUser).toHaveBeenCalledWith(
			'u1',
			expect.objectContaining({ nickname: 'Foo', password: 'hashed-pass' }),
		)

		// la réponse NE contient PAS password/favorites
		expect(res.status).toHaveBeenCalledWith(200)
		expect(res.json).toHaveBeenCalledWith(
			expect.objectContaining({ id: 'u1', nickname: 'Foo', role: 'client' }),
		)
		// sécurité : pas de champs sensibles dans le payload
		const payload = res.json.mock.calls[0][0]
		expect(payload.password).toBeUndefined()
		expect(payload.favorites).toBeUndefined()
	})

	it('200 sans hash si pas de password dans le profile', async () => {
		const req = makeReq({ userId: 'u1', profile: { nickname: 'Bar' } })
		const res = makeRes()

		userInstance.updateUser.mockResolvedValue({ id: 'u1', nickname: 'Bar', role: 'bar' })

		await controller.updateProfile(req, res)

		expect(controller.encrypt.passwordEncrypt).not.toHaveBeenCalled()
		expect(userInstance.updateUser).toHaveBeenCalledWith(
			'u1',
			expect.objectContaining({ nickname: 'Bar' }),
		)
		expect(res.status).toHaveBeenCalledWith(200)
		expect(res.json).toHaveBeenCalledWith({ id: 'u1', nickname: 'Bar', role: 'bar' })
	})

	it('500 si exception', async () => {
		const req = makeReq({ userId: 'u1', profile: {} })
		const res = makeRes()

		databaseFactory.mockImplementation(() => { throw new Error('boom') })

		await controller.updateProfile(req, res)

		expect(res.status).toHaveBeenCalledWith(500)
		expect(res.json).toHaveBeenCalledWith({ message: ERROR_SERVER })
	})
})
