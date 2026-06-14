/**
 * Tests unitaires - resetPassword
 * -------------------------------
 * Couvre :
 *  - 401 si nouveau mot de passe invalide
 *  - 401 si user introuvable
 *  - 401 si updateUser retourne une erreur
 *  - 200 si OK
 */

import {
	beforeEach,
	describe,
	expect,
	test,
} from 'vitest'
import {
	buildReqRes,
	dbMocks,
	resetAllMocks,
	utilsMocks,
} from '../../../utils/setup.js'

const { CommunController } = await import('../../../../controllers/commun.controller.js')

describe('CommunController.resetPassword', () => {
	let controller; let req; let
		res

	beforeEach(() => {
		resetAllMocks()
		controller = new CommunController();
		({ req, res } = buildReqRes({
			body: { newPassword: 'newlongpass', id: 5 },
		}))
	})

	test('401 si le nouveau mot de passe est invalide', async () => {
		req.body.newPassword = 'aze' // < 8 chars

		await controller.resetPassword(req, res)

		expect(res.status).toHaveBeenCalledWith(401)
		expect(res.json).toHaveBeenCalledWith({ message: 'Mot de passe invalide' })
	})

	test('401 si user introuvable', async () => {
		dbMocks.getUserById.mockResolvedValue(null)

		await controller.resetPassword(req, res)

		expect(res.status).toHaveBeenCalledWith(401)
		expect(res.json).toHaveBeenCalledWith({ message: 'Utilisateur introuvable' })
	})

	test('401 si updateUser renvoie une erreur', async () => {
		dbMocks.getUserById.mockResolvedValue({ id: 5, role: 'client' })
		dbMocks.updateUser.mockResolvedValue({
			isError: true,
			errorMessage: 'Conflit',
		})

		await controller.resetPassword(req, res)

		expect(res.status).toHaveBeenCalledWith(401)
		expect(res.json).toHaveBeenCalledWith({ message: 'Conflit' })
	})

	test('200 quand reset OK + nouveau mdp encrypté', async () => {
		dbMocks.getUserById.mockResolvedValue({ id: 5, role: 'client' })
		dbMocks.updateUser.mockResolvedValue({ isError: false })

		await controller.resetPassword(req, res)

		expect(utilsMocks.passwordEncrypt).toHaveBeenCalledWith('newlongpass')
		expect(dbMocks.updateUser).toHaveBeenCalledWith(5, {
			role: 'client',
			password: 'hashed:newlongpass',
		})
		expect(res.status).toHaveBeenCalledWith(200)
		expect(res.json).toHaveBeenCalledWith({
			message: 'Mot de passe changé avec succès',
		})
	})
})
