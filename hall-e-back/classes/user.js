import { Consumer } from '../models/consumer.model.js'

export class User {
  constructor(params) {
    this.firstName = params.firstName
    this.lastName = params.lastName
    this.email = params.email
    this.password = params.password
    this.role = params.role
  }

  userIsCreate = async () => {
    const user = await Consumer.findAll({
      attributes: ['email', 'password'],
      where: {
        email: this.email,
        password: this.password,
        role: this.role
      }
    })
    return user.length !== 0 ?? false
  }
  createUser = async () => {
    if (this.role === 'consumer') {
      try {
        await Consumer.create({
          'firstName': this.firstName,
          'lastName': this.lastName,
          'email': this.email,
          'password': this.password
        })
      } catch (error) {
        console.log(`Error creation consumer ${error}`)
      }
    }
    else if (this.role === 'bar') {
      try {
        await Bar.create({
          'firstName': this.firstName,
          'lastName': this.lastName,
          'email': this.email,
          'password': this.password
        })
      } catch (error) {
        console.log(`Error creation bar ${error}`)
      }
    }
    // else {
    //   return false
    // }

  }

}