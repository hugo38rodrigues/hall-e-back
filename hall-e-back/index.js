import bodyParser from 'body-parser'
import cors from 'cors'
import express from 'express'
import { setupAssociations } from './db/mysql/association.js'
import { db } from './db/mysql/index.js'
import barRoutes from './routes/bar.router.js'
import clientRoutes from './routes/client.route.js'
import communRoutes from './routes/commun.route.js'
import { BDD_TARGET } from './utils/constants.js'


const app = express()

app.use(express.json())
app.use(cors())
app.disable('x-powered-by')
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

switch (BDD_TARGET) {
	case 'mysql': {
		setupAssociations()
		db.sequelize.sync({ force: false })
		break
	}
	default: {
		console.log(`${BDD_TARGET} is not supported`)
	}
}

app.use('/api/v1/client', clientRoutes)
app.use('/api/v1/commun', communRoutes)
app.use('/api/v1/bar', barRoutes)
app.get('/api/v1/test', (req, res) => {
	res.send('Hello World!')
})

export default app
