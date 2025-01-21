// models/League.js
import mongoose from 'mongoose'

// Définition du modèle Game
const leagueSchema = new mongoose.Schema({
	_id: Schema.Types.ObjectId,
	name: {
		type: String,
		required: true,
		unique: true,
	},
})

const Game = mongoose.model('League', leagueSchema)

export default Game
