import mongoose, { Schema } from 'mongoose'

const likeSchema = new mongoose.Schema({
	barId: { type: Schema.Types.ObjectId, ref: 'Bar' },
	clientId: { type: Schema.Types.ObjectId, ref: 'Client' },
})

const Like = mongoose.model('Like', likeSchema)

export default Like
