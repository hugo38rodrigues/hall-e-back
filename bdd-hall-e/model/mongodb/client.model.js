import mongoose, { Schema } from 'mongoose'

const clientSchema = new mongoose.Schema({
	firstName: { type: String, required: true },
	lastName: { type: String, required: true },
	password: {type: String, required: true},
	email: { type: String, required: true, unique: true },
	likedBars: [{ type: Schema.Types.ObjectId, ref: 'Bar' }],
	role: { type: String, default: 'client' },
})

const Client = mongoose.model('Client', clientSchema)

export default Client
