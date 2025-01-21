import mongoose, { Schema } from 'mongoose'

const barSchema = new mongoose.Schema({
	address: { type: String, required: true },
	name: { type: String, required: true },
	email: { type: String, required: true },
	price: { type: String },
	description: { type: String},
	password: { type: String, required: true },
	comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }],
	likes: [{ type: Schema.Types.ObjectId, ref: 'Like' }],
	pictures: [{ type: Schema.Types.ObjectId, ref: 'Picture' }],
	role: { type: String, default: 'bar' },
})

const Bar = mongoose.model('Bar', barSchema)

export default Bar
