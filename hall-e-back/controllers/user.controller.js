import { User } from '../services/user.service.js'

export class UserController {

  createAccount = async (req, res) => {
    try {
      if (!req.body) {
        res.status(500).json({ message: 'Missing params' })
      } else if (!req.body.email || !req.body.password) {
        res.status(400).json({ message: 'Missing email or password' })
      } else if (!req.body.lastName || !req.body.firstName) {
        res.status(400).json({ message: 'Missing first name or last name' })
      }

      let params

      if (req.body.role === 'consumer') {
        params = {
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          email: req.body.email,
          password: req.body.password,
          role: req.body.role
        }
      } else if (req.body.role === 'bar') {
        params = {
          name: req.body.name,
          address: req.body.adress,
          email: req.body.email,
          password: req.body.password,
          role: req.body.role,
          price: req.body.price,
          description: req.body.description,
          photo: req.body.photo
        }
      } else {
        res.status(400).json({ message: 'Missing role' })
        return
      }

      const user = new User()
      const userFound = await user.findUser(params)

      if (userFound.length !== 0) {
        res.status(400).json({ message: 'The user already exists' })
      } else {
        await user.createUser()
        res.status(201).json({ message: 'Sign in success' })
      }
    }
    catch {
      res.status(500).json({ message: 'Internal server' })
    }
  }

  connexion = async (req, res) => {
    try {
      if (!req.body) {
        res.status(500).json({ message: 'Missing params' })
      } else if (!req.body.email || !req.body.password) {
        res.status(400).json({ message: 'Missing email or password' })
      } else if (!req.body.lastName || !req.body.firstName) {
        res.status(400).json({ message: 'Missing first name or last name' })
      }

      let params

      if (req.body.role === 'consumer') {
        params = {
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          email: req.body.email,
          password: req.body.password,
          role: req.body.role
        }
      } else if (req.body.role === 'bar') {
        params = {
          name: req.body.name,
          address: req.body.adress,
          email: req.body.email,
          password: req.body.password,
          role: req.body.role,
          price: req.body.price,
          description: req.body.description,
          photo: req.body.photo
        }
      } else {
        res.status(400).json({ message: 'Missing role' })
        return
      }

      const user = new User()
      const userFound = await user.findUser(params)

      if (userFound.length === 1) {
        res.status(200).json(userFound[0])
      }
      else {
        res.status(400).json({ message: 'User is not found' })
      }
    } catch  {
      res.status(500).json({ message: 'Internal server error' })
    }
  }

}

