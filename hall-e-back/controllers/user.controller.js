import { User } from '../services/user.service.js';
export class UserController {

  createAccount = async (req, res) => {
    try {
      if (!req.body) {
        return res.status(500).json({ message: "Missing params" });
      }
      else if (!req.body.email || !req.body.password) {
        return res.status(400).json({ message: "Missing email or password" });
      }
      else if (!req.body.lastName || !req.body.firstName) {
        return res.status(400).json({ message: "Missing first name or last name" });
      }
      else if (!req.body.role) {
        return res.status(400).json({ message: "Missing role" });
      }

      const params = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: req.body.password,
        role: req.body.role
      }

      const user = new User(params)
      const userFound = await user.findUser()

      if (userFound.length !== 0) {
        return res.status(400).json({ message: 'The user already exists' })
      }
      else if (params.role !== 'consumer' && params.role !== 'bar') {
        return res.status(400).json({ message: 'Role is not defined' })
      }
      else {
        await user.createUser()
        return res.status(201).json({ message: 'Sign in success' })
      }
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  updateAccount = async (req, res) => { res.status(200).json({ message: "Update  account" }) }

  connexion = async (req, res) => {
    try {
      if (!req.body) {
        return res.status(500).json({ message: "Missing params" })
      }
      else if (!req.body.email || !req.body.password) {
        return res.status(400).json({ message: "Missing email or password" });
      }
      else if (!req.body.role) {
        return res.status(400).json({ message: "Missing role" });
      }

      const params = {
        email: req.body.email,
        password: req.body.password,
        role: req.body.role
      }

      const user = new User(params)
      const userFound = await user.findUser()

      if (userFound.length === 1) {
        res.status(200).json(userFound[0])
      }
      else {
        res.status(400).json({ message: 'User is not found' })
      }
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  }

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
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

}

