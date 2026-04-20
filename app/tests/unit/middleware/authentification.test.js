import {
	beforeEach,
	describe,
	expect,
	it,
	vi,
} from 'vitest'

// Imports après les mocks
import jwt from 'jsonwebtoken'
import { Authentification } from '../../../middleware/authentification.js'

// ---- Mocks ----
vi.mock('jsonwebtoken', () => ({
	default: {
		sign: vi.fn(),
		verify: vi.fn(),
	},
}))

const mockGetUserById = vi.fn()
vi.mock('@hugo38rodrigues/bdd-service-hall-e', () => ({
	db: {
		user: () => ({ getUserById: mockGetUserById }),
	},
}))

// Logger mocké : méthodes vides, on spy sur l'instance dans beforeEach
vi.mock('./logger.js', () => ({
	default: class Logger {
		error() {}

		info() {}

		warn() {}
	},
}))

// ---- Helpers ----
const buildRes = () => {
	const res = {}
	res.status = vi.fn().mockReturnValue(res)
	res.json = vi.fn().mockReturnValue(res)
	return res
}

const buildReq = (authHeader) => ({
	headers: authHeader ? { authorization: authHeader } : {},
})

// ---- Suite ----
describe('Authentification', () => {
	let auth
	const SECRET = 'test-secret-key'

	beforeEach(() => {
		process.env.SECRET_JWT_KEY = SECRET
		vi.clearAllMocks()
		auth = new Authentification()
		// Spy sur l'instance du logger pour pouvoir vérifier les appels
		vi.spyOn(auth.logger, 'error')
		vi.spyOn(auth.logger, 'info')
		vi.spyOn(auth.logger, 'warn')
	})

	// ====================================================================
	// constructor
	// ====================================================================
	describe('constructor', () => {
		it('initialise correctement avec SECRET_JWT_KEY défini', () => {
			expect(auth.jwtSecret).toBe(SECRET)
			expect(auth.logger).toBeDefined()
			expect(auth.userInstance).toBeDefined()
		})

		it('throw si SECRET_JWT_KEY est absent', () => {
			delete process.env.SECRET_JWT_KEY
			expect(() => new Authentification()).toThrow(
				'SECRET_JWT_KEY is not defined in environment variables',
			)
		})

		it('throw si SECRET_JWT_KEY est une chaîne vide', () => {
			process.env.SECRET_JWT_KEY = ''
			expect(() => new Authentification()).toThrow()
		})
	})

	// ====================================================================
	// tokenCreation
	// ====================================================================
	describe('tokenCreation', () => {
		it('appelle jwt.sign avec les bons paramètres et retourne le token', () => {
			jwt.sign.mockReturnValue('fake.jwt.token')

			const token = auth.tokenCreation(42, 'user@test.com')

			expect(jwt.sign).toHaveBeenCalledWith(
				{ id: 42, email: 'user@test.com' },
				SECRET,
				{ algorithm: 'HS256', expiresIn: '1h' },
			)
			expect(token).toBe('fake.jwt.token')
		})

		it('fonctionne avec un id numérique et un email string', () => {
			jwt.sign.mockReturnValue('token')
			const result = auth.tokenCreation(1, 'a@b.c')
			expect(result).toBe('token')
		})
	})

	// ====================================================================
	// extractToken
	// ====================================================================
	describe('extractToken', () => {
		it('retourne le token quand le header est "Bearer xxx"', () => {
			expect(auth.extractToken('Bearer abc.def.ghi')).toBe('abc.def.ghi')
		})

		it('retourne null si le header est null', () => {
			expect(auth.extractToken(null)).toBeNull()
		})

		it('retourne null si le header est undefined', () => {
			expect(auth.extractToken(undefined)).toBeNull()
		})

		it('retourne null si le header est une chaîne vide', () => {
			expect(auth.extractToken('')).toBeNull()
		})

		it('retourne null si le header ne commence pas par "Bearer "', () => {
			expect(auth.extractToken('Basic abc')).toBeNull()
			expect(auth.extractToken('Token abc')).toBeNull()
			expect(auth.extractToken('abc')).toBeNull()
		})

		it('retourne null si le token est vide après "Bearer "', () => {
			expect(auth.extractToken('Bearer ')).toBeNull()
			expect(auth.extractToken('Bearer    ')).toBeNull()
		})

		it('trim les espaces autour du token', () => {
			expect(auth.extractToken('Bearer   abc  ')).toBe('abc')
		})
	})

	// ====================================================================
	// verifyToken
	// ====================================================================
	describe('verifyToken', () => {
		it('retourne le payload si le token est valide', () => {
			const payload = { id: 1, email: 'a@b.c' }
			jwt.verify.mockReturnValue(payload)

			expect(auth.verifyToken('valid.token')).toEqual(payload)
			expect(jwt.verify).toHaveBeenCalledWith('valid.token', SECRET, {
				algorithms: ['HS256'],
			})
		})

		it('retourne null si jwt.verify throw (token expiré)', () => {
			jwt.verify.mockImplementation(() => {
				const err = new Error('jwt expired')
				err.name = 'TokenExpiredError'
				throw err
			})

			expect(auth.verifyToken('expired.token')).toBeNull()
			expect(auth.logger.error).toHaveBeenCalled()
		})

		it('retourne null si jwt.verify throw (signature invalide)', () => {
			jwt.verify.mockImplementation(() => {
				throw new Error('invalid signature')
			})

			expect(auth.verifyToken('bad.token')).toBeNull()
			expect(auth.logger.error).toHaveBeenCalled()
		})

		it('retourne null si jwt.verify throw (token malformé)', () => {
			jwt.verify.mockImplementation(() => {
				throw new Error('jwt malformed')
			})

			expect(auth.verifyToken('malformed')).toBeNull()
		})
	})

	// ====================================================================
	// getIdFromAuthHeader
	// ====================================================================
	describe('getIdFromAuthHeader', () => {
		it('retourne l\'id si le header est valide', () => {
			jwt.verify.mockReturnValue({ id: 99, email: 'x@y.z' })
			expect(auth.getIdFromAuthHeader('Bearer good.token')).toBe(99)
		})

		it('retourne null si le header est absent', () => {
			expect(auth.getIdFromAuthHeader(null)).toBeNull()
			expect(jwt.verify).not.toHaveBeenCalled()
		})

		it('retourne null si le header est mal formé', () => {
			expect(auth.getIdFromAuthHeader('Basic xyz')).toBeNull()
			expect(jwt.verify).not.toHaveBeenCalled()
		})

		it('retourne null si le token est invalide', () => {
			jwt.verify.mockImplementation(() => {
				throw new Error('invalid')
			})
			expect(auth.getIdFromAuthHeader('Bearer bad.token')).toBeNull()
		})

		it('retourne null si le payload ne contient pas d\'id', () => {
			jwt.verify.mockReturnValue({ email: 'x@y.z' })
			expect(auth.getIdFromAuthHeader('Bearer token')).toBeNull()
		})

		it('retourne null si le payload est null', () => {
			jwt.verify.mockReturnValue(null)
			expect(auth.getIdFromAuthHeader('Bearer token')).toBeNull()
		})

		it('accepte l\'id 0 (car ?? ne catch pas 0)', () => {
			jwt.verify.mockReturnValue({ id: 0 })
			expect(auth.getIdFromAuthHeader('Bearer token')).toBe(0)
		})
	})

	// ====================================================================
	// verifyTokenMiddleware
	// ====================================================================
	describe('verifyTokenMiddleware', () => {
		it('appelle next() si le token est valide', async () => {
			jwt.verify.mockReturnValue({ id: 1, email: 'a@b.c' })
			const req = buildReq('Bearer good.token')
			const res = buildRes()
			const next = vi.fn()

			await auth.verifyTokenMiddleware(req, res, next)

			expect(next).toHaveBeenCalledTimes(1)
			expect(req.user).toEqual({ id: 1, email: 'a@b.c' })
			expect(res.status).not.toHaveBeenCalled()
		})

		it('répond 401 si le header est absent', async () => {
			const req = buildReq()
			const res = buildRes()
			const next = vi.fn()

			await auth.verifyTokenMiddleware(req, res, next)

			expect(res.status).toHaveBeenCalledWith(401)
			expect(res.json).toHaveBeenCalledWith({
				message: 'Token manquant ou invalide',
			})
			expect(next).not.toHaveBeenCalled()
		})

		it('répond 401 si le header ne commence pas par "Bearer "', async () => {
			const req = buildReq('Basic xyz')
			const res = buildRes()
			const next = vi.fn()

			await auth.verifyTokenMiddleware(req, res, next)

			expect(res.status).toHaveBeenCalledWith(401)
			expect(next).not.toHaveBeenCalled()
		})

		it('répond 401 si le token est invalide/expiré', async () => {
			jwt.verify.mockImplementation(() => {
				throw new Error('jwt expired')
			})
			const req = buildReq('Bearer expired.token')
			const res = buildRes()
			const next = vi.fn()

			await auth.verifyTokenMiddleware(req, res, next)

			expect(res.status).toHaveBeenCalledWith(401)
			expect(res.json).toHaveBeenCalledWith({
				message: 'Token invalide ou expiré',
			})
			expect(next).not.toHaveBeenCalled()
		})

		it('répond 401 si le payload ne contient pas d\'id', async () => {
			jwt.verify.mockReturnValue({ email: 'a@b.c' })
			const req = buildReq('Bearer token')
			const res = buildRes()
			const next = vi.fn()

			await auth.verifyTokenMiddleware(req, res, next)

			expect(res.status).toHaveBeenCalledWith(401)
			expect(res.json).toHaveBeenCalledWith({
				message: 'ID manquant dans le token',
			})
			expect(next).not.toHaveBeenCalled()
		})

		it('n\'appelle pas la DB (ce middleware ne fait que décoder)', async () => {
			jwt.verify.mockReturnValue({ id: 1, email: 'a@b.c' })
			await auth.verifyTokenMiddleware(buildReq('Bearer t'), buildRes(), vi.fn())
			expect(mockGetUserById).not.toHaveBeenCalled()
		})
	})

	// ====================================================================
	// requireRole('bar')
	// ====================================================================
	describe('requireRole("bar")', () => {
		it('appelle next() si le rôle correspond (bar)', async () => {
			mockGetUserById.mockResolvedValue({ id: 1, role: 'bar' })
			const req = { user: { id: 1 } }
			const res = buildRes()
			const next = vi.fn()

			const middleware = auth.requireRole('bar')
			await middleware(req, res, next)

			expect(mockGetUserById).toHaveBeenCalledWith(1)
			expect(next).toHaveBeenCalledTimes(1)
			expect(req.profil).toEqual({ id: 1, role: 'bar' })
			expect(res.status).not.toHaveBeenCalled()
		})

		it('répond 403 si le rôle ne correspond pas', async () => {
			mockGetUserById.mockResolvedValue({ id: 1, role: 'client' })
			const req = { user: { id: 1 } }
			const res = buildRes()
			const next = vi.fn()

			const middleware = auth.requireRole('bar')
			await middleware(req, res, next)

			expect(res.status).toHaveBeenCalledWith(403)
			expect(res.json).toHaveBeenCalledWith({
				message: 'Accès refusé : rôle non autorisé',
			})
			expect(next).not.toHaveBeenCalled()
		})

		it('répond 401 si req.user est absent', async () => {
			const req = {}
			const res = buildRes()
			const next = vi.fn()

			const middleware = auth.requireRole('bar')
			await middleware(req, res, next)

			expect(res.status).toHaveBeenCalledWith(401)
			expect(res.json).toHaveBeenCalledWith({ message: 'Non authentifié' })
			expect(next).not.toHaveBeenCalled()
			expect(mockGetUserById).not.toHaveBeenCalled()
		})

		it('répond 401 si req.user.id est absent', async () => {
			const req = { user: {} }
			const res = buildRes()
			const next = vi.fn()

			const middleware = auth.requireRole('bar')
			await middleware(req, res, next)

			expect(res.status).toHaveBeenCalledWith(401)
			expect(next).not.toHaveBeenCalled()
		})

		it('répond 404 si l\'utilisateur est introuvable', async () => {
			mockGetUserById.mockResolvedValue(null)
			const req = { user: { id: 999 } }
			const res = buildRes()
			const next = vi.fn()

			const middleware = auth.requireRole('bar')
			await middleware(req, res, next)

			expect(res.status).toHaveBeenCalledWith(404)
			expect(res.json).toHaveBeenCalledWith({
				message: 'Utilisateur introuvable',
			})
			expect(next).not.toHaveBeenCalled()
		})

		it('répond 404 si getUserById retourne undefined', async () => {
			mockGetUserById.mockResolvedValue(undefined)
			const req = { user: { id: 999 } }
			const res = buildRes()
			const next = vi.fn()

			const middleware = auth.requireRole('bar')
			await middleware(req, res, next)

			expect(res.status).toHaveBeenCalledWith(404)
			expect(next).not.toHaveBeenCalled()
		})

		it('répond 500 si getUserById throw', async () => {
			mockGetUserById.mockRejectedValue(new Error('DB down'))
			const req = { user: { id: 1 } }
			const res = buildRes()
			const next = vi.fn()

			const middleware = auth.requireRole('bar')
			await middleware(req, res, next)

			expect(res.status).toHaveBeenCalledWith(500)
			expect(res.json).toHaveBeenCalledWith({ message: 'Erreur interne' })
			expect(next).not.toHaveBeenCalled()
		})
	})

	// ====================================================================
	// requireRole('client')
	// ====================================================================
	describe('requireRole("client")', () => {
		it('appelle next() si le rôle correspond (client)', async () => {
			mockGetUserById.mockResolvedValue({ id: 2, role: 'client' })
			const req = { user: { id: 2 } }
			const res = buildRes()
			const next = vi.fn()

			const middleware = auth.requireRole('client')
			await middleware(req, res, next)

			expect(next).toHaveBeenCalledTimes(1)
			expect(req.profil.role).toBe('client')
		})

		it('répond 403 si le rôle est "bar" au lieu de "client"', async () => {
			mockGetUserById.mockResolvedValue({ id: 2, role: 'bar' })
			const req = { user: { id: 2 } }
			const res = buildRes()
			const next = vi.fn()

			const middleware = auth.requireRole('client')
			await middleware(req, res, next)

			expect(res.status).toHaveBeenCalledWith(403)
			expect(next).not.toHaveBeenCalled()
		})

		it('répond 403 si le rôle est null/undefined', async () => {
			mockGetUserById.mockResolvedValue({ id: 2, role: null })
			const req = { user: { id: 2 } }
			const res = buildRes()
			const next = vi.fn()

			const middleware = auth.requireRole('client')
			await middleware(req, res, next)

			expect(res.status).toHaveBeenCalledWith(403)
		})
	})

	// ====================================================================
	// requireRole (factory)
	// ====================================================================
	describe('requireRole (factory)', () => {
		it('retourne une fonction middleware', () => {
			const middleware = auth.requireRole('bar')
			expect(typeof middleware).toBe('function')
			expect(middleware.length).toBe(3) // (req, res, next)
		})

		it('retourne des middlewares indépendants pour différents rôles', async () => {
			mockGetUserById.mockResolvedValue({ id: 1, role: 'bar' })

			const middlewareBar = auth.requireRole('bar')
			const middlewareClient = auth.requireRole('client')

			const reqBar = { user: { id: 1 } }
			const reqClient = { user: { id: 1 } }
			const resBar = buildRes()
			const resClient = buildRes()
			const nextBar = vi.fn()
			const nextClient = vi.fn()

			await middlewareBar(reqBar, resBar, nextBar)
			await middlewareClient(reqClient, resClient, nextClient)

			expect(nextBar).toHaveBeenCalled()
			expect(resClient.status).toHaveBeenCalledWith(403)
		})
	})

	// ====================================================================
	// Intégration
	// ====================================================================
	describe('Intégration : verifyTokenMiddleware + requireRole', () => {
		it('passe la chain complète avec un token valide et rôle bar', async () => {
			jwt.verify.mockReturnValue({ id: 1, email: 'bar@test.com' })
			mockGetUserById.mockResolvedValue({ id: 1, role: 'bar' })

			const req = buildReq('Bearer valid.token')
			const res = buildRes()
			const next1 = vi.fn()
			const next2 = vi.fn()

			await auth.verifyTokenMiddleware(req, res, next1)
			expect(next1).toHaveBeenCalled()
			expect(req.user.id).toBe(1)

			const requireBar = auth.requireRole('bar')
			await requireBar(req, res, next2)
			expect(next2).toHaveBeenCalled()
			expect(req.profil.role).toBe('bar')
		})

		it('bloque à la vérification du rôle si mauvais rôle', async () => {
			jwt.verify.mockReturnValue({ id: 1, email: 'c@test.com' })
			mockGetUserById.mockResolvedValue({ id: 1, role: 'client' })

			const req = buildReq('Bearer valid.token')
			const res = buildRes()
			const next1 = vi.fn()
			const next2 = vi.fn()

			await auth.verifyTokenMiddleware(req, res, next1)
			expect(next1).toHaveBeenCalled()

			const requireBar = auth.requireRole('bar')
			await requireBar(req, res, next2)
			expect(res.status).toHaveBeenCalledWith(403)
			expect(next2).not.toHaveBeenCalled()
		})

		it('bloque à la vérification du token si token invalide (requireRole pas atteint)', async () => {
			jwt.verify.mockImplementation(() => {
				throw new Error('jwt expired')
			})

			const req = buildReq('Bearer expired.token')
			const res = buildRes()
			const next1 = vi.fn()

			await auth.verifyTokenMiddleware(req, res, next1)
			expect(res.status).toHaveBeenCalledWith(401)
			expect(next1).not.toHaveBeenCalled()
			expect(mockGetUserById).not.toHaveBeenCalled()
		})
	})
})
