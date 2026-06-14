/**
 * Tests d'intégration - RoleValidation
 */

import express from 'express'
import request from 'supertest'
import {
	beforeEach,
	describe,
	expect,
	test,
	vi,
} from 'vitest'

import { dbMocks, resetAllMocks } from '../../utils/setup.js'

const { RoleValidation } = await import('../../../middleware/RoleValidation.js')

const fakeAuth = (userId) => (req, _res, next) => {
	req.user = { id: userId }
	next()
}

const buildApp = (userId) => {
	const app = express()
	app.use(express.json())
	const roles = new RoleValidation()

	app.get(
		'/client-or-bar',
		fakeAuth(userId),
		roles.requireClientOrBar,
		(req, res) => res.status(200).json({ profil: req.profil }),
	)
	app.get(
		'/bar-only',
		fakeAuth(userId),
		roles.requireRole('bar'),
		(req, res) => res.status(200).json({ profil: req.profil }),
	)
	app.get(
		'/client-only',
		fakeAuth(userId),
		roles.requireRole('client'),
		(req, res) => res.status(200).json({ profil: req.profil }),
	)
	app.get(
		'/admin-only',
		fakeAuth(userId),
		roles.requireRole('admin'),
		(req, res) => res.status(200).json({ profil: req.profil }),
	)

	return app
}

describe('Intégration HTTP - RoleValidation', () => {
	beforeEach(() => {
		resetAllMocks()
	})

	describe('GET /client-or-bar', () => {
		test('200 pour un client', async () => {
			dbMocks.getUserById.mockResolvedValue({ id: 1, role: 'client', name: 'Alice' })
			const res = await request(buildApp(1)).get('/client-or-bar')

			expect(res.status).toBe(200)
			expect(res.body.profil).toEqual({ id: 1, role: 'client', name: 'Alice' })
		})

		test('200 pour un bar', async () => {
			dbMocks.getUserById.mockResolvedValue({ id: 2, role: 'bar' })
			const res = await request(buildApp(2)).get('/client-or-bar')

			expect(res.status).toBe(200)
			expect(res.body.profil.role).toBe('bar')
		})

		test('404 si profil null', async () => {
			dbMocks.getUserById.mockResolvedValue(null)
			const res = await request(buildApp(99)).get('/client-or-bar')

			expect(res.status).toBe(404)
			expect(res.body).toEqual({ message: 'Utilisateur introuvable' })
		})

		test('403 pour un admin', async () => {
			dbMocks.getUserById.mockResolvedValue({ id: 3, role: 'admin' })
			const res = await request(buildApp(3)).get('/client-or-bar')

			expect(res.status).toBe(403)
			expect(res.body).toEqual({ message: 'Accès refusé : rôle non autorisé' })
		})

		test('500 si la DB throw', async () => {
			dbMocks.getUserById.mockRejectedValue(new Error('db crash'))
			const res = await request(buildApp(1)).get('/client-or-bar')

			expect(res.status).toBe(500)
			expect(res.body).toEqual({ message: 'Erreur interne' })
		})
	})

	describe('GET /bar-only', () => {
		test('200 pour un bar', async () => {
			dbMocks.getUserById.mockResolvedValue({ id: 5, role: 'bar' })
			const res = await request(buildApp(5)).get('/bar-only')

			expect(res.status).toBe(200)
			expect(res.body.profil.role).toBe('bar')
		})

		test('403 pour un client', async () => {
			dbMocks.getUserById.mockResolvedValue({ id: 6, role: 'client' })
			const res = await request(buildApp(6)).get('/bar-only')

			expect(res.status).toBe(403)
		})

		test('404 si profil null', async () => {
			dbMocks.getUserById.mockResolvedValue(null)
			const res = await request(buildApp(999)).get('/bar-only')

			expect(res.status).toBe(404)
		})
	})

	describe('GET /client-only', () => {
		test('200 pour un client', async () => {
			dbMocks.getUserById.mockResolvedValue({ id: 8, role: 'client' })
			const res = await request(buildApp(8)).get('/client-only')

			expect(res.status).toBe(200)
		})

		test('403 pour un bar', async () => {
			dbMocks.getUserById.mockResolvedValue({ id: 9, role: 'bar' })
			const res = await request(buildApp(9)).get('/client-only')

			expect(res.status).toBe(403)
		})
	})

	describe('GET /admin-only', () => {
		test('200 pour un admin', async () => {
			dbMocks.getUserById.mockResolvedValue({ id: 10, role: 'admin' })
			const res = await request(buildApp(10)).get('/admin-only')

			expect(res.status).toBe(200)
		})

		test('403 pour un client', async () => {
			dbMocks.getUserById.mockResolvedValue({ id: 11, role: 'client' })
			const res = await request(buildApp(11)).get('/admin-only')

			expect(res.status).toBe(403)
		})
	})

	test('un refus n\'atteint jamais le handler final', async () => {
		dbMocks.getUserById.mockResolvedValue({ id: 1, role: 'admin' })
		const app = express()
		const roles = new RoleValidation()
		const finalHandler = vi.fn((req, res) => res.status(200).send('OK'))

		app.get('/x', fakeAuth(1), roles.requireClientOrBar, finalHandler)

		const res = await request(app).get('/x')

		expect(res.status).toBe(403)
		expect(finalHandler).not.toHaveBeenCalled()
	})
})
