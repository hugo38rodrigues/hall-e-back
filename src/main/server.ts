import { db } from '../infrastructure/persistence/sequelize/database/index.js'
import { buildContainer } from './container.js'
import { createApp } from './app.js'

const controllers = buildContainer(db)   
const app = createApp(controllers)     

app.listen(3000, () => console.info('Server on 3000'))