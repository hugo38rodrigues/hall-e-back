import { User } from './user'

export class Consumer extends User {
  constructor () {
    super()
  }

  getMatch = () => { }
  createFavorisMatch = (idMatches) => { }
  likeBar = (idBar) => { }
  addComments = (comments, idBar) => { }
  deleteAccount = async (req, res) => {
    console.log(req.params)
    try {
      if (!req.params) {
        return res.status(500).json({ message: 'Missing params' })
      }

      const user = new User(req.params)
      const userIsPresent = await user.findUserById()
      console.log(userIsPresent)
      // if (userIsPresent.length === 1) {
      //   await user.deleteUser()
      //   return res.status(200).json({ message: 'delete user' })
      // } else {
      //   return res.status(400).json({ message: `error delete user ${userIsPresent}` })
      // }
    } catch (error) {
      console.log(error)
      return res.status(500).json({ message: 'Internal server error' })
    }
  }

  updateAccount = async (req, res) => { res.status(200).json({ message: 'Update  account' }) }

}