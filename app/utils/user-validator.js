import { BAR_ERRORS, CLIENT_ERRORS } from './constants.js'
import {
	IS_ADDRESS, IS_BAR_NAME, IS_DESCRIPTION, IS_EMAIL, IS_PASSWORD, IS_STRING,
} from './regex.js'

export class UserValidator {
	validateClient(body) {
		const isValidEmail = body.email && IS_EMAIL.test(body.email)
		const isValidPassword = body.password && IS_PASSWORD.test(body.password)
		if (!isValidEmail || !isValidPassword) return CLIENT_ERRORS.INVALID_CREDENTIALS

		const isValidFirstName = body.informations.firstName
		&& IS_STRING.test(body.informations.firstName)
		const isValidLastName = body.informations.lastName && IS_STRING.test(body.informations.lastName)
		if (!isValidFirstName || !isValidLastName) return CLIENT_ERRORS.INVALID_NAME

		return null
	}

	validateBar(body) {
		if (!IS_EMAIL.test(body.email) || !IS_PASSWORD.test(body.password)) {
			return BAR_ERRORS.INVALID_CREDENTIALS
		}
		if (!IS_ADDRESS.test(body.informations.address)) return BAR_ERRORS.INVALID_ADDRESS
		if (body.informations.description && !IS_DESCRIPTION.test(body.informations.description)) {
			return BAR_ERRORS.INVALID_DESCRIPTION
		}
		if (!IS_BAR_NAME.test(body.informations.name)) return BAR_ERRORS.INVALID_NAME
		return null
	}

	isValidEmail(email) {
		return email !== '' && IS_EMAIL.test(email)
	}

	validatePassword(password) {
		if (!IS_PASSWORD.test(password)) {
			return { isValidPassword: false, errorPasswordMessage: 'Mot de passe invalide' }
		}
		return { isValidPassword: true, errorPasswordMessage: '' }
	}
}
