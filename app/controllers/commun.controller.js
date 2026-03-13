import { db } from '@hugo38rodrigues/bdd-service-hall-e/main.js'
import Logger from '../middleware/logger.js'
import { generetedCode } from '../utils/code-generation.js'
import { ERROR_SERVER } from '../utils/constants.js'
import { sendEmailResetPassword } from '../utils/email.js'
import { passwordEncrypt, verifyPassword } from '../utils/encryption.js'
import { getIdInToken, tokenCreation } from '../utils/jwt.js'
import { getCoordinatesFromAddress } from '../utils/map.js'
import {
	IS_ADDRESS,
	IS_BAR_NAME,
	IS_CODE_NUMBER,
	IS_DESCRIPTION,
	IS_EMAIL,
	IS_ID,
	IS_PASSWORD,
	IS_STRING,
} from '../utils/regex.js'
import { computeAdditionalHours } from '../utils/match-tools.js'

export class CommunController {
	constructor() {
		this.newLogger = new Logger()
	}

	#filterProfile = (profile) => Object.fromEntries(
		// eslint-disable-next-line no-unused-vars
		Object.entries(profile).filter(([_, value]) => value !== null && value !== ''),
	)

	#formatedProgrammedMatch = (match) => ({

		id: match.id,
		hypeScore: match.hype_score,
		streamPlatform: match.stream_platform,
		team1: match.team1,
		team2: match.team2,
		game: match.game,
		league: match.league,
		date: match.date,

	})

	#formatedDataBar = (bar) => ({
		id: bar.id,
		role: bar.role,
		informations: {
			name: bar.name,
			description: bar.description,
			address: bar.address,
			pictures: bar.pictures,
		},
		// eslint-disable-next-line max-len
		programations: bar.programmedMatches.length > 0 ? this.#formatedProgrammedMatch(bar.programmedMatches) : null,
		userLocation: { longitude: bar.longitude, latitude: bar.latitude },

	})

	#filterAndSortMatches = (data) => {
		const now = new Date()
		const today = now.toISOString().slice(0, 10) // 'YYYY-MM-DD'

		const updatedData = data.map((bar) => {
			const programmedMatches = bar.programmedMatches.filter((match) => {
				if (match.id === null) {
					return false
				}
				const matchDate = new Date(match.date)
				const matchDay = matchDate.toISOString().slice(0, 10) // 'YYYY-MM-DD'

				// Retire les matchs d'avant aujourd'hui
				if (matchDay < today) return false

				// Si c'est aujourd'hui, ne garder que les matchs futurs (avec marge additionnelle)
				if (matchDay === today) {
					const extraHours = computeAdditionalHours(match.game.name, match.numberOfGame) || 0
					const cutoff = new Date(now.getTime() + extraHours * 60 * 1000) // now + extraHours
					return matchDate >= cutoff
				}

				// Jours futurs : on garde
				return true
			})

			// retourne un NOUVEL objet (pas de mutation du paramètre)
			return { ...bar, programmedMatches }
		})

		return updatedData
	}

	#verifyDataClient = (body) => {
		const isEmail = IS_EMAIL.test(body.email)
		const isPassword = IS_PASSWORD.test(body.password)
		const isFirstName = IS_STRING.test(body.informations.firstName)
		const isLastName = IS_STRING.test(body.informations.lastName)
		const isValidEmail = body.email && isEmail
		const isValidPassword = body.password && isPassword
		const isValidLastName = body.informations.lastName && isLastName
		const isValidFirstName = body.informations.firstName && isFirstName

		if (!isValidEmail || !isValidPassword) {
			return 1
		}

		if (!isValidLastName || !isValidFirstName) {
			return 2
		}
		return undefined
	}

	#formatedTeam = (team) => ({
		id: team.id,
		name: team.name,
		acronym: team.acronym,
		logoUrl: team.logo_url,
	})

	#formatedMatch = (match) => ({
		id: match.id,
		idMatch: match.id_match,
		date: match.date,
		numberOfGame: match.number_of_game,
		hypeScore: match.hype_score,
		streamPlatform: match.stream_platform,
		programmed: match.programmedBars.length === 0 ? null : match.programmedBars,
		team1: this.#formatedTeam(match.team1),
		team2: this.#formatedTeam(match.team2),
		league: match.league,
		game: match.game,
	})

	#verifyDataBar = (body) => {
		const isEmail = IS_EMAIL.test(body.email)
		const isPassword = IS_PASSWORD.test(body.password)
		const isAddress = IS_ADDRESS.test(body.informations.address)
		const isName = IS_BAR_NAME.test(body.informations.name)
		const isDescription = IS_DESCRIPTION.test(body.informations.description)

		if (!isEmail || !isPassword) {
			return 1
		}

		if (!isAddress) {
			return 2
		}

		if (!isDescription) {
			return 3
		}

		if (!isName) {
			return 4
		}
		return undefined
	}

	#validationEmail = (email) => (!((email === '' || !IS_EMAIL.test(email))))

	#validationPassword = (password) => {
		const isPassword = IS_PASSWORD.test(password)

		if (!isPassword) {
			return {
				isValidPassword: false,
				errorPasswordMessage: 'Mot de passe invalide',
			}
		}
		return {
			isValidPassword: true,
			errorPasswordMessage: '',
		}
	}

	#createdNewProfil = async (data) => {
		if (data.role === 'bar') {
			const { latitude, longitude } = await getCoordinatesFromAddress(data.informations.address)
			return {
				role: data.role,
				email: data.email,
				name: data.informations.name,
				password: passwordEncrypt(data.password),
				address: data.informations.address,
				price: data.informations.price,
				description: data.informations.description,
				pictures: data.informations.pictures,
				latitude,
				longitude,
			}
		}
		return {
			email: data.email,
			password: passwordEncrypt(data.password),
			role: data.role,
			firstName: data.informations.firstName,
			lastName: data.informations.lastName,
		}
	}

	#generatedProfil = (data) => {
		let informations
		if (data.role === 'bar') {
			informations = {
				name: data.name,
				address: data.address,
				price: data.price,
				description: data.description,
				pictures: data.pictures,
			}
		} else {
			informations = {
				firstName: data.first_name,
				lastName: data.last_name,
				likeBar: data.likeBar,
			}
		}

		return {
			id: data.id,
			email: data.email,
			role: data.role,
			favorites: data.favorites
				? {
					gameName: data.favorites.gameName,
					leagueName: data.favorites.leagueName,
					teams: data.favorites.teams,
					barName: data.role === 'client' ? data.favorites.barName : [],
				}
				: null,
			informations,
			programmedMatches: data.role === 'bar' ? data.programmedMatches.map((match) => this.#formatedProgrammedMatch(match.dataValues)) : null,
			userLocation: data.role === 'bar' ? { longitude: parseFloat(data.longitude), latitude: parseFloat(data.latitude) } : null,
		}
	}

	createAccount = async (req, res) => {
		const data = req.body
		let profil
		try {
			if (data.role === 'client') {
				const isValidData = this.#verifyDataClient(data)
				if (isValidData === 1) {
					return res.status(401).json({ message: 'Votre mot de passe ou votre mail est invalide' })
				}
				if (isValidData === 2) {
					return res.status(401).json({ message: 'Votre prénom ou nom est invalide' })
				}
				profil = await this.#createdNewProfil(data)
			}

			if (data.role === 'bar') {
				const isValidData = this.#verifyDataBar(data)
				if (isValidData === 1) {
					return res.status(401).json({
						message: 'Votre mot de passe ou votre mail est invalide',
					})
				}
				if (isValidData === 2) {
					return res.status(401).json({
						message: 'Votre Addresse est invalide',
					})
				}
				if (isValidData === 3) {
					return res.status(401).json({
						message: 'Votre description doit est invalide',
					})
				}
				if (isValidData === 4) {
					return res.status(401).json({
						message: 'Votre nom est invalide',
					})
				}
				profil = await this.#createdNewProfil(data)
			}

			const userInstance = await db.user()

			const userDb = await userInstance.getUserByEmail(profil.email)

			if (userDb !== undefined) {
				this.newLogger.error(`user exist: ${profil.email}`)
				return res.status(401).json({ message: 'L\'utilisateur existe déjà' })
			}

			if (profil.role === 'client') {
				await userInstance.addClient(profil)
			} else if (profil.role === 'bar') {
				await userInstance.addBar(profil)
			} else {
				return res.status(404).json({ message: 'Le role est inconnu' })
			}

			this.newLogger.info(`user insert successful ${profil.email}`)

			return res.status(201).json({ message: 'Inscription réussis' })
		} catch (error) {
			this.newLogger.error(error)
			return res.status(500).json({ message: ERROR_SERVER })
		}
	}

	connexion = async (req, res) => {
		try {
			const { email, password } = req.body

			const userInstance = await db.user()

			const userDb = await userInstance.getUserByEmail(email)

			if (userDb === null) {
				this.newLogger.error('email is not valid')
				return res.status(401).json({ message: 'L\'email ou le mot de passe sont invalide' })
			}

			const passwordMatch = await verifyPassword(password, userDb.dataValues.password)

			if (!passwordMatch) {
				this.newLogger.error('password is not valid')
				return res.status(401).json({ message: 'L\'email ou le mot de passe sont invalide' })
			}

			const token = await tokenCreation(userDb.id, userDb.password)

			return res.header('Authorization', token).status(200).send({ message: 'Connexion réussie' })
		} catch (error) {
			this.newLogger.error(error)
			return res.status(500).json({ message: ERROR_SERVER })
		}
	}

	getProfil = async (req, res) => {
		try {
			const token = req.headers.authorization
			const id = getIdInToken(token)
			const userInstance = await db.user()

			const userDb = await userInstance.getUserById(id)

			if (userDb === undefined) {
				return res.status(404).json({ message: 'Erreur lors de la récupération du profile' })
			}

			const profile = await userInstance.getProfileUser(userDb.dataValues.email)
			const formatedProfil = this.#generatedProfil(profile.dataValues)

			return res.status(200).json(formatedProfil)
		} catch (error) {
			this.newLogger.error(error)
			return res.status(500).json({ message: ERROR_SERVER })
		}
	}

	forgotPassword = async (req, res) => {
		try {
			const { email } = req.body
			const isValidEmail = this.#validationEmail(email)

			if (!isValidEmail) {
				this.newLogger.error('Error email')
				return res.status(401).json({ errorEmailMessage: 'Email pas au bon format' })
			}

			const userInstance = await db.user()

			const userDb = await userInstance.getProfileUser(email)

			if (userDb) {
				const { codeNumber, expiresIn } = generetedCode()
				const code = await userInstance.addCodeNumber(codeNumber, expiresIn, userDb.dataValues.id)
				await sendEmailResetPassword(email, code)

				const token = await tokenCreation(userDb._id, userDb.password)

				return res.header('Authorization', token).status(200).send({ id: userDb.id })
			}

			return res.status(200)
		} catch (error) {
			this.newLogger.error(error)
			return res.status(500).json({ message: ERROR_SERVER })
		}
	}

	verifyCode = async (req, res) => {
		const { idUser, code } = req.body
		const isCode = IS_CODE_NUMBER.test(parseInt(code, 10))

		if (!isCode) {
			this.newLogger.error('Is not a good code')
			return res.status(401).json({ message: 'Ce n\'est pas le bon code' })
		}

		const userInstance = await db.user()

		const user = await userInstance.getUserById(idUser)

		if (user) {
			const storeCodeNumberInData = await userInstance.getCodeByNumber(code)

			if (!storeCodeNumberInData) {
				this.newLogger.error('invalid code')
				return res.status(400).json({ message: 'Code invalide' })
			} if (Date.now() > storeCodeNumberInData.expiresIn) {
				this.newLogger.error('request expired')
				return res.status(400).json({ message: 'Demande expiré' })
			}
			return res.status(200).json({ id: user.id })
		}
		return null
	}

	resetPassword = async (req, res) => {
		const { newPassword, id } = req.body

		const { isValidPassword, errorPasswordMessage } = this.#validationPassword(newPassword)

		if (!isValidPassword) {
			this.newLogger.error(errorPasswordMessage)
			return res.status(401).json({ message: errorPasswordMessage })
		}

		const userInstance = await db.user()

		const userInDb = await userInstance.getUserById(id)

		if (!userInDb) {
			this.newLogger.error('user not exist')
			return res.status(401).json({ message: 'Utilisateur introuvable' })
		}

		const encryptNewPassword = passwordEncrypt(newPassword)
		const ressource = {
			role: userInDb.role,
			password: encryptNewPassword,
		}
		const { isError, errorMessage } = await userInstance.updateUser(userInDb.id, ressource)
		if (isError) {
			this.newLogger.error(errorMessage)
			return res.status(401).json({ message: errorMessage })
		}
		return res.status(200).json({ message: 'Mot de passe changé avec succès' })
	}

	deleteUser = async (req, res) => {
		try {
			if (!req.params) {
				this.newLogger.error('Missing params')
				return res.status(401).json({ message: 'Erreur lors de la requete' })
			}
			const { idUser } = req.params

			const isIdUser = IS_ID.test(idUser)

			if (!isIdUser) {
				this.newLogger.error('Id must be mongo id')
				return res.status(401).json({ message: 'Il manque un id utilisateur' })
			}

			const barInstance = await db.bar()
			const clientInstance = await db.client()
			const userInstance = await db.user()
			const userInDb = await userInstance.getUserById(idUser)

			if (!userInDb) {
				return res.status(401).json({ message: 'Utilisateur un trouvable' })
			}

			let isDeleteUser

			if (userInDb.dataValues.role === 'client') {
				isDeleteUser = await clientInstance.deleteClient(idUser)
			} else if (userInDb.dataValues.role === 'bar') {
				isDeleteUser = await barInstance.deleteBar(idUser)
			}

			if (!isDeleteUser) {
				return res.status(401).json({ message: 'Impossible de supprimer le compte' })
			}

			return res.status(200).json({ message: 'Compte supprimé' })
		} catch (error) {
			this.newLogger.error(error)
			return res.status(500).json({ message: ERROR_SERVER })
		}
	}

	updateProfile = async (req, res) => {
		try {
			const { userId, profile } = req.body

			if (!userId || !profile) {
				return res.status(400).json({ message: 'Il manque un id ou vos informations.' })
			}

			const userInstance = await db.user()

			const newProfile = { ...profile }

			if (profile.password) {
				const encryptNewPassword = await passwordEncrypt(profile.password)
				newProfile.password = encryptNewPassword
			}

			const objectProfile = await userInstance.updateUser(userId, this.#filterProfile(newProfile))

			// eslint-disable-next-line max-len
			const { password: _password, favorites: _favorites, ...sanitizedProfile } = objectProfile.dataValues

			return res.status(200).json(sanitizedProfile)
		} catch (error) {
			this.newLogger.error(error)
			return res.status(500).json({ message: ERROR_SERVER })
		}
	}

	getMatchesController = async (req, res) => {
		try {
			const userInstance = await db.user()

			const matches = await userInstance.getMatches()
			const formatedMatche = matches.map((match) => this.#formatedMatch(match))
			return res.status(200).send(formatedMatche)
		} catch (error) {
			this.newLogger.error(error)
			return res.status(500).json({ message: ERROR_SERVER })
		}
	}

	getFiltersController = async (req, res) => {
		try {
			const userInstance = await db.user()

			const filters = await userInstance.getAllFilters()

			return res.status(200).json(filters)
		} catch (error) {
			this.newLogger.error(error)
			return res.status(500).json({ message: ERROR_SERVER })
		}
	}

	getAllBarController = async (req, res) => {
		try {
			const userInstance = await db.user()

			const barList = await userInstance.getBars()

			if (!barList) {
				this.newLogger.log("don't have a bar")
				return res.status(200).json({ message: "Aucun bar inscrit dans l'application" })
			}
			const bars = this.#filterAndSortMatches(barList)
			const formatedDataBar = bars.map((bar) => this.#formatedDataBar(bar))

			return res.status(200).json(formatedDataBar)
		} catch (error) {
			this.newLogger.error(error)
			return res.status(500).json({ message: ERROR_SERVER })
		}
	}
}
