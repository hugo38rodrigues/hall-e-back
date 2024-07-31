import cors from 'cors'
import express from 'express'
import { DB } from './config/db-config.js'
import userRoutes from './routes/user.route.js'

// import consumerRoutes from './routes/userRoute.js';
// import barRoutes from './routes/animalRoute.js';
// import adminRoutes from './routes/alertRoute.js';

const app = express()
const port = process.env.PORT

app.use(express.json())
app.use(cors())

if (process.env.MODE_DEV === 'true') {
    switch (process.env.BDD_TARGET) {
        case 'mysql': {
            const db = new DB()
            await db.synchronizationDb()
            break
        }

        case 'dynamoDb':
            console.log('dynamo')
            break

        default:
            console.log('No such database')
            break
    }
}


// app.use('/v1/consumer', consumerRoutes);
app.use('/v1/user', userRoutes)
// app.use('/v1/bar', barRoutes);
// app.use('/v1/admin', adminRoutes);

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})