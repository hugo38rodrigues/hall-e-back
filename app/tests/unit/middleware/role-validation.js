/**
 * Tests unitaires - RoleValidation
 */

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

const buildCtx = (userId = 1) => {
	const { req, res } = buildReqRes({ user: { id: userId } })
	const next = vi.fn()
	return { req, res, next }
}

describe('RoleValidation - unit', () => {
	let validator

	beforeEach(() => {
		resetAllMocks()
		validator = new RoleValidation()
	})

	describe('requireClientOrBar', () => {
		test('next() + req.profil pour un client', async () => {
			const profil = { id: 1, role: 'client' }
			dbMocks.getUserById.mockResolvedValue(profil)
			const { req, res, next } = buildCtx(1)

			await validator.requireClientOrBar(req, res, next)

			expect(dbMocks.getUserById).toHaveBeenCalledWith(1)
			expect(req.profil).toBe(profil)
			expect(next).toHaveBeenCalledTimes(1)
			expect(res.status).not.toHaveBeenCalled()
		})

		test('next() pour un bar', async () => {
			const profil = { id: 2, role: 'bar' }
			dbMocks.getUserById.mockResolvedValue(profil)
			const { req, res, next } = buildCtx(2)

			await validator.requireClientOrBar(req, res, next)

			expect(req.profil).toBe(profil)
			expect(next).toHaveBeenCalledTimes(1)
		})

		test('404 si profil introuvable', async () => {
			dbMocks.getUserById.mockResolvedValue(null)
			const { req, res, next } = buildCtx(99)

			await validator.requireClientOrBar(req, res, next)

			expect(res.status).toHaveBeenCalledWith(404)
			expect(res.json).toHaveBeenCalledWith({ message: 'Utilisateur introuvable' })
			expect(next).not.toHaveBeenCalled()
			expect(logger.error).toHaveBeenCalled()
		})

		test('403 si rôle non autorisé', async () => {
			dbMocks.getUserById.mockResolvedValue({ id: 3, role: 'admin' })
			const { req, res, next } = buildCtx(3)

			await validator.requireClientOrBar(req, res, next)

			expect(res.status).toHaveBeenCalledWith(403)
			expect(res.json).toHaveBeenCalledWith({ message: 'Accès refusé : rôle non autorisé' })
			expect(next).not.toHaveBeenCalled()
		})

		test('403 si profil sans role', async () => {
			dbMocks.getUserById.mockResolvedValue({ id: 4 })
			const { req, res, next } = buildCtx(4)

			await validator.requireClientOrBar(req, res, next)

			expect(res.status).toHaveBeenCalledWith(403)
			expect(next).not.toHaveBeenCalled()
		})

		test('500 si la DB throw', async () => {
			dbMocks.getUserById.mockRejectedValue(new Error('db down'))
			const { req, res, next } = buildCtx(1)

			await validator.requireClientOrBar(req, res, next)

			expect(res.status).toHaveBeenCalledWith(500)
			expect(res.json).toHaveBeenCalledWith({ message: 'Erreur interne' })
			expect(next).not.toHaveBeenCalled()
			expect(logger.error).toHaveBeenCalled()
		})
	})

	describe('requireRole', () => {
		test('retourne une fonction', () => {
			expect(typeof validator.requireRole('bar')).toBe('function')
		})

		test('next() + req.profil quand le rôle matche', async () => {
			const profil = { id: 7, role: 'bar' }
			dbMocks.getUserById.mockResolvedValue(profil)
			const { req, res, next } = buildCtx(7)

			await validator.requireRole('bar')(req, res, next)

			expect(req.profil).toBe(profil)
			expect(next).toHaveBeenCalledTimes(1)
			expect(res.status).not.toHaveBeenCalled()
		})

		test('404 si profil introuvable', async () => {
			dbMocks.getUserById.mockResolvedValue(null)
			const { req, res, next } = buildCtx(99)

			await validator.requireRole('client')(req, res, next)

			expect(res.status).toHaveBeenCalledWith(404)
			expect(res.json).toHaveBeenCalledWith({ message: 'Utilisateur introuvable' })
			expect(next).not.toHaveBeenCalled()
		})

		test('403 si rôle ne matche pas', async () => {
			dbMocks.getUserById.mockResolvedValue({ id: 7, role: 'client' })
			const { req, res, next } = buildCtx(7)

			await validator.requireRole('bar')(req, res, next)

			expect(res.status).toHaveBeenCalledWith(403)
			expect(res.json).toHaveBeenCalledWith({ message: 'Accès refusé : rôle non autorisé' })
			expect(next).not.toHaveBeenCalled()
		})

		test('comparaison stricte de la casse', async () => {
			dbMocks.getUserById.mockResolvedValue({ id: 7, role: 'Bar' })
			const { req, res, next } = buildCtx(7)

			await validator.requireRole('bar')(req, res, next)

			expect(res.status).toHaveBeenCalledWith(403)
			expect(next).not.toHaveBeenCalled()
		})

		test('500 si la DB throw', async () => {
			dbMocks.getUserById.mockRejectedValue(new Error('timeout'))
			const { req, res, next } = buildCtx(1)

			await validator.requireRole('client')(req, res, next)

			expect(res.status).toHaveBeenCalledWith(500)
			expect(next).not.toHaveBeenCalled()
		})

		test('chaque factory call retourne un middleware indépendant', async () => {
			dbMocks.getUserById.mockResolvedValue({ id: 1, role: 'client' })
			const mwBar = validator.requireRole('bar')
			const mwClient = validator.requireRole('client')

			expect(mwBar).not.toBe(mwClient)

			const a = buildCtx(1)
			const b = buildCtx(1)
			await mwBar(a.req, a.res, a.next)
			await mwClient(b.req, b.res, b.next)

			expect(a.next).not.toHaveBeenCalled()
			expect(b.next).toHaveBeenCalled()
		})
	})
})
