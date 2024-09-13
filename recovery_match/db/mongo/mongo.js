import mongoose  from 'mongoose'
import { DB_HOST } from '../../utils/constants.utils.js'

export const connectDB = async () => {

  try {
    return mongoose.createConnection(DB_HOST)
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`)
    process.exit(1)
  }
}


  
