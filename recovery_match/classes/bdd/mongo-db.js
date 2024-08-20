import { Storage } from '../interface/storage.js'

export class MongoDb extends Storage {
  #connectionBdd

  constructor () {
    super()
    this.#connectionBdd = {}
  }

}