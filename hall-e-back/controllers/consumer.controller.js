import { User } from './user'

export class Consumer extends User {
  constructor () {
    super()
  }

  getMatch = () => { }
  createFavorisMatch = (idMatches) => { }
  likeBar = (idBar) => { }
  addComments = (comments, idBar) => { }

}