import mongoose from 'mongoose'
import Comment from '../model/mongodb/comment.model.js'
import Like from '../model/mongodb/like.model.js'
import Picture from '../model/mongodb/picture.model.js'
import Bar from '../model/mongodb/bar.model.js'
import Client from '../model/mongodb/client.model.js'

export const verifyConnexion = async (config) => {
	const uri = `mongodb://${config.username}:${config.password}@${config.url}/${config.nameDatabase}?authSource=admin`
	try {
		// Connexion avec Mongoose
		await mongoose.connect(uri, {
			connectTimeoutMS: 10000, // 10 secondes pour établir la connexion
			socketTimeoutMS: 45000, // 45 secondes pour les opérations une fois connecté
		})
		console.log('Connexion à MongoDB avec Mongoose réussie !')
		return true
	} catch (err) {
		console.error('Erreur de connexion à MongoDB avec Mongoose :', err)
		return false
	} finally {
		// Ferme la connexion Mongoose après le test
		await mongoose.disconnect()
	}
}


export const connectDb = async (config) => {
	const uri = `mongodb://${config.username}:${config.password}@${config.url}/${config.nameDatabase}?authSource=admin`
	try {
		await mongoose.connect(uri, {
			connectTimeoutMS: 10000,
			socketTimeoutMS: 45000,
		})
		console.log('Connexion à MongoDB réussie')
	} catch (err) {
		console.error('Erreur de connexion à MongoDB :', err)
	}
}

export const disconnectDb = async (config) => {
	const uri = `mongodb://${config.username}:${config.password}@${config.url}/${config.nameDatabase}?authSource=admin`
	await mongoose.disconnect()
	console.log('Déconnexion de MongoDB réussie')
}

export const registerModels = () => {
	// Enregistrer tous les modèles (si ce n'est pas déjà fait)
	if (!mongoose.models.Comment) mongoose.model('Comment', Comment.schema)
	if (!mongoose.models.Like) mongoose.model('Like', Like.schema)
	if (!mongoose.models.Picture) mongoose.model('Picture', Picture.schema)
	if (!mongoose.models.Bar) mongoose.model('Bar', Bar.schema)
	if (!mongoose.models.Client) mongoose.model('Client', Client.schema)
}