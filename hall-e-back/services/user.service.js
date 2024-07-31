import { Consumer } from '../models/sql/consumer.model.js'
import { Bar } from '../models/sql/bar.model.js'
import { DB } from '../config/db-config.js';

export class User {
  constructor (params) {
    this.id = params.id
    this.firstName = params.firstName
    this.lastName = params.lastName
    this.email = params.email
    this.password = params.password
    this.role = params.role
    this.db = new DB()
  }

  findUser = async () => {
    if (this.role === 'consumer') {
      return await Consumer(this.db.connexion).findAll({
        attributes: ['email', 'password', 'role'],
        where: {
          email: this.email,
          password: this.password,
          role: this.role
        }
      })
    }
    else if (this.role === 'bar') {
      return await Bar(this.db.connexion).findAll({
        attributes: ['email', 'lastName', 'firstName', 'role'],
        where: {
          email: this.email,
          password: this.password,
          role: this.role
        }
      })
    } else {
      return null
    }

  }

  findUserById = async () => {
    if (this.role === 'consumer') {
     return await Consumer(this.db.connexion).findAll({
        attributes: ['id', 'email', 'password', 'role'],
        where: {
          id: this.id
        }
      })
    }
    else if (this.role === 'bar') {
      return await Bar(this.db.connexion).findAll({
        attributes: ['id', 'email', 'password', 'role', 'lastName', 'firstName'],
        where: {
          id: this.id
        }
      })
    } else {
      return 0
    }
  }

  createUser = async () => {
    if (this.role === 'consumer') {
      try {
        await Consumer(this.db.connexion).create({
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
        await Bar(this.db.connexion).create({
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
        await Consumer(this.db.connexion).destroy({
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
        await Bar(this.db.connexion).destroy({
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