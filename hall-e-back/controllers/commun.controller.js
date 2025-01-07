import bcrypt from 'bcrypt'
import { Crypt } from '../controllers/encryption.controller.js'
import { communInstance } from '../utils/classes-instance-dispatcher.js'
import { sendEmailResetPassword } from '../utils/email.js'
import {
	IS_ADDRESS,
	IS_BAR_NAME,
	IS_DESCRIPTION,
	IS_EMAIL,
	IS_NUMBER,
	IS_PASSWORD,
	IS_STRING,
} from '../utils/regex.js'

export class CommunController {
	#bddTarget

	constructor () {
		this.#bddTarget = process.env.BDD_TARGET
		this.encrypt = new Crypt()
	}

	#formatData = (body) => {
		if (body.role === 'client') {
			return {
				firstName: body.firstName,
				lastName: body.lastName,
				email: body.email,
				password: this.encrypt.passwordEncrypt(body.password),
				role: body.role,
			}
		}

		if (body.role === 'bar') {
			return {
				name: body.name,
				address: body.address,
				email: body.email,
				password: this.encrypt.passwordEncrypt(body.password),
				role: body.role,
				price: body.price,
				description: body.description,
				photo: body.photo,
			}
		}
	}

	#clientAccountVerify = (body) => {
		const isEmail = IS_EMAIL.test(body.email)
		const isPassword = IS_PASSWORD.test(body.password)
		const isFirstName = IS_STRING.test(body.firstName)
		const isLastName = IS_STRING.test(body.lastName)
		const isValidEmail = body.email && isEmail
		const isValidPassword = body.password && isPassword
		const isValidLastName = body.lastName && isLastName
		const isValidFirstName = body.firstName && isFirstName

		if (!isValidEmail || !isValidPassword) {
			return { isValid: false, message: 'Missing email or password' }
		}

		if (!isValidLastName || !isValidFirstName) {
			return { isValid: false, message: 'Missing first name or last name' }
		}
		const ressources = this.#formatData(body)

		return {
			ressources,
			isValid: true,
		}
	}

	#barAccountVerify = (body) => {
		const isEmail = IS_EMAIL.test(body.email)
		const isPassword = IS_PASSWORD.test(body.password)
		const isAddress = IS_ADDRESS.test(body.address)
		const isName = IS_BAR_NAME.test(body.name)
		const isDescription = IS_DESCRIPTION.test(body.description)

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
				message:
					'Is invalid description',
			}
		}

		if (!isName) {
			return { isValid: false, message: 'Is invalid name' }
		}
		const ressources = this.#formatData(body)

		return {
			ressources,
			isValid: true,
		}
	}

	#validationEmail = (email) => {
		const isEmail = IS_EMAIL.test(email)

		if (!isEmail) {
			return {
				isValidEmail: false,
				errorEmailMessage: 'L\'email n\'est pas au bon format',
			}
		}

		return {
			isValidEmail: true,
		}
	}

	#validationPassword = (password) => {
		const isPassword = IS_PASSWORD.test(password)

		if (!isPassword) {
			return {
				isValidPassword: false,
				errorPasswordMessage: 'Le mot de passe n\'est pas au bon format',
			}
		}
		return {
			isValidPassword: true,
			errorPasswordMessage: '',
		}
	}

	#connexionProfile = (data, token) => {
		let profileData 
		if (data.role === 'bar'){
			profileData = {
				name: data.name,
				address: data.address,
				price: data.price,
				description: data.description,
				picture: data.pictures
			}
		}

			else {
				profileData = {
					firsName: data.firstName,
					lastName: data.lastName,
					likeBar: data.likeBar
				}
			}
		
		
		return {
			id: data.id,
			email: data.email,
			role: data.role,
			token: token,
			informations: profileData
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
				role
			}
		}
	}

	createAccount = async (req, res) => {
		const role = req.body.role
		let data
		try {
			if (role === 'client') {
				data = this.#clientAccountVerify(req.body, res)
			}

			if (role === 'bar') {
				data = this.#barAccountVerify(req.body, res)
			}

			if (!data.isValid) {
				return res.status(401).json({ message: data.message })
			}

			const user = communInstance(this.#bddTarget)
			const userIsFound = await user.getUserIsFound(data.ressources.email)

			if (userIsFound) {
				return res.status(401).json({ message: 'The user already exists' })
			}

			await user.addUser(data.ressources)

			return res.status(201).json({ message: 'Sign in success' })
		} catch (error) {
			console.log(error)
			return res.status(500).json({ message: 'Internal error' })
		}
	}

	connexion = async (req, res) => {
		try {
			const userPassword = req.body.password
			const email = req.body.email

			const { isValidEmail, errorEmailMessage } = this.#validationEmail(email)
			const { isValidPassword, errorPasswordMessage } =
				this.#validationPassword(userPassword)

			if (!isValidEmail) {
				return res.status(401).json({ errorEmailMessage })
			}

			if (!isValidPassword) {
				return res.status(401).json({ errorPasswordMessage })
			}

			const newUser = communInstance(this.#bddTarget)
			const userInDb = await newUser.getProfileUser(email)

			if (!userInDb) {
				return res
					.status(401)
					.json({ message: 'L\'email ou le mot de passe sont invalide' })
			}

			const isMatchPassword = await bcrypt.compare(
				userPassword,
				userInDb.password
			)

			if (!isMatchPassword) {
				return res
					.status(401)
					.json({ message: 'L\'email ou le mot de passe sont invalide' })
			}

			const validToken = await this.encrypt.tokenCreation(
				userInDb.id,
				userInDb.password
			)

			const profile = { ...userInDb.dataValues, token: validToken }
			const { password, ...newProfile } = profile
			return res.status(200).json({ newProfile })
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

		const newUser = communInstance(this.#bddTarget)

		const userIsFound = await newUser.getProfileUser(email)

		console.log(userIsFound)
		if (userIsFound) {
			const token = await this.encrypt.tokenCreation(
				userIsFound.dataValues.id,
				email
			)
			await sendEmailResetPassword(email, token)
		}

		return res.status(200).json({
			message: `Un email a était envoyer à cette addresse email: ${email}`,
		})

	}

	resetPassword = async (req, res) => {
		const newPassword = req.body.newPassword
		const token = req.body.token
		

		const { isValidPassword, errorPasswordMessage } = this.#validationPassword(newPassword)
		const verifyToken = await this.encrypt.verifyToken(token)

		if (!isValidPassword) {
			return res.status(401).json({ message: errorPasswordMessage })
		}

		const newUser = communInstance(this.#bddTarget)
		const userInDb = await newUser.getUserById(verifyToken.id)
		
		if (!userInDb) {
			return res.status(401).json({ message: 'Utilisateur introuvable' })
		}
		
		const encryptNewPassword = this.encrypt.passwordEncrypt(newPassword)
		const ressource = {
			role: userInDb.dataValues.role,
			password: encryptNewPassword,
		}
		const { isError, errorMessage } = newUser.updateUser(userInDb.dataValues.id, ressource)
		if (isError){
			return res.status(401).json({ message: errorMessage })
		}
		return res.status(200).json({ message: 'Mot de passe changer avec success' })
	}

	verifyToken = async (req, res) => {
		const token = req.body.token
		const isToken = await this.encrypt.verifyToken(token)
		if (isToken) {
			return res.status(200).json({ isValid: true })
		}

		return res.status(403).json({ isValid: false })
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

			const user = communInstance(this.#bddTarget)
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
			
			const userId = req.body.id
			const isValidId = IS_NUMBER.test(userId) && userId

			if (!isValidId) {
				return res.status(401).json({ message: 'Id must be integer' })
			}
			const user = communInstance(this.#bddTarget)
			const userFound = await user.getUserById(userId)
			
			if (!userFound) {
				return res.status(404).json({ message: 'user not found' })
			}

			  // const files = req.files // Liste des fichiers uploadés
				// const baseUrl = `${req.protocol}://${req.get('host')}` // URL de base du serveur

			
			const updateProfile = this.#newDataValidation(req.body, userFound.dataValues.role)
	
			const { isError, message } = await user.updateUser(userId, updateProfile)

			if (isError) {
				return res.status(404).json({ message } )
			}
			
			return res.status(200).json({ message })
		} catch (error) {
			console.error(error)
			return res.status(500).json({ message: 'Internal server error' })
		}
	}

	getMatchesController = async (req, res) => {
		try {
			const newUser = communInstance(this.#bddTarget)
			const matches = await newUser.getMatches()
			// const logo1 = await get(matches.team1.logo_url)
			// const logo2 = await get(matches.team2.logo_url)
			// matches.teams1.logo = logo1
			// matches.teams2.logo = logo2

			return res.status(200).json({ data: matches })
		} catch (error) {
			console.log(error)
			return res.status(500).json({ message: 'Internal error' })
		}
	}

}
