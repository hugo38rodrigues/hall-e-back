import bcryptjs from 'bcryptjs'

export class PasswordHasher {
	constructor(saltRounds = 12) {
		this.saltRounds = saltRounds
	}

	hash = async (password) => bcryptjs.hash(password, this.saltRounds)

	verifyPassword = async (password, passwordDb) => bcryptjs.compare(password, passwordDb)
}
