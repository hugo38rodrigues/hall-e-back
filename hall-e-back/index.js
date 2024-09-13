import cors from 'cors'
import express from 'express'
import userRoutes from './routes/user.route.js'
import consumerRoutes from './routes/consumer.route.js'
import { BDD_TARGET, DEV_MODE } from './utils/constants.js'
import { setupAssociations } from './db/mysql/association.js'
import { db } from './db/mysql/index.js'
// import barRoutes from './routes/animalRoute.js';
// import adminRoutes from './routes/alertRoute.js';

const app = express()
const port = process.env.PORT

app.use(express.json())
app.use(cors())
app.disable('x-powered-by')
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

if (DEV_MODE === 'true') {
    db.sequelize.sync()
}

switch (BDD_TARGET){
    case 'mysql':{
        if (DEV_MODE === 'true') {
            db.sequelize.sync()
        }
       setupAssociations()
       break
    }
    default: {
        console.log(`${BDD_TARGET} is not supported`)
    }
}

app.use('/v1/consumer', consumerRoutes )
app.use('/v1/user', userRoutes)
// app.use('/v1/bar', barRoutes);
// app.use('/v1/admin', adminRoutes);


app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})