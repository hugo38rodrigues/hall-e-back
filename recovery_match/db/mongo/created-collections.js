import { matchSchema } from './models/match.js'
import { connectDB } from './mongo.js'

export const createdCollections =  async () => {

  console.log(await connectDB())
  await connectDB().model('Matches', matchSchema)
}