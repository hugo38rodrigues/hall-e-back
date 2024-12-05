export class Midleware {
	constructor () {}

	verifyRoleInBody = (req, res, next) => {
		if (!req.body.role) {
			return res.status(400).json({ message: 'The “role” field is missing' })
		}

		if (req.body.role !== 'client' && req.body.role !== 'bar') {
			return res
				.status(401)
				.json({ message: `The role ${req.body.role} is not accepted` })
		}

		next()
	}
}
