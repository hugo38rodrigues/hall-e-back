/* eslint-disable no-underscore-dangle */
/**
 * Tests unitaires - Jwt
 * ----------------------
 * Chaque méthode est testée en isolation : jsonwebtoken et logger sont mockés.
 */

import {
	beforeEach,
	describe,
	expect,
	test,
	vi,
} from 'vitest'

vi.mock('jsonwebtoken', () => ({
	default: {
		sign: vi.fn(),
		verify: vi.fn(),
	},
}))

vi.mock('../../../utils/logger.js', () => ({
	logger: {
		info: vi.fn(),
		error: vi.fn(),
		warn: vi.fn(),
	},
}))

const jwt = (await import('jsonwebtoken')).default
const { logger } = await import('../../../utils/logger.js')

describe('Jwt - unit', () => {
	const SECRET = 'test-secret'
	let Jwt
	let instance

	beforeEach(async () => {
		vi.clearAllMocks()
		process.env.SECRET_JWT_KEY = SECRET
		// re-import à chaque test pour reset l'état du module si besoin
		const mod = await import('../../../middleware/jwt.js')
		Jwt = mod.Jwt
		instance = new Jwt()
	})

	describe('constructor', () => {
		test('lit SECRET_JWT_KEY depuis process.env', () => {
			expect(instance.jwtSecret).toBe(SECRET)
		})

		test('throw si SECRET_JWT_KEY est absent', () => {
			delete process.env.SECRET_JWT_KEY
			expect(() => new Jwt()).toThrow(
				'SECRET_JWT_KEY is not defined in environment variables',
			)
		})
	})

	describe('tokenCreation', () => {
		test('signe avec id, email, secret et options correctes', () => {
			jwt.sign.mockReturnValue('signed.jwt.token')

			const token = instance.tokenCreation(42, 'a@b.c')

			expect(jwt.sign).toHaveBeenCalledWith(
				{ id: 42, email: 'a@b.c' },
				SECRET,
				{ algorithm: 'HS256', expiresIn: '1h' },
			)
			expect(token).toBe('signed.jwt.token')
		})
	})

	describe('getIdFromAuthHeader', () => {
		test('retourne l\'id quand le header et le token sont valides', () => {
			jwt.verify.mockReturnValue({ id: 7, email: 'a@b.c' })

			const id = instance.getIdFromAuthHeader('Bearer abc.def.ghi')

			expect(jwt.verify).toHaveBeenCalledWith('abc.def.ghi', SECRET, {
				algorithms: ['HS256'],
			})
			expect(id).toBe(7)
		})

		test('retourne null si header absent', () => {
			expect(instance.getIdFromAuthHeader(undefined)).toBeNull()
			expect(instance.getIdFromAuthHeader(null)).toBeNull()
			expect(instance.getIdFromAuthHeader('')).toBeNull()
			expect(jwt.verify).not.toHaveBeenCalled()
		})

		test('retourne null si pas de préfixe Bearer', () => {
			expect(instance.getIdFromAuthHeader('Basic xyz')).toBeNull()
			expect(instance.getIdFromAuthHeader('abc.def.ghi')).toBeNull()
			expect(jwt.verify).not.toHaveBeenCalled()
		})

		test('retourne null si token vide après "Bearer "', () => {
			expect(instance.getIdFromAuthHeader('Bearer ')).toBeNull()
			expect(instance.getIdFromAuthHeader('Bearer    ')).toBeNull()
			expect(jwt.verify).not.toHaveBeenCalled()
		})

		test('retourne null si jwt.verify throw', () => {
			jwt.verify.mockImplementation(() => {
				throw new Error('invalid signature')
			})

			expect(instance.getIdFromAuthHeader('Bearer bad.token')).toBeNull()
			expect(logger.error).toHaveBeenCalled()
		})

		test('retourne null si payload n\'a pas d\'id', () => {
			jwt.verify.mockReturnValue({ email: 'a@b.c' })

			expect(instance.getIdFromAuthHeader('Bearer ok.token')).toBeNull()
		})
	})

	describe('validationTokenAccess', () => {
		const buildRes = () => ({
			status: vi.fn().mockReturnThis(),
			json: vi.fn().mockReturnThis(),
		})

		test('401 si pas de header Authorization', async () => {
			const req = { headers: {} }
			const res = buildRes()
			const next = vi.fn()

			await instance.validationTokenAccess(req, res, next)

			expect(res.status).toHaveBeenCalledWith(401)
			expect(res.json).toHaveBeenCalledWith({
				message: 'Token manquant ou invalide',
			})
			expect(next).not.toHaveBeenCalled()
		})

		test('401 si header mal formé', async () => {
			const req = { headers: { authorization: 'NotBearer xyz' } }
			const res = buildRes()
			const next = vi.fn()

			await instance.validationTokenAccess(req, res, next)

			expect(res.status).toHaveBeenCalledWith(401)
			expect(next).not.toHaveBeenCalled()
		})

		test('401 si token invalide (verify throw)', async () => {
			jwt.verify.mockImplementation(() => {
				throw new Error('expired')
			})
			const req = { headers: { authorization: 'Bearer expired.token' } }
			const res = buildRes()
			const next = vi.fn()

			await instance.validationTokenAccess(req, res, next)

			expect(res.status).toHaveBeenCalledWith(401)
			expect(res.json).toHaveBeenCalledWith({
				message: 'Token invalide ou expiré',
			})
			expect(next).not.toHaveBeenCalled()
		})

		test('401 si payload sans id', async () => {
			jwt.verify.mockReturnValue({ email: 'a@b.c' })
			const req = { headers: { authorization: 'Bearer ok.token' } }
			const res = buildRes()
			const next = vi.fn()

			await instance.validationTokenAccess(req, res, next)

			expect(res.status).toHaveBeenCalledWith(401)
			expect(res.json).toHaveBeenCalledWith({
				message: 'ID manquant dans le token',
			})
			expect(next).not.toHaveBeenCalled()
		})

		test('attache payload à req.user et appelle next() quand tout est OK', async () => {
			const payload = { id: 7, email: 'a@b.c' }
			jwt.verify.mockReturnValue(payload)
			const req = { headers: { authorization: 'Bearer good.token' } }
			const res = buildRes()
			const next = vi.fn()

			await instance.validationTokenAccess(req, res, next)

			expect(req.user).toEqual(payload)
			expect(next).toHaveBeenCalledTimes(1)
			expect(res.status).not.toHaveBeenCalled()
		})
	})
})
