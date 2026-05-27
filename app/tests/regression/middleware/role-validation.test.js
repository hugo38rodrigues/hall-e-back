/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
/**
 * Tests de régression - RoleValidation
 * NE JAMAIS supprimer un test sans comprendre l'invariant qu'il garantit.
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

import { buildReqRes, dbMocks, resetAllMocks } from '../../utils/setup.js'

const { RoleValidation } = await import('../../../middleware/RoleValidation.js')
const { logger } = await import('../../../utils/logger.js')

const fakeAuth = (userId) => (req, _res, next) => {
	req.user = { id: userId }
	next()
}

const buildCtx = (userId = 1) => {
	const { req, res } = buildReqRes({ user: { id: userId } })
	const next = vi.fn()
	return { req, res, next }
}

describe('Régression - RoleValidation', () => {
	let validator

	beforeEach(() => {
		resetAllMocks()
		validator = new RoleValidation()
	})

	// REG-001 ----------------------------------------------------
	test('REG-001 : un rôle "admin" ne passe JAMAIS requireClientOrBar', async () => {
		dbMocks.getUserById.mockResolvedValue({ id: 1, role: 'admin' })
		const { req, res, next } = buildCtx(1)

		await validator.requireClientOrBar(req, res, next)

		expect(res.status).toHaveBeenCalledWith(403)
		expect(next).not.toHaveBeenCalled()
	})

	// REG-002 ----------------------------------------------------
	test('REG-002 : comparaison de rôle case-sensitive', async () => {
		dbMocks.getUserById.mockResolvedValue({ id: 1, role: 'BAR' })
		const { req, res, next } = buildCtx(1)

		await validator.requireRole('bar')(req, res, next)

		expect(res.status).toHaveBeenCalledWith(403)
		expect(next).not.toHaveBeenCalled()
	})

	// REG-003 ----------------------------------------------------
	test('REG-003 : profil sans champ "role" → 403 (pas 500)', async () => {
		dbMocks.getUserById.mockResolvedValue({ id: 1 })
		const { req, res, next } = buildCtx(1)

		await validator.requireClientOrBar(req, res, next)

		expect(res.status).toHaveBeenCalledWith(403)
		expect(next).not.toHaveBeenCalled()
	})

	// REG-004 ----------------------------------------------------
	test('REG-004 : profil null → 404, pas 403, pas 500', async () => {
		dbMocks.getUserById.mockResolvedValue(null)
		const { req, res, next } = buildCtx(1)

		await validator.requireRole('client')(req, res, next)

		expect(res.status).toHaveBeenCalledWith(404)
		expect(res.status).not.toHaveBeenCalledWith(403)
		expect(res.status).not.toHaveBeenCalledWith(500)
	})

	// REG-005 ----------------------------------------------------
	test('REG-005 : exception DB → 500 et le message d\'erreur n\'est pas leaké', async () => {
		dbMocks.getUserById.mockRejectedValue(
			new Error('Connection: postgres://user:secret@db:5432'),
		)
		const { req, res, next } = buildCtx(1)

		await validator.requireClientOrBar(req, res, next)

		expect(res.status).toHaveBeenCalledWith(500)
		const body = res.json.mock.calls[0][0]
		expect(body).toEqual({ message: 'Erreur interne' })
		expect(JSON.stringify(body)).not.toContain('postgres')
		expect(JSON.stringify(body)).not.toContain('secret')
	})

	// REG-006 ----------------------------------------------------
	test('REG-006 : next() n\'est JAMAIS appelé en cas d\'erreur ou de refus', async () => {
		const scenarios = [
			{ resolved: null, label: 'profil null' },
			{ resolved: { id: 1, role: 'admin' }, label: 'mauvais rôle' },
			{ rejected: new Error('x'), label: 'exception' },
		]

		// eslint-disable-next-line no-restricted-syntax
		for (const s of scenarios) {
			resetAllMocks()
			if (s.rejected) dbMocks.getUserById.mockRejectedValue(s.rejected)
			else dbMocks.getUserById.mockResolvedValue(s.resolved)

			const { req, res, next } = buildCtx(1)
			// eslint-disable-next-line no-await-in-loop
			await validator.requireClientOrBar(req, res, next)

			expect(next, `scénario "${s.label}"`).not.toHaveBeenCalled()
		}
	})

	// REG-007 ----------------------------------------------------
	test('REG-007 : req.profil n\'est PAS défini en cas de refus', async () => {
		dbMocks.getUserById.mockResolvedValue({ id: 1, role: 'admin' })
		const { req, res, next } = buildCtx(1)

		await validator.requireClientOrBar(req, res, next)

		expect(req.profil).toBeUndefined()
	})

	// REG-008 ----------------------------------------------------
	test('REG-008 : requireRole avec un rôle inconnu refuse tous les users', async () => {
		dbMocks.getUserById.mockResolvedValue({ id: 1, role: 'bar' })
		const { req, res, next } = buildCtx(1)

		await validator.requireRole('superadmin')(req, res, next)

		expect(res.status).toHaveBeenCalledWith(403)
		expect(next).not.toHaveBeenCalled()
	})

	// REG-009 ----------------------------------------------------
	test('REG-009 : intégration — l\'ordre des middlewares est respecté', async () => {
		dbMocks.getUserById.mockResolvedValue({ id: 1, role: 'client' })
		const roles = new RoleValidation()
		const app = express()
		app.get('/r', fakeAuth(1), roles.requireClientOrBar, (req, res) => {
			res.status(200).json({ ok: true, profilRole: req.profil.role })
		})

		const res = await request(app).get('/r')

		expect(res.status).toBe(200)
		expect(res.body.profilRole).toBe('client')
	})

	// REG-010 ----------------------------------------------------
	test('REG-010 : un échec est loggé via logger.error', async () => {
		dbMocks.getUserById.mockResolvedValue(null)
		const { req, res, next } = buildCtx(42)

		await validator.requireClientOrBar(req, res, next)

		expect(logger.error).toHaveBeenCalled()
		const loggedMessage = logger.error.mock.calls[0][0]
		expect(loggedMessage).toContain('42')
	})

	// REG-011 ----------------------------------------------------
	test('REG-011 : la liste blanche client/bar refuse tout autre rôle', async () => {
		const forbiddenRoles = ['admin', 'guest', 'anonymous', 'root', 'superuser', '', null]

		for (const role of forbiddenRoles) {
			resetAllMocks()
			dbMocks.getUserById.mockResolvedValue({ id: 1, role })
			const { req, res, next } = buildCtx(1)

			await validator.requireClientOrBar(req, res, next)

			expect(res.status, `rôle "${role}"`).toHaveBeenCalledWith(403)
			expect(next, `rôle "${role}"`).not.toHaveBeenCalled()
		}
	})
})
