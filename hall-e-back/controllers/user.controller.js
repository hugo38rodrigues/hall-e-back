import { userInstance } from '../config/db.config.js'
import {
  IS_EMAIL,
  IS_DESCRIPTION,
  IS_PASSWORD, 
  IS_STRING, 
  IS_NUMBER, 
  IS_ADDRESS,
} from '../utils/regex.js'

export class UserController {
  #bddTarget

  constructor () {
    this.#bddTarget = process.env.BDD_TARGET
  }

  #consumerAccountFormValidation = (body, res) =>{
    const isEMail = IS_EMAIL.test(body.email)
    const isPassword = IS_PASSWORD.test(body.password)
    const isFirstName = IS_STRING.test(body.firstName)
    const isLastName = IS_STRING.test(body.lastName)

    if (!isEMail || !isPassword) {
      res.status(400).json({ message: 'Missing email or password' })
      return null
    }
    
   if (!isLastName || !isFirstName ) {
      res.status(400).json({ message: 'Missing first name' })
      return null
    }    

    return {
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      password: body.password,
      role: body.role
    }
  }

  #barAccountFormValidation = (body, res) => {
    const isEMail = IS_EMAIL.test(body.email)
    const isPassword = IS_PASSWORD.test(body.password)
    const isAddress = IS_STRING.test(body.address)
    const isName = IS_STRING.test(body.name)
    const isDescription = IS_DESCRIPTION.test(body.description)
    

    if (!isEMail || !isPassword) {
      return res.status(400).json({ message: 'Missing email or password' })
    }

    if (!isAddress) {
      return res.status(500).json({ message: 'Address must be in street city postal code ' })
    }

    if (!isDescription) {
      return res.status(500).json({ message: 'Description must be a description of your bar' })
    }

    if (!isName) {
      return res.status(500).json({ message: 'Name must be string' })
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

  #connexionValidationFrom = (body, res) => {
    const isEMail = IS_EMAIL.test(body.email)
    const isPassword = IS_PASSWORD.test(body.password)
    const isRole = IS_STRING.test(body.role)

    if (!isEMail || !isPassword) {
      return res.status(400).json({ message: 'Missing email or password' })
    }

    if (!isRole){
      return res.status(500).json({ message: 'Role must be string' })
    }

    return {
      email: body.email,
      password: body.password,
      role: body.role,
    }
  }

  #updateFormValidation = (body, res) => {
    const isRole = IS_STRING.test(body.role)
    const isEmail = IS_EMAIL.test(body.email)
    const isPassword = IS_EMAIL.test(body.password)

    if (body.role && !isRole) {
      res.status(500).json({ message: 'Role must be string' })
      return null
    }

    if (body.email && !isEmail) {
      res.status(500).json({ message: 'Email must be in xxx@xxx.xxx or xxx.xxx@xxx.xxx' })
      return null
    }

    if (body.password && !isPassword) {
      res.status(500).json({ message: 'Missing password' })
      return null
    }

    if (body.role === 'consumer'){
      const isFirstName = IS_STRING.test(body.firstName)
      const isLastName = IS_STRING.test(body.lastName)

      if (!isFirstName) {
        return res.status(500).json({ message: 'First name must be string' })
      }

      if (!isLastName) {
        return res.status(500).json({ message: 'Last name must be string' })
      }


      return {
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email,
        password: body.password,
        role: body.role
      }
    }

    if (body.role === 'bar') {
      const isName = IS_STRING.test(body.name)
      const isAddress = IS_ADDRESS.test(body.address)
      const isDescription = IS_DESCRIPTION.test(body.description)

      if (body.address && !isAddress) {
        res.status(500).json({ message: 'Address must be in street city postal code ' })
        return null
      }

      if (body.description && !isDescription) {
        res.status(500).json({ message: 'Description must be a description of your bar' })
        return null
      }

      if (body.name && !isName) {
        res.status(500).json({ message: 'Name must be string' })
        return null
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

    res.status(500).json({ message: 'undefinded role' })
    return null
  }


  createAccount = async (req, res) => {
   
    let params
    try {
      if (!req.body) {
        return res.status(500).json({ message: 'Missing params' })
      }

      if (req.body.role === 'consumer'){
        params = this.#consumerAccountFormValidation(req.body, res)
      }

      else if (req.body.role === 'bar'){
        params = this.#barAccountFormValidation(req.body, res)
      }

      else {
        return res.status(500).json({ message: 'Role must be consumer or bar' })
      }
      
      if (!params){
        return
      }

      const user = userInstance(this.#bddTarget)
      const userIsFound = await user.getUser(params)

      if (userIsFound) {
        return res.status(400).json({ message: 'The user already exists' })
      }

      await user.addUser(params)
      return res.status(201).json({ message: 'Sign in success' })
    }
    catch (error) {
      console.log(error)
      return res.status(500).json({ message: 'Internal error' })
    }
      
  }

  connexion = async (req, res) => {
    try {
      if (!req.body) {
        return res.status(500).json({ message: 'Missing params' })
      }

      const params = this.#connexionValidationFrom(req.body, res)

      const user = userInstance(this.#bddTarget)
      const userIsFound = await user.getUser(params)

      if (!userIsFound) {
        return res.status(400).json({ message: 'User is not found' })
      }

      return res.status(200).json(userIsFound)

    } catch (error) {
      console.log(error)
      return res.status(500).json({ message: 'Internal server error' })
    }
  }

  deleteUser = async (req, res) => {
    
    try {
      
      if (!req.body) {
        return res.status(500).json({ message: 'Missing body params' })
      }

      const isRole = IS_STRING.test(req.body.role)
      const isIdUser = IS_NUMBER.test(req.body.id)

      if (!isRole){
        return res.status(500).json({ message: 'Role must be string' })
      }

      if (!isIdUser){
        return res.status(500).json({ message: 'Id must be integer' })
      }

      const user = userInstance(this.#bddTarget)
      const userIsPresent = await user.getUserById(req.body.id, req.body.role)
      
      if (!userIsPresent) {
        return res.status(400).json({ message: `error delete user ${userIsPresent}` })
      }

      await user.deleteUser(req.params.id, req.body.role)
      return res.status(200).json({ message: 'delete user' })

    } catch (error) {
      console.log(error)
      return res.status(500).json({ message: 'Internal server error' })
    }
  }

  updateProfile = async (req, res) => {
    try {
      if (!req.body) {
        return res.status(500).json({ message: 'Missing params' })
      }

      const isId = IS_NUMBER.test(req.body.id)
      
      if (!isId){
        return res.status(500).json({ message: 'Id must be integer' })
      }

      const params = this.#updateFormValidation(req.body, res)
      
      if (!params) {
        return
      }

      const user = userInstance(this.#bddTarget)
      const idUser = await user.updateUser(req.body.id, params)

      if (!idUser){
        res.status(500).json({ message: 'Impossible to update profile' })
      }
      res.status(200).json({ message: 'Update  account' })
    }
    catch (error) {
      console.log(error)
      return res.status(500).json({ message: 'Internal server error' })
    }
  }



}

