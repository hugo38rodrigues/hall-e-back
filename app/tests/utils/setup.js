/* eslint-disable max-classes-per-file */
/**
 * Setup commun - Vitest
 * ---------------------
 * Centralise tous les mocks utilisés par les test CommunController, FavorisController .
 *
 * Usage dans un fichier de test :
 *
 *   import './setup.js'  // active tous les mocks
 *   import { dbMocks, utilsMocks } from './setup.js'
 *
 *   // dbMocks contient les vi.fn() de chaque méthode DB
 *   dbMocks.getUserByEmail.mockResolvedValue({ ... })
 *
 *   // utilsMocks contient les vi.fn() des utils
 *   utilsMocks.passwordEncrypt.mockReturnValue('hashed')
 *
 * NB : `vi.mock` est hoisté en haut de chaque fichier qui l'importe,
 * donc ce setup doit être importé AVANT le contrôleur lui-même.
 */

import { vi } from 'vitest'

process.env.SECRET_JWT_KEY = 'test-secret-key'
// ============================================================
// MOCKS - Base de données (@hugo38rodrigues/bdd-service-hall-e)
// ============================================================
export const dbMocks = {
	// Méthodes user()
	getUserByEmail: vi.fn(),
	getProfileUser: vi.fn(),
	getMatches: vi.fn(),
	getAllFilters: vi.fn(),
	getBars: vi.fn(),
	getProgrammedMatches: vi.fn(),
	addClient: vi.fn(),
	addBar: vi.fn(),
	addCodeNumber: vi.fn(),
	getCodeByNumber: vi.fn(),
	updateUser: vi.fn(),
	deleteBar: vi.fn(),
	deleteClient: vi.fn(),
	getUserById: vi.fn(),
	addFavoriteGame: vi.fn(),
	removeFavoriteGame: vi.fn(),
	addFavoriteLeague: vi.fn(),
	removeFavoriteLeague: vi.fn(),
	addFavoriteTeam: vi.fn(),
	removeFavoriteTeam: vi.fn(),
	addFavoriteBar: vi.fn(),
	removeFavoriteBar: vi.fn(),
	barAddFavoriteGame: vi.fn(),
	barRemoveFavoriteGame: vi.fn(),
	barAddFavoriteLeague: vi.fn(),
	barRemoveFavoriteLeague: vi.fn(),
	barAddFavoriteTeam: vi.fn(),
	getMatchById: vi.fn(),
	deleteProgMatch: vi.fn(),
	barRemoveFavoriteTeam: vi.fn(),
	addProgrammedMatch: vi.fn(),
}

vi.mock('@hugo38rodrigues/bdd-service-hall-e/main.js', () => ({
	db: {
		user: vi.fn(async () => ({
			getUserByEmail: dbMocks.getUserByEmail,
			getUserById: dbMocks.getUserById,
			getProfileUser: dbMocks.getProfileUser,
			getMatches: dbMocks.getMatches,
			getAllFilters: dbMocks.getAllFilters,
			getBars: dbMocks.getBars,
			addClient: dbMocks.addClient,
			addBar: dbMocks.addBar,
			addCodeNumber: dbMocks.addCodeNumber,
			getCodeByNumber: dbMocks.getCodeByNumber,
			updateUser: dbMocks.updateUser,
			getMatchById: dbMocks.getMatchById,
		})),
		client: vi.fn(async () => ({
			addFavoriteGame: dbMocks.addFavoriteGame,
			removeFavoriteGame: dbMocks.removeFavoriteGame,
			addFavoriteLeague: dbMocks.addFavoriteLeague,
			removeFavoriteLeague: dbMocks.removeFavoriteLeague,
			addFavoriteTeam: dbMocks.addFavoriteTeam,
			removeFavoriteTeam: dbMocks.removeFavoriteTeam,
			addFavoriteBar: dbMocks.addFavoriteBar,
			removeFavoriteBar: dbMocks.removeFavoriteBar,
			deleteClient: dbMocks.deleteClient,
		})),
		bar: vi.fn(async () => ({
			getProgrammedMatches: dbMocks.getProgrammedMatches,
			addFavoriteGame: dbMocks.barAddFavoriteGame,
			addProgrammedMatch: dbMocks.addProgrammedMatch,
			removeFavoriteGame: dbMocks.barRemoveFavoriteGame,
			addFavoriteLeague: dbMocks.barAddFavoriteLeague,
			removeFavoriteLeague: dbMocks.barRemoveFavoriteLeague,
			addFavoriteTeam: dbMocks.barAddFavoriteTeam,
			removeFavoriteTeam: dbMocks.barRemoveFavoriteTeam,
			deleteBar: dbMocks.deleteBar,
			deleteProgMatch: dbMocks.deleteProgMatch,
		})),
	},
}))

// ============================================================
// MOCKS - Utils
// ============================================================
export const utilsMocks = {
	// encryption
	passwordEncrypt: vi.fn((p) => `hashed:${p}`),
	verifyPassword: vi.fn(),
	// email
	sendEmailResetPassword: vi.fn(),
	// map
	getCoordinatesFromAddress: vi.fn(async () => ({ latitude: 45.75, longitude: 4.85 })),
	// code-generation
	generetedCode: vi.fn(() => ({ codeNumber: 123456, expiresIn: Date.now() + 600000 })),
	// match-tools
	computeAdditionalHours: vi.fn(() => 120),
	// Jwt
	tokenCreation: vi.fn(async () => 'fake.jwt.token'),
	getIdInToken: vi.fn(() => 1),
	validationTokenAccess: vi.fn(),
	getIdFromAuthHeader: vi.fn(),
}

vi.mock('../../utils/encryption.js', () => ({
	passwordEncrypt: (...args) => utilsMocks.passwordEncrypt(...args),
	verifyPassword: (...args) => utilsMocks.verifyPassword(...args),
}))

vi.mock('../../middleware/jwt.js', () => ({
	Jwt: class {
		getIdFromAuthHeader = (...args) => utilsMocks.getIdInToken(...args)

		tokenCreation = (...args) => utilsMocks.tokenCreation(...args)

		validationTokenAccess = (...args) => utilsMocks.validationTokenAccess(...args)
	},
}))

vi.mock('../../utils/email.js', () => ({
	sendEmailResetPassword: (...args) => utilsMocks.sendEmailResetPassword(...args),
}))

vi.mock('../../utils/map.js', () => ({
	getCoordinatesFromAddress: (...args) => utilsMocks.getCoordinatesFromAddress(...args),
}))

vi.mock('../../utils/code-generation.js', () => ({
	generetedCode: (...args) => utilsMocks.generetedCode(...args),
}))

vi.mock('../../utils/match-tools.js', () => ({
	computeAdditionalHours: (...args) => utilsMocks.computeAdditionalHours(...args),
}))

vi.mock('../../utils/constants.js', () => ({
	ERROR_SERVER: 'Erreur serveur',
}))

// Regex : on garde les vraies regex (utilitaire pur), mais on peut
// les surcharger par test si besoin.
vi.mock('../../utils/regex.js', () => ({
	IS_EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
	IS_PASSWORD: /^.{8,}$/,
	IS_STRING: /^[A-Za-zÀ-ÿ\-' ]{1,}$/,
	IS_ADDRESS: /^.{3,}$/,
	IS_BAR_NAME: /^.{2,}$/,
	IS_DESCRIPTION: /^.{5,}$/,
	IS_CODE_NUMBER: /^\d{6}$/,
	IS_ID: /^\d+$/,
}))

export const loggerMock = {
	info: vi.fn(),
	error: vi.fn(),
	warn: vi.fn(),
}
vi.mock('../../utils/logger.js', () => ({
	logger: loggerMock,
}))

// ============================================================
// HELPERS
// ============================================================

/**
 * Reset tous les mocks. À appeler dans `beforeEach`.
 */
export const resetAllMocks = () => {
	Object.values(dbMocks).forEach((fn) => fn.mockReset())
	Object.values(utilsMocks).forEach((fn) => fn.mockReset())
	// Restaurer quelques implémentations par défaut
	utilsMocks.passwordEncrypt.mockImplementation((p) => `hashed:${p}`)
	utilsMocks.getCoordinatesFromAddress.mockResolvedValue({ latitude: 45.75, longitude: 4.85 })
	utilsMocks.generetedCode.mockReturnValue({ codeNumber: 123456, expiresIn: Date.now() + 600000 })
	utilsMocks.computeAdditionalHours.mockReturnValue(120)
	utilsMocks.tokenCreation.mockResolvedValue('fake.jwt.token')
	utilsMocks.getIdInToken.mockReturnValue(1)
	loggerMock.info.mockReset()
	loggerMock.error.mockReset()
	loggerMock.warn.mockReset()
}

/**
 * Crée des objets req/res Express factices.
 */
export const buildReqRes = (reqOverrides = {}) => {
	const req = {
		body: {},
		params: {},
		headers: {},
		...reqOverrides,
	}
	const res = {
		status: vi.fn().mockReturnThis(),
		json: vi.fn().mockReturnThis(),
		send: vi.fn().mockReturnThis(),
		header: vi.fn().mockReturnThis(),
		sendStatus: vi.fn().mockReturnThis(), // ← ajouté
		end: vi.fn().mockReturnThis(),
	}
	return { req, res }
}

export const mockUser = (role) => ({
	id: 1,
	role,
	dataValues: { id: 1, role },
})
