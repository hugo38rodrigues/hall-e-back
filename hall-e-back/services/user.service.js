import {consumer} from '../models/sql/consumer.model.js'
import {bar} from '../models/sql/bar.model.js'
import {DB} from '../config/db-config.js'

export class User {
  constructor () {
    this.db = new DB()
  }

  findUser = async (params) => {
    if (params.role === 'consumer') {
      return await consumer(this.db.connexion).findAll({
        attributes: ['email', 'lastName', 'firstName', 'favoris_match', 'like_bar', 'role'],
        where: {
          email: params.email,
          password: params.password,
          role: params.role
        }
      })
    }
    else if (params.role === 'bar') {
      return await bar(this.db.connexion).findAll({
        attributes: ['id', 'address', 'name', 'email', 'price', 'description', 'photo', 'password', 'like_consumer', 'role'],
        where: {
          email: params.email,
          password: params.password,
          role: params.role
        }
      })
    }
  }

  findUserById = async (params) => {
    if (params.role === 'consumer') {
     return await consumer(this.db.connexion).findAll({
        attributes: ['id'],
        where: {
          id: params.id
        }
      })
    }
    else if (params.role === 'bar') {
      return await bar(this.db.connexion).findAll({
        attributes: ['id'],
        where: {
          id: params.id
        }
      })
    } else {
      return 0
    }
  }

  createUser = async (params) => {
    if (params.role === 'consumer') {
      try {
        return await consumer(this.db.connexion).create({
          'firstName': params.firstName,
          'lastName': params.lastName,
          'email': params.email,
          'password': params.password
        })
      } catch (error) {
        return error
      }
    }
    else if (params.role === 'bar') {
      try {
        return await bar(this.db.connexion).create({
          'name': params.name,
          'address': params.address,
          'email': params.email,
          'password': params.password,
          'role': params.role
        })
      } catch (error) {
        return error
      }
    }
  }

  deleteUser = async (params) => {
    if (params.role === 'consumer') {
      try {
        await consumer(this.db.connexion).destroy({
          where: {
            'id': params.id
          },
        })
      } catch (error) {
        console.log(error)
      }
    }
    else if (params.role === 'bar') {
      try {
        await bar(this.db.connexion).destroy({
          where: {
            'id': params.id
          },
        })
      } catch (error) {
        console.log(error)
      }
    }
    return 0
  }
}