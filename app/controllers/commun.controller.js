/* eslint-disable no-underscore-dangle */
// eslint-disable-next-line import/no-extraneous-dependencies
import { db } from '@hugo38rodrigues/bdd-service-hall-e/main.js'

import { TokenService } from '../middleware/token-service.js'
import { generetedCode } from '../utils/code-generation.js'
import { ERROR_SERVER } from '../utils/constants.js'
import { sendEmailResetPassword } from '../utils/email.js'
import { PasswordHasher } from '../utils/hashing.js'
import { logger } from '../utils/logger.js'
import { getCoordinatesFromAddress } from '../utils/map.js'
import { computeAdditionalHours } from '../utils/match-tools.js'
import {
	IS_CODE_NUMBER,
	IS_ID,
} from '../utils/regex.js'

const withErrorHandler = (handler) => async (req, res) => {
	try {
		return await handler(req, res)
	} catch (error) {
		logger.error(error)
		return res.status(500).json({ message: ERROR_SERVER })
	}
}
const passwordHasher = new PasswordHasher()

// ============================================================
// Classe mère
// ============================================================

export class CommunController {
	#jwt = new TokenService()

	constructor({ validator }) {
		this.validator = validator
	}

	// --------------------------------------------------------
	// Helpers PROTÉGÉS (accessibles aux sous-classes via this._xxx)
	// --------------------------------------------------------

	_filterEmptyValues = (obj) => Object.fromEntries(
		Object.entries(obj).filter(([, value]) => value !== null && value !== ''),
	)

	_formatTeam = (team) => ({
		id: team.id,
		name: team.name,
		acronym: team.acronym,
		logoUrl: team.logo_url,
	})

	_formatProgrammedMatch = (match) => ({
		id: match.id,
		hypeScore: match.hype_score,
		streamPlatform: match.stream_platform,
		team1: match.team1,
		team2: match.team2,
		game: match.game,
		league: match.league,
		date: match.date,
	})

	_formatMatch = (match) => ({
		id: match.id,
		idMatch: match.id_match,
		date: match.date,
		numberOfGame: match.number_of_game,
		hypeScore: match.hype_score,
		streamPlatform: match.stream_platform,
		programmed: match.programmedBars.length === 0 ? null : match.programmedBars,
		team1: this._formatTeam(match.team1),
		team2: this._formatTeam(match.team2),
		league: match.league,
		game: match.game,
	})

	_formatDataBar = (bar) => ({
		id: bar.id,
		role: bar.role,
		informations: {
			name: bar.name,
			description: bar.description,
			address: bar.address,
			pictures: bar.pictures,
		},
		programations: bar.programmedMatches.length > 0
			? bar.programmedMatches.map((m) => this._formatProgrammedMatch(m))
			: null,
		userLocation: { longitude: bar.longitude, latitude: bar.latitude },
	})

	_filterActiveMatches = (data) => {
		const now = new Date()
		return data.map((bar) => {
			const programmedMatches = bar.programmedMatches.filter((match) => {
				if (!match.id) return false
				const matchDate = new Date(match.date)
				const durationInMinutes = computeAdditionalHours(match.game.name, match.numberOfGame)
				const matchEndTime = new Date(matchDate.getTime() + durationInMinutes * 60 * 1000)
				return matchEndTime >= now
			})
			return { ...bar, programmedMatches }
		})
	}

	_generateProfile = (data) => {
		const isBar = data.role === 'bar'

		const informations = isBar
			? {
				name: data.name,
				address: data.address,
				price: data.price ?? null,
				description: data.description ?? null,
				pictures: data.pictures ?? null,
			}
			: {
				firstName: data.first_name,
				lastName: data.last_name,
				likeBar: data.likeBar ?? null,
			}

		const favoris = data.favoris ?? []
		const favorites = favoris.length === 0 ? null : {
			games: favoris.flatMap((f) => f.games ?? []).map((g) => ({ id: g.id, name: g.name })),
			leagues: favoris.flatMap((f) => f.leagues ?? []).map((l) => ({ id: l.id, name: l.name })),
			teams: favoris.flatMap((f) => f.teams ?? [])
				.map((t) => ({ id: t.id, name: t.name, acronym: t.acronym })),
			barName: !isBar
				? favoris.flatMap((f) => f.barNames ?? []).map((b) => ({ id: b.id, name: b.name }))
				: [],
		}

		const base = {
			id: data.id,
			email: data.email,
			role: data.role,
			favorites,
			informations,
		}

		if (!isBar) return base

		return {
			...base,
			programmedMatches: data.programmedMatches
				? data.programmedMatches.map((m) => this._formatProgrammedMatch(m.dataValues))
				: null,
			userLocation: {
				longitude: parseFloat(data.longitude),
				latitude: parseFloat(data.latitude),
			},
		}
	}

	_buildNewBarProfile = async (data) => {
		const { latitude, longitude } = await getCoordinatesFromAddress(data.informations.address)
		return {
			role: data.role,
			email: data.email,
			name: data.informations.name,
			password: await passwordHasher.hash(data.password),
			address: data.informations.address,
			price: data.informations.price,
			description: data.informations.description,
			pictures: data.informations.pictures,
			latitude,
			longitude,
		}
	}

	_buildNewClientProfile = async (data) => ({
		email: data.email,
		password: await passwordHasher.hash(data.password),
		role: data.role,
		firstName: data.informations.firstName,
		lastName: data.informations.lastName,
	})

	// --------------------------------------------------------
	// Endpoints (méthodes publiques)
	// --------------------------------------------------------

	createAccount = withErrorHandler(async (req, res) => {
		const data = req.body
		let profil

		if (data.role === 'client') {
			const err = this.validator.validateClient(data)
			if (err) return res.status(401).json({ message: err.message })
			profil = this._buildNewClientProfile(data)
		} else if (data.role === 'bar') {
			const err = this.validator.validateBar(data)
			if (err) return res.status(401).json({ message: err.message })
			profil = await this._buildNewBarProfile(data)
		} else {
			return res.status(404).json({ message: 'Le role est inconnu' })
		}

		const userInstance = await db.user()
		const userDb = await userInstance.getUserByEmail(profil.email)

		if (userDb !== null) {
			logger.error(`user exist: ${profil.email}`)
			return res.status(401).json({ message: 'L\'utilisateur existe déjà' })
		}

		if (profil.role === 'client') {
			await userInstance.addClient(profil)
		} else {
			await userInstance.addBar(profil)
		}

		logger.info(`user insert successful ${profil.email}`)
		return res.status(201).json({ message: 'Inscription réussis' })
	})

	connexion = withErrorHandler(async (req, res) => {
		const { email, password } = req.body
		const userInstance = await db.user()
		const userDb = await userInstance.getUserByEmail(email)

		if (userDb === undefined) {
			logger.error('email is not valid')
			return res.status(401).json({ message: 'L\'email ou le mot de passe sont invalide' })
		}
		if (userDb === null) {
			logger.error('email is not valid')
			return res.status(401).json({ message: 'Le compte n\'existe pas' })
		}

		const passwordMatch = await passwordHasher.verifyPassword(password, userDb.dataValues.password)
		if (!passwordMatch) {
			logger.error('password is not valid')
			return res.status(401).json({ message: 'L\'email ou le mot de passe sont invalide' })
		}

		const token = await this.#jwt.tokenCreation(userDb.id, userDb.password)
		return res.header('Authorization', token).status(200).send({ message: 'Connexion réussie' })
	})

	getProfil = withErrorHandler(async (req, res) => {
		const token = req.headers.authorization
		const id = this.#jwt.getIdFromAuthHeader(token)
		const userInstance = await db.user()
		const userDb = await userInstance.getUserById(id)

		if (userDb === undefined) {
			return res.status(404).json({ message: 'Erreur lors de la récupération du profile' })
		}

		const profile = await userInstance.getProfileUser(userDb.dataValues.email)
		return res.status(200).json(this._generateProfile(profile.dataValues))
	})

	forgotPassword = withErrorHandler(async (req, res) => {
		const { email } = req.body

		if (!this.validator.isValidEmail(email)) {
			logger.error('Error email')
			return res.status(401).json({ errorEmailMessage: 'Email pas au bon format' })
		}

		const userInstance = await db.user()
		const userDb = await userInstance.getProfileUser(email)

		if (!userDb) return res.sendStatus(204)

		const { codeNumber, expiresIn } = generetedCode()
		const code = await userInstance.addCodeNumber(codeNumber, expiresIn, userDb.dataValues.id)
		await sendEmailResetPassword(email, code)

		const token = await this.#jwt.tokenCreation(userDb.id, userDb.password)
		return res.header('Authorization', token).status(200).send({ id: userDb.id })
	})

	verifyCode = withErrorHandler(async (req, res) => {
		const { userId, code } = req.body

		if (!IS_CODE_NUMBER.test(parseInt(code, 10))) {
			logger.error('Is not a good code')
			return res.status(401).json({ message: 'Ce n\'est pas le bon code' })
		}

		const userInstance = await db.user()
		const user = await userInstance.getUserById(userId)

		if (!user) {
			logger.error('Unknwo user id')
			return res.status(404).json({ message: 'Un problème est survenue' })
		}

		const storedCode = await userInstance.getCodeByNumber(code)

		if (!storedCode) {
			logger.error('invalid code')
			return res.status(400).json({ message: 'Code invalide' })
		}
		if (Date.now() > storedCode.expiresIn) {
			logger.error('request expired')
			return res.status(400).json({ message: 'Demande expiré' })
		}
		return res.status(200).json({ id: user.id })
	})

	resetPassword = withErrorHandler(async (req, res) => {
		const { newPassword, id } = req.body

		const { isValidPassword, errorPasswordMessage } = this.validator.isValidEmail(newPassword)
		if (!isValidPassword) {
			logger.error(errorPasswordMessage)
			return res.status(401).json({ message: errorPasswordMessage })
		}

		const userInstance = await db.user()
		const userInDb = await userInstance.getUserById(id)

		if (!userInDb) {
			logger.error('user not exist')
			return res.status(401).json({ message: 'Utilisateur introuvable' })
		}

		const resource = {
			role: userInDb.role,
			password: await passwordHasher.hash(newPassword),
		}
		const { isError, errorMessage } = await userInstance.updateUser(userInDb.id, resource)

		if (isError) {
			logger.error(errorMessage)
			return res.status(401).json({ message: errorMessage })
		}
		return res.status(200).json({ message: 'Mot de passe changé avec succès' })
	})

	deleteUser = withErrorHandler(async (req, res) => {
		if (!req.params) {
			logger.error('Missing params')
			return res.status(401).json({ message: 'Erreur lors de la requete' })
		}

		const { idUser } = req.params

		if (!IS_ID.test(idUser)) {
			logger.error('Id user is know')
			return res.status(401).json({ message: 'Il manque un id utilisateur' })
		}

		const userInstance = await db.user()
		const userInDb = await userInstance.getUserById(idUser)

		if (!userInDb) {
			return res.status(401).json({ message: 'Utilisateur introuvable' })
		}

		const { role } = userInDb.dataValues
		let isDeleted = false

		if (role === 'client') {
			const clientInstance = await db.client()
			isDeleted = await clientInstance.deleteClient(idUser)
		} else if (role === 'bar') {
			const barInstance = await db.bar()
			isDeleted = await barInstance.deleteBar(idUser)
		}

		if (!isDeleted) {
			return res.status(401).json({ message: 'Impossible de supprimer le compte' })
		}

		return res.status(200).json({ message: 'Compte supprimé' })
	})

	updateProfile = withErrorHandler(async (req, res) => {
		const { userId, profile } = req.body

		if (!userId || !profile) {
			return res.status(400).json({ message: 'Il manque un id ou vos informations.' })
		}

		const userInstance = await db.user()
		const newProfile = { ...profile }

		if (profile.password) {
			newProfile.password = await passwordHasher.hash(profile.password)
		}

		const updated = await userInstance.updateUser(userId, this._filterEmptyValues(newProfile))
		const { password: _password, ...sanitized } = updated.dataValues
		return res.status(200).json(this._generateProfile(sanitized))
	})

	getMatchesController = withErrorHandler(async (req, res) => {
		const userInstance = await db.user()
		const matches = await userInstance.getMatches()
		return res.status(200).send(matches.map((m) => this._formatMatch(m)))
	})

	getFiltersController = withErrorHandler(async (req, res) => {
		const userInstance = await db.user()
		const filters = await userInstance.getAllFilters()
		return res.status(200).json(filters)
	})

	getAllBarController = withErrorHandler(async (req, res) => {
		const userInstance = await db.user()
		const barList = await userInstance.getBars()

		if (!barList) {
			logger.info("Don't have a bar register")
			return res.status(200).json(null)
		}

		const bars = this._filterActiveMatches(barList)
		return res.status(200).json(bars.map((bar) => this._formatDataBar(bar)))
	})
}
