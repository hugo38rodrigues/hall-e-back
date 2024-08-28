import { UserService } from './user.service.js'
import { db } from '../../db/mysql/index.js'

export class UserMysqlService extends UserService{
  
  constructor () {
    super()
    this.db = db
  }

  
  getUser = async (params) => {
    if (params.role === 'consumer') {
      this.db.Consumer.getFavori
      return await this.db.Consumer.findOne({
        attributes: ['email', 'lastName', 'firstName', 'role'],
        where: {
          email: params.email,
          password: params.password,
          role: params.role
        }
      })
    } else if (params.role === 'bar') {
      return await this.db.Bar.findOne({
        attributes: ['id', 'address', 'name', 'email', 'price', 'description', 'photo', 'password', 'role'],
        where: {
          email: params.email,
          password: params.password,
          role: params.role
        }
      })
    }
  }

  getUserById = async (id, role) => {
    if (role === 'consumer') {
      return await this.db.Consumer.findOne({
        attributes: ['id'],
        where: {
          id: id
        }
      })
    } else if (role === 'bar') {
      return await this.db.Bar.findOne({
        attributes: ['id'],
        where: {
          id: id
        }
      })
    } else {
      return 0
    }
  }

  addUser = async (params) => {
    if (params.role === 'consumer') {
      try {
        return await this.db.Consumer.create(params)
      } catch (error) {
        return error
      }
    } 

    if (params.role === 'bar') {
      try {
        return await this.db.Bar.create(params)
      } catch (error) {
        return error
      }
    }
  }

  updateUser = async (id, params) => {
    if (params.role === 'consumer') {
      try {
        return await db.Consumer.update(params, {
          where: { id: id },
        }
        )
      } catch (error){
        return error
      }
    }

    if (params.role === 'bar') {
      try {
        return await db.Bar.update(params, {
          where: { id: id },
        })
      } catch (error){
        return error
      }
    }
  }

  deleteUser = async (id, role) => {
    if (role === 'consumer'){
      await db.Consumer.destroy({
        where: {
          id: id
        }
      })
    }

    if (role === 'bar'){
      await db.Bar.destroy({
        where: {
          id: id
        }
      })
    }
  }
}