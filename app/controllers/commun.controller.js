import { databaseFactory } from '@hugo38rodrigues/bdd-service-hall-e/main.js'
import bcryptjs from 'bcryptjs'
import { Crypt } from '../controllers/encryption.controller.js'
import { Logger } from '../midleware/logger.js'
import { sendEmailResetPassword } from '../utils/email.js'
import { getCoordinatesFromAddress } from '../utils/map.js'
import { errorServer } from '../utils/messages.js'
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
import { FavorisController } from './favoris.controller.js'

export class CommunController {
	constructor () {
		this.encrypt = new Crypt()
		this.newLogger = new Logger()
	}

	_filterProfile = (profile) => {
		return Object.fromEntries(
			Object.entries(profile).filter(([_, value]) => value !== null && value !== '')
		)
	}

	_formatedDataProfile = async (body) => {
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
				latitude: latitude,
				longitude: longitude,
			}
		}
	}

	_formatedDataBar = (data) => {
		const newMap = data.map((item) => {
			return {
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
			}
		})
		return newMap
	}

	_computeAdditionalHours = (gameName, bo) => {
		const normalizedGame = gameName.toLowerCase()

		// Stockage des durées en minutes pour simplifier
		const gameDurations = {
			'league of legends': {
				'1': 33,
				'3': 110, // 1h50 = 110 min
				'5': 230, // 3h50 = 230 min
			},
			'cs go': {
				'1': 50,
				'3': 150, // 2h30 = 150 min
				'5': 300, // 5h00 = 300 min
			},
			'valorant': {
				'1': 45,
				'3': 135, // 2h15 = 135 min
				'5': 270, // 4h30 = 270 min
			},
		}

		const durations = gameDurations[normalizedGame]
		if (durations && bo in durations) {
			return durations[bo] // Retourne la durée en minutes
		}

		// Durée par défaut si jeu ou BO non reconnu (2h = 120 minutes)
		return 120
	}


	_filterAndSortMatches = (data) => {
		const now = new Date()
		const today = now.toISOString().split('T')[0] // YYYY-MM-DD
		const currentTime = now.getTime() // Timestamp actuel

		data.forEach((bar) => {
			bar.programmedMatches = bar.programmedMatches.filter((match) => {
				const matchDate = new Date(match.date)
				const matchDay = matchDate.toISOString().split('T')[0] // YYYY-MM-DD

				// Supprime les matchs d'avant aujourd’hui
				if (matchDay < today) return false

				// Si c'est aujourd’hui, on garde uniquement les matchs futurs
				if (matchDay === today && matchDate.getHours < currentTime + this._computeAdditionalHours(match.gameName, match.numberOfGame) ) return false

				return true
			})
		})

		return data
	}

	_clientAccountVerify = async (body) => {
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
		const profile = await this._formatedDataProfile(body)

		return {
			profile,
			isValid: true,
		}
	}

	_barAccountVerify = async (body) => {
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
		const profile = await this._formatedDataProfile(body)

		return {
			profile,
			isValid: true,
		}
	}

	_validationEmail = (email) => {
		const isEmail = IS_EMAIL.test(email)

		if (!isEmail) {
			return {
				isEmail: false,
				errorEmailMessage: 'L\'email n\'est pas au bon format',
			}
		}

		return {
			isEmail: true,
		}
	}

	_validationPassword = (password) => {
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

	_getConnexionProfile = (data) => {
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
			userLocation:
				data.role === 'bar'
					? {
							longitude: data.longitude,
							latitude: data.latitude,
					  }
					: null,
		}
	}

	createAccount = async (req, res) => {
		const role = req.body.role
		let data
		try {
			if (role === 'client') {
				data = await this._clientAccountVerify(req.body, res)
			}

			if (role === 'bar') {
				data = await this._barAccountVerify(req.body, res)
			}

			if (!data.isValid) {
				this.newLogger.error(data.message)
				return res.status(401).json({ message: data.message })
			}

			const databaseInstance = databaseFactory()
			const userInstance = await databaseInstance.usersInstances()
			
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
			return res.status(500).json({ message: errorServer })
		}
	}

	connexion = async (req, res) => {
		try {
			const { email, password } = req.body

			const databaseInstance = databaseFactory()
			const userInstance = await databaseInstance.usersInstances()
			
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

			const profile = this._getConnexionProfile(userDb)

			return res.header('Authorization', token).status(200).send(profile)
		} catch (error) {
			this.newLogger.error(error)
			return res.status(500).json({ message: errorServer })
		}
	}

	forgotPassword = async (req, res) => {
		try {
			const email = req.body.email
			const { isValidCredentiel, message } = this._validationEmail(email)

			if (isValidCredentiel) {
				this.newLogger.error(message)
				return res.status(401).json({ message })
			}

			const databaseInstance = databaseFactory()
			const userInstance = await databaseInstance.usersInstances()
			

			const userExist = await userInstance.getProfileUser(email)

			if (userExist) {
				const { codeNumber, expiresIn } = this.encrypt.generetedCode()
				await userInstance.addCodeNumber(codeNumber, expiresIn, userExist._id)
				await sendEmailResetPassword(email, codeNumber)
				
				const token = await this.encrypt.tokenCreation(userExist._id, userExist.password)

				return res.header('Authorization', token).status(200).send({ id: userExist._id })
			}

			
			return res.status(200)
		} catch (error) {
			this.newLogger.error(error)
			return res.status(500).json({ message: errorServer })
		}
	}

	verifyCode = async (req, res) => {
		const { idUser, code } = req.body
		const isCode = IS_CODE_NUMBER.test(parseInt(code))

		if (!isCode) {
			this.newLogger.error('Is not a good code')
			return res.status(401).json({ message: 'Ce n\'est pas le bon code' })
		}

		const databaseInstance = databaseFactory()
		const userInstance = await databaseInstance.usersInstances()

		

		const user = await userInstance.getUserById(idUser)

		if (user) {
			const storeCodeNumberInData = await userInstance.getCodeByNumber(code)

			if (!storeCodeNumberInData) {
				this.newLogger.error('invalid code')
				return res.status(400).json({ message: 'Code invalide' })
			} else if (Date.now() > storeCodeNumberInData.expiresIn) {
				this.newLogger.error('request expired')
				return res.status(400).json({ message: 'Demande expiré' })
			} else {
				return res.status(200).json({ id: user.id })
			}
		}
		
	}

	resetPassword = async (req, res) => {
		const { newPassword, id } = req.body

		const { isValidPassword, errorPasswordMessage } = this._validationPassword(newPassword)

		if (!isValidPassword) {
			this.newLogger.error(errorPasswordMessage)
			return res.status(401).json({ message: errorPasswordMessage })
		}

		const databaseInstance = databaseFactory()
		const userInstance = await databaseInstance.usersInstances()

		

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
		const { isError, errorMessage } = userInstance.updateUser(userInDb.id, ressource)
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
			const databaseInstance = databaseFactory()
			 // on connecte avant d'appeler les instances
			const userInstance = await databaseInstance.usersInstances()
			const userInDb = await userInstance.getUserById(idUser)
			if (!userInDb){
				return res.status(401).json({ message: 'Utilisateur un trouvable' })
			}
			const isDeleteUser = await userInstance.deleteUser(idUser, userInDb.role)
			if (!isDeleteUser){
				return res.status(401).json({ message: 'Impossible de supprimer le compte' })
			}
			

			return res.status(200).json({ message: 'Compte supprimé' })
		} catch (error) {
			this.newLogger.error(error)
			return res.status(500).json({ message: errorServer })
		}
	}

	updateProfile = async (req, res) => {
		try {
			const { userId, profile } = req.body
			if (!userId || !profile) {
				return res.status(400).json({ message: 'userId et profile sont requis.' })
			}

			const databaseInstance = databaseFactory()
			 // on connecte avant d'appeler les instances
			const userInstance = await databaseInstance.usersInstances()

			let newProfile = { ...profile }

			if (profile.password) {
				const encryptPassword = await this.encrypt.passwordEncrypt(profile.password)
				newProfile.password = encryptPassword
			}

			const objectProfile = await userInstance.updateUser(userId, this._filterProfile(newProfile))

			const { password: _password, favorites: _favorites, ...sanitizedProfile } = objectProfile

			return res.status(200).json(sanitizedProfile)
		} catch (error) {
			this.newLogger.error(error)
			return res.status(500).json({ message: errorServer })
		}
	}

	getMatchesController = async (req, res) => {
		try {
			const databaseInstance = databaseFactory()
			const userInstance = await databaseInstance.usersInstances()
			
			const matches = await userInstance.getMatches()

			return res.status(200).send(matches)
		} catch (error) {
			this.newLogger.error(error)
			return res.status(500).json({ message: errorServer })
		}
	}

	getFiltersController = async (req, res) => {
		try {
			const databaseInstance = databaseFactory()
			const userInstance = await databaseInstance.usersInstances()
			
			const filters = await userInstance.getAllFilters()
			
			return res.status(200).json({ filters })
		} catch (error) {
			this.newLogger.error(error)
			return res.status(500).json({ message: errorServer })
		}
	}

	getAllBarController = async (req, res) => {
		try {
			const databaseInstance = databaseFactory()
			const userInstance = await databaseInstance.usersInstances()

			
			const barList = await userInstance.getBars()
			const bars = this._filterAndSortMatches(barList)
			const formatedDataBar = this._formatedDataBar(bars)

			

			return res.status(200).json(formatedDataBar)
		} catch (error) {
			this.newLogger.error(error)
			return res.status(500).json({ message: errorServer })
		}
	}

	addFavorites = async (req, res) => {
		try {
			const { type, idUser, data } = req.body
			const favoris = new FavorisController()
			let addFavoris
			switch (type) {
				case 'gameName':
					addFavoris = await favoris.addFavorisGameController(idUser, data, type)
					break
				case 'leagueName':
					addFavoris = await favoris.addFavorisLeagueController(idUser, data, type)
					break
				case 'teams':
					addFavoris = await favoris.addFavorisTeamController(idUser, data, type)
					break
				case 'barName':
					addFavoris = await favoris.addFavorisBarNameController(idUser, data, type)
					break
				default:
			}
			if (addFavoris.message) {
				res.status(500).json(addFavoris)
			}
			res.status(200).json(addFavoris)
		} catch (error) {
			this.newLogger.error(error)
			return res.status(500).json({ message: errorServer })
		}
	}

	deleteFavorites = async (req, res) => {
		try {
			const { type, idUser, data } = req.body
			const favoris = new FavorisController()
			let deleteFavoris
			switch (type) {
				case 'gameName':
					deleteFavoris = await favoris.deleteFavorisGameController(idUser, data)
					break
				case 'leagueName':
					deleteFavoris = await favoris.deleteFavorisLeagueController(idUser, data)
					break
				case 'teams':
					deleteFavoris = await favoris.deleteFavorisTeamController(idUser, data)
					break
				case 'barName':
					deleteFavoris = await favoris.deleteFavorisBarNameController(idUser, data)
					break
				default:
			}

			if (deleteFavoris.message){
				res.status(500).json(deleteFavoris)
			}
			
			res.status(200).json(deleteFavoris)
		} catch (error) {
			this.newLogger.error(error)
			return res.status(500).json({ message: errorServer })
		}
	}
}