// models/Game.js
import mongoose, { Schema } from 'mongoose'

const gameSchema = new mongoose.Schema({
	_id: Schema.Types.ObjectId,
	name: {
		type: String,
		required: true,
		unique: true,
	},
})

const Game = mongoose.model('Game', gameSchema)

export default Game
