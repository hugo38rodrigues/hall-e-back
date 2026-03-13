export const generetedCode = () => {
	const codeNumber = Math.floor(100000 + Math.random() * 900000).toString() // 6 chiffres
	const expiresIn = Date.now() + 10 * 60 * 1000 // Expiration dans 5 minutes
	return { codeNumber, expiresIn }
}
