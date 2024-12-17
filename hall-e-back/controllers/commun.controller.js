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

import { get } from '../utils/request-http.js'

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
		const isSignIn = true
		const ressources = this.#formatData(body, isSignIn)

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
				message:
					'Address must be in number of street street, postal code, City',
			}
		}

		if (!isDescription) {
			return {
				isValid: false,
				message:
					'Description is a string and must be a description of your bar',
			}
		}

		if (!isName) {
			return { isValid: false, message: 'Missing name or name must be string' }
		}
		const ressources = this.#formatData(body)

		return {
			ressources,
			isValid: true,
		}
	}

	#connexionValidationFrom = (email, password) => {
		const isEmail = IS_EMAIL.test(email)
		const isPassword = IS_PASSWORD.test(password)

		if (!isEmail || !isPassword) {
			return false
		}

		const ressources = {
			email,
			password,
		}

		return {
			isValid: true,
			ressources,
		}
	}

	#updateFormValidation = (body, res) => {
		const isEmail = IS_EMAIL.test(body.email)
		const isPassword = IS_PASSWORD.test(body.password)

		if (body.email && !isEmail) {
			return res
				.status(401)
				.json({ message: 'Email must be in xxx@xxx.xxx or xxx.xxx@xxx.xxx' })
		}

		if (body.password && !isPassword) {
			return res.status(401).json({ message: 'Password is not token' })
		}

		if (body.role === 'client') {
			const isFirstName = IS_STRING.test(body.firstName)
			const isLastName = IS_STRING.test(body.lastName)

			if (!isFirstName) {
				return res.status(401).json({ message: 'First name must be string' })
			}

			if (!isLastName) {
				return res.status(401).json({ message: 'Last name must be string' })
			}

			const ressources = this.#formatData(body)

			return {
				ressources,
				isValid: true,
			}
		}

		if (body.role === 'bar') {
			const isName = IS_BAR_NAME.test(body.name)
			const isAddress = IS_ADDRESS.test(body.address)
			const isDescription = IS_DESCRIPTION.test(body.description)

			if (body.address) {
				if (!isAddress) {
					return res.status(401).json({
						message: 'Address must be in 12 rue de la paix, 75008, Paris',
					})
				}
			}

			if (body.description) {
				if (!isDescription) {
					return res
						.status(401)
						.json({ message: 'Description must be a description of your bar' })
				}
			}

			if (!isName) {
				return res.status(401).json({ message: 'Name must be string' })
			}

			const ressources = this.#formatData(body)

			return {
				ressources,
				isValid: true,
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
			const userIsFound = await user.getUserIsFound(role, data.ressources.email)

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
			const password = req.body.password
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
			if (!req.body) {
				return res.status(400).json({ message: 'Missing params' })
			}

			const isValidId = IS_NUMBER.test(req.body.id) && req.body.id

			if (!isValidId) {
				return res.status(401).json({ message: 'Id must be integer' })
			}

			const { isValid, ressources } = this.#updateFormValidation(req.body, res)

			if (!isValid) {
				return
			}

			const user = communInstance(this.#bddTarget)
			const isVerifyId = await user.getUserById(req.body.role, req.body.id)

			if (!isVerifyId) {
				return res.status(400).json({ message: 'user not found' })
			}

			const { isError, message } = await user.updateUser(
				req.body.id,
				ressources
			)

			if (isError) {
				return res.status(400).json({ message })
			}
			return res.status(200).json({ message: 'Update  account' })
		} catch (error) {
			console.log(error)
			return res.status(500).json({ message: 'Internal server error' })
		}
	}

	getMatchesController = async (req, res) => {
		try {
			const newUser = communInstance(this.#bddTarget)
			const matches = await newUser.getMatches()
			console.log(matches)
			const logo1 = await get(matches.team1.logo_url)
			const logo2 = await get(matches.team2.logo_url)
			console.log(logo1)
			matches.teams1.logo = logo1
			matches.teams2.logo = logo2

			return res.status(200).json({ data: matches })
		} catch (error) {
			console.log(error)
			return res.status(500).json({ message: 'Internal error' })
		}
	}

	addFavorisGameController = async (req, res) => {
		try {
			const gameId = req.body.gameId
			const userId = req.body.userId
			const role = req.body.role
			const isvalidGameId = gameId && IS_NUMBER.test(gameId)
			const isvalidUserId = userId && IS_NUMBER.test(userId)

			if (!isvalidGameId || !isvalidUserId) {
				return res
					.status(401)
					.json({ message: 'The id bar or game id is not a number' })
			}

			const newUser = communInstance(this.#bddTarget)

			const userIsFound =
				role === 'client'
					? await newUser.getClient(userId)
					: await newUser.getBar(userId)
			const favoriteMethode =
				role === 'client' ? 'addFavoriteGame' : 'addFavoriteGamesBar'

			const game = await newUser.getGame(gameId)

			if (!userIsFound || !game) {
				return res.status(401).json({ message: 'Unknown user or unknown game' })
			}

			const isAddFavorisGame = await newUser.addFavoriteGame(
				userIsFound,
				game,
				favoriteMethode
			)

			if (!isAddFavorisGame) {
				return res.status(401).json({ message: 'The game already exists' })
			}

			res.status(200).json({ message: 'Games added to favorites' })
		} catch (error) {
			console.log(error)
			res.status(500).json({ message: 'Internal error' })
		}
	}

	deleteFavorisGameController = async (req, res) => {
		try {
			const gameId = req.body.gameId
			const userId = req.body.userId
			const role = req.body.role
			const isvalidGameId = gameId && IS_NUMBER.test(gameId)
			const isvalidUserId = userId && IS_NUMBER.test(userId)

			if (!isvalidGameId || !isvalidUserId) {
				return res
					.status(401)
					.json({ message: 'The id user or game id is not a number' })
			}

			const newUser = communInstance(this.#bddTarget)

			const userIsFound =
				role === 'client'
					? await newUser.getClient(userId)
					: await newUser.getBar(userId)
			const favoriteMethode =
				role === 'client' ? 'removeFavoriteGame' : 'removeFavoriteGamesBar'
			const game = await newUser.getGame(gameId)

			if (!userIsFound || !game) {
				return res.status(401).json({ message: 'Unknown user or unknown game' })
			}

			const isAddFavorisGame = await newUser.removeFavoriteGame(
				userIsFound,
				game,
				favoriteMethode
			)

			if (!isAddFavorisGame) {
				return res.status(401).json({ message: 'Unable to delete the game' })
			}

			res.status(200).json({ message: 'Games removed from favorites' })
		} catch (error) {
			console.log(error)
			res.status(500).json({ messag: 'Internal error' })
		}
	}

	addFavorisTeamController = async (req, res) => {
		try {
			const teamId = req.body.teamId
			const userId = req.body.userId
			const role = req.body.role
			const isvalidTeamId = teamId && IS_NUMBER.test(teamId)
			const isvalidUserId = userId && IS_NUMBER.test(userId)

			if (!isvalidTeamId || !isvalidUserId) {
				return res
					.status(401)
					.json({ message: 'The id bar or team id is not a number' })
			}

			const newUser = communInstance(this.#bddTarget)

			const userIsFound =
				role === 'client'
					? await newUser.getClient(userId)
					: await newUser.getBar(userId)
			const favoriteMethode =
				role === 'client' ? 'addFavoriteTeam' : 'addFavoriteTeamsBar'

			const team = await newUser.getTeam(teamId)

			if (!userIsFound || !team) {
				return res.status(401).json({ message: 'Unknown user or unknown team' })
			}

			const isAddFavorisTeam = await newUser.addFavoriteTeam(
				userIsFound,
				team,
				favoriteMethode
			)

			if (!isAddFavorisTeam) {
				return res.status(401).json({ message: 'The team already exists' })
			}

			res.status(200).json({ message: 'Team added to favorites' })
		} catch (error) {
			console.log(error)
			res.status(500).json({ message: 'Internal error' })
		}
	}

	deleteFavorisTeamController = async (req, res) => {
		try {
			const teamId = req.body.teamId
			const userId = req.body.userId
			const role = req.body.role
			const isvalidGameId = teamId && IS_NUMBER.test(teamId)
			const isvalidUserId = userId && IS_NUMBER.test(userId)

			if (!isvalidGameId || !isvalidUserId) {
				return res
					.status(401)
					.json({ message: 'The id user or team id is not a number' })
			}

			const newUser = communInstance(this.#bddTarget)

			const userIsFound =
				role === 'client'
					? await newUser.getClient(userId)
					: await newUser.getBar(userId)
			const favoriteMethode =
				role === 'client' ? 'addFavoriteTeam' : 'addFavoriteTeamsBar'
			const team = await newUser.getTeam(teamId)

			if (!userIsFound || !team) {
				return res.status(401).json({ message: 'Unknown user or unknown team' })
			}

			const isAddFavorisTeam = await newUser.removeFavoriteTeam(
				userIsFound,
				team,
				favoriteMethode
			)

			if (!isAddFavorisTeam) {
				return res
					.status(401)
					.json({ message: 'Impossible to delete the team' })
			}

			res.status(200).json({ message: 'Team removed from favorites' })
		} catch (error) {
			console.log(error)
			res.status(500).json({ message: 'Internal error' })
		}
	}

	addFavorisLeagueController = async (req, res) => {
		try {
			const leagueId = req.body.leagueId
			const userId = req.body.userId
			const role = req.body.role
			const isvalidLeagueId = leagueId && IS_NUMBER.test(leagueId)
			const isvalidUserId = userId && IS_NUMBER.test(userId)

			if (!isvalidLeagueId || !isvalidUserId) {
				return res
					.status(401)
					.json({ message: 'The user id or league id is not a number.' })
			}

			const newUser = communInstance(this.#bddTarget)

			const userIsFound =
				role === 'client'
					? await newUser.getClient(userId)
					: await newUser.getBar(userId)
			const favoriteMethode =
				role === 'client' ? 'addFavoriteLeague' : 'addFavoriteLeaguesBar'
			const league = await newUser.getLeague(leagueId)

			if (!userIsFound || !league) {
				return res
					.status(401)
					.json({ message: 'Unknown user or unknown league' })
			}

			const isAddFavorisLeague = await newUser.addFavoriteLeague(
				userIsFound,
				league,
				favoriteMethode
			)

			if (!isAddFavorisLeague) {
				return res.status(401).json({ message: 'The league already exist' })
			}

			res.status(200).json({ message: 'League added to favorites' })
		} catch (error) {
			console.log(error)
			res.status(500).json({ message: 'Internal error' })
		}
	}

	deleteFavorisLeagueController = async (req, res) => {
		try {
			const leagueId = req.body.leagueId
			const userId = req.body.userId
			const role = req.body.role
			const isvalidLeagueId = leagueId && IS_NUMBER.test(leagueId)
			const isvalidUserId = userId && IS_NUMBER.test(userId)

			if (!isvalidLeagueId || !isvalidUserId) {
				return res
					.status(401)
					.json({ message: 'The user id or league id is not a number.' })
			}

			const newUser = communInstance(this.#bddTarget)

			const userIsFound =
				role === 'client'
					? await newUser.getClient(userId)
					: await newUser.getBar(userId)
			const favoriteMethode =
				role === 'client' ? 'addFavoriteLeague' : 'addFavoriteLeaguesBar'
			const league = await newUser.getLeague(leagueId)

			if (!userIsFound || !league) {
				return res.status(401).json({ message: 'Unknown user or league' })
			}

			const isAddFavorisLeague = await newUser.removeFavoriteLeague(
				userIsFound,
				league,
				favoriteMethode
			)

			if (!isAddFavorisLeague) {
				return res
					.status(401)
					.json({ message: 'Impossible to deleted the league' })
			}

			res.status(200).json({ message: 'League removed from favorites' })
		} catch (error) {
			console.log(error)
			res.status(500).json({ message: 'Internal error' })
		}
	}
}
