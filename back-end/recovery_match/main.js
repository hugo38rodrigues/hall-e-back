import { createTablesDynamo } from "./bdd-config/create-tables-dynamodb.js";
import { createTablesSQl } from "./bdd-config/create-tables-sql.js";
import { Dispatcher } from './classes/Dispatcher.js';
import { BDD_TARGET, optionCs, optionLol, optionValorant } from "./utils/api.utils.js";


const lol = new Dispatcher(optionLol, BDD_TARGET)
const cs = new Dispatcher(optionCs, BDD_TARGET)
const valorant = new Dispatcher(optionValorant, BDD_TARGET)

console.log(process.env.MODE_DEV)

if (process.env.MODE_DEV === 'true') {
  if (BDD_TARGET === 'sql') {
    console.log("############ START PROCESS FOR TABLES CREATION ############")
    await createTablesSQl()
    console.log("############ END PROCESS FOR TABLES CREATION ############")
  }

  else if (BDD_TARGET === 'dynamodb') {
    console.log("############ START PROCESS FOR TABLES CREATION ############")
    await createTablesDynamo()
    console.log("############ END PROCESS FOR TABLES CREATION ############")
  }
  else {
    console.log(`############ ${BDD_TARGET} IS NOT FOUND ############`)
    process.exit()
  }
}

console.log("############ START GET DATA ############")
await lol.createdMatchesLol()
await cs.createdMatchesCs()
await valorant.createdMatchesValorant()
console.log("############ END GET DATA ############")



