import { connectDb, databaseFactory, disconnectDb } from 'bdd-service-hall-e'


export class ClientController {
	constructor () {}

	#formatedDataBar = (data) => {
		const newMap = data.map((item) => {
			return {
				id: item._id,
				role: item.role,
				informations: {
					name: item.name,
					description: item.description,
					address: item.address,
					pictures: item.pictures,
					longitude: item.longitude,
					latitude: item.latitude,
				},
				programmedMatches: item.programmedMatches,
			}
		})
		return newMap
	}

	#filterAndSortMatches = (data) => {
		const now = new Date()
		const today = now.toISOString().split('T')[0] // YYYY-MM-DD
		const currentTime = now.getTime() // Timestamp actuel

		data.forEach((bar) => {
			bar.programmedMatches = bar.programmedMatches.filter((match) => {
				const matchDate = new Date(match.date)
				const matchDay = matchDate.toISOString().split('T')[0] // YYYY-MM-DD

				// Supprime les matchs d'avant aujourd’hui
				if (matchDay < today) return false

				// Si c'est aujourd’hui, on garde uniquement les matchs futurs
				if (matchDay === today && matchDate.getTime() < currentTime) return false

				return true
			})
		})

		return data
	}

	getAllBarController = async (req, res) => {
		try {
			const databaseInstance = databaseFactory()
			const clientInstance = await databaseInstance.clientInstance()

			await connectDb()
			const barList = await clientInstance.getBars()
			const bars = this.#filterAndSortMatches(barList)
			const formatedDataBar = this.#formatedDataBar(bars)

			await disconnectDb()

			return res.status(200).json({ data: formatedDataBar })
		} catch (error) {
			console.error(error.message)
			return res.status(500).json({ message: 'Erreur Serveur' })
		}
	}

	// Code a ajouter pour la v2
	// addLikeBarController = async (req, res) => {
	// 	const barId = req.body.barId
	// 	const clientId = req.body.clientId
	// 	const barIdIsInteger = barId && IS_NUMBER.test(barId)
	// 	const clientIdIsInteger = clientId && IS_NUMBER.test(clientId)

	// 	if (!barIdIsInteger || !clientIdIsInteger) {
	// 		return res.status(401).json({ message: "L'id client ou l'id du bar n'est pas un number" })
	// 	}

	// 	const newClient = clientInstance()

	// 	const clientIdIsValid = await newClient.getClient(clientId)
	// 	const barIdIsValid = await newClient.getBar(barId)

	// 	if (!clientIdIsValid || !barIdIsValid) {
	// 		return res.status(401).json({ message: "l'id client ou l'id du bar est introuvable" })
	// 	}

	// 	const isLikedBar = await newClient.addLikeBar(clientId, barId)

	// 	if (!isLikedBar) {
	// 		const isDissLikeBar = await newClient.dissLikeBar(clientId, barId)

	// 		if (!isDissLikeBar) {
	// 			return res.status(401).json({ message: 'Impossible to dissLike a bar' })
	// 		}

	// 		return res.status(200).json({ message: 'Bar is dissliked' })
	// 	}

	// 	return res.status(200).json({ mesaage: 'Bar is liked' })
	// }

	// Code a ajouter pour la v2
	// addCommentsController = (req, res) => {}
}
