// models/Team.js
import mongoose from 'mongoose'

// Définition du modèle Team
const teamSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
	},
	acronym: {
		type: String,
		required: true,
	},
	logo_url: {
		type: String,
		unique: true,
	},
})

const Team = mongoose.model('Team', teamSchema)

export default Team
