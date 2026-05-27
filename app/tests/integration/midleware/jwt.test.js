/**
 * Tests d'intégration - Jwt
 * --------------------------
 * Utilise le vrai jsonwebtoken et une vraie app Express via supertest.
 */

import express from 'express'
import request from 'supertest'
import {
	beforeAll,
	beforeEach,
	describe,
	expect,
	test,
	vi,
} from 'vitest'

vi.mock('../../../utils/logger.js', () => ({
	logger: {
		info: vi.fn(),
		error: vi.fn(),
		warn: vi.fn(),
	},
}))

const SECRET = 'integration-secret'
process.env.SECRET_JWT_KEY = SECRET

let Jwt
let jwt

beforeAll(async () => {
	Jwt = (await import('../../../middleware/jwt.js')).Jwt
	jwt = (await import('jsonwebtoken')).default
})

const buildApp = () => {
	const app = express()
	app.use(express.json())
	const auth = new Jwt()

	app.post('/login', (req, res) => {
		const token = auth.tokenCreation(req.body.id, req.body.email)
		return res.status(200).json({ token })
	})

	app.get('/me', auth.validationTokenAccess, (req, res) => res.status(200).json({ user: req.user }))

	return app
}

describe('Intégration HTTP - Jwt', () => {
	let app

	beforeEach(() => {
		app = buildApp()
	})

	test('POST /login crée un token signé décodable', async () => {
		const res = await request(app)
			.post('/login')
			.send({ id: 1, email: 'a@b.c' })

		expect(res.status).toBe(200)
		expect(typeof res.body.token).toBe('string')

		// le token est réellement signé avec SECRET et contient le bon payload
		const decoded = jwt.verify(res.body.token, SECRET)
		expect(decoded.id).toBe(1)
		expect(decoded.email).toBe('a@b.c')
		expect(decoded.exp).toBeDefined()
	})

	test('GET /me 200 avec un token valide', async () => {
		const token = jwt.sign({ id: 42, email: 'a@b.c' }, SECRET, {
			algorithm: 'HS256',
			expiresIn: '1h',
		})

		const res = await request(app)
			.get('/me')
			.set('Authorization', `Bearer ${token}`)

		expect(res.status).toBe(200)
		expect(res.body.user.id).toBe(42)
		expect(res.body.user.email).toBe('a@b.c')
	})

	test('GET /me 401 sans header Authorization', async () => {
		const res = await request(app).get('/me')

		expect(res.status).toBe(401)
		expect(res.body).toEqual({ message: 'Token manquant ou invalide' })
	})

	test('GET /me 401 avec un Bearer vide', async () => {
		const res = await request(app)
			.get('/me')
			.set('Authorization', 'Bearer ')

		expect(res.status).toBe(401)
		expect(res.body).toEqual({ message: 'Token manquant ou invalide' })
	})

	test('GET /me 401 si signature invalide (secret différent)', async () => {
		const token = jwt.sign({ id: 1, email: 'x@y.z' }, 'wrong-secret', {
			algorithm: 'HS256',
			expiresIn: '1h',
		})

		const res = await request(app)
			.get('/me')
			.set('Authorization', `Bearer ${token}`)

		expect(res.status).toBe(401)
		expect(res.body).toEqual({ message: 'Token invalide ou expiré' })
	})

	test('GET /me 401 si token expiré', async () => {
		const token = jwt.sign({ id: 1, email: 'a@b.c' }, SECRET, {
			algorithm: 'HS256',
			expiresIn: '-1s',
		})

		const res = await request(app)
			.get('/me')
			.set('Authorization', `Bearer ${token}`)

		expect(res.status).toBe(401)
		expect(res.body).toEqual({ message: 'Token invalide ou expiré' })
	})

	test('GET /me 401 si payload sans id', async () => {
		const token = jwt.sign({ email: 'noid@b.c' }, SECRET, {
			algorithm: 'HS256',
			expiresIn: '1h',
		})

		const res = await request(app)
			.get('/me')
			.set('Authorization', `Bearer ${token}`)

		expect(res.status).toBe(401)
		expect(res.body).toEqual({ message: 'ID manquant dans le token' })
	})

	test('GET /me 401 si algorithme non autorisé (HS512 au lieu de HS256)', async () => {
		const token = jwt.sign({ id: 1, email: 'a@b.c' }, SECRET, {
			algorithm: 'HS512',
			expiresIn: '1h',
		})

		const res = await request(app)
			.get('/me')
			.set('Authorization', `Bearer ${token}`)

		expect(res.status).toBe(401)
	})
})
