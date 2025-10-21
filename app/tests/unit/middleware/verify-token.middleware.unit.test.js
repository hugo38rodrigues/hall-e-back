import {
	beforeEach,
	describe,
	expect,
	it,
	vi,
} from 'vitest'
import { Auth } from '../../../middleware/auth.js'

// Helpers simples pour req / res / next
const makeReq = (authorization) => ({
	headers: authorization ? { authorization } : {},
})

const makeRes = () => {
	const res = {}
	res.status = vi.fn().mockImplementation((code) => {
		res.statusCode = code
		return res
	})
	res.json = vi.fn().mockImplementation(function (payload) {
		res.body = payload
		return res
	})
	return res
}

const makeNext = () => vi.fn()

describe('Auth.verifyAccount', () => {
	let auth

	let encryptMock

	beforeEach(() => {
		vi.restoreAllMocks()

		auth = new Auth()

		// On remplace les dépendances par des mocks directement sur l’instance
		encryptMock = { verifyToken: vi.fn() }

		auth.encrypt = encryptMock
	})

	it('retourne 401 si l\'en-tête Authorization est manquant', async () => {
		const req = makeReq(undefined)
		const res = makeRes()
		const next = makeNext()

		await auth.verifyAccount(req, res, next)

		expect(res.status).toHaveBeenCalledWith(401)
		expect(res.json).toHaveBeenCalledWith({ message: 'Token manquant ou invalide' })
		expect(next).not.toHaveBeenCalled()
		expect(encryptMock.verifyToken).not.toHaveBeenCalled()
	})

	it('retourne 401 si l\'en-tête ne commence pas par \'Bearer \'', async () => {
		const req = makeReq('Token abc.def.ghi')
		const res = makeRes()
		const next = makeNext()

		await auth.verifyAccount(req, res, next)

		expect(res.status).toHaveBeenCalledWith(401)
		expect(res.json).toHaveBeenCalledWith({ message: 'Token manquant ou invalide' })
		expect(next).not.toHaveBeenCalled()
		expect(encryptMock.verifyToken).not.toHaveBeenCalled()
	})

	it('appelle next() si le token est valide', async () => {
		encryptMock.verifyToken.mockResolvedValue(true)

		const req = makeReq('Bearer valid.jwt.token')
		const res = makeRes()
		const next = makeNext()

		await auth.verifyAccount(req, res, next)

		expect(encryptMock.verifyToken).toHaveBeenCalledWith('valid.jwt.token')
		expect(next).toHaveBeenCalledTimes(1)
		expect(res.status).not.toHaveBeenCalled()
		expect(res.json).not.toHaveBeenCalled()
	})

	it('retourne 401 si verifyToken renvoie false (token trop ancien)', async () => {
		encryptMock.verifyToken.mockResolvedValue(false)

		const req = makeReq('Bearer old.jwt.token')
		const res = makeRes()
		const next = makeNext()

		await auth.verifyAccount(req, res, next)

		expect(encryptMock.verifyToken).toHaveBeenCalledWith('old.jwt.token')
		expect(res.status).toHaveBeenCalledWith(401)
		expect(res.json).toHaveBeenCalledWith({ message: 'Ce token est trop ancien' })
		expect(next).not.toHaveBeenCalled()
	})

	it('retourne 401 si verifyToken lève une erreur', async () => {
		const boom = new Error('boom')
		encryptMock.verifyToken.mockRejectedValue(boom)

		const req = makeReq('Bearer bad.jwt.token')
		const res = makeRes()
		const next = makeNext()

		await auth.verifyAccount(req, res, next)

		expect(encryptMock.verifyToken).toHaveBeenCalledWith('bad.jwt.token')
		expect(res.status).toHaveBeenCalledWith(401)
		expect(res.json).toHaveBeenCalledWith({ message: 'Ce token est trop ancien' })
		expect(next).not.toHaveBeenCalled()
	})
})
