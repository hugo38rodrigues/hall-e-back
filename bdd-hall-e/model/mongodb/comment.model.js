import mongoose, { Schema } from 'mongoose'

const commentSchema = new mongoose.Schema({
	title: { type: String, required: true },
	text: { type: String, required: true },
	barId: { type: Schema.Types.ObjectId, ref: 'Bar' },
	clientId: { type: Schema.Types.ObjectId, ref: 'Client' },
})

const Comment = mongoose.model('Comment', commentSchema)

export default Comment
