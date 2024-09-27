import { consumerInstance } from '../utils/classes-instance-dispatcher.js'
import { IS_NUMBER } from '../utils/regex.js'
export class ConsumerController {
  #bddTarget

  constructor () {
    this.#bddTarget = process.env.BDD_TARGET
  }    

  getMatchController= async (req, res) => {
    try {
      const consumer = consumerInstance(this.#bddTarget)
      const allMatches = await consumer.getMatch()

      if (allMatches){
        return res.status(200).json({ data: allMatches })
      }
      else {
        return res.status(404).json({ message: 'Error when retrieving matches' })
      }
      
    } 
    catch (error){
      console.log(error)
      return res.status(500).json({ message: 'Internal error' })
    }
  }

  addLikeBarController = async (req, res) => {
    const barId = req.body.barId
    const consumerId = req.body.consumerId
    const barIdIsInteger = barId && IS_NUMBER.test(barId)
    const consumerIdIsInteger = consumerId && IS_NUMBER.test(consumerId)

    if (!barIdIsInteger || !consumerIdIsInteger){
      return res.status(401).json({ message: 'l\'id consumer ou l\'id du bar n\'est pas un number' })
    }

    const newConsumer = consumerInstance(this.#bddTarget)

    const consumerIdIsValid = await newConsumer.getConsumer(consumerId)
    const barIdIsValid = await newConsumer.getBar(barId)

    if (!consumerIdIsValid || !barIdIsValid){
      return res.status(401).json({ message: 'l\'id consumer ou l\'id du bar est introuvable' })
    }

    const isLikedBar = await newConsumer.addLikeBar(consumerId, barId)

    if (!isLikedBar) {
      
      const isDissLikeBar = await newConsumer.dissLikeBar(consumerId, barId)
      
      if (!isDissLikeBar){
        return res.status(401).json({ message: 'Impossible to dissLike a bar' })
      }
      
      return res.status(200).json({ message: 'Bar is dissliked' })
    }

    return res.status(200).json({ mesaage: 'Bar is liked' })
  }

  // addCommentsController = (req, res) => {}

}