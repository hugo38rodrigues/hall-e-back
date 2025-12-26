import { db } from '@hugo38rodrigues/bdd-service-hall-e/main.js'
import bcryptjs from 'bcryptjs'
import Logger from '../middleware/logger.js'
import { ERROR_SERVER } from '../utils/constants.js'
import { sendEmailResetPassword } from '../utils/email.js'
import { getCoordinatesFromAddress } from '../utils/map.js'
import {
	IS_ADDRESS,
	IS_BAR_NAME,
	IS_CODE_NUMBER,
	IS_DESCRIPTION,
	IS_EMAIL,
	IS_MONGO_ID,
	IS_PASSWORD,
	IS_STRING,
} from '../utils/regex.js'
import { Crypt } from './encryption.controller.js'

export class CommunController {
	constructor() {
		this.encrypt = new Crypt()
		this.newLogger = new Logger()
	}

	#filterProfile = (profile) => Object.fromEntries(
		// eslint-disable-next-line no-unused-vars
		Object.entries(profile).filter(([_, value]) => value !== null && value !== ''),
	)

	#formatedDataProfile = async (body) => {
		if (body.role === 'client') {
			return {
				firstName: body.informations.firstName,
				lastName: body.informations.lastName,
				email: body.email,
				password: this.encrypt.passwordEncrypt(body.password),
				role: body.role,
			}
		}

		if (body.role === 'bar') {
			const { latitude, longitude } = await getCoordinatesFromAddress(body.informations.address)
			return {
				name: body.informations.name,
				address: body.informations.address,
				email: body.email,
				password: this.encrypt.passwordEncrypt(body.password),
				role: body.role,
				price: body.informations.price,
				description: body.informations.description,
				photo: body.informations.photo,
				latitude,
				longitude,
			}
		}
		return null
	}

	#formatedDataBar = (data) => {
		const newMap = data.map((item) => ({
			id: item._id,
			role: item.role,
			informations: {
				name: item.name,
				description: item.description,
				address: item.address,
				pictures: item.pictures,
			},
			programmedMatches: item.programmedMatches,
			userLocation: { longitude: item.longitude, latitude: item.latitude },
		}))
		return newMap
	}

	#computeAdditionalHours = (gameName, bo) => {
		const normalizedGame = gameName.toLowerCase()

		// Stockage des durées en minutes pour simplifier
		const gameDurations = {
			'league of legends': {
				1: 33,
				3: 110, // 1h50 = 110 min
				5: 230, // 3h50 = 230 min
			},
			'cs go': {
				1: 50,
				3: 150, // 2h30 = 150 min
				5: 300, // 5h00 = 300 min
			},
			valorant: {
				1: 45,
				3: 135, // 2h15 = 135 min
				5: 270, // 4h30 = 270 min
			},
		}

		const durations = gameDurations[normalizedGame]
		if (durations && bo in durations) {
			return durations[bo] // Retourne la durée en minutes
		}

		// Durée par défaut si jeu ou BO non reconnu (2h = 120 minutes)
		return 120
	}

	#filterAndSortMatches = (data) => {
		const now = new Date()
		const today = now.toISOString().slice(0, 10) // 'YYYY-MM-DD'

		const updatedData = data.map((bar) => {
			const programmedMatches = (bar.programmedMatches || []).filter((match) => {
				const matchDate = new Date(match.date)
				const matchDay = matchDate.toISOString().slice(0, 10) // 'YYYY-MM-DD'

				// Retire les matchs d'avant aujourd'hui
				if (matchDay < today) return false

				// Si c'est aujourd'hui, ne garder que les matchs futurs (avec marge additionnelle)
				if (matchDay === today) {
					const extraHours = this.#computeAdditionalHours(match.gameName, match.numberOfGame) || 0
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

	#clientAccountVerify = async (body) => {
		const isEmail = IS_EMAIL.test(body.email)
		const isPassword = IS_PASSWORD.test(body.password)
		const isFirstName = IS_STRING.test(body.informations.firstName)
		const isLastName = IS_STRING.test(body.informations.lastName)
		const isValidEmail = body.email && isEmail
		const isValidPassword = body.password && isPassword
		const isValidLastName = body.informations.lastName && isLastName
		const isValidFirstName = body.informations.firstName && isFirstName

		if (!isValidEmail || !isValidPassword) {
			return { isValid: false, message: 'Missing email or password' }
		}

		if (!isValidLastName || !isValidFirstName) {
			return { isValid: false, message: 'Missing first name or last name' }
		}
		const profile = await this.#formatedDataProfile(body)

		return {
			profile,
			isValid: true,
		}
	}

	#barAccountVerify = async (body) => {
		const isEmail = IS_EMAIL.test(body.email)
		const isPassword = IS_PASSWORD.test(body.password)
		const isAddress = IS_ADDRESS.test(body.informations.address)
		const isName = IS_BAR_NAME.test(body.informations.name)
		const isDescription = IS_DESCRIPTION.test(body.informations.description)

		if (!isEmail || !isPassword) {
			return { isValid: false, message: 'password or email invalid' }
		}

		if (!isAddress) {
			return {
				isValid: false,
				message: 'Address is invalid',
			}
		}

		if (!isDescription) {
			return {
				isValid: false,
				message: 'Is invalid description',
			}
		}

		if (!isName) {
			return { isValid: false, message: 'Is invalid name' }
		}
		const profile = await this.#formatedDataProfile(body)

		return {
			profile,
			isValid: true,
		}
	}

	#validationEmail = (email) => (IS_EMAIL.test(email)
		? { isEmail: true }
		: {
			isEmail: false,
			errorEmailMessage: 'L\'email n\'est pas au bon format',
		})

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

	#getConnexionProfile = (data) => {
		let informationsData
		if (data.role === 'bar') {
			informationsData = {
				name: data.name,
				address: data.address,
				price: data.price,
				description: data.description,
				pictures: data.pictures,
			}
		} else {
			informationsData = {
				firstName: data.firstName,
				lastName: data.lastName,
				likeBar: data.likeBar,
			}
		}

		return {
			id: data._id,
			email: data.email,
			role: data.role,
			favorites: data.favorites
				? {
					gameName: data.favorites.gameName,
					leagueName: data.favorites.leagueName,
					teams: data.favorites.teams,
					barName: data.role === 'client' ? data.favorites.barName : [],
				}
				: {},
			informations: informationsData,
			userLocation: data.role === 'bar' ? { longitude: data.longitude, latitude: data.latitude } : null,
		}
	}

	createAccount = async (req, res) => {
		const { role } = req.body
		let data
		try {
			if (role === 'client') {
				data = await this.#clientAccountVerify(req.body, res)
			}

			if (role === 'bar') {
				data = await this.#barAccountVerify(req.body, res)
			}

			if (!data.isValid) {
				this.newLogger.error(data.message)
				return res.status(401).json({ message: data.message })
			}

			const userInstance = await db.usersInstances()

			const userDb = await userInstance.getUser(data.profile.email)

			if (userDb !== null) {
				this.newLogger.error(`user exist: ${data.profile.email}`)
				return res.status(401).json({ message: 'L\'utilisateur existe déjà' })
			}

			await userInstance.addUser(data.profile)

			this.newLogger.info(`user insert successful ${data.profile.email}`)

			return res.status(201).json({ message: 'Inscription réussis' })
		} catch (error) {
			this.newLogger.error(error)
			return res.status(500).json({ message: ERROR_SERVER })
		}
	}

	connexion = async (req, res) => {
		try {
			const { email, password } = req.body

			const userInstance = await db.usersInstances()

			const userDb = await userInstance.getProfileUser(email)

			if (userDb === null) {
				this.newLogger.error('email is not valid')
				return res.status(401).json({ message: 'L\'email ou le mot de passe sont invalide' })
			}

			const passwordMatch = await bcryptjs.compare(password, userDb.password)

			if (!passwordMatch) {
				this.newLogger.error('password is not valid')
				return res.status(401).json({ message: 'L\'email ou le mot de passe sont invalide' })
			}

			const token = await this.encrypt.tokenCreation(userDb.id, userDb.password)

			const profile = this.#getConnexionProfile(userDb)

			return res.header('Authorization', token).status(200).send(profile)
		} catch (error) {
			this.newLogger.error(error)
			return res.status(500).json({ message: ERROR_SERVER })
		}
	}

	forgotPassword = async (req, res) => {
		try {
			const { email } = req.body
			const { isEmail, errorEmailMessage } = this.#validationEmail(email)

			if (!isEmail) {
				this.newLogger.error(errorEmailMessage)
				return res.status(401).json({ errorEmailMessage })
			}

			const userInstance = await db.usersInstances()

			const userExist = await userInstance.getProfileUser(email)

			if (userExist) {
				const { codeNumber, expiresIn } = this.encrypt.generetedCode()
				const code = await userInstance.addCodeNumber(codeNumber, expiresIn, userExist._id)
				await sendEmailResetPassword(email, code)

				const token = await this.encrypt.tokenCreation(userExist._id, userExist.password)

				return res.header('Authorization', token).status(200).send({ id: userExist._id })
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

		const userInstance = await db.usersInstances()

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

		const userInstance = await db.usersInstances()

		const userInDb = await userInstance.getUserById(id)

		if (!userInDb) {
			this.newLogger.error('user not exist')
			return res.status(401).json({ message: 'Utilisateur introuvable' })
		}

		const encryptNewPassword = this.encrypt.passwordEncrypt(newPassword)
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
				return res.status(401).json({ message: 'Il manque un parametre dans votre requete' })
			}
			const { idUser } = req.params

			const isIdUser = IS_MONGO_ID.test(idUser)

			if (!isIdUser) {
				this.newLogger.error('Id must be mongo id')
				return res.status(401).json({ message: 'Il manque un id utilisateur ' })
			}

			// on connecte avant d'appeler les instances
			const userInstance = await db.usersInstances()
			const userInDb = await userInstance.getUserById(idUser)
			if (!userInDb) {
				return res.status(401).json({ message: 'Utilisateur un trouvable' })
			}

			const isDeleteUser = await userInstance.deleteUser(idUser, userInDb.role)
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
				return res.status(400).json({ message: 'userId et profile sont requis.' })
			}

			const userInstance = await db.usersInstances()

			const newProfile = { ...profile }

			if (profile.password) {
				const encryptPassword = await this.encrypt.passwordEncrypt(profile.password)
				newProfile.password = encryptPassword
			}

			const objectProfile = await userInstance.updateUser(userId, this.#filterProfile(newProfile))

			const { password: _password, favorites: _favorites, ...sanitizedProfile } = objectProfile

			return res.status(200).json(sanitizedProfile)
		} catch (error) {
			this.newLogger.error(error)
			return res.status(500).json({ message: ERROR_SERVER })
		}
	}

	getMatchesController = async (req, res) => {
		try {
			const userInstance = await db.usersInstances()

			const matches = await userInstance.getMatches()

			return res.status(200).send(matches)
		} catch (error) {
			this.newLogger.error(error)
			return res.status(500).json({ message: ERROR_SERVER })
		}
	}

	getFiltersController = async (req, res) => {
		try {
			const userInstance = await db.usersInstances()

			const filters = await userInstance.getAllFilters()

			return res.status(200).json({ filters })
		} catch (error) {
			this.newLogger.error(error)
			return res.status(500).json({ message: ERROR_SERVER })
		}
	}

	getAllBarController = async (req, res) => {
		try {
			const userInstance = await db.usersInstances()

			const barList = await userInstance.getBars()
			const bars = this.#filterAndSortMatches(barList)
			const formatedDataBar = this.#formatedDataBar(bars)

			return res.status(200).json(formatedDataBar)
		} catch (error) {
			this.newLogger.error(error)
			return res.status(500).json({ message: ERROR_SERVER })
		}
	}
}
