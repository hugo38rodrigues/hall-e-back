/**
 * Tests unitaires - getProfil
 * ---------------------------
 * Couvre :
 *  - récupération de l'id depuis le token
 *  - 404 si user inconnu
 *  - succès 200 avec profil formaté
 *  - exceptions 500
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

describe('CommunController.getProfil', () => {
	let controller; let req; let
		res

	beforeEach(() => {
		resetAllMocks()
		controller = new CommunController();
		({ req, res } = buildReqRes({
			headers: { authorization: 'Bearer fake.jwt.token' },
		}))
	})

	test('200 avec profil formaté (client)', async () => {
		utilsMocks.getIdInToken.mockReturnValue(42)
		dbMocks.getUserById.mockResolvedValue({
			id: 42,
			dataValues: { email: 'john@doe.com' },
		})
		dbMocks.getProfileUser.mockResolvedValue({
			dataValues: {
				id: 42,
				email: 'john@doe.com',
				role: 'client',
				first_name: 'John',
				last_name: 'Doe',
				likeBar: false,
				favoris: [],
				programmedMatches: [],
			},
		})

		await controller.getProfil(req, res)

		expect(utilsMocks.getIdInToken).toHaveBeenCalledWith('Bearer fake.jwt.token')
		expect(res.status).toHaveBeenCalledWith(200)
		const payload = res.json.mock.calls[0][0]
		expect(payload).toMatchObject({
			id: 42,
			email: 'john@doe.com',
			role: 'client',
			informations: { firstName: 'John', lastName: 'Doe' },
		})
	})

	test('404 si user introuvable', async () => {
		dbMocks.getUserById.mockResolvedValue(undefined)

		await controller.getProfil(req, res)

		expect(res.status).toHaveBeenCalledWith(404)
		expect(res.json).toHaveBeenCalledWith({
			message: 'Erreur lors de la récupération du profile',
		})
	})

	test('500 si la DB lève', async () => {
		dbMocks.getUserById.mockRejectedValue(new Error('DB down'))

		await controller.getProfil(req, res)

		expect(res.status).toHaveBeenCalledWith(500)
	})

	test('500 si le décodage du token lève', async () => {
		utilsMocks.getIdInToken.mockImplementation(() => {
			throw new Error('Token invalide')
		})

		await controller.getProfil(req, res)

		expect(res.status).toHaveBeenCalledWith(500)
	})
})
