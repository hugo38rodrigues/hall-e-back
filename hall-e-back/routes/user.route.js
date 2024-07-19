import express from "express";
import { UserController } from '../controllers/user.controller.js';


const router = express.Router()
const user = new UserController()
console.log(user)
router.post('/sign-in', user.createAccount)
router.post('/connexion', user.connexion)


export default router