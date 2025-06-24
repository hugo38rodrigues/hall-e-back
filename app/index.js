import bodyParser from 'body-parser'
import cors from 'cors'
import express from 'express'
import barRoutes from './routes/bar.route.js'
import clientRoutes from './routes/client.route.js'
import communRoutes from './routes/commun.route.js'


const app = express()

app.use(express.json())
app.use(cors())
app.disable('x-powered-by')
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.use('/api/v1/client', clientRoutes)
app.use('/api/v1',communRoutes)
app.use('/api/v1/bar',barRoutes)

app.get('/api/v1/test', (req, res) => {
	res.send('Hello World!')
})

export default app
