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
	IS_NUMBER,
	IS_PASSWORD,
	IS_STRING,
} from '../utils/regex.js'

export class CommunController {
	constructor () {
		this.encrypt = new Crypt()
		this.newLogger = new Logger()
	}

	#formatedData = async (body) => {
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
				longitude: longitude
			}
		}
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
		const profil = await this.#formatedData(body)

		return {
			profil,
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
		const ressources = await this.#formatedData(body)

		return {
			ressources,
			isValid: true,
		}
	}

	#validationEmail = (email) => {
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

	#connexionProfile = (data, token) => {
		let informationsData
		if (data.role === 'bar') {
			informationsData = {
				name: data.name,
				address: data.address,
				price: data.price,
				description: data.description,
				pictures: data.pictures,
				longitude: data.longitude,
				latitude: data.latitude
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
			token: token,
			favorites: data.favorites
				? {
						gameName: data.favorites.gameName,
						leagueName: data.favorites.leagueName,
						teams: data.favorites.teams,
						barName: data.role === 'client' ? data.favorites.barName : []
				  }
				: {},
			informations: informationsData,
		}
	}

	createAccount = async (req, res) => {
		
		const role = req.body.role
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

			const databaseInstance = databaseFactory()
			const userInstance = await databaseInstance.usersInstances()
			await databaseInstance.connectDb()
			const userDb = await userInstance.getUser(data.profil.email)
			
			if (userDb !== null) {
				this.newLogger.error(`user exist: ${data.profil.email}`)
				return res.status(401).json({ message: 'L\'utilisateur existe déjà' })
			}

			await userInstance.addUser(data.profil)
			
			this.newLogger.info(`user insert successful ${data.profil.email}`)
			await databaseInstance.disconnectDb()
			return res.status(201).json({ message: 'Inscription réussis' })
		} catch (error) {
      this.newLogger.error(error)
			return res.status(500).json({ message: errorServer  })
		}
	}

	connexion = async (req, res) => {
		
		try {
			const { email, password } = req.body

			const databaseInstance = databaseFactory()
			const userInstance = await databaseInstance.usersInstances()
			await databaseInstance.connectDb()
			const userDb = await userInstance.getProfileUser(email)
			await databaseInstance.disconnectDb()
			if (userDb === null) {
				this.newLogger.error('email is not valid')
				return res.status(401).json({ message: 'L\'email ou le mot de passe sont invalide' })
			}

			const passwordMatch = await bcryptjs.compare(password, userDb.password)

			if (!passwordMatch) {
				this.newLogger.error('password is not valid')
				return res.status(401).json({ message: 'L\'email ou le mot de passe sont invalide' })
			}

			const newToken = await this.encrypt.tokenCreation(userDb.id, userDb.password)

			const profile = this.#connexionProfile(userDb, newToken)

			return res.status(200).json(profile)
		} catch (error) {
			this.newLogger.error(error)
			return res.status(500).json({ message: errorServer })
		}
	}

	forgotPassword = async (req, res) => {
		const email = req.body.email
		const { isValidCredentiel, message } = this.#validationEmail(email)
				
		if (isValidCredentiel) {
			this.newLogger.error(message)
			return res.status(401).json({ message })
		}

		const databaseInstance = databaseFactory()
		const userInstance = await databaseInstance.usersInstances()
		await databaseInstance.connectDb()

		const user = await userInstance.getProfileUser(email)

		if (user) {
			const { codeNumber, expiresIn } = this.encrypt.generetedCode()
			await userInstance.addCodeNumber(codeNumber, expiresIn, user._id)
			await sendEmailResetPassword(email, codeNumber)
		}

		await databaseInstance.disconnectDb()

		return res.status(200).json({ 'id': user.id })
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

		await databaseInstance.connectDb()

		const user = await userInstance.getUserById(idUser)

		if (user) {
			
			const storeCodeNumberInData = await userInstance.getCodeByNumber(code)
			
			if (!storeCodeNumberInData) {
				this.newLogger.error('invalid code')
				return res.status(400).json({ message: 'Code invalide' })
			}
			
			else if (Date.now() > storeCodeNumberInData.expiresIn) {
				this.newLogger.error('request expired')
				return res.status(400).json({ message: 'Demande expiré' })
			} 
			
			else {
				return res.status(200).json({ 'id': user.id })
			}
		}
		await databaseInstance.disconnectDb()
	}

	resetPassword = async (req, res) => {
		
		let verifyToken 
		const { password, token, id } = req.body

		const { isValidPassword, errorPasswordMessage } = this.#validationPassword(password)

		if (token){
			verifyToken = await this.encrypt.verifyToken(token)
		}

		if (!isValidPassword) {
			this.newLogger.error(errorPasswordMessage)
			return res.status(401).json({ message: errorPasswordMessage })
		}

		const databaseInstance = databaseFactory()
		const userInstance = await databaseInstance.usersInstances()

		await databaseInstance.connectDb()
				
		const idUser = verifyToken ? verifyToken.id :  id
		const userInDb = await userInstance.getUserById(idUser)

		if (!userInDb) {
			this.newLogger.error('user not exist')
			return res.status(401).json({ message: 'Utilisateur introuvable' })
		}

		const encryptNewPassword = this.encrypt.passwordEncrypt(password)
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
			if (!req.body) {
				this.newLogger.error('Missing body params')
				return res.status(401).json({ message: 'Missing body params' })
			}

			const isRole = IS_STRING.test(req.body.role)
			const isIdUser = IS_NUMBER.test(req.body.id)

			if (!isRole) {
				this.newLogger.error('Role must be string')
				return res.status(401).json({ message: 'Role must be string' })
			}

			if (!isIdUser) {
				this.newLogger.error('Id must be integer')
				return res.status(401).json({ message: 'Id must be integer' })
			}

			return res.status(200).json({ message: 'delete user' })
		} catch (error) {
			
      this.newLogger.error(error)
			return res.status(500).json({ message: errorServer })
		}
	}

	updateProfile = async (req, res) => {
		
		try {
			const { userId } = req.body
			const isValidId = IS_NUMBER.test(userId) && userId

			if (!isValidId) {
				return res.status(401).json({ message: 'Id must be integer' })
			}
			const message = 'Pas implementé'

			return res.status(200).json({ message })
		} catch (error) {
			
			this.newLogger.error(error)
			return res.status(500).json({ message: errorServer })
		}
	}

	getMatchesController = async (req, res) => {
		try {
			
			const databaseInstance = databaseFactory()
			const userInstance = await databaseInstance.usersInstances()
			await databaseInstance.connectDb()
			const matches = await userInstance.getMatches()
			await databaseInstance.disconnectDb()
			return res.status(200).json(matches)
		} catch (error) {
			
      this.newLogger.error(error)
			return res.status(500).json({ message: errorServer  })
		}
	}

	getFiltersController = async (req, res) => {
		try {
			const databaseInstance = databaseFactory()
			const userInstance = await databaseInstance.usersInstances()
			await databaseInstance.connectDb()
			const filters = await userInstance.getAllFilters()
			await databaseInstance.disconnectDb()
			return res.status(200).json({ filters })
		} catch (error) {
			
			this.newLogger.error(error)
			return res.status(500).json({ message: errorServer })
		}
	}
}