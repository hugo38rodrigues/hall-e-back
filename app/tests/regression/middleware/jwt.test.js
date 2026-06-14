/**
 * Tests de régression - Jwt
 * --------------------------
 * Verrouille des comportements précis qui ont historiquement
 * été source de bugs ou qui sont critiques pour la sécurité.
 *
 * NE JAMAIS supprimer un test sans comprendre l'invariant qu'il protège.
 */

import express from 'express'
import jwt from 'jsonwebtoken'
import request from 'supertest'
import {
	beforeEach,
	describe,
	expect,
	test,
	vi,
} from 'vitest'

import { resetAllMocks } from '../../utils/setup.js'

const { logger } = await import('../../../utils/logger.js')

const SECRET = 'regression-secret'
process.env.SECRET_JWT_KEY = SECRET

const { Jwt } = await vi.importActual('../../../middleware/jwt.js')

describe('Régression - Jwt', () => {
	let auth
	let app

	beforeEach(() => {
		resetAllMocks()
		auth = new Jwt()
		app = express()
		app.use(express.json())
		app.get('/protected', auth.validationTokenAccess, (req, res) => {
			res.status(200).json({ id: req.user.id })
		})
	})

	// REG-001 ----------------------------------------------------
	test('REG-001 : refuse "none" comme algorithme (attaque alg=none)', async () => {
		const header = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' }))
			.toString('base64url')
		const payload = Buffer.from(JSON.stringify({ id: 999 }))
			.toString('base64url')
		const malicious = `${header}.${payload}.`

		const res = await request(app)
			.get('/protected')
			.set('Authorization', `Bearer ${malicious}`)

		expect(res.status).toBe(401)
	})

	// REG-002 ----------------------------------------------------
	test('REG-002 : refuse les tokens signés avec un algorithme autre que HS256', async () => {
		const token = jwt.sign({ id: 1 }, SECRET, { algorithm: 'HS384' })

		const res = await request(app)
			.get('/protected')
			.set('Authorization', `Bearer ${token}`)

		expect(res.status).toBe(401)
	})

	// REG-003 ----------------------------------------------------
	test('REG-003 : le préfixe "Bearer" est sensible à la casse', async () => {
		const token = jwt.sign({ id: 1 }, SECRET, { algorithm: 'HS256' })

		const res = await request(app)
			.get('/protected')
			.set('Authorization', `bearer ${token}`)

		expect(res.status).toBe(401)
	})

	// REG-004 ----------------------------------------------------
	test('REG-004 : un token avec id=0 (falsy) est refusé', async () => {
		const token = jwt.sign({ id: 0, email: 'a@b.c' }, SECRET, {
			algorithm: 'HS256',
		})

		const res = await request(app)
			.get('/protected')
			.set('Authorization', `Bearer ${token}`)

		expect(res.status).toBe(401)
		expect(res.body).toEqual({ message: 'ID manquant dans le token' })
	})

	// REG-005 ----------------------------------------------------
	test('REG-005 : un Authorization avec uniquement "Bearer" (sans token) renvoie 401', async () => {
		const res = await request(app)
			.get('/protected')
			.set('Authorization', 'Bearer')

		expect(res.status).toBe(401)
		expect(res.body).toEqual({ message: 'Token manquant ou invalide' })
	})

	// REG-006 ----------------------------------------------------
	test('REG-006 : espaces autour du token sont ignorés (trim)', async () => {
		const token = jwt.sign({ id: 5 }, SECRET, { algorithm: 'HS256' })

		const res = await request(app)
			.get('/protected')
			.set('Authorization', `Bearer    ${token}   `)

		expect(res.status).toBe(200)
		expect(res.body.id).toBe(5)
	})

	// REG-007 ----------------------------------------------------
	test('REG-007 : le secret n\'apparait jamais dans la réponse en cas d\'erreur', async () => {
		const res = await request(app)
			.get('/protected')
			.set('Authorization', 'Bearer total.garbage.token')

		expect(res.status).toBe(401)
		expect(JSON.stringify(res.body)).not.toContain(SECRET)
	})

	// REG-008 ----------------------------------------------------
	test('REG-008 : getIdFromAuthHeader ne throw jamais, même avec entrée invalide', () => {
		expect(() => auth.getIdFromAuthHeader(undefined)).not.toThrow()
		expect(() => auth.getIdFromAuthHeader(null)).not.toThrow()
		expect(() => auth.getIdFromAuthHeader('')).not.toThrow()
		expect(() => auth.getIdFromAuthHeader('Bearer x')).not.toThrow()
		expect(() => auth.getIdFromAuthHeader('Bearer x.y.z')).not.toThrow()
	})

	// REG-009 ----------------------------------------------------
	test('REG-009 : tokenCreation expire bien en 1h (pas en 1 minute ni 1 jour)', () => {
		const before = Math.floor(Date.now() / 1000)
		const token = auth.tokenCreation(1, 'a@b.c')
		const decoded = jwt.verify(token, SECRET)

		const lifetime = decoded.exp - before
		expect(lifetime).toBeGreaterThanOrEqual(3595)
		expect(lifetime).toBeLessThanOrEqual(3605)
	})

	// REG-010 ----------------------------------------------------
	test('REG-010 : un échec de vérification est loggé via logger.error', async () => {
		await request(app)
			.get('/protected')
			.set('Authorization', 'Bearer mal.formed.token')

		expect(logger.error).toHaveBeenCalled()
	})
})
