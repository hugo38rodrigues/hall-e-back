import cors from 'cors'
import express from 'express'
import userRoutes from './routes/user.route.js'
import { BDD_TARGET, DEV_MODE } from './utils/constants.js'
import { setupAssociations } from './db/mysql/association.js'
import { db } from './db/mysql/index.js'
import swaggerUi from 'swagger-ui-express'
import {swaggerDocument} from './docs/swagger_output.json' assert { type: 'json' }

// import consumerRoutes from './routes/userRoute.js';
// import barRoutes from './routes/animalRoute.js';
// import adminRoutes from './routes/alertRoute.js';

const app = express()
const port = process.env.PORT

app.use(express.json())
app.use(cors())

if (DEV_MODE === 'true') {
    db.sequelize.sync()
}

switch (BDD_TARGET){
    case 'mysql':{
       setupAssociations()
       break
    }
    default: {
        console.log(`${BDD_TARGET} is not supported`)
    }
}

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

// app.use('/v1/consumer', consumerRoutes);
app.use('/api/v1/user', userRoutes)
// app.use('/v1/bar', barRoutes);
// app.use('/v1/admin', adminRoutes);

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})