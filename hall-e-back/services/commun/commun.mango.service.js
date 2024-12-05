// import { Bar } from '../../db/mysql/bar.model.js';
// import { Consumer } from '../../db/mysql/client.model.js';
// import { UserService } from "./user.service.js";

// export class UserMangoService extends UserService {
//   constructor() {
//     super();
//   }

//   getUser = async (params) => {
//     if (params.role === 'client') {
//       return await Consumer.findAll({
//         attributes: ['email', 'lastName', 'firstName', 'favoris_match', 'like_bar', 'role'],
//         where: {
//           email: params.email,
//           password: params.password,
//           role: params.role
//         }
//       })
//     }
//     else if (params.role === 'bar') {
//       return await Bar.findAll({
//         attributes: ['id', 'address', 'name', 'email', 'price', 'description', 'photo', 'password', 'like_client', 'role'],
//         where: {
//           email: params.email,
//           password: params.password,
//           role: params.role
//         }
//       })
//     }
//   }

//   getUserById = async (id, role) => {
//     if (role === 'client') {
//      return await Consumer.findAll({
//         attributes: ['id'],
//         where: {
//           id: id
//         }
//       })
//     }
//     else if (role === 'bar') {
//       return await Bar.findAll({
//         attributes: ['id'],
//         where: {
//           id: id
//         }
//       })
//     } else {
//       return 0
//     }
//   }

//   addUser = async (params) => {
//     if (params.role === 'client') {
//       try {
//         return await Consumer.create({
//           'firstName': params.firstName,
//           'lastName': params.lastName,
//           'email': params.email,
//           'password': params.password
//         })
//       } catch (error) {
//         return error
//       }
//     }
//     else if (params.role === 'bar') {
//       try {
//         return await Bar.create({
//           'name': params.name,
//           'address': params.address,
//           'email': params.email,
//           'password': params.password,
//           'role': params.role
//         })
//       } catch (error) {
//         return error
//       }
//     }
//   }
//   updateUser = async (params) => {}
//   deleteUser = async (id, role) => {}

// }
