import app from './index.js'


const PORT = process.env.PORT

app.listen(PORT, () => {
	console.log(process.env)
	console.log(`Server is running on port ${PORT}`)
})
