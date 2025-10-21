import Logger from '../middleware/logger.js'

export class ClientController {
	constructor() {
		this.newLogger = new Logger()
	}

	// Code a ajouter pour la v2
	// addLikeBarController = async (req, res) => {
	// const barId = req.body.barId
	// const clientId = req.body.clientId
	// const barIdIsInteger = barId && IS_NUMBER.test(barId)
	// const clientIdIsInteger = clientId && IS_NUMBER.test(clientId)

	// if (!barIdIsInteger || !clientIdIsInteger) {
	// return res.status(401).json({ message: "L'id client ou l'id du bar n'est pas un number" })
	// }

	// const newClient = clientInstance()

	// const clientIdIsValid = await newClient.getClient(clientId)
	// const barIdIsValid = await newClient.getBar(barId)

	// if (!clientIdIsValid || !barIdIsValid) {
	// return res.status(401).json({ message: "l'id client ou l'id du bar est introuvable" })
	// }

	// const isLikedBar = await newClient.addLikeBar(clientId, barId)

	// if (!isLikedBar) {
	// const isDissLikeBar = await newClient.dissLikeBar(clientId, barId)

	// if (!isDissLikeBar) {
	// return res.status(401).json({ message: 'Impossible to dissLike a bar' })
	// }

	// return res.status(200).json({ message: 'Bar is dissliked' })
	// }

	// return res.status(200).json({ mesaage: 'Bar is liked' })
	// }

	// Code a ajouter pour la v2
	// addCommentsController = (req, res) => {}
}
