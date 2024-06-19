import { Dispatcher } from './classes/Dispatcher.js'
import {BDD_TARGET, optionCs, optionLol, optionValorant} from "./utils/api.utils.js";
import {createTableSQl} from "./bdd-config/create-tables.js";

const lol = new Dispatcher(optionLol, BDD_TARGET)
const cs = new Dispatcher(optionCs, BDD_TARGET)
const valorant = new Dispatcher(optionValorant, BDD_TARGET)


if (process.env.MODE_DEV) {
  console.log("############ START PROCESS FOR TABLES CREATION ############")
  await createTableSQl()
  console.log("############ END PROCESS FOR TABLES CREATION ############")
}
console.log("############ START GET DATA ############")
await lol.createdMatchesLol()
await cs.createdMatchesCs()
await valorant.createdMatchesValorant()
console.log("############ END GET DATA ############")



