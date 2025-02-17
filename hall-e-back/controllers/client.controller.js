import { IS_NUMBER } from '../utils/regex.js'

export class ClientController {
	#bddTarget

	constructor () {
		this.#bddTarget = process.env.BDD_TARGET
	}

	getMatchController = async (req, res) => {
		try {
			const client = clientInstance(this.#bddTarget)
			const allMatches = await client.getMatch()

			if (allMatches) {
				return res.status(200).json({ data: allMatches })
			} else {
				return res
					.status(404)
					.json({ message: 'Error when retrieving matches' })
			}
		} catch (error) {
			console.error(error)
			return res.status(500).json({ message: 'Internal error' })
		}
	}

	addLikeBarController = async (req, res) => {
		const barId = req.body.barId
		const clientId = req.body.clientId
		const barIdIsInteger = barId && IS_NUMBER.test(barId)
		const clientIdIsInteger = clientId && IS_NUMBER.test(clientId)

		if (!barIdIsInteger || !clientIdIsInteger) {
			return res
				.status(401)
				.json({ message: 'L\'id client ou l\'id du bar n\'est pas un number' })
		}

		const newClient = clientInstance(this.#bddTarget)

		const clientIdIsValid = await newClient.getClient(clientId)
		const barIdIsValid = await newClient.getBar(barId)

		if (!clientIdIsValid || !barIdIsValid) {
			return res
				.status(401)
				.json({ message: 'l\'id client ou l\'id du bar est introuvable' })
		}

		const isLikedBar = await newClient.addLikeBar(clientId, barId)

		if (!isLikedBar) {
			const isDissLikeBar = await newClient.dissLikeBar(clientId, barId)

			if (!isDissLikeBar) {
				return res.status(401).json({ message: 'Impossible to dissLike a bar' })
			}

			return res.status(200).json({ message: 'Bar is dissliked' })
		}

		return res.status(200).json({ mesaage: 'Bar is liked' })
	}

	// addCommentsController = (req, res) => {}
}
