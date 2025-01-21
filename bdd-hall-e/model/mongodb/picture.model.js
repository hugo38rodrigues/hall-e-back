import mongoose, { Schema } from 'mongoose'

const pictureSchema = new mongoose.Schema({
	url: { type: String, required: true },
	name: {type: String, require: true},
	barId: { type: Schema.Types.ObjectId, ref: 'Bar' },
})

const Picture = mongoose.model('Picture', pictureSchema)

export default Picture
