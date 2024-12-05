import app from './index.js'
import dotenv from 'dotenv'
dotenv.config({ path: './env/dev/.env' })

const PORT = process.env.PORT

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})