import { userInstance } from "../config/db.config.js";

export class UserController {
  #bddTarget

  constructor() {
    this.#bddTarget = process.env.BDD_TARGET;
  }

  #checkUserRequest = (body, res) =>{
    if (!body) {
      return res.status(500).json({ message: 'Missing params' })
    } else if (!body.email || !body.password) {
      res.status(400).json({ message: 'Missing email or password' })
    } else if (!body.lastName || !body.firstName) {
      res.status(400).json({ message: 'Missing first name or last name' })
    }
  }

  #getParamsPerRole = (body) => {
    if (body.role === 'consumer') {
      return{
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email,
        password: body.password,
        role: body.role
      }
    }
      return {
        name: body.name,
        address: body.address,
        email: body.email,
        password: body.password,
        role: body.role,
        price: body.price,
        description: body.description,
        photo: body.photo
      }
  }

  createAccount = async (req, res) => {
    try {
      this.#checkUserRequest(req.body, res)

      const params = this.#getParamsPerRole(req.body)

      if(!params){
        res.status(400).json({ message: 'Missing role' })
      }

      const user = userInstance(this.#bddTarget)
      const userFound = await user.getUser(params)

      if (userFound.length !== 0) {
        res.status(400).json({ message: 'The user already exists' })
      } else {
        await user.addUser()
        res.status(201).json({ message: 'Sign in success' })
      }
    }
    catch {
      res.status(500).json({ message: 'Internal server' })
    }
  }

  connexion = async (req, res) => {
    try {
      this.#checkUserRequest(req.body, res)

      const params = this.#getParamsPerRole(req.body)

      if(!params){
        res.status(400).json({ message: 'Missing role' })
        return
      }

      const user = userInstance(this.#bddTarget)
      const userFound = await user.getUser(params)

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

  deleteUser = async (req, res) => {
    console.log(req.params)
    try {
      if (!req.params) {
        return res.status(500).json({ message: 'Missing params' })
      }

      const user = userInstance(this.#bddTarget)
      const userIsPresent = await user.getUser(req.params.id, req.user.role)
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

  updateProfile = async (req, res) => {
    this.#checkUserRequest(req.body, res)
    const params = this.#getParamsPerRole(req.body)
    res.status(200).json({ message: 'Update  account' })
  }



}

