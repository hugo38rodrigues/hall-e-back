import dotenv from 'dotenv'
import app from './index.js'

dotenv.config({ path: './env/dev/.env-debugger' })

const PORT = process.env.PORT

app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`)
})
