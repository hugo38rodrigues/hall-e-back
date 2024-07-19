import { User } from '../classes/user.js';
export class UserController {

  createAccount = async (req, res) => {
    console.log(req.body)
    try {
      if (!req.body) {
        return res.status(500).json({ message: "Missing params" });
      }
      else if (!req.body.email || !req.body.password)
        return res.status(400).json({ message: "Missing email or password" });
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

      if (await user.userIsCreate()) {
        return res.status(200).json({ message: 'The user already exists' })
      }
      else if (await user.createUser() === undefined) {
        return res.status(200).json({ message: 'role is not defined' })
      }
      else {
        return res.status(201).json({ message: 'Sign in success' })
      }
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  updateAccount = async (req, res) => { res.status(200).json({ message: "Update  account" }) }

  connexion = (req, res) => {
    const user = {
      password: req.body.password,
      email: req.body.email,

    }

    const isvalided = this.#validationAccount(user)
    res.status(200).json({ message: `Connexion ${isvalided}` })
  }

  deleteAccount = (req, res) => { res.status(200).json({ message: "Delete" }) }

  #validationAccount = ({ password, email }) => {
    return `with ${password}, ${email}, ${role}`
  }

}

