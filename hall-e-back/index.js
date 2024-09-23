import cors from 'cors'
import express from 'express'
import { setupAssociations } from './db/mysql/association.js'
import { db } from './db/mysql/index.js'
import consumerRoutes from './routes/consumer.route.js'
import communRoutes from './routes/commun.route.js'
import barRoutes from './routes/bar.router.js'
import { BDD_TARGET, DEV_MODE } from './utils/constants.js'



const app = express()
const port = process.env.PORT


app.use(express.json())
app.use(cors())
app.disable('x-powered-by')


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

app.use('/v1/consumer', consumerRoutes)
app.use('/v1/commun', communRoutes)
app.use('/v1/bar', barRoutes)



app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})