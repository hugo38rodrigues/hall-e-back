import bcryptjs from 'bcryptjs'

export const passwordEncrypt = (password) => {
	const encryptPassword = bcryptjs.hashSync(password, 10)
	return encryptPassword
}

export const verifyPassword = async (password, passwordDb) => bcryptjs.compare(password, passwordDb)
