import { Bar } from '../models/sql/bar.model.js'
import { Consumer } from '../models/sql/consumer.model.js'

export class User {
  constructor(params) {
    this.id = params.id
    this.firstName = params.firstName
    this.lastName = params.lastName
    this.email = params.email
    this.password = params.password
    this.role = params.role
  }

  findUser = async () => {
    if (this.role === 'consumer') {
      const user = await Consumer.findAll({
        attributes: ['email', 'password', 'role'],
        where: {
          email: this.email,
          password: this.password,
          role: this.role
        }
      })
      return user
    }
    else if (this.role === 'bar') {
      const bar = await Bar.findAll({
        attributes: ['email', 'lastName', 'firstName', 'role'],
        where: {
          email: this.email,
          password: this.password,
          role: this.role
        }
      })
      return bar
    } else {
      return null
    }

  }

  findUserById = async () => {
    if (this.role === 'consumer') {
      const user = await Consumer.findAll({
        attributes: ['id', 'email', 'password', 'role'],
        where: {
          id: this.id
        }
      })
      return user
    }
    else if (this.role === 'bar') {
      const bar = await Bar.findAll({
        attributes: ['id', 'email', 'password', 'role', 'lastName', 'firstName'],
        where: {
          id: this.id
        }
      })
      return bar
    } else {
      return 0
    }
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
        console.log(error)
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
  }

  deleteUser = async () => {
    if (this.role === 'consumer') {
      try {
        await Consumer.destroy({
          where: {
            'id': this.id
          },
        });
      } catch (error) {
        console.log(error)
      }
    }
    else if (this.role === 'bar') {
      try {
        await Bar.destroy({
          where: {
            'id': this.id
          },
        });
      } catch (error) {
        console.log(error)
      }
    }
    return 0
  }
}