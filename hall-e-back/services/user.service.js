import { Consumer } from '../models/sql/consumer.model.js'
import { Bar } from '../models/sql/bar.model.js'
import { DB } from '../config/db-config.js'

export class User {
  constructor () {
    this.db = new DB()
  }

  findUser = async (params) => {
    if (params.role === 'consumer') {
      const consumer =  await Consumer(this.db.connexion).findAll({
        attributes: ['email', 'lastName', 'firstName', 'favoris_match', 'like_bar', 'role'],
        where: {
          email: params.email,
          password: params.password,
          role: params.role
        }
      })
      console.log(consumer)
    }
    else if (params.role === 'bar') {
      return await Bar(this.db.connexion).findAll({
        attributes: ['id','adress', 'name','email', 'price','description','photo','password', 'like_consumer','role'],
        where: {
          email: params.email,
          password: params.password,
          role: params.role
        }
      })
    } else {
      return null
    }

  }

  findUserById = async (params) => {
    if (params.role === 'consumer') {
     return await Consumer(this.db.connexion).findAll({
        attributes: ['id'],
        where: {
          id: params.id
        }
      })
    }
    else if (params.role === 'bar') {
      return await Bar(this.db.connexion).findAll({
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
        return await Consumer(this.db.connexion).create({
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
        return await Bar(this.db.connexion).create({
          'name': params.name,
          'adress': params.adress,
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
        await Consumer(this.db.connexion).destroy({
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
        await Bar(this.db.connexion).destroy({
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