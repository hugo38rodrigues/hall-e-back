// models/Match.js
import mongoose, {Schema} from 'mongoose'

// Définition du modèle Match
const matchSchema = new mongoose.Schema({
	_id: Schema.Types.ObjectId,
	id_match: {
		type: Number,
		required: true,
		unique: true,
	},
	date: {
		type: Date,
	},
	game: {
		type: Schema.Types.ObjectId,
		ref: 'Game', // Référence au modèle Game
		required: true,
	},
	league: {
		type: Schema.Types.ObjectId,
		ref: 'League', // Référence au modèle League
		required: true,
	},
	team1: {
		type: Schema.Types.ObjectId,
		ref: 'Team', // Référence au modèle Team
		required: true,
	},
	team2: {
		type: Schema.Types.ObjectId,
		ref: 'Team', // Référence au modèle Team
		required: true,
	},
})

const Match = mongoose.model('Match', matchSchema)

export default Match
