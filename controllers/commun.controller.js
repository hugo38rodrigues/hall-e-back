import bcrypt from 'bcrypt'
import { connectDb, databaseFactory, disconnectDb } from 'bdd-service-hall-e/main.js'
import { Crypt } from '../controllers/encryption.controller.js'
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
		const ressources = await this.#formatedData(body)

		return {
			ressources,
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
						barName: data.role === 'client' ? data.favorites.barName : ''
				  }
				: {},
			informations: informationsData,
		}
	}

	#newDataValidation = (profile, role) => {
		const isEmptyEmail = profile.email === undefined ? undefined : profile.email
		const isEmptyPassword =
			profile.password === undefined ? undefined : this.encrypt.passwordEncrypt(profile.password)

		if (role === 'client') {
			const isEmptyLastName = profile.lastName === undefined ? undefined : profile.lastName
			const isEmptyFirstName = profile.firstName === undefined ? undefined : profile.firstName

			return {
				email: isEmptyEmail,
				password: isEmptyPassword,
				lastName: isEmptyLastName,
				firstName: isEmptyFirstName,
				role,
			}
		}

		if (role === 'bar') {
			const isEmptyName = profile.name === undefined ? undefined : profile.name
			const isEmptyAddress = profile.address === undefined ? undefined : profile.address
			const isEmptyDescription = profile.description === undefined ? undefined : profile.description
			const isEmptyPicture = profile.picture === undefined ? undefined : profile.picture
			const isEmptyPrice = profile.price === undefined ? undefined : profile.price

			return {
				email: isEmptyEmail,
				password: isEmptyPassword,
				name: isEmptyName,
				address: isEmptyAddress,
				description: isEmptyDescription,
				picture: isEmptyPicture,
				price: isEmptyPrice,
				role,
			}
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
				return res.status(401).json({ message: data.message })
			}

			await connectDb()
			const databaseInstance = databaseFactory()
			const userInstance = await databaseInstance.usersInstances()
			await connectDb()
			const userDb = await userInstance.getProfileUser(data.email)
			

			if (userDb) {
				return res.status(401).json({ message: 'L\'utilisateur existe déjà' })
			}

			await userInstance.addUser(data.ressources)
			
			await disconnectDb()
			return res.status(201).json({ message: 'Inscription réussis' })
		} catch (error) {
			console.log(error)
			return res.status(500).json({ message: 'Internal error' })
		}
	}

	connexion = async (req, res) => {
		try {
			const { email, password } = req.body

			const { isEmail, errorEmailMessage } = this.#validationEmail(email)
			const { isValidPassword, errorPasswordMessage } = this.#validationPassword(password)

			if (!isEmail) {
				return res.status(401).json({ message: errorEmailMessage })
			}

			if (!isValidPassword) {
				return res.status(401).json({ message: errorPasswordMessage })
			}
			const databaseInstance = databaseFactory()
			const userInstance = await databaseInstance.usersInstances()
			await connectDb()
			const userDb = await userInstance.getProfileUser(email)
			await disconnectDb()

			if (!userDb) {
				return res.status(401).json({ message: 'L\'email ou le mot de passe sont invalide' })
			}

			const passwordMatch = await bcrypt.compare(password, userDb.password)

			if (!passwordMatch) {
				return res.status(401).json({ message: 'L\'email ou le mot de passe sont invalide' })
			}

			const newToken = await this.encrypt.tokenCreation(userDb.id, userDb.password)

			const profile = this.#connexionProfile(userDb, newToken)

			return res.status(200).json(profile)
		} catch (error) {
			console.log(error)
			return res.status(500).json({ message: 'Internal server error' })
		}
	}

	forgotPassword = async (req, res) => {
		const email = req.body.email
		const { isValidCredentiel, message } = this.#validationEmail(email)

		if (isValidCredentiel) {
			return res.status(401).json({ message })
		}

		const databaseInstance = databaseFactory()
		const userInstance = await databaseInstance.usersInstances()
		await connectDb()

		const user = await userInstance.getProfileUser(email)

		if (user) {
			const { codeNumber, expiresIn } = this.encrypt.generetedCode()
			await userInstance.addCodeNumber(codeNumber, expiresIn, user._id)
			await sendEmailResetPassword(email, codeNumber)
		}

		await disconnectDb()

		return res.status(200).json({ 'id': user.id })
	}

	verifyCode = async (req, res) => {
		const { idUser, code } = req.body 
		const isCode = IS_CODE_NUMBER.test(parseInt(code))

		if (!isCode) {
			return res.status(401).json({ message: 'Ce n\'est pas le bon code' })
		}

		const databaseInstance = databaseFactory()
		const userInstance = await databaseInstance.usersInstances()

		await connectDb()

		const user = await userInstance.getUserById(idUser)

		if (user) {
			
			const storeCodeNumberInData = await userInstance.getCodeByNumber(code)
			
			if (!storeCodeNumberInData) {
				return res.status(400).json({ message: 'Code invalide' })
			}
			
			else if (Date.now() > storeCodeNumberInData.expiresIn) {
				return res.status(400).json({ message: 'Demande expiré' })
			} 
			
			else {
				return res.status(200).json({ 'id': user.id })
			}
		}
		await disconnectDb()
	}

	resetPassword = async (req, res) => {
		let verifyToken 
		const { password, token, id } = req.body

		const { isValidPassword, errorPasswordMessage } = this.#validationPassword(password)

		if (token){
			verifyToken = await this.encrypt.verifyToken(token)
		}

		if (!isValidPassword) {
			return res.status(401).json({ message: errorPasswordMessage })
		}

		const databaseInstance = databaseFactory()
		const userInstance = await databaseInstance.usersInstances()

		await connectDb()
				
		const idUser = verifyToken ? verifyToken.id :  id
		const userInDb = await userInstance.getUserById(idUser)

		if (!userInDb) {
			return res.status(401).json({ message: 'Utilisateur introuvable' })
		}

		const encryptNewPassword = this.encrypt.passwordEncrypt(password)
		const ressource = {
			role: userInDb.role,
			password: encryptNewPassword,
		}
		const { isError, errorMessage } = userInstance.updateUser(userInDb.id, ressource)
		if (isError) {
			return res.status(401).json({ message: errorMessage })
		}
		return res.status(200).json({ message: 'Mot de passe changé avec succès' })
	}

	deleteUser = async (req, res) => {
		try {
			if (!req.body) {
				return res.status(401).json({ message: 'Missing body params' })
			}

			const isRole = IS_STRING.test(req.body.role)
			const isIdUser = IS_NUMBER.test(req.body.id)

			if (!isRole) {
				return res.status(401).json({ message: 'Role must be string' })
			}

			if (!isIdUser) {
				return res.status(401).json({ message: 'Id must be integer' })
			}

			const user = communInstance()
			const userIsPresent = await user.getUserById(req.body.role, req.body.id)

			if (!userIsPresent) {
				return res.status(400).json({ message: 'error delete user not found' })
			}

			await user.deleteUser(req.body.id, req.body.role)
			return res.status(200).json({ message: 'delete user' })
		} catch (error) {
			console.log(error)
			return res.status(500).json({ message: 'Internal server error' })
		}
	}

	updateProfile = async (req, res) => {
		try {
			const { userId } = req.body
			const isValidId = IS_NUMBER.test(userId) && userId

			if (!isValidId) {
				return res.status(401).json({ message: 'Id must be integer' })
			}
			const user = communInstance()
			const userFound = await user.getUserById(userId)

			if (!userFound) {
				return res.status(404).json({ message: 'user not found' })
			}

			// const files = req.files // Liste des fichiers uploadés
			// const baseUrl = `${req.protocol}://${req.get('host')}` // URL de base du serveur

			const updateProfile = this.#newDataValidation(req.body, userFound.dataValues.role)

			const { isError, message } = await user.updateUser(userId, updateProfile)

			if (isError) {
				return res.status(404).json({ message })
			}

			return res.status(200).json({ message })
		} catch (error) {
			console.error(error)
			return res.status(500).json({ message: 'Internal server error' })
		}
	}

	getMatchesController = async (req, res) => {
		try {
			
			const databaseInstance = databaseFactory()
			const userInstance = await databaseInstance.usersInstances()
			await connectDb()
			const matches = await userInstance.getMatches()
			await disconnectDb()
			return res.status(200).json(matches)
		} catch (error) {
			console.log(error)
			return res.status(500).json({ message: 'Internal error' })
		}
	}

	getFiltersController = async (req, res) => {
		try {
			const databaseInstance = databaseFactory()
			const userInstance = await databaseInstance.usersInstances()
			await connectDb()
			const filters = await userInstance.getAllFilters()
			await disconnectDb()
			return res.status(200).json({ filters })
		} catch (error) {
			console.error(error)
			return res.status(500).json({ message: errorServer })
		}
	}
}