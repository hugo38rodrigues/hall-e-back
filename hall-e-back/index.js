import cors from 'cors'
import express from 'express'
import userRoutes from './routes/user.route.js'
// import consumerRoutes from './routes/userRoute.js';
// import barRoutes from './routes/animalRoute.js';
// import adminRoutes from './routes/alertRoute.js';

const app = express()
const port = process.env.PORT

app.use(express.json())
app.use(cors())


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