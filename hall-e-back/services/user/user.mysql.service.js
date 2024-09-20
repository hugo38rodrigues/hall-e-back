import { UserService } from './user.service.js'
import { db } from '../../db/mysql/index.js'

export class UserMysqlService extends UserService{
  
  constructor () {
    super()
    this.db = db
  }

  
  getUser = async (params) => {
    const consumer = await this.db.Consumer.findOne({
      attributes: ['email', 'lastName', 'firstName', 'role'],
      where: {
        email: params.email,
        password: params.password,
      }
    })

    const bar =  this.db.Bar.findOne({
      attributes: ['id', 'address', 'name', 'email', 'price', 'description', 'photo', 'password', 'role'],
      where: {
        email: params.email,
        password: params.password,
      }
    })

    if (consumer) {
      return consumer
    }
    if (bar) {
      return bar
    }
    return null
  }

  getUserById = async (role, id) => {
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
      return false
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

  updateUser = async (id, ressources) => {
    
   if (ressources.role === 'consumer') {
    try {
      // Trouver la ressource par son identifiant
      const resource = await db.Consumer.findByPk(id)
     
      if (!resource) {
        // Mettre à jour les champs de la ressource
        Error('ressource not found')
        return {
          isError: true,
          message: 'ressource not found'
        }
      }

      return await resource.update(ressources)

    } catch (error){
      return error
    }
  }
    

    if (ressources.role === 'bar') {
      try {
        return await db.Bar.update(ressources, {
          where: { id: id },
        })
      } catch (error){
        return error
      }
    }
  }

  deleteUser = async (id, role) => {
    console.log(id)
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